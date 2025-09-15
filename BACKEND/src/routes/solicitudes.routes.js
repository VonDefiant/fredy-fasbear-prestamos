// ===============================================
// Archivo: BACKEND/src/routes/solicitudes.routes.js
// Rutas para la gestión de solicitudes de empéño - VERSIÓN MÍNIMA
// ===============================================

import express from 'express';

const router = express.Router();

// Middleware de autenticación temporal (simplificado)
const authenticateToken = (req, res, next) => {
  req.user = { userId: 'temp_user_123' };
  next();
};

// Middleware para logging
router.use((req, res, next) => {
  console.log(`📝 Solicitudes API: ${req.method} ${req.path}`);
  next();
});

// Aplicar autenticación
router.use(authenticateToken);

// ===== RUTAS BÁSICAS =====

// GET /api/solicitudes/categorias
router.get('/categorias', (req, res) => {
  console.log('📂 Obteniendo categorías de artículos');
  
  const categoriasEjemplo = [
    { id: 1, nombre: 'Joyería', porcentajeMaximoPrestamo: 70 },
    { id: 2, nombre: 'Oro', porcentajeMaximoPrestamo: 80 },
    { id: 3, nombre: 'Plata', porcentajeMaximoPrestamo: 60 },
    { id: 4, nombre: 'Celulares', porcentajeMaximoPrestamo: 75, requiereEspecificaciones: true },
    { id: 5, nombre: 'Computadoras', porcentajeMaximoPrestamo: 65, requiereEspecificaciones: true }
  ];

  res.status(200).json({
    success: true,
    data: { categorias: categoriasEjemplo },
    timestamp: new Date().toISOString()
  });
});

// GET /api/solicitudes
router.get('/', (req, res) => {
  const { userId } = req.user;
  console.log(`📋 Obteniendo solicitudes para usuario: ${userId}`);

  const solicitudesEjemplo = [
    {
      id: 'temp_001',
      numero: 'SOL-2024-000001',
      estado: 'pendiente',
      estadoTexto: 'Pendiente de Evaluación',
      fechaSolicitud: new Date('2024-09-01'),
      montoSolicitado: 5000,
      plazoMeses: 3,
      articulo: {
        nombre: 'iPhone 14 Pro',
        categoria: 'Celulares',
        valorEstimado: 8000
      }
    }
  ];

  res.status(200).json({
    success: true,
    data: {
      solicitudes: solicitudesEjemplo,
      paginacion: { pagina: 1, limite: 10, total: 1 }
    }
  });
});

// POST /api/solicitudes
router.post('/', (req, res) => {
  const { userId } = req.user;
  const { tipoArticulo, descripcion, valorEstimado, montoSolicitado, plazoMeses, aceptaTerminos } = req.body;

  console.log(`📝 Creando nueva solicitud para usuario: ${userId}`);

  // Validaciones básicas
  if (!tipoArticulo || !descripcion || !valorEstimado || !montoSolicitado) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios'
    });
  }

  if (!aceptaTerminos) {
    return res.status(400).json({
      success: false,
      message: 'Debe aceptar los términos y condiciones'
    });
  }

  // Generar número de solicitud
  const numeroSolicitud = `SOL-2024-${String(Date.now()).slice(-6)}`;

  // Simular creación exitosa
  const nuevaSolicitud = {
    id: `temp_${Date.now()}`,
    numero: numeroSolicitud,
    estado: 'pendiente',
    fechaSolicitud: new Date(),
    montoSolicitado: parseFloat(montoSolicitado),
    plazoMeses: parseInt(plazoMeses),
    articulo: {
      descripcion,
      valorEstimado: parseFloat(valorEstimado)
    }
  };

  console.log('✅ Solicitud creada:', numeroSolicitud);

  res.status(201).json({
    success: true,
    message: 'Solicitud creada exitosamente',
    data: { solicitud: nuevaSolicitud }
  });
});

// GET /api/solicitudes/:solicitudId
router.get('/:solicitudId', (req, res) => {
  const { solicitudId } = req.params;
  console.log(`🔍 Obteniendo detalle de solicitud: ${solicitudId}`);

  const solicitudDetalle = {
    id: solicitudId,
    numero: 'SOL-2024-000001',
    estado: 'pendiente',
    estadoTexto: 'Pendiente de Evaluación',
    fechas: {
      solicitud: new Date('2024-09-01'),
      respuesta: null
    },
    montos: {
      solicitado: 5000,
      aprobado: null
    },
    articulo: {
      nombre: 'iPhone 14 Pro',
      descripcion: 'iPhone en excelente estado',
      categoria: 'Celulares',
      valorEstimado: 8000
    }
  };

  res.status(200).json({
    success: true,
    data: { solicitud: solicitudDetalle }
  });
});

// PUT /api/solicitudes/:solicitudId/cancelar
router.put('/:solicitudId/cancelar', (req, res) => {
  const { solicitudId } = req.params;
  const { motivo } = req.body;
  
  console.log(`❌ Cancelando solicitud: ${solicitudId}`);

  res.status(200).json({
    success: true,
    message: 'Solicitud cancelada exitosamente',
    data: {
      solicitud: {
        id: solicitudId,
        estado: 'cancelada',
        fechaCancelacion: new Date()
      }
    }
  });
});

// POST /api/solicitudes/:solicitudId/aceptar-oferta
router.post('/:solicitudId/aceptar-oferta', (req, res) => {
  const { solicitudId } = req.params;
  const { aceptaCondiciones } = req.body;

  if (!aceptaCondiciones) {
    return res.status(400).json({
      success: false,
      message: 'Debe aceptar las condiciones de la oferta'
    });
  }

  console.log(`✅ Aceptando oferta para solicitud: ${solicitudId}`);

  res.status(200).json({
    success: true,
    message: 'Oferta aceptada exitosamente',
    data: {
      prestamo: {
        id: `prestamo_${Date.now()}`,
        numero: `PR-2024-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
        montoPrestado: 5000,
        fechaCreacion: new Date()
      }
    }
  });
});

// Manejo de errores
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de solicitudes:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de solicitudes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;