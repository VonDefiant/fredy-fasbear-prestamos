// ===============================================
// Archivo: BACKEND/src/routes/solicitudes.routes.js
// Rutas para la gestión de solicitudes de empéño - CORREGIDO
// ===============================================

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { catchAsync } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js'; // IMPORTAR MIDDLEWARE REAL

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para logging
router.use((req, res, next) => {
  console.log(`📝 Solicitudes API: ${req.method} ${req.path}`);
  next();
});

// USAR MIDDLEWARE REAL DE AUTENTICACIÓN
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

    // Formatear los datos correctamente
    const categorias = tiposArticulo.map(tipo => ({
      id: tipo.id,
      nombre: tipo.nombre,
      porcentajeMinAvaluo: parseFloat(tipo.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(tipo.porcentajeMaxAvaluo),
      requiereElectronico: tipo.requiereElectronico
    }));

    console.log('✅ Categorías procesadas:', categorias);

    res.status(200).json({
      success: true,
      data: categorias,
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

// GET /api/solicitudes - CORREGIDO
router.get('/', catchAsync(async (req, res) => {
  // CORREGIDO: Usar req.user.id en lugar de req.user.userId
  const userId = req.user.id;
  const { estado, limite = 10, pagina = 1 } = req.query;
  
  console.log(`📋 Obteniendo solicitudes para usuario: ${userId}`);

  try {
    const whereClause = {
      usuarioId: userId
    };

    if (estado && estado !== 'todos') {
      whereClause.estado = estado.charAt(0).toUpperCase() + estado.slice(1);
    }

    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudPrestamo.findMany({
        where: whereClause,
        include: {
          articulos: {
            include: {
              tipoArticulo: {
                select: {
                  nombre: true
                }
              }
            }
          }
        },
        orderBy: {
          fechaSolicitud: 'desc'
        },
        skip,
        take: parseInt(limite)
      }),
      prisma.solicitudPrestamo.count({ where: whereClause })
    ]);

    const solicitudesFormateadas = solicitudes.map(solicitud => {
      const articulo = solicitud.articulos?.[0];
      return {
        id: solicitud.id,
        numero: `SOL-2024-${String(solicitud.id).padStart(6, '0')}`,
        estado: solicitud.estado,
        fechaSolicitud: solicitud.fechaSolicitud,
        fechaEvaluacion: solicitud.fechaEvaluacion,
        observaciones: solicitud.observaciones,
        articulos: solicitud.articulos.map(art => ({
          id: art.id,
          descripcion: art.descripcion,
          marca: art.marca,
          modelo: art.modelo,
          valorEstimadoCliente: art.valorEstimadoCliente,
          tipoArticulo: art.tipoArticulo?.nombre
        }))
      };
    });

    res.status(200).json({
      success: true,
      data: {
        solicitudes: solicitudesFormateadas,
        paginacion: {
          total,
          pagina: parseInt(pagina),
          limite: parseInt(limite),
          totalPaginas: Math.ceil(total / parseInt(limite))
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// POST /api/solicitudes - CORREGIDO
router.post('/', catchAsync(async (req, res) => {
  // CORREGIDO: Usar req.user.id en lugar de req.user.userId
  const userId = req.user.id;
  const {
    tipoArticulo,
    descripcion,
    estadoFisico,
    valorEstimado,
    marca,
    modelo,
    especificacionesTecnicas,
    montoSolicitado,
    plazoMeses,
    modalidadPago,
    aceptaTerminos
  } = req.body;

  console.log(`🆕 Creando nueva solicitud para usuario: ${userId}`);
  console.log('📋 Datos recibidos:', {
    tipoArticulo,
    descripcion: descripcion?.substring(0, 50) + '...',
    valorEstimado,
    montoSolicitado,
    plazoMeses
  });

  try {
    // Validaciones básicas
    if (!tipoArticulo || !descripcion || !valorEstimado || !montoSolicitado) {
      return res.status(400).json({
        success: false,
        message: 'Faltan campos obligatorios: tipoArticulo, descripcion, valorEstimado, montoSolicitado'
      });
    }

    if (!aceptaTerminos || aceptaTerminos === 'false') {
      return res.status(400).json({
        success: false,
        message: 'Debe aceptar los términos y condiciones'
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

    // Crear la solicitud y el artículo en una transacción
    const result = await prisma.$transaction(async (tx) => {
      // Crear la solicitud
      const nuevaSolicitud = await tx.solicitudPrestamo.create({
        data: {
          usuarioId: userId,
          estado: 'Pendiente',
          observaciones: null
        }
      });

      // Crear el artículo asociado
      const nuevoArticulo = await tx.articulo.create({
        data: {
          solicitudId: nuevaSolicitud.id,
          tipoArticuloId: parseInt(tipoArticulo),
          descripcion: descripcion,
          marca: marca || null,
          modelo: modelo || null,
          serie: null,
          color: null,
          estadoFisico: estadoFisico || 'Bueno',
          valorEstimadoCliente: parseFloat(valorEstimado),
          especificacionesTecnicas: especificacionesTecnicas || null
        }
      });

      return { solicitud: nuevaSolicitud, articulo: nuevoArticulo };
    });

    console.log('✅ Solicitud creada exitosamente:', {
      solicitudId: result.solicitud.id,
      articuloId: result.articulo.id
    });

    res.status(201).json({
      success: true,
      message: 'Solicitud creada exitosamente',
      data: {
        solicitud: {
          id: result.solicitud.id,
          numero: `SOL-2024-${String(result.solicitud.id).padStart(6, '0')}`,
          estado: result.solicitud.estado,
          fechaSolicitud: result.solicitud.fechaSolicitud
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error creando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor al crear la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// GET /api/solicitudes/:id - CORREGIDO
router.get('/:id', catchAsync(async (req, res) => {
  // CORREGIDO: Usar req.user.id en lugar de req.user.userId
  const userId = req.user.id;
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
      message: 'Error obteniendo la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// PUT /api/solicitudes/:id/cancelar - CORREGIDO
router.put('/:id/cancelar', catchAsync(async (req, res) => {
  // CORREGIDO: Usar req.user.id en lugar de req.user.userId
  const userId = req.user.id;
  const solicitudId = parseInt(req.params.id);
  const { motivo } = req.body;

  console.log(`🚫 Cancelando solicitud ${solicitudId} para usuario ${userId}`);

  try {
    const solicitudActualizada = await prisma.solicitudPrestamo.updateMany({
      where: {
        id: solicitudId,
        usuarioId: userId,
        estado: {
          in: ['Pendiente', 'Evaluando']
        }
      },
      data: {
        estado: 'Rechazada',
        observaciones: `Cancelada por el usuario. Motivo: ${motivo || 'No especificado'}`,
        fechaEvaluacion: new Date()
      }
    });

    if (solicitudActualizada.count === 0) {
      return res.status(400).json({
        success: false,
        message: 'No se pudo cancelar la solicitud. Verifica que sea tuya y esté en estado pendiente.'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Solicitud cancelada exitosamente',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// PUT /api/solicitudes/:id/estado - Actualizar estado de solicitud (Admin)
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
        solicitud: {
          id: solicitudActualizada.id,
          estado: solicitudActualizada.estado,
          observaciones: solicitudActualizada.observaciones,
          fechaEvaluacion: solicitudActualizada.fechaEvaluacion
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('❌ Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado de solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

export default router;