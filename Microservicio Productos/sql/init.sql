BEGIN;

CREATE TABLE IF NOT EXISTS productos (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT NOT NULL DEFAULT '',
    precio NUMERIC(12,2) NOT NULL CHECK (precio >= 0),
    stock INTEGER NOT NULL DEFAULT 0 CHECK (stock >= 0),
    categoria VARCHAR(100) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    fecha_actualizacion TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

INSERT INTO productos
    (nombre, descripcion, precio, stock, categoria, activo)
SELECT
    'Teclado mecánico',
    'Teclado mecánico USB para computadora',
    425.00,
    15,
    'Periféricos',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM productos
    WHERE nombre = 'Teclado mecánico'
);

INSERT INTO productos
    (nombre, descripcion, precio, stock, categoria, activo)
SELECT
    'Mouse inalámbrico',
    'Mouse inalámbrico con receptor USB',
    125.00,
    20,
    'Periféricos',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM productos
    WHERE nombre = 'Mouse inalámbrico'
);

INSERT INTO productos
    (nombre, descripcion, precio, stock, categoria, activo)
SELECT
    'Monitor 24 pulgadas',
    'Monitor Full HD de 24 pulgadas',
    1450.00,
    8,
    'Monitores',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM productos
    WHERE nombre = 'Monitor 24 pulgadas'
);

INSERT INTO productos
    (nombre, descripcion, precio, stock, categoria, activo)
SELECT
    'Audífonos USB',
    'Audífonos con micrófono integrado',
    275.00,
    12,
    'Audio',
    TRUE
WHERE NOT EXISTS (
    SELECT 1
    FROM productos
    WHERE nombre = 'Audífonos USB'
);

COMMIT;
