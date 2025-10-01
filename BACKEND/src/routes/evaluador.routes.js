// BACKEND/src/routes/evaluador.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireEvaluador } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(`🔍 Evaluador API: ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);
router.use(requireEvaluador);

router.get('/stats', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo estadísticas del evaluador...');
    const evaluadorId = req.user.userId;

    const avaluosDelEvaluador = await prisma.avaluo.findMany({
      where: {
        evaluadorId: evaluadorId
      },
      include: {
        articulo: {
          include: {
            solicitud: true
          }
        }
      }
    });

    const totalAvaluos = avaluosDelEvaluador.length;
    const valorTotalAvaluado = avaluosDelEvaluador.reduce(
      (sum, avaluo) => sum + Number(avaluo.valorComercial), 
      0
    );
    const valorPromedioAvaluo = totalAvaluos > 0 ? valorTotalAvaluado / totalAvaluos : 0;

    const solicitudesEvaluadasIds = avaluosDelEvaluador.map(
      avaluo => avaluo.articulo.solicitudId
    );

    const [
      solicitudesAprobadas,
      solicitudesRechazadas,
      solicitudesPendientes,
      solicitudesHoy
    ] = await Promise.all([
      prisma.solicitudPrestamo.count({
        where: {
          id: { in: solicitudesEvaluadasIds },
          estado: 'Aprobada'
        }
      }),
      
      prisma.solicitudPrestamo.count({
        where: {
          id: { in: solicitudesEvaluadasIds },
          estado: 'Rechazada'
        }
      }),
      
      prisma.solicitudPrestamo.count({
        where: {
          estado: 'Pendiente'
        }
      }),
      
      prisma.solicitudPrestamo.count({
        where: {
          fechaSolicitud: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    const totalEvaluadas = solicitudesAprobadas + solicitudesRechazadas;
    const tasaAprobacion = totalEvaluadas > 0 
      ? ((solicitudesAprobadas / totalEvaluadas) * 100).toFixed(2)
      : 0;

    const stats = {
      solicitudesPendientes,
      solicitudesAprobadas,
      solicitudesRechazadas,
      avaluosRealizados: totalAvaluos,
      valorTotalAvaluado: valorTotalAvaluado.toFixed(2),
      valorPromedioAvaluo: valorPromedioAvaluo.toFixed(2),
      tasaAprobacion: parseFloat(tasaAprobacion),
      solicitudesHoy,
      totalSolicitudesEvaluadas: totalEvaluadas
    };

    console.log('[EVALUADOR] Estadísticas calculadas:', stats);

    res.status(200).json({
      success: true,
      data: stats
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas del evaluador',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.get('/solicitudes', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo solicitudes...');
    const { estado = 'Pendiente', limite = 20, pagina = 1 } = req.query;
    const skip = (parseInt(pagina) - 1) * parseInt(limite);

    const [solicitudes, total] = await Promise.all([
      prisma.solicitudPrestamo.findMany({
        where: {
          estado: estado
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          },
          articulos: {
            include: {
              tipoArticulo: true,
              avaluo: true
            }
          }
        },
        orderBy: {
          fechaSolicitud: 'desc'
        },
        skip,
        take: parseInt(limite)
      }),
      
      prisma.solicitudPrestamo.count({
        where: {
          estado: estado
        }
      })
    ]);

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

router.get('/solicitudes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[EVALUADOR] Obteniendo detalle de solicitud:', id);

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        usuario: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            telefono: true,
            direccion: true,
            cedula: true
          }
        },
        articulos: {
          include: {
            tipoArticulo: true,
            avaluo: {
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

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    res.status(200).json({
      success: true,
      data: solicitud
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo detalle:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener detalle de solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.post('/solicitudes/:id/evaluar', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluadorId = req.user.userId;
    const { valorComercial, porcentajeAplicado, observaciones, decision } = req.body;

    console.log('[EVALUADOR] Evaluando solicitud:', id, decision);

    if (!decision || !['Aprobada', 'Rechazada'].includes(decision)) {
      return res.status(400).json({
        success: false,
        message: 'Decisión inválida. Debe ser "Aprobada" o "Rechazada"'
      });
    }

    if (decision === 'Aprobada') {
      if (!valorComercial || valorComercial <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El valor comercial es requerido para aprobar'
        });
      }

      if (!porcentajeAplicado || porcentajeAplicado <= 0 || porcentajeAplicado > 100) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje debe estar entre 0 y 100'
        });
      }
    }

    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) },
      include: { articulos: true }
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
        message: `Esta solicitud ya fue ${solicitud.estado.toLowerCase()}`
      });
    }

    const resultado = await prisma.$transaction(async (prisma) => {
      const solicitudActualizada = await prisma.solicitudPrestamo.update({
        where: { id: parseInt(id) },
        data: {
          estado: decision,
          fechaEvaluacion: new Date(),
          observaciones: observaciones || null
        }
      });

      if (decision === 'Aprobada' && solicitud.articulos.length > 0) {
        const articulo = solicitud.articulos[0];
        const montoPrestamo = (parseFloat(valorComercial) * parseFloat(porcentajeAplicado)) / 100;

        await prisma.avaluo.create({
          data: {
            articuloId: articulo.id,
            evaluadorId: evaluadorId,
            valorComercial: parseFloat(valorComercial),
            porcentajeAplicado: parseFloat(porcentajeAplicado),
            montoPrestamo: montoPrestamo,
            observaciones: observaciones || null
          }
        });
      }

      return solicitudActualizada;
    });

    console.log('[EVALUADOR] Solicitud evaluada exitosamente:', resultado.id);

    res.status(200).json({
      success: true,
      message: `Solicitud ${decision.toLowerCase()} exitosamente`,
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

router.get('/recent-activity', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo actividad reciente...');
    const evaluadorId = req.user.userId;
    const { limite = 10 } = req.query;

    const actividad = await prisma.avaluo.findMany({
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
      take: parseInt(limite)
    });

    const actividadFormateada = actividad.map(avaluo => ({
      id: avaluo.id,
      tipo: 'avaluo',
      descripcion: avaluo.articulo.descripcion,
      cliente: `${avaluo.articulo.solicitud.usuario.nombre} ${avaluo.articulo.solicitud.usuario.apellido}`,
      monto: avaluo.montoPrestamo,
      fecha: avaluo.fechaAvaluo,
      estado: avaluo.articulo.solicitud.estado
    }));

    res.status(200).json({
      success: true,
      data: actividadFormateada
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo actividad:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener actividad reciente',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de evaluador:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en el panel de evaluador',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;