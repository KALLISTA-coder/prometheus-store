-- ═══════════════════════════════════════════════════
-- PROMETHEUS — Telegram уведомления о новых заказах
-- Вставь этот SQL в Supabase → SQL Editor → Run
-- ═══════════════════════════════════════════════════

-- 1. Включить расширение pg_net (HTTP-запросы из PostgreSQL)
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- 2. Функция отправки уведомления в Telegram
CREATE OR REPLACE FUNCTION notify_telegram_on_new_order()
RETURNS TRIGGER AS $$
DECLARE
  bot_token TEXT := '8676275382:AAF8v7yM2LJ2z4TJqodKsZGoXqxHpySP2Lo';
  chat_id TEXT := '6877337534';
  message TEXT;
  api_url TEXT;
BEGIN
  message := E'🛒 *НОВЫЙ ЗАКАЗ — PROMETHEUS*\n\n'
    || E'📦 Товар: ' || COALESCE(NEW.product_name, '—') || E'\n'
    || E'📱 Тел: `' || COALESCE(NEW.phone, '—') || E'`\n'
    || E'💬 Через: ' || UPPER(COALESCE(NEW.messenger, '—')) || E'\n'
    || E'📅 Дата: ' || COALESCE(NEW.date, '—') || E'\n'
    || E'🆔 ID: `' || NEW.id || E'`';

  api_url := 'https://api.telegram.org/bot' || bot_token || '/sendMessage';

  PERFORM net.http_post(
    url := api_url,
    body := jsonb_build_object(
      'chat_id', chat_id,
      'text', message,
      'parse_mode', 'Markdown'
    )
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Триггер — срабатывает при каждом новом заказе
DROP TRIGGER IF EXISTS trigger_notify_telegram ON orders;
CREATE TRIGGER trigger_notify_telegram
  AFTER INSERT ON orders
  FOR EACH ROW
  EXECUTE FUNCTION notify_telegram_on_new_order();
