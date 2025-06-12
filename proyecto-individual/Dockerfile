# Imagen base de Node.js
FROM node:18-alpine AS base

# Instalar dependencias necesarias
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Capa de dependencias
FROM base AS deps
# Copiar archivos de configuración de dependencias
COPY package.json package-lock.json* ./
RUN npm ci

# Capa de construcción
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Configuración de variables de entorno para la build
ARG GEMINI_API_KEY
ENV GEMINI_API_KEY=${GEMINI_API_KEY}

# Construir la aplicación
RUN npm run build

# Capa de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

# Crear usuario no root para producción
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs
USER nextjs

# Copiar archivos necesarios
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Exponer el puerto
EXPOSE 3000

# Definir comando de inicio
CMD ["node", "server.js"]