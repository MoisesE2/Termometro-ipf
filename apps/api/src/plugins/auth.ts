import fp from 'fastify-plugin';
import type { AdminRole } from '@prisma/client';
import type { JwtPayload } from '../types/auth.js';

export default fp(async (fastify) => {
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify<JwtPayload>();
      const user = request.user as JwtPayload;

      request.userData = {
        id: user.sub,
        email: user.email,
        role: user.role as AdminRole,
      };
    } catch {
      reply.code(401).send({ message: 'Token inválido ou expirado.' });
    }
  });

  fastify.decorate('authorizeSuperAdmin', async (request, reply) => {
    await fastify.authenticate(request, reply);
    if (reply.sent) return;

    if (request.userData?.role !== 'SUPER_ADMIN') {
      reply.code(403).send({ message: 'Acesso permitido apenas para SUPER_ADMIN.' });
    }
  });
});
