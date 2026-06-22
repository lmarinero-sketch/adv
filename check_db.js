import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function check() {
  const { data: msgs, error: msgsErr } = await supabase.from('ng_whatsapp_messages').select('*').limit(5);
  console.log("Messages:", msgsErr || msgs);
  
  const { data: errs, error: errsErr } = await supabase.from('ng_error_logs').select('*').limit(5);
  console.log("Errors:", errsErr || errs);
}
check();
