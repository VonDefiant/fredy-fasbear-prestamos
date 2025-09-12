// BACKEND/src/controllers/solicitudes.controller.js
import { PrismaClient } from '@prisma/client';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

// Configuración de Multer para carga de archivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = 'uploads/solicitudes/';
    
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Tipo de archivo no permitido. Solo: JPEG, JPG, PNG, PDF, DOC, DOCX'));
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB máximo
  }
});

const solicitudesController = {
  // Middleware de upload
  upload: upload,

  // GET /api/solicitudes - Obtener solicitudes del usuario
  getSolicitudesUsuario: async (req, res) => {
    try {
      const usuarioId = req.user.id;
      const { page = 1, limit = 10, estado } = req.query;
      
      console.log('[SOLICITUDES] Obteniendo solicitudes para usuario:', usuarioId);

      const whereClause = {
        usuarioId: usuarioId
      };

      if (estado && estado !== 'todas') {
        whereClause.estado = estado;
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [solicitudes, total] = await Promise.all([
        prisma.solicitudPrestamo.findMany({
          where: whereClause,
          include: {
            articulos: {
              include: {
                tipoArticulo: true,
                avaluo: true
              }
            },
            contrato: {
              include: {
                prestamo: {
                  select: {
                    id: true,
                    montoPrestado: true,
                    saldoPendiente: true,
                    fechaVencimiento: true,
                    estado: true
                  }
                }
              }
            }
          },
          orderBy: { fechaSolicitud: 'desc' },
          skip: skip,
          take: parseInt(limit)
        }),
        prisma.solicitudPrestamo.count({ where: whereClause })
      ]);

      res.status(200).json({
        success: true,
        data: {
          solicitudes: solicitudes,
          pagination: {
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            totalPages: Math.ceil(total / parseInt(limit))
          }
        }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // GET /api/solicitudes/:id - Obtener detalle de solicitud
  getSolicitudDetalle: async (req, res) => {
    try {
      const { id } = req.params;
      const usuarioId = req.user.id;
      const esAdmin = req.user.tipoUsuario === 'Administrador' || req.user.tipoUsuario === 'Evaluador';

      const whereClause = {
        id: parseInt(id)
      };

      if (!esAdmin) {
        whereClause.usuarioId = usuarioId;
      }

      const solicitud = await prisma.solicitudPrestamo.findFirst({
        where: whereClause,
        include: {
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
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
          },
          contrato: {
            include: {
              prestamo: {
                include: {
                  cuotas: {
                    orderBy: { numeroCuota: 'asc' },
                    take: 5
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
        data: { solicitud }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo detalle:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // POST /api/solicitudes - Crear nueva solicitud
  crearSolicitud: async (req, res) => {
    try {
      const usuarioId = req.user.id;
      const { articulos, observaciones } = req.body;

      console.log('[SOLICITUDES] Creando nueva solicitud para:', usuarioId);

      // Validaciones
      if (!articulos || !Array.isArray(articulos) || articulos.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Debe incluir al menos un artículo'
        });
      }

      if (articulos.length > 5) {
        return res.status(400).json({
          success: false,
          message: 'No se pueden incluir más de 5 artículos por solicitud'
        });
      }

      // Crear la solicitud con transacción
      const resultado = await prisma.$transaction(async (tx) => {
        const nuevaSolicitud = await tx.solicitudPrestamo.create({
          data: {
            usuarioId: usuarioId,
            observaciones: observaciones || null
          }
        });

        const articulosCreados = [];
        for (const articulo of articulos) {
          const articuloCreado = await tx.articulo.create({
            data: {
              solicitudId: nuevaSolicitud.id,
              tipoArticuloId: parseInt(articulo.tipoArticuloId),
              descripcion: articulo.descripcion.trim(),
              marca: articulo.marca?.trim() || null,
              modelo: articulo.modelo?.trim() || null,
              serie: articulo.serie?.trim() || null,
              color: articulo.color?.trim() || null,
              estadoFisico: articulo.estadoFisico,
              valorEstimadoCliente: articulo.valorEstimadoCliente ? 
                parseFloat(articulo.valorEstimadoCliente) : null,
              especificacionesTecnicas: articulo.especificacionesTecnicas?.trim() || null
            }
          });
          articulosCreados.push(articuloCreado);
        }

        return { solicitud: nuevaSolicitud, articulos: articulosCreados };
      });

      console.log('[SOLICITUDES] Solicitud creada:', resultado.solicitud.id);

      const solicitudCompleta = await prisma.solicitudPrestamo.findUnique({
        where: { id: resultado.solicitud.id },
        include: {
          articulos: {
            include: {
              tipoArticulo: true
            }
          }
        }
      });

      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente',
        data: { solicitud: solicitudCompleta }
      });

    } catch (error) {
      console.error('[ERROR] Error creando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // PUT /api/solicitudes/:id/evaluar - Evaluar solicitud (admin)
  evaluarSolicitud: async (req, res) => {
    try {
      const { id } = req.params;
      const { estado, observaciones, avaluos } = req.body;
      const evaluadorId = req.user.id;

      console.log('[SOLICITUDES] Evaluando solicitud:', id);

      if (!['Aprobada', 'Rechazada'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado no válido'
        });
      }

      if (estado === 'Aprobada' && (!avaluos || avaluos.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Para aprobar debe incluir avalúos'
        });
      }

      const resultado = await prisma.$transaction(async (tx) => {
        const solicitudActualizada = await tx.solicitudPrestamo.update({
          where: { id: parseInt(id) },
          data: {
            estado: estado,
            observaciones: observaciones,
            fechaEvaluacion: new Date()
          }
        });

        if (estado === 'Aprobada' && avaluos) {
          for (const avaluoData of avaluos) {
            await tx.avaluo.create({
              data: {
                articuloId: avaluoData.articuloId,
                evaluadorId: evaluadorId,
                valorComercial: parseFloat(avaluoData.valorComercial),
                porcentajeAplicado: parseFloat(avaluoData.porcentajeAplicado),
                montoPrestamo: parseFloat(avaluoData.montoPrestamo),
                observaciones: avaluoData.observaciones || null
              }
            });
          }
        }

        return solicitudActualizada;
      });

      res.status(200).json({
        success: true,
        message: `Solicitud ${estado.toLowerCase()} exitosamente`,
        data: { solicitud: resultado }
      });

    } catch (error) {
      console.error('[ERROR] Error evaluando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // GET /api/solicitudes/tipos-articulo - Obtener tipos de artículos
  getTiposArticulo: async (req, res) => {
    try {
      const tiposArticulo = await prisma.tipoArticulo.findMany({
        where: { estado: 'Activo' },
        orderBy: { nombre: 'asc' }
      });

      res.status(200).json({
        success: true,
        data: { tiposArticulo }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo tipos:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // GET /api/solicitudes/estadisticas
  getEstadisticas: async (req, res) => {
    try {
      const usuarioId = req.user.id;
      const esAdmin = req.user.tipoUsuario === 'Administrador' || req.user.tipoUsuario === 'Evaluador';

      const whereClause = esAdmin ? {} : { usuarioId: usuarioId };

      const [
        totalSolicitudes,
        solicitudesPendientes,
        solicitudesAprobadas,
        solicitudesRechazadas,
        solicitudesRecientes
      ] = await Promise.all([
        prisma.solicitudPrestamo.count({ where: whereClause }),
        prisma.solicitudPrestamo.count({ where: { ...whereClause, estado: 'Pendiente' } }),
        prisma.solicitudPrestamo.count({ where: { ...whereClause, estado: 'Aprobada' } }),
        prisma.solicitudPrestamo.count({ where: { ...whereClause, estado: 'Rechazada' } }),
        prisma.solicitudPrestamo.count({
          where: {
            ...whereClause,
            fechaSolicitud: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      res.status(200).json({
        success: true,
        data: {
          estadisticas: {
            total: totalSolicitudes,
            pendientes: solicitudesPendientes,
            aprobadas: solicitudesAprobadas,
            rechazadas: solicitudesRechazadas,
            recientes: solicitudesRecientes
          }
        }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

export default solicitudesController;