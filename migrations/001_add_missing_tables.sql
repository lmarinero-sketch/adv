-- ═══════════════════════════════════════════════════════════════
-- MIGRACIÓN: Crear tablas faltantes para el panel Bot IA
-- Ejecutar en: Supabase Dashboard → SQL Editor
-- Fecha: 2026-05-11
-- ═══════════════════════════════════════════════════════════════

-- 1. Tabla de Productos (Catálogo de Precios para el Bot IA)
CREATE TABLE IF NOT EXISTS public.ng_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT,
    alt_code TEXT,
    name TEXT NOT NULL,
    brand TEXT,
    measure TEXT,
    price NUMERIC DEFAULT 0,
    stock INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Tabla de Settings General
CREATE TABLE IF NOT EXISTS public.ng_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Tabla de Error Logs
CREATE TABLE IF NOT EXISTS public.ng_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    message TEXT,
    type TEXT DEFAULT 'error',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. RLS Desactivado (panel admin privado)
ALTER TABLE public.ng_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_error_logs DISABLE ROW LEVEL SECURITY;

-- 5. Permisos
GRANT ALL ON public.ng_products TO anon, authenticated, service_role;
GRANT ALL ON public.ng_settings TO anon, authenticated, service_role;
GRANT ALL ON public.ng_error_logs TO anon, authenticated, service_role;

-- 6. Seed Data — Bot IA Config (si no existe)
INSERT INTO public.ng_bot_config (key, value) VALUES
  ('bot_enabled', 'false'),
  ('bot_trigger', ''),
  ('system_prompt', 'Sos el asesor virtual de Adventure Pro...')
ON CONFLICT (key) DO NOTHING;

-- 7. Seed Data — Settings iniciales
INSERT INTO public.ng_settings (key, value) VALUES
  ('empresa_nombre', 'Adventure Pro'),
  ('empresa_sucursal', 'Mendoza Sur'),
  ('seguimiento_dias', '30, 60, 90')
ON CONFLICT (key) DO NOTHING;
