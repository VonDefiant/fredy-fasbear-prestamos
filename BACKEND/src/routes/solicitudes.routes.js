// ===============================================
// Archivo: BACKEND/src/routes/solicitudes.routes.js
// Rutas para la gestión de solicitudes de empéño - CORREGIDO SEGÚN SCHEMA
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

// GET /api/solicitudes/categorias - CORREGIDO
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

    // CORREGIDO: Formatear los datos correctamente
    const categorias = tiposArticulo.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      porcentajeMinAvaluo: parseFloat(tipo.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(tipo.porcentajeMaxAvaluo),
      requiereElectronico: tipo.requiereElectronico
    }));

    console.log('✅ Categorías procesadas:', categorias);

    // Devolver en formato que espera el frontend
    res.status(200).json({
      success: true,
      data: categorias, // Frontend espera result.data directamente
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías de artículos',
      error: error.message
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
      estadoTexto: solicitud.estado === 'Pendiente' ? 'En revisión' : solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud,
      montoSolicitado: parseFloat(solicitud.articulos[0]?.valorEstimadoCliente || 0),
      articuloPrincipal: solicitud.articulos[0] ? {
        tipo: solicitud.articulos[0].tipoArticulo.nombre,
        descripcion: solicitud.articulos[0].descripcion
      } : null
    }));

    res.status(200).json({
      success: true,
      data: solicitudesFormateadas,
      total: solicitudesFormateadas.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes'
    });
  }
}));

// POST /api/solicitudes - CORREGIDO según schema
router.post('/', catchAsync(async (req, res) => {
  const { userId } = req.user;
  console.log('🆕 Creando nueva solicitud para usuario:', userId);
  
  try {
    const {
      tipoArticulo,
      descripcion,
      estadoFisico,
      valorEstimado,
      marca,
      modelo,
      especificacionesTecnicas,
      montoSolicitado,  // Este es el monto que el usuario quiere
      plazoMeses,
      modalidadPago,
      planPagos,
      rangoAvaluo
    } = req.body;

    console.log('📋 Datos recibidos:', {
      tipoArticulo,
      descripcion: descripcion?.substring(0, 50) + '...',
      valorEstimado,
      montoSolicitado,
      plazoMeses
    });

    // Validaciones básicas
    if (!tipoArticulo || !descripcion || !estadoFisico || !valorEstimado) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos requeridos: tipoArticulo, descripcion, estadoFisico, valorEstimado'
      });
    }

    // Verificar que el tipo de artículo existe
    const tipoArticuloExiste = await prisma.tipoArticulo.findUnique({
      where: { id: parseInt(tipoArticulo) }
    });

    if (!tipoArticuloExiste) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de artículo no válido'
      });
    }

    // CORREGIDO: Crear según el schema correcto
    const resultado = await prisma.$transaction(async (tx) => {
      // 1. Crear la solicitud (solo con campos que existen en el schema)
      const nuevaSolicitud = await tx.solicitudPrestamo.create({
        data: {
          usuarioId: userId,
          estado: 'Pendiente',
          observaciones: `Solicitud automática. Monto solicitado: Q${montoSolicitado || 'No especificado'}. Plazo: ${plazoMeses || 'No especificado'} meses. Plan: ${JSON.stringify(planPagos) || 'No especificado'}`
        }
      });

      // 2. Crear el artículo asociado (con los campos correctos del schema)
      const nuevoArticulo = await tx.articulo.create({
        data: {
          solicitudId: nuevaSolicitud.id,
          tipoArticuloId: parseInt(tipoArticulo),
          descripcion: descripcion,
          marca: marca || null,
          modelo: modelo || null,
          serie: null, // Si no lo envías, será null
          color: null, // Si no lo envías, será null
          estadoFisico: estadoFisico,
          valorEstimadoCliente: parseFloat(valorEstimado), // El valor estimado del cliente
          especificacionesTecnicas: especificacionesTecnicas || null
        }
      });

      return { solicitud: nuevaSolicitud, articulo: nuevoArticulo };
    });

    console.log('✅ Solicitud creada exitosamente:', {
      solicitudId: resultado.solicitud.id,
      articuloId: resultado.articulo.id
    });

    // Respuesta de éxito
    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: {
        solicitudId: resultado.solicitud.id,
        numeroSolicitud: `SOL-2024-${String(resultado.solicitud.id).padStart(6, '0')}`,
        estado: resultado.solicitud.estado,
        fechaSolicitud: resultado.solicitud.fechaSolicitud,
        montoSolicitado: parseFloat(montoSolicitado || valorEstimado),
        articuloId: resultado.articulo.id
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error creando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la solicitud',
      error: error.message
    });
  }
}));

// GET /api/solicitudes/:id - Obtener solicitud específica
router.get('/:id', catchAsync(async (req, res) => {
  const { userId } = req.user;
  const solicitudId = parseInt(req.params.id);

  console.log(`📋 Obteniendo solicitud ${solicitudId} para usuario ${userId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: {
        id: solicitudId,
        usuarioId: userId
      },
      include: {
        articulos: {
          include: {
            tipoArticulo: true
          }
        },
        usuario: {
          select: {
            id: true,
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

    const solicitudDetallada = {
      id: solicitud.id,
      numero: `SOL-2024-${String(solicitud.id).padStart(6, '0')}`,
      estado: solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud,
      fechaEvaluacion: solicitud.fechaEvaluacion,
      observaciones: solicitud.observaciones,
      usuario: {
        nombre: `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
        email: solicitud.usuario.email
      },
      articulos: solicitud.articulos.map(articulo => ({
        id: articulo.id,
        tipo: articulo.tipoArticulo.nombre,
        descripcion: articulo.descripcion,
        marca: articulo.marca,
        modelo: articulo.modelo,
        serie: articulo.serie,
        color: articulo.color,
        estadoFisico: articulo.estadoFisico,
        valorEstimadoCliente: parseFloat(articulo.valorEstimadoCliente || 0),
        especificacionesTecnicas: articulo.especificacionesTecnicas
      }))
    };

    res.status(200).json({
      success: true,
      data: solicitudDetallada,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo la solicitud'
    });
  }
}));

// PUT /api/solicitudes/:id/estado - Actualizar estado de solicitud
router.put('/:id/estado', catchAsync(async (req, res) => {
  const solicitudId = parseInt(req.params.id);
  const { estado, observaciones } = req.body;

  console.log(`🔄 Actualizando estado de solicitud ${solicitudId} a: ${estado}`);

  try {
    const estadosValidos = ['Pendiente', 'Evaluando', 'Aprobada', 'Rechazada', 'Completada'];
    
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado no válido'
      });
    }

    const solicitudActualizada = await prisma.solicitudPrestamo.update({
      where: { id: solicitudId },
      data: {
        estado: estado,
        observaciones: observaciones || null,
        fechaEvaluacion: estado !== 'Pendiente' ? new Date() : null
      }
    });

    res.status(200).json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: {
        id: solicitudActualizada.id,
        estado: solicitudActualizada.estado,
        observaciones: solicitudActualizada.observaciones,
        fechaEvaluacion: solicitudActualizada.fechaEvaluacion
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error actualizando el estado de la solicitud'
    });
  }
}));

// DELETE /api/solicitudes/:id - Cancelar solicitud
router.delete('/:id', catchAsync(async (req, res) => {
  const { userId } = req.user;
  const solicitudId = parseInt(req.params.id);

  console.log(`🗑️ Cancelando solicitud ${solicitudId} para usuario ${userId}`);

  try {
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: {
        id: solicitudId,
        usuarioId: userId,
        estado: 'Pendiente'
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada o no se puede cancelar'
      });
    }

    const solicitudCancelada = await prisma.solicitudPrestamo.update({
      where: { id: solicitudId },
      data: {
        estado: 'Rechazada',
        observaciones: 'Cancelada por el usuario',
        fechaEvaluacion: new Date()
      }
    });

    res.status(200).json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      data: {
        id: solicitudCancelada.id,
        estado: solicitudCancelada.estado
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando la solicitud'
    });
  }
}));

export default router;