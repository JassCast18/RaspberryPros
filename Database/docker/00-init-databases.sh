#!/bin/bash
# =============================================================================
# Inicializacion de PostgreSQL para RaspberryPros
# -----------------------------------------------------------------------------
# La imagen oficial de PostgreSQL solo crea una base ($POSTGRES_DB). Este script
# se ejecuta UNA sola vez, la primera vez que arranca el contenedor con el
# volumen vacio, y deja las tres bases del proyecto listas:
#
#   auth_db       -> Microservicio Usuarios
#   productos_db  -> Microservicio Productos
#   ventas_db     -> Microservicio Ventas
#
# Cada microservicio sigue siendo dueno de sus propias tablas; se comparte la
# instancia de PostgreSQL, no el esquema. En una Raspberry Pi levantar tres
# motores separados seria desperdiciar RAM.
#
# Si se quiere volver a ejecutar: docker compose down -v (borra el volumen).
# =============================================================================
set -euo pipefail

echo "==> Creando las bases de datos del proyecto..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname postgres <<-'EOSQL'
    CREATE DATABASE auth_db;
    CREATE DATABASE productos_db;
    CREATE DATABASE ventas_db;
EOSQL

# Los scripts usan \ir (include relative), por eso se ejecutan parados en su
# propia carpeta.
cd /sql/database

echo "==> auth_db: tablas, funciones, procedimiento y catalogo de roles"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname auth_db -f init.sql

echo "==> ventas_db: tablas y funciones de ventas"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname ventas_db -f ventas_init.sql

echo "==> productos_db: tabla de productos y catalogo inicial"
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname productos_db -f /sql/productos/init.sql

# Datos de prueba opcionales (usuario test@example.com / Password123!).
# Se activan poniendo SEED_DEMO_DATA=true en el archivo .env.
if [ "${SEED_DEMO_DATA:-false}" = "true" ]; then
    echo "==> auth_db: usuario de prueba (SEED_DEMO_DATA=true)"
    psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname auth_db \
        -f script/002_seed_test_user.sql
fi

echo "==> Inicializacion de PostgreSQL completada."
