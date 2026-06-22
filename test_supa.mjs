import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://muhiwkvohidjkbmwbsfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11aGl3a3ZvaGlkamtibXdic2Z1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODIzODc3NCwiZXhwIjoyMDgzODE0Nzc0fQ.mqjOd8F07ZMhUfdQPHsMuvr1-AsyZWJtWh_ltxdLFrY';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data, error } = await supabase.from('ng_whatsapp_messages').select('*').limit(1);
  if (error) console.error(error);
  else console.log(Object.keys(data[0] || {}));
}
check();
