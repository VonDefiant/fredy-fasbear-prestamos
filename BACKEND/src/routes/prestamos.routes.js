// ===============================================
// Archivo: BACKEND/src/routes/prestamos.routes.js
// Rutas para la gestión de préstamos/empéños
// ===============================================

import express from 'express';
import prestamosController from '../controllers/prestamos.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validarPrestamo } from '../middleware/validators.js';
import rateLimit from 'express-rate-limit';
import crearPrestamoRoutes from './prestamos.crear.routes.js';

const router = express.Router();

// Rate limiting para operaciones sensibles
const operacionesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 10, // máximo 10 operaciones por ventana
  message: {
    success: false,
    message: 'Demasiadas operaciones. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Middleware para logging de rutas de préstamos
router.use((req, res, next) => {
  console.log(`💰 Prestamos API: ${req.method} ${req.path}`);
  next();
});

// Middleware de autenticación para todas las rutas
router.use(authenticateToken);

// ===== RUTAS DE CONSULTA =====

/**
 * GET /api/prestamos
 * Obtiene todos los préstamos del usuario autenticado
 * Query params:
 * - estado: filtrar por estado (activo, vencido, completado, cancelado)
 * - limite: número máximo de resultados (default: 10)
 * - pagina: página actual (default: 1)
 */
router.get('/', prestamosController.getMisPrestamos);

/**
 * GET /api/prestamos/estadisticas
 * Obtiene estadísticas de préstamos del usuario
 */
router.get('/estadisticas', prestamosController.getEstadisticas);

/**
 * GET /api/prestamos/historial
 * Obtiene el historial completo de préstamos
 * Query params:
 * - fechaInicio: fecha de inicio (ISO string)
 * - fechaFin: fecha de fin (ISO string)
 * - limite: número máximo de resultados (default: 20)
 * - pagina: página actual (default: 1)
 */
router.get('/historial', prestamosController.getHistorial);

/**
 * GET /api/prestamos/simulacion
 * Calcula una simulación de préstamo
 * Query params:
 * - valorArticulo: valor del artículo a empeñar (requerido)
 * - porcentajePrestamo: porcentaje del valor a prestar (default: 50)
 * - plazoMeses: plazo en meses (default: 1)
 */
router.get('/simulacion', prestamosController.calcularSimulacion);

/**
 * GET /api/prestamos/:prestamoId
 * Obtiene el detalle completo de un préstamo específico
 * Params:
 * - prestamoId: ID del préstamo
 */
router.get('/:prestamoId', validarPrestamo, prestamosController.getDetallePrestamo);

// ===== RUTAS DE OPERACIONES =====

/**
 * POST /api/prestamos/:prestamoId/pagar
 * Procesa un pago para un préstamo específico
 * Params:
 * - prestamoId: ID del préstamo
 * Body:
 * - monto: monto del pago (requerido)
 * - metodoPago: método de pago (efectivo, transferencia, tarjeta)
 * - referencia: referencia de la transacción (opcional)
 * - notas: notas adicionales (opcional)
 */
router.post('/:prestamoId/pagar', 
  operacionesLimiter,
  validarPrestamo,
  [
    // Validaciones del cuerpo de la petición
    (req, res, next) => {
      const { monto, metodoPago } = req.body;
      
      if (!monto || monto <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto debe ser mayor a 0'
        });
      }
      
      if (!metodoPago || !['efectivo', 'transferencia', 'tarjeta'].includes(metodoPago)) {
        return res.status(400).json({
          success: false,
          message: 'Método de pago no válido'
        });
      }
      
      next();
    }
  ],
  prestamosController.procesarPago
);

/**
 * POST /api/prestamos/:prestamoId/renovar
 * Renueva un préstamo existente
 * Params:
 * - prestamoId: ID del préstamo
 * Body:
 * - nuevosPlazoMeses: nuevo plazo en meses (requerido)
 * - pagoInicialRenovacion: pago inicial para la renovación (opcional)
 */
router.post('/:prestamoId/renovar',
  operacionesLimiter,
  validarPrestamo,
  [
    // Validaciones del cuerpo de la petición
    (req, res, next) => {
      const { nuevosPlazoMeses } = req.body;
      
      if (!nuevosPlazoMeses || nuevosPlazoMeses < 1 || nuevosPlazoMeses > 12) {
        return res.status(400).json({
          success: false,
          message: 'El plazo debe ser entre 1 y 12 meses'
        });
      }
      
      next();
    }
  ],
  prestamosController.renovarPrestamo
);

// ===== RUTAS DE REPORTE Y DOCUMENTOS =====

/**
 * GET /api/prestamos/:prestamoId/contrato
 * Genera y descarga el contrato de préstamo en PDF
 * Params:
 * - prestamoId: ID del préstamo
 */
router.get('/:prestamoId/contrato', validarPrestamo, async (req, res) => {
  try {
    const { prestamoId } = req.params;
    const { userId } = req.user;
    
    console.log(`📄 Generando contrato para préstamo: ${prestamoId}`);
    
    // Aquí puedes implementar la generación del PDF
    // Por ahora retornamos un placeholder
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de contrato en desarrollo',
      data: {
        prestamoId,
        tipo: 'contrato',
        formato: 'pdf'
      }
    });
    
  } catch (error) {
    console.error('❌ Error generando contrato:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el contrato'
    });
  }
});

/**
 * GET /api/prestamos/:prestamoId/recibo-pago/:pagoId
 * Genera y descarga el recibo de un pago específico
 * Params:
 * - prestamoId: ID del préstamo
 * - pagoId: ID del pago
 */
router.get('/:prestamoId/recibo-pago/:pagoId', validarPrestamo, async (req, res) => {
  try {
    const { prestamoId, pagoId } = req.params;
    const { userId } = req.user;
    
    console.log(`🧾 Generando recibo de pago: ${pagoId} para préstamo: ${prestamoId}`);
    
    // Aquí puedes implementar la generación del recibo
    // Por ahora retornamos un placeholder
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de recibo en desarrollo',
      data: {
        prestamoId,
        pagoId,
        tipo: 'recibo',
        formato: 'pdf'
      }
    });
    
  } catch (error) {
    console.error('❌ Error generando recibo:', error);
    res.status(500).json({
      success: false,
      message: 'Error generando el recibo'
    });
  }
});

// ===== MIDDLEWARE DE ERROR ESPECÍFICO PARA PRÉSTAMOS =====
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de préstamos:', error);
  
  // Errores específicos de préstamos
  if (error.code === 'PRESTAMO_NO_ENCONTRADO') {
    return res.status(404).json({
      success: false,
      message: 'Préstamo no encontrado'
    });
  }
  
  if (error.code === 'PRESTAMO_NO_AUTORIZADO') {
    return res.status(403).json({
      success: false,
      message: 'No tiene autorización para acceder a este préstamo'
    });
  }
  
  if (error.code === 'OPERACION_NO_PERMITIDA') {
    return res.status(400).json({
      success: false,
      message: 'Operación no permitida en el estado actual del préstamo'
    });
  }
  
  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de préstamos',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;