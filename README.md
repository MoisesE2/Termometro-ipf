# Termômetro para a campanha "Alargando fronteiras"

Aplicação de cronômetro em tempo real desenvolvida com Node.js + Fastify no backend e Next.js no frontend, utilizando WebSockets para sincronização entre clientes.

## 🚀 Tecnologias

### Backend
- **Node.js** com **Fastify** (TypeScript)
- **PostgreSQL** com **Prisma ORM**
- **Socket.IO** para comunicação em tempo real
- **TypeScript** para tipagem estática

### Frontend
- **Next.js** (React + TypeScript)
- **Tailwind CSS** para estilização
- **Socket.IO Client** para tempo real

## 📋 Pré-requisitos

- **Node.js** (versão 18 ou superior)
- **PostgreSQL** instalado e rodando
- **npm** ou **yarn**

## 🚀 Como Executar

### 1️⃣ **Configurar o Backend**

```bash
# Entrar no diretório do backend
cd backend

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env
```

**Editar o arquivo `.env`** com suas configurações do PostgreSQL:
```env
DATABASE_URL="postgresql://username:password@localhost:5432/termometro_ipf?schema=public"
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

```bash
# Aplicar schema ao banco de dados
npm run db:push

# Gerar cliente Prisma
npm run db:generate

# Executar o backend
npm run dev
```

✅ **Backend rodando em:** `http://localhost:3001`

---

### 2️⃣ **Configurar o Frontend**

```bash
# Entrar no diretório do frontend
cd frontend

# Instalar dependências
npm install

# Executar o frontend
npm run dev
```

✅ **Frontend rodando em:** `http://localhost:3000`

---

## 🎯 Uso Rápido

### Para desenvolvedores:

1. **Terminal 1 - Backend:**
   ```bash
   cd backend && npm run dev
   ```

2. **Terminal 2 - Frontend:**
   ```bash
   cd frontend && npm run dev
   ```

3. **Acessar:** `http://localhost:3000`

## 📁 Estrutura do Projeto

```
Termometro-ipf/
├── backend/                 # API + WebSocket Server
│   ├── src/
│   │   └── server.ts       # Servidor principal
│   ├── prisma/
│   │   └── schema.prisma   # Schema do banco
│   ├── package.json
│   └── README.md
├── frontend/               # Interface React
│   ├── src/
│   │   └── app/           # Next.js App Router
│   ├── package.json
│   └── README.md
├── docs/                  # Documentação
└── README.md             # Este arquivo
```

## 📡 Funcionalidades

- ⏱️ **Cronômetro em tempo real** com WebSockets
- 🔄 **Sincronização entre múltiplos clientes**
- ⏸️ **Controles:** Iniciar, Pausar, Parar
- 💾 **Persistência** dos timers no PostgreSQL
- 🎨 **Interface moderna** com Tailwind CSS
- 📱 **Responsivo** para desktop e mobile

## 🌐 URLs da Aplicação

- **Frontend:** `http://localhost:3000`
- **Backend API:** `http://localhost:3001`
- **WebSocket:** `ws://localhost:3001`
- **Health Check:** `http://localhost:3001/health`

## 🛠️ Scripts Disponíveis

### Backend
- `npm run dev` - Modo desenvolvimento com hot-reload
- `npm run build` - Compilar TypeScript
- `npm start` - Executar versão compilada
- `npm run db:push` - Aplicar schema ao banco
- `npm run db:studio` - Abrir Prisma Studio

### Frontend
- `npm run dev` - Modo desenvolvimento
- `npm run build` - Build para produção
- `npm start` - Executar build de produção

## 📝 Notas Importantes

- ⚠️ **PostgreSQL deve estar rodando** antes de iniciar o backend
- 🔌 **Backend deve estar rodando** antes do frontend para WebSockets
- 🌐 **CORS configurado** para comunicação entre frontend e backend
- 🔒 **Rate limiting** aplicado no backend (100 req/min)

## 🆘 Problemas Comuns

### Backend não conecta ao banco
```bash
# Verificar se PostgreSQL está rodando
# Verificar credenciais no arquivo .env
# Executar: npm run db:push
```

### Frontend não conecta ao WebSocket
```bash
# Verificar se backend está rodando na porta 3001
# Verificar logs do navegador (F12)
```

---

**Desenvolvido para a campanha "Alargando fronteiras"** 🎯
