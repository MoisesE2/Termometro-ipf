import bcrypt from 'bcryptjs';
import { z } from 'zod';
import type { FastifyInstance } from 'fastify';
import { AdminRole } from '@prisma/client';

const createAdminSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  role: z.nativeEnum(AdminRole).optional().default(AdminRole.ADMIN),
});

const updateAdminSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
  role: z.nativeEnum(AdminRole).optional(),
  isActive: z.boolean().optional(),
});

const updatePasswordSchema = z.object({
  password: z.string().min(6),
});

export async function adminUsersRoutes(app: FastifyInstance) {
  app.post('/admin-users', { preHandler: [app.authorizeSuperAdmin] }, async (request, reply) => {
    const parse = createAdminSchema.safeParse(request.body);
    if (!parse.success) return reply.code(400).send({ message: 'Payload inválido.', errors: parse.error.flatten() });

    const { name, email, password, role } = parse.data;
    const existing = await app.prisma.adminUser.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ message: 'E-mail já cadastrado.' });

    const passwordHash = await bcrypt.hash(password, 10);
    const created = await app.prisma.adminUser.create({
      data: { name, email, passwordHash, role },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });

    return reply.code(201).send(created);
  });

  app.get('/admin-users', { preHandler: [app.authorizeSuperAdmin] }, async () => {
    return app.prisma.adminUser.findMany({
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
    });
  });

  app.patch('/admin-users/:id', { preHandler: [app.authorizeSuperAdmin] }, async (request, reply) => {
    const id = z.string().uuid().safeParse((request.params as { id: string }).id);
    if (!id.success) return reply.code(400).send({ message: 'ID inválido.' });

    const parse = updateAdminSchema.safeParse(request.body);
    if (!parse.success) return reply.code(400).send({ message: 'Payload inválido.', errors: parse.error.flatten() });

    try {
      const updated = await app.prisma.adminUser.update({
        where: { id: id.data },
        data: parse.data,
        select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
      });
      return reply.send(updated);
    } catch {
      return reply.code(404).send({ message: 'Admin não encontrado.' });
    }
  });

  app.patch('/admin-users/:id/password', { preHandler: [app.authorizeSuperAdmin] }, async (request, reply) => {
    const id = z.string().uuid().safeParse((request.params as { id: string }).id);
    if (!id.success) return reply.code(400).send({ message: 'ID inválido.' });

    const parse = updatePasswordSchema.safeParse(request.body);
    if (!parse.success) return reply.code(400).send({ message: 'Payload inválido.', errors: parse.error.flatten() });

    const passwordHash = await bcrypt.hash(parse.data.password, 10);

    try {
      await app.prisma.adminUser.update({ where: { id: id.data }, data: { passwordHash } });
      return reply.send({ message: 'Senha atualizada com sucesso.' });
    } catch {
      return reply.code(404).send({ message: 'Admin não encontrado.' });
    }
  });

  app.delete('/admin-users/:id', { preHandler: [app.authorizeSuperAdmin] }, async (request, reply) => {
    const id = z.string().uuid().safeParse((request.params as { id: string }).id);
    if (!id.success) return reply.code(400).send({ message: 'ID inválido.' });

    try {
      await app.prisma.adminUser.update({
        where: { id: id.data },
        data: { isActive: false },
      });
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ message: 'Admin não encontrado.' });
    }
  });
}
