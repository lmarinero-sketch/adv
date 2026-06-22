-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN 005: Fix mensajes outgoing clasificados como incoming
-- 
-- Problema: Cuando un humano responde desde WhatsApp Business directo
-- (no desde el CRM), BuilderBot puede no enviar eventName="message.outgoing",
-- haciendo que el webhook clasifique la respuesta como "incoming".
-- 
-- Heurísticas para detectar outgoing mal clasificados:
-- 1. Contienen marca de agua invisible (Zero-Width Space \u200B) → 100% bot
-- 2. Contienen patrones de presupuesto/venta generados por el bot
-- 3. Contienen patrones de respuesta del asesor ("te paso con", "te separo")
-- ═══════════════════════════════════════════════════════════════

-- FIX 1: Mensajes con marca de agua ZWS (Zero-Width Space) = enviados por el bot IA
-- Estos tienen \u200B al final, insertado intencionalmente por el webhook
UPDATE ng_whatsapp_messages
SET direction = 'outgoing'
WHERE direction = 'incoming'
  AND body LIKE E'%\u200B%';

-- FIX 2: Mensajes con patrones claros de presupuesto del bot
-- El bot siempre formatea con "Precio lista:", "cuotas de $", "Contado $"
UPDATE ng_whatsapp_messages
SET direction = 'outgoing'
WHERE direction = 'incoming'
  AND (
    body LIKE '%Precio lista:%' OR
    body LIKE '%Precio Lista:%' OR
    body LIKE '%cuotas de $%' OR
    body LIKE '%Contado $%' OR
    body LIKE '%Contado:%' OR
    body LIKE '%Te paso presupuesto%' OR
    body LIKE '%te paso presupuesto%'
  )
  -- Seguridad: solo si el body es largo (respuestas del bot son extensas)
  AND LENGTH(body) > 200;

-- FIX 3: Mensajes con patrones de respuesta del vendedor/asesor
-- Respuestas cortas pero claramente outgoing
UPDATE ng_whatsapp_messages
SET direction = 'outgoing'
WHERE direction = 'incoming'
  AND (
    body LIKE '%eventos Runflat precisabas%' OR
    body LIKE '%neumaticos Runflat precisabas%' OR
    body LIKE '%Runflat precisabas%' OR
    body LIKE '%precisabas? O convencionales%'
  );

-- FIX 4: Mensajes que contienen frases típicas del bot/vendedor
UPDATE ng_whatsapp_messages
SET direction = 'outgoing'
WHERE direction = 'incoming'
  AND (
    body LIKE '%asistente automático%' OR
    body LIKE '%asesor%atender%' OR
    body LIKE '%sucursal más cercana%' OR
    body LIKE '%sucursal mas cercana%' OR
    body LIKE '%te las separo%' OR
    body LIKE '%Horarios%Lunes a Viernes%'
  );

-- Verificar resultados
SELECT direction, COUNT(*) as total
FROM ng_whatsapp_messages
GROUP BY direction
ORDER BY direction;
