# Backend - Termômetro IPF

Backend em Node.js com Fastify, TypeScript, PostgreSQL e WebSockets para aplicação de cronômetro em tempo real.

## 🚀 Tecnologias

- **Node.js** com **Fastify** (TypeScript)
- **PostgreSQL** com **Prisma ORM**
- **Socket.IO** para comunicação em tempo real
- **TypeScript** para tipagem estática

## 📋 Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL rodando
- npm ou yarn

## 🔧 Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env
   ```
   
   Edite o arquivo `.env` com suas configurações:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/termometro_ipf?schema=public"
   PORT=3001
   NODE_ENV=development
   FRONTEND_URL=http://localhost:3000
   ```

3. **Configurar banco de dados:**
   ```bash
   # Aplicar schema ao banco
   npm run db:push
   
   # OU fazer migração
   npm run db:migrate
   ```

4. **Gerar cliente Prisma:**
   ```bash
   npm run db:generate
   ```

## 🏃‍♂️ Executando

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm run build
npm start
```

## 📡 API Endpoints

### REST API

- `GET /health` - Status do servidor
- `GET /api/timers` - Listar todos os timers
- `POST /api/timers` - Criar novo timer

### WebSocket Events

**Cliente para Servidor:**
- `timer:start` - Iniciar timer
- `timer:pause` - Pausar timer
- `timer:stop` - Parar timer

**Servidor para Cliente:**
- `timers:state` - Estado atual dos timers
- `timer:started` - Timer iniciado
- `timer:paused` - Timer pausado
- `timer:stopped` - Timer parado
- `timer:update` - Atualização do timer (a cada segundo)
- `timer:finished` - Timer finalizado

## 🗄️ Banco de Dados

### Comandos úteis do Prisma

```bash
# Visualizar banco no browser
npm run db:studio

# Reset do banco
npx prisma migrate reset

# Aplicar mudanças no schema
npm run db:push
```

## 📁 Estrutura

```
backend/
├── src/
│   └── server.ts          # Servidor principal
├── prisma/
│   └── schema.prisma      # Schema do banco
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

## 🔧 Scripts Disponíveis

- `npm run dev` - Executa em modo desenvolvimento com hot-reload
- `npm run build` - Compila TypeScript para JavaScript
- `npm start` - Executa versão compilada
- `npm run db:generate` - Gera cliente Prisma
- `npm run db:push` - Aplica schema ao banco
- `npm run db:migrate` - Executa migrações
- `npm run db:studio` - Abre Prisma Studio

## 🌐 URLs

- **API REST:** `http://localhost:3001`
- **WebSocket:** `ws://localhost:3001`
- **Health Check:** `http://localhost:3001/health`

## 📝 Notas

- O servidor suporta **CORS** configurado para o frontend
- **Rate limiting** aplicado (100 requests por minuto)
- **Logs estruturados** com Pino
- **Graceful shutdown** implementado
- **SSL/TLS** pronto para produção 

# API Termômetro de Arrecadação

API RESTful e WebSocket para acompanhamento em tempo real do progresso de metas de arrecadação, com endpoints públicos para consulta e endpoints administrativos para gerenciamento.

## 📋 Especificação OpenAPI 3.0

A API segue o padrão OpenAPI 3.0 e está dividida em quatro grupos principais de endpoints:

### 1. Status Público
- Endpoints abertos para consulta do status atual do termômetro (valor arrecadado, meta, progresso, etc.)

### 2. Autenticação
- `POST /auth/login` - Autentica administradores e retorna token JWT
  - Requer email e senha
  - Retorna token para acesso aos endpoints restritos

### 3. Gerenciamento de Cotas (Admin)
- `POST /admin/cotas` - Cria nova cota de arrecadação
- `GET /admin/cotas` - Lista todas as cotas cadastradas
- `DELETE /admin/cotas?id={id}` - Remove uma cota específica

### 4. Gerenciamento de Metas (Admin)
- `POST /admin/metas` - Ajusta a meta de arrecadação
- `GET /admin/metas` - Consulta a meta atual

## 🔒 Autenticação
Endpoints administrativos requerem autenticação via Bearer Token (JWT) no header:
