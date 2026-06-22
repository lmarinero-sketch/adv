-- ═══════════════════════════════════════════════
-- MÓDULO CARRERAS Y ARCHIVOS (Adventure Pro)
-- ═══════════════════════════════════════════════

-- 1. Crear Tabla de Carreras
CREATE TABLE IF NOT EXISTS public.ng_carreras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    date TEXT,
    location TEXT,
    link TEXT,
    description TEXT,
    files JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Desactivar RLS (Panel admin privado)
ALTER TABLE public.ng_carreras DISABLE ROW LEVEL SECURITY;

-- 3. Permisos
GRANT ALL ON public.ng_carreras TO anon, authenticated, service_role;

-- 4. Crear Bucket de Storage (carreras_archivos)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'carreras_archivos',
    'carreras_archivos',
    true,
    10485760, -- 10MB limit
    ARRAY['image/jpeg', 'image/png', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet']
)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 5. Políticas de Storage (Para permitir subida y lectura sin auth restrictiva en el panel admin)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id = 'carreras_archivos' );
CREATE POLICY "Allow Upload" ON storage.objects FOR INSERT WITH CHECK ( bucket_id = 'carreras_archivos' );
CREATE POLICY "Allow Update" ON storage.objects FOR UPDATE USING ( bucket_id = 'carreras_archivos' );
CREATE POLICY "Allow Delete" ON storage.objects FOR DELETE USING ( bucket_id = 'carreras_archivos' );
