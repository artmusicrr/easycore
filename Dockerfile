# ================================
# EasyCore Backend - Dockerfile
# Multi-stage build para produção
# ================================

# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Instalar dependências do sistema necessárias para Prisma
RUN apk add --no-cache libc6-compat openssl

# Copiar arquivos de dependências
COPY package.json package-lock.json* ./
RUN npm ci --only=production

# Stage 2: Builder
FROM node:20-alpine AS builder
WORKDIR /app

RUN apk add --no-cache libc6-compat openssl

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Gerar cliente Prisma
RUN npx prisma generate

# Build do Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 3: Runner (Produção)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN apk add --no-cache libc6-compat openssl

# Criar usuário não-root para segurança
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar arquivos necessários
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma

# Definir permissões
RUN chown -R nextjs:nodejs /app

USER nextjs

EXPOSE 3333

ENV PORT=3333
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
