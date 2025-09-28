// ===============================================
// Archivo: BACKEND/src/controllers/solicitudes.controller.js
// Controlador para solicitudes de empéño
// ===============================================

import { PrismaClient } from '@prisma/client';
import path from 'path';
import fs from 'fs/promises';

const prisma = new PrismaClient();

export default {
  // ===== CREAR NUEVA SOLICITUD =====
  async crearSolicitud(req, res) {
    try {
      const { userId } = req.user;
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
        planPagos,
        rangoAvaluo,
        aceptaTerminos
      } = req.body;

      console.log(`📝 Creando nueva solicitud para usuario: ${userId}`);

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

      // Procesar archivos subidos
      let fotosGuardadas = [];
      let documentoGuardado = null;

      if (req.files) {
        const uploadDir = path.join(process.cwd(), 'uploads', 'solicitudes');
        
        // Crear directorio si no existe
        try {
          await fs.access(uploadDir);
        } catch {
          await fs.mkdir(uploadDir, { recursive: true });
        }

        // Procesar fotos
        if (req.files.fotos) {
          const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
          
          for (let i = 0; i < fotos.length; i++) {
            const foto = fotos[i];
            const fileName = `foto_${Date.now()}_${i + 1}_${foto.name}`;
            const filePath = path.join(uploadDir, fileName);
            
            await foto.mv(filePath);
            
            fotosGuardadas.push({
              nombre: foto.name,
              nombreArchivo: fileName,
              ruta: filePath,
              tamaño: foto.size,
              tipo: foto.mimetype,
              esPrincipal: i === 0
            });
          }
        }

        // Procesar documento técnico
        if (req.files.documentoTecnico) {
          const doc = req.files.documentoTecnico;
          const fileName = `doc_${Date.now()}_${doc.name}`;
          const filePath = path.join(uploadDir, fileName);
          
          await doc.mv(filePath);
          
          documentoGuardado = {
            nombre: doc.name,
            nombreArchivo: fileName,
            ruta: filePath,
            tamaño: doc.size,
            tipo: doc.mimetype
          };
        }
      }

      // ===== GUARDAR EN BASE DE DATOS =====
      const resultado = await prisma.$transaction(async (tx) => {
        
        // 1. Crear la solicitud de préstamo
        const solicitudCreada = await tx.solicitudPrestamo.create({
          data: {
            usuarioId: parseInt(userId),
            fechaSolicitud: new Date(),
            estado: 'Pendiente',
            observaciones: `Solicitud de préstamo por Q${montoSolicitado} a ${plazoMeses} meses`
          }
        });

        console.log('✅ Solicitud creada con ID:', solicitudCreada.id);

        // 2. Crear el artículo asociado
        const articuloCreado = await tx.articulo.create({
          data: {
            solicitudId: solicitudCreada.id,
            tipoArticuloId: parseInt(tipoArticulo),
            descripcion: descripcion,
            marca: marca || null,
            modelo: modelo || null,
            estadoFisico: estadoFisico,
            valorEstimadoCliente: parseFloat(valorEstimado),
            especificacionesTecnicas: especificacionesTecnicas || null
          }
        });

        console.log('✅ Artículo creado con ID:', articuloCreado.id);

        // 3. Crear registros de documentos si hay archivos
        const documentosCreados = [];

        // Guardar fotos
        for (const foto of fotosGuardadas) {
          const docFoto = await tx.documento.create({
            data: {
              tipoDocumento: 'Foto_Prenda',
              nombreArchivo: foto.nombreArchivo,
              rutaArchivo: foto.ruta,
              idRelacionado: solicitudCreada.id,
              tipoRelacion: 'Solicitud',
              tamanoArchivo: foto.tamaño,
              tipoMime: foto.tipo
            }
          });
          documentosCreados.push(docFoto);
        }

        // Guardar documento técnico
        if (documentoGuardado) {
          const docTecnico = await tx.documento.create({
            data: {
              tipoDocumento: 'Especificaciones',
              nombreArchivo: documentoGuardado.nombreArchivo,
              rutaArchivo: documentoGuardado.ruta,
              idRelacionado: solicitudCreada.id,
              tipoRelacion: 'Solicitud',
              tamanoArchivo: documentoGuardado.tamaño,
              tipoMime: documentoGuardado.tipo
            }
          });
          documentosCreados.push(docTecnico);
        }

        return {
          solicitud: solicitudCreada,
          articulo: articuloCreado,
          documentos: documentosCreados
        };
      });

      // Generar número de solicitud para respuesta
      const numeroSolicitud = `SOL-${new Date().getFullYear()}-${String(resultado.solicitud.id).padStart(6, '0')}`;

      console.log('🎉 Solicitud procesada exitosamente:', {
        numero: numeroSolicitud,
        solicitudId: resultado.solicitud.id,
        articuloId: resultado.articulo.id,
        documentos: resultado.documentos.length
      });

      res.status(201).json({
        success: true,
        message: 'Solicitud de empéño creada exitosamente',
        data: {
          numeroSolicitud,
          solicitudId: resultado.solicitud.id,
          articuloId: resultado.articulo.id,
          estado: resultado.solicitud.estado,
          fechaSolicitud: resultado.solicitud.fechaSolicitud,
          montoSolicitado: parseFloat(montoSolicitado),
          plazoMeses: parseInt(plazoMeses),
          archivosSubidos: {
            fotos: fotosGuardadas.length,
            documentoTecnico: documentoGuardado ? 1 : 0
          }
        }
      });

    } catch (error) {
      console.error('❌ Error creando solicitud:', error);
      
      // Si hubo error, intentar limpiar archivos subidos
      try {
        if (req.files) {
          const uploadDir = path.join(process.cwd(), 'uploads', 'solicitudes');
          const files = await fs.readdir(uploadDir);
          // Aquí podrías implementar lógica para limpiar archivos huérfanos
        }
      } catch (cleanupError) {
        console.error('❌ Error limpiando archivos:', cleanupError);
      }

      res.status(500).json({
        success: false,
        message: 'Error interno del servidor al crear la solicitud',
        error: process.env.NODE_ENV  ? error.message : 'Error interno'
      });
    }
  },

  // ===== OBTENER CATEGORIAS =====
  async getCategorias(req, res) {
    try {
      console.log('📋 Obteniendo categorías de artículos...');
      
      const categorias = await prisma.tipoArticulo.findMany({
        where: {
          estado: 'Activo'
        },
        select: {
          id: true,
          nombre: true,
          porcentajeMinAvaluo: true,
          porcentajeMaxAvaluo: true,
          requiereElectronico: true
        },
        orderBy: {
          nombre: 'asc'
        }
      });

      res.status(200).json({
        success: true,
        message: 'Categorías obtenidas exitosamente',
        data: categorias
      });

    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo categorías',
        error: process.env.NODE_ENV  ? error.message : 'Error interno'
      });
    }
  },

  // ===== OBTENER MIS SOLICITUDES =====
  async getMisSolicitudes(req, res) {
    try {
      const { userId } = req.user;
      const { estado, limite = 10, pagina = 1 } = req.query;

      console.log(`📋 Obteniendo solicitudes del usuario: ${userId}`);

      const where = {
        usuarioId: parseInt(userId)
      };

      if (estado && estado !== 'todos') {
        where.estado = estado.charAt(0).toUpperCase() + estado.slice(1);
      }

      const skip = (parseInt(pagina) - 1) * parseInt(limite);

      const [solicitudes, total] = await Promise.all([
        prisma.solicitudPrestamo.findMany({
          where,
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
        prisma.solicitudPrestamo.count({ where })
      ]);

      const solicitudesFormateadas = solicitudes.map(solicitud => ({
        id: solicitud.id,
        numeroSolicitud: `SOL-${solicitud.fechaSolicitud.getFullYear()}-${String(solicitud.id).padStart(6, '0')}`,
        fechaSolicitud: solicitud.fechaSolicitud,
        estado: solicitud.estado,
        observaciones: solicitud.observaciones,
        articulo: solicitud.articulos[0] ? {
          descripcion: solicitud.articulos[0].descripcion,
          tipoArticulo: solicitud.articulos[0].tipoArticulo.nombre,
          valorEstimado: solicitud.articulos[0].valorEstimadoCliente
        } : null
      }));

      res.status(200).json({
        success: true,
        message: 'Solicitudes obtenidas exitosamente',
        data: {
          solicitudes: solicitudesFormateadas,
          paginacion: {
            total,
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            totalPaginas: Math.ceil(total / parseInt(limite))
          }
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo solicitudes',
        error: process.env.NODE_ENV  ? error.message : 'Error interno'
      });
    }
  },

  // ===== OBTENER DETALLE DE SOLICITUD =====
  async getDetalleSolicitud(req, res) {
    try {
      const { solicitudId } = req.params;
      const { userId } = req.user;

      console.log(`📋 Obteniendo detalle de solicitud: ${solicitudId}`);

      const solicitud = await prisma.solicitudPrestamo.findFirst({
        where: {
          id: parseInt(solicitudId),
          usuarioId: parseInt(userId)
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
              email: true,
              telefono: true
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
          idRelacionado: parseInt(solicitudId),
          tipoRelacion: 'Solicitud'
        }
      });

      const numeroSolicitud = `SOL-${solicitud.fechaSolicitud.getFullYear()}-${String(solicitud.id).padStart(6, '0')}`;

      res.status(200).json({
        success: true,
        message: 'Detalle de solicitud obtenido exitosamente',
        data: {
          numeroSolicitud,
          ...solicitud,
          documentos
        }
      });

    } catch (error) {
      console.error('❌ Error obteniendo detalle de solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo detalle de solicitud',
        error: process.env.NODE_ENV  ? error.message : 'Error interno'
      });
    }
  },

  // ===== CANCELAR SOLICITUD =====
  async cancelarSolicitud(req, res) {
    try {
      const { solicitudId } = req.params;
      const { userId } = req.user;
      const { motivo } = req.body;

      console.log(`🚫 Cancelando solicitud: ${solicitudId}`);

      const solicitudActualizada = await prisma.solicitudPrestamo.updateMany({
        where: {
          id: parseInt(solicitudId),
          usuarioId: parseInt(userId),
          estado: {
            in: ['Pendiente']
          }
        },
        data: {
          estado: 'Rechazada',
          observaciones: `Cancelada por el usuario. Motivo: ${motivo || 'No especificado'}`
        }
      });

      if (solicitudActualizada.count === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se pudo cancelar la solicitud. Verifica el estado actual.'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Solicitud cancelada exitosamente'
      });

    } catch (error) {
      console.error('❌ Error cancelando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelando solicitud',
        error: process.env.NODE_ENV ? error.message : 'Error interno'
      });
    }
  }
};