import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://muhiwkvohidjkbmwbsfu.supabase.co', 
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aGl3a3ZvaGlkamtibXdic2Z1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyMzg3NzQsImV4cCI6MjA4MzgxNDc3NH0.D-sMCvgoy2CyGdN8f77RbQ8b-MPr7Lu5YBwkfRZVmmk'
);

async function check() {
  console.log("Checking messages...");
  const { data: msgs, error: msgsErr } = await supabase.from('ng_whatsapp_messages').select('*').limit(5);
  console.log("Messages:", msgsErr || msgs);
  
  console.log("Checking errors...");
  const { data: errs, error: errsErr } = await supabase.from('ng_error_logs').select('*').limit(5);
  console.log("Errors:", errsErr || errs);
}
check();
