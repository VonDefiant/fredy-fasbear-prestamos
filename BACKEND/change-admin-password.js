const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function changePassword() {
  console.log('Iniciando cambio de contraseña...');
  
  try {
    await prisma.$connect();
    console.log('Conexión exitosa');

    const adminId = 5;
    const newPassword = 'FreddyF@sb3ar2024!';
    
    const user = await prisma.usuario.findUnique({
      where: { id_usuario: adminId }
    });

    if (!user) {
      console.log('Usuario no encontrado');
      return;
    }

    console.log('Usuario encontrado:', user.nombre, user.email);

    const newHash = await bcrypt.hash(newPassword, 12);
    console.log('Hash generado');

    await prisma.usuario.update({
      where: { id_usuario: adminId },
      data: {
        passwordHash: newHash
      }
    });

    console.log('Contraseña actualizada exitosamente');
    console.log('Nueva contraseña:', newPassword);

  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

changePassword();