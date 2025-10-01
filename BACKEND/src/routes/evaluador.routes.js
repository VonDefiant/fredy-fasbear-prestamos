import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireEvaluador } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para logging específico de evaluador
router.use((req, res, next) => {
  console.log(`🔍 Evaluador API: ${req.method} ${req.path}`);
  next();
});

// Middleware para proteger todas las rutas
router.use(authenticateToken);
router.use(requireEvaluador);

/**
 * GET /api/evaluador/stats
 * Obtiene estadísticas del evaluador
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo estadísticas del evaluador...');
    const evaluadorId = req.user.userId;

    const [
      totalSolicitudes,
      solicitudesPendientes,
      solicitudesAprobadas,
      solicitudesRechazadas,
      solicitudesHoy,
      avaluosRealizados,
      valorTotalAvaluado,
      valorPromedioAvaluo
    ] = await Promise.all([
      // Total de solicitudes asignadas
      prisma.solicitudPrestamo.count({
        where: {
          Avaluo: {
            some: {
              evaluadorId: evaluadorId
            }
          }
        }
      }),
      
      // Solicitudes pendientes de evaluación
      prisma.solicitudPrestamo.count({
        where: {
          estado: 'Pendiente',
          Avaluo: {
            none: {}
          }
        }
      }),
      
      // Solicitudes aprobadas por este evaluador
      prisma.solicitudPrestamo.count({
        where: {
          estado: 'Aprobada',
          Avaluo: {
            some: {
              evaluadorId: evaluadorId
            }
          }
        }
      }),
      
      // Solicitudes rechazadas por este evaluador
      prisma.solicitudPrestamo.count({
        where: {
          estado: 'Rechazada',
          Avaluo: {
            some: {
              evaluadorId: evaluadorId
            }
          }
        }
      }),
      
      // Solicitudes nuevas hoy
      prisma.solicitudPrestamo.count({
        where: {
          fechaSolicitud: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      }),
      
      // Avalúos realizados por este evaluador
      prisma.avaluo.count({
        where: {
          evaluadorId: evaluadorId
        }
      }),
      
      // Valor total avaluado
      prisma.avaluo.aggregate({
        where: {
          evaluadorId: evaluadorId
        },
        _sum: {
          valorComercial: true
        }
      }),
      
      // Valor promedio de avalúos
      prisma.avaluo.aggregate({
        where: {
          evaluadorId: evaluadorId
        },
        _avg: {
          valorComercial: true
        }
      })
    ]);

    const stats = {
      totalSolicitudes,
      solicitudesPendientes,
      solicitudesAprobadas,
      solicitudesRechazadas,
      solicitudesHoy,
      avaluosRealizados,
      valorTotalAvaluado: valorTotalAvaluado._sum.valorComercial || 0,
      valorPromedioAvaluo: valorPromedioAvaluo._avg.valorComercial || 0,
      tasaAprobacion: totalSolicitudes > 0 
        ? ((solicitudesAprobadas / totalSolicitudes) * 100).toFixed(1)
        : 0
    };

    console.log('[EVALUADOR] Estadísticas obtenidas:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/evaluador/solicitudes
 * Obtiene todas las solicitudes pendientes de evaluación
 */
router.get('/solicitudes', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo solicitudes pendientes...');
    
    const { estado, limite = 20, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const where = {
      ...(estado && estado !== 'todas' && { estado: estado })
    };

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudPrestamo.findMany({
        where,
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          },
          Articulo: {
            include: {
              tipoArticulo: true
            }
          },
          Avaluo: {
            include: {
              evaluador: {
                select: {
                  nombre: true,
                  apellido: true
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
      
      prisma.solicitudPrestamo.count({ where })
    ]);

    console.log(`[EVALUADOR] ${solicitudes.length} solicitudes obtenidas`);

    res.status(200).json({
      success: true,
      data: solicitudes,
      pagination: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/evaluador/solicitudes/:id
 * Obtiene el detalle completo de una solicitud
 */
router.get('/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`[EVALUADOR] Obteniendo detalle de solicitud #${id}...`);

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            direccion: true,
            cedula: true
          }
        },
        Articulo: {
          include: {
            tipoArticulo: true,
            Avaluo: {
              include: {
                evaluador: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            }
          }
        },
        Contrato: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    console.log('[EVALUADOR] Solicitud encontrada');

    res.status(200).json({
      success: true,
      data: solicitud
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/evaluador/solicitudes/:id/evaluar
 * Evalúa una solicitud y crea el avalúo
 */
router.post('/solicitudes/:id/evaluar', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluadorId = req.user.userId;
    const { 
      valorComercial, 
      porcentajeAplicado, 
      observaciones,
      estado // 'Aprobada' o 'Rechazada'
    } = req.body;

    console.log(`[EVALUADOR] Evaluando solicitud #${id}...`);

    // Validaciones
    if (!valorComercial || valorComercial <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El valor comercial debe ser mayor a 0'
      });
    }

    if (!porcentajeAplicado || porcentajeAplicado <= 0 || porcentajeAplicado > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje debe estar entre 0 y 100'
      });
    }

    if (!estado || !['Aprobada', 'Rechazada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser Aprobada o Rechazada'
      });
    }

    // Verificar que la solicitud existe y está pendiente
    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) },
      include: {
        Articulo: true
      }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    if (solicitud.estado !== 'Pendiente') {
      return res.status(400).json({
        success: false,
        message: `La solicitud ya fue evaluada (${solicitud.estado})`
      });
    }

    // Calcular monto del préstamo
    const montoPrestamo = (parseFloat(valorComercial) * parseFloat(porcentajeAplicado)) / 100;

    // Crear avalúo y actualizar solicitud en una transacción
    const resultado = await prisma.$transaction(async (tx) => {
      // Crear avalúo para el primer artículo
      const articuloId = solicitud.Articulo[0]?.id;
      
      if (!articuloId) {
        throw new Error('No hay artículos en la solicitud');
      }

      const avaluo = await tx.avaluo.create({
        data: {
          articuloId,
          evaluadorId,
          valorComercial: parseFloat(valorComercial),
          porcentajeAplicado: parseFloat(porcentajeAplicado),
          montoPrestamo: parseFloat(montoPrestamo),
          observaciones: observaciones || null
        }
      });

      // Actualizar estado de la solicitud
      const solicitudActualizada = await tx.solicitudPrestamo.update({
        where: { id: parseInt(id) },
        data: {
          estado,
          fechaEvaluacion: new Date(),
          observaciones: estado === 'Rechazada' ? observaciones : null
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true
            }
          },
          Articulo: {
            include: {
              tipoArticulo: true,
              Avaluo: {
                include: {
                  evaluador: {
                    select: {
                      nombre: true,
                      apellido: true
                    }
                  }
                }
              }
            }
          }
        }
      });

      return { avaluo, solicitud: solicitudActualizada };
    });

    console.log(`[EVALUADOR] Solicitud #${id} evaluada exitosamente como ${estado}`);

    res.status(200).json({
      success: true,
      message: `Solicitud ${estado.toLowerCase()} exitosamente`,
      data: resultado
    });

  } catch (error) {
    console.error('[EVALUADOR] Error evaluando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error al evaluar solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/evaluador/recent-activity
 * Obtiene la actividad reciente del evaluador
 */
router.get('/recent-activity', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo actividad reciente...');
    const evaluadorId = req.user.userId;

    const actividadReciente = await prisma.avaluo.findMany({
      where: {
        evaluadorId: evaluadorId
      },
      include: {
        articulo: {
          include: {
            solicitud: {
              include: {
                usuario: {
                  select: {
                    nombre: true,
                    apellido: true
                  }
                }
              }
            },
            tipoArticulo: true
          }
        }
      },
      orderBy: {
        fechaAvaluo: 'desc'
      },
      take: 10
    });

    const actividad = actividadReciente.map(avaluo => ({
      id: avaluo.id,
      tipo: 'avaluo',
      descripcion: `Avalúo de ${avaluo.articulo.tipoArticulo.nombre} - ${avaluo.articulo.descripcion}`,
      cliente: `${avaluo.articulo.solicitud.usuario.nombre} ${avaluo.articulo.solicitud.usuario.apellido}`,
      monto: avaluo.montoPrestamo,
      fecha: avaluo.fechaAvaluo,
      estado: avaluo.articulo.solicitud.estado
    }));

    res.status(200).json({
      success: true,
      data: actividad
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/evaluador/mis-avaluos
 * Obtiene el historial de avalúos realizados por el evaluador
 */
router.get('/mis-avaluos', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo historial de avalúos...');
    const evaluadorId = req.user.userId;
    const { limite = 50, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [avaluos, total] = await Promise.all([
      prisma.avaluo.findMany({
        where: {
          evaluadorId: evaluadorId
        },
        include: {
          articulo: {
            include: {
              solicitud: {
                include: {
                  usuario: {
                    select: {
                      nombre: true,
                      apellido: true,
                      email: true
                    }
                  }
                }
              },
              tipoArticulo: true
            }
          }
        },
        orderBy: {
          fechaAvaluo: 'desc'
        },
        skip,
        take: parseInt(limite)
      }),
      
      prisma.avaluo.count({
        where: {
          evaluadorId: evaluadorId
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: avaluos,
      pagination: {
        total,
        pagina: parseInt(pagina),
        limite: parseInt(limite),
        totalPaginas: Math.ceil(total / parseInt(limite))
      }
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo avalúos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener avalúos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Middleware de manejo de errores
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de evaluador:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en el panel de evaluador',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;