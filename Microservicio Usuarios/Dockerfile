# =============================================================================
# Microservicio Usuarios / Autenticacion - RaspberryPros
# Imagen multi-stage. Compatible con arm64 (Raspberry Pi 4/5, 64-bit) y amd64.
# Se usa Debian slim y no Alpine porque bcrypt es un modulo nativo y en musl
# hay que compilarlo a mano; con glibc existen binarios precompilados.
# =============================================================================

# ---------- Etapa 1: dependencias ----------
FROM node:20-bookworm-slim AS deps

# Herramientas necesarias por si bcrypt tiene que compilarse desde fuente.
RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---------- Etapa 2: runtime ----------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3001

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# El proceso no corre como root (usuario "node" que ya trae la imagen).
USER node

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3001/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
