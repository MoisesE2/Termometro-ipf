# Termômetro IPF - Sistema de Arrecadação "Alargando Fronteiras"

Este é um projeto [Next.js](https://nextjs.org) para acompanhamento em tempo real do progresso de arrecadação para o projeto "Alargando Fronteiras" da IPF.

## 🚀 Funcionalidades

- **Termômetro Visual**: Acompanhamento visual do progresso de arrecadação
- **Metas por Etapas**: Visualização das metas para 2025, 2026, 2027 e total
- **PIX Integrado**: Sistema de doação via PIX com QR Code
- **Design Responsivo**: Interface adaptável para todos os dispositivos
- **Atualização em Tempo Real**: Dados atualizados automaticamente

## 🛠️ Tecnologias

- **Next.js 15** com App Router
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **React Icons**

## 📋 Pré-requisitos

- Node.js 18.x ou superior
- npm ou yarn

## 🚀 Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar servidor de desenvolvimento
npm run dev

# Build para produção
npm run build

# Iniciar servidor de produção
npm start
```

Abra [http://localhost:3000](http://localhost:3000) no seu navegador para ver o resultado.

## 🐳 Deploy com Docker

O projeto inclui um `Dockerfile` otimizado para produção:

```bash
# Build da imagem
docker build -t termometro-ipf .

# Executar container
docker run -p 3000:3000 termometro-ipf
```

## 🚀 Deploy no Dokploy

### Configurações Especiais

Este projeto foi configurado especificamente para funcionar com Dokploy:

1. **Arquivo `.dockerignore`**: Evita problemas com cache e dependências
2. **Configuração `next.config.ts`**: Configurado para build standalone
3. **Dockerfile personalizado**: Otimizado para Alpine Linux
4. **Build estático**: Configurado para gerar páginas estáticas

### Passos para Deploy

1. **Push para o repositório**:
   ```bash
   git add .
   git commit -m "Configurações para deploy no Dokploy"
   git push origin main
   ```

2. **No Dokploy**:
   - Criar nova aplicação
   - Conectar ao repositório GitHub
   - O Dokploy utilizará automaticamente o Dockerfile personalizado
   - Build Type: Dockerfile
   - Port: 3000

### Solução de Problemas de Deploy

Se encontrar erros relacionados ao componente `Html` durante o build:

1. Certifique-se de que as configurações do `next.config.ts` estão aplicadas
2. Verifique se o `Dockerfile` está sendo utilizado (não o Nixpacks)
3. Confirme que todas as variáveis de ambiente estão definidas

## 📊 Estrutura do Projeto

```
src/
├── app/                 # App Router do Next.js
│   ├── layout.tsx      # Layout principal
│   ├── page.tsx        # Página inicial
│   └── ...             # Outras páginas
├── components/         # Componentes React
│   ├── ui/            # Componentes de interface
│   ├── cotas/         # Componentes de cotas
│   └── metas/         # Componentes de metas
├── models/            # Modelos TypeScript
└── lib/               # Bibliotecas e utilitários
```

## 🔧 Configurações de Produção

- **Output**: Standalone para Docker
- **Static Generation**: Páginas pré-renderizadas
- **React Strict Mode**: Habilitado
- **Telemetria**: Desabilitada

## 📝 Atualizações de Valores

Para atualizar os valores de arrecadação, edite o arquivo `src/app/page.tsx`:

```typescript
const valorArrecadado = 44600; // Atualizar este valor
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto é desenvolvido para a IPF - Igreja Presbiteriana de Fortaleza.

---

**Feito para a Glória de Deus** 🙏
