const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createAdminUser() {
  try {
    // Dados do administrador
    const adminData = {
      email: 'revphilippe@ipf.com.br',
      name: 'Rev. Philippe',
      password: 'admin123', // Senha temporária - deve ser alterada
      isAdmin: true
    };

    // Verificar se o usuário já existe
    const existingUser = await prisma.user.findUnique({
      where: { email: adminData.email }
    });

    if (existingUser) {
      console.log('✅ Usuário administrador já existe:', adminData.email);
      return;
    }

    // Criptografar a senha
    const hashedPassword = await bcrypt.hash(adminData.password, 10);

    // Criar o usuário administrador
    const adminUser = await prisma.user.create({
      data: {
        email: adminData.email,
        name: adminData.name,
        password: hashedPassword,
        isAdmin: true
      }
    });

    console.log('✅ Usuário administrador criado com sucesso!');
    console.log('📧 Email:', adminUser.email);
    console.log('👤 Nome:', adminUser.name);
    console.log('🔑 Senha temporária:', adminData.password);
    console.log('⚠️  IMPORTANTE: Altere a senha após o primeiro login!');

  } catch (error) {
    console.error('❌ Erro ao criar usuário administrador:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Executar o script
createAdminUser(); 