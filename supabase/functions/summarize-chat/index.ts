import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw new Error("No messages provided");
    }

    const openAiKey = Deno.env.get("OPENAI_API_KEY");
    if (!openAiKey) {
      throw new Error("OPENAI API Key is missing");
    }

    const conversationText = messages.map(
      (m: any) => `${m.direction === 'incoming' ? 'Cliente' : 'Agente'}: ${m.body}`
    ).join("\n");

    const prompt = `Analiza los siguientes últimos mensajes enviados entre un agente de ventas de una empresa vendedora de Eventos llamada "Adventure Pro" y un cliente. Haz un breve resumen de 2 o 3 líneas, conciso y útil, resaltando de qué tema estaban hablando, el estado del pedido o consulta y la actitud/intensión principal del cliente.
    
    Mensajes:
    ${conversationText}
    
    Resumen breve e informativo:`;

    const openAiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${openAiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: "Eres un asistente experto en analizar conversaciones de ventas para eventos por WhatsApp." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 150
      }),
    });

    if (!openAiResponse.ok) {
      const errorStr = await openAiResponse.text();
      console.error(errorStr);
      throw new Error("Error from OpenAI API");
    }

    const data = await openAiResponse.json();
    const summary = data.choices[0].message.content.trim();

    return new Response(JSON.stringify({ summary }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
