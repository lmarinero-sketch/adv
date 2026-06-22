-- schema.sql
-- Habilitar extensión para UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tabla de Clientes
CREATE TABLE IF NOT EXISTS public.ng_clients (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    phone TEXT NOT NULL UNIQUE,
    email TEXT,
    branch TEXT,
    ai_summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Facturas
CREATE TABLE IF NOT EXISTS public.ng_invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_id UUID REFERENCES public.ng_clients(id) ON DELETE CASCADE,
    invoice_number TEXT,
    amount NUMERIC,
    purchase_date DATE,
    items JSONB,
    seller_id UUID REFERENCES auth.users(id),
    file_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Seguimientos (Follow ups)
CREATE TABLE IF NOT EXISTS public.ng_follow_ups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID REFERENCES public.ng_invoices(id) ON DELETE CASCADE,
    client_id UUID REFERENCES public.ng_clients(id) ON DELETE CASCADE,
    seller_id UUID REFERENCES auth.users(id),
    reason TEXT NOT NULL,
    scheduled_date DATE NOT NULL,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Tabla de mensajes de WhatsApp
CREATE TABLE IF NOT EXISTS public.ng_whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    client_phone TEXT NOT NULL,
    body TEXT NOT NULL,
    direction TEXT CHECK (direction IN ('incoming', 'outgoing')),
    message_type TEXT DEFAULT 'text',
    attachment_urls JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiles / Roles (Ligado a auth.users)
CREATE TABLE IF NOT EXISTS public.ng_user_roles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('superadmin', 'admin', 'vendedor')),
    full_name TEXT
);

-- Tabla de Plantillas Rápidas
CREATE TABLE IF NOT EXISTS public.ng_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    shortcut TEXT NOT NULL,
    body TEXT NOT NULL,
    category TEXT DEFAULT 'General',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- SEGURIDAD: RLS DESACTIVADO (Panel admin privado)
-- ═══════════════════════════════════════════════
-- NOTA: RLS está desactivado porque este es un panel de administración
-- interno. Si en el futuro se agregan roles de cliente, activar RLS
-- y crear políticas por rol.
ALTER TABLE public.ng_clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_follow_ups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_templates DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_whatsapp_messages DISABLE ROW LEVEL SECURITY;

-- GRANT: Permisos completos para roles anon/authenticated/service_role
GRANT ALL ON public.ng_clients TO anon, authenticated, service_role;
GRANT ALL ON public.ng_invoices TO anon, authenticated, service_role;
GRANT ALL ON public.ng_follow_ups TO anon, authenticated, service_role;
GRANT ALL ON public.ng_whatsapp_messages TO anon, authenticated, service_role;
GRANT ALL ON public.ng_templates TO anon, authenticated, service_role;

-- Columnas adicionales
ALTER TABLE public.ng_follow_ups ADD COLUMN IF NOT EXISTS observations TEXT;
ALTER TABLE public.ng_clients ADD COLUMN IF NOT EXISTS ai_summary TEXT;
ALTER TABLE public.ng_clients ADD COLUMN IF NOT EXISTS bot_paused_until TIMESTAMP WITH TIME ZONE;


-- Tabla de Historial de Prompts IA
CREATE TABLE IF NOT EXISTS public.ng_prompt_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    username TEXT DEFAULT 'Admin',
    old_prompt TEXT,
    new_prompt TEXT
);

-- Tabla de Configuración General IA
CREATE TABLE IF NOT EXISTS public.ng_bot_config (
    key TEXT PRIMARY KEY,
    value TEXT
);

-- Tabla de Productos (Catálogo de Precios para el Bot IA)
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

-- Tabla de Settings General
CREATE TABLE IF NOT EXISTS public.ng_settings (
    key TEXT PRIMARY KEY,
    value TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de Error Logs
CREATE TABLE IF NOT EXISTS public.ng_error_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT,
    message TEXT,
    type TEXT DEFAULT 'error',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ═══════════════════════════════════════════════
-- SEGURIDAD: RLS DESACTIVADO (Panel admin privado)
-- ═══════════════════════════════════════════════
ALTER TABLE public.ng_prompt_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_bot_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_error_logs DISABLE ROW LEVEL SECURITY;

-- Permisos
GRANT ALL ON public.ng_prompt_history TO anon, authenticated, service_role;
GRANT ALL ON public.ng_bot_config TO anon, authenticated, service_role;
GRANT ALL ON public.ng_products TO anon, authenticated, service_role;
GRANT ALL ON public.ng_settings TO anon, authenticated, service_role;
GRANT ALL ON public.ng_error_logs TO anon, authenticated, service_role;

-- ═══════════════════════════════════════════════
-- SEED DATA: Configuración inicial del Bot IA
-- ═══════════════════════════════════════════════
INSERT INTO public.ng_bot_config (key, value) VALUES
  ('bot_enabled', 'false'),
  ('bot_trigger', ''),
  ('system_prompt', 'Sos el asesor virtual de Adventure Pro...')
ON CONFLICT (key) DO NOTHING;