// ===============================================
// Archivo: BACKEND/src/routes/solicitudes.routes.js
// Rutas para la gestión de solicitudes de empéño
// ===============================================

import express from 'express';
import solicitudesController from '../controllers/solicitudes.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validarSolicitud, validarArchivos } from '../middleware/validators.js';
import { uploadMiddleware } from '../middleware/upload.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting para creación de solicitudes
const solicitudesLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 5, // máximo 5 solicitudes por hora
  message: {
    success: false,
    message: 'Has alcanzado el límite de solicitudes por hora. Intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiting para operaciones generales
const operacionesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 20, // máximo 20 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para logging de rutas de solicitudes
router.use((req, res, next) => {
  console.log(`📝 Solicitudes API: ${req.method} ${req.path}`);
  next();
});

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ===== RUTAS DE INFORMACIÓN =====

/**
 * GET /api/solicitudes/categorias
 * Obtiene todas las categorías de artículos disponibles para empeño
 */
router.get('/categorias', solicitudesController.getCategorias);

// ===== RUTAS DE CONSULTA =====

/**
 * GET /api/solicitudes
 * Obtiene todas las solicitudes del usuario autenticado
 * Query params:
 * - estado: filtrar por estado (pendiente, en_evaluacion, aprobada, rechazada, cancelada)
 * - limite: número máximo de resultados (default: 10)
 * - pagina: página actual (default: 1)
 */
router.get('/', operacionesLimiter, solicitudesController.getMisSolicitudes);

/**
 * GET /api/solicitudes/:solicitudId
 * Obtiene el detalle completo de una solicitud específica
 * Params:
 * - solicitudId: ID de la solicitud
 */
router.get('/:solicitudId', 
  operacionesLimiter,
  validarSolicitud, 
  solicitudesController.getDetalleSolicitud
);

// ===== RUTAS DE CREACIÓN =====

/**
 * POST /api/solicitudes
 * Crea una nueva solicitud de empéño
 * Body (multipart/form-data):
 * - tipoArticulo: ID del tipo de artículo (requerido)
 * - descripcion: descripción del artículo (requerido)
 * - estadoFisico: estado físico del artículo (excelente, bueno, regular, malo)
 * - valorEstimado: valor estimado por el cliente (requerido)
 * - marca: marca del artículo (opcional)
 * - modelo: modelo del artículo (opcional)
 * - especificacionesTecnicas: JSON con especificaciones (opcional)
 * - montoSolicitado: monto del préstamo solicitado (requerido)
 * - plazoMeses: plazo en meses (1-12, requerido)
 * - modalidadPago: modalidad de pago (mensual, semanal)
 * - planPagos: JSON con plan de pagos calculado (opcional)
 * - rangoAvaluo: JSON con rango de avalúo (opcional)
 * - aceptaTerminos: acepta términos y condiciones (requerido, true)
 * - fotos: archivos de fotos del artículo (requerido, máximo 5)
 * - documentoTecnico: documento técnico adicional (opcional, PDF/DOC)
 */
router.post('/',
  solicitudesLimiter,
  uploadMiddleware, // Maneja la subida de archivos
  validarArchivos, // Valida los archivos subidos
  [
    // Validaciones del cuerpo de la petición
    (req, res, next) => {
      const { 
        tipoArticulo, 
        descripcion, 
        valorEstimado, 
        montoSolicitado,
        plazoMeses,
        aceptaTerminos 
      } = req.body;
      
      // Validaciones básicas
      if (!tipoArticulo) {
        return res.status(400).json({
          success: false,
          message: 'El tipo de artículo es requerido'
        });
      }
      
      if (!descripcion || descripcion.trim().length < 10) {
        return res.status(400).json({
          success: false,
          message: 'La descripción debe tener al menos 10 caracteres'
        });
      }
      
      if (!valorEstimado || parseFloat(valorEstimado) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El valor estimado debe ser mayor a 0'
        });
      }
      
      if (!montoSolicitado || parseFloat(montoSolicitado) <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto solicitado debe ser mayor a 0'
        });
      }
      
      if (!plazoMeses || parseInt(plazoMeses) < 1 || parseInt(plazoMeses) > 12) {
        return res.status(400).json({
          success: false,
          message: 'El plazo debe ser entre 1 y 12 meses'
        });
      }
      
      if (aceptaTerminos !== 'true' && aceptaTerminos !== true) {
        return res.status(400).json({
          success: false,
          message: 'Debe aceptar los términos y condiciones'
        });
      }
      
      // Validar que el monto solicitado no exceda el valor estimado
      if (parseFloat(montoSolicitado) > parseFloat(valorEstimado)) {
        return res.status(400).json({
          success: false,
          message: 'El monto solicitado no puede exceder el valor estimado'
        });
      }
      
      // Validar que se subieron fotos
      if (!req.files || !req.files.fotos) {
        return res.status(400).json({
          success: false,
          message: 'Debe subir al menos una foto del artículo'
        });
      }
      
      next();
    }
  ],
  solicitudesController.crearSolicitud
);

// ===== RUTAS DE OPERACIONES =====

/**
 * PUT /api/solicitudes/:solicitudId/cancelar
 * Cancela una solicitud pendiente
 * Params:
 * - solicitudId: ID de la solicitud
 * Body:
 * - motivo: motivo de la cancelación (opcional)
 */
router.put('/:solicitudId/cancelar',
  operacionesLimiter,
  validarSolicitud,
  [
    // Validación de estado
    async (req, res, next) => {
      try {
        const { solicitudId } = req.params;
        const { userId } = req.user;
        
        // Verificar que la solicitud puede ser cancelada
        const { PrismaClient } = await import('@prisma/client');
        const prisma = new PrismaClient();
        
        const solicitud = await prisma.solicitudEmpeno.findFirst({
          where: {
            id: solicitudId,
            usuarioId: userId,
            estado: {
              in: ['pendiente', 'en_evaluacion']
            }
          }
        });
        
        if (!solicitud) {
          return res.status(400).json({
            success: false,
            message: 'La solicitud no puede ser cancelada en su estado actual'
          });
        }
        
        next();
      } catch (error) {
        next(error);
      }
    }
  ],
  solicitudesController.cancelarSolicitud
);

/**
 * POST /api/solicitudes/:solicitudId/aceptar-oferta
 * Acepta la oferta de préstamo para una solicitud aprobada
 * Params:
 * - solicitudId: ID de la solicitud
 * Body:
 * - aceptaCondiciones: confirma que acepta las condiciones (requerido, true)
 */
router.post('/:solicitudId/aceptar-oferta',
  operacionesLimiter,
  validarSolicitud,
  [
    // Validaciones
    (req, res, next) => {
      const { aceptaCondiciones } = req.body;
      
      if (aceptaCondiciones !== true && aceptaCondiciones !== 'true') {
        return res.status(400).json({
          success: false,
          message: 'Debe aceptar las condiciones de la oferta'
        });
      }
      
      next();
    }
  ],
  solicitudesController.aceptarOferta
);

// ===== RUTAS DE UTILIDADES =====

/**
 * GET /api/solicitudes/:solicitudId/fotos/:fotoId
 * Obtiene una foto específica de una solicitud
 * Params:
 * - solicitudId: ID de la solicitud
 * - fotoId: ID de la foto
 */
router.get('/:solicitudId/fotos/:fotoId', 
  operacionesLimiter,
  validarSolicitud,
  async (req, res) => {
    try {
      const { solicitudId, fotoId } = req.params;
      const { userId } = req.user;
      
      console.log(`📸 Obteniendo foto: ${fotoId} de solicitud: ${solicitudId}`);
      
      // Aquí implementarías la lógica para servir la imagen
      // Por ahora retornamos un placeholder
      res.status(200).json({
        success: true,
        message: 'Funcionalidad de fotos en desarrollo',
        data: {
          solicitudId,
          fotoId,
          url: `/uploads/solicitudes/${fotoId}.jpg`
        }
      });
      
    } catch (error) {
      console.error('❌ Error obteniendo foto:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo la foto'
      });
    }
  }
);

/**
 * GET /api/solicitudes/:solicitudId/documento-tecnico
 * Descarga el documento técnico de una solicitud
 * Params:
 * - solicitudId: ID de la solicitud
 */
router.get('/:solicitudId/documento-tecnico',
  operacionesLimiter,
  validarSolicitud,
  async (req, res) => {
    try {
      const { solicitudId } = req.params;
      const { userId } = req.user;
      
      console.log(`📄 Descargando documento técnico de solicitud: ${solicitudId}`);
      
      // Aquí implementarías la lógica para servir el documento
      // Por ahora retornamos un placeholder
      res.status(200).json({
        success: true,
        message: 'Funcionalidad de documentos en desarrollo',
        data: {
          solicitudId,
          tipo: 'documento_tecnico',
          url: `/uploads/solicitudes/documentos/${solicitudId}.pdf`
        }
      });
      
    } catch (error) {
      console.error('❌ Error descargando documento:', error);
      res.status(500).json({
        success: false,
        message: 'Error descargando el documento'
      });
    }
  }
);

// ===== MIDDLEWARE DE ERROR ESPECÍFICO PARA SOLICITUDES =====
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de solicitudes:', error);
  
  // Errores específicos de solicitudes
  if (error.code === 'SOLICITUD_NO_ENCONTRADA') {
    return res.status(404).json({
      success: false,
      message: 'Solicitud no encontrada'
    });
  }
  
  if (error.code === 'SOLICITUD_NO_AUTORIZADA') {
    return res.status(403).json({
      success: false,
      message: 'No tiene autorización para acceder a esta solicitud'
    });
  }
  
  if (error.code === 'LIMITE_ARCHIVOS_EXCEDIDO') {
    return res.status(400).json({
      success: false,
      message: 'Se ha excedido el límite de archivos permitidos'
    });
  }
  
  if (error.code === 'TIPO_ARCHIVO_NO_PERMITIDO') {
    return res.status(400).json({
      success: false,
      message: 'Tipo de archivo no permitido'
    });
  }
  
  if (error.code === 'ARCHIVO_MUY_GRANDE') {
    return res.status(400).json({
      success: false,
      message: 'El archivo es demasiado grande'
    });
  }
  
  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de solicitudes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;