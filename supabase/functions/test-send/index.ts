import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  try {
    const { phone, message } = await req.json();
    
    const bbUrl = Deno.env.get("BUILDERBOT_API_URL") || "";
    const bbKey = Deno.env.get("BUILDERBOT_API_KEY") || "";
    const bbBotId = Deno.env.get("BUILDERBOT_BOT_ID") || "";
    
    if (!bbUrl || !bbKey) {
      return new Response(JSON.stringify({ error: "Missing BuilderBot config in secrets" }), { status: 500 });
    }

    const endpoint = `${bbUrl}/${bbBotId}/messages`;
    console.log("Sending to:", endpoint);

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-builderbot': bbKey },
      body: JSON.stringify({ number: phone, messages: { content: message } })
    });
    
    const text = await res.text();
    return new Response(JSON.stringify({ success: true, status: res.status, response: text }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
