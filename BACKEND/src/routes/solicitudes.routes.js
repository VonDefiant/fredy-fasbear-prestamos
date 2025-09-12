// BACKEND/src/routes/solicitudes.routes.js
import express from 'express';
import solicitudesController from '../controllers/solicitudes.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

// Rate limiting para creación de solicitudes
const createSolicitudLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 3, 
  message: {
    success: false,
    message: 'Has excedido el límite de solicitudes por hora. Intenta más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.ip
});

// Middleware para logging
router.use((req, res, next) => {
  console.log(`📋 Solicitudes API: ${req.method} ${req.path}`);
  next();
});

// Todas las rutas requieren autenticación
router.use(authenticateToken);

// ===== RUTAS PÚBLICAS (USUARIOS AUTENTICADOS) =====

/**
 * GET /api/solicitudes
 * Obtener solicitudes del usuario autenticado
 * Query params: page, limit, estado
 */
router.get('/', solicitudesController.getSolicitudesUsuario);

/**
 * GET /api/solicitudes/tipos-articulo
 * Obtener tipos de artículos disponibles para empeñar
 */
router.get('/tipos-articulo', solicitudesController.getTiposArticulo);

/**
 * GET /api/solicitudes/estadisticas
 * Obtener estadísticas de solicitudes del usuario
 */
router.get('/estadisticas', solicitudesController.getEstadisticas);

/**
 * POST /api/solicitudes
 * Crear nueva solicitud de préstamo
 * Rate limited: 3 solicitudes por hora
 */
router.post('/', createSolicitudLimiter, solicitudesController.crearSolicitud);

/**
 * POST /api/solicitudes/upload
 * Subir archivos/fotos para solicitud
 */
router.post('/upload', 
  solicitudesController.upload.fields([
    { name: 'fotosPrenda', maxCount: 5 },
    { name: 'documentosTecnicos', maxCount: 3 }
  ]), 
  async (req, res) => {
    try {
      const files = req.files;
      
      if (!files || Object.keys(files).length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se recibieron archivos'
        });
      }

      const response = {
        fotosPrenda: [],
        documentosTecnicos: []
      };

      if (files.fotosPrenda) {
        response.fotosPrenda = files.fotosPrenda.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          size: file.size,
          url: `/uploads/solicitudes/${file.filename}`
        }));
      }

      if (files.documentosTecnicos) {
        response.documentosTecnicos = files.documentosTecnicos.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          path: file.path,
          size: file.size,
          url: `/uploads/solicitudes/${file.filename}`
        }));
      }

      console.log('[UPLOAD] Archivos subidos:', {
        fotos: response.fotosPrenda.length,
        documentos: response.documentosTecnicos.length
      });

      res.status(200).json({
        success: true,
        message: 'Archivos subidos exitosamente',
        data: response
      });

    } catch (error) {
      console.error('[ERROR] Error subiendo archivos:', error);
      res.status(500).json({
        success: false,
        message: 'Error subiendo archivos'
      });
    }
  }
);

/**
 * GET /api/solicitudes/:id
 * Obtener detalle de una solicitud específica
 */
router.get('/:id', solicitudesController.getSolicitudDetalle);

// ===== RUTAS DE ADMINISTRADOR =====

/**
 * PUT /api/solicitudes/:id/evaluar
 * Evaluar una solicitud (aprobar o rechazar)
 * Solo administradores y evaluadores
 */
router.put('/:id/evaluar', requireAdmin, solicitudesController.evaluarSolicitud);

/**
 * POST /api/solicitudes/tipos-articulo
 * Crear nuevo tipo de artículo (solo administradores)
 */
router.post('/tipos-articulo', requireAdmin, async (req, res) => {
  try {
    const { 
      nombre, 
      porcentajeMinAvaluo, 
      porcentajeMaxAvaluo, 
      requiereElectronico = false 
    } = req.body;

    if (!nombre || !porcentajeMinAvaluo || !porcentajeMaxAvaluo) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser completados'
      });
    }

    if (porcentajeMinAvaluo < 0 || porcentajeMaxAvaluo > 100 || 
        porcentajeMinAvaluo > porcentajeMaxAvaluo) {
      return res.status(400).json({
        success: false,
        message: 'Porcentajes de avalúo inválidos'
      });
    }

    const nuevoTipo = await prisma.tipoArticulo.create({
      data: {
        nombre: nombre.trim(),
        porcentajeMinAvaluo: parseFloat(porcentajeMinAvaluo),
        porcentajeMaxAvaluo: parseFloat(porcentajeMaxAvaluo),
        requiereElectronico: Boolean(requiereElectronico)
      }
    });

    console.log('[ADMIN] Tipo de artículo creado:', nuevoTipo.nombre);

    res.status(201).json({
      success: true,
      message: 'Tipo de artículo creado exitosamente',
      data: { tipoArticulo: nuevoTipo }
    });

  } catch (error) {
    console.error('[ERROR] Error creando tipo:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
});

// ===== MIDDLEWARE DE ERROR =====
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de solicitudes:', error);
  
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Archivo demasiado grande. Máximo 5MB por archivo.'
    });
  }

  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Demasiados archivos. Máximo 5 fotos y 3 documentos.'
    });
  }

  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de solicitudes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
  });
});

export default router;