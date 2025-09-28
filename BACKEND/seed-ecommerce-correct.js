// ===============================================
// Archivo: BACKEND/seed-ecommerce-correct.js
// Seed correcto para la tabla parametros_sistema
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function crearConfiguracionesEcommerce() {
  console.log('🌱 Creando configuraciones e-commerce en parametros_sistema...');

  try {
    const configuraciones = [
      // CONFIGURACIONES GENERALES
      {
        nombre_parametro: 'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
        valor_parametro: 'Freddy Fasbear Store',
        descripcion: 'Nombre oficial de la tienda en línea',
        tipo_dato: 'STRING',
        id_usuario_modifico: 1, // ID del usuario admin
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_GENERAL_MONEDA',
        valor_parametro: 'GTQ',
        descripcion: 'Moneda utilizada en la tienda (código ISO)',
        tipo_dato: 'STRING',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA',
        valor_parametro: '12',
        descripcion: 'Número de productos mostrados por página en el catálogo',
        tipo_dato: 'INTEGER',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_GENERAL_IVA_INCLUIDO',
        valor_parametro: 'true',
        descripcion: 'Los precios mostrados incluyen IVA',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_GENERAL_PORCENTAJE_IVA',
        valor_parametro: '12.00',
        descripcion: 'Porcentaje de IVA aplicado a los productos',
        tipo_dato: 'DECIMAL',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },

      // MÉTODOS DE PAGO
      {
        nombre_parametro: 'ECOMMERCE_PAGOS_EFECTIVO',
        valor_parametro: 'true',
        descripcion: 'Permitir pagos en efectivo al recoger el producto',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_PAGOS_TRANSFERENCIA',
        valor_parametro: 'true',
        descripcion: 'Permitir pagos por transferencia bancaria',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_PAGOS_TARJETA',
        valor_parametro: 'false',
        descripcion: 'Permitir pagos con tarjeta de crédito/débito',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_PAGOS_DEPOSITO',
        valor_parametro: 'true',
        descripcion: 'Permitir pagos por depósito bancario',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },

      // CONFIGURACIONES DE ENVÍO
      {
        nombre_parametro: 'ECOMMERCE_ENVIOS_COSTO_BASE',
        valor_parametro: '25.00',
        descripcion: 'Costo base para envíos dentro de la ciudad de Guatemala',
        tipo_dato: 'DECIMAL',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_ENVIOS_COSTO_DEPARTAMENTAL',
        valor_parametro: '50.00',
        descripcion: 'Costo de envío a otros departamentos',
        tipo_dato: 'DECIMAL',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_ENVIOS_GRATIS_DESDE',
        valor_parametro: '500.00',
        descripcion: 'Monto mínimo de compra para envío gratuito',
        tipo_dato: 'DECIMAL',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_ENVIOS_TIEMPO_ENTREGA',
        valor_parametro: '2-5 días laborales',
        descripcion: 'Tiempo estimado de entrega en la ciudad',
        tipo_dato: 'STRING',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_ENVIOS_RETIRO_TIENDA',
        valor_parametro: 'true',
        descripcion: 'Permitir retiro en tienda física',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },

      // PROMOCIONES Y DESCUENTOS
      {
        nombre_parametro: 'ECOMMERCE_PROMOCIONES_ACTIVAS',
        valor_parametro: 'true',
        descripcion: 'Habilitar sistema de promociones y descuentos',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_PROMOCIONES_PORCENTAJE_MAXIMO',
        valor_parametro: '50',
        descripcion: 'Descuento máximo permitido en porcentaje',
        tipo_dato: 'INTEGER',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_PROMOCIONES_PRIMERA_COMPRA',
        valor_parametro: '10',
        descripcion: 'Descuento especial para primera compra (%)',
        tipo_dato: 'INTEGER',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_PROMOCIONES_CUPONES',
        valor_parametro: 'true',
        descripcion: 'Permitir uso de cupones de descuento',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },

      // POLÍTICAS DE LA TIENDA
      {
        nombre_parametro: 'ECOMMERCE_POLITICAS_DEVOLUCION_DIAS',
        valor_parametro: '7',
        descripcion: 'Días permitidos para devoluciones después de la compra',
        tipo_dato: 'INTEGER',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_POLITICAS_GARANTIA_DIAS',
        valor_parametro: '30',
        descripcion: 'Días de garantía en productos nuevos',
        tipo_dato: 'INTEGER',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_POLITICAS_CAMBIO_PRODUCTO',
        valor_parametro: 'true',
        descripcion: 'Permitir cambio de productos por talla o modelo',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_POLITICAS_REEMBOLSO_COMPLETO',
        valor_parametro: 'true',
        descripcion: 'Ofrecer reembolso completo en devoluciones válidas',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },

      // CONFIGURACIONES DE APARIENCIA
      {
        nombre_parametro: 'ECOMMERCE_APARIENCIA_TEMA_PRINCIPAL',
        valor_parametro: 'azul',
        descripcion: 'Color principal del tema de la tienda',
        tipo_dato: 'STRING',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_APARIENCIA_PRODUCTOS_DESTACADOS',
        valor_parametro: '8',
        descripcion: 'Número de productos destacados en la página principal',
        tipo_dato: 'INTEGER',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      },
      {
        nombre_parametro: 'ECOMMERCE_APARIENCIA_MOSTRAR_OFERTAS',
        valor_parametro: 'true',
        descripcion: 'Mostrar sección de ofertas en la página principal',
        tipo_dato: 'BOOLEAN',
        id_usuario_modifico: 1,
        fecha_modificacion: new Date(),
        created_at: new Date()
      }
    ];

    console.log(`📦 Insertando ${configuraciones.length} configuraciones...`);

    let creadas = 0;
    let actualizadas = 0;

    for (const config of configuraciones) {
      try {
        // Verificar si ya existe
        const existente = await prisma.parametrosSistema.findUnique({
          where: { nombreParametro: config.nombre_parametro }
        });

        if (existente) {
          console.log(`⚡ Ya existe: ${config.nombre_parametro}`);
          actualizadas++;
        } else {
          await prisma.parametrosSistema.create({
            data: {
              nombreParametro: config.nombre_parametro,
              valorParametro: config.valor_parametro,
              descripcion: config.descripcion,
              tipoDato: config.tipo_dato,
              usuarioModifico: 'admin@system',
              fechaModificacion: config.fecha_modificacion
            }
          });
          console.log(`✅ Creada: ${config.nombre_parametro}`);
          creadas++;
        }
      } catch (error) {
        console.log(`❌ Error con ${config.nombre_parametro}:`, error.message);
      }
    }

    // Verificar total final
    const totalFinal = await prisma.parametrosSistema.count({
      where: {
        nombreParametro: {
          startsWith: 'ECOMMERCE_'
        }
      }
    });

    console.log(`\n🎉 ¡COMPLETADO!`);
    console.log(`📊 Estadísticas:`);
    console.log(`   - Configuraciones creadas: ${creadas}`);
    console.log(`   - Ya existían: ${actualizadas}`);
    console.log(`   - Total en BD: ${totalFinal}`);
    console.log(`\n🔄 Ahora actualiza la página del admin para ver las configuraciones.`);

  } catch (error) {
    console.error('❌ Error general creando configuraciones:', error);
    console.error('Stack:', error.stack);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar el seed
crearConfiguracionesEcommerce();