// ===============================================
// Archivo: BACKEND/src/routes/index.js
// Archivo principal de rutas actualizado
// ===============================================

import express from 'express';

// Importar todas las rutas
import homepageRoutes from './homepage.routes.js';
// ... tus otras rutas existentes

const router = express.Router();

// Middleware para logging general
router.use((req, res, next) => {
  console.log(`🌐 API Request: ${req.method} ${req.originalUrl}`);
  next();
});

// ===== REGISTRO DE RUTAS =====

// Homepage routes - NUEVO
router.use('/homepage', homepageRoutes);

// Aquí van tus rutas existentes
// router.use('/auth', authRoutes);
// router.use('/productos', productosRoutes);
// router.use('/prestamos', prestamosRoutes);
// router.use('/tienda', tiendaRoutes);
// router.use('/usuarios', usuariosRoutes);
// router.use('/avaluos', avaluosRoutes);
// router.use('/cobranza', cobranzaRoutes);
// router.use('/pagos', pagosRoutes);
// router.use('/solicitudes', solicitudesRoutes);

// ===== RUTA DE HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ===== RUTA PARA INFO DE LA API =====
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Fredy Fasbear Industries API',
      version: '1.0.0',
      description: 'API para sistema de empeño y tienda en línea',
      endpoints: {
        homepage: '/api/homepage/*',
        health: '/api/health',
        info: '/api/info'
        // Agregar aquí tus otros endpoints
      }
    }
  });
});

// ===== RUTA CATCH-ALL PARA 404 =====
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    suggestion: 'Verifica la URL y el método HTTP',
    availableEndpoints: '/api/info'
  });
});

// ===== MIDDLEWARE DE ERROR GLOBAL =====
router.use((error, req, res, next) => {
  console.error('💥 Error global en API:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

export default router;