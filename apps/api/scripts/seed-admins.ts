import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { AdminRole, PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/** Contas admin — senhas geradas para primeiro acesso (troque depois no painel). */
const ACCOUNTS: { name: string; email: string; password: string }[] = [
  { name: 'Moises Eduardo', email: 'moises.eduardo@ipbfarol.org', password: 'M0ises@IPF#2026' },
  { name: 'Rev Philippe', email: 'revphilippe@ipbfarol.org', password: 'RevPhilippe@IPF#2026' },
  { name: 'Rev Eduardo', email: 'reveduardo@ipbfarol.org', password: 'RevEduardo@IPF#2026' },
  { name: 'Pb Agnaldo', email: 'pbagnaldo@ipbfarol.org', password: 'PBAgnaldo@IPF#2026' },
  { name: 'Pb Gleybs', email: 'pbgleybs@ipbfarol.org', password: 'PBGleybs@IPF#2026' },
];

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('Defina DATABASE_URL no apps/api/.env');
  }

  console.log('Criando/atualizando contas ADMIN...\n');

  for (const account of ACCOUNTS) {
    const passwordHash = await bcrypt.hash(account.password, 10);
    await prisma.adminUser.upsert({
      where: { email: account.email },
      update: {
        name: account.name,
        passwordHash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
      create: {
        name: account.name,
        email: account.email,
        passwordHash,
        role: AdminRole.ADMIN,
        isActive: true,
      },
    });
    console.log(`${account.email}  →  ${account.password}`);
  }

  console.log('\nConcluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
