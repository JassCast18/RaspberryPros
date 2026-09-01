# Integración futura de Productos

## Estado actual

El módulo Productos funciona con datos mock para demostrar la interfaz mientras
`Microservicio Productos/` no tenga una implementación ni un contrato definido.
El modelo provisional contiene `id`, `nombre`, `descripcion`, `precio`, `stock`,
`categoria` y `activo`; estos campos no deben asumirse como definitivos.

`ProductsPage` no conoce la ubicación de los mocks. Todas las lecturas y
operaciones locales pasan por `src/services/productService.js`. La creación,
edición y activación/inactivación modifican únicamente memoria y se pierden al
recargar la aplicación.

Las reglas de stock son exclusivamente visuales:

- `0`: sin existencias.
- `1` a `5`: stock bajo.
- Más de `5`: disponible.

La visibilidad de crear y editar para el rol `admin` también es provisional. El
backend futuro deberá validar los permisos; ocultar controles en la interfaz no
es una medida de autorización.

## Contrato necesario

Antes de conectar el backend, el equipo debe definir y versionar:

1. URL, puerto y base path del servicio.
2. Endpoint y método para listar productos.
3. Endpoint, método y payload para crear productos.
4. Endpoint, método y payload para editar productos.
5. Estrategia de eliminación física, inactivación o baja lógica.
6. Campos reales, tipos, obligatoriedad y validaciones.
7. Representación de precio, moneda, stock y categorías.
8. Estrategia de autenticación y formato del header requerido.
9. Roles y permisos aplicados por el backend.
10. Estructura de respuestas exitosas, paginación y errores.

## Piezas que deberán cambiar

La adaptación principal deberá realizarse en `src/services/productService.js`,
reemplazando el almacén mock por solicitudes al contrato real. Después deberán
ajustarse el modelo visual, las validaciones y la autorización de controles si
los campos o permisos reales difieren. `ProductsPage` podrá conservar su flujo
de carga, filtros, estados vacíos y manejo de errores.
