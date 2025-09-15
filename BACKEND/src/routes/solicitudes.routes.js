// ===============================================
// Archivo: BACKEND/src/routes/solicitudes.routes.js
// Rutas para la gestión de solicitudes de empéño - CON BASE DE DATOS
// ===============================================

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../middleware/errorHandler.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware de autenticación temporal (simplificado para desarrollo)
const authenticateToken = (req, res, next) => {
  // Por ahora usamos un usuario temporal, luego conectas tu auth real
  req.user = { userId: 1 }; // ID 1 del usuario administrador que se crea en el seed
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
router.get('/categorias', catchAsync(async (req, res) => {
  console.log('📂 Obteniendo categorías de artículos desde BD');
  
  try {
    // Obtener tipos de artículo de la base de datos
    const tiposArticulo = await prisma.tipoArticulo.findMany({
      where: { estado: 'Activo' },
      select: {
        id: true,
        nombre: true,
        porcentajeMinAvaluo: true,
        porcentajeMaxAvaluo: true,
        requiereElectronico: true
      },
      orderBy: { nombre: 'asc' }
    });

    const categorias = tiposArticulo.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      porcentajeMaximoPrestamo: parseFloat(tipo.porcentajeMaxAvaluo),
      requiereEspecificaciones: tipo.requiereElectronico
    }));

    res.status(200).json({
      success: true,
      data: { categorias },
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías de artículos'
    });
  }
}));

// GET /api/solicitudes
router.get('/', catchAsync(async (req, res) => {
  const { userId } = req.user;
  console.log(`📋 Obteniendo solicitudes para usuario: ${userId}`);

  try {
    const solicitudes = await prisma.solicitudPrestamo.findMany({
      where: { usuarioId: userId },
      include: {
        articulos: {
          include: {
            tipoArticulo: true
          }
        }
      },
      orderBy: { fechaSolicitud: 'desc' }
    });

    const solicitudesFormateadas = solicitudes.map(solicitud => ({
      id: solicitud.id,
      numero: `SOL-2024-${String(solicitud.id).padStart(6, '0')}`,
      estado: solicitud.estado.toLowerCase(),
      estadoTexto: solicitud.estado === 'Pendiente' ? 'Pendiente de Evaluación' : solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud,
      montoSolicitado: solicitud.articulos[0]?.valorEstimadoCliente || 0,
      plazoMeses: 3, // Por defecto, puedes agregar este campo al modelo si necesitas
      articulo: {
        nombre: solicitud.articulos[0]?.descripcion || 'Sin descripción',
        categoria: solicitud.articulos[0]?.tipoArticulo?.nombre || 'Sin categoría',
        valorEstimado: solicitud.articulos[0]?.valorEstimadoCliente || 0
      }
    }));

    res.status(200).json({
      success: true,
      data: {
        solicitudes: solicitudesFormateadas,
        paginacion: { pagina: 1, limite: 10, total: solicitudes.length }
      }
    });
  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes'
    });
  }
}));

// POST /api/solicitudes - GUARDAR EN BASE DE DATOS
router.post('/', catchAsync(async (req, res) => {
  const { userId } = req.user;
  const { 
    tipoArticulo, 
    descripcion, 
    valorEstimado, 
    montoSolicitado, 
    plazoMeses, 
    aceptaTerminos,
    marca,
    modelo,
    serie,
    color,
    estadoFisico
  } = req.body;

  console.log(`📝 Creando nueva solicitud para usuario: ${userId}`);

  // Validaciones básicas
  if (!tipoArticulo || !descripcion || !valorEstimado || !montoSolicitado) {
    return res.status(400).json({
      success: false,
      message: 'Faltan campos obligatorios: tipoArticulo, descripcion, valorEstimado, montoSolicitado'
    });
  }

  if (!aceptaTerminos) {
    return res.status(400).json({
      success: false,
      message: 'Debe aceptar los términos y condiciones'
    });
  }

  try {
    // Verificar que el tipo de artículo exista
    const tipoArticuloExiste = await prisma.tipoArticulo.findFirst({
      where: { 
        id: parseInt(tipoArticulo),
        estado: 'Activo'
      }
    });

    if (!tipoArticuloExiste) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de artículo no válido'
      });
    }

    // Crear la solicitud con transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear la solicitud
      const nuevaSolicitud = await tx.solicitudPrestamo.create({
        data: {
          usuarioId: userId,
          estado: 'Pendiente',
          observaciones: `Solicitud automática - Monto solicitado: Q${montoSolicitado}`
        }
      });

      // 2. Crear el artículo asociado
      const nuevoArticulo = await tx.articulo.create({
        data: {
          solicitudId: nuevaSolicitud.id,
          tipoArticuloId: parseInt(tipoArticulo),
          descripcion,
          marca: marca || null,
          modelo: modelo || null,
          serie: serie || null,
          color: color || null,
          estadoFisico: estadoFisico || 'Bueno',
          valorEstimadoCliente: parseFloat(valorEstimado)
        }
      });

      return { solicitud: nuevaSolicitud, articulo: nuevoArticulo };
    });

    // Generar número de solicitud
    const numeroSolicitud = `SOL-2024-${String(resultado.solicitud.id).padStart(6, '0')}`;

    const respuesta = {
      id: resultado.solicitud.id,
      numero: numeroSolicitud,
      estado: 'pendiente',
      fechaSolicitud: resultado.solicitud.fechaSolicitud,
      montoSolicitado: parseFloat(montoSolicitado),
      plazoMeses: parseInt(plazoMeses) || 3,
      articulo: {
        descripcion: resultado.articulo.descripcion,
        valorEstimado: parseFloat(valorEstimado)
      }
    };

    console.log('✅ Solicitud creada en BD:', numeroSolicitud, 'ID:', resultado.solicitud.id);

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente y guardada en base de datos',
      data: { solicitud: respuesta }
    });

  } catch (error) {
    console.error('❌ Error creando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno creando la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// GET /api/solicitudes/:solicitudId
router.get('/:solicitudId', catchAsync(async (req, res) => {
  const { solicitudId } = req.params;
  const { userId } = req.user;
  
  console.log(`🔍 Obteniendo detalle de solicitud: ${solicitudId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId // Solo puede ver sus propias solicitudes
      },
      include: {
        articulos: {
          include: {
            tipoArticulo: true
          }
        },
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    const solicitudDetalle = {
      id: solicitud.id,
      numero: `SOL-2024-${String(solicitud.id).padStart(6, '0')}`,
      estado: solicitud.estado.toLowerCase(),
      estadoTexto: solicitud.estado === 'Pendiente' ? 'Pendiente de Evaluación' : solicitud.estado,
      fechas: {
        solicitud: solicitud.fechaSolicitud,
        evaluacion: solicitud.fechaEvaluacion,
        respuesta: solicitud.fechaEvaluacion
      },
      montos: {
        solicitado: solicitud.articulos[0]?.valorEstimadoCliente || 0,
        aprobado: null // Se completará cuando haya avalúo
      },
      articulo: {
        nombre: solicitud.articulos[0]?.descripcion || 'Sin descripción',
        descripcion: solicitud.articulos[0]?.descripcion || 'Sin descripción',
        categoria: solicitud.articulos[0]?.tipoArticulo?.nombre || 'Sin categoría',
        valorEstimado: solicitud.articulos[0]?.valorEstimadoCliente || 0,
        marca: solicitud.articulos[0]?.marca,
        modelo: solicitud.articulos[0]?.modelo,
        estado: solicitud.articulos[0]?.estadoFisico
      },
      observaciones: solicitud.observaciones
    };

    res.status(200).json({
      success: true,
      data: { solicitud: solicitudDetalle }
    });

  } catch (error) {
    console.error('❌ Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalle de solicitud'
    });
  }
}));

// PUT /api/solicitudes/:solicitudId/cancelar
router.put('/:solicitudId/cancelar', catchAsync(async (req, res) => {
  const { solicitudId } = req.params;
  const { userId } = req.user;
  const { motivo } = req.body;
  
  console.log(`❌ Cancelando solicitud: ${solicitudId}`);

  try {
    // Verificar que la solicitud existe y pertenece al usuario
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId,
        estado: 'Pendiente' // Solo se pueden cancelar solicitudes pendientes
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no se puede cancelar'
      });
    }

    // Actualizar el estado a rechazada (no hay estado cancelada en el enum)
    const solicitudActualizada = await prisma.solicitudPrestamo.update({
      where: { id: parseInt(solicitudId) },
      data: { 
        estado: 'Rechazada',
        observaciones: `${solicitud.observaciones || ''}\n\nCANCELADA POR USUARIO: ${motivo || 'Sin motivo especificado'} - ${new Date().toLocaleString()}`
      }
    });

    res.status(200).json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: {
        solicitud: {
          id: solicitudActualizada.id,
          estado: 'cancelada',
          fechaCancelacion: new Date()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando la solicitud'
    });
  }
}));

// POST /api/solicitudes/:solicitudId/aceptar-oferta
router.post('/:solicitudId/aceptar-oferta', catchAsync(async (req, res) => {
  const { solicitudId } = req.params;
  const { userId } = req.user;
  const { aceptaCondiciones } = req.body;

  if (!aceptaCondiciones) {
    return res.status(400).json({
      success: false,
      message: 'Debe aceptar las condiciones de la oferta'
    });
  }

  console.log(`✅ Aceptando oferta para solicitud: ${solicitudId}`);

  try {
    // Verificar que la solicitud existe, está aprobada y pertenece al usuario
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId,
        estado: 'Aprobada'
      },
      include: {
        articulos: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no está aprobada'
      });
    }

    // Esta funcionalidad requiere crear el contrato y préstamo
    // Por ahora retornamos un mensaje de desarrollo
    res.status(200).json({
      success: true,
      message: 'Funcionalidad de aceptar oferta en desarrollo',
      data: {
        prestamo: {
          id: `prestamo_temp_${Date.now()}`,
          numero: `PR-2024-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
          montoPrestado: 5000,
          fechaCreacion: new Date()
        }
      }
    });

  } catch (error) {
    console.error('❌ Error aceptando oferta:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando la oferta'
    });
  }
}));

// Manejo de errores específico para solicitudes
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de solicitudes:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de solicitudes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;