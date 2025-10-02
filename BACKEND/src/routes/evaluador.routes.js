// BACKEND/src/routes/evaluador.routes.js
import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireEvaluador } from '../middleware/auth.js';
import calculadoraService from '../services/calculadora.service.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para logging específico del evaluador
router.use((req, res, next) => {
  console.log(`🔍 Evaluador API: ${req.method} ${req.path}`);
  next();
});

// Aplicar middleware de autenticación y verificación de rol
router.use(authenticateToken);
router.use(requireEvaluador);

/**
 * GET /api/evaluador/stats
 * Obtiene las estadísticas del evaluador
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo estadísticas del evaluador...');
    const evaluadorId = req.user.id;

    // Obtener todos los avalúos del evaluador
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

    // Obtener IDs de solicitudes evaluadas
    const solicitudesEvaluadasIds = avaluosDelEvaluador.map(
      avaluo => avaluo.articulo.solicitudId
    );

    // Contar solicitudes por estado
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

/**
 * GET /api/evaluador/solicitudes
 * Obtiene las solicitudes pendientes de evaluación
 */
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

/**
 * GET /api/evaluador/solicitudes/:id
 * Obtiene el detalle completo de una solicitud específica
 */
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

    // Calcular plan de pagos si hay datos de préstamo
    let planPagos = null;
    let resumenFinanciero = null;

    if (solicitud.montoSolicitado && solicitud.plazoMeses) {
      try {
        const calculosPrestamo = await calculadoraService.calcularPrestamo(
          parseFloat(solicitud.montoSolicitado),
          solicitud.plazoMeses,
          solicitud.modalidadPago || 'mensual'
        );
        
        planPagos = calculosPrestamo.planPagos;
        resumenFinanciero = {
          montoSolicitado: parseFloat(solicitud.montoSolicitado),
          totalAPagar: parseFloat(solicitud.totalAPagar || calculosPrestamo.totalAPagar),
          interesTotal: calculosPrestamo.interesTotal,
          montoPorPago: calculosPrestamo.montoPorPago,
          tasaInteres: parseFloat(solicitud.tasaInteres || calculosPrestamo.tasaInteres),
          numeroPagos: calculosPrestamo.numeroPagos,
          comisionApertura: calculosPrestamo.comisionApertura
        };
      } catch (calcError) {
        console.warn('Error calculando plan de pagos:', calcError.message);
      }
    }

    // Formatear respuesta completa con información financiera
    const solicitudDetallada = {
      id: solicitud.id,
      numero: `SOL-2025-${String(solicitud.id).padStart(6, '0')}`,
      estado: solicitud.estado,
      fechaSolicitud: solicitud.fechaSolicitud,
      fechaEvaluacion: solicitud.fechaEvaluacion,
      observaciones: solicitud.observaciones,
      
      usuario: {
        id: solicitud.usuario.id,
        nombre: `${solicitud.usuario.nombre} ${solicitud.usuario.apellido}`,
        email: solicitud.usuario.email,
        telefono: solicitud.usuario.telefono,
        direccion: solicitud.usuario.direccion,
        cedula: solicitud.usuario.cedula
      },
      
      // Información completa del préstamo solicitado
      prestamo: {
        montoSolicitado: solicitud.montoSolicitado ? parseFloat(solicitud.montoSolicitado) : null,
        plazoMeses: solicitud.plazoMeses,
        modalidadPago: solicitud.modalidadPago,
        tasaInteres: solicitud.tasaInteres ? parseFloat(solicitud.tasaInteres) : null,
        totalAPagar: solicitud.totalAPagar ? parseFloat(solicitud.totalAPagar) : null,
        montoPorPago: resumenFinanciero?.montoPorPago || null,
        interesTotal: resumenFinanciero?.interesTotal || null,
        numeroPagos: resumenFinanciero?.numeroPagos || null,
        comisionApertura: resumenFinanciero?.comisionApertura || null,
        planPagos: planPagos || [],
        resumenFinanciero: resumenFinanciero
      },
      
      // Artículos
      articulos: solicitud.articulos.map(articulo => ({
        id: articulo.id,
        descripcion: articulo.descripcion,
        marca: articulo.marca,
        modelo: articulo.modelo,
        estadoFisico: articulo.estadoFisico,
        valorEstimadoCliente: articulo.valorEstimadoCliente ? parseFloat(articulo.valorEstimadoCliente) : null,
        especificacionesTecnicas: articulo.especificacionesTecnicas,
        tipoArticulo: articulo.tipoArticulo?.nombre,
        avaluo: articulo.avaluo
      }))
    };

    res.status(200).json({
      success: true,
      data: solicitudDetallada
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

/**
 * GET /api/evaluador/solicitudes/:id/archivos
 * NUEVO: Obtiene los archivos adjuntos de una solicitud
 */
router.get('/solicitudes/:id/archivos', async (req, res) => {
  try {
    const { id } = req.params;
    console.log('[EVALUADOR] Obteniendo archivos de solicitud:', id);

    // Verificar que la solicitud existe
    const solicitud = await prisma.solicitudPrestamo.findUnique({
      where: { id: parseInt(id) }
    });

    if (!solicitud) {
      return res.status(404).json({
        success: false,
        message: 'Solicitud no encontrada'
      });
    }

    // Obtener documentos asociados a la solicitud
    const documentos = await prisma.documento.findMany({
      where: {
        idRelacionado: parseInt(id),
        tipoRelacion: 'Solicitud'
      },
      orderBy: [
        { tipoDocumento: 'asc' },
        { fechaSubida: 'asc' }
      ]
    });

    const archivosFormateados = documentos.map(doc => ({
      id: doc.id,
      tipo: doc.tipoDocumento,
      nombreArchivo: doc.nombreArchivo,
      rutaArchivo: doc.rutaArchivo,
      fechaSubida: doc.fechaSubida,
      tamanoArchivo: doc.tamanoArchivo ? parseInt(doc.tamanoArchivo) : null,
      tipoMime: doc.tipoMime,
      urlDescarga: `/api/evaluador/solicitudes/${id}/archivo/${doc.id}`
    }));

    // Agrupar archivos por tipo
    const archivosPorTipo = archivosFormateados.reduce((acc, archivo) => {
      const tipo = archivo.tipo === 'Foto_Prenda' ? 'fotos' : 
                   archivo.tipo === 'Especificaciones' ? 'documentos' : 'otros';
      
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(archivo);
      
      return acc;
    }, {});

    console.log('[EVALUADOR] Archivos encontrados:', {
      fotos: archivosPorTipo.fotos?.length || 0,
      documentos: archivosPorTipo.documentos?.length || 0,
      total: archivosFormateados.length
    });

    res.status(200).json({
      success: true,
      data: {
        solicitudId: parseInt(id),
        archivos: archivosPorTipo,
        resumen: {
          totalArchivos: archivosFormateados.length,
          fotos: archivosPorTipo.fotos?.length || 0,
          documentos: archivosPorTipo.documentos?.length || 0,
          otros: archivosPorTipo.otros?.length || 0
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[EVALUADOR] Error obteniendo archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener archivos adjuntos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/evaluador/solicitudes/:id/evaluar
 * Evalúa una solicitud (aprobar o rechazar)
 */
router.post('/solicitudes/:id/evaluar', async (req, res) => {
  try {
    const { id } = req.params;
    const evaluadorId = req.user.id;
    const { estado, montoAutorizado, observaciones } = req.body;

    console.log('[EVALUADOR] Evaluando solicitud:', id, estado);

    // Validaciones
    if (!estado || !['Aprobada', 'Rechazada'].includes(estado)) {
      return res.status(400).json({
        success: false,
        message: 'Estado inválido. Debe ser "Aprobada" o "Rechazada"'
      });
    }

    if (estado === 'Aprobada') {
      if (!montoAutorizado || montoAutorizado <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El monto autorizado es requerido para aprobar'
        });
      }
    }

    // Verificar que la solicitud existe
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

    // Realizar la evaluación en una transacción
    const resultado = await prisma.$transaction(async (prisma) => {
      // Actualizar el estado de la solicitud
      const solicitudActualizada = await prisma.solicitudPrestamo.update({
        where: { id: parseInt(id) },
        data: {
          estado: estado,
          fechaEvaluacion: new Date(),
          observaciones: observaciones || null
        }
      });

      // Si fue aprobada, crear el avalúo
      if (estado === 'Aprobada' && solicitud.articulos.length > 0) {
        const articulo = solicitud.articulos[0];
        const valorComercial = solicitud.montoSolicitado || articulo.valorEstimadoCliente;
        
        // Calcular porcentaje aplicado
        const porcentajeAplicado = (parseFloat(montoAutorizado) / parseFloat(valorComercial)) * 100;

        await prisma.avaluo.create({
          data: {
            articuloId: articulo.id,
            evaluadorId: evaluadorId,
            valorComercial: parseFloat(valorComercial),
            porcentajeAplicado: parseFloat(porcentajeAplicado.toFixed(2)),
            montoPrestamo: parseFloat(montoAutorizado),
            observaciones: observaciones || null
          }
        });
      }

      return solicitudActualizada;
    });

    console.log('[EVALUADOR] Solicitud evaluada exitosamente:', resultado.id);

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
    const evaluadorId = req.user.id;
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

/**
 * GET /api/evaluador/mis-avaluos
 * Obtiene el historial completo de avalúos del evaluador
 */
router.get('/mis-avaluos', async (req, res) => {
  try {
    console.log('[EVALUADOR] Obteniendo historial de avalúos...');
    const evaluadorId = req.user.id;
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

// Middleware de manejo de errores específico para el evaluador
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de evaluador:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en el panel de evaluador',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;