import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';

// Configuração do ambiente
const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

// Inicialização do Prisma
const prisma = new PrismaClient();

// Tipo para o timer ativo
interface ActiveTimer {
  id: string;
  name: string;
  duration: number;
  currentTime: number;
  isActive: boolean;
  startTime?: Date;
  intervalId?: NodeJS.Timeout;
}

// Estado global dos timers (em produção, usar Redis)
const activeTimers = new Map<string, ActiveTimer>();

// Configuração do Fastify
const fastify = Fastify({
  logger: NODE_ENV === 'development' ? {
    level: 'info',
    transport: {
      target: 'pino-pretty'
    }
  } : {
    level: 'warn'
  }
});

// Configuração do Socket.IO
const io = new SocketIOServer(fastify.server, {
  cors: {
    origin: FRONTEND_URL,
    methods: ["GET", "POST"],
    credentials: true
  },
  transports: ['polling', 'websocket']
});

// Inicialização do servidor
const start = async () => {
  try {
    // Middleware de segurança
    await fastify.register(helmet, {
      contentSecurityPolicy: false // Desabilitar CSP para desenvolvimento
    });

    // Configuração CORS
    await fastify.register(cors, {
      origin: [FRONTEND_URL],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
    });

    // Rate limiting
    await fastify.register(rateLimit, {
      max: 100,
      timeWindow: '1 minute'
    });

    // Socket.IO - Gerenciamento de conexões
    io.on('connection', (socket) => {
      console.log(`Cliente conectado: ${socket.id}`);

      // Enviar estado atual dos timers para o cliente recém-conectado
      socket.emit('timers:state', Array.from(activeTimers.values()));

      // Listener para iniciar timer
      socket.on('timer:start', async (data: { id: string; name: string; duration: number }) => {
        try {
          const timer: ActiveTimer = {
            id: data.id,
            name: data.name,
            duration: data.duration,
            currentTime: data.duration,
            isActive: true,
            startTime: new Date()
          };

          // Salvar no banco de dados
          await prisma.timer.upsert({
            where: { id: data.id },
            update: {
              name: data.name,
              duration: data.duration,
              isActive: true,
              currentTime: data.duration
            },
            create: {
              id: data.id,
              name: data.name,
              duration: data.duration,
              isActive: true,
              currentTime: data.duration
            }
          });

          // Configurar interval para contagem regressiva
          const intervalId = setInterval(() => {
            const currentTimer = activeTimers.get(data.id);
            if (!currentTimer || !currentTimer.isActive) {
              clearInterval(intervalId);
              return;
            }

            currentTimer.currentTime -= 1;

            if (currentTimer.currentTime <= 0) {
              currentTimer.isActive = false;
              currentTimer.currentTime = 0;
              clearInterval(intervalId);
              
              // Emitir evento de timer finalizado
              io.emit('timer:finished', { id: data.id, name: data.name });
            }

            // Emitir atualização do timer
            io.emit('timer:update', {
              id: currentTimer.id,
              currentTime: currentTimer.currentTime,
              isActive: currentTimer.isActive
            });
          }, 1000);

          timer.intervalId = intervalId;
          activeTimers.set(data.id, timer);

          // Emitir para todos os clientes
          io.emit('timer:started', timer);
          
        } catch (error) {
          console.error('Erro ao iniciar timer:', error);
          socket.emit('error', { message: 'Erro ao iniciar timer' });
        }
      });

      // Listener para pausar timer
      socket.on('timer:pause', async (data: { id: string }) => {
        try {
          const timer = activeTimers.get(data.id);
          if (timer && timer.intervalId) {
            clearInterval(timer.intervalId);
            timer.isActive = false;
            
            // Atualizar no banco
            await prisma.timer.update({
              where: { id: data.id },
              data: {
                isActive: false,
                currentTime: timer.currentTime
              }
            });

            io.emit('timer:paused', { id: data.id, currentTime: timer.currentTime });
          }
        } catch (error) {
          console.error('Erro ao pausar timer:', error);
          socket.emit('error', { message: 'Erro ao pausar timer' });
        }
      });

      // Listener para parar timer
      socket.on('timer:stop', async (data: { id: string }) => {
        try {
          const timer = activeTimers.get(data.id);
          if (timer && timer.intervalId) {
            clearInterval(timer.intervalId);
          }
          
          activeTimers.delete(data.id);
          
          // Remover do banco ou marcar como inativo
          await prisma.timer.update({
            where: { id: data.id },
            data: {
              isActive: false,
              currentTime: 0
            }
          });

          io.emit('timer:stopped', { id: data.id });
        } catch (error) {
          console.error('Erro ao parar timer:', error);
          socket.emit('error', { message: 'Erro ao parar timer' });
        }
      });

      socket.on('disconnect', () => {
        console.log(`Cliente desconectado: ${socket.id}`);
      });
    });

    // Rotas da API REST
    fastify.get('/health', async () => {
      return { 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        environment: NODE_ENV
      };
    });

    // Rota para obter todos os timers
    fastify.get('/api/timers', async () => {
      try {
        const timers = await prisma.timer.findMany({
          orderBy: { createdAt: 'desc' }
        });
        return { timers };
      } catch (error) {
        fastify.log.error('Erro ao buscar timers:', error);
        return { error: 'Erro interno do servidor' };
      }
    });

    // Rota para criar um novo timer
    fastify.post<{
      Body: {
        name: string;
        duration: number;
      }
    }>('/api/timers', async (request, reply) => {
      try {
        const { name, duration } = request.body;
        
        if (!name || duration <= 0) {
          return reply.code(400).send({ error: 'Nome e duração são obrigatórios' });
        }

        const timer = await prisma.timer.create({
          data: {
            name,
            duration,
            currentTime: duration,
            isActive: false
          }
        });

        return { timer };
      } catch (error) {
        fastify.log.error('Erro ao criar timer:', error);
        return reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Conectar ao banco de dados
    await prisma.$connect();
    console.log('✅ Conectado ao PostgreSQL via Prisma');

    // Iniciar o servidor
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Servidor rodando na porta ${PORT}`);
    console.log(`🌐 Ambiente: ${NODE_ENV}`);
    console.log(`🔗 WebSocket disponível em ws://localhost:${PORT}`);

  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Encerrando servidor...');
  
  // Limpar todos os intervals
  activeTimers.forEach(timer => {
    if (timer.intervalId) {
      clearInterval(timer.intervalId);
    }
  });
  
  // Desconectar do banco
  await prisma.$disconnect();
  
  // Fechar servidor
  await fastify.close();
  console.log('✅ Servidor encerrado com sucesso');
  process.exit(0);
});

start(); 