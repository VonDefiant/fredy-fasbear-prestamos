// ===============================================
// Archivo: BACKEND/setup-database.js
// Script para verificar y configurar la base de datos
// ===============================================

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log('🚀 ====================================');
  console.log('🔧 CONFIGURANDO BASE DE DATOS');
  console.log('🚀 ====================================');

  try {
    // 1. Verificar conexión a la base de datos
    console.log('📡 Verificando conexión a PostgreSQL...');
    await prisma.$connect();
    console.log('✅ Conexión exitosa a la base de datos');

    // 2. Verificar que las tablas existan
    console.log('📋 Verificando estructura de tablas...');
    const tablas = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
      ORDER BY table_name;
    `;
    
    console.log('📊 Tablas encontradas:', tablas.length);
    tablas.forEach(tabla => console.log(`   - ${tabla.table_name}`));

    // 3. Crear usuario administrador si no existe
    console.log('👤 Verificando usuario administrador...');
    
    const adminExiste = await prisma.usuario.findFirst({
      where: { email: 'admin@freddyfasbear.com' }
    });

    if (!adminExiste) {
      console.log('🔨 Creando usuario administrador...');
      const passwordHash = await bcrypt.hash('admin123', 12);
      
      const admin = await prisma.usuario.create({
        data: {
          nombre: 'Administrador',
          apellido: 'Sistema',
          email: 'admin@freddyfasbear.com',
          telefono: '+502-1234-5678',
          direccion: 'Oficina Central Fredy Fasbear Industries',
          tipoUsuario: 'Administrador',
          cedula: '1234567890123',
          passwordHash: passwordHash,
          fechaNacimiento: new Date('1990-01-01')
        }
      });
      console.log('✅ Usuario administrador creado:', admin.email);
    } else {
      console.log('✅ Usuario administrador ya existe:', adminExiste.email);
    }

    // 4. Crear tipos de artículo si no existen
    console.log('📦 Verificando tipos de artículo...');
    
    const tiposExistentes = await prisma.tipoArticulo.count();
    
    if (tiposExistentes === 0) {
      console.log('🔨 Creando tipos de artículo básicos...');
      
      const tiposArticulo = [
        {
          nombre: 'Joyería',
          porcentajeMinAvaluo: 50.00,
          porcentajeMaxAvaluo: 70.00,
          requiereElectronico: false
        },
        {
          nombre: 'Oro',
          porcentajeMinAvaluo: 60.00,
          porcentajeMaxAvaluo: 80.00,
          requiereElectronico: false
        },
        {
          nombre: 'Plata',
          porcentajeMinAvaluo: 40.00,
          porcentajeMaxAvaluo: 60.00,
          requiereElectronico: false
        },
        {
          nombre: 'Celulares',
          porcentajeMinAvaluo: 50.00,
          porcentajeMaxAvaluo: 75.00,
          requiereElectronico: true
        },
        {
          nombre: 'Computadoras',
          porcentajeMinAvaluo: 45.00,
          porcentajeMaxAvaluo: 65.00,
          requiereElectronico: true
        },
        {
          nombre: 'Electrodomésticos',
          porcentajeMinAvaluo: 30.00,
          porcentajeMaxAvaluo: 50.00,
          requiereElectronico: true
        },
        {
          nombre: 'Herramientas',
          porcentajeMinAvaluo: 40.00,
          porcentajeMaxAvaluo: 60.00,
          requiereElectronico: false
        }
      ];

      for (const tipo of tiposArticulo) {
        await prisma.tipoArticulo.create({ data: tipo });
        console.log(`   ✅ Creado: ${tipo.nombre}`);
      }
    } else {
      console.log(`✅ ${tiposExistentes} tipos de artículo ya existen`);
    }

    // 5. Crear parámetros del sistema si no existen
    console.log('⚙️ Verificando parámetros del sistema...');
    
    const parametrosExistentes = await prisma.parametrosSistema.count();
    
    if (parametrosExistentes === 0) {
      console.log('🔨 Creando parámetros básicos del sistema...');
      
      const admin = await prisma.usuario.findFirst({
        where: { tipoUsuario: 'Administrador' }
      });

      const parametros = [
        {
          nombreParametro: 'TASA_INTERES_MENSUAL',
          valorParametro: '5.0',
          descripcion: 'Tasa de interés mensual por defecto',
          tipoDato: 'DECIMAL',
          usuarioModificoId: admin.id
        },
        {
          nombreParametro: 'PLAZO_MAXIMO_MESES',
          valorParametro: '6',
          descripcion: 'Plazo máximo en meses para préstamos',
          tipoDato: 'INTEGER',
          usuarioModificoId: admin.id
        },
        {
          nombreParametro: 'COSTO_ALMACENAMIENTO_DIARIO',
          valorParametro: '2.50',
          descripcion: 'Costo diario de almacenamiento',
          tipoDato: 'DECIMAL',
          usuarioModificoId: admin.id
        },
        {
          nombreParametro: 'NOMBRE_EMPRESA',
          valorParametro: 'Fredy Fasbear Industries',
          descripcion: 'Nombre oficial de la empresa',
          tipoDato: 'STRING',
          usuarioModificoId: admin.id
        }
      ];

      for (const parametro of parametros) {
        await prisma.parametrosSistema.create({ data: parametro });
        console.log(`   ✅ Creado: ${parametro.nombreParametro}`);
      }
    } else {
      console.log(`✅ ${parametrosExistentes} parámetros del sistema ya existen`);
    }

    // 6. Mostrar estadísticas finales
    console.log('\n📊 ESTADÍSTICAS DE LA BASE DE DATOS:');
    console.log('=====================================');
    
    const stats = {
      usuarios: await prisma.usuario.count(),
      tiposArticulo: await prisma.tipoArticulo.count(),
      solicitudes: await prisma.solicitudPrestamo.count(),
      articulos: await prisma.articulo.count(),
      parametros: await prisma.parametrosSistema.count()
    };

    Object.entries(stats).forEach(([tabla, cantidad]) => {
      console.log(`${tabla.padEnd(20)}: ${cantidad}`);
    });

    console.log('\n✅ ====================================');
    console.log('✅ BASE DE DATOS CONFIGURADA CORRECTAMENTE');
    console.log('✅ ====================================');
    console.log('\n💡 CREDENCIALES DE ADMINISTRADOR:');
    console.log('📧 Email: admin@freddyfasbear.com');
    console.log('🔑 Password: admin123');
    console.log('\n🚀 Tu servidor ya puede recibir y guardar solicitudes en la BD!');

  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    console.error('\n🔧 POSIBLES SOLUCIONES:');
    console.error('1. Verifica que PostgreSQL esté corriendo');
    console.error('2. Verifica las credenciales en tu .env');
    console.error('3. Ejecuta: npm run db:generate');
    console.error('4. Ejecuta: npm run db:push');
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el setup
setupDatabase();