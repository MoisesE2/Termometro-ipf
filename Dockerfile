# Use uma imagem base do Node.js
FROM node:20-alpine AS builder

# Definir diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências (incluindo dev dependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Build da aplicação (sem executar testes/lint)
RUN npm run build:production

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos buildados para o nginx
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuração personalizada do nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor porta 80
EXPOSE 80

# Comando para iniciar o nginx
CMD ["nginx", "-g", "daemon off;"] 