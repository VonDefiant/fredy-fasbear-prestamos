// ===============================================
// Archivo: BACKEND/src/routes/solicitudes.routes.js
// Rutas para la gestión de solicitudes de empéño - CORREGIDO
// ===============================================

import express from 'express';
import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

// SOLO importar el servicio y validador, NO el middleware principal
import { 
  validateFileTypes, 
  uploadService 
} from '../middleware/upload.js';

import { catchAsync } from '../middleware/errorHandler.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para logging
router.use((req, res, next) => {
  console.log(`Solicitudes API: ${req.method} ${req.path}`);
  next();
});

// USAR MIDDLEWARE REAL DE AUTENTICACIÓN
router.use(authenticateToken);

// GET /api/solicitudes/categorias
router.get('/categorias', catchAsync(async (req, res) => {
  console.log('Obteniendo categorías de artículos desde BD');
  
  try {
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
      porcentajeMinAvaluo: parseFloat(tipo.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(tipo.porcentajeMaxAvaluo),
      requiereElectronico: tipo.requiereElectronico
    }));

    console.log('Categorías procesadas:', categorias);

    res.status(200).json({
      success: true,
      data: categorias,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error obteniendo categorías:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo categorías de artículos',
      error: error.message
    });
  }
}));

// GET /api/solicitudes
router.get('/', catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { estado, limite = 10, pagina = 1 } = req.query;
  
  console.log(`Obteniendo solicitudes para usuario: ${userId}`);

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
    console.error('Error obteniendo solicitudes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo solicitudes',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// POST /api/solicitudes - CORREGIDO SIN CONFLICTO DE MIDDLEWARES
router.post('/', 
  // SOLO validar tipos, el fileUpload ya está aplicado globalmente
  validateFileTypes,
  catchAsync(async (req, res) => {
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

    console.log(`Creando nueva solicitud para usuario: ${userId}`);
    console.log('Datos recibidos:', {
      tipoArticulo,
      descripcion: descripcion?.substring(0, 50) + '...',
      valorEstimado,
      montoSolicitado,
      plazoMeses
    });
    console.log('Archivos recibidos:', {
      fotos: req.files?.fotos ? (Array.isArray(req.files.fotos) ? req.files.fotos.length : 1) : 0,
      documentoTecnico: req.files?.documentoTecnico ? 'Si' : 'No'
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

      // PROCESAR ARCHIVOS ADJUNTOS - Los archivos ya están procesados por el middleware global
      const fotosGuardadas = [];
      let documentoGuardado = null;

      // Crear directorios de upload si no existen
      const uploadDir = path.join(process.cwd(), 'uploads/solicitudes');
      const fotoDir = path.join(uploadDir, 'fotos');
      const docDir = path.join(uploadDir, 'documentos');
      await fs.mkdir(fotoDir, { recursive: true });
      await fs.mkdir(docDir, { recursive: true });

      // Procesar fotos
      if (req.files?.fotos) {
        console.log('Procesando fotos...');
        const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
        
        for (let i = 0; i < fotos.length; i++) {
          const foto = fotos[i];
          const timestamp = Date.now();
          const extension = path.extname(foto.name);
          const nombreArchivo = `foto_${timestamp}_${i + 1}${extension}`;
          const rutaDestino = path.join(fotoDir, nombreArchivo);
          
          // Mover archivo desde temp a destino final
          await foto.mv(rutaDestino);
          
          fotosGuardadas.push({
            nombre: foto.name,
            nombreArchivo: nombreArchivo,
            ruta: `/uploads/solicitudes/fotos/${nombreArchivo}`,
            tamano: foto.size,
            tipo: foto.mimetype,
            esPrincipal: i === 0
          });
        }
      }

      // Procesar documento técnico
      if (req.files?.documentoTecnico) {
        console.log('Procesando documento técnico...');
        const doc = req.files.documentoTecnico;
        const timestamp = Date.now();
        const extension = path.extname(doc.name);
        const nombreArchivo = `doc_${timestamp}${extension}`;
        const rutaDestino = path.join(docDir, nombreArchivo);
        
        // Mover archivo desde temp a destino final
        await doc.mv(rutaDestino);
        
        documentoGuardado = {
          nombre: doc.name,
          nombreArchivo: nombreArchivo,
          ruta: `/uploads/solicitudes/documentos/${nombreArchivo}`,
          tamano: doc.size,
          tipo: doc.mimetype
        };
      }

      // GUARDAR EN BASE DE DATOS CON TRANSACCIÓN
      const resultado = await prisma.$transaction(async (tx) => {
        
        // 1. Crear la solicitud de préstamo
        const solicitudCreada = await tx.solicitudPrestamo.create({
          data: {
            usuarioId: userId,
            fechaSolicitud: new Date(),
            estado: 'Pendiente',
            observaciones: `Solicitud de préstamo por Q${montoSolicitado} a ${plazoMeses} meses`
          }
        });

        console.log('Solicitud creada con ID:', solicitudCreada.id);

        // 2. Crear el artículo asociado
        const articuloCreado = await tx.articulo.create({
          data: {
            solicitudId: solicitudCreada.id,
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

        console.log('Artículo creado con ID:', articuloCreado.id);

        // 3. CREAR REGISTROS DE DOCUMENTOS
        const documentosCreados = [];

        // Guardar fotos en la tabla documento
        for (const foto of fotosGuardadas) {
          const docFoto = await tx.documento.create({
            data: {
              tipoDocumento: 'Foto_Prenda',
              nombreArchivo: foto.nombre,
              rutaArchivo: foto.ruta,
              idRelacionado: solicitudCreada.id,
              tipoRelacion: 'Solicitud',
              tamanoArchivo: BigInt(foto.tamano),
              tipoMime: foto.tipo
            }
          });
          documentosCreados.push(docFoto);
          console.log('Foto registrada en BD:', docFoto.id);
        }

        // Guardar documento técnico en la tabla documento
        if (documentoGuardado) {
          const docTecnico = await tx.documento.create({
            data: {
              tipoDocumento: 'Especificaciones',
              nombreArchivo: documentoGuardado.nombre,
              rutaArchivo: documentoGuardado.ruta,
              idRelacionado: solicitudCreada.id,
              tipoRelacion: 'Solicitud',
              tamanoArchivo: BigInt(documentoGuardado.tamano),
              tipoMime: documentoGuardado.tipo
            }
          });
          documentosCreados.push(docTecnico);
          console.log('Documento técnico registrado en BD:', docTecnico.id);
        }

        return {
          solicitud: solicitudCreada,
          articulo: articuloCreado,
          documentos: documentosCreados
        };
      });

      // Generar número de solicitud para respuesta
      const numeroSolicitud = `SOL-${new Date().getFullYear()}-${String(resultado.solicitud.id).padStart(6, '0')}`;

      console.log('Solicitud procesada exitosamente:', {
        numero: numeroSolicitud,
        solicitudId: resultado.solicitud.id,
        articuloId: resultado.articulo.id,
        documentos: resultado.documentos.length
      });

      // RESPUESTA CORREGIDA PARA COINCIDIR CON EL FRONTEND
      res.status(201).json({
        success: true,
        message: 'Solicitud de empéño creada exitosamente',
        data: {
          solicitud: {
            id: resultado.solicitud.id,
            numero: numeroSolicitud,
            estado: resultado.solicitud.estado,
            fechaSolicitud: resultado.solicitud.fechaSolicitud
          },
          articulo: {
            id: resultado.articulo.id,
            tipoArticulo: tipoArticuloExiste.nombre,
            descripcion: resultado.articulo.descripcion,
            valorEstimadoCliente: resultado.articulo.valorEstimadoCliente
          },
          prestamo: {
            montoSolicitado: parseFloat(montoSolicitado),
            plazoMeses: parseInt(plazoMeses),
            modalidadPago: modalidadPago
          },
          archivosSubidos: {
            fotos: fotosGuardadas.length,
            documentoTecnico: documentoGuardado ? 1 : 0,
            totalDocumentos: resultado.documentos.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Error creando solicitud:', error);
      
      // Limpiar archivos subidos en caso de error
      try {
        for (const foto of fotosGuardadas || []) {
          const rutaCompleta = path.join(process.cwd(), foto.ruta);
          await fs.unlink(rutaCompleta).catch(() => {});
        }
        if (documentoGuardado) {
          const rutaCompleta = path.join(process.cwd(), documentoGuardado.ruta);
          await fs.unlink(rutaCompleta).catch(() => {});
        }
      } catch (cleanupError) {
        console.error('Error limpiando archivos:', cleanupError);
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
      });
    }
  })
);

// GET /api/solicitudes/:id
router.get('/:id', catchAsync(async (req, res) => {
  const userId = req.user.id;
  const solicitudId = parseInt(req.params.id);

  console.log(`Obteniendo solicitud ${solicitudId} para usuario ${userId}`);

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
      numero: `SOL-2025-${String(solicitud.id).padStart(6, '0')}`,
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
    console.error('Error obteniendo solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo la solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// GET /api/solicitudes/:solicitudId/archivos
router.get('/:solicitudId/archivos', catchAsync(async (req, res) => {
  const { solicitudId } = req.params;
  const userId = req.user.id;

  console.log(`Obteniendo archivos para solicitud: ${solicitudId}`);

  try {
    // Verificar que la solicitud pertenece al usuario
    const solicitud = await prisma.solicitudPrestamo.findFirst({
      where: { 
        id: parseInt(solicitudId),
        usuarioId: userId 
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
        idRelacionado: parseInt(solicitudId),
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
      urlDescarga: `/api/solicitudes/${solicitudId}/archivo/${doc.id}`
    }));

    // Agrupar por tipo
    const archivosPorTipo = archivosFormateados.reduce((acc, archivo) => {
      const tipo = archivo.tipo === 'Foto_Prenda' ? 'fotos' : 
                   archivo.tipo === 'Especificaciones' ? 'documentos' : 'otros';
      
      if (!acc[tipo]) acc[tipo] = [];
      acc[tipo].push(archivo);
      
      return acc;
    }, {});

    console.log('Archivos encontrados:', {
      fotos: archivosPorTipo.fotos?.length || 0,
      documentos: archivosPorTipo.documentos?.length || 0,
      total: archivosFormateados.length
    });

    res.status(200).json({
      success: true,
      data: {
        solicitudId: parseInt(solicitudId),
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
    console.error('Error obteniendo archivos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo archivos adjuntos',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// PUT /api/solicitudes/:id/cancelar
router.put('/:id/cancelar', catchAsync(async (req, res) => {
  const userId = req.user.id;
  const solicitudId = parseInt(req.params.id);
  const { motivo } = req.body;

  console.log(`Cancelando solicitud ${solicitudId} para usuario ${userId}`);

  try {
    const solicitudActualizada = await prisma.solicitudPrestamo.updateMany({
      where: {
        id: solicitudId,
        usuarioId: userId,
        estado: {
        in: ['Pendiente'] 
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
    console.error('Error cancelando solicitud:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelando solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

// PUT /api/solicitudes/:id/estado
router.put('/:id/estado', catchAsync(async (req, res) => {
  const solicitudId = parseInt(req.params.id);
  const { estado, observaciones } = req.body;

  console.log(`Actualizando estado de solicitud ${solicitudId} a: ${estado}`);

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
    console.error('Error actualizando estado:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando estado de solicitud',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno'
    });
  }
}));

export default router;