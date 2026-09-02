CREATE TABLE IF NOT EXISTS ventas (
    id         BIGSERIAL PRIMARY KEY,
    id_usuario BIGINT NOT NULL,
    total      NUMERIC(12, 2) NOT NULL CHECK (total >= 0),
    estado     VARCHAR(20) NOT NULL DEFAULT 'registrada'
               CHECK (estado IN ('registrada', 'anulada')),
    fecha      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ventas_id_usuario ON ventas (id_usuario);
CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas (fecha);
