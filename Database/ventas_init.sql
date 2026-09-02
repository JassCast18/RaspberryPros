-- Ejecutar conectado a ventas_db desde la carpeta Database.
\set ON_ERROR_STOP on

\ir tables/101_ventas.sql
\ir tables/102_detalle_venta.sql
\ir functions/101_set_ventas_updated_at.sql
