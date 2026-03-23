FROM node:20-alpine AS base

WORKDIR /app

# OpenSSL is required by Prisma on Alpine.
RUN apk add --no-cache openssl

FROM base AS builder

COPY package.json ./
RUN npm install

COPY tsconfig.json ./
COPY src ./src
COPY prisma ./prisma

RUN npm run db:generate
RUN npm run build

FROM base AS runner

ENV NODE_ENV=production
WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 3001

CMD ["node", "dist/server.js"]
