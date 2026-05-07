-- ═══════════════════════════════════════════════════
-- СПРИНТ 3: Шаг 1 + Шаг 2
-- Сортировка товаров + Варианты прибыли
-- Вставь в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

-- Шаг 1: Порядок сортировки товаров
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS sort_order INTEGER NOT NULL DEFAULT 0;

-- Инициализация sort_order для существующих товаров
DO $$
DECLARE
  r RECORD;
  i INTEGER := 0;
BEGIN
  FOR r IN SELECT id FROM products ORDER BY created_at ASC NULLS FIRST, id ASC
  LOOP
    UPDATE products SET sort_order = i WHERE id = r.id;
    i := i + 1;
  END LOOP;
END $$;

-- Шаг 2: Варианты ожидаемой прибыли (JSONB массив)
-- Формат: [{"label": "Стандарт", "amount": 1500}, {"label": "Опт", "amount": 1000}]
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS profit_options JSONB NOT NULL DEFAULT '[]'::jsonb;
