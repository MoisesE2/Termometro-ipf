import { z } from 'zod';
import type { FastifyInstance } from 'fastify';

const QUOTA_UNIT_VALUE = 200;

const donationSchema = z.object({
  donorName: z.string().min(2),
  quotaCount: z.number().int().positive(),
  amountPaid: z.number().nonnegative(),
  paymentDate: z.coerce.date(),
});

const donationUpdateSchema = donationSchema.partial();

const bulkDonationsSchema = z.object({
  donations: z.array(donationSchema).min(1).max(500),
});

export async function donationRoutes(app: FastifyInstance) {
  app.post('/donations', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parse = donationSchema.safeParse(request.body);
    if (!parse.success) return reply.code(400).send({ message: 'Payload inválido.', errors: parse.error.flatten() });
    if (!request.userData?.id) return reply.code(401).send({ message: 'Não autenticado.' });

    const created = await app.prisma.donation.create({
      data: {
        donorName: parse.data.donorName,
        quotaCount: parse.data.quotaCount,
        quotaUnitValue: QUOTA_UNIT_VALUE,
        amountPaid: parse.data.amountPaid,
        paymentDate: parse.data.paymentDate,
        createdByAdminId: request.userData.id,
      },
    });

    return reply.code(201).send(created);
  });

  app.post('/donations/bulk', { preHandler: [app.authenticate] }, async (request, reply) => {
    const parsed = bulkDonationsSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({
        message: 'Lista inválida.',
        errors: parsed.error.flatten(),
      });
    }
    if (!request.userData?.id) return reply.code(401).send({ message: 'Não autenticado.' });

    const { donations } = parsed.data;
    const failed: { index: number; donorName?: string; message: string }[] = [];
    let created = 0;

    for (let i = 0; i < donations.length; i++) {
      const d = donations[i];
      try {
        await app.prisma.donation.create({
          data: {
            donorName: d.donorName,
            quotaCount: d.quotaCount,
            quotaUnitValue: QUOTA_UNIT_VALUE,
            amountPaid: d.amountPaid,
            paymentDate: d.paymentDate,
            createdByAdminId: request.userData.id,
          },
        });
        created += 1;
      } catch {
        failed.push({
          index: i,
          donorName: d.donorName,
          message: 'Erro ao gravar no banco.',
        });
      }
    }

    return reply.send({
      created,
      failed,
      total: donations.length,
    });
  });

  app.get('/donations', { preHandler: [app.authenticate] }, async () => {
    return app.prisma.donation.findMany({
      orderBy: { paymentDate: 'desc' },
      include: {
        createdBy: { select: { id: true, name: true, email: true } },
      },
    });
  });

  app.patch('/donations/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = z.string().uuid().safeParse((request.params as { id: string }).id);
    if (!id.success) return reply.code(400).send({ message: 'ID inválido.' });

    const parse = donationUpdateSchema.safeParse(request.body);
    if (!parse.success) return reply.code(400).send({ message: 'Payload inválido.', errors: parse.error.flatten() });

    const data: Record<string, unknown> = {};
    if (parse.data.donorName !== undefined) data.donorName = parse.data.donorName;
    if (parse.data.quotaCount !== undefined) data.quotaCount = parse.data.quotaCount;
    if (parse.data.amountPaid !== undefined) data.amountPaid = parse.data.amountPaid;
    if (parse.data.paymentDate !== undefined) data.paymentDate = parse.data.paymentDate;
    data.quotaUnitValue = QUOTA_UNIT_VALUE;

    try {
      const updated = await app.prisma.donation.update({ where: { id: id.data }, data });
      return reply.send(updated);
    } catch {
      return reply.code(404).send({ message: 'Doação não encontrada.' });
    }
  });

  app.delete('/donations/:id', { preHandler: [app.authenticate] }, async (request, reply) => {
    const id = z.string().uuid().safeParse((request.params as { id: string }).id);
    if (!id.success) return reply.code(400).send({ message: 'ID inválido.' });

    try {
      await app.prisma.donation.delete({ where: { id: id.data } });
      return reply.code(204).send();
    } catch {
      return reply.code(404).send({ message: 'Doação não encontrada.' });
    }
  });

  app.get('/stats/summary', async () => {
    const aggregate = await app.prisma.donation.aggregate({
      _sum: {
        quotaCount: true,
        amountPaid: true,
      },
    });

    return {
      totalQuotas: aggregate._sum.quotaCount ?? 0,
      totalReceived: Number(aggregate._sum.amountPaid ?? 0),
      quotaUnitValue: 200,
    };
  });
}
