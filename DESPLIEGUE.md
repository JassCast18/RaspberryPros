# Despliegue de RaspberryPros con Docker

Guía de la capa de contenerización y despliegue del proyecto (parte de Victor).
Deja los cuatro componentes y PostgreSQL corriendo en una Raspberry Pi con un
solo comando, y las imágenes listas para que Mark las orqueste con Kubernetes.

---

## 1. Arquitectura del despliegue

```text
                        Raspberry Pi (Raspberry Pi OS 64-bit)
   ┌───────────────────────────────────────────────────────────────────────┐
   │                        red interna de Docker (rp-net)                 │
   │                                                                       │
   │   ┌─────────────┐                                                     │
   │   │  frontend   │  Nginx: sirve React y hace de reverse proxy         │
   │   │  :80        │──/usuarios-api/──┐                                  │
   │   └──────┬──────┘──/productos-api/─┼──┐                               │
   │          │        ──/ventas-api/───┼──┼──┐                            │
   │          │                         ▼  │  │                            │
   │          │                  ┌───────────┐│  │                         │
   │          │                  │ usuarios  ││  │  JWT + bcrypt           │
   │          │                  │  :3001    ││  │                         │
   │          │                  └─────┬─────┘│  │                         │
   │          │                        │      ▼  │                         │
   │          │                        │ ┌───────────┐                     │
   │          │                        │ │ productos │                     │
   │          │                        │ │  :3002    │                     │
   │          │                        │ └─────┬─────┘                     │
   │          │                        │       │        ▼                  │
   │          │                        │       │  ┌───────────┐            │
   │          │                        │       │  │  ventas   │            │
   │          │                        │       │  │  :3003    │            │
   │          │                        │       │  └─────┬─────┘            │
   │          │                        │       │        │ (llama a         │
   │          │                        │       │        │  usuarios y      │
   │          │                        │       │        │  productos)      │
   │          │                        ▼       ▼        ▼                  │
   │          │                  ┌──────────────────────────┐              │
   │          │                  │        postgres :5432    │              │
   │          │                  │  auth_db · productos_db  │              │
   │          │                  │       · ventas_db        │              │
   │          │                  └──────────────────────────┘              │
   └──────────┼────────────────────────────────────────────────────────────┘
              │
      puerto 8080 publicado  →  http://<ip-de-la-raspberry>:8080
```

**Decisiones de diseño**

| Decisión | Por qué |
|---|---|
| Una sola instancia de PostgreSQL con tres bases (`auth_db`, `productos_db`, `ventas_db`) | Cada microservicio sigue siendo dueño de sus tablas, pero levantar tres motores en una Raspberry Pi desperdicia RAM. |
| Nginx como reverse proxy del frontend | En desarrollo el proxy lo hacía Vite; en producción ese proxy no existe. Con Nginx el navegador habla con un solo origen y desaparece el problema de CORS (Usuarios y Ventas no traen `cors` habilitado). |
| Solo se publica el puerto del frontend | Las APIs y la base de datos quedan dentro de la red de Docker, sin exponerse a la red de la casa. |
| Imágenes multi-stage sobre `node:20-bookworm-slim` | Se descartan las herramientas de compilación: la imagen final es mucho más liviana. Debian y no Alpine porque `bcrypt` es un módulo nativo y con glibc hay binarios precompilados para arm64. |
| `HEALTHCHECK` en cada imagen + `depends_on: service_healthy` | Ventas no arranca antes que Usuarios y Productos, y ninguno antes que PostgreSQL esté aceptando conexiones. |
| Contenedores corriendo como usuario `node` | Nada corre como root dentro del contenedor. |
| Secretos en `.env`, nunca en el repositorio | `.env` está en `.gitignore`; se versiona solo `.env.example`. |

---

## 2. Archivos que agrega esta parte

```text
docker-compose.yml                          orquestación de los 5 contenedores
.env.example                                plantilla de variables (copiar a .env)
.gitignore                                  evita subir el .env real
DESPLIEGUE.md                               este documento
Database/docker/00-init-databases.sh        crea e inicializa las 3 bases
Frontend/Dockerfile                         build de React + Nginx
Frontend/nginx.conf                         sitio estático + reverse proxy
Frontend/.dockerignore
Microservicio Usuarios/Dockerfile
Microservicio Usuarios/.dockerignore
Microservicio Productos/Dockerfile
Microservicio Productos/.dockerignore
Microservicio Ventas/Dockerfile
Microservicio Ventas/.dockerignore
```

No se modificó ningún archivo de código de los compañeros.

---

## 3. Requisitos en la Raspberry Pi

- Raspberry Pi 4 o 5 con **al menos 4 GB de RAM** (con 2 GB funciona, pero el
  build del frontend es apretado; ver la sección de problemas).
- **Raspberry Pi OS de 64 bits** (arm64). Verificar con:

  ```bash
  uname -m      # tiene que decir: aarch64
  ```

  Si dice `armv7l` el sistema es de 32 bits y las imágenes oficiales de
  PostgreSQL 16 no corren; hay que reinstalar el sistema en 64 bits.
- Tarjeta microSD de 32 GB o más (mejor todavía, un SSD por USB).

---

## 4. Instalar Docker en la Raspberry Pi

```bash
sudo apt update && sudo apt upgrade -y

# Instalación oficial de Docker Engine + plugin de Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Usar docker sin sudo
sudo usermod -aG docker $USER

# Cerrar sesión y volver a entrar para que aplique el grupo
exit
```

Al reconectarse, comprobar:

```bash
docker --version
docker compose version
docker run --rm hello-world
```

---

## 5. Levantar el proyecto

```bash
git clone https://github.com/JassCast18/RaspberryPros.git
cd RaspberryPros

# 1. Configurar los secretos
cp .env.example .env
nano .env
```

En `.env` hay que cambiar como mínimo:

```env
POSTGRES_PASSWORD=<una contraseña propia>
JWT_SECRET=<cadena larga y aleatoria>
```

Para generar el secreto:

```bash
openssl rand -base64 48
```

```bash
# 2. Construir y levantar (la primera vez tarda entre 10 y 20 minutos en la Pi)
docker compose up -d --build

# 3. Ver el estado
docker compose ps
```

Los cinco contenedores deben aparecer como `running` y los cuatro que tienen
healthcheck como `healthy`.

La aplicación queda en:

```text
http://<ip-de-la-raspberry>:8080
```

La IP se obtiene con `hostname -I`.

---

## 6. Verificar que todo quedó bien

```bash
# Salud de cada microservicio (desde la propia Raspberry Pi)
docker compose exec usuarios  node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>r.text()).then(console.log)"
docker compose exec productos node -e "fetch('http://127.0.0.1:3002/health').then(r=>r.text()).then(console.log)"
docker compose exec ventas    node -e "fetch('http://127.0.0.1:3003/api/health').then(r=>r.text()).then(console.log)"

# A través del reverse proxy, que es como lo ve el navegador
curl http://localhost:8080/usuarios-api/api/health
curl http://localhost:8080/productos-api/health
curl http://localhost:8080/ventas-api/api/health

# Las tres bases y sus tablas
docker compose exec postgres psql -U postgres -c "\l"
docker compose exec postgres psql -U postgres -d auth_db      -c "\dt"
docker compose exec postgres psql -U postgres -d productos_db -c "SELECT id, nombre, precio, stock FROM productos;"
```

### Prueba de humo del flujo completo

```bash
BASE=http://localhost:8080

# Registro
curl -s -X POST $BASE/usuarios-api/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"name":"Victor","email":"victor@raspberrypros.gt","password":"Password123!"}'

# Login (guardar el token que devuelve)
curl -s -X POST $BASE/usuarios-api/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"victor@raspberrypros.gt","password":"Password123!"}'

# Catálogo
curl -s $BASE/productos-api/api/productos

# Venta: Ventas llama internamente a Usuarios y a Productos
curl -s -X POST $BASE/ventas-api/api/ventas \
  -H 'Content-Type: application/json' \
  -H "Authorization: Bearer <TOKEN>" \
  -d '{"idUsuario":1,"productos":[{"idProducto":1,"cantidad":2},{"idProducto":3,"cantidad":1}]}'
```

Este flujo se ejecutó de punta a punta contra PostgreSQL 16 con las mismas
variables de entorno del `docker-compose.yml`: la venta se creó correctamente
con su total calculado a partir de los precios que devuelve el microservicio de
Productos.

---

## 7. Comandos del día a día

```bash
docker compose ps                 # estado de los contenedores
docker compose logs -f ventas     # logs de un servicio
docker compose logs -f            # logs de todos
docker compose restart ventas     # reiniciar un servicio
docker compose up -d --build      # reconstruir tras un cambio de código
docker compose down               # apagar (los datos se conservan)
docker compose down -v            # apagar y BORRAR la base de datos
docker stats                      # consumo de CPU y RAM
```

Respaldo y restauración de la base:

```bash
docker compose exec postgres pg_dumpall -U postgres > respaldo_$(date +%F).sql
cat respaldo_2026-09-03.sql | docker compose exec -T postgres psql -U postgres
```

---

## 8. Problemas frecuentes

| Síntoma | Causa y solución |
|---|---|
| El script de la base no corre y no existen `auth_db`, etc. | Solo se ejecuta con el volumen vacío. Hacer `docker compose down -v` y volver a levantar. |
| `usuarios` reinicia en bucle | Falta `JWT_SECRET` o `POSTGRES_PASSWORD` en `.env`. Revisar con `docker compose logs usuarios`. |
| El build del frontend se queda pegado o muere | Poca RAM. Aumentar el swap: `sudo dphys-swapfile swapoff`, editar `CONF_SWAPSIZE=2048` en `/etc/dphys-swapfile`, `sudo dphys-swapfile setup && sudo dphys-swapfile swapon`. |
| `exec format error` al levantar | El sistema es de 32 bits. Reinstalar Raspberry Pi OS de 64 bits. |
| El navegador da 502 en `/usuarios-api/...` | El microservicio no está `healthy`. Ver `docker compose ps` y sus logs. |
| El puerto 8080 está ocupado | Cambiar `FRONTEND_PORT` en `.env` y `docker compose up -d`. |

---

## 9. Pendientes y entrega a Kubernetes

**Pendiente menor del equipo**

- El Microservicio Productos no tiene `package-lock.json` en el repositorio, por
  eso su Dockerfile usa `npm install` en lugar de `npm ci`. Al generar el lock
  (`npm install` y hacer commit del archivo), cambiar el Dockerfile a `npm ci
  --omit=dev` para que la build sea reproducible.

**Lo que queda listo para Mark**

Las imágenes salen etiquetadas con nombre y versión fijos, que es justo lo que
necesitan los manifiestos de Kubernetes:

```text
raspberrypros/usuarios:1.0.0
raspberrypros/productos:1.0.0
raspberrypros/ventas:1.0.0
raspberrypros/frontend:1.0.0
```

Equivalencias al pasar de Compose a Kubernetes:

| En Docker Compose | En Kubernetes |
|---|---|
| cada `service` | un `Deployment` + un `Service` |
| DNS interno (`http://usuarios:3001`) | `Service` de tipo `ClusterIP` con el mismo nombre |
| bloque `environment` | `ConfigMap` (configuración) y `Secret` (`JWT_SECRET`, contraseña) |
| `HEALTHCHECK` de la imagen | `livenessProbe` y `readinessProbe` sobre las mismas rutas |
| volumen `postgres_data` | `PersistentVolumeClaim` |
| `ports` del frontend | `Ingress` o `Service` de tipo `NodePort` |

Rutas de salud para las probes: `/api/health` en usuarios y ventas, `/health` en
productos, `/` en el frontend.
