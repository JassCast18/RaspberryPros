CREATE TABLE IF NOT EXISTS detalle_venta (
    id              BIGSERIAL PRIMARY KEY,
    venta_id        BIGINT NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    id_producto     BIGINT NOT NULL,
    nombre_producto VARCHAR(160),
    cantidad        INTEGER NOT NULL CHECK (cantidad > 0),
    precio_unitario NUMERIC(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal        NUMERIC(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_detalle_venta_venta_id ON detalle_venta (venta_id);
CREATE INDEX IF NOT EXISTS idx_detalle_venta_id_producto ON detalle_venta (id_producto);
