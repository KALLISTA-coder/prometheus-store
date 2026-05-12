const https = require('https');

const SUPABASE_URL = 'lrhdvpjddtaujcoriqgw.supabase.co';
const SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxyaGR2cGpkZHRhdWpjb3JpcWd3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NjI0NDk4MCwiZXhwIjoyMDkxODIwOTgwfQ.iL232SqhiAQknnY4fthotVHfl2TRZzJF7GwDJO3odEY';

const sql = `
ALTER TABLE products ADD COLUMN IF NOT EXISTS video_urls JSONB DEFAULT '[]'::jsonb;
ALTER TABLE products ADD COLUMN IF NOT EXISTS real_photos TEXT[] DEFAULT '{}'::text[];
ALTER TABLE reviews ADD COLUMN IF NOT EXISTS photo_url TEXT DEFAULT NULL;
`;

const body = JSON.stringify({ query: sql });

const req = https.request({
  hostname: SUPABASE_URL,
  path: '/rest/v1/rpc/exec_sql',
  method: 'POST',
  headers: {
    'apikey': SERVICE_KEY,
    'Authorization': 'Bearer ' + SERVICE_KEY,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body),
  }
}, (res) => {
  let data = '';
  res.on('data', c => data += c);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Response:', data);
    if (res.statusCode === 404) {
      console.log('exec_sql RPC not found, trying pg_query...');
      // Try alternative approach via pg meta
      const req2 = https.request({
        hostname: SUPABASE_URL,
        path: '/pg/query',
        method: 'POST',
        headers: {
          'apikey': SERVICE_KEY,
          'Authorization': 'Bearer ' + SERVICE_KEY,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(JSON.stringify({ query: sql })),
        }
      }, (res2) => {
        let d2 = '';
        res2.on('data', c => d2 += c);
        res2.on('end', () => {
          console.log('PG Status:', res2.statusCode);
          console.log('PG Response:', d2);
        });
      });
      req2.write(JSON.stringify({ query: sql }));
      req2.end();
    }
  });
});
req.write(body);
req.end();
