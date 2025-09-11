// BACKEND/src/routes/index.js (ACTUALIZAR)
import express from 'express';
import homepageRoutes from './homepage.routes.js';
import authRoutes from './auth.routes.js'; // NUEVO

const router = express.Router();

// Middleware para logging general
router.use((req, res, next) => {
  console.log(`🌐 API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ===== REGISTRO DE RUTAS =====
router.use('/homepage', homepageRoutes);
router.use('/auth', authRoutes); // NUEVO

// Resto de tus rutas...
// router.use('/productos', productosRoutes);
// router.use('/prestamos', prestamosRoutes);
// etc...

// ===== HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== API INFO =====
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Fredy Fasbear Industries API',
      version: '1.0.0',
      description: 'API para sistema de empeño y tienda en línea',
      endpoints: {
        auth: '/api/auth/*',        // NUEVO
        homepage: '/api/homepage/*',
        health: '/api/health',
        info: '/api/info'
      }
    }
  });
});

// Resto del código...
export default router;