import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://lrhdvpjddtaujcoriqgw.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyaGR2cGpkZHRhdWpjb3JpcWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NDk4MCwiZXhwIjoyMDkxODIwOTgwfQ.iL232SqhiAQknnY4fthotVHfl2TRZzJF7GwDJO3odEY';

async function execSQL(sql) {
  const resp = await fetch(`${SUPABASE_URL}/rest/v1/rpc/exec_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'apikey': SERVICE_ROLE_KEY,
      'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });
  
  if (!resp.ok) {
    // Try direct SQL via management API
    const pgResp = await fetch(`${SUPABASE_URL}/pg/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
      },
      body: JSON.stringify({ query: sql }),
    });
    
    if (!pgResp.ok) {
      console.log('Both methods failed. Status:', resp.status, pgResp.status);
      console.log('Response:', await resp.text());
      return false;
    }
    console.log('PG result:', await pgResp.json());
    return true;
  }
  
  console.log('RPC result:', await resp.json());
  return true;
}

async function main() {
  const sqls = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS profit_amount NUMERIC DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS profit_label TEXT NOT NULL DEFAULT ''`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS deal_condition TEXT NOT NULL DEFAULT 'full_payment'`,
  ];
  
  for (const sql of sqls) {
    console.log('Executing:', sql.substring(0, 60) + '...');
    await execSQL(sql);
  }
  
  // Verify
  const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);
  const { data } = await supabase.from('orders').select('*').limit(1);
  const cols = data && data.length > 0 ? Object.keys(data[0]) : [];
  console.log('\nOrder columns after migration:', cols.join(', '));
  console.log('Has profit_amount:', cols.includes('profit_amount'));
  console.log('Has deal_condition:', cols.includes('deal_condition'));
}

main();
