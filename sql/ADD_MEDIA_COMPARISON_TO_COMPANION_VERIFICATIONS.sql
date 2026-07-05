ALTER TABLE companion_verifications
  ADD COLUMN IF NOT EXISTS media_comparison_verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS media_comparison_verified_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS media_comparison_video_url TEXT,
  ADD COLUMN IF NOT EXISTS media_comparison_status TEXT
    CHECK (media_comparison_status IN ('pending', 'approved', 'rejected'));

UPDATE companion_verifications
SET media_comparison_verified = COALESCE(media_comparison_verified, FALSE)
WHERE media_comparison_verified IS NULL;
