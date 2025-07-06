import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { request } from 'http';

// Augment FastifyInstance to include jwt
declare module 'fastify' {
  interface FastifyInstance {
    jwt: typeof jwt;
  }
}

// Configuração do ambiente
const PORT = Number(process.env.PORT) || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret'; // Use uma variável de ambiente segura em produção

// Inicialização do Prisma
const prisma = new PrismaClient();

// Interfaces TypeScript
interface User {
  id: string;
  email: string;
  password?: string;  // Agora é opcional
  name?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JWTPayload {
  userId: string;
  email: string;
}

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

interface AuthRequest {
  Body: {
    email: string;
    password: string;
    name?: string;
  }
}

interface TimerRequest {
  Body: {
    name: string;
    duration: number; // Duração em segundos
  }
}

interface TimerResponse {
  timers: {
    id: string;
    name: string;
    duration: number;
    currentTime: number;
    isActive: boolean;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
  }[];
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

// Declaração de tipos para o Fastify
declare module 'fastify' {
  export interface FastifyInstance {
    authenticate: (request: any, reply: any) => Promise<void>;
  }
}

import { FastifyRequest } from 'fastify';

// Extensão do FastifyRequest para incluir 'user'
declare module 'fastify' {
  interface FastifyRequest {
    user?: JWTPayload;
  }
}

// Middleware de autenticação
async function authenticate(request: any, reply: any) {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Token inválido ou não fornecido' });
  }
}


// Inicialização do servidor
const start = async () => {
  try {
    // Registro do plugin JWT
    await fastify.register(jwt, {
      secret: JWT_SECRET,
      sign: {
        expiresIn: '24h' 
      }
    });

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

    // Decorar o Fastify com o método de autenticação
    fastify.decorate('authenticate', authenticate);

    // ========== ROTAS DE AUTENTICAÇÃO ==========
    // Rota de registro
    fastify.post<AuthRequest>('/api/auth/register', async (request, reply) => {
      try {
        const { email, password, name } = request.body;
    
        // Validações
        if (!email || !password) {
          return reply.code(400).send({ error: 'Email e senha são obrigatórios' });
        }
    
        if (password.length < 6) {
          return reply.code(400).send({ error: 'A senha deve ter pelo menos 6 caracteres' });
        }
    
        // Verificar se o usuário já existe
        const existingUser = await prisma.user.findUnique({
          where: { email }
        });
    
        if (existingUser) {
          return reply.code(400).send({ error: 'Usuário já existe com este e-mail' });
        }
    
        // Criptografar a senha
        const hashedPassword = await bcrypt.hash(password, 10);
    
        // Criar o usuário (sem passar name se for undefined)
        const userData: any = {
          email,
          password: hashedPassword
        };
    
        if (name) {
          userData.name = name;
        }
    
        const user = await prisma.user.create({
          data: userData
        });
    
        // Gerar token JWT
        const token = fastify.jwt.sign({ 
          userId: user.id, 
          email: user.email 
        });
    
        reply.code(201).send({
          message: 'Usuário registrado com sucesso',
          token,
          user: {
            id: user.id,
            email: user.email,
            name: user.name || null
          }
        });
      } catch (error) {
        fastify.log.error('Erro ao registrar usuário:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota de login
    fastify.post<AuthRequest>('/api/auth/login', async (request, reply) => {
      try {
        const { email, password } = request.body;
    
        if (!email || !password) {
          return reply.code(400).send({ error: 'Email e senha são obrigatórios' });
        }
    
        // Consulta com tratamento explícito
        const user = await prisma.user.findUnique({
          where: { email },
          select: { id: true, email: true, password: true, name: true }
        });
    
        console.log('DEBUG - User object:', user); // Log crucial
    
        if (!user) {
          return reply.code(401).send({ error: 'Credenciais inválidas' });
        }
    
        if (!user.password) {
          fastify.log.error(`Falha estrutural: Usuário ${email} sem password`);
          return reply.code(500).send({ error: 'Erro de configuração do sistema' });
        }
    
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          return reply.code(401).send({ error: 'Credenciais inválidas' });
        }
    
        const token = fastify.jwt.sign({ userId: user.id, email: user.email });
    
        return reply.send({
          message: 'Login realizado com sucesso',
          token,
          user: { id: user.id, email: user.email, name: user.name }
        });
    
      } catch (error) {
        fastify.log.error('Erro completo no login:', error);
        return reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para obter perfil do usuário (protegida)
    fastify.get('/api/auth/profile', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        });

        if (!user) {
          return reply.code(404).send({ error: 'Usuário não encontrado' });
        }

        reply.send({ user });

      } catch (error) {
        fastify.log.error('Erro ao buscar perfil:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para verificar token
    fastify.get('api/auth/verify', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      const { userId, email } = request.user as JWTPayload;
      reply.send({
        valid: true,
        userId,
        email
      });
    });

    // ========== ROTAS DE TIMERS (PROTEGIDAS) ==========

    // Rota para obter todos os timers do usuário
    fastify.get('/api/timers', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;
        
        const timers = await prisma.timer.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' }
        });
        
        reply.send({ timers });
      } catch (error) {
        fastify.log.error('Erro ao buscar timers:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para criar um novo timer
    fastify.post<TimerRequest>('/api/timers', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;
        const { name, duration } = request.body;
        
        if (!name || duration <= 0) {
          return reply.code(400).send({ error: 'Nome e duração são obrigatórios' });
        }

        const timer = await prisma.timer.create({
          data: {
            name,
            duration,
            currentTime: duration,
            isActive: false,
            userId
          }
        });

        reply.send({ timer });
      } catch (error) {
        fastify.log.error('Erro ao criar timer:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // ========== WEBSOCKET COM AUTENTICAÇÃO ========== 
    // Middleware de autenticação para Socket.IO
    io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Token não fornecido'));
        }

        const decoded = fastify.jwt.verify(token) as JWTPayload;
        socket.data.user = decoded;
        next();
      } catch (err) {
        next(new Error('Token inválido'));
      }
    });

    // Socket.IO - Gerenciamento de conexões
    io.on('connection', (socket) => {
      const user = socket.data.user as JWTPayload;
      console.log(`Cliente conectado: ${socket.id} (User: ${user.email})`);

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
              currentTime: data.duration,
              userId: user.userId
            }
          });

          // Configurar interval para contagem regressiva PAREI AQUI
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

    // ========== ROTAS PÚBLICAS ==========

    // Rotas da API REST - Rota de saúde
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

        // Substitua 'someUserId' por um ID de usuário válido ou ajuste conforme sua lógica
        const timer = await prisma.timer.create({
          data: {
            name,
            duration,
            currentTime: duration,
            isActive: false,
            user: {
              connect: { id: 'someUserId' } // <-- forneça um ID de usuário válido aqui
            }
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
    console.log(`🔐 Autenticação JWT ativa`)

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