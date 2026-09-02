# RaspberryPros | Frontend

Aplicación React + Vite para la interfaz del sistema de ventas RaspberryPros.

## Estado actual del frontend

- Implementados: autenticación JWT, layout responsive, dashboard, productos,
  registro de ventas e historial de ventas.
- Productos utiliza actualmente un catálogo mock aislado en `productService`; la
  conexión con el Microservicio Productos queda pendiente hasta disponer de su
  contrato real.
- Ventas e historial utilizan un almacén compartido en memoria de `salesService`;
  no existe persistencia y la integración con el Microservicio Ventas está pendiente.
- Auth está implementado contra el contrato actual del Microservicio Usuarios. La
  validación E2E permanece pendiente por la configuración externa de PostgreSQL y
  backend.

## Ejecución local

```bash
npm install
npm run dev
```

Para comprobar la compilación de producción:

```bash
npm run build
```

## Variables de entorno

Copia `.env.example` a un archivo `.env` local y ajusta, cuando corresponda:

- `VITE_AUTH_API_URL`: URL del Microservicio Usuarios utilizada como destino del
  proxy de Vite.
- `VITE_AUTH_API_PROXY_PATH`: ruta local mediante la cual el navegador accede al
  servicio en desarrollo.
- `VITE_PRODUCTS_API_URL`: URL del Microservicio Productos.

El archivo `.env` contiene la configuración local, no debe subirse al repositorio
y no debe incluir secretos destinados a servicios del lado del servidor. Ventas
todavía no requiere una variable de entorno porque conserva su implementación
provisional en memoria.
