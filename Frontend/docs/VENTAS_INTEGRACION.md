# Integración con Microservicio Ventas

## Configuración

El frontend consume el servicio de Ventas mediante estas variables:

```env
VITE_SALES_API_URL=http://localhost:3003
VITE_SALES_API_PROXY_PATH=/ventas-api
```

Durante desarrollo, Vite reenvía `/ventas-api/*` al servicio configurado y elimina
el prefijo antes de enviar la solicitud. Esta estrategia permite consumir el
microservicio local, que actualmente no configura CORS, sin exponer secretos en el
navegador.

## Contrato HTTP

El servicio utiliza la base `/api/ventas` y publica:

- `GET /api/ventas`: devuelve `{ ventas: [...] }`.
- `POST /api/ventas`: registra una venta y devuelve la venta creada.
- `GET /api/ventas/:id`: devuelve una venta con su detalle.
- `PATCH /api/ventas/:id/anular`: cambia su estado a `anulada` y devuelve la venta.

El registro envía únicamente identificadores y cantidades:

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

`POST /api/ventas` reenvía `Authorization: Bearer <JWT>` para que Ventas pueda
validar al usuario contra el Microservicio Usuarios. El frontend no envía nombres,
precios, subtotales ni totales como fuente de autoridad; Ventas consulta Productos
y calcula esos importes.

## Modelo normalizado

`salesService.js` oculta los wrappers y nombres del backend. Las páginas reciben:

```text
venta
├── id
├── idUsuario
├── usuario: id y, solo cuando ya está disponible, name/email
├── fecha
├── estado: registrada | anulada
├── total
└── items
    ├── id
    ├── producto: id y nombre
    ├── cantidad
    ├── precioUnitario
    └── subtotal
```

El historial no realiza consultas adicionales por cada usuario. Como sus respuestas
solo incluyen `idUsuario`, la interfaz muestra `Usuario #<id>`.

## Errores

La capa de servicio conserva `status` y `code` y presenta mensajes en español para
errores de red, JSON inválido, validación, sesión o permisos, venta inexistente,
producto no disponible, stock insuficiente, fallos de servicios dependientes y
errores internos.

## Métricas y estados

El dashboard obtiene ventas persistidas mediante `getSales()`. Las ventas con estado
`anulada` no se incluyen en el conteo de ventas vigentes ni en el total vendido.

Anular una venta no elimina el registro ni modifica su detalle.

## Limitación confirmada del backend

El Microservicio Ventas valida disponibilidad y stock consultando Productos, pero no
descuenta existencias al registrar una venta. Tampoco repone stock al anularla. El
frontend no simula ninguno de esos movimientos; requieren una mejora transaccional
posterior en los servicios correspondientes.
