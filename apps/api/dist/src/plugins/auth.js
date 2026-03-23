import fp from 'fastify-plugin';
export default fp(async (fastify) => {
    fastify.decorate('authenticate', async (request, reply) => {
        try {
            await request.jwtVerify();
            const user = request.user;
            request.userData = {
                id: user.sub,
                email: user.email,
                role: user.role,
            };
        }
        catch {
            reply.code(401).send({ message: 'Token inválido ou expirado.' });
        }
    });
    fastify.decorate('authorizeSuperAdmin', async (request, reply) => {
        await fastify.authenticate(request, reply);
        if (reply.sent)
            return;
        if (request.userData?.role !== 'SUPER_ADMIN') {
            reply.code(403).send({ message: 'Acesso permitido apenas para SUPER_ADMIN.' });
        }
    });
});
