FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache openssl libc6-compat

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de configuração
COPY package*.json ./
COPY nixpacks.toml ./

# Instalar dependências do monorepo
RUN npm ci

# Copiar código do backend
COPY backend/package*.json ./backend/
COPY backend/prisma ./backend/prisma/
COPY backend/src ./backend/src/
COPY backend/tsconfig.json ./backend/

# Instalar dependências do backend
RUN cd backend && npm ci

# Gerar cliente Prisma
RUN cd backend && npx prisma generate

# Copiar código do frontend
COPY frontend/package*.json ./frontend/
COPY frontend/src ./frontend/src/
COPY frontend/public ./frontend/public/
COPY frontend/tsconfig.json ./frontend/
COPY frontend/next.config.ts ./frontend/
COPY frontend/postcss.config.mjs ./frontend/
COPY frontend/tailwind.config.ts ./frontend/

# Instalar dependências do frontend
RUN cd frontend && npm ci

# Build das aplicações
RUN cd backend && npm run build
RUN cd frontend && npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production
RUN cd backend && npm prune --production
RUN cd frontend && npm prune --production

# Expor portas
EXPOSE 3000 3001

# Comando para iniciar a aplicação
CMD ["npm", "run", "start"] 