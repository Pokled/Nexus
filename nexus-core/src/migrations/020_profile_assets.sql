-- Migration 020: Equipped assets on user profiles
-- Users can equip one banner, one frame, and one badge from community_assets

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS banner_asset_id UUID REFERENCES community_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS frame_asset_id  UUID REFERENCES community_assets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS badge_asset_id  UUID REFERENCES community_assets(id) ON DELETE SET NULL;
