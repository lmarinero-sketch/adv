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
    const { text: invoiceText } = await req.json();
    
    if (!invoiceText) {
      return new Response(JSON.stringify({ error: "No text provided" }), { 
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } 
      });
    }

    const openAiKey = Deno.env.get('OPENAI_API_KEY');
    if (!openAiKey) {
      throw new Error('OPENAI_API_KEY is not set');
    }

    const prompt = `
    Eres un estructurador experto de datos. Analiza el siguiente texto extraído de un PDF de una factura (posiblemente Factura A, B, C de AFIP o remito interno argentino) y extrae la información en un formato JSON estricto con las siguientes claves:
    1. "clientName": El nombre del cliente. Búscalo cerca de "Señores", "Razón Social:", "Señor(es):", "Nombre:", o "Cliente:". No incluyas el CUIT en el nombre.
    2. "phone": El número telefónico. Búscalo cerca de "Tel", "Teléfono", "Celular". Formateado como solo dígitos, sin + ni guiones. Siempre que encuentres un teléfono argentino, normalízalo al formato 549XXXXXXXXXX (sin el 15, sin el 0 inicial del código de área). Si no hay teléfono, devuelve "".
    3. "date": La fecha de facturación (o "Fecha de Emisión"). Conviértela SIEMPRE al formato ISO "YYYY-MM-DD".
    4. "amount": El importe total final a pagar (Importe Total / Total). Entrégalo como un número (ej. 150000.50), no como texto.
    5. "invoiceNumber": El número de factura completo (ej. "0021-00026556"). Búscalo cerca de "Factura N°", "Nº", "Comprobante".
    6. "invoiceType": El tipo de factura ("A", "B", "C" o "X" si no se identifica).
    7. "cuit": El CUIT del cliente si aparece.
    8. "subtotal": El subtotal antes de impuestos si aparece, como número.
    9. "iva": El monto del IVA si aparece, como número.
    10. "discount": El porcentaje de descuento si aparece (solo el número, ej: 23.62).
    11. "discountAmount": El monto del descuento si aparece, como número.
    12. "paymentCondition": La condición de pago (ej: "CONTADO", "30 DÍAS", etc).
    13. "items": Un ARRAY de OBJETOS con los productos/servicios. Cada objeto debe tener:
        - "cod": código del producto (string, "" si no hay)
        - "qty": cantidad (número entero, 1 si no se especifica)
        - "description": nombre/descripción del producto o servicio
        - "unitPrice": precio unitario como número (0 si no se muestra)
        - "total": importe de la línea como número (0 si no se muestra)
    
    IMPORTANTE: No incluyas impuestos (IVA, IIBB) como items. Extrae TODAS las líneas de productos que aparezcan.

    Asegúrate de responder SOLO con un objeto JSON válido, sin delimitadores de código (no markdown).

    Texto extraído del PDF:
    ${invoiceText}
    `;

    const openAiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: "json_object" }
      })
    });

    const openAiData = await openAiResponse.json();
    const parsedData = JSON.parse(openAiData.choices[0].message.content);

    // Normalize phone server-side too: ensure 549XXXXXXXXXX format, no +
    if (parsedData.phone) {
      let p = parsedData.phone.replace(/[^\d]/g, '');
      if (p.startsWith('0')) p = p.substring(1);
      if (p.startsWith('15')) p = p.substring(2);
      if (p.startsWith('54') && !p.startsWith('549')) p = '549' + p.substring(2);
      if (!p.startsWith('549')) p = '549' + p;
      parsedData.phone = p;
    }

    return new Response(JSON.stringify(parsedData), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
