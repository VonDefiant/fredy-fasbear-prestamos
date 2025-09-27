import express from 'express';
import rateLimit from 'express-rate-limit';
import ecommerceController from '../controllers/ecommerce.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// ===== RATE LIMITING =====

// Rate limiting para operaciones de configuración
const configLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // 30 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas peticiones de configuración. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para operaciones de escritura (más restrictivo)
const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutos
  max: 10, // 10 requests por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones de escritura. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// ===== MIDDLEWARE =====

// Middleware para logging de rutas de e-commerce
router.use((req, res, next) => {
  console.log(`🛒 E-commerce Config API: ${req.method} ${req.path}`);
  console.log(`👤 Usuario: ${req.user?.email || 'No autenticado'}`);
  next();
});

// Aplicar autenticación y autorización a todas las rutas
router.use(authenticateToken);
router.use(requireAdmin);
router.use(configLimiter);

// ===== RUTAS DE CONFIGURACIÓN E-COMMERCE =====

/**
 * GET /api/admin/ecommerce-config
 * Obtiene todas las configuraciones de e-commerce
 * 
 * Query params:
 * - categoria: filtrar por categoría específica
 * - activo: filtrar por estado activo/inactivo
 * 
 * Response: {
 *   success: boolean,
 *   data: ConfiguracionEcommerce[],
 *   message?: string
 * }
 */
router.get('/', ecommerceController.getEcommerceConfig);

/**
 * GET /api/admin/ecommerce-config/categories
 * Obtiene configuraciones agrupadas por categorías
 * 
 * Response: {
 *   success: boolean,
 *   data: {
 *     [categoria]: {
 *       nombre: string,
 *       titulo: string,
 *       configuraciones: ConfiguracionEcommerce[]
 *     }
 *   }
 * }
 */
router.get('/categories', ecommerceController.getConfigByCategories);

/**
 * PUT /api/admin/ecommerce-config/:configId
 * Actualiza una configuración específica de e-commerce
 * 
 * Params:
 * - configId: ID numérico o nombre del parámetro
 * 
 * Body: {
 *   valor: any (requerido),
 *   descripcion?: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: ConfiguracionEcommerce,
 *   message: string
 * }
 */
router.put('/:configId', 
  writeLimiter,
  [
    // Validaciones del cuerpo de la petición
    (req, res, next) => {
      const { valor } = req.body;
      
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "valor" es requerido'
        });
      }
      
      next();
    }
  ],
  ecommerceController.updateEcommerceConfig
);

/**
 * POST /api/admin/ecommerce-config
 * Crea una nueva configuración de e-commerce
 * 
 * Body: {
 *   nombre: string (requerido),
 *   tipo: 'STRING' | 'INTEGER' | 'DECIMAL' | 'BOOLEAN' | 'DATE' | 'TEXT' (requerido),
 *   valor: any (requerido),
 *   descripcion?: string,
 *   categoria?: string
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: ConfiguracionEcommerce,
 *   message: string
 * }
 */
router.post('/', 
  writeLimiter,
  [
    // Validaciones del cuerpo de la petición
    (req, res, next) => {
      const { nombre, tipo, valor } = req.body;
      
      if (!nombre) {
        return res.status(400).json({
          success: false,
          message: 'El campo "nombre" es requerido'
        });
      }
      
      if (!tipo) {
        return res.status(400).json({
          success: false,
          message: 'El campo "tipo" es requerido'
        });
      }
      
      const tiposValidos = ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TEXT'];
      if (!tiposValidos.includes(tipo)) {
        return res.status(400).json({
          success: false,
          message: `Tipo inválido. Tipos válidos: ${tiposValidos.join(', ')}`
        });
      }
      
      if (valor === undefined || valor === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "valor" es requerido'
        });
      }
      
      next();
    }
  ],
  ecommerceController.createEcommerceConfig
);

/**
 * DELETE /api/admin/ecommerce-config/:configId
 * Elimina una configuración de e-commerce
 * 
 * Params:
 * - configId: ID numérico o nombre del parámetro
 * 
 * Response: {
 *   success: boolean,
 *   message: string
 * }
 */
router.delete('/:configId', 
  writeLimiter,
  ecommerceController.deleteEcommerceConfig
);

/**
 * POST /api/admin/ecommerce-config/reset
 * Restaura todas las configuraciones a los valores predeterminados
 * OPERACIÓN PELIGROSA - Requiere confirmación
 * 
 * Body: {
 *   confirmacion: 'RESET_CONFIGURACIONES'
 * }
 * 
 * Response: {
 *   success: boolean,
 *   data: ConfiguracionEcommerce[],
 *   message: string
 * }
 */
router.post('/reset', 
  writeLimiter,
  [
    // Middleware de confirmación para operación peligrosa
    (req, res, next) => {
      const { confirmacion } = req.body;
      
      if (confirmacion !== 'RESET_CONFIGURACIONES') {
        return res.status(400).json({
          success: false,
          message: 'Para restaurar las configuraciones, debes enviar confirmacion: "RESET_CONFIGURACIONES"'
        });
      }
      
      console.log(`⚠️  [ADMIN] Usuario ${req.user?.email} solicitó reset de configuraciones e-commerce`);
      next();
    }
  ],
  ecommerceController.resetToDefaults
);

// ===== RUTAS DE CONFIGURACIONES ESPECÍFICAS =====

/**
 * GET /api/admin/ecommerce-config/payment-methods
 * Obtiene configuraciones específicas de métodos de pago
 */
router.get('/payment-methods', async (req, res) => {
  try {
    console.log('💳 Obteniendo configuraciones de métodos de pago...');
    
    // Reenviar a la función principal con filtro
    req.query.categoria = 'pagos';
    return ecommerceController.getEcommerceConfig(req, res);
    
  } catch (error) {
    console.error('❌ Error obteniendo métodos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de métodos de pago'
    });
  }
});

/**
 * GET /api/admin/ecommerce-config/shipping
 * Obtiene configuraciones específicas de envíos
 */
router.get('/shipping', async (req, res) => {
  try {
    console.log('📦 Obteniendo configuraciones de envíos...');
    
    // Reenviar a la función principal con filtro
    req.query.categoria = 'envios';
    return ecommerceController.getEcommerceConfig(req, res);
    
  } catch (error) {
    console.error('❌ Error obteniendo configuraciones de envíos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de envíos'
    });
  }
});

/**
 * GET /api/admin/ecommerce-config/promotions
 * Obtiene configuraciones específicas de promociones
 */
router.get('/promotions', async (req, res) => {
  try {
    console.log('🎯 Obteniendo configuraciones de promociones...');
    
    // Reenviar a la función principal con filtro
    req.query.categoria = 'promociones';
    return ecommerceController.getEcommerceConfig(req, res);
    
  } catch (error) {
    console.error('❌ Error obteniendo configuraciones de promociones:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo configuraciones de promociones'
    });
  }
});

// ===== MIDDLEWARE DE VALIDACIÓN ESPECÍFICO =====

/**
 * Middleware para validar configuraciones críticas
 */
const validarConfiguracionCritica = (req, res, next) => {
  const { configId } = req.params;
  const { valor } = req.body;
  
  // Validaciones específicas para configuraciones críticas
  const validacionesEspeciales = {
    'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA': (valor) => {
      const num = parseInt(valor);
      return num >= 1 && num <= 50;
    },
    'ECOMMERCE_ENVIOS_COSTO_BASE': (valor) => {
      const num = parseFloat(valor);
      return num >= 0 && num <= 1000;
    },
    'ECOMMERCE_PROMOCIONES_PORCENTAJE_DESCUENTO': (valor) => {
      const num = parseFloat(valor);
      return num >= 0 && num <= 100;
    },
    'ECOMMERCE_POLITICAS_DEVOLUCION': (valor) => {
      const num = parseInt(valor);
      return num >= 0 && num <= 365;
    }
  };
  
  if (validacionesEspeciales[configId]) {
    if (!validacionesEspeciales[configId](valor)) {
      return res.status(400).json({
        success: false,
        message: `Valor inválido para la configuración ${configId}`
      });
    }
  }
  
  next();
};

// Aplicar validación especial a PUT
router.put('/:configId', validarConfiguracionCritica);

// ===== MIDDLEWARE DE ERROR ESPECÍFICO PARA E-COMMERCE =====
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de e-commerce config:', error);
  
  // Error de validación de Prisma
  if (error.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'Ya existe una configuración con ese nombre'
    });
  }
  
  // Error de registro no encontrado
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Configuración no encontrada'
    });
  }
  
  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de configuración e-commerce',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

// ===== RUTA DE DOCUMENTACIÓN =====
if (process.env.NODE_ENV === 'development') {
  router.get('/docs', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Documentación de API E-commerce Config',
      version: '1.0.0',
      endpoints: {
        'GET /': 'Obtiene todas las configuraciones',
        'GET /categories': 'Obtiene configuraciones agrupadas por categorías',
        'GET /payment-methods': 'Obtiene configuraciones de métodos de pago',
        'GET /shipping': 'Obtiene configuraciones de envíos',
        'GET /promotions': 'Obtiene configuraciones de promociones',
        'PUT /:configId': 'Actualiza una configuración específica',
        'POST /': 'Crea una nueva configuración',
        'DELETE /:configId': 'Elimina una configuración',
        'POST /reset': 'Restaura configuraciones predeterminadas'
      },
      rateLimits: {
        general: '30 requests per 15 minutes',
        write: '10 requests per 5 minutes'
      },
      authentication: 'Bearer Token required + Admin role',
      dataTypes: ['STRING', 'INTEGER', 'DECIMAL', 'BOOLEAN', 'DATE', 'TEXT'],
      categories: ['general', 'pagos', 'envios', 'promociones', 'politicas', 'apariencia']
    });
  });
}

export default router;