import express from 'express';
import prestamosController from '../controllers/prestamos.controller.js';
import { authenticateToken } from '../middleware/auth.js';
import { validarPrestamo } from '../middleware/validators.js';
import rateLimit from 'express-rate-limit';
import crearPrestamoRoutes from './prestamos.crear.routes.js';

const router = express.Router();

const operacionesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    message: 'Demasiadas operaciones. Intenta en unos minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

router.use((req, res, next) => {
  console.log(`💰 Prestamos API: ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);

router.use(crearPrestamoRoutes);

router.get('/', prestamosController.getMisPrestamos);
router.get('/estadisticas', prestamosController.getEstadisticas);
router.get('/historial', prestamosController.getHistorial);
router.get('/simulacion', prestamosController.calcularSimulacion);
router.get('/:prestamoId', validarPrestamo, prestamosController.getDetallePrestamo);

router.post('/:prestamoId/pagar', 
  operacionesLimiter,
  validarPrestamo,
  [
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

router.post('/:prestamoId/renovar',
  operacionesLimiter,
  validarPrestamo,
  [
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

router.get('/:prestamoId/contrato', validarPrestamo, async (req, res) => {
  try {
    const { prestamoId } = req.params;
    const { userId } = req.user;
    
    console.log(`📄 Generando contrato para préstamo: ${prestamoId}`);
    
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

router.get('/:prestamoId/recibo-pago/:pagoId', validarPrestamo, async (req, res) => {
  try {
    const { prestamoId, pagoId } = req.params;
    const { userId } = req.user;
    
    console.log(`🧾 Generando recibo de pago: ${pagoId} para préstamo: ${prestamoId}`);
    
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

router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de préstamos:', error);
  
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
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de préstamos',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;