# RaspberryPros | Frontend

Aplicación React + Vite para la interfaz del sistema de ventas RaspberryPros.

## Estado actual del frontend

- Implementados: autenticación JWT, layout responsive, dashboard, productos,
  registro de ventas e historial de ventas.
- Productos consume el Microservicio Productos mediante `productService`.
- Registro, historial, detalle y anulación de ventas consumen el Microservicio
  Ventas mediante `salesService`.
- Auth utiliza los contratos reales de login y registro del Microservicio Usuarios
  y conserva la sesión JWT validada en el contexto de autenticación.

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
- `VITE_SALES_API_URL`: URL del Microservicio Ventas utilizada como destino del
  proxy de Vite.
- `VITE_SALES_API_PROXY_PATH`: ruta local mediante la cual el navegador accede al
  servicio de ventas en desarrollo.

El archivo `.env` contiene la configuración local, no debe subirse al repositorio
y no debe incluir secretos destinados a servicios del lado del servidor.

## Autenticación y registro

La ruta `/login` permite iniciar sesión o crear una cuenta mediante
`POST /api/auth/register`. El registro envía únicamente `name`, `email` y
`password`; no devuelve JWT ni inicia sesión automáticamente.

El backend asigna siempre el rol `user` a las cuentas creadas públicamente. La
interfaz no permite seleccionar roles ni crear administradores.
