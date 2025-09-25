import express from 'express';
import homepageRoutes from './homepage.routes.js';
import authRoutes from './auth.routes.js';
import prestamosRoutes from './prestamos.routes.js';  
import solicitudesRoutes from './solicitudes.routes.js';  
import adminRoutes from './admin.routes.js';
import personalRoutes from './personal.routes.js';
import clientsRoutes from './clients.routes.js';

const router = express.Router();

// Middleware para logging general
router.use((req, res, next) => {
  console.log(`🌐 API Request: ${req.method} ${req.originalUrl}`);
  console.log(`📍 IP: ${req.ip}`);
  console.log(`🕐 Timestamp: ${new Date().toISOString()}`);
  next();
});

// ===== REGISTRO DE RUTAS =====

// Rutas públicas (sin autenticación)
router.use('/homepage', homepageRoutes);
router.use('/auth', authRoutes);

// Rutas protegidas (requieren autenticación)
router.use('/prestamos', prestamosRoutes);     
router.use('/solicitudes', solicitudesRoutes); 
router.use('/admin', adminRoutes);
router.use('/personal', personalRoutes);
router.use('/clients', clientsRoutes);  // Corregido: sin /api/ porque ya está en el contexto

// Futuras rutas (placeholders)
// router.use('/productos', productosRoutes);
// router.use('/tienda', tiendaRoutes);
// router.use('/reportes', reportesRoutes);
// router.use('/notificaciones', notificacionesRoutes);

// ===== HEALTH CHECK =====
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'API funcionando correctamente',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    services: {
      database: 'connected',
      storage: 'available',
      auth: 'active',
      admin: 'active',
      personal: 'active'
    }
  });
});

// ===== API INFO =====
router.get('/info', (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      name: 'Fredy Fasbear Prestamos API',
      version: '1.0.0',
      description: 'API para sistema de empeño y préstamos pignoraticios',
      author: 'Fredy Fasbear Industries',
      endpoints: {
        // Rutas públicas
        auth: {
          base: '/api/auth',
          endpoints: [
            'POST /api/auth/register',
            'POST /api/auth/login', 
            'POST /api/auth/logout',
            'GET /api/auth/me',
            'PUT /api/auth/profile',
            'POST /api/auth/change-password'
          ]
        },
        clients: {
          base: '/api/clients',
          endpoints: [
            'GET /api/clients/stats',
            'GET /api/clients',
            'GET /api/clients/:id',
            'POST /api/clients',
            'PUT /api/clients/:id',
            'PUT /api/clients/:id/toggle-status'
          ]
        }, // Agregada coma faltante
        homepage: {
          base: '/api/homepage',
          endpoints: [
            'GET /api/homepage/data',
            'GET /api/homepage/stats',
            'GET /api/homepage/featured-products',
            'POST /api/homepage/contact',
            'POST /api/homepage/newsletter'
          ]
        },
        // Rutas protegidas
        prestamos: {
          base: '/api/prestamos',
          endpoints: [
            'GET /api/prestamos',
            'GET /api/prestamos/estadisticas',
            'GET /api/prestamos/historial',
            'GET /api/prestamos/simulacion',
            'GET /api/prestamos/:prestamoId',
            'POST /api/prestamos/:prestamoId/pagar',
            'POST /api/prestamos/:prestamoId/renovar',
            'GET /api/prestamos/:prestamoId/contrato',
            'GET /api/prestamos/:prestamoId/recibo-pago/:pagoId'
          ]
        },
        solicitudes: {
          base: '/api/solicitudes',
          endpoints: [
            'GET /api/solicitudes/categorias',
            'GET /api/solicitudes',
            'GET /api/solicitudes/:solicitudId',
            'POST /api/solicitudes',
            'PUT /api/solicitudes/:solicitudId/cancelar',
            'POST /api/solicitudes/:solicitudId/aceptar-oferta',
            'GET /api/solicitudes/:solicitudId/fotos/:fotoId',
            'GET /api/solicitudes/:solicitudId/documento-tecnico'
          ]
        },
        personal: {
          base: '/api/personal',
          endpoints: [
            'GET /api/personal/stats',
            'GET /api/personal',
            'GET /api/personal/:id',
            'POST /api/personal',
            'PUT /api/personal/:id',
            'PUT /api/personal/:id/toggle-status'
          ]
        },
        admin: {
          base: '/api/admin',
          endpoints: [
            'GET /api/admin/stats',
            'GET /api/admin/recent-activity',
            'PUT /api/admin/system-parameters/:id'
          ]
        },
        // Rutas de utilidad
        system: {
          base: '/api',
          endpoints: [
            'GET /api/health',
            'GET /api/info'
          ]
        }
      },
      authentication: {
        type: 'JWT Bearer Token',
        header: 'Authorization: Bearer <token>',
        expires: process.env.JWT_EXPIRES_IN || '24h'
      },
      rateLimit: {
        auth: '5 requests per 15 minutes',
        solicitudes: '5 requests per hour',
        general: '100 requests per 15 minutes'
      }
    }
  });
});

// ===== RUTA DE PRUEBA PARA DESARROLLO =====
if (process.env.NODE_ENV === 'development') {
  router.get('/test', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'Endpoint de prueba - Solo disponible en desarrollo',
      data: {
        user: req.user || null,
        headers: req.headers,
        query: req.query,
        body: req.body,
        timestamp: new Date().toISOString()
      }
    });
  });
}

// ===== MANEJO DE RUTAS NO ENCONTRADAS =====
router.use((req, res) => {
  console.log(`❌ Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  
  res.status(404).json({
    success: false,
    message: 'Endpoint no encontrado',
    error: {
      method: req.method,
      path: req.originalUrl,
      suggestion: 'Verifica la documentación de la API en /api/info'
    },
    availableEndpoints: [
      '/api/auth/*',
      '/api/homepage/*', 
      '/api/prestamos/*',
      '/api/solicitudes/*',  // Corregido: eliminada coma duplicada
      '/api/personal/*',
      '/api/admin/*',
      '/api/clients/*',  // Agregado
      '/api/health',
      '/api/info'
    ]
  });
});

// ===== MIDDLEWARE DE ERROR GLOBAL =====
router.use((error, req, res, next) => {
  console.error('❌ Error en API:', error);
  
  // Error de validación de Prisma
  if (error.code === 'P2002') {
    return res.status(400).json({
      success: false,
      message: 'Datos duplicados',
      error: 'Ya existe un registro con estos datos'
    });
  }
  
  // Error de registro no encontrado en Prisma
  if (error.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Registro no encontrado',
      error: 'El recurso solicitado no existe'
    });
  }
  
  // Error de conexión a base de datos
  if (error.code === 'P1001') {
    return res.status(503).json({
      success: false,
      message: 'Servicio no disponible',
      error: 'Error de conexión a la base de datos'
    });
  }
  
  // Error de JWT
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido',
      error: 'El token de autenticación no es válido'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expirado',
      error: 'El token de autenticación ha expirado'
    });
  }
  
  // Error de validación
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Error de validación',
      error: error.message
    });
  }
  
  // Error de límite de archivos
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Archivo muy grande',
      error: 'El archivo excede el tamaño máximo permitido'
    });
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return res.status(400).json({
      success: false,
      message: 'Demasiados archivos',
      error: 'Se ha excedido el número máximo de archivos'
    });
  }
  
  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    error: process.env.NODE_ENV === 'development' ? {
      stack: error.stack,
      details: error
    } : 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    requestId: req.id || 'unknown'
  });
});

export default router;