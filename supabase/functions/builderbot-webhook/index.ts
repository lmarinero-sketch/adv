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
    console.log("=== INICIO WEBHOOK BUILDERBOT ===");
    const payload = await req.json();
    console.log("Payload recibido:", JSON.stringify(payload, null, 2));

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const eventName = payload.eventName || "unknown";
    const data = payload.data || payload;
    const key = data.key || {};

    const isOutgoing = eventName === "message.outgoing" 
      || eventName.includes("outgoing") 
      || eventName.includes("send")
      || data.fromMe === true
      || key.fromMe === true
      || (typeof key.id === 'string' && key.id.startsWith('true_'))
      || (data.answer && !data.body)
      || ['SERVER_ACK', 'DELIVERY_ACK', 'READ', 'PLAYED'].includes(data.status);
    const computedDirection = isOutgoing ? 'outgoing' : 'incoming';

    const body = isOutgoing
      ? (data.answer || data.body || data.message || "")
      : (data.body || data.message || "");

    let phone = data.from || data.phone || "";

    if (phone.includes("@")) {
      phone = phone.split("@")[0];
    }

    const attachments = data.attachment || data.attachments || [];
    const urlTempFile = payload.urlTempFile || data.urlTempFile 
      || data.url || data.mediaUrl || data.media?.url 
      || data.message?.imageMessage?.url || data.message?.url
      || payload.url || payload.mediaUrl || null;
    let messageType = 'text';
    let attachmentUrls: string[] | null = null;

    if (urlTempFile) {
      messageType = 'media';
      attachmentUrls = [urlTempFile];
    } else if (Array.isArray(attachments) && attachments.length > 0) {
      messageType = 'media';
      attachmentUrls = attachments;
    } else if ((body || '').startsWith('_event_media_')) {
      messageType = 'media';
    }

    if (!phone || (!body && !attachmentUrls)) {
      await supabase.from('ng_error_logs').insert({
        title: 'Webhook Ignored',
        message: JSON.stringify(payload),
        type: 'warning'
      });
      return new Response(JSON.stringify({ status: "ignored - missing fields", payload }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    let bodyText = body;
    let visionImageUrl = null;
    const sysOpenaiKey = Deno.env.get("OPENAI_API_KEY") || "";

    if (!isOutgoing && attachmentUrls && attachmentUrls.length > 0 && sysOpenaiKey) {
      const mediaUrl = attachmentUrls[0];
      try {
        const mediaRes = await fetch(mediaUrl);
        const contentType = mediaRes.headers.get("Content-Type") || "";
        
        if (contentType.includes("audio")) {
          const audioBlob = await mediaRes.blob();
          const formData = new FormData();
          formData.append('file', audioBlob, 'audio.ogg');
          formData.append('model', 'whisper-1');
          formData.append('language', 'es');
          
          const transcribeRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
             method: "POST", 
             headers: { Authorization: `Bearer ${sysOpenaiKey}` }, 
             body: formData
          });
          const transcribeJson = await transcribeRes.json();
          if (transcribeJson.text) {
             bodyText = transcribeJson.text;
          }
        } else if (contentType.includes("image")) {
          visionImageUrl = mediaUrl;
          if (!bodyText) bodyText = "(El cliente envió una imagen)";
        }
      } catch(e) {
        console.error("Error al procesar media entrante:", e);
      }
    }

    if (!isOutgoing && messageType === 'media' && !visionImageUrl && (!attachmentUrls || attachmentUrls.length === 0)) {
      bodyText = "(El cliente envió una imagen o archivo que no pudimos procesar. Pedile que te describa qué necesita por texto.)";
    }

    const pushName = payload.name || data.name || data.pushName || '';
    if (pushName && !isOutgoing) {
      await supabase.from('ng_clients').upsert({
        name: pushName,
        phone: phone
      }, { onConflict: 'phone' }).select();
    }

    if (isOutgoing && body) {
      if (!body.includes('\u200B')) {
        const midnight = new Date();
        midnight.setHours(23, 59, 59, 999);
        await supabase.from('ng_clients').update({ bot_paused_until: midnight.toISOString() }).eq('phone', phone);
      }

      const bodyPrefix = (body || '').replace(/\u200B/g, '').trim().substring(0, 80);
      const { data: recentMsg } = await supabase
        .from('ng_whatsapp_messages')
        .select('id')
        .eq('client_phone', phone)
        .eq('direction', 'outgoing')
        .gte('created_at', new Date(Date.now() - 120000).toISOString())
        .ilike('body', bodyPrefix + '%')
        .limit(1);

      if (recentMsg && recentMsg.length > 0) {
        return new Response(JSON.stringify({ success: true, reason: 'duplicate' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    if (!isOutgoing && body) {
      const { data: recentIncoming } = await supabase
        .from('ng_whatsapp_messages')
        .select('id')
        .eq('client_phone', phone)
        .eq('direction', 'incoming')
        .gte('created_at', new Date(Date.now() - 30000).toISOString())
        .ilike('body', bodyText.substring(0, 50) + '%')
        .limit(1);

      if (recentIncoming && recentIncoming.length > 0) {
        return new Response(JSON.stringify({ success: true, reason: 'duplicate_incoming' }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        });
      }
    }

    const { error } = await supabase
      .from('ng_whatsapp_messages')
      .insert({
        client_phone: phone,
        body: bodyText || 'Multimedia',
        direction: computedDirection,
        message_type: messageType,
        attachment_urls: attachmentUrls
      })
      .select();

    if (error) {
      throw error;
    }

    if (!isOutgoing && body) {
      const { data: dbClient } = await supabase.from('ng_clients').select('bot_paused_until, name').eq('phone', phone).single();
      const userName = dbClient?.name || 'Corredor';
      
      // Fetch global config FIRST
      const { data: configs } = await supabase
        .from('ng_bot_config')
        .select('key, value')
        .in('key', ['bot_enabled', 'bot_trigger', 'system_prompt']);

      const configMap: Record<string, string> = {};
      (configs || []).forEach((c: any) => { configMap[c.key] = c.value; });

      const botEnabled = configMap['bot_enabled'] === 'true';
      const botTriggerConfig = (configMap['bot_trigger'] || '').toLowerCase().trim();
      const dbPrompt = configMap['system_prompt'] || '';

      if (!botEnabled) {
        return new Response(JSON.stringify({ success: true, reason: 'bot_disabled_globally' }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
      }

      
      const triggerWord = "edge";
      const isTriggerWord = bodyText.toLowerCase().includes("edge") || bodyText.toLowerCase().includes("asistente");
      
      let isPaused = false;
      if (dbClient && dbClient.bot_paused_until) {
        const pausedUntil = new Date(dbClient.bot_paused_until).getTime();
        if (pausedUntil > Date.now()) {
          isPaused = true;
        }
      }

      if (isPaused) {
        if (isTriggerWord) {
          await supabase.from('ng_clients').update({ bot_paused_until: null }).eq('phone', phone);
        } else {
          const { data: recentPausedMsg } = await supabase
            .from('ng_whatsapp_messages')
            .select('id')
            .eq('client_phone', phone)
            .eq('direction', 'outgoing')
            .ilike('body', '%asesor%atender%')
            .gte('created_at', new Date(Date.now() - 30 * 60 * 1000).toISOString())
            .limit(1);
          
          if (!recentPausedMsg || recentPausedMsg.length === 0) {
            const pausedMsg = '¡Hola! 👋 Ya estás siendo atendido por uno de nuestros asesores. Te va a responder enseguida.\n\nSi querés volver a consultar con nuestro asistente automático, escribí *' + triggerWord + '*. ¡Gracias por tu paciencia!\u200B';
            const bbUrl = Deno.env.get("BUILDERBOT_API_URL") || "";
            const bbKey = Deno.env.get("BUILDERBOT_API_KEY") || "";
            const bbBotId = Deno.env.get("BUILDERBOT_BOT_ID") || "";
            
            await fetch(`${bbUrl}/${bbBotId}/messages`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', 'x-api-builderbot': bbKey },
              body: JSON.stringify({ number: phone, messages: { content: pausedMsg }, checkIfExists: false })
            });
            await supabase.from('ng_whatsapp_messages').insert({ client_phone: phone, body: pausedMsg, direction: 'outgoing', message_type: 'text' });
          }
          return new Response(JSON.stringify({ success: true, reason: 'bot_paused' }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
        }
      }


      
      const foxyPrompt = `1. ROL Y PERSONALIDAD
Eres Foxy, el asistente oficial de AdventurePro. Tu misión es guiar a corredores y ciclistas sobre los eventos deportivos de la organización.
Debes indicarle que eres un asistente virtual, y no puedes tomar decisiones, siempre deberás derivar la atención a un asesor.

Tono: Energético, directo, motivador y con "buena onda" deportiva.

Estilo: Prioriza siempre las respuestas breves, puedes escribir hasta maximo 10 lineas si necesitas superar ese limite hazlo pero con la premisa de evitar tanto texto, usa emojis divertidos

Formato: Usa negritas para datos clave. Nunca cambies los hipervínculos, muéstralos tal cual.

Personalización: Dirígete al usuario por su nombre: ${userName}.

Entrada de Audio: Si recibes un audio transcrito, interpreta el contenido del audio y responde en texto.

2. REGLAS DE ORO (LÓGICA CRÍTICA)
AISLAMIENTO DE CONTEXTO: La información de una carrera NUNCA debe mezclarse con la de otra. Si el usuario pregunta por "La carrera" o "El kit" sin especificar cuál, NO ADIVINES.
Adventure Pro no administra nada acerca de la carrera "El Cruce" pueden inscribirse en Rustik pero Adventure Pro no tiene nada que ver con la administración de esa carrera, es importante que cuando pregunten sobre estos, le dejes claro al usuario.
-Si el corredor no puede ir a retirar el kit, puede ir un tercero con su documento o una foto de su documento, en caso de que tampoco pueda, un asesor se comunicara con el, pero nunca seas negativo con respecto a esto, debes ser conciliador.

Acción: Pregunta: "¿A qué carrera te refieres? (Night Run, Gran Fondo, Punta Negra, Maratón San Juan o Valle de la Luna)".
Siempre brindale la pagina de la carrera oficial que te esta consultando, si no tienes el link de la carrera no se lo envies y no alucines.

PRECIOS: Nunca des precios numéricos específicos de inscripciones (excepto penalidades o premios en efectivo explícitos en la base de conocimientos).

Acción: Envía al usuario al sitio web oficial de la carrera correspondiente para ver los valores actualizados.

DESCUENTOS: Si piden descuentos, indícales que escriban al correo electrónico de la carrera específica.

COMPRA DE EQUIPAMIENTO: Si preguntan por zapatillas, bicis, suplementos o equipo no relacionado directamente con la inscripción:

Respuesta: "Para equipamiento, visitá Rustik: https://rustikaventura.com.ar/ o escribiles al WhatsApp 2644550203".

FOTOS: Si preguntan por fotos del evento:

Respuesta: "Comunicate con JerPro al +54 9 264 560-9996 o en www.instagram.com/jerpro.ar".

Cuando no tengas la respuesta correcta de lo que pregunta el usuario, no inventes y siempre indica que en un asesor le responderà en breve.

DEVOLUCIONES: Este asistente virtual no tiene permisos para gestionar devoluciones, por lo tanto cuando se trate de algo relacionado a esto, se le debe indicar al usuario que en breve se comunicara un miembro del personal.

MALENTENDIMIENTOS: Es importante consultarle al usuario si estamos respondiendo bien su consulta, o si ha sido insuficiente? Siempre ofrecele que en breve un asesor estará viendo esta consulta y le responderá, siempre dentro de los horarios laborales.

CALL TO ACTION (CTA): Siempre termina con una pregunta específica o instrucción clara (ej: "¿Te paso el link?", "¿Querés ver las distancias?"). Evita preguntas cerradas simples si puedes guiar la conversación.

PAQUETES/PACKS: No vendemos, ni promocionamos ningún paquete relacionado a inscripción más hospedaje y/o viajes.

CERTIFICADOS Y/O APTOS MEDICOS: Siempre que el usuario pregunte sobre esto le debemos indicar que debe llevarlos el dia de la acreditacion.

3. MENÚ PRINCIPAL Y CALENDARIO
Si el usuario saluda o pide ver "Próximas carreras", muestra esto:

🦊 ¡Hola! ${userName} Soy Foxy de AdventurePro. ¿Querés info de una carrera en particular o ver el calendario completo?

Próximas competencias:

Maratón Internacional de San Juan - 26 de Julio 2026

Desafío Valle de la Luna - 24 de Octubre 2026

Escribí el número del evento o tocá su nombre para ver distancias, inscribirte o leer el reglamento.

4. BASE DE CONOCIMIENTO (MÓDULOS DE CARRERAS)


C. DESAFÍO PUNTA NEGRA (Running/Trail)
Fecha: 21 al 24 de Mayo 2026.
Lugar: Camping Cerro Blanco – Zonda, San Juan.
Web: https://desafiopuntanegra.com/web/ | Inscripción: https://esfuerzodeportivo.com/desafiopuntanegra2026
Distancias: 100K, 70K, 42K, 30K, 20K, 12K, 5K.
Horarios de largadas.
Día 1 - Viernes 22
100k: 10:00 pm | Largada: Camping Cerro Blanco

Día 2 - Sábado 23
70k: 3:00 am | Largada: Camping Cerro Blanco
42k: 7:00 am | Largada: Camping Cerro Blanco

Día 3 - Domingo 24
30k: 8:00 am | Largada: Embarcadero Punta Negra 
20k: 8:05 am | Largada: Embarcadero Punta Negra 
12k: 8:20 am | Largada: Embarcadero Punta Negra 
5k: 9:00 am | Largada: Camping Cerro Blanco
Kids: 12:30 pm | Largada: Camping Cerro Blanco

Cronograma (Resumido):
Viernes 22: Largada 100K (22:00hs).
Sábado 23: Largada 70K (03:00hs) y 42K (07:00hs).
Domingo 24: Resto de distancias (mañana).
Requisitos: Apto médico obligatorio.
Contacto: desafiopuntanegra@adventurepro.com.ar
No menciones horarios de corte ni nada, si necesita saber horarios de corte, es decir cuanto tiempo tiene cada categoria para terminar, eso se lo respondera un asesor en breve.
No inventes informacion, busca en este contexto para brindar informacion
Tenemos toda esta informacion aparte acerca de stand, esta informacion la deberas liberar en caso de que alguien te consulte para colocar un stand, o poner su negocio dentro del evento pero si te preguntan por cosas relacionadas a la carrera no le envies el pdf, debes informarle que pronto se comunicará un asesor.
Si el corredor desea transferir la inscripción a otro corredor, o quieren abonar la carrera, deberás indicarle siempre que un asesor lo atenderá en breve.
Base de Conocimientos: Desafío Punta Negra 2026
https://drive.google.com/file/d/1v3RHB1HrarkrKxnnpL_Az3JtboB68w8n/view?usp=sharing  este es el url del documento, si preguntan, se lo envias para que lo descarguen

1. Información General del Evento
Nombre del evento: Desafío Punta Negra (Trail Running Ultramarathon).
Organizador: Adventure Pro.
Fechas de carrera: Viernes 22, Sábado 23 y Domingo 24 de Mayo de 2026.
Ubicación general: Dique Punta Negra, San Juan, Argentina.

2. Detalles de la Expo y Acreditaciones (Para Corredores y Público)
¿Qué es?: Una expo exclusiva para corredores y acompañantes con stands de venta, exhibición de productos, charlas técnicas y presentación de equipos.
Lugar específico de Expo: Camping Cerro Blanco. Se realiza en el mismo predio donde se entregan los kits y acreditaciones.
Fechas de la Expo: Del 22 al 24 de mayo de 2026.
Público asistente estimado: Más de 10.000 visitantes.
Origen de los participantes: De toda Argentina y principalmente de países limítrofes como Uruguay, Chile, Brasil y Paraguay.

3. Información para Expositores y Marcas (muestra esto solo si te pregunta especificamente por un stand)
Servicios incluidos con el stand: * Limpieza general de áreas comunes.
Servicio de Wi-Fi en toda la Expo.
Iluminación general con tendido eléctrico y tableros.
Espacios sanitarios / baños químicos con servicio de limpieza.
Publicidad y promoción en medios de Adventure Pro y en las redes sociales de la competencia (@desafiopuntanegra).
Aclaración sobre electricidad: Solo se autoriza el uso de lámparas de bajo consumo o tubos fluorescentes. La organización no provee las conexiones o alargues para cada stand; el expositor debe llevarlos.
Requisito adicional: Cada expositor debe aportar 10 regalos para la premiación de la carrera.

4. Tarifas de Stands y Medios de Pago
Precios: Stand Medida 3x3 por $400.000 y Stand Medida 3x6 por $600.000.
Condiciones de reserva: Se debe abonar el 100% al momento de contratar el servicio enviando una seña por transferencia a Mercado Pago.
Datos para transferencia: CVU: 0000003100048622049690  | ALIAS: adventurepro.mp.
Instrucciones post-pago: Enviar un correo adjuntando el comprobante de transferencia junto con los datos del expositor (Nombre completo, DNI, Razón Social, CUIT, Provincia, Rubro, Marcas, Teléfono, Mail).

5. Canales de Contacto Oficiales
Correo Electrónico: expo@adventurepro.com.ar.
Teléfono: (264) 564 - 7474.

D. MARATÓN INTERNACIONAL DE SAN JUAN (Running)
Fecha: 26 de Julio 2026.
Distancias: 42K, 21K, 10K, 5K.
Web: https://www.maratondesanjuan.com
Premios: Efectivo para generales de 42K y 21K. Medalla Finisher para todos.
Kits: Retiro día previo. Requisitos: DNI, Certificado (12 meses), Consentimiento, Pago.
Certificado Médico: Link Modelo
Contacto: misj@adventurepro.com.ar | WA: 264 4573797
Traslados: trasladosyalojamiento@adventurepro.com.ar
Tenemos toda esta informacion aparte acerca de stand, esta informacion la deberas liberar en caso de que alguien te consulte para colocar un stand, o poner su negocio dentro del evento.
Base de Conocimientos: Maratón Internacional de San Juan 2026

1. Información General del Evento
Nombre del evento: Maratón Internacional de San Juan.
Organizador: Adventure Pro.
Fechas: 24 y 25 de julio de 2026.
Ubicación principal: San Juan, Argentina. El evento principal y las acreditaciones tendrán lugar en el Centro Cultural Conte Grand (San Luis y Las Heras, Capital).

2. Detalles de la Expo Run y Acreditaciones (Para Corredores y Público)
¿Qué es?: Es un evento diseñado para corredores, acompañantes y el público en general, donde se realiza la entrega de kits y las acreditaciones.
Actividades: Habrá stands de exhibición y venta de productos y servicios relacionados con el mundo del running.
Horarios de la Expo: De 10:00 a 18:00 hs los días viernes 24 y sábado 25 de julio.
Público asistente: El origen de los participantes estimado es de un 27% de residentes locales, 62% de otras provincias y un 11% de extranjeros.

5. Canales de Contacto Oficiales
Correo Electrónico: expo.adventurepro@gmail.com.
Teléfono / WhatsApp: +54 9 2645 64-7474.
Redes Sociales: @maratondesanjuan en Facebook e Instagram.
Sitio Web: www.maratondesanjuan.com.

E. DESAFÍO VALLE DE LA LUNA (Ciclismo Sunset)
Fecha: Sábado 24/10/2026 (Edición Sunset).
Lugar: Parque Provincial Ischigualasto.
Web: desafiovalledelaluna.com.ar
Horarios: 18:00 hs (Competitivos/Gravel/Eléctrica | 18:30 hs (Promocionales).
Acreditación: Viernes 23/10 de 10 a 20 hs en Salón Cultura (San Agustín).
Alojamiento: Villa San Agustín.
Certificado Médico: Link Modelo
Contacto: desafiovalledelaluna@adventurepro.com.ar

F. 10K SAN JUAN BY SAUCONY (Running)
Ha habido una carrera el 10 de mayo tambien de 10k pero no hemos sido nosotros, si detectas que el usuario esta consultando por esa, indicale que no la hemos administrado nosotros a esa.
Fecha: 14 de Junio 2026.
Página Web: https://maratondesanjuan.com/10ksanjuan/
Instagram: https://www.instagram.com/10ksanjuan/
Lugar: Parque de Mayo, San Juan (Largada y Llegada).
Web: esfuerzodeportivo.com/10ksanjuan2026 | Instagram: @10ksanjuan
Distancias: 10K (Competitiva), 5K (Participativa), 2K (Familiar) y Categoría Kids.
Cronograma (Resumido):
Domingo 14: Largada de todas las distancias desde el Parque de Mayo. Recorrido urbano por puntos icónicos como el Centro Cívico, Teatro del Bicentenario y Estadio Aldo Cantoni.
Kits: Incluye remera técnica oficial Saucony, número de corredor y chip de cronometraje para 10K. Medalla Finisher para todos los que completen el recorrido.
Requisitos: Para información sobre tiempos límite y horarios de corte por categoría, un asesor le responderá en breve.
Propósito: Carrera preparatoria oficial para la Maratón Internacional de San Juan y evento central por el aniversario de la Fundación de San Juan.
Contacto: A través de la plataforma de esfuerzodeportivo.com y a este mail 10ksanjuan@adventurepro.com.ar 

5. FLUJO DE RESPUESTA POR DEFECTO
Si el usuario pregunta algo genérico ("¿Qué precio tiene?", "¿Dónde es?", "¿Es obligatorio el certificado?"):
Ante la duda, es importante que lo derives a un asesor y no respondas sobre cosas que no tienes informacion.
Verifica si en los mensajes anteriores inmediatos ya se mencionó una carrera específica.
Si SÍ se mencionó: Responde con los datos de ESA carrera.
Si NO se mencionó:
Respuesta: "🦊 Para darte la info correcta, necesito que me digas: ¿De qué carrera querés saber? (Night Run, Gran Fondo, Punta Negra, Maratón SJ o Valle de la Luna)".

Si el usuario pide Certificado Médico (para cualquier carrera): validez máxima un año
Respuesta: "Es obligatorio presentarlo. Podés descargar el modelo oficial acá: https://drive.google.com/file/d/1RyDE18Fu5j5DJGtUGYhyFJ_evhrn5hPi/view?usp=sharing ¿Necesitás saber algo más sobre la acreditación?"
Para ninguna carrera deben presentar electrocardiograma, solo deben presentar certificado de buena salud.
Cuando el usuario consulte algo acerca de cualquier regla del reglamento, es importante informarle que en breve un asesor se comunicara con el y le brindara el reglamento completo 

[INSTRUCCIONES ADICIONALES DEL ADMINISTRADOR]:
${dbPrompt}
`;

      const systemPrompt = foxyPrompt;

      const messageContainsTrigger = botTriggerConfig 
        ? bodyText.toLowerCase().includes(botTriggerConfig)
        : true;

      if (systemPrompt && messageContainsTrigger) {
        if (botTriggerConfig) {
          bodyText = bodyText.replace(new RegExp(botTriggerConfig, 'gi'), '').trim();
        }
        
        try {
          const { count: recentCount } = await supabase
            .from('ng_whatsapp_messages')
            .select('id', { count: 'exact', head: true })
            .eq('client_phone', phone)
            .eq('direction', 'incoming')
            .gte('created_at', new Date(Date.now() - 60000).toISOString());

          if ((recentCount || 0) > 5) {
            return new Response(JSON.stringify({ success: true, reason: 'rate_limited' }), {
              headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
          }

          const { data: history } = await supabase
            .from('ng_whatsapp_messages')
            .select('body, direction, created_at')
            .eq('client_phone', phone)
            .order('created_at', { ascending: false })
            .limit(20);

          const chatHistory = (history || []).reverse()
            .filter((m: any) => m.direction === 'incoming' || (m.body && m.body.includes('\u200B')))
            .map((m: any) => ({
              role: m.direction === 'incoming' ? 'user' : 'assistant',
              content: (m.body || '').replace('\u200B', '')
            }));

          const openaiKey = Deno.env.get("OPENAI_API_KEY") || "";
          
          if (!openaiKey) {
            throw new Error("Missing OpenAI API Key");
          }

          const openaiMessages = [
            { role: 'system', content: systemPrompt },
            ...chatHistory
          ];

          if (visionImageUrl) {
            const lastMsg = openaiMessages[openaiMessages.length - 1];
            if (lastMsg && lastMsg.role === 'user') {
               lastMsg.content = [
                 { type: "text", text: lastMsg.content === "(El cliente envió una imagen)" ? "Analizá esta imagen en contexto de nuestros eventos deportivos. Si no tiene relación, indicale que solo respondés consultas sobre Adventure Pro." : lastMsg.content },
                 { type: "image_url", image_url: { url: visionImageUrl } }
               ];
            }
          }

          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 25000);

          const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            signal: controller.signal,
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: openaiMessages,
              max_tokens: 2048,
              temperature: 0.7
            })
          });
          clearTimeout(timeoutId);

          if (!openaiRes.ok) {
            throw new Error(`OpenAI API error: ${openaiRes.status}`);
          }

          const openaiData = await openaiRes.json();
          let aiResponse = openaiData.choices?.[0]?.message?.content || '';
          
          aiResponse = aiResponse
            .replace(/#+\s*/g, '')
            .replace(/\*\*(.*?)\*\*/g, '*$1*')
            .replace(/`([^`]+)`/g, '$1')
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
            .replace(/^---+$/gm, '')
            .replace(/^\s*[-]\s/gm, '• ')
            .replace(/\n{3,}/g, '\n\n');
          
          aiResponse += '\u200B';

          if (aiResponse) {
            const handoffTrigger = '__HUMAN_HANDOFF__';
            if (aiResponse.includes(handoffTrigger) || aiResponse.toLowerCase().includes('asesor') || aiResponse.toLowerCase().includes('comunicará')) {
              aiResponse = aiResponse.replace(handoffTrigger, '').trim();
              
              const pauseUntilDate = new Date(Date.now() + 24 * 60 * 60 * 1000);
              await supabase.from('ng_clients').update({ bot_paused_until: pauseUntilDate.toISOString() }).eq('phone', phone);
            }

            const bbUrl = Deno.env.get("BUILDERBOT_API_URL") || "";
            const bbKey = Deno.env.get("BUILDERBOT_API_KEY") || "";
            const bbBotId = Deno.env.get("BUILDERBOT_BOT_ID") || "";

            const sendBBMessage = async (text: string) => {
              return fetch(`${bbUrl}/${bbBotId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'x-api-builderbot': bbKey },
                body: JSON.stringify({ number: phone, messages: { content: text }, checkIfExists: false })
              });
            };

            const MAX_SINGLE_MSG = 1400;
            const messageParts: string[] = [];

            if (aiResponse.length > MAX_SINGLE_MSG) {
              const midPoint = Math.floor(aiResponse.length / 2);
              let splitIdx = aiResponse.lastIndexOf('\n\n', midPoint + 200);
              if (splitIdx < aiResponse.length * 0.3 || splitIdx < 0) {
                splitIdx = aiResponse.lastIndexOf('\n', midPoint + 100);
              }
              if (splitIdx < aiResponse.length * 0.25 || splitIdx < 0) {
                splitIdx = midPoint;
              }
              messageParts.push(aiResponse.substring(0, splitIdx).trim());
              messageParts.push(aiResponse.substring(splitIdx).trim());
            } else {
              messageParts.push(aiResponse);
            }

            for (let i = 0; i < messageParts.length; i++) {
              if (i > 0) {
                await new Promise(resolve => setTimeout(resolve, 1500));
              }
              await sendBBMessage(messageParts[i]);
            }

            await supabase.from('ng_whatsapp_messages').insert({
              client_phone: phone,
              body: aiResponse,
              direction: 'outgoing',
              message_type: 'text'
            });

            try {
              await supabase.from('ng_bot_analytics').insert({
                client_phone: phone,
                query: bodyText.substring(0, 200),
                products_found: 0,
                handoff: aiResponse.includes('asesor') || false,
                response_length: aiResponse.length
              });
            } catch (analyticsErr) {
            }
          }
        } catch (botError: any) {
          console.error("ERROR en procesamiento de bot:", botError);
        }
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    console.error("ERROR GENERAL WEBHOOK:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
