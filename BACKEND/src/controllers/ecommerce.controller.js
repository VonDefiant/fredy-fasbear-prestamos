import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // ===== CONFIGURACIONES DE E-COMMERCE =====

  /**
   * GET /api/admin/ecommerce-config
   * Obtiene todas las configuraciones de e-commerce
   */
  async getEcommerceConfig(req, res) {
    try {
      console.log('📊 Obteniendo configuraciones de e-commerce...');

      // Obtener configuraciones específicas de e-commerce desde la base de datos
      const configuraciones = await prisma.parametrosSistema.findMany({
        where: {
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        },
        orderBy: [
          { nombreParametro: 'asc' }
        ]
      });

      // Si no hay configuraciones, crear las predeterminadas
      if (configuraciones.length === 0) {
        console.log('🔧 Creando configuraciones predeterminadas de e-commerce...');
        await crearConfiguracionesPredeterminadas();
        
        // Volver a obtener las configuraciones
        const nuevasConfiguraciones = await prisma.parametrosSistema.findMany({
          where: {
            nombreParametro: {
              startsWith: 'ECOMMERCE_'
            }
          },
          orderBy: [
            { nombreParametro: 'asc' }
          ]
        });
        
        return res.status(200).json({
          success: true,
          data: transformarConfiguraciones(nuevasConfiguraciones),
          message: 'Configuraciones creadas y cargadas exitosamente'
        });
      }

      console.log(`✅ ${configuraciones.length} configuraciones de e-commerce encontradas`);

      res.status(200).json({
        success: true,
        data: transformarConfiguraciones(configuraciones)
      });

    } catch (error) {
      console.error('❌ Error obteniendo configuraciones de e-commerce:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo configuraciones de e-commerce',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  /**
   * PUT /api/admin/ecommerce-config/:configId
   * Actualiza una configuración específica de e-commerce
   */
  async updateEcommerceConfig(req, res) {
    try {
      const { configId } = req.params;
      const { valor, descripcion } = req.body;
      const usuarioId = req.user?.id;

      console.log(`[ADMIN] Actualizando configuración e-commerce ${configId}...`);

      // Validar que se proporcionen los datos necesarios
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El valor es requerido'
        });
      }

      // Buscar la configuración
      const configExistente = await prisma.parametrosSistema.findFirst({
        where: {
          OR: [
            { id: isNaN(configId) ? undefined : parseInt(configId) },
            { nombreParametro: configId }
          ]
        }
      });

      if (!configExistente) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }

      // Validar el tipo de dato
      const valorValidado = validarTipoDato(valor, configExistente.tipoDato);
      if (valorValidado === null) {
        return res.status(400).json({
          success: false,
          message: `Valor inválido para el tipo ${configExistente.tipoDato}`
        });
      }

      // Actualizar la configuración
      const configActualizada = await prisma.parametrosSistema.update({
        where: { id: configExistente.id },
        data: {
          valorParametro: valorValidado.toString(),
          descripcion: descripcion || configExistente.descripcion,
          usuarioModifico: usuarioId ? `usuario_${usuarioId}` : 'admin@system',
          fechaModificacion: new Date()
        }
      });

      console.log('✅ Configuración actualizada:', configExistente.nombreParametro);

      // Ejecutar acciones post-actualización si es necesario
      await ejecutarAccionesPostActualizacion(configExistente.nombreParametro, valorValidado);

      res.status(200).json({
        success: true,
        data: transformarConfiguracion(configActualizada),
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      console.error('[ERROR] Error actualizando configuración:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error actualizando configuración'
      });
    }
  },

  /**
   * POST /api/admin/ecommerce-config
   * Crea una nueva configuración de e-commerce
   */
  async createEcommerceConfig(req, res) {
    try {
      const { nombre, tipo, valor, descripcion, categoria } = req.body;
      const usuarioId = req.user?.id;

      console.log('[ADMIN] Creando nueva configuración e-commerce...');

      // Validaciones
      if (!nombre || !tipo || valor === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, tipo y valor son requeridos'
        });
      }

      // Asegurar que el nombre tenga el prefijo correcto
      const nombreParametro = nombre.startsWith('ECOMMERCE_') ? nombre : `ECOMMERCE_${nombre}`;

      // Verificar que no exista ya
      const existente = await prisma.parametrosSistema.findFirst({
        where: { nombreParametro }
      });

      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una configuración con ese nombre'
        });
      }

      // Validar el tipo de dato
      const valorValidado = validarTipoDato(valor, tipo);
      if (valorValidado === null) {
        return res.status(400).json({
          success: false,
          message: `Valor inválido para el tipo ${tipo}`
        });
      }

      // Crear la configuración
      const nuevaConfig = await prisma.parametrosSistema.create({
        data: {
          nombreParametro,
          tipoDato: tipo,
          valorParametro: valorValidado.toString(),
          descripcion: descripcion || `Configuración de e-commerce: ${nombre}`,
          usuarioModifico: usuarioId ? `usuario_${usuarioId}` : 'admin@system',
          fechaModificacion: new Date(),
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });

      console.log('✅ Nueva configuración creada:', nombreParametro);

      res.status(201).json({
        success: true,
        data: transformarConfiguracion(nuevaConfig),
        message: 'Configuración creada exitosamente'
      });

    } catch (error) {
      console.error('[ERROR] Error creando configuración:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando configuración'
      });
    }
  },

  /**
   * DELETE /api/admin/ecommerce-config/:configId
   * Elimina una configuración de e-commerce
   */
  async deleteEcommerceConfig(req, res) {
    try {
      const { configId } = req.params;

      console.log(`[ADMIN] Eliminando configuración e-commerce ${configId}...`);

      // Buscar la configuración
      const configExistente = await prisma.parametrosSistema.findFirst({
        where: {
          OR: [
            { id: isNaN(configId) ? undefined : parseInt(configId) },
            { nombreParametro: configId }
          ],
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        }
      });

      if (!configExistente) {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }

      // Verificar si es una configuración crítica que no se puede eliminar
      const configuracionesCriticas = [
        'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
        'ECOMMERCE_GENERAL_MONEDA',
        'ECOMMERCE_PAGO_EFECTIVO'
      ];

      if (configuracionesCriticas.includes(configExistente.nombreParametro)) {
        return res.status(400).json({
          success: false,
          message: 'Esta configuración es crítica y no puede ser eliminada'
        });
      }

      // Eliminar la configuración
      await prisma.parametrosSistema.delete({
        where: { id: configExistente.id }
      });

      console.log('✅ Configuración eliminada:', configExistente.nombreParametro);

      res.status(200).json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });

    } catch (error) {
      console.error('[ERROR] Error eliminando configuración:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error eliminando configuración'
      });
    }
  },

  // ===== CONFIGURACIONES ESPECÍFICAS =====

  /**
   * GET /api/admin/ecommerce-config/categories
   * Obtiene configuraciones agrupadas por categorías
   */
  async getConfigByCategories(req, res) {
    try {
      console.log('📊 Obteniendo configuraciones por categorías...');

      const configuraciones = await prisma.parametrosSistema.findMany({
        where: {
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        },
        orderBy: [
          { nombreParametro: 'asc' }
        ]
      });

      const categorias = agruparPorCategorias(configuraciones);

      res.status(200).json({
        success: true,
        data: categorias
      });

    } catch (error) {
      console.error('❌ Error obteniendo configuraciones por categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo configuraciones'
      });
    }
  },

  /**
   * POST /api/admin/ecommerce-config/reset
   * Restaura las configuraciones predeterminadas
   */
  async resetToDefaults(req, res) {
    try {
      console.log('[ADMIN] Restaurando configuraciones predeterminadas...');

      // Eliminar configuraciones existentes
      await prisma.parametrosSistema.deleteMany({
        where: {
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        }
      });

      // Crear configuraciones predeterminadas
      await crearConfiguracionesPredeterminadas();

      // Obtener las nuevas configuraciones
      const configuraciones = await prisma.parametrosSistema.findMany({
        where: {
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        },
        orderBy: [
          { nombreParametro: 'asc' }
        ]
      });

      console.log('✅ Configuraciones restauradas exitosamente');

      res.status(200).json({
        success: true,
        data: transformarConfiguraciones(configuraciones),
        message: 'Configuraciones restauradas a los valores predeterminados'
      });

    } catch (error) {
      console.error('[ERROR] Error restaurando configuraciones:', error);
      res.status(500).json({
        success: false,
        message: 'Error restaurando configuraciones'
      });
    }
  }
};

// ===== FUNCIONES AUXILIARES =====

/**
 * Transforma una configuración de la BD al formato del frontend
 */
function transformarConfiguracion(config) {
  // Extraer categoría del nombre del parámetro
  const categoria = extraerCategoria(config.nombreParametro);
  
  return {
    id: config.nombreParametro, // Usar el nombre como ID único
    nombre: formatearNombre(config.nombreParametro),
    categoria,
    tipo: config.tipoDato,
    valor: config.valorParametro,
    descripcion: config.descripcion,
    activo: true, // Por defecto activo
    usuarioModifico: config.usuarioModifico || 'Sistema',
    fechaModificacion: config.fechaModificacion || config.updatedAt
  };
}

/**
 * Transforma múltiples configuraciones
 */
function transformarConfiguraciones(configuraciones) {
  return configuraciones.map(transformarConfiguracion);
}

/**
 * Extrae la categoría del nombre del parámetro
 */
function extraerCategoria(nombreParametro) {
  const partes = nombreParametro.split('_');
  if (partes.length >= 2) {
    return partes[1].toLowerCase(); // ECOMMERCE_GENERAL_NOMBRE -> general
  }
  return 'general';
}

/**
 * Formatea el nombre del parámetro para mostrar
 */
function formatearNombre(nombreParametro) {
  return nombreParametro
    .replace('ECOMMERCE_', '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Valida que el valor sea del tipo correcto
 */
function validarTipoDato(valor, tipo) {
  switch (tipo) {
    case 'STRING':
    case 'TEXT':
      return typeof valor === 'string' ? valor : String(valor);
    
    case 'INTEGER':
      const intVal = parseInt(valor);
      return !isNaN(intVal) ? intVal : null;
    
    case 'DECIMAL':
      const floatVal = parseFloat(valor);
      return !isNaN(floatVal) ? floatVal : null;
    
    case 'BOOLEAN':
      if (typeof valor === 'boolean') return valor;
      if (valor === 'true' || valor === true) return true;
      if (valor === 'false' || valor === false) return false;
      return null;
    
    case 'DATE':
      const fecha = new Date(valor);
      return !isNaN(fecha.getTime()) ? fecha.toISOString() : null;
    
    default:
      return valor;
  }
}

/**
 * Agrupa configuraciones por categorías
 */
function agruparPorCategorias(configuraciones) {
  const categorias = {};
  
  configuraciones.forEach(config => {
    const categoria = extraerCategoria(config.nombreParametro);
    
    if (!categorias[categoria]) {
      categorias[categoria] = {
        nombre: categoria,
        titulo: formatearCategoria(categoria),
        configuraciones: []
      };
    }
    
    categorias[categoria].configuraciones.push(transformarConfiguracion(config));
  });
  
  return Object.values(categorias);
}

/**
 * Formatea el nombre de la categoría
 */
function formatearCategoria(categoria) {
  const nombres = {
    general: 'Configuraciones Generales',
    pagos: 'Métodos de Pago',
    envios: 'Configuraciones de Envío',
    promociones: 'Promociones y Descuentos',
    politicas: 'Políticas de la Tienda',
    apariencia: 'Apariencia de la Tienda'
  };
  return nombres[categoria] || categoria.charAt(0).toUpperCase() + categoria.slice(1);
}

/**
 * Crea las configuraciones predeterminadas de e-commerce
 */
async function crearConfiguracionesPredeterminadas() {
  const configuracionesPredeterminadas = [
    // Generales
    {
      nombreParametro: 'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
      tipoDato: 'STRING',
      valorParametro: 'Freddy Fasbear Store',
      descripcion: 'Nombre que aparece en la tienda en línea'
    },
    {
      nombreParametro: 'ECOMMERCE_GENERAL_MONEDA',
      tipoDato: 'STRING',
      valorParametro: 'GTQ',
      descripcion: 'Código de moneda para mostrar precios'
    },
    {
      nombreParametro: 'ECOMMERCE_GENERAL_SIMBOLO_MONEDA',
      tipoDato: 'STRING',
      valorParametro: 'Q',
      descripcion: 'Símbolo que se muestra antes del precio'
    },
    {
      nombreParametro: 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA',
      tipoDato: 'INTEGER',
      valorParametro: '12',
      descripcion: 'Número de productos que se muestran por página en el catálogo'
    },
    
    // Métodos de Pago
    {
      nombreParametro: 'ECOMMERCE_PAGOS_EFECTIVO',
      tipoDato: 'BOOLEAN',
      valorParametro: 'true',
      descripcion: 'Permitir pagos en efectivo al recoger el producto'
    },
    {
      nombreParametro: 'ECOMMERCE_PAGOS_TRANSFERENCIA',
      tipoDato: 'BOOLEAN',
      valorParametro: 'true',
      descripcion: 'Permitir pagos por transferencia bancaria'
    },
    {
      nombreParametro: 'ECOMMERCE_PAGOS_TARJETA',
      tipoDato: 'BOOLEAN',
      valorParametro: 'false',
      descripcion: 'Permitir pagos con tarjeta de crédito/débito'
    },
    
    // Envíos
    {
      nombreParametro: 'ECOMMERCE_ENVIOS_COSTO_BASE',
      tipoDato: 'DECIMAL',
      valorParametro: '25.00',
      descripcion: 'Costo base para envíos dentro de la ciudad'
    },
    {
      nombreParametro: 'ECOMMERCE_ENVIOS_GRATIS_MONTO',
      tipoDato: 'DECIMAL',
      valorParametro: '500.00',
      descripcion: 'Monto mínimo de compra para envío gratuito'
    },
    {
      nombreParametro: 'ECOMMERCE_ENVIOS_TIEMPO_ENTREGA',
      tipoDato: 'STRING',
      valorParametro: '2-5 días hábiles',
      descripcion: 'Tiempo estimado de entrega para mostrar al cliente'
    },
    
    // Promociones
    {
      nombreParametro: 'ECOMMERCE_PROMOCIONES_DESCUENTO_TIEMPO',
      tipoDato: 'BOOLEAN',
      valorParametro: 'true',
      descripcion: 'Aplicar descuentos automáticos según tiempo en inventario'
    },
    {
      nombreParametro: 'ECOMMERCE_PROMOCIONES_DIAS_DESCUENTO',
      tipoDato: 'INTEGER',
      valorParametro: '30',
      descripcion: 'Días que debe estar un producto en inventario antes del descuento'
    },
    {
      nombreParametro: 'ECOMMERCE_PROMOCIONES_PORCENTAJE_DESCUENTO',
      tipoDato: 'DECIMAL',
      valorParametro: '10.00',
      descripcion: 'Porcentaje de descuento a aplicar tras el tiempo configurado'
    },
    
    // Políticas
    {
      nombreParametro: 'ECOMMERCE_POLITICAS_DEVOLUCION',
      tipoDato: 'INTEGER',
      valorParametro: '7',
      descripcion: 'Días que tiene el cliente para solicitar devolución'
    },
    {
      nombreParametro: 'ECOMMERCE_POLITICAS_GARANTIA',
      tipoDato: 'INTEGER',
      valorParametro: '30',
      descripcion: 'Días de garantía para productos electrónicos'
    },
    
    // Apariencia
    {
      nombreParametro: 'ECOMMERCE_APARIENCIA_COLOR_PRIMARIO',
      tipoDato: 'STRING',
      valorParametro: '#2563eb',
      descripcion: 'Color principal de la tienda en línea'
    },
    {
      nombreParametro: 'ECOMMERCE_APARIENCIA_BANNER_TEXTO',
      tipoDato: 'TEXT',
      valorParametro: 'Encuentra artículos únicos con precios increíbles',
      descripcion: 'Texto que aparece en el banner principal de la tienda'
    }
  ];

  // Crear cada configuración
  for (const config of configuracionesPredeterminadas) {
    await prisma.parametrosSistema.create({
      data: {
        ...config,
        usuarioModifico: 'admin@system',
        fechaModificacion: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  console.log(`✅ ${configuracionesPredeterminadas.length} configuraciones predeterminadas creadas`);
}

/**
 * Ejecuta acciones adicionales después de actualizar configuraciones
 */
async function ejecutarAccionesPostActualizacion(nombreParametro, valor) {
  switch (nombreParametro) {
    case 'ECOMMERCE_PROMOCIONES_DESCUENTO_TIEMPO':
      if (valor === true) {
        console.log('🎯 Activando sistema de descuentos automáticos...');
        // Aquí podrías activar un job o proceso para aplicar descuentos
      }
      break;
      
    case 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA':
      console.log(`📄 Paginación actualizada a ${valor} productos por página`);
      // Aquí podrías limpiar caché de páginas si usas uno
      break;
      
    default:
      // No hay acciones específicas para esta configuración
      break;
  }
}