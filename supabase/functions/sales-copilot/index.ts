import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { phone, messages } = await req.json();

    if (!messages || messages.length === 0) {
      throw new Error("No messages provided");
    }

    // Format messages for OpenAI
    const formattedMessages = messages.map((msg: any) => ({
      role: msg.direction === 'incoming' ? 'user' : 'assistant',
      content: msg.body || 'Multimedia/Audio adjunto'
    }));

    // Add system prompt
    formattedMessages.unshift({
      role: 'system',
      content: `Eres un asistente de ventas experto (Copiloto IA) analizando una conversación de WhatsApp de una tienda de eventos (Adventure Pro). 
Tu objetivo es ayudar al vendedor humano a cerrar la venta.
Debes devolver un JSON estrictamente estructurado con los siguientes campos:
- "lead_score": Un número del 1 al 100 indicando la probabilidad de compra (Termómetro de Venta).
- "extracted_data": Un objeto con:
   - "vehicle_model": Modelo del participante del cliente si lo mencionó (o null).
   - "tire_size": Medida del evento si la mencionó (o null).
   - "intent_summary": Resumen muy corto (1 frase) de la intención del cliente.
- "suggested_replies": Array de 3 strings con sugerencias de respuesta cortas, persuasivas y directas para que el vendedor las use haciendo clic.

Reglas:
1. Las respuestas sugeridas deben estar en español (de Argentina, usando "vos", "che", etc si aplica, pero manteniendo profesionalismo).
2. Tienen que estar listas para enviar (ej. "Sí, tenemos stock. ¿Querés que te reserve un turno?").
3. Deben ser cortas.
4. Responde SOLO CON JSON VALIDO, sin markdown de bloques de código.`
    });

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: formattedMessages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('OpenAI Error:', errText);
      throw new Error(`OpenAI error: ${response.status} ${errText}`);
    }

    const data = await response.json();
    const resultContent = data.choices[0].message.content;
    const parsedData = JSON.parse(resultContent);

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
