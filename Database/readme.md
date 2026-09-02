# Bases de datos

Scripts PostgreSQL para las bases del proyecto. Cada microservicio debe ser
dueno de sus propias tablas.

## Auth DB

`auth_db` pertenece exclusivamente al microservicio de Usuarios y Autenticacion.

### Estructura

```text
Database/
|-- init.sql
|-- ventas_init.sql
|-- tables/
|   |-- 001_roles.sql
|   |-- 002_users.sql
|   |-- 003_user_roles.sql
|   |-- 004_users_email_index.sql
|   |-- 101_ventas.sql
|   `-- 102_detalle_venta.sql
|-- functions/
|   |-- 001_set_updated_at.sql
|   `-- 101_set_ventas_updated_at.sql
|-- storedprocedure/
|   `-- 001_create_user.sql
|-- script/
|   |-- 001_seed_roles.sql
|   `-- 002_seed_test_user.sql
`-- readme.md
```

### Modelo

- `roles`: catalogo de roles (`admin`, `user`).
- `users`: identidad, email unico y hash bcrypt.
- `user_roles`: relacion muchos a muchos para permitir mas de un rol por usuario.
- `created_at` y `updated_at`: auditoria basica en UTC.

El hash bcrypt lo genera la API con `bcrypt`; la base de datos no recibe
contrasenas en texto plano. El procedimiento de alta recibe el hash ya generado.

### Inicializacion local

Crear la base y ejecutar desde esta carpeta con `psql`:

```text
createdb auth_db
psql -d auth_db -f init.sql
```

El script es idempotente para tablas, funciones, procedimiento y roles. Los
scripts de `script/` son datos de prueba y se ejecutan aparte cuando se necesiten.

Para crear el usuario de prueba (`test@example.com` / `Password123!`), ejecutar:

```text
psql -d auth_db -f script/002_seed_test_user.sql
```

## Ventas DB

`ventas_db` pertenece exclusivamente al microservicio de Ventas.

### Modelo

- `ventas`: cabecera de la venta, con `id_usuario`, `total`, `estado` y `fecha`.
- `detalle_venta`: lineas de productos vendidos, con `id_producto`, `cantidad`,
  `precio_unitario` y `subtotal`.

`id_usuario` e `id_producto` son referencias logicas. No hay foreign keys hacia
`auth_db` ni `productos_db`; Ventas debe validar esos datos llamando a Auth API y
Productos API.

### Inicializacion local

Crear la base y ejecutar desde esta carpeta con `psql`:

```text
createdb ventas_db
psql -d ventas_db -f ventas_init.sql
```
