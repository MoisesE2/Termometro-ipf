import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const admins = [
    { email: 'revphilippe@ipf.com.br', name: 'revphilippe', password: 'senha123' },
    { email: 'agnaldo_presb@ipf.com.br', name: 'agnaldopresb', password: 'senha456' },
    { email: 'felipeivo_presb@ipf.com.br', name: 'felipeivopresb', password: 'senha789' },
    { email: 'gleybs_presb@ipf.com.br', name: 'gleybspresb', password: 'senha123' },
  ];

  for (const admin of admins) {
    const hashed = await bcrypt.hash(admin.password, 10);
    await prisma.user.upsert({
      where: { email: admin.email },
      update: { isAdmin: true, name: admin.name, password: hashed },
      create: { email: admin.email, name: admin.name, password: hashed, isAdmin: true },
    });
  }
}

main()
  .then(() => console.log('Seed finalizado!'))
  .catch((e: unknown) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());