# Microservicio Ventas

API de ventas para RaspberryPros.

## Tecnologias

- Node.js
- Express
- PostgreSQL

## Puerto

```text
http://localhost:3003
```

## Variables de entorno

Copiar `.env.example` a `.env` y ajustar credenciales:

```text
PORT=3003
DATABASE_URL=postgres://postgres:postgres@localhost:5432/ventas_db
AUTH_API_URL=http://localhost:3001
PRODUCTS_API_URL=http://localhost:3002
UPSTREAM_TIMEOUT_MS=5000
```

## Modelo de datos

El servicio usa la base `ventas_db`.

- `ventas`: cabecera de la venta. Guarda `id_usuario`, `total`, `estado`, `fecha`, `created_at` y `updated_at`.
- `detalle_venta`: productos vendidos por cada venta. Guarda `venta_id`, `id_producto`, `nombre_producto`, `cantidad`, `precio_unitario` y `subtotal`.

`id_usuario` e `id_producto` son referencias logicas. No tienen foreign keys hacia `auth_db` ni `productos_db`, porque Ventas no debe leer ni depender directamente de las tablas de otros microservicios.

## Endpoints

### Health check

```text
GET /api/health
```

### Listar ventas

```text
GET /api/ventas
```

### Obtener venta por id

```text
GET /api/ventas/:id
```

### Registrar venta

```text
POST /api/ventas
```

Body:

```json
{
  "idUsuario": 1,
  "productos": [
    {
      "idProducto": 1,
      "cantidad": 2
    }
  ]
}
```

Si Auth API requiere token para consultar usuarios, enviar el mismo header:

```text
Authorization: Bearer <token>
```

### Anular venta

```text
PATCH /api/ventas/:id/anular
```

## Flujo para registrar una venta

1. Cliente envia `idUsuario` y lista de productos con cantidades.
2. Ventas valida el body.
3. Ventas consulta `Auth API` para confirmar que el usuario existe.
4. Ventas consulta `Productos API` por cada producto para obtener precio, nombre y stock.
5. Ventas calcula subtotales y total.
6. Ventas guarda `ventas` y `detalle_venta` dentro de una transaccion.
7. Ventas responde con la venta registrada y su detalle.

## Instalar y ejecutar

```text
npm install
npm run dev
```

## Estructura

```text
Microservicio Ventas/
|-- package.json
|-- .env.example
|-- src/
|   |-- app.js
|   |-- server.js
|   |-- clients/
|   |   |-- auth.client.js
|   |   |-- http.client.js
|   |   `-- products.client.js
|   |-- config/
|   |   |-- database.js
|   |   `-- services.js
|   |-- controllers/
|   |   `-- ventas.controller.js
|   |-- repositories/
|   |   `-- ventas.repository.js
|   |-- routes/
|   |   `-- ventas.routes.js
|   |-- services/
|   |   `-- ventas.service.js
|   |-- utils/
|   |   |-- async-handler.js
|   |   `-- errors.js
|   `-- validators/
|       `-- ventas.validator.js
`-- readme.md
```
