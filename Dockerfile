# m-service — Next.js 16.3.4 + Prisma ORM v5, built for docker-compose (see docker-compose.yml)
#
# Three stages:
#   deps    — installs dependencies (and generates the Prisma Client against schema.prisma)
#   builder — full source + `next build` (uses `output: "standalone"` from next.config.ts)
#   runner  — slim final image that only runs `node server.js`
#
# The "migrate" service in docker-compose.yml targets the `builder` stage directly, since it
# needs the Prisma CLI + prisma/ (schema, migrations, seed.ts) that the slim `runner` stage
# deliberately does not carry.

FROM node:22-alpine AS deps
WORKDIR /app
# openssl is required by Prisma's query/schema engines on Alpine (musl) images.
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json ./
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# openssl must also be present at runtime, not just at build time — Prisma's query engine
# dynamically links against it, and without it here the engine can't detect which binary
# variant to load and login/every DB-touching request fails with PrismaClientInitializationError.
RUN apk add --no-cache libc6-compat openssl && \
    addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

CMD ["node", "server.js"]
