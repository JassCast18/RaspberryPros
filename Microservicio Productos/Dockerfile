# =============================================================================
# Microservicio Productos - RaspberryPros
# Imagen multi-stage. Compatible con arm64 (Raspberry Pi 4/5, 64-bit) y amd64.
# =============================================================================

# ---------- Etapa 1: dependencias ----------
FROM node:20-bookworm-slim AS deps

WORKDIR /app

# Este servicio todavia no tiene package-lock.json en el repo, por eso se usa
# "npm install" en lugar de "npm ci". Al generar el lock, cambiar a:
#   COPY package.json package-lock.json ./
#   RUN npm ci --omit=dev
COPY package.json ./
RUN npm install --omit=dev

# ---------- Etapa 2: runtime ----------
FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production \
    PORT=3002

WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

USER node

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
    CMD node -e "fetch('http://127.0.0.1:3002/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "src/server.js"]
