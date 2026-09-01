# Integración futura de Ventas

## Estado actual

El módulo `/ventas` utiliza un comportamiento mock exclusivamente en memoria porque el
Microservicio Ventas todavía no dispone de una implementación ni de un contrato definido.
No se realizan solicitudes HTTP, no existe un proxy de Ventas y no se configura ninguna
variable `VITE_SALES_*`.

Los productos disponibles se obtienen mediante
`src/services/productService.js`. La pantalla de ventas no importa directamente el archivo
de mocks y solo recibe productos activos cuyo stock sea mayor que cero.

Las ventas registradas se almacenan temporalmente dentro de
`src/services/salesService.js`. Se pierden al recargar la aplicación y no se guardan en
`localStorage` ni en otra persistencia. Registrar una venta tampoco descuenta el stock del
catálogo global; el stock solo limita las cantidades del detalle que se está preparando.

## Historial provisional

La ruta `/ventas/historial` consulta el mismo almacenamiento en memoria de
`src/services/salesService.js` mediante `getSales()` y `getSaleById()`. No existe una
colección separada para el historial: una venta registrada desde `/ventas` queda disponible
inmediatamente para ambas consultas durante la misma ejecución de la SPA.

El historial comienza vacío y no agrega ventas ficticias para completar la interfaz. No
utiliza `localStorage`, `sessionStorage` ni otra persistencia, por lo que una recarga completa
elimina las ventas registradas. El listado, la búsqueda y el detalle operan exclusivamente
sobre el modelo provisional descrito en este documento.

Cuando exista el Microservicio Ventas, `getSales()` y `getSaleById()` deberán sustituirse por
las consultas del contrato real, incluyendo sus reglas de autenticación, paginación,
filtrado y errores.

## Modelo provisional

La forma local actual de una venta es:

```text
venta
├── id: identificador local provisional
├── fecha: fecha ISO generada en el navegador
├── usuario: id, name y email disponibles desde AuthContext, o null
├── items
│   ├── producto: id y nombre
│   ├── cantidad
│   ├── precioUnitario
│   └── subtotal
└── total
```

Este modelo solo permite demostrar la interfaz de FRONT-05A. No representa ni anticipa el
contrato que deberá publicar el Microservicio Ventas.

Los subtotales se calculan multiplicando `cantidad * precioUnitario`. El total suma los
subtotales y los importes se redondean a dos decimales al registrar la venta local. La
interfaz presenta todos los valores como quetzales (`Q` / `GTQ`).

## Información requerida del Microservicio Ventas

Antes de sustituir el comportamiento mock, el equipo debe definir y documentar:

1. Puerto, URL base y estrategia de configuración por ambiente.
2. Endpoint y método para crear una venta.
3. Endpoint, método, filtros y paginación para listar ventas.
4. Payload real de creación y campos obligatorios.
5. Estructura real del detalle y forma de identificar cada producto.
6. Representación del precio y reglas de moneda, precisión y redondeo.
7. Responsabilidad del cálculo de subtotales, impuestos y total general.
8. Relación de la venta con el usuario autenticado y datos que deben enviarse.
9. Relación con Productos y fuente autorizada para precio y existencias.
10. Mecanismo de autenticación y formato del token o encabezado requerido.
11. Roles y permisos para crear, consultar, anular o modificar ventas.
12. Momento y responsable de validar y descontar stock.
13. Estructura de errores, códigos de negocio y mensajes esperados.
14. Estrategia transaccional para crear la venta y actualizar existencias de forma atómica.

## Cambios cuando exista el backend

La adaptación principal deberá concentrarse en `src/services/salesService.js`, reemplazando
el almacén en memoria y el identificador local por solicitudes al contrato real. La función
de registro deberá transformar el detalle visual al payload definitivo y normalizar la
respuesta y los errores del servicio.

También deberá revisarse `src/services/productService.js` para obtener disponibilidad y
precios desde la fuente real. La autoridad final sobre precio, stock, totales y permisos
debe permanecer en el backend; las validaciones del navegador solo deben servir como ayuda
inmediata para la persona usuaria.

`SalesPage` y `SalesHistoryPage` podrán conservar sus flujos visuales, estados de carga,
mensajes y diseño responsive siempre que se adapten los nombres y reglas que establezca el
contrato. El historial deberá consumir el endpoint real de listado y detalle en lugar de la
colección temporal.
