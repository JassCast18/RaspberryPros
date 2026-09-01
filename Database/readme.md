# Base de datos de autenticacion

Scripts PostgreSQL para `auth_db`. Esta base pertenece exclusivamente al
microservicio de Usuarios y Autenticacion.

## Estructura

```text
Database/
|-- init.sql
|-- tables/
|   |-- 001_roles.sql
|   |-- 002_users.sql
|   |-- 003_user_roles.sql
|   `-- 004_users_email_index.sql
|-- functions/
|   `-- 001_set_updated_at.sql
|-- storedprocedure/
|   `-- 001_create_user.sql
|-- script/
|   |-- 001_seed_roles.sql
|   `-- 002_seed_test_user.sql
`-- readme.md
```

## Modelo

- `roles`: catalogo de roles (`admin`, `user`).
- `users`: identidad, email unico y hash bcrypt.
- `user_roles`: relacion muchos a muchos para permitir mas de un rol por usuario.
- `created_at` y `updated_at`: auditoria basica en UTC.

El hash bcrypt lo genera la API con `bcrypt`; la base de datos no recibe
contrasenas en texto plano. El procedimiento de alta recibe el hash ya generado.

## Inicializacion local

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