-- Ejecutar conectado a auth_db desde la carpeta Database.
\set ON_ERROR_STOP on

\ir tables/001_roles.sql
\ir tables/002_users.sql
\ir tables/003_user_roles.sql
\ir tables/004_users_email_index.sql
\ir functions/001_set_updated_at.sql
\ir script/001_seed_roles.sql
\ir storedprocedure/001_create_user.sql
