-- ═══════════════════════════════════════════════════
-- СПРИНТ 6: Медиа-контент и расширение доверия
-- Вставь в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS real_photos TEXT[] DEFAULT '{}'::text[];

ALTER TABLE reviews
  ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;
