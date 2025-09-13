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
    const extension = path.extname(file.originalname);
    const baseName = path.basename(file.originalname, extension);
    cb(null, `${file.fieldname}-${uniqueSuffix}-${baseName}${extension}`);
  }
});

const fileFilter = (req, file, cb) => {
  // Tipos permitidos para fotos
  const imageTypes = /jpeg|jpg|png|gif/;
  // Tipos permitidos para documentos
  const docTypes = /pdf|doc|docx/;
  
  const extname = path.extname(file.originalname).toLowerCase();
  const mimetype = file.mimetype;
  
  if (file.fieldname === 'fotosPrenda') {
    const isValidImage = imageTypes.test(extname) && mimetype.startsWith('image/');
    if (isValidImage) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen (JPG, PNG, GIF) para fotos de prendas'));
    }
  } else if (file.fieldname === 'documentosTecnicos') {
    const isValidDoc = docTypes.test(extname) && 
                      (mimetype.includes('pdf') || 
                       mimetype.includes('msword') || 
                       mimetype.includes('wordprocessingml'));
    if (isValidDoc) {
      return cb(null, true);
    } else {
      cb(new Error('Solo se permiten documentos PDF, DOC o DOCX para documentos técnicos'));
    }
  } else {
    cb(new Error('Campo de archivo no reconocido'));
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo
    files: 8 // Máximo 8 archivos por solicitud
  }
});

// Función para validar datos de artículo
const validarArticulo = (articulo) => {
  const errores = [];
  
  if (!articulo.tipoArticuloId) {
    errores.push('El tipo de artículo es obligatorio');
  }
  
  if (!articulo.descripcion || articulo.descripcion.trim().length < 5) {
    errores.push('La descripción debe tener al menos 5 caracteres');
  }
  
  if (!articulo.estadoFisico) {
    errores.push('El estado físico es obligatorio');
  } else if (!['Excelente', 'Bueno', 'Regular', 'Malo'].includes(articulo.estadoFisico)) {
    errores.push('Estado físico inválido');
  }
  
  if (articulo.valorEstimadoCliente && (isNaN(articulo.valorEstimadoCliente) || articulo.valorEstimadoCliente < 0)) {
    errores.push('El valor estimado debe ser un número positivo');
  }
  
  return errores;
};

const solicitudesController = {
  // Propiedad para acceder al upload desde las rutas
  upload: upload,

  // GET /api/solicitudes - Obtener solicitudes del usuario
  getSolicitudesUsuario: async (req, res) => {
    try {
      const usuarioId = req.user.id;
      const { page = 1, limit = 12, estado, ordenamiento = 'fecha_desc' } = req.query;

      console.log('[SOLICITUDES] Obteniendo solicitudes para usuario:', usuarioId);

      // Construir filtros
      const where = { usuarioId: usuarioId };
      if (estado && estado !== 'todas') {
        where.estado = estado;
      }

      // Configurar ordenamiento
      let orderBy = { fechaSolicitud: 'desc' };
      if (ordenamiento === 'fecha_asc') {
        orderBy = { fechaSolicitud: 'asc' };
      } else if (ordenamiento === 'estado') {
        orderBy = [{ estado: 'asc' }, { fechaSolicitud: 'desc' }];
      }

      // Calcular paginación
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      // Obtener solicitudes
      const [solicitudes, total] = await Promise.all([
        prisma.solicitudPrestamo.findMany({
          where,
          include: {
            articulos: {
              include: {
                tipoArticulo: {
                  select: { nombre: true }
                },
                avaluo: true
              }
            },
            contrato: {
              include: {
                prestamo: {
                  select: {
                    montoPrestado: true,
                    saldoPendiente: true,
                    fechaVencimiento: true,
                    estado: true
                  }
                }
              }
            }
          },
          orderBy,
          skip,
          take: limitNum
        }),
        prisma.solicitudPrestamo.count({ where })
      ]);

      // Calcular información de paginación
      const totalPages = Math.ceil(total / limitNum);
      const hasNext = pageNum < totalPages;
      const hasPrevious = pageNum > 1;

      const pagination = {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext,
        hasPrevious
      };

      console.log('[SOLICITUDES] Encontradas', solicitudes.length, 'solicitudes');

      res.status(200).json({
        success: true,
        data: {
          solicitudes,
          pagination
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

  // GET /api/solicitudes/estadisticas - Estadísticas del usuario
  getEstadisticas: async (req, res) => {
    try {
      const usuarioId = req.user.id;

      console.log('[SOLICITUDES] Obteniendo estadísticas para usuario:', usuarioId);

      const estadisticas = await prisma.solicitudPrestamo.groupBy({
        by: ['estado'],
        where: { usuarioId },
        _count: {
          estado: true
        }
      });

      const resultado = {
        total: 0,
        pendientes: 0,
        aprobadas: 0,
        rechazadas: 0
      };

      estadisticas.forEach(stat => {
        resultado.total += stat._count.estado;
        resultado[stat.estado.toLowerCase() + 's'] = stat._count.estado;
      });

      console.log('[SOLICITUDES] Estadísticas calculadas:', resultado);

      res.status(200).json({
        success: true,
        data: { estadisticas: resultado }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // GET /api/solicitudes/tipos-articulo - Obtener tipos de artículo
  getTiposArticulo: async (req, res) => {
    try {
      console.log('[SOLICITUDES] Obteniendo tipos de artículo');

      const tiposArticulo = await prisma.tipoArticulo.findMany({
        where: { estado: 'Activo' },
        orderBy: { nombre: 'asc' }
      });

      console.log('[SOLICITUDES] Encontrados', tiposArticulo.length, 'tipos de artículo');

      res.status(200).json({
        success: true,
        data: { tiposArticulo }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo tipos de artículo:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // GET /api/solicitudes/:id - Obtener detalle de solicitud
  getSolicitudDetalle: async (req, res) => {
    try {
      const usuarioId = req.user.id;
      const solicitudId = parseInt(req.params.id);

      console.log('[SOLICITUDES] Obteniendo detalle de solicitud:', solicitudId, 'para usuario:', usuarioId);

      if (!solicitudId || isNaN(solicitudId)) {
        return res.status(400).json({
          success: false,
          message: 'ID de solicitud inválido'
        });
      }

      const solicitud = await prisma.solicitudPrestamo.findFirst({
        where: {
          id: solicitudId,
          usuarioId: usuarioId
        },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true,
              telefono: true,
              direccion: true
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
                  planPagos: {
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

      // Obtener documentos asociados
      const documentos = await prisma.documento.findMany({
        where: {
          idRelacionado: solicitudId,
          tipoRelacion: 'Solicitud'
        },
        orderBy: { fechaSubida: 'desc' }
      });

      // Separar fotos y documentos técnicos
      const fotos = documentos.filter(doc => doc.tipoDocumento === 'Foto_Prenda');
      const documentosTecnicos = documentos.filter(doc => doc.tipoDocumento === 'Especificaciones');

      // Agregar URLs para acceso
      fotos.forEach(foto => {
        foto.url = `/uploads/solicitudes/${path.basename(foto.rutaArchivo)}`;
      });

      documentosTecnicos.forEach(doc => {
        doc.url = `/uploads/solicitudes/${path.basename(doc.rutaArchivo)}`;
      });

      // Adjuntar documentos a la solicitud
      solicitud.fotos = fotos;
      solicitud.documentos = documentosTecnicos;

      console.log('[SOLICITUDES] Detalle obtenido exitosamente');

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
      const { articulos, observaciones, archivos } = req.body;

      console.log('[SOLICITUDES] Creando nueva solicitud para:', usuarioId);
      console.log('[SOLICITUDES] Datos recibidos:', {
        articulos: articulos?.length || 0,
        observaciones: observaciones ? 'Sí' : 'No',
        archivos: archivos ? 'Sí' : 'No'
      });

      // Validaciones básicas
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

      // Validar cada artículo
      const erroresValidacion = [];
      articulos.forEach((articulo, index) => {
        const errores = validarArticulo(articulo);
        if (errores.length > 0) {
          erroresValidacion.push(`Artículo ${index + 1}: ${errores.join(', ')}`);
        }
      });

      if (erroresValidacion.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Errores de validación en artículos',
          errors: erroresValidacion
        });
      }

      // Verificar que los tipos de artículo existen
      const tipoIds = articulos.map(a => parseInt(a.tipoArticuloId));
      const tiposExistentes = await prisma.tipoArticulo.findMany({
        where: {
          id: { in: tipoIds },
          estado: 'Activo'
        }
      });

      if (tiposExistentes.length !== tipoIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Uno o más tipos de artículo no son válidos'
        });
      }

      // Crear la solicitud con transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // 1. Crear la solicitud
        const nuevaSolicitud = await tx.solicitudPrestamo.create({
          data: {
            usuarioId: usuarioId,
            observaciones: observaciones?.trim() || null,
            estado: 'Pendiente'
          }
        });

        console.log('[SOLICITUDES] Solicitud creada con ID:', nuevaSolicitud.id);

        // 2. Crear los artículos
        const articulosCreados = [];
        for (const articulo of articulos) {
          const nuevoArticulo = await tx.articulo.create({
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
          articulosCreados.push(nuevoArticulo);
        }

        console.log('[SOLICITUDES] Creados', articulosCreados.length, 'artículos');

        // 3. Registrar documentos si existen
        if (archivos) {
          // Registrar fotos
          if (archivos.fotosPrenda && archivos.fotosPrenda.length > 0) {
            for (const foto of archivos.fotosPrenda) {
              await tx.documento.create({
                data: {
                  tipoDocumento: 'Foto_Prenda',
                  nombreArchivo: foto.filename || foto.originalname,
                  rutaArchivo: foto.path || `uploads/solicitudes/${foto.filename}`,
                  idRelacionado: nuevaSolicitud.id,
                  tipoRelacion: 'Solicitud',
                  tamanoArchivo: foto.size || null,
                  tipoMime: foto.mimetype || null
                }
              });
            }
            console.log('[SOLICITUDES] Registradas', archivos.fotosPrenda.length, 'fotos');
          }

          // Registrar documentos técnicos
          if (archivos.documentosTecnicos && archivos.documentosTecnicos.length > 0) {
            for (const doc of archivos.documentosTecnicos) {
              await tx.documento.create({
                data: {
                  tipoDocumento: 'Especificaciones',
                  nombreArchivo: doc.filename || doc.originalname,
                  rutaArchivo: doc.path || `uploads/solicitudes/${doc.filename}`,
                  idRelacionado: nuevaSolicitud.id,
                  tipoRelacion: 'Solicitud',
                  tamanoArchivo: doc.size || null,
                  tipoMime: doc.mimetype || null
                }
              });
            }
            console.log('[SOLICITUDES] Registrados', archivos.documentosTecnicos.length, 'documentos técnicos');
          }
        }

        return { solicitud: nuevaSolicitud, articulos: articulosCreados };
      });

      // Obtener la solicitud completa para respuesta
      const solicitudCompleta = await prisma.solicitudPrestamo.findUnique({
        where: { id: resultado.solicitud.id },
        include: {
          articulos: {
            include: {
              tipoArticulo: {
                select: { nombre: true }
              }
            }
          }
        }
      });

      console.log('[SOLICITUDES] Solicitud creada exitosamente:', solicitudCompleta.id);

      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente',
        data: { solicitud: solicitudCompleta }
      });

    } catch (error) {
      console.error('[ERROR] Error creando solicitud:', error);
      
      // Manejo específico de errores de Prisma
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Error de duplicado en los datos'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // ===== RUTAS DE ADMINISTRADOR =====

  // PUT /api/solicitudes/:id/evaluar - Evaluar una solicitud (solo admin)
  evaluarSolicitud: async (req, res) => {
    try {
      const evaluadorId = req.user.id;
      const solicitudId = parseInt(req.params.id);
      const { estado, observaciones, avaluos } = req.body;

      console.log('[SOLICITUDES] Evaluando solicitud:', solicitudId, 'por evaluador:', evaluadorId);

      // Validaciones
      if (!['Aprobada', 'Rechazada'].includes(estado)) {
        return res.status(400).json({
          success: false,
          message: 'Estado de evaluación inválido'
        });
      }

      if (estado === 'Rechazada' && (!observaciones || observaciones.trim().length < 10)) {
        return res.status(400).json({
          success: false,
          message: 'Las observaciones son obligatorias para rechazar una solicitud'
        });
      }

      if (estado === 'Aprobada' && (!avaluos || !Array.isArray(avaluos) || avaluos.length === 0)) {
        return res.status(400).json({
          success: false,
          message: 'Los avalúos son obligatorios para aprobar una solicitud'
        });
      }

      // Verificar que la solicitud existe y está pendiente
      const solicitud = await prisma.solicitudPrestamo.findUnique({
        where: { id: solicitudId },
        include: {
          articulos: true,
          usuario: {
            select: { nombre: true, apellido: true, email: true }
          }
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
          message: 'La solicitud ya fue evaluada'
        });
      }

      // Proceso de evaluación con transacción
      const resultado = await prisma.$transaction(async (tx) => {
        // 1. Actualizar la solicitud
        const solicitudActualizada = await tx.solicitudPrestamo.update({
          where: { id: solicitudId },
          data: {
            estado,
            observaciones: observaciones?.trim() || null,
            fechaEvaluacion: new Date()
          }
        });

        let contratoCreado = null;

        if (estado === 'Aprobada') {
          // 2. Crear avalúos para cada artículo
          let montoTotalPrestamo = 0;

          for (const avaluoData of avaluos) {
            const avaluo = await tx.avaluo.create({
              data: {
                articuloId: parseInt(avaluoData.articuloId),
                evaluadorId: evaluadorId,
                valorComercial: parseFloat(avaluoData.valorComercial),
                porcentajeAplicado: parseFloat(avaluoData.porcentajeAplicado),
                montoPrestamo: parseFloat(avaluoData.montoPrestamo),
                observaciones: avaluoData.observaciones?.trim() || null
              }
            });

            montoTotalPrestamo += parseFloat(avaluoData.montoPrestamo);
          }

          // 3. Crear contrato
          const numeroContrato = `CONT-${Date.now()}-${solicitudId}`;
          
          contratoCreado = await tx.contrato.create({
            data: {
              solicitudId: solicitudId,
              numeroContrato,
              contenidoContrato: `Contrato de préstamo pignoraticio por Q${montoTotalPrestamo.toFixed(2)}`,
              estadoFirma: 'Pendiente'
            }
          });

          // 4. Crear préstamo
          const fechaInicio = new Date();
          const fechaVencimiento = new Date();
          fechaVencimiento.setMonth(fechaVencimiento.getMonth() + 6); // 6 meses por defecto

          await tx.prestamo.create({
            data: {
              contratoId: contratoCreado.id,
              montoPrestado: montoTotalPrestamo,
              saldoPendiente: montoTotalPrestamo,
              tasaInteresMensual: 5.0, // 5% mensual por defecto
              plazoMeses: 6,
              fechaInicio,
              fechaVencimiento,
              estado: 'Activo'
            }
          });

          console.log('[SOLICITUDES] Solicitud aprobada con monto:', montoTotalPrestamo);
        } else {
          console.log('[SOLICITUDES] Solicitud rechazada:', observaciones);
        }

        return { solicitud: solicitudActualizada, contrato: contratoCreado };
      });

      // Obtener la solicitud completa para respuesta
      const solicitudCompleta = await prisma.solicitudPrestamo.findUnique({
        where: { id: solicitudId },
        include: {
          articulos: {
            include: {
              tipoArticulo: true,
              avaluo: true
            }
          },
          contrato: {
            include: {
              prestamo: true
            }
          }
        }
      });

      console.log('[SOLICITUDES] Evaluación completada exitosamente');

      res.status(200).json({
        success: true,
        message: `Solicitud ${estado.toLowerCase()} exitosamente`,
        data: { solicitud: solicitudCompleta }
      });

    } catch (error) {
      console.error('[ERROR] Error evaluando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /api/solicitudes/admin/pendientes - Obtener solicitudes pendientes (solo admin)
  getSolicitudesPendientes: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      console.log('[SOLICITUDES] Obteniendo solicitudes pendientes');

      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);
      const skip = (pageNum - 1) * limitNum;

      const [solicitudes, total] = await Promise.all([
        prisma.solicitudPrestamo.findMany({
          where: { estado: 'Pendiente' },
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
                tipoArticulo: true
              }
            }
          },
          orderBy: { fechaSolicitud: 'asc' },
          skip,
          take: limitNum
        }),
        prisma.solicitudPrestamo.count({ where: { estado: 'Pendiente' } })
      ]);

      const totalPages = Math.ceil(total / limitNum);
      const pagination = {
        currentPage: pageNum,
        totalPages,
        totalItems: total,
        itemsPerPage: limitNum,
        hasNext: pageNum < totalPages,
        hasPrevious: pageNum > 1
      };

      console.log('[SOLICITUDES] Encontradas', solicitudes.length, 'solicitudes pendientes');

      res.status(200).json({
        success: true,
        data: {
          solicitudes,
          pagination
        }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo solicitudes pendientes:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // POST /api/solicitudes/tipos-articulo - Crear tipo de artículo (solo admin)
  crearTipoArticulo: async (req, res) => {
    try {
      const usuarioId = req.user.id;
      const { nombre, porcentajeMinAvaluo, porcentajeMaxAvaluo, requiereElectronico } = req.body;

      console.log('[SOLICITUDES] Creando tipo de artículo:', nombre);

      // Validaciones
      if (!nombre || nombre.trim().length < 2) {
        return res.status(400).json({
          success: false,
          message: 'El nombre debe tener al menos 2 caracteres'
        });
      }

      if (!porcentajeMinAvaluo || !porcentajeMaxAvaluo) {
        return res.status(400).json({
          success: false,
          message: 'Los porcentajes de avalúo son obligatorios'
        });
      }

      const minPorcentaje = parseFloat(porcentajeMinAvaluo);
      const maxPorcentaje = parseFloat(porcentajeMaxAvaluo);

      if (minPorcentaje < 0 || minPorcentaje > 100 || maxPorcentaje < 0 || maxPorcentaje > 100) {
        return res.status(400).json({
          success: false,
          message: 'Los porcentajes deben estar entre 0 y 100'
        });
      }

      if (minPorcentaje >= maxPorcentaje) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje mínimo debe ser menor al máximo'
        });
      }

      // Verificar que el nombre no existe
      const existente = await prisma.tipoArticulo.findFirst({
        where: {
          nombre: nombre.trim(),
          estado: 'Activo'
        }
      });

      if (existente) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un tipo de artículo con ese nombre'
        });
      }

      // Crear el tipo de artículo
      const nuevoTipo = await prisma.tipoArticulo.create({
        data: {
          nombre: nombre.trim(),
          porcentajeMinAvaluo: minPorcentaje,
          porcentajeMaxAvaluo: maxPorcentaje,
          requiereElectronico: Boolean(requiereElectronico),
          estado: 'Activo'
        }
      });

      console.log('[SOLICITUDES] Tipo de artículo creado:', nuevoTipo.id);

      res.status(201).json({
        success: true,
        message: 'Tipo de artículo creado exitosamente',
        data: { tipoArticulo: nuevoTipo }
      });

    } catch (error) {
      console.error('[ERROR] Error creando tipo de artículo:', error);
      
      if (error.code === 'P2002') {
        return res.status(400).json({
          success: false,
          message: 'Ya existe un tipo de artículo con ese nombre'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

export default solicitudesController;