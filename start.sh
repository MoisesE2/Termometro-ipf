#!/bin/bash

echo "🚀 Iniciando Termômetro IPF..."

# Verificar se estamos em produção
if [ "$NODE_ENV" = "production" ]; then
    echo "📦 Modo produção detectado"
    
    # Executar migrações do banco
    echo "🗄️  Executando migrações do banco..."
    cd backend && npx prisma migrate deploy && cd ..
    
    # Iniciar aplicações
    echo "🌐 Iniciando aplicações..."
    npm run start
else
    echo "🔧 Modo desenvolvimento detectado"
    
    # Iniciar em modo desenvolvimento
    npm run dev
fi 