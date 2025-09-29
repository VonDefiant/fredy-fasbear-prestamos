import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testLogs() {
  try {
    console.log('Insertando log de prueba con Prisma...');
    
    const log = await prisma.logActividad.create({
      data: {
        usuarioId: 1,
        accion: 'TEST',
        entidad: 'sistema',
        detalles: { test: true },
        ipAddress: '127.0.0.1',
        userAgent: 'Test Script',
        fechaHora: new Date()
      }
    });
    
    console.log('Log creado:', log);
    
    const count = await prisma.logActividad.count();
    console.log('Total de logs:', count);
    
  } catch (error) {
    console.error('ERROR:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testLogs();