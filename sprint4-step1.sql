-- ═══════════════════════════════════════════════════
-- СПРИНТ 4: Шаг 1
-- Добавление рыночной цены конкурентов (market_price)
-- Вставь в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS market_price NUMERIC DEFAULT NULL;
