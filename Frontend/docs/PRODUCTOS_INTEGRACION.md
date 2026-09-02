# Integración real de Productos

## Estado actual

El frontend consume el contrato implementado por `Microservicio Productos/`.
El catálogo mock y su almacenamiento temporal fueron eliminados.

La URL del servicio se configura mediante:

```env
VITE_PRODUCTS_API_URL=http://localhost:3002
```

El valor predeterminado coincide con el puerto `3002` definido por el backend.
La ruta base utilizada por `productService.js` es `/api/productos`.

## Contrato HTTP verificado

| Operación | Método y ruta | Respuesta exitosa |
| --- | --- | --- |
| Listar | `GET /api/productos` | Array de productos |
| Consultar | `GET /api/productos/:id` | Producto directo |
| Crear | `POST /api/productos` | `{ mensaje, producto }` |
| Actualizar | `PUT /api/productos/:id` | `{ mensaje, producto }` |
| Desactivar | `DELETE /api/productos/:id` | `{ mensaje, producto }` |

`DELETE` realiza una baja lógica: establece `activo=false`. El registro no se
elimina de PostgreSQL.

## Modelo de producto

Las respuestas completas contienen:

- `id`
- `nombre`
- `descripcion`
- `precio`
- `stock`
- `categoria`
- `activo`
- `fecha_creacion`
- `fecha_actualizacion`

POST y PUT reciben exactamente `nombre`, `descripcion`, `precio`, `stock`,
`categoria` y `activo`. El formulario exige nombre y categoría, precio mayor o
igual a cero y stock entero mayor o igual a cero.

## Adaptación del frontend

`src/services/productService.js` centraliza todas las solicitudes con `fetch` y
expone:

- `getProducts()`
- `getAvailableProducts()`
- `getProductById()`
- `createProduct()`
- `updateProduct()`
- `deactivateProduct()`

El servicio normaliza las diferencias entre respuestas para entregar siempre
productos completos a la interfaz. Como DELETE solo devuelve `id`, `nombre` y
`activo`, después de desactivar se consulta el producto por ID para recuperar
el modelo completo actualizado.

`getAvailableProducts()` filtra el listado real y devuelve únicamente registros
con `activo=true` y `stock>0`. Esta función es la fuente de productos de
`SalesPage`. `HomePage` obtiene del mismo servicio la métrica total del catálogo.

## Errores

El backend responde errores JSON con `{ mensaje }` y utiliza:

- `400` para campos obligatorios ausentes o valores negativos.
- `404` cuando el ID no existe.
- `500` para errores de consulta o del servidor.

El frontend conserva el mensaje del backend cuando existe y también distingue
errores de red, JSON inválido, identificadores inválidos y estructuras de
respuesta inesperadas mediante `ProductServiceError`.

## CORS y autorización

El backend utiliza `cors()` sin restricciones adicionales y actualmente no
valida JWT ni roles. La visibilidad de las acciones administrativas en el
frontend se conserva como comportamiento visual, pero no constituye una medida
de autorización. El backend todavía no aplica controles de acceso.
