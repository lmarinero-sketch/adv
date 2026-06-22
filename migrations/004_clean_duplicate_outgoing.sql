-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN 004: Limpieza de mensajes outgoing duplicados
-- 
-- Problema: El webhook insertaba mensajes outgoing DOS VECES:
--   1) Cuando el bot de IA/humano enviaba (insert directo en el webhook)
--   2) Cuando BuilderBot disparaba el evento message.outgoing de vuelta
-- 
-- Esta migración elimina los duplicados históricos, manteniendo
-- solo el más antiguo (el original) de cada grupo duplicado.
-- ═══════════════════════════════════════════════════════════════

-- Eliminar mensajes outgoing duplicados:
-- Consideramos duplicado = mismo client_phone + mismo body (primeros 80 chars)
-- + dirección outgoing + diferencia de tiempo < 120 segundos
DELETE FROM ng_whatsapp_messages
WHERE id IN (
  SELECT id FROM (
    SELECT 
      id,
      ROW_NUMBER() OVER (
        PARTITION BY client_phone, LEFT(REPLACE(body, E'\u200B', ''), 80)
        ORDER BY created_at ASC
      ) as rn
    FROM ng_whatsapp_messages
    WHERE direction = 'outgoing'
      AND body IS NOT NULL
      AND body != ''
      -- Solo limpiar duplicados que están a menos de 120s entre sí
      AND EXISTS (
        SELECT 1 FROM ng_whatsapp_messages m2
        WHERE m2.id != ng_whatsapp_messages.id
          AND m2.client_phone = ng_whatsapp_messages.client_phone
          AND m2.direction = 'outgoing'
          AND LEFT(REPLACE(m2.body, E'\u200B', ''), 80) = LEFT(REPLACE(ng_whatsapp_messages.body, E'\u200B', ''), 80)
          AND ABS(EXTRACT(EPOCH FROM (m2.created_at - ng_whatsapp_messages.created_at))) < 120
      )
  ) ranked
  WHERE rn > 1
);
