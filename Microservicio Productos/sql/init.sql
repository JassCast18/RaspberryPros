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
