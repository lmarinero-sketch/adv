const { Client } = require('pg');
const client = new Client({ connectionString: 'postgresql://postgres.muhiwkvohidjkbmwbsfu:07052812Mv.@aws-0-sa-east-1.pooler.supabase.com:6543/postgres' });
client.connect().then(() => {
  return client.query("ALTER TABLE ng_whatsapp_messages ADD COLUMN IF NOT EXISTS whatsapp_id text UNIQUE, ADD COLUMN IF NOT EXISTS status text DEFAULT 'sent';");
}).then(res => {
  console.log('Columns added successfully');
  client.end();
}).catch(e => {
  console.error('Error:', e.message);
  client.end();
});
