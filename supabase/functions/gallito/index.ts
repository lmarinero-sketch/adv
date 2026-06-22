import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { message, conversationHistory, moduleContext } = await req.json();

    if (!message) {
      throw new Error("No message provided");
    }

    // ── Conectar a Supabase ──
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseKey);

    // ── Obtener contexto dinámico de la BD ──
    const [productsRes, clientsRes, botConfigRes, recentMsgsRes] = await Promise.all([
      supabase.from('ng_products').select('name, brand, measure, price, stock', { count: 'exact', head: false }).gt('stock', 0).limit(20),
      supabase.from('ng_clients').select('name, phone, bot_paused_until', { count: 'exact', head: false }).limit(50),
      supabase.from('ng_bot_config').select('key, value'),
      supabase.from('ng_whatsapp_messages').select('body, direction, client_phone, created_at').order('created_at', { ascending: false }).limit(10),
    ]);

    const productCount = productsRes.count || 0;
    const topProducts = (productsRes.data || []).slice(0, 10).map((p: any) => `${p.brand} ${p.name} - $${p.price} (${p.stock} uds)`).join('\n');
    const clientCount = clientsRes.count || 0;
    const recentClients = (clientsRes.data || []).slice(0, 5).map((c: any) => `${c.name || 'Sin nombre'} (${c.phone})`).join(', ');
    
    const configMap: Record<string, string> = {};
    (botConfigRes.data || []).forEach((c: any) => { configMap[c.key] = c.value; });
    const botEnabled = configMap['bot_enabled'] === 'true';
    const botTrigger = configMap['bot_trigger'] || '(sin trigger)';

    const recentMessages = (recentMsgsRes.data || []).slice(0, 5).map((m: any) => 
      `[${m.direction === 'incoming' ? '←' : '→'}] ${m.client_phone}: ${(m.body || '').substring(0, 80)}`
    ).join('\n');

    // ── System Prompt de Gallito ──
    const systemPrompt = `Eres GALLITO 🐓, el asistente de IA interno del CRM de Adventure Pro. Tu rol es ayudar al equipo de ventas con información del sistema.

## TU PERSONALIDAD
- Sos directo, eficiente y con un toque de humor argentino
- Usás "vos" y "che" naturalmente
- Respondés conciso pero completo

## DATOS DEL SISTEMA EN TIEMPO REAL
- **Catálogo**: ${productCount} productos con stock
- **Clientes**: ${clientCount} clientes registrados
- **Bot IA WhatsApp**: ${botEnabled ? '✅ ACTIVADO' : '❌ APAGADO'} | Trigger: "${botTrigger}"
- **Clientes recientes**: ${recentClients || 'Ninguno registrado'}

### Top Productos con Stock:
${topProducts || 'No hay productos cargados'}

### Últimos mensajes de WhatsApp:
${recentMessages || 'Sin mensajes recientes'}

## MÓDULOS DISPONIBLES (para navegación)
- whatsapp → Bandeja de WhatsApp (chats con clientes)
- configuracion → Configuración del sistema y Bot IA
- facturas → Gestión de facturas
- clientes → Panel de clientes

## CAPACIDADES
1. **Consultar datos**: Productos, precios, stock, clientes, mensajes
2. **Sugerir acciones**: Puedo proponer cambios (NO los ejecuto, los sugiero)
3. **Navegar**: Puedo sugerir ir a un módulo con [ACTION:navigate:modulo]
4. **Alertas**: Informo sobre situaciones que requieren atención

## REGLAS ESTRICTAS
- NUNCA inventes datos que no estén en este contexto
- Si no tenés la info, decí que no la tenés
- Para acciones que modifiquen datos, usá [ACTION:confirm:descripción] para pedir confirmación
- Respondé en español argentino
- Sé conciso: máximo 3-4 párrafos cortos

## FORMATO DE RESPUESTA
Respondé en JSON válido (sin markdown de bloques de código):
{
  "response": "Tu respuesta al usuario",
  "suggestions": ["Sugerencia 1", "Sugerencia 2"] // Opcional, máximo 3
}

Si sugerís una navegación, incluí el tag [ACTION:navigate:modulo] en el response.
Si sugerís una acción que modifica datos, incluí [ACTION:confirm:descripción] en el response.

${moduleContext ? `## CONTEXTO ACTUAL\nEl usuario está en el módulo: ${moduleContext}` : ''}`;

    // ── Armar historial ──
    const chatMessages: any[] = [{ role: 'system', content: systemPrompt }];
    
    if (conversationHistory && Array.isArray(conversationHistory)) {
      conversationHistory.slice(-8).forEach((h: any) => {
        chatMessages.push({ role: h.role, content: h.content });
      });
    }
    
    chatMessages.push({ role: 'user', content: message });

    // ── Llamar a OpenAI ──
    const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
    if (!openaiKey) throw new Error("OPENAI_API_KEY no configurada");

    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openaiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: chatMessages,
        response_format: { type: 'json_object' },
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!openaiRes.ok) {
      const errText = await openaiRes.text();
      throw new Error(`OpenAI error: ${openaiRes.status} ${errText}`);
    }

    const openaiData = await openaiRes.json();
    const resultContent = openaiData.choices?.[0]?.message?.content || '{}';
    
    let parsed;
    try {
      parsed = JSON.parse(resultContent);
    } catch {
      parsed = { response: resultContent, suggestions: [] };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Gallito Error:', error.message);
    return new Response(JSON.stringify({ 
      response: "Perdón, tuve un error procesando tu consulta. Intentá de nuevo.",
      error: error.message 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200, // 200 para que el frontend pueda mostrar el error gracefully
    });
  }
});
