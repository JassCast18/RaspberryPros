INSERT INTO roles (name, description)
VALUES
    ('admin', 'Acceso administrativo al microservicio'),
    ('user', 'Usuario autenticado estandar')
ON CONFLICT (name) DO UPDATE
SET description = EXCLUDED.description;
