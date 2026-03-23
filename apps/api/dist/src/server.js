import 'dotenv/config';
import Fastify from 'fastify';
import cors from '@fastify/cors';
import jwt from '@fastify/jwt';
import prismaPlugin from './plugins/prisma.js';
import authPlugin from './plugins/auth.js';
import { authRoutes } from './modules/auth/routes.js';
import { adminUsersRoutes } from './modules/admin-users/routes.js';
import { donationRoutes } from './modules/donations/routes.js';
const app = Fastify({ logger: true });
await app.register(cors, {
    origin: process.env.CORS_ORIGIN?.split(',') ?? true,
});
await app.register(jwt, {
    secret: process.env.JWT_SECRET ?? 'change-me',
});
await app.register(prismaPlugin);
await app.register(authPlugin);
app.get('/health', async () => ({ status: 'ok' }));
await app.register(authRoutes);
await app.register(adminUsersRoutes);
await app.register(donationRoutes);
const port = Number(process.env.PORT ?? 3001);
const host = process.env.HOST ?? '0.0.0.0';
app
    .listen({ port, host })
    .then(() => app.log.info(`API rodando na porta ${port}`))
    .catch((error) => {
    app.log.error(error);
    process.exit(1);
});
