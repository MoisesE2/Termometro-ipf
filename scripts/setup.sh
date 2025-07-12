#!/bin/bash

echo "🚀 Configurando ambiente de desenvolvimento - Termômetro IPF"
echo "============================================================="

# Verificar se Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js não está instalado. Por favor, instale Node.js 18+ primeiro."
    exit 1
fi

# Verificar versão do Node.js
NODE_VERSION=$(node --version)
echo "✅ Node.js versão: $NODE_VERSION"

# Instalar dependências
echo "📦 Instalando dependências..."
npm run install:all

# Configurar variáveis de ambiente
echo "🔧 Configurando variáveis de ambiente..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Arquivo backend/.env criado. Por favor, configure as variáveis de ambiente."
else
    echo "⚠️  Arquivo backend/.env já existe."
fi

if [ ! -f "frontend/.env.local" ]; then
    cp frontend/.env.example frontend/.env.local
    echo "✅ Arquivo frontend/.env.local criado."
else
    echo "⚠️  Arquivo frontend/.env.local já existe."
fi

# Gerar chaves seguras
echo "🔑 Gerando chaves seguras..."
JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")

echo "JWT_SECRET gerado: $JWT_SECRET"
echo "ENCRYPTION_KEY gerado: $ENCRYPTION_KEY"

echo ""
echo "🔧 PRÓXIMOS PASSOS:"
echo "==================="
echo "1. Configure o banco de dados PostgreSQL"
echo "2. Atualize as variáveis de ambiente nos arquivos .env"
echo "3. Execute as migrações: npm run db:migrate"
echo "4. Inicie o desenvolvimento: npm run dev"
echo ""
echo "📚 Para deploy com Docker:"
echo "   npm run docker:up"
echo ""
echo "✅ Setup concluído!" 