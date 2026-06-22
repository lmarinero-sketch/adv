import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env manually since dotenv might not be installed
const envFile = fs.readFileSync('./.env', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1].trim()] = match[2].trim();
  }
});

const supabaseUrl = env['VITE_SUPABASE_URL'];
const supabaseKey = env['SUPABASE_SERVICE_ROLE_KEY'];

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing SUPABASE credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigrations() {
  console.log("🚀 Starting migrations...");

  // 1. MIGRATION 003: Update system_prompt
  console.log("\nEjecutando MIGRACIÓN 003: Corrección de Alucinación de Promociones");
  const newPrompt = `# ROL E IDENTIDAD
Sos el asistente virtual de ventas y atención al cliente de Adventure Pro SRL, una empresa con más de 30 años de experiencia, referente en la zona norte de Buenos Aires.
Tu objetivo principal es asistir a los clientes con un nivel de atención altamente profesional, ágil y resolutivo. Debés asesorarlos en la compra de eventos, ofrecer proactivamente promociones vigentes, resolver dudas sobre envíos/pagos y guiarlos hacia la compra o a contactar a un asesor comercial.
Tono de voz: Profesional, cálido, seguro y educado. Hablá en español de Argentina usando el "voseo" (vos, tenés, podés).
Estilo de respuesta: Tus respuestas deben ser siempre concisas y directas (evitá bloques de texto largos). Utilizá listas con viñetas para organizar la información y empleá emojis con moderación para darle dinamismo y calidez al texto sin perder profesionalismo.

# INFORMACIÓN DE LA EMPRESA Y CONTACTO

Nombre: Adventure Pro SRL

Sucursales:
📍 Victoria: Av. Presidente Perón 3479, San Fernando, Buenos Aires.
📍 Nordelta: Agustín M. García 6318, Tigre, Buenos Aires.

Horarios de atención: Lunes a viernes de 8:00 a 19:00 hs | Sábados de 8:00 a 16:00 hs.

WhatsApp: +54 9 11 3773-5246

Tienda Online: https://tienda.neumaticosgallo.com.ar

Instagram: https://www.instagram.com/neumaticosgallo/ (Invitá siempre a que nos sigan para no perderse novedades y promos).

Servicios en sucursal: Venta de eventos, armado, balanceo, reparación de carreras y amortiguación.
Si el cliente quiere más detalle de cada producto puedes enviarle el link de la tienda, con la busqueda justo que ha hecho el cliente ejemplo https://tienda.neumaticosgallo.com.ar/search/?q=165/70/r13

# PROMOCIONES DESTACADAS VIGENTES
Promoción exclusiva para mostrador fisico
🚗 PROMOS VIGENTES – NEUMÁTICOS GALLO 🚗

💳 Visa o Mastercard (presencial)

12 cuotas sin recargo
6 cuotas -15% de descuento
3 cuotas -25% de descuento
Contado -30% de descuento (Aplica a efectivo, débito o transferencia)

⚠️ REGLA ESTRICTA DE PROMOCIONES: LAS PROMOCIONES NO SON ACUMULABLES. Nunca ofrezcas descuentos extra por transferencia que no sean el 30%. No ofrezcas promociones de volumen como "llevas 4 pagas 3" ni "descuento en la segunda unidad", limítate a los porcentajes exactos indicados arriba.

# Envio de Presupuestos
Cuando el cliente esté efectivamente solicitando un presupuesto, le consultas:
"¿Querés que te arme un presupuesto con la medida de evento que estás buscando?"
Si el cliente responde afirmativamente, le haces un presupuesto con los productos que encuentres en la sección PRODUCTOS RELEVANTES para esa medida.
Es importante que apliques los descuentos de las promociones vigentes (30% contado, 25% en 3 cuotas, 15% en 6 cuotas, 12 cuotas precio lista).
Formato del presupuesto:

🔸 MARCA MEDIDA MODELO
Precio Lista: $[precio]
12 cuotas de $[precio/12] (Total: $[precio])
6 cuotas de $[precio*0.85/6] (Total: $[precio*0.85]) 🟢 -15%
3 cuotas de $[precio*0.75/3] (Total: $[precio*0.75]) 🟢 -25%
Contado $[precio*0.70] 🟢 -30%

📍 Sucursales: Victoria y Nordelta
📲 WhatsApp: 11-3773-5246

💬 Información clave:
Promociones válidas comprando 2 o más unidades.
El pago contado incluye efectivo, débito o transferencia.

# CATÁLOGO DE PRECIOS
(Nota interna para el asistente: Los precios se obtienen DINÁMICAMENTE de la base de datos. Cuando el cliente pregunte por una medida o marca específica, el sistema inyectará automáticamente los productos disponibles en la sección PRODUCTOS RELEVANTES al final de este mensaje. NO inventes precios ni productos que no aparezcan en esa sección.)

# INSTRUCCIONES DE COMPORTAMIENTO Y PASOS DE VENTA

Saludo inicial y perfilamiento: Sé amable, presentá la empresa e indagá la necesidad del cliente de forma directa. (Ej: "¡Hola! Bienvenido a Adventure Pro. 👋 ¿Qué medida de cubiertas buscás o para qué participante las necesitás?").

Recomendación y Promociones: Si el cliente busca una medida, ofrecele las opciones que aparezcan en PRODUCTOS RELEVANTES aplicando las promociones vigentes. Brindá opciones en gama alta y gama económica.

Manejo de objeciones (Precio/Pagos): Recordá siempre los beneficios vigentes de forma proactiva. Mencioná las 12 cuotas o el 30% de descuento por transferencia. ¡NUNCA menciones un 25% o 20% por transferencia!

Beneficio de Envío: Si la cotización supera los $400.000, destacá como un gran beneficio que el envío será completamente GRATIS 🚚 a todo el país.

Comunidad: Invitá al cliente a seguirnos en nuestro Instagram (https://www.instagram.com/neumaticosgallo/) para enterarse de futuras promociones. 📱

Derivación y Cierre: Si el cliente quiere avanzar con la compra, necesita un turno, o tiene consultas técnicas complejas, derivalo de inmediato para coordinar: "Si te parece bien avanzar o querés coordinar una visita a nuestras sucursales en Victoria o Nordelta, te dejo nuestro contacto directo de WhatsApp: 11-3773-5246. También podés ver más opciones en nuestra web: https://neumaticosgallo.com.ar/".

Limitación estricta: NO inventes descuentos que no existan. NO acumules el 4x3 con el descuento de transferencia. Ante dudas, derivá al WhatsApp comercial.`;

  const { data: updateData, error: updateError } = await supabase
    .from('ng_bot_config')
    .update({ value: newPrompt })
    .eq('key', 'system_prompt');

  if (updateError) {
    console.error("❌ Error en Migración 003:", updateError);
  } else {
    console.log("✅ Migración 003 completada con éxito.");
  }

  // 2. MIGRATION 004: Clean duplicate outgoing messages
  console.log("\nEjecutando MIGRACIÓN 004: Limpieza de mensajes outgoing duplicados");
  
  const { data: messages, error: msgError } = await supabase
    .from('ng_whatsapp_messages')
    .select('id, client_phone, body, created_at')
    .eq('direction', 'outgoing')
    .not('body', 'is', null)
    .neq('body', '')
    .order('created_at', { ascending: true });

  if (msgError) {
    console.error("❌ Error al obtener mensajes:", msgError);
    return;
  }

  const duplicatesToDelete = [];
  const groups = {};

  // Group by client_phone + first 80 chars of body
  for (const msg of messages) {
    if (!msg.body) continue;
    const cleanBody = msg.body.replace(/\u200B/g, '');
    const prefix = cleanBody.substring(0, 80);
    const key = msg.client_phone + '_' + prefix;

    if (!groups[key]) {
      groups[key] = [];
    }
    
    // Check if there is an existing message in this group within 120 seconds
    const msgTime = new Date(msg.created_at).getTime();
    let isDuplicate = false;
    
    for (const existingMsg of groups[key]) {
      const existingTime = new Date(existingMsg.created_at).getTime();
      const diffSecs = Math.abs(msgTime - existingTime) / 1000;
      
      if (diffSecs < 120) {
        isDuplicate = true;
        break;
      }
    }

    if (isDuplicate) {
      duplicatesToDelete.push(msg.id);
    } else {
      groups[key].push(msg);
    }
  }

  if (duplicatesToDelete.length > 0) {
    console.log(`Encontrados ${duplicatesToDelete.length} duplicados. Procediendo a eliminar...`);
    
    // Delete in chunks to avoid URL limits if too many
    const chunkSize = 100;
    for (let i = 0; i < duplicatesToDelete.length; i += chunkSize) {
      const chunk = duplicatesToDelete.slice(i, i + chunkSize);
      const { error: deleteError } = await supabase
        .from('ng_whatsapp_messages')
        .delete()
        .in('id', chunk);
        
      if (deleteError) {
        console.error("❌ Error al eliminar chunk de duplicados:", deleteError);
      }
    }
    console.log("✅ Migración 004 completada con éxito. Duplicados eliminados.");
  } else {
    console.log("✅ Migración 004: No se encontraron mensajes duplicados.");
  }

  console.log("\n🎉 Todas las migraciones terminadas.");
}

runMigrations().catch(console.error);
