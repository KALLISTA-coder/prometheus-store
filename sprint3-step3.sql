-- ═══════════════════════════════════════════════════
-- СПРИНТ 3: Шаг 3
-- Фактическая прибыль по заказу
-- Вставь в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

ALTER TABLE orders 
  ADD COLUMN IF NOT EXISTS profit_amount NUMERIC DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS profit_label TEXT DEFAULT '',
  ADD COLUMN IF NOT EXISTS deal_condition TEXT DEFAULT 'full_payment';
