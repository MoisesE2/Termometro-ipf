FROM node:18-alpine AS base

# Instalar dependências do sistema
RUN apk add --no-cache openssl

# Configurar diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar dependências
RUN npm ci --only=production

# Gerar cliente Prisma
RUN npx prisma generate

# Copiar código da aplicação
COPY src ./src
COPY tsconfig.json ./

# Instalar dependências de desenvolvimento para build
RUN npm ci

# Fazer build da aplicação
RUN npm run build

# Remover dependências de desenvolvimento
RUN npm prune --production

# Expor porta
EXPOSE 3001

# Comando para iniciar a aplicação
CMD ["npm", "start"] 