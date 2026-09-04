# =============================================================================
# Frontend (React + Vite) - RaspberryPros
# Se compila el bundle estatico y se sirve con Nginx, que ademas hace de
# reverse proxy hacia los microservicios. Asi el navegador habla siempre con
# un solo origen y no hay problemas de CORS (en desarrollo esto lo hacia el
# proxy de Vite, que en produccion ya no existe).
# =============================================================================

# ---------- Etapa 1: build ----------
FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

# Vite reemplaza las variables VITE_* en tiempo de compilacion, por eso llegan
# como build args y no como variables de entorno del contenedor.
ARG VITE_AUTH_API_PROXY_PATH=/usuarios-api
ARG VITE_SALES_API_PROXY_PATH=/ventas-api
ARG VITE_PRODUCTS_API_URL=/productos-api

ENV VITE_AUTH_API_PROXY_PATH=$VITE_AUTH_API_PROXY_PATH \
    VITE_SALES_API_PROXY_PATH=$VITE_SALES_API_PROXY_PATH \
    VITE_PRODUCTS_API_URL=$VITE_PRODUCTS_API_URL

COPY . .
RUN npm run build

# ---------- Etapa 2: runtime ----------
FROM nginx:1.27-alpine AS runtime

COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
    CMD wget --quiet --tries=1 --spider http://127.0.0.1/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
