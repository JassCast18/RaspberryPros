# Microservicio de Productos - RaspberryPros

Microservicio encargado de administrar los productos del sistema RaspberryPros.

## Responsable

Esteban

## Tecnologías utilizadas

- Node.js
- Express
- PostgreSQL
- pg
- dotenv
- cors

## Puerto

El microservicio utiliza por defecto el puerto:

3002

## Base de datos

La base de datos utilizada es:

productos_db

La tabla principal es:

productos

## Instalación local

1. Crear la base de datos:

```text
createdb productos_db
```

2. Desde la carpeta `Microservicio Productos/`, crear la tabla y cargar los
   productos iniciales:

```text
psql -d productos_db -f sql/init.sql
```

El script es idempotente: puede ejecutarse nuevamente sin eliminar datos ni
duplicar los productos iniciales.

3. Copiar `.env.example` como `.env` y configurar allí las credenciales locales
   de PostgreSQL. No deben almacenarse contraseñas reales en el repositorio.

4. Instalar las dependencias:

```text
npm install
```

5. Iniciar el microservicio:

```text
npm start
```

6. Verificar el estado del servicio:

```text
GET http://localhost:3002/health
```

7. Consultar el catálogo:

```text
GET http://localhost:3002/api/productos
```

## Estructura de un producto

Cada producto contiene:

- id
- nombre
- descripcion
- precio
- stock
- categoria
- activo
- fecha_creacion
- fecha_actualizacion

## Endpoints

### Listar productos

GET

/api/productos

### Obtener producto por ID

GET

/api/productos/:id

Ejemplo:

/api/productos/1

### Crear producto

POST

/api/productos

Ejemplo de JSON:

```json
{
  "nombre": "Teclado mecánico",
  "descripcion": "Teclado mecánico USB",
  "precio": 425.00,
  "stock": 15,
  "categoria": "Periféricos",
  "activo": true
}
```
