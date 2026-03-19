/// Communities routes — port of nodyx-core/src/routes/communities.ts
///
/// GET    /api/v1/communities                         — liste publique
/// POST   /api/v1/communities                         — créer (auth)
/// GET    /api/v1/communities/:slug                   — détail
/// POST   /api/v1/communities/:slug/members           — rejoindre
/// DELETE /api/v1/communities/:slug/members           — quitter
/// GET    /api/v1/communities/:slug/members           — liste des membres
/// GET    /api/v1/communities/:slug/grades            — liste des grades
/// POST   /api/v1/communities/:slug/grades            — créer un grade (owner/admin)
/// PATCH  /api/v1/communities/:slug/grades/:id        — modifier un grade (owner/admin)
/// DELETE /api/v1/communities/:slug/grades/:id        — supprimer un grade (owner/admin)
/// PATCH  /api/v1/communities/:slug/members/:uid/grade — assigner un grade (owner/admin)

use axum::{
    extract::{Path, State},
    http::HeaderMap,
    response::IntoResponse,
    routing::{delete, get, patch, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use uuid::Uuid;

use crate::error::ApiError;
use crate::extractors::{optional_auth, AuthUser};
use crate::state::AppState;

// ── Request types ─────────────────────────────────────────────────────────────

#[derive(Deserialize)]
struct CreateCommunityBody {
    name:        String,
    slug:        String,
    description: Option<String>,
    #[serde(default = "default_true")]
    is_public:   bool,
}

fn default_true() -> bool { true }

#[derive(Deserialize)]
struct GradePermissions {
    can_post:            Option<bool>,
    can_create_thread:   Option<bool>,
    can_create_category: Option<bool>,
    can_moderate:        Option<bool>,
    can_manage_members:  Option<bool>,
    can_manage_grades:   Option<bool>,
}

#[derive(Deserialize)]
struct GradeBody {
    name:        String,
    color:       Option<String>,
    position:    Option<i32>,
    permissions: Option<GradePermissions>,
}

#[derive(Deserialize)]
struct PatchGradeBody {
    name:        Option<String>,
    color:       Option<String>,
    position:    Option<i32>,
    permissions: Option<GradePermissions>,
}

#[derive(Deserialize)]
struct AssignGradeBody {
    grade_id: Option<Uuid>,
}

// ── Router ────────────────────────────────────────────────────────────────────

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/communities",                              get(list_handler).post(create_handler))
        .route("/communities/:slug",                        get(detail_handler))
        .route("/communities/:slug/members",                get(members_handler).post(join_handler).delete(leave_handler))
        .route("/communities/:slug/grades",                 get(grades_handler).post(create_grade_handler))
        .route("/communities/:slug/grades/:id",             patch(update_grade_handler).delete(delete_grade_handler))
        .route("/communities/:slug/members/:uid/grade",     patch(assign_grade_handler))
}

// ── GET /api/v1/communities ───────────────────────────────────────────────────

async fn list_handler(
    State(state): State<AppState>,
) -> Result<impl IntoResponse, ApiError> {
    let communities: Vec<Value> = sqlx::query_scalar::<_, Value>(
        "SELECT row_to_json(t) FROM (
           SELECT id, name, slug, description, is_public, created_at,
                  (SELECT COUNT(*)::int FROM community_members WHERE community_id = communities.id) AS member_count
           FROM communities
           WHERE is_public = true
           ORDER BY created_at DESC
         ) t"
    )
    .fetch_all(&state.db)
    .await?
    .into_iter()
    .collect();

    Ok(Json(serde_json::json!({ "communities": communities })))
}

// ── POST /api/v1/communities ──────────────────────────────────────────────────

async fn create_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Json(body): Json<CreateCommunityBody>,
) -> Result<impl IntoResponse, ApiError> {
    let name = body.name.trim().to_string();
    let slug = body.slug.trim().to_lowercase();

    if name.len() < 2 || name.len() > 100 {
        return Err(ApiError::BadRequest("Name must be 2–100 characters".into()));
    }
    if slug.len() < 2 || slug.len() > 100 || !slug.chars().all(|c| c.is_ascii_alphanumeric() || c == '-') {
        return Err(ApiError::BadRequest("Slug must be 2–100 lowercase alphanumeric chars or hyphens".into()));
    }

    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM communities WHERE slug = $1)")
        .bind(&slug)
        .fetch_one(&state.db)
        .await?;

    if exists {
        return Err(ApiError::Conflict("Slug already taken".into()));
    }

    let community: Value = sqlx::query_scalar(
        "INSERT INTO communities (name, slug, description, is_public, owner_id)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING row_to_json(communities.*)"
    )
    .bind(&name)
    .bind(&slug)
    .bind(body.description.as_deref().map(str::trim))
    .bind(body.is_public)
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    let community_id: Uuid = community["id"].as_str()
        .and_then(|s| Uuid::parse_str(s).ok())
        .ok_or_else(|| ApiError::Internal(anyhow::anyhow!("community id")))?;

    sqlx::query(
        "INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'owner')"
    )
    .bind(community_id)
    .bind(auth.user_id)
    .execute(&state.db)
    .await?;

    Ok((
        axum::http::StatusCode::CREATED,
        Json(serde_json::json!({ "community": community })),
    ))
}

// ── GET /api/v1/communities/:slug ─────────────────────────────────────────────

async fn detail_handler(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let community: Option<Value> = sqlx::query_scalar::<_, Value>(
        "SELECT row_to_json(t) FROM (
           SELECT c.*,
                  (SELECT COUNT(*)::int FROM community_members WHERE community_id = c.id) AS member_count
           FROM communities c
           WHERE c.slug = $1
           LIMIT 1
         ) t"
    )
    .bind(&slug)
    .fetch_optional(&state.db)
    .await?;

    match community {
        None => Err(ApiError::NotFound("Community not found".into())),
        Some(v) => Ok(Json(serde_json::json!({ "community": v }))),
    }
}

// ── POST /api/v1/communities/:slug/members — join ─────────────────────────────

async fn join_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let community: Option<(Uuid, bool)> = sqlx::query_as(
        "SELECT id, is_public FROM communities WHERE slug = $1 LIMIT 1"
    )
    .bind(&slug)
    .fetch_optional(&state.db)
    .await?;

    let (community_id, is_public) = community
        .ok_or_else(|| ApiError::NotFound("Community not found".into()))?;

    if !is_public {
        return Err(ApiError::Forbidden);
    }

    let already_member: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM community_members WHERE community_id = $1 AND user_id = $2)"
    )
    .bind(community_id)
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    if already_member {
        return Err(ApiError::Conflict("Already a member".into()));
    }

    let is_banned: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM community_bans WHERE community_id = $1 AND user_id = $2)"
    )
    .bind(community_id)
    .bind(auth.user_id)
    .fetch_one(&state.db)
    .await?;

    if is_banned {
        return Err(ApiError::Forbidden);
    }

    sqlx::query(
        "INSERT INTO community_members (community_id, user_id, role) VALUES ($1, $2, 'member')"
    )
    .bind(community_id)
    .bind(auth.user_id)
    .execute(&state.db)
    .await?;

    Ok((axum::http::StatusCode::CREATED, Json(serde_json::json!({ "ok": true }))))
}

// ── DELETE /api/v1/communities/:slug/members — leave ─────────────────────────

async fn leave_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let community_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM communities WHERE slug = $1 LIMIT 1"
    )
    .bind(&slug)
    .fetch_optional(&state.db)
    .await?;

    let community_id = community_id
        .ok_or_else(|| ApiError::NotFound("Community not found".into()))?;

    let role: Option<String> = sqlx::query_scalar(
        "SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2 LIMIT 1"
    )
    .bind(community_id)
    .bind(auth.user_id)
    .fetch_optional(&state.db)
    .await?;

    match role.as_deref() {
        None => return Err(ApiError::NotFound("Not a member".into())),
        Some("owner") => return Err(ApiError::Forbidden),
        _ => {}
    }

    sqlx::query(
        "DELETE FROM community_members WHERE community_id = $1 AND user_id = $2"
    )
    .bind(community_id)
    .bind(auth.user_id)
    .execute(&state.db)
    .await?;

    Ok(axum::http::StatusCode::NO_CONTENT)
}

// ── GET /api/v1/communities/:slug/members ────────────────────────────────────

async fn members_handler(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let community_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM communities WHERE slug = $1 LIMIT 1"
    )
    .bind(&slug)
    .fetch_optional(&state.db)
    .await?;

    let community_id = community_id
        .ok_or_else(|| ApiError::NotFound("Community not found".into()))?;

    let members: Vec<Value> = sqlx::query_scalar::<_, Value>(
        "SELECT row_to_json(t) FROM (
           SELECT cm.user_id AS id, u.username, u.avatar, cm.role, cm.joined_at,
                  g.name AS grade_name, g.color AS grade_color
           FROM community_members cm
           JOIN users u ON u.id = cm.user_id
           LEFT JOIN community_grades g ON g.id = cm.grade_id
           WHERE cm.community_id = $1
           ORDER BY cm.joined_at ASC
         ) t"
    )
    .bind(community_id)
    .fetch_all(&state.db)
    .await?
    .into_iter()
    .collect();

    Ok(Json(serde_json::json!({ "members": members })))
}

// ── GET /api/v1/communities/:slug/grades ─────────────────────────────────────

async fn grades_handler(
    State(state): State<AppState>,
    Path(slug): Path<String>,
) -> Result<impl IntoResponse, ApiError> {
    let community_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM communities WHERE slug = $1 LIMIT 1"
    )
    .bind(&slug)
    .fetch_optional(&state.db)
    .await?;

    let community_id = community_id
        .ok_or_else(|| ApiError::NotFound("Community not found".into()))?;

    let grades: Vec<Value> = sqlx::query_scalar::<_, Value>(
        "SELECT row_to_json(t) FROM (
           SELECT * FROM community_grades
           WHERE community_id = $1
           ORDER BY position ASC, created_at ASC
         ) t"
    )
    .bind(community_id)
    .fetch_all(&state.db)
    .await?
    .into_iter()
    .collect();

    Ok(Json(serde_json::json!({ "grades": grades })))
}

// ── POST /api/v1/communities/:slug/grades ────────────────────────────────────

async fn create_grade_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Path(slug): Path<String>,
    Json(body): Json<GradeBody>,
) -> Result<impl IntoResponse, ApiError> {
    let name = body.name.trim().to_string();
    if name.is_empty() || name.len() > 100 {
        return Err(ApiError::BadRequest("Grade name must be 1–100 characters".into()));
    }

    let community_id = require_community_admin(&state.db, &slug, auth.user_id).await?;

    let perms = build_permissions(body.permissions.as_ref());

    let grade: Value = sqlx::query_scalar(
        "INSERT INTO community_grades (community_id, name, color, position, permissions)
         VALUES ($1, $2, $3, COALESCE($4, 0), $5)
         RETURNING row_to_json(community_grades.*)"
    )
    .bind(community_id)
    .bind(&name)
    .bind(body.color.as_deref())
    .bind(body.position)
    .bind(&perms)
    .fetch_one(&state.db)
    .await?;

    Ok((
        axum::http::StatusCode::CREATED,
        Json(serde_json::json!({ "grade": grade })),
    ))
}

// ── PATCH /api/v1/communities/:slug/grades/:id ───────────────────────────────

async fn update_grade_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Path((slug, id)): Path<(String, Uuid)>,
    Json(body): Json<PatchGradeBody>,
) -> Result<impl IntoResponse, ApiError> {
    let community_id = require_community_admin(&state.db, &slug, auth.user_id).await?;

    let mut qb = sqlx::QueryBuilder::<sqlx::Postgres>::new("UPDATE community_grades SET updated_at = NOW()");

    if let Some(ref name) = body.name {
        let n = name.trim().to_string();
        if !n.is_empty() { qb.push(", name = ").push_bind(n); }
    }
    if let Some(ref color) = body.color {
        qb.push(", color = ").push_bind(color.clone());
    }
    if let Some(pos) = body.position {
        qb.push(", position = ").push_bind(pos);
    }
    if let Some(ref perms) = body.permissions {
        qb.push(", permissions = ").push_bind(build_permissions(Some(perms)));
    }
    qb.push(" WHERE id = ").push_bind(id)
      .push(" AND community_id = ").push_bind(community_id)
      .push(" RETURNING row_to_json(community_grades.*)");

    let grade: Option<Value> = qb
        .build_query_scalar()
        .fetch_optional(&state.db)
        .await?;

    match grade {
        None => Err(ApiError::NotFound("Grade not found".into())),
        Some(v) => Ok(Json(serde_json::json!({ "grade": v }))),
    }
}

// ── DELETE /api/v1/communities/:slug/grades/:id ───────────────────────────────

async fn delete_grade_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Path((slug, id)): Path<(String, Uuid)>,
) -> Result<impl IntoResponse, ApiError> {
    let community_id = require_community_admin(&state.db, &slug, auth.user_id).await?;

    let deleted = sqlx::query(
        "DELETE FROM community_grades WHERE id = $1 AND community_id = $2"
    )
    .bind(id)
    .bind(community_id)
    .execute(&state.db)
    .await?
    .rows_affected();

    if deleted == 0 {
        return Err(ApiError::NotFound("Grade not found".into()));
    }

    Ok(axum::http::StatusCode::NO_CONTENT)
}

// ── PATCH /api/v1/communities/:slug/members/:uid/grade ────────────────────────

async fn assign_grade_handler(
    auth: AuthUser,
    State(state): State<AppState>,
    Path((slug, target_uid)): Path<(String, Uuid)>,
    Json(body): Json<AssignGradeBody>,
) -> Result<impl IntoResponse, ApiError> {
    let community_id = require_community_admin(&state.db, &slug, auth.user_id).await?;

    // Vérifie que le membre cible existe
    let member_exists: bool = sqlx::query_scalar(
        "SELECT EXISTS(SELECT 1 FROM community_members WHERE community_id = $1 AND user_id = $2)"
    )
    .bind(community_id)
    .bind(target_uid)
    .fetch_one(&state.db)
    .await?;

    if !member_exists {
        return Err(ApiError::NotFound("Member not found".into()));
    }

    // Si grade_id fourni, vérifier qu'il appartient à cette communauté
    if let Some(grade_id) = body.grade_id {
        let grade_valid: bool = sqlx::query_scalar(
            "SELECT EXISTS(SELECT 1 FROM community_grades WHERE id = $1 AND community_id = $2)"
        )
        .bind(grade_id)
        .bind(community_id)
        .fetch_one(&state.db)
        .await?;

        if !grade_valid {
            return Err(ApiError::NotFound("Grade not found".into()));
        }
    }

    sqlx::query(
        "UPDATE community_members SET grade_id = $1 WHERE community_id = $2 AND user_id = $3"
    )
    .bind(body.grade_id)
    .bind(community_id)
    .bind(target_uid)
    .execute(&state.db)
    .await?;

    Ok(Json(serde_json::json!({ "ok": true })))
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/// Résout le slug en community_id et vérifie que l'user est owner/admin.
async fn require_community_admin(
    db: &sqlx::PgPool,
    slug: &str,
    user_id: Uuid,
) -> Result<Uuid, ApiError> {
    let community_id: Option<Uuid> = sqlx::query_scalar(
        "SELECT id FROM communities WHERE slug = $1 LIMIT 1"
    )
    .bind(slug)
    .fetch_optional(db)
    .await?;

    let community_id = community_id
        .ok_or_else(|| ApiError::NotFound("Community not found".into()))?;

    let role: Option<String> = sqlx::query_scalar(
        "SELECT role FROM community_members WHERE community_id = $1 AND user_id = $2 LIMIT 1"
    )
    .bind(community_id)
    .bind(user_id)
    .fetch_optional(db)
    .await?;

    match role.as_deref() {
        Some("owner") | Some("admin") => Ok(community_id),
        _ => Err(ApiError::Forbidden),
    }
}

/// Construit le JSON des permissions pour community_grades.
fn build_permissions(perms: Option<&GradePermissions>) -> serde_json::Value {
    match perms {
        None => serde_json::json!({}),
        Some(p) => {
            let mut obj = serde_json::Map::new();
            if let Some(v) = p.can_post            { obj.insert("can_post".into(),            v.into()); }
            if let Some(v) = p.can_create_thread   { obj.insert("can_create_thread".into(),   v.into()); }
            if let Some(v) = p.can_create_category { obj.insert("can_create_category".into(), v.into()); }
            if let Some(v) = p.can_moderate        { obj.insert("can_moderate".into(),        v.into()); }
            if let Some(v) = p.can_manage_members  { obj.insert("can_manage_members".into(),  v.into()); }
            if let Some(v) = p.can_manage_grades   { obj.insert("can_manage_grades".into(),   v.into()); }
            serde_json::Value::Object(obj)
        }
    }
}
