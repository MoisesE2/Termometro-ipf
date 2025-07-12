#!/bin/bash

echo "🚀 Iniciando Termômetro IPF em produção..."

# Verificar se os diretórios existem
if [ ! -d "backend" ]; then
    echo "❌ Diretório backend não encontrado"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "❌ Diretório frontend não encontrado"
    exit 1
fi

# Executar migrações do banco
echo "🗄️  Executando migrações do banco..."
cd backend
npx prisma migrate deploy
cd ..

# Iniciar aplicações em paralelo
echo "🌐 Iniciando aplicações..."
cd backend && npm start &
BACKEND_PID=$!

cd frontend && npm start &
FRONTEND_PID=$!

# Aguardar os processos
wait $BACKEND_PID $FRONTEND_PID 