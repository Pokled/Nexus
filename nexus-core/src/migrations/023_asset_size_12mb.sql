-- Increase asset file size limit from 5MB to 12MB
ALTER TABLE community_assets DROP CONSTRAINT IF EXISTS valid_file_size;
ALTER TABLE community_assets ADD CONSTRAINT valid_file_size CHECK (file_size <= 12582912);
