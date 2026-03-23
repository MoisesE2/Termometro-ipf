import bcrypt from 'bcryptjs';
import { z } from 'zod';
const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export async function authRoutes(app) {
    app.post('/auth/login', async (request, reply) => {
        const parse = loginSchema.safeParse(request.body);
        if (!parse.success) {
            return reply.code(400).send({ message: 'Payload inválido.', errors: parse.error.flatten() });
        }
        const { email, password } = parse.data;
        const admin = await app.prisma.adminUser.findUnique({ where: { email } });
        if (!admin || !admin.isActive) {
            return reply.code(401).send({ message: 'Credenciais inválidas.' });
        }
        const passwordMatches = await bcrypt.compare(password, admin.passwordHash);
        if (!passwordMatches) {
            return reply.code(401).send({ message: 'Credenciais inválidas.' });
        }
        const token = await reply.jwtSign({ email: admin.email, role: admin.role }, { sub: admin.id, expiresIn: process.env.JWT_EXPIRES_IN ?? '1d' });
        return reply.send({
            token,
            user: {
                id: admin.id,
                name: admin.name,
                email: admin.email,
                role: admin.role,
            },
        });
    });
    app.get('/auth/me', { preHandler: [app.authenticate] }, async (request, reply) => {
        const adminId = request.userData?.id;
        if (!adminId)
            return reply.code(401).send({ message: 'Não autenticado.' });
        const admin = await app.prisma.adminUser.findUnique({
            where: { id: adminId },
            select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true, updatedAt: true },
        });
        if (!admin || !admin.isActive) {
            return reply.code(401).send({ message: 'Usuário inválido.' });
        }
        return reply.send({ user: admin });
    });
}
