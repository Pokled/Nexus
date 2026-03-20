-- Migration 055 : Index manquants sur colonnes FK fréquemment requêtées
-- Identifiés lors de l'audit OMNISCIENT du 20 mars 2026

-- Messages chat : jointures channel_id massivement utilisées (socket chat:send, history)
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_id
  ON channel_messages(channel_id);

-- Index composite pour les requêtes paginées (ORDER BY created_at DESC)
CREATE INDEX IF NOT EXISTS idx_channel_messages_channel_created
  ON channel_messages(channel_id, created_at DESC);

-- DMs : conversation_id utilisé sur chaque récupération de messages
CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation_id
  ON dm_messages(conversation_id);

-- Index composite pour la pagination des DMs
CREATE INDEX IF NOT EXISTS idx_dm_messages_conversation_created
  ON dm_messages(conversation_id, created_at DESC);

-- Bans communauté : vérifiés à chaque connexion socket + post
CREATE INDEX IF NOT EXISTS idx_community_bans_user_id
  ON community_bans(user_id);

-- Réactions forum : jointures fréquentes sur post_id
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id
  ON post_reactions(post_id);

-- Notifications : requête unread count appelée très fréquemment
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread
  ON notifications(user_id, is_read) WHERE is_read = false;
