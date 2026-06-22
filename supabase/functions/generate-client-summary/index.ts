import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { clientId } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    if (!openAiKey) throw new Error("OPENAI_API_KEY is not set");

    // If clientId is provided, generate for that specific client
    // If not, generate for ALL clients that don't have a summary yet
    let clientIds: string[] = [];

    if (clientId) {
      clientIds = [clientId];
    } else {
      // Get all clients without summary or with stale summary
      const { data: clients } = await supabase
        .from("ng_clients")
        .select("id")
        .or("ai_summary.is.null,ai_summary.eq.")
        .limit(5);
      clientIds = (clients || []).map((c: any) => c.id);
    }

    // Fetch custom prompt if defined
    let systemPromptBase = `Eres un asistente de CRM para "Adventure Pro Eventos", un negocio de eventos y servicios participantemotor en Argentina.
      
Genera un resumen BREVE (máximo 3-4 oraciones) y ACCIONABLE del siguiente cliente. El resumen debe:
1. Indicar qué compró y cuándo fue su última actividad
2. Identificar oportunidades de venta (ej: si compró cubiertas hace meses, puede necesitar alineación)
3. Mencionar el tono de la relación (si hay mensajes, ¿fue amable, tiene reclamos?)
4. Sugerir la próxima acción concreta para el vendedor`;

    try {
      const { data: setting } = await supabase.from("ng_settings").select("value").eq("key", "ai_prompt_resumen").maybeSingle();
      if (setting && setting.value) {
        systemPromptBase = setting.value;
      }
    } catch(e) {}

    const processClient = async (cId: string) => {
      // Get client info
      const { data: client } = await supabase
        .from("ng_clients")
        .select("*")
        .eq("id", cId)
        .single();

      if (!client) return null;

      // Get their invoices
      const { data: invoices } = await supabase
        .from("ng_invoices")
        .select("*")
        .eq("client_id", cId)
        .order("created_at", { ascending: false })
        .limit(10);

      // Get their messages
      const { data: messages } = await supabase
        .from("ng_whatsapp_messages")
        .select("body, direction, created_at")
        .eq("client_phone", client.phone)
        .order("created_at", { ascending: false })
        .limit(20);

      // Get their follow-ups
      const { data: followUps } = await supabase
        .from("ng_follow_ups")
        .select("reason, status, scheduled_date, observations")
        .eq("client_id", cId)
        .order("created_at", { ascending: false })
        .limit(5);

      const invoiceSummary = (invoices || []).map((inv: any) => {
        const items = Array.isArray(inv.items)
          ? inv.items.map((i: any) => typeof i === 'string' ? i : `${i.qty || 1}x ${i.description}`).join(", ")
          : inv.items || "sin productos";
        return `- Factura $${inv.amount || 0} (${inv.purchase_date || "sin fecha"}): ${items}`;
      }).join("\n");

      const msgSummary = (messages || []).slice(0, 10).map((m: any) =>
        `[${m.direction === 'incoming' ? 'CLIENTE' : 'NEGOCIO'}] ${m.body?.substring(0, 100) || 'multimedia'}`
      ).join("\n");

      const fuSummary = (followUps || []).map((f: any) =>
        `- Seguimiento "${f.reason}" (${f.status}) para ${f.scheduled_date}${f.observations ? ` | Obs: ${f.observations}` : ''}`
      ).join("\n");

      const prompt = `${systemPromptBase}
      
DATOS DEL CLIENTE:
Nombre: ${client.name || "Sin nombre"}
Teléfono: ${client.phone}

FACTURAS:
${invoiceSummary || "Sin facturas registradas"}

ÚLTIMOS MENSAJES:
${msgSummary || "Sin mensajes"}

SEGUIMIENTOS:
${fuSummary || "Sin seguimientos"}

Responde SOLO con el resumen en español, sin encabezados ni bullet points. Sé directo y útil.`;

      const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 200,
        }),
      });

      const openAiData = await openAiResponse.json();
      const summary = openAiData.choices?.[0]?.message?.content?.trim() || "Sin resumen disponible";

      // Save summary to client
      await supabase
        .from("ng_clients")
        .update({ ai_summary: summary })
        .eq("id", cId);

      return { clientId: cId, name: client.name, summary };
    };

    const resultsRaw = await Promise.all(clientIds.map(processClient));
    const results = resultsRaw.filter(r => r !== null);

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
