import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import jwt from '@fastify/jwt';
import bcrypt from 'bcryptjs';
import { Server as SocketIOServer } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import { request } from 'http';
//IMPORTAÇÕES PARA CRIPTOGRAFIA
import { createCipheriv, createDecipheriv, randomBytes, scrypt } from 'crypto';
import { promisify } from 'util';

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
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'your_encryption_key'; // NOVA VARIAVEL PARA CRIPTOGRAFIA

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

// NOVA INTERFACE PARA COTAS
interface CotaRequest {
  Body: {
    name?: string;
    cpf?: string;
    comprovante?: string; //Base64 ou URL do arquivo
    valor?: number;
    observacoes?: string;
  }
}

// ========== SERVIÇO DE CRIPTOGRAFIA ==========
const scryptAsync = promisify(scrypt);

class EncryptionService {
  private readonly algorithm = 'aes-256-ctr';
  private readonly keyLength = 32;
  private readonly ivLength = 16;

  private async getKey(password: string, salt: Buffer): Promise<Buffer> {
    return (await scryptAsync(password, salt, this.keyLength)) as Buffer;
  }

  async encrypt(text: string, password: string): Promise<string> {
    const salt = randomBytes(16);
    const iv = randomBytes(this.ivLength);
    const key = await this.getKey(password, salt);

    const cipher = createCipheriv(this.algorithm, key, iv);
    const encrypted = Buffer.concat([cipher.update(text), cipher.final()]);

    // Retorna: salt + iv + encrypted
      return salt.toString('base64') + ':' + iv.toString('base64') + ':' + encrypted.toString('base64');
  }

  async decrypt(encryptedData: string, password: string): Promise<string> {
    const [saltBase64, ivBase64, encryptedBase64] = encryptedData.split(':');
    
    if (!saltBase64) {
      throw new Error('Salt ausente nos dados criptografados');
    }
    if (!ivBase64) {
      throw new Error('IV ausente nos dados criptografados');
    }
    if (!encryptedBase64) {
      throw new Error('Dados criptografados ausentes');
    }
    const salt = Buffer.from(saltBase64, 'base64');
    const iv = Buffer.from(ivBase64, 'base64');
    const encrypted = Buffer.from(encryptedBase64, 'base64');

    const key = await this.getKey(password, salt);
    const decipher = createDecipheriv(this.algorithm, key, iv);
    
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString('utf8');
  }
}

// Instancia do serviço de criptografia
const encryptionService = new EncryptionService();

// Função para criptografar dados sensiveis
async function encryptSensitiveData(data: any): Promise<any> {
  if (!data) return data;

  try {
    return await encryptionService.encrypt(JSON.stringify(data), ENCRYPTION_KEY);
  } catch (error) {
    console.error('Erro ao criptografar dados sensiveis:', error);
    throw new Error('Erro ao criptografar dados sensiveis');
  }
}

// Função para descriptografator dados sensiveis
async function decryptSensitiveData(encryptedData: string): Promise<any> {
  if (!encryptedData) return null;

  try {
    const decrypted = await encryptionService.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Erro ao descriptografar dados sensiveis:', error);
    return null;
  }
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

    // Rota de health check para Railway
    fastify.get('/api/health', async (request, reply) => {
      try {
        // Verificar conexão com banco
        await prisma.$queryRaw`SELECT 1`;
        reply.send({ 
          status: 'healthy', 
          timestamp: new Date().toISOString(),
          database: 'connected'
        });
      } catch (error) {
        fastify.log.error('Health check failed:', error);
        reply.code(503).send({ 
          status: 'unhealthy', 
          timestamp: new Date().toISOString(),
          database: 'disconnected'
        });
      }
    });

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

    // Rota de login do administrador
    fastify.post('/api/admin/login', async (request, reply) => {
      const { username, password } = request.body as { username: string, password: string };

      // Buscar por email OU nome
      const user = await prisma.user.findFirst({
        where: {
          OR: [
            { email: username },
            { name: username }
          ],
          isAdmin: true
        }
      });

      if (!user) {
        return reply.code(401).send({ error: 'Usuário ou senha inválidos' });
      }

      const senhaCorreta = await bcrypt.compare(password, user.password);
      if (!senhaCorreta) {
        return reply.code(401).send({ error: 'Usuário ou senha inválidos' });
      }

      // Gere e retorne o token JWT
      const token = fastify.jwt.sign({ userId: user.id, isAdmin: true });
      return reply.send({ token, user: { id: user.id, name: user.name, email: user.email } });
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
    fastify.get('/api/auth/verify', {
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

    // ========== ROTAS DE COTAS (PROTEGIDAS) - NOVAS ROTAS ==========
    // Rota para criar uma nova cota
    fastify.post<CotaRequest>('/api/cotas', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;
        const { name, cpf, comprovante, valor, observacoes } = request.body;

        //validações
        if (!valor || valor <= 0) {
          return reply.code(400).send({ error: 'Valor da cota é obrigatorio e deve ser maior que zero' });
        }

        // Validar CPF se fornecido (regex básico)
        if (cpf && !/^\d{3}\.\d{3}\.\d{3}-\d{2}$/.test(cpf) && !/^\d{11}$/.test(cpf)) {
          return reply.code(400).send({ error: 'CPF deve estar no formato 000.000.000-00 ou conter apenas números' });
        }

        //preparar dados para criptografia
        const dadosSensiveis = {
          nome: name || null,
          cpf: cpf || null,
          comprovante: comprovante || null,
          observacoes: observacoes || null
        };

        // Criptografar dados sensiveis
        const dadosCriptografados = await encryptSensitiveData(dadosSensiveis);

        // Criar a cota no banco
        const cota = await prisma.cota.create({
          data: {
            valor,
            dadosCriptografados,
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        });
        reply.code(201).send({
          message: 'Cota criada com sucesso',
          cota: {
            id: cota.id,
            valor: cota.valor,
            nome: name || null,
            cpf: cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-**') : null, // mascarar CPF na resposta
            temComprovante: !!comprovante,
            createdAt: cota.createdAt,
            updatedAt: cota.updatedAt
          }
        });
        
      } catch (error) {
        fastify.log.error('Erro ao criar cota:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para obter todas as cotas do usuário
    fastify.get('/api/cotas', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;

        const cotas = await prisma.cota.findMany({
          where: { userId },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            valor: true,
            dadosCriptografados: true,
            createdAt: true,
            updatedAt: true
          }
        });

        // Descriptografar dados para exibição (com mascaramento)
        const cotasDescriptografadas = await Promise.all(
          cotas.map(async (cota) => {
            const dadosDescriptografados = await decryptSensitiveData(cota.dadosCriptografados);
            
            return {
              id: cota.id,
              valor: cota.valor,
              nome: dadosDescriptografados?.nome || null,
              cpf: dadosDescriptografados?.cpf ? 
                dadosDescriptografados.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-**') : null,
              temComprovante: !!dadosDescriptografados?.comprovante,
              observacoes: dadosDescriptografados?.observacoes || null,
              createdAt: cota.createdAt,
              updatedAt: cota.updatedAt
            };
          })
        );

        reply.send({ cotas: cotasDescriptografadas });

      } catch (error) {
        fastify.log.error('Erro ao obter cotas:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para obter uma cota especifica
    fastify.get<{ Params: { id: string } }>('/api/cotas/:id', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;
        const { id } = request.params;

        const cota = await prisma.cota.findFirst({
          where : {
            id,
            userId
          }
        });

        if (!cota) {
          return reply.code(404).send({ error: 'Cota não encontrada' });
        }

        // Descriptografar dados
        const dadosDescriptografados = await decryptSensitiveData(cota.dadosCriptografados);

         reply.send({
          cota: {
            id: cota.id,
            valor: cota.valor,
            nome: dadosDescriptografados?.nome || null,
            cpf: dadosDescriptografados?.cpf || null,
            comprovante: dadosDescriptografados?.comprovante || null,
            observacoes: dadosDescriptografados?.observacoes || null,
            createdAt: cota.createdAt,
            updatedAt: cota.updatedAt
          }
        });
      } catch (error) {
        fastify.log.error('Erro ao obter cota:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    })

    // Rota para relatorios (apenas para admins)
    fastify.get('/api/cotas/relatorio', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;

        // Verificar se é admin (você pode implementar uma verificação mais robusta)
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });

        // Exemplo: apenas emails específicos podem gerar relatórios
        const admins = ['revphilippe@ipf.com.br', 'agnaldo_presb@ipf.com.br', 'felipeivo_presb@ipf.com.br', 'gleybs_presb@ipf.com.br'];
        if (!user || !admins.includes(user.email)) {
          return reply.code(403).send({ error: 'Acesso negado' });
        }

        const cotas = await prisma.cota.findMany({
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                email : true,
                name: true
              }
            }
          }
        });

        // Descriptografar dados para o relatório
        const cotasRelatorio = await Promise.all(
          cotas.map(async (cota) => {
            const dadosDescriptografados = await decryptSensitiveData(cota.dadosCriptografados);

            return {
              id: cota.id,
              valor: cota.valor,
              nome: dadosDescriptografados?.nome || 'Anônimo',
              cpf: dadosDescriptografados?.cpf || null,
              observacoes: dadosDescriptografados?.observacoes || null,
              temComprovante: !!dadosDescriptografados?.comprovante,
              usuario: cota.user.name || cota.user.email,
              createdAt: cota.createdAt,
              updatedAt: cota.updatedAt
            };
          })
        );

        // Calcular estatísticas
        const totalArrecadado = cotasRelatorio.reduce((sum, cota) => sum + Number(cota.valor), 0);
        const totalCotas = cotasRelatorio.length;
        const cotasComComprovante = cotasRelatorio.filter(cota => cota.temComprovante).length;

        reply.send({
          estatisticas: {
            totalArrecadado,
            totalCotas,
            cotasComComprovante,
            percentualComprovantes: totalCotas > 0 ? (cotasComComprovante / totalCotas) * 100 : 0
          },
          cotas: cotasRelatorio
        });

      } catch (error) {
        fastify.log.error('Erro ao gerar relatório:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para deletar uma cota
    fastify.delete<{ Params: { id: string } }>('/api/cotas/:id', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;
        const { id } = request.params;

        const cota = await prisma.cota.findFirst({
          where: {
            id,
            userId
          }
        });

        if (!cota) {
          return reply.code(404).send({ error: 'Cota não encontrada' });
        }

        await prisma.cota.delete({
          where : { id }
        });

        reply.send({ message: 'Cota excluida com sucesso' });

      } catch (error) {
        fastify.log.error('Erro ao deletar cota:', error);
        reply.code(500).send({ error: 'Erro interno do servidor' });
      }
    });

    // Rota para atualizar uma cota
    fastify.put<{ Params: { id: string }, Body: any }>('/api/cotas/:id', {
      onRequest: [fastify.authenticate]
    }, async (request, reply) => {
      try {
        const { userId } = request.user as JWTPayload;
        const { id } = request.params;
        const { name, cpf, comprovante, valor, observacoes } = request.body;

        const cota = await prisma.cota.findFirst({
          where: {
            id,
            userId
          }
        });

        if (!cota) {
          return reply.code(404).send({ error: 'Cota não encontrada' });
        }

        // Preparar dados para criptografia
        const dadosSensiveis = {
          nome: name || null,
          cpf: cpf || null,
          comprovante: comprovante || null,
          observacoes: observacoes || null
        };

        // Criptografar dados sensíveis
        const dadosCriptografados = await encryptSensitiveData(dadosSensiveis);

        // Atualizar a cota
        const cotaAtualizada = await prisma.cota.update({
          where: { id },
          data: {
            valor: valor || cota.valor,
            dadosCriptografados,
            updatedAt: new Date()
          }
        });

        reply.send({
          message: 'Cota atualizada com sucesso',
          cota: {
            id: cotaAtualizada.id,
            valor: cotaAtualizada.valor,
            nome: name || null,
            cpf: cpf ? cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.***.***-**') : null,
            temComprovante: !!comprovante,
            createdAt: cotaAtualizada.createdAt,
            updatedAt: cotaAtualizada.updatedAt
          }
        });

      } catch (error) {
        fastify.log.error('Erro ao atualizar cota:', error);
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
    fastify.get('/api/timers/all', async () => {
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
    }>('/api/timers/all', async (request, reply) => {
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
    console.log(`💰 Rotas de cotas disponíveis`);

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

