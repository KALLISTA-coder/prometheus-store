-- ═══════════════════════════════════════════════════
-- Включить Realtime для таблицы orders
-- Вставь в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE orders;
