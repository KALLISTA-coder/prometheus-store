-- ═══════════════════════════════════════════════════
-- Добавить поля "О нас" + контакты в site_settings
-- Вставь в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS about_trust_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_trust_title_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_trust_desc TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_trust_desc_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_delivery_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_delivery_title_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_delivery_desc TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_delivery_desc_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_quality_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_quality_title_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_quality_desc TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_quality_desc_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_support_title TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_support_title_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_support_desc TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS about_support_desc_en TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS telegram_username TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS instagram_url TEXT NOT NULL DEFAULT '',
  ADD COLUMN IF NOT EXISTS phone_number TEXT NOT NULL DEFAULT '';
