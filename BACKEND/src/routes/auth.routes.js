import express from 'express';
import authController from '../controllers/auth.controller.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import rateLimit from 'express-rate-limit';
import { PrismaClient } from '@prisma/client'; 
const prisma = new PrismaClient();  // AGREGAR ESTA LÍNEA
const router = express.Router();

// Rate limiting para login/register
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: {
    success: false,
    message: 'Demasiados intentos de autenticación. Intenta en 15 minutos.'
  },
  standardHeaders: true,
  legacyHeaders: false
});


router.use((req, res, next) => {
  console.log(`🔐 Auth API: ${req.method} ${req.path}`);
  next();
});

router.post('/register', authLimiter, authController.register);

router.post('/login', authLimiter, authController.login);

router.post('/logout', authController.logout);


router.get('/me', authenticateToken, authController.getProfile);

router.put('/profile', authenticateToken, authController.updateProfile);


router.post('/change-password', authenticateToken, authController.changePassword);


router.get('/users', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const users = await prisma.usuario.findMany({
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipoUsuario: true,
        estado: true,
        fechaRegistro: true,
        ultimoAcceso: true
      },
      orderBy: { fechaRegistro: 'desc' }
    });

    res.status(200).json({
      success: true,
      data: { users }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error obteniendo usuarios'
    });
  }
});


router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de auth:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en autenticación',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;