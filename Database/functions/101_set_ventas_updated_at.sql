CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS ventas_set_updated_at ON ventas;
CREATE TRIGGER ventas_set_updated_at
BEFORE UPDATE ON ventas
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
