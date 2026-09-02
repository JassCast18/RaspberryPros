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
