-- TABLA: Historial de modificaciones de productos (Precios, Stock, etc)
CREATE TABLE IF NOT EXISTS public.ng_products_changelog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    product_id UUID REFERENCES public.ng_products(id) ON DELETE SET NULL,
    product_code TEXT,
    product_name TEXT,
    old_price NUMERIC,
    new_price NUMERIC,
    old_stock NUMERIC,
    new_stock NUMERIC,
    changed_by TEXT DEFAULT current_user,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    change_type TEXT -- 'UPDATE', 'INSERT', 'DELETE'
);

-- FUNCIÓN: Trigger para guardar cambios de productos
CREATE OR REPLACE FUNCTION public.log_product_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        IF (NEW.price IS DISTINCT FROM OLD.price OR NEW.stock IS DISTINCT FROM OLD.stock) THEN
            INSERT INTO public.ng_products_changelog (
                product_id, product_code, product_name, 
                old_price, new_price, old_stock, new_stock, change_type
            ) VALUES (
                NEW.id, NEW.code, NEW.name, 
                OLD.price, NEW.price, OLD.stock, NEW.stock, 'UPDATE'
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.ng_products_changelog (
            product_id, product_code, product_name, 
            old_price, old_stock, change_type
        ) VALUES (
            OLD.id, OLD.code, OLD.name, 
            OLD.price, OLD.stock, 'DELETE'
        );
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.ng_products_changelog (
            product_id, product_code, product_name, 
            new_price, new_stock, change_type
        ) VALUES (
            NEW.id, NEW.code, NEW.name, 
            NEW.price, NEW.stock, 'INSERT'
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Activar la función en ng_products
DROP TRIGGER IF EXISTS trg_log_product_changes ON public.ng_products;
CREATE TRIGGER trg_log_product_changes
AFTER INSERT OR UPDATE OR DELETE ON public.ng_products
FOR EACH ROW EXECUTE FUNCTION public.log_product_changes();


-- TABLA: Historial de modificaciones de la configuración del bot (Prompt y Promos)
CREATE TABLE IF NOT EXISTS public.ng_bot_config_changelog (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    config_key TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_by TEXT DEFAULT current_user,
    changed_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    change_type TEXT
);

-- FUNCIÓN: Trigger para guardar cambios en configuración del bot
CREATE OR REPLACE FUNCTION public.log_bot_config_changes()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'UPDATE') THEN
        IF (NEW.value IS DISTINCT FROM OLD.value) THEN
            INSERT INTO public.ng_bot_config_changelog (
                config_key, old_value, new_value, change_type
            ) VALUES (
                NEW.key, OLD.value, NEW.value, 'UPDATE'
            );
        END IF;
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO public.ng_bot_config_changelog (
            config_key, old_value, change_type
        ) VALUES (
            OLD.key, OLD.value, 'DELETE'
        );
        RETURN OLD;
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO public.ng_bot_config_changelog (
            config_key, new_value, change_type
        ) VALUES (
            NEW.key, NEW.value, 'INSERT'
        );
        RETURN NEW;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- TRIGGER: Activar la función en ng_bot_config
DROP TRIGGER IF EXISTS trg_log_bot_config_changes ON public.ng_bot_config;
CREATE TRIGGER trg_log_bot_config_changes
AFTER INSERT OR UPDATE OR DELETE ON public.ng_bot_config
FOR EACH ROW EXECUTE FUNCTION public.log_bot_config_changes();

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.ng_products_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ng_bot_config_changelog ENABLE ROW LEVEL SECURITY;

-- Crear políticas para permitir lectura
CREATE POLICY "Allow read access" ON public.ng_products_changelog FOR SELECT USING (true);
CREATE POLICY "Allow read access" ON public.ng_bot_config_changelog FOR SELECT USING (true);
