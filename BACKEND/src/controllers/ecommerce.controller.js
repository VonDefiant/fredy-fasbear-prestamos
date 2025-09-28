// ===============================================
// BACKEND/src/controllers/ecommerce.controller.js
// Versión con manejo robusto de errores
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['error', 'warn'],
  errorFormat: 'pretty'
});

const transformarConfiguracion = (config) => {
  if (!config) return null;
  
  try {
    return {
      id: config.id || config.idParametro,
      nombre: config.nombreParametro || config.nombre_parametro,
      valor: config.valorParametro || config.valor_parametro,
      descripcion: config.descripcion,
      tipo: config.tipoDato || config.tipo_dato,
      categoria: extraerCategoria(config.nombreParametro || config.nombre_parametro),
      fechaModificacion: config.fechaModificacion || config.fecha_modificacion,
      usuarioModifico: config.usuarioModifico || config.usuario_modifico
    };
  } catch (error) {
    console.error('Error transformando configuración:', error);
    return null;
  }
};

const transformarConfiguraciones = (configs) => {
  if (!Array.isArray(configs)) return [];
  return configs.map(transformarConfiguracion).filter(Boolean);
};

const extraerCategoria = (nombreParametro) => {
  if (!nombreParametro || typeof nombreParametro !== 'string') return 'general';
  
  const nombre = nombreParametro.toUpperCase();
  if (nombre.includes('_GENERAL_')) return 'general';
  if (nombre.includes('_PAGOS_') || nombre.includes('_PAGO_')) return 'pagos';
  if (nombre.includes('_ENVIOS_') || nombre.includes('_ENVIO_')) return 'envios';
  if (nombre.includes('_PROMOCIONES_') || nombre.includes('_DESCUENTO_')) return 'promociones';
  if (nombre.includes('_POLITICAS_') || nombre.includes('_DEVOLUCION_')) return 'politicas';
  if (nombre.includes('_APARIENCIA_') || nombre.includes('_THEME_')) return 'apariencia';
  return 'general';
};

const validarTipoDato = (valor, tipo) => {
  if (valor === null || valor === undefined) return null;
  
  try {
    switch (tipo) {
      case 'STRING':
      case 'TEXT':
        return String(valor);
      
      case 'INTEGER':
        const intVal = parseInt(valor);
        return !isNaN(intVal) ? intVal : null;
      
      case 'DECIMAL':
        const floatVal = parseFloat(valor);
        return !isNaN(floatVal) ? floatVal : null;
      
      case 'BOOLEAN':
        if (typeof valor === 'boolean') return valor;
        if (typeof valor === 'string') {
          return valor.toLowerCase() === 'true' || valor === '1';
        }
        return !!valor;
      
      case 'DATE':
        const date = new Date(valor);
        return !isNaN(date.getTime()) ? date.toISOString() : null;
      
      default:
        return String(valor);
    }
  } catch (error) {
    console.error('Error validando tipo de dato:', error);
    return null;
  }
};

const crearConfiguracionesPredeterminadas = async () => {
  try {
    console.log('🔧 Verificando/creando configuraciones predeterminadas...');
    
    const configuracionesPredeterminadas = [
      {
        nombreParametro: 'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
        valorParametro: 'Freddy Fasbear Store',
        descripcion: 'Nombre oficial de la tienda en línea',
        tipoDato: 'STRING'
      },
      {
        nombreParametro: 'ECOMMERCE_GENERAL_MONEDA',
        valorParametro: 'GTQ',
        descripcion: 'Moneda utilizada en la tienda',
        tipoDato: 'STRING'
      },
      {
        nombreParametro: 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA',
        valorParametro: '12',
        descripcion: 'Número de productos mostrados por página',
        tipoDato: 'INTEGER'
      },
      {
        nombreParametro: 'ECOMMERCE_PAGOS_EFECTIVO',
        valorParametro: 'true',
        descripcion: 'Permitir pagos en efectivo',
        tipoDato: 'BOOLEAN'
      },
      {
        nombreParametro: 'ECOMMERCE_PAGOS_TRANSFERENCIA',
        valorParametro: 'true',
        descripcion: 'Permitir pagos por transferencia',
        tipoDato: 'BOOLEAN'
      }
    ];

    for (const config of configuracionesPredeterminadas) {
      try {
        await prisma.parametrosSistema.upsert({
          where: { nombreParametro: config.nombreParametro },
          update: {},
          create: {
            ...config,
            usuarioModifico: 'admin@system',
            fechaModificacion: new Date()
          }
        });
      } catch (upsertError) {
        console.error(`Error creando configuración ${config.nombreParametro}:`, upsertError);
      }
    }
    
    console.log('✅ Configuraciones predeterminadas verificadas');
  } catch (error) {
    console.error('Error en crearConfiguracionesPredeterminadas:', error);
    throw error;
  }
};

const ecommerceController = {
  async getEcommerceConfig(req, res) {
    try {
      console.log('📊 [ECOMMERCE] Iniciando getEcommerceConfig...');
      
      const { categoria, activo } = req.query;
      
      // Verificar conexión a BD
      await prisma.$connect();
      console.log('✅ Conexión a BD establecida');
      
      // Asegurar configuraciones predeterminadas
      await crearConfiguracionesPredeterminadas();
      
      // Construir filtros
      const where = {
        nombreParametro: {
          startsWith: 'ECOMMERCE_'
        }
      };

      if (categoria) {
        where.nombreParametro.contains = `_${categoria.toUpperCase()}_`;
      }

      console.log('🔍 Consultando configuraciones con filtros:', where);

      const configuraciones = await prisma.parametrosSistema.findMany({
        where,
        orderBy: [
          { nombreParametro: 'asc' }
        ]
      });

      console.log(`📦 Configuraciones encontradas: ${configuraciones.length}`);

      const configuracionesTransformadas = transformarConfiguraciones(configuraciones);
      
      console.log(`✅ Configuraciones transformadas: ${configuracionesTransformadas.length}`);

      const response = {
        success: true,
        data: configuracionesTransformadas,
        total: configuraciones.length,
        filtros: { categoria, activo },
        timestamp: new Date().toISOString()
      };

      console.log('📤 Enviando respuesta exitosa');
      return res.status(200).json(response);

    } catch (error) {
      console.error('❌ [ERROR] Error en getEcommerceConfig:', error);
      console.error('Error stack:', error.stack);
      
      // Determinar el tipo de error y respuesta apropiada
      let statusCode = 500;
      let message = 'Error obteniendo configuraciones de e-commerce';
      let errorCode = 'UNKNOWN_ERROR';

      if (error.code === 'P1001') {
        statusCode = 503;
        message = 'No se puede conectar a la base de datos';
        errorCode = 'DATABASE_CONNECTION_ERROR';
      } else if (error.code === 'P2021') {
        statusCode = 500;
        message = 'La tabla no existe en la base de datos';
        errorCode = 'TABLE_NOT_FOUND';
      } else if (error.message?.includes('Invalid `prisma')) {
        statusCode = 500;
        message = 'Error de configuración de Prisma';
        errorCode = 'PRISMA_CONFIG_ERROR';
      }

      const errorResponse = {
        success: false,
        message,
        code: errorCode,
        timestamp: new Date().toISOString()
      };

      // En desarrollo, incluir más detalles del error
      if (process.env.NODE_ENV === 'development') {
        errorResponse.debug = {
          originalError: error.message,
          code: error.code,
          stack: error.stack
        };
      }

      return res.status(statusCode).json(errorResponse);
    }
  },

  async updateEcommerceConfig(req, res) {
    try {
      console.log('📝 [ECOMMERCE] Iniciando updateEcommerceConfig...');
      
      const { configId } = req.params;
      const { valor, descripcion } = req.body;
      const usuarioId = req.user?.id;

      console.log(`🔧 Actualizando configuración: ${configId}`);

      // Validar entrada
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "valor" es requerido',
          code: 'MISSING_VALUE'
        });
      }

      // Buscar configuración existente
      const configExistente = await prisma.parametrosSistema.findFirst({
        where: {
          OR: [
            { id: !isNaN(parseInt(configId)) ? parseInt(configId) : undefined },
            { nombreParametro: configId }
          ],
          nombreParametro: {
            startsWith: 'ECOMMERCE_'
          }
        }
      });

      if (!configExistente) {
        console.log(`❌ Configuración no encontrada: ${configId}`);
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      // Validar el tipo de dato
      const valorValidado = validarTipoDato(valor, configExistente.tipoDato);
      if (valorValidado === null) {
        return res.status(400).json({
          success: false,
          message: `Valor inválido para el tipo ${configExistente.tipoDato}`,
          code: 'INVALID_VALUE_TYPE'
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

      console.log(`✅ Configuración actualizada: ${configExistente.nombreParametro}`);

      return res.status(200).json({
        success: true,
        data: transformarConfiguracion(configActualizada),
        message: 'Configuración actualizada exitosamente'
      });

    } catch (error) {
      console.error('❌ [ERROR] Error en updateEcommerceConfig:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error actualizando configuración',
        code: 'UPDATE_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      });
    }
  },

  async createEcommerceConfig(req, res) {
    try {
      console.log('➕ [ECOMMERCE] Iniciando createEcommerceConfig...');
      
      const { nombre, tipo, valor, descripcion } = req.body;
      const usuarioId = req.user?.id;

      // Validaciones
      if (!nombre || !tipo || valor === undefined) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, tipo y valor son requeridos',
          code: 'MISSING_REQUIRED_FIELDS'
        });
      }

      const nombreParametro = nombre.startsWith('ECOMMERCE_') ? 
        nombre : `ECOMMERCE_${nombre.toUpperCase()}`;

      // Verificar que no exista
      const existente = await prisma.parametrosSistema.findUnique({
        where: { nombreParametro }
      });

      if (existente) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una configuración con ese nombre',
          code: 'CONFIG_ALREADY_EXISTS'
        });
      }

      // Validar valor
      const valorValidado = validarTipoDato(valor, tipo);
      if (valorValidado === null) {
        return res.status(400).json({
          success: false,
          message: `Valor inválido para el tipo ${tipo}`,
          code: 'INVALID_VALUE_TYPE'
        });
      }

      // Crear configuración
      const nuevaConfig = await prisma.parametrosSistema.create({
        data: {
          nombreParametro,
          valorParametro: valorValidado.toString(),
          descripcion: descripcion || `Configuración ${nombreParametro}`,
          tipoDato: tipo,
          usuarioModifico: usuarioId ? `usuario_${usuarioId}` : 'admin@system',
          fechaModificacion: new Date()
        }
      });

      console.log(`✅ Nueva configuración creada: ${nombreParametro}`);

      return res.status(201).json({
        success: true,
        data: transformarConfiguracion(nuevaConfig),
        message: 'Configuración creada exitosamente'
      });

    } catch (error) {
      console.error('❌ [ERROR] Error en createEcommerceConfig:', error);
      
      if (error.code === 'P2002') {
        return res.status(409).json({
          success: false,
          message: 'Ya existe una configuración con ese nombre',
          code: 'DUPLICATE_CONFIG'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error creando configuración',
        code: 'CREATE_ERROR',
        ...(process.env.NODE_ENV === 'development' && { debug: error.message })
      });
    }
  },

  async deleteEcommerceConfig(req, res) {
    try {
      console.log('🗑️ [ECOMMERCE] Iniciando deleteEcommerceConfig...');
      
      const { configId } = req.params;

      // Buscar configuración
      const configExistente = await prisma.parametrosSistema.findFirst({
        where: {
          OR: [
            { id: !isNaN(parseInt(configId)) ? parseInt(configId) : undefined },
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
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      // Verificar si es crítica
      const configuracionesCriticas = [
        'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
        'ECOMMERCE_GENERAL_MONEDA',
        'ECOMMERCE_PAGOS_EFECTIVO'
      ];

      if (configuracionesCriticas.includes(configExistente.nombreParametro)) {
        return res.status(400).json({
          success: false,
          message: 'Esta configuración es crítica y no puede ser eliminada',
          code: 'CRITICAL_CONFIG_CANNOT_DELETE'
        });
      }

      await prisma.parametrosSistema.delete({
        where: { id: configExistente.id }
      });

      console.log(`✅ Configuración eliminada: ${configExistente.nombreParametro}`);

      return res.status(200).json({
        success: true,
        message: 'Configuración eliminada exitosamente'
      });

    } catch (error) {
      console.error('❌ [ERROR] Error en deleteEcommerceConfig:', error);
      
      if (error.code === 'P2025') {
        return res.status(404).json({
          success: false,
          message: 'Configuración no encontrada',
          code: 'CONFIG_NOT_FOUND'
        });
      }

      return res.status(500).json({
        success: false,
        message: 'Error eliminando configuración',
        code: 'DELETE_ERROR'
      });
    }
  },

  async getConfigByCategories(req, res) {
    try {
      console.log('📁 [ECOMMERCE] Iniciando getConfigByCategories...');
      
      // Delegar a getEcommerceConfig y transformar resultado
      const mockReq = { ...req, query: {} };
      let configuraciones = [];
      
      // Capturar la respuesta de getEcommerceConfig
      const mockRes = {
        status: () => ({
          json: (data) => {
            if (data.success) {
              configuraciones = data.data;
            }
          }
        })
      };
      
      await this.getEcommerceConfig(mockReq, mockRes);
      
      // Agrupar por categorías
      const categorias = {
        general: { nombre: 'general', titulo: 'General', configuraciones: [] },
        pagos: { nombre: 'pagos', titulo: 'Pagos', configuraciones: [] },
        envios: { nombre: 'envios', titulo: 'Envíos', configuraciones: [] },
        promociones: { nombre: 'promociones', titulo: 'Promociones', configuraciones: [] },
        politicas: { nombre: 'politicas', titulo: 'Políticas', configuraciones: [] },
        apariencia: { nombre: 'apariencia', titulo: 'Apariencia', configuraciones: [] }
      };
      
      configuraciones.forEach(config => {
        if (categorias[config.categoria]) {
          categorias[config.categoria].configuraciones.push(config);
        }
      });

      return res.status(200).json({
        success: true,
        data: categorias
      });

    } catch (error) {
      console.error('❌ [ERROR] Error en getConfigByCategories:', error);
      return res.status(500).json({
        success: false,
        message: 'Error obteniendo configuraciones por categorías',
        code: 'CATEGORIES_ERROR'
      });
    }
  },

  async resetToDefaults(req, res) {
    try {
      console.log('🔄 [ECOMMERCE] Iniciando resetToDefaults...');
      
      const { confirmacion } = req.body;

      if (confirmacion !== 'RESET_CONFIGURACIONES') {
        return res.status(400).json({
          success: false,
          message: 'Se requiere confirmación explícita para restaurar configuraciones',
          code: 'CONFIRMATION_REQUIRED'
        });
      }

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

      return res.status(200).json({
        success: true,
        data: transformarConfiguraciones(configuraciones),
        message: 'Configuraciones restauradas a los valores predeterminados',
        total: configuraciones.length
      });

    } catch (error) {
      console.error('❌ [ERROR] Error en resetToDefaults:', error);
      return res.status(500).json({
        success: false,
        message: 'Error restaurando configuraciones predeterminadas',
        code: 'RESET_ERROR'
      });
    }
  }
};

export default ecommerceController;