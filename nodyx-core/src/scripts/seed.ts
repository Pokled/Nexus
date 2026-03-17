/**
 * NODYX — Seed script
 * Creates 2 communities, 10 threads, 30 posts with realistic demo data.
 *
 * Usage:
 *   npx tsx src/scripts/seed.ts
 *   npx tsx src/scripts/seed.ts --reset   (wipe all data first)
 */

import * as dotenv from 'dotenv'
dotenv.config()

import { db, redis } from '../config/database'
import bcrypt from 'bcrypt'

const RESET = process.argv.includes('--reset')

// ── Demo data ────────────────────────────────────────────────────────────────

const USERS = [
  { username: 'alice',   email: 'alice@nodyx.demo',   password: 'demo1234', bio: 'Développeuse Linux passionnée. Kernel contributor.', tags: ['linux', 'kernel', 'rust'], github_username: null },
  { username: 'bob',     email: 'bob@nodyx.demo',     password: 'demo1234', bio: 'Photographe amateur et bidouilleur du dimanche.', tags: ['photo', 'linux', 'dev'], github_username: null },
  { username: 'charlie', email: 'charlie@nodyx.demo', password: 'demo1234', bio: 'Gamer et streamer. Fan de jeux indés.', tags: ['gaming', 'indie', 'stream'], github_username: null },
  { username: 'diana',   email: 'diana@nodyx.demo',   password: 'demo1234', bio: 'Administratrice système. 15 ans de Linux.', tags: ['sysadmin', 'debian', 'ansible'], github_username: null },
  { username: 'evan',    email: 'evan@nodyx.demo',     password: 'demo1234', bio: 'Étudiant en info. Apprend Rust et Svelte.', tags: ['svelte', 'rust', 'apprenant'], github_username: null },
]

const COMMUNITIES = [
  {
    name: 'Linux & Open Source',
    slug: 'linux',
    description: 'La communauté francophone du logiciel libre. Entraide, actualités, tutoriels.',
    categories: [
      { name: 'Actualités', description: 'News du monde Linux et open source' },
      { name: 'Entraide',   description: 'Posez vos questions, aidez les autres' },
      { name: 'Projets',    description: 'Partagez vos projets open source' },
    ],
  },
  {
    name: 'Gaming Francophone',
    slug: 'gaming',
    description: 'Discussions, reviews et sessions multijoueur pour les gamers francophones.',
    categories: [
      { name: 'Discussions',   description: 'Parlez de vos jeux du moment' },
      { name: 'Jeux indés',    description: 'Découvertes et pépites indépendantes' },
      { name: 'Recherche équipe', description: 'Trouvez des coéquipiers' },
    ],
  },
]

const THREADS: Record<string, Array<{
  title: string
  author: string
  category: string
  posts: string[]
}>> = {
  linux: [
    {
      title: 'Linux 6.12 est sorti — ce qui change',
      author: 'alice',
      category: 'Actualités',
      posts: [
        'Le kernel 6.12 apporte enfin le support complet de Rust dans le mainline. Énorme pour l\'écosystème.',
        'J\'ai mis à jour mon serveur ce matin. Pas de régression remarquée. Le support de mon GPU AMD s\'est même amélioré.',
        'Est-ce que quelqu\'un a testé les nouvelles optimisations scheduler ? Sur mon workstation c\'est flagrant.',
        'Pour info le guide de migration est sur kernel.org. Rien de cassant si vous restez sur x86_64.',
      ],
    },
    {
      title: 'Debian 13 "Trixie" — date de sortie confirmée',
      author: 'diana',
      category: 'Actualités',
      posts: [
        'La date est fixée. Trixie sortira en juin. La freeze commence dans 3 semaines. Excité pour systemd 256.',
        'J\'utilise déjà testing depuis 6 mois, c\'est très stable. L\'équipe Debian fait du super boulot.',
        'La vraie question c\'est : pipewire en default ? Parce que pulseaudio c\'est fini sur ma machine depuis longtemps.',
      ],
    },
    {
      title: '[Entraide] Mon WiFi ne fonctionne pas sous Ubuntu 24.04',
      author: 'evan',
      category: 'Entraide',
      posts: [
        'Bonjour, j\'ai installé Ubuntu 24.04 et ma carte WiFi Realtek RTL8821CE n\'est pas reconnue. Que faire ?',
        'C\'est un problème classique avec les Realtek. Il faut compiler le driver manuellement depuis GitHub. Je te donne la procédure.',
        'Essaie `sudo apt install dkms linux-headers-$(uname -r)` en premier. Ensuite clone le repo rtl8821ce et fais `sudo dkms install .`',
        'Ça a marché ! Merci beaucoup. Juste un problème de driver out-of-tree. Tout fonctionne maintenant.',
      ],
    },
    {
      title: 'Présentation de mon homelab sous Proxmox + NixOS',
      author: 'diana',
      category: 'Projets',
      posts: [
        'J\'ai reconstruit mon homelab from scratch. Proxmox pour la virtualisation, NixOS pour les VMs, Ansible pour tout automatiser.',
        'NixOS c\'est vraiment une approche différente. La reproductibilité c\'est game changer pour un homelab.',
        'Tu utilises quoi comme stockage ? ZFS ? Ceph ? Je suis en train de planifier le mien.',
        'ZFS avec 4 disques en RAIDZ2. 10TB utilisables, 2 disques de parité. Parfait pour mon usage.',
      ],
    },
    {
      title: 'Rust vs C pour les drivers kernel — débat ouvert',
      author: 'alice',
      category: 'Projets',
      posts: [
        'Linus a mergé les premiers vrais drivers Rust dans le mainline. Le débat est lancé. Vos avis ?',
        'C\'est une évolution naturelle. Rust élimine les bugs de memory safety à la compilation. Les drivers kernel en C sont une source massive de CVEs.',
        'Je suis plus mitigé. L\'ABI de compatibilité entre C et Rust dans le kernel est complexe. Et la courbe d\'apprentissage...',
        'Les deux coexisteront. C pour les drivers legacy, Rust pour les nouveaux. C\'est pragmatique.',
        'En tout cas le driver Nova (GPU Nouveau réécrit en Rust) est impressionnant. Performances comparables.',
      ],
    },
  ],
  gaming: [
    {
      title: 'Balatro — le roguelike de cartes qui rend fou',
      author: 'charlie',
      category: 'Jeux indés',
      posts: [
        'J\'ai perdu 40 heures sur Balatro ce mois-ci. Ce jeu est une drogue. Le concept de poker + roguelike est génial.',
        'Pareil. J\'ai débloqué tous les decks. La courbe de progression est parfaite, jamais frustrant.',
        'Le fait que ce soit un jeu solo indé avec autant de polish... respect total pour le dev.',
        'Mon highscore est 12 ante en Stake rouge avec le deck Plasma. Quelqu\'un fait mieux ?',
      ],
    },
    {
      title: 'Manor Lords — impressions après 20h de jeu',
      author: 'bob',
      category: 'Jeux indés',
      posts: [
        'Le jeu est en early access mais il est déjà très solide. La gestion du village est addictive.',
        'Le système de approvals est trop passif à mon goût. J\'attends des updates sur le mid/late game.',
        'Les graphismes pour un EA sont top. Et un seul dev ! Respect absolu.',
      ],
    },
    {
      title: '[Recherche] Des joueurs pour du Helldivers 2 ?',
      author: 'charlie',
      category: 'Recherche équipe',
      posts: [
        'Je cherche des gens pour jouer en squad sur Helldivers 2. Niveau 50+, diff 7-9. Envoyez un message !',
        'Je suis partant ! Niveau 72, j\'ai débloqué toutes les stratagèmes. Discord ?',
        'Pareil je suis dispo le soir en semaine. On peut se coordonner ici ou Discord selon votre préférence.',
        'Super ! Je crée un serveur Discord ce soir. Je poste le lien ici demain matin.',
      ],
    },
    {
      title: 'Les jeux indés de 2025 — votre top ?',
      author: 'evan',
      category: 'Discussions',
      posts: [
        'On est mi-année, c\'est l\'heure du bilan. Vos coups de cœur indé de 2025 ?',
        'Pour moi : Balatro (même si fin 2024), Caves of Qud 1.0 et Pacific Drive. Trois genres différents, trois chefs d\'oeuvre.',
        'Animal Well m\'a soufflé. La densité de secrets dans un si petit jeu... 80h pour tout trouver et les gens découvrent encore des choses.',
        'Je reviens sur Hollow Knight en attendant Silksong. Ça compte ?',
        'Hades 2 en early access évidemment. Supergiant ne rate jamais.',
      ],
    },
    {
      title: 'Linux Gaming en 2025 — état des lieux',
      author: 'alice',
      category: 'Discussions',
      posts: [
        'Avec Proton 9 et les derniers pilotes AMD/Intel, le Linux gaming est devenu sérieux. Mon expérience après 1 an sans Windows.',
        'Même constat. 95% de ma bibliothèque Steam tourne parfaitement. Les 5% restants c\'est uniquement des anti-cheat.',
        'Le problème anti-cheat (EAC, BattlEye) est en cours de résolution. BattlEye supporte Linux natif depuis 2 ans.',
        'Mon seul regret c\'est Valorant. Vanguard anti-cheat noyau = incompatible Linux pour toujours probablement.',
      ],
    },
  ],
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function log(msg: string) {
  process.stdout.write(`  ${msg}\n`)
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function seed() {
  console.log('\n🌱 Nodyx Seed Script\n')

  if (RESET) {
    console.log('⚠️  --reset: wiping existing data...')
    await db.query(`
      TRUNCATE posts, threads, categories, community_grades, community_members,
               communities, user_profiles, users
      RESTART IDENTITY CASCADE
    `)
    log('Tables truncated.')
  }

  // ── 1. Users ───────────────────────────────────────────────────────────────
  console.log('👤 Creating users...')
  const userMap: Record<string, string> = {} // username → id

  for (const u of USERS) {
    const existing = await db.query(`SELECT id FROM users WHERE email = $1`, [u.email])
    if (existing.rows[0]) {
      userMap[u.username] = existing.rows[0].id
      log(`skip  ${u.username} (already exists)`)
      continue
    }

    const hash = await bcrypt.hash(u.password, 12)
    const { rows } = await db.query(
      `INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id`,
      [u.username, u.email, hash]
    )
    userMap[u.username] = rows[0].id

    // Update profile
    await db.query(
      `UPDATE user_profiles SET bio = $1, tags = $2 WHERE user_id = $3`,
      [u.bio, u.tags, rows[0].id]
    )
    log(`create ${u.username}`)
  }

  // ── 2. Communities + categories ───────────────────────────────────────────
  console.log('\n🏘️  Creating communities...')
  const communityMap: Record<string, string> = {}   // slug → id
  const categoryMap:  Record<string, string> = {}   // "slug:catname" → id
  const ownerMap:     Record<string, string> = { linux: 'alice', gaming: 'charlie' }

  for (const c of COMMUNITIES) {
    const existing = await db.query(`SELECT id FROM communities WHERE slug = $1`, [c.slug])
    let communityId: string

    if (existing.rows[0]) {
      communityId = existing.rows[0].id
      log(`skip  ${c.slug} (already exists)`)
    } else {
      const ownerId = userMap[ownerMap[c.slug]]
      const { rows } = await db.query(
        `INSERT INTO communities (name, slug, description, owner_id, is_public)
         VALUES ($1, $2, $3, $4, true) RETURNING id`,
        [c.name, c.slug, c.description, ownerId]
      )
      communityId = rows[0].id

      // Owner as member
      await db.query(
        `INSERT INTO community_members (community_id, user_id, role)
         VALUES ($1, $2, 'owner') ON CONFLICT DO NOTHING`,
        [communityId, ownerId]
      )
      log(`create ${c.slug}`)
    }

    communityMap[c.slug] = communityId

    // Add all users as members
    for (const username of Object.keys(userMap)) {
      await db.query(
        `INSERT INTO community_members (community_id, user_id, role)
         VALUES ($1, $2, 'member') ON CONFLICT DO NOTHING`,
        [communityId, userMap[username]]
      )
    }

    // Categories
    for (const cat of c.categories) {
      const key = `${c.slug}:${cat.name}`
      const existingCat = await db.query(
        `SELECT id FROM categories WHERE community_id = $1 AND name = $2`,
        [communityId, cat.name]
      )
      if (existingCat.rows[0]) {
        categoryMap[key] = existingCat.rows[0].id
        continue
      }
      const pos = c.categories.indexOf(cat)
      const { rows } = await db.query(
        `INSERT INTO categories (community_id, name, description, position)
         VALUES ($1, $2, $3, $4) RETURNING id`,
        [communityId, cat.name, cat.description, pos]
      )
      categoryMap[key] = rows[0].id
      log(`  cat: ${cat.name}`)
    }
  }

  // ── 3. Threads + posts ────────────────────────────────────────────────────
  console.log('\n💬 Creating threads and posts...')
  let threadCount = 0
  let postCount   = 0

  for (const [communitySlug, threads] of Object.entries(THREADS)) {
    for (const t of threads) {
      const catKey = `${communitySlug}:${t.category}`
      const categoryId = categoryMap[catKey]
      if (!categoryId) {
        log(`WARN: category not found for ${catKey}`)
        continue
      }

      const authorId = userMap[t.author]

      // Check if thread exists (by title + category)
      const existingThread = await db.query(
        `SELECT id FROM threads WHERE category_id = $1 AND title = $2`,
        [categoryId, t.title]
      )
      let threadId: string

      if (existingThread.rows[0]) {
        threadId = existingThread.rows[0].id
        log(`skip  thread: "${t.title.slice(0, 40)}..."`)
        continue
      }

      // Create thread (first post is the OP)
      const { rows: tRows } = await db.query(
        `INSERT INTO threads (category_id, author_id, title)
         VALUES ($1, $2, $3) RETURNING id`,
        [categoryId, authorId, t.title]
      )
      threadId = tRows[0].id
      threadCount++

      // Posts — first from thread author, rest from other users in round-robin
      const respondents = Object.keys(userMap).filter(u => u !== t.author)

      for (let i = 0; i < t.posts.length; i++) {
        const postAuthor = i === 0
          ? t.author
          : respondents[( i - 1) % respondents.length]

        await db.query(
          `INSERT INTO posts (thread_id, author_id, content) VALUES ($1, $2, $3)`,
          [threadId, userMap[postAuthor], t.posts[i]]
        )
        postCount++
      }

      // Seed random view count
      await db.query(
        `UPDATE threads SET views = $1 WHERE id = $2`,
        [Math.floor(Math.random() * 200) + 20, threadId]
      )

      log(`create thread: "${t.title.slice(0, 50)}" (${t.posts.length} posts)`)
    }
  }

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log('\n✅ Seed complete!')
  console.log(`   ${USERS.length} users   |   ${COMMUNITIES.length} communities   |   ${threadCount} threads   |   ${postCount} posts`)
  console.log('\n   Demo credentials (all passwords: demo1234)')
  for (const u of USERS) {
    console.log(`   ${u.username.padEnd(10)} ${u.email}`)
  }
  console.log()

  await db.end()
  await redis.quit()
}

seed().catch(err => {
  console.error('\n❌ Seed failed:', err)
  process.exit(1)
})
