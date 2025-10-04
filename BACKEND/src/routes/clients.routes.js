import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { uploadMiddleware, validateFileTypes } from '../middleware/upload.js';
import { UploadService } from '../services/upload.service.js';

const router = express.Router();
const prisma = new PrismaClient();
const uploadService = new UploadService();

router.use((req, res, next) => {
  console.log(`👤 Clients API: ${req.method} ${req.path}`);
  next();
});

// ===============================================
// RUTAS DE ADMINISTRACIÓN (REQUIEREN ADMIN)
// ===============================================

router.get('/stats', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const [
      totalClients,
      activeClients,
      inactiveClients,
      newThisMonth,
      clientsWithLoans,
      clientsWithRequests
    ] = await Promise.all([
      prisma.usuario.count({
        where: { tipoUsuario: 'Cliente' }
      }),
      
      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          estado: 'Activo'
        }
      }),
      
      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          estado: 'Inactivo'
        }
      }),
      
      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          fechaRegistro: {
            gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1)
          }
        }
      }),

      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          solicitudes: {
            some: {
              contrato: {
                prestamo: {
                  estado: {
                    in: ['Activo', 'En_Mora']
                  }
                }
              }
            }
          }
        }
      }),

      prisma.usuario.count({
        where: {
          tipoUsuario: 'Cliente',
          solicitudes: {
            some: {
              estado: 'Pendiente'
            }
          }
        }
      })
    ]);

    const stats = {
      totalClients,
      activeClients, 
      inactiveClients,
      newThisMonth,
      clientsWithLoans,
      clientsWithRequests,
      clientsByStatus: {
        Activo: activeClients,
        Inactivo: inactiveClients
      }
    };

    console.log('📊 Estadísticas calculadas:', stats);

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo estadísticas de clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas de clientes'
    });
  }
});

router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { 
      estado, 
      busqueda, 
      page = 1, 
      limit = 50,
      sortBy = 'fechaRegistro',
      sortOrder = 'desc'
    } = req.query;

    const where = {
      tipoUsuario: 'Cliente'
    };

    if (estado) {
      where.estado = estado;
    }

    if (busqueda) {
      where.OR = [
        { nombre: { contains: busqueda, mode: 'insensitive' } },
        { apellido: { contains: busqueda, mode: 'insensitive' } },
        { email: { contains: busqueda, mode: 'insensitive' } },
        { cedula: { contains: busqueda } },
        { telefono: { contains: busqueda } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [clients, total] = await Promise.all([
      prisma.usuario.findMany({
        where,
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
          telefono: true,
          direccion: true,
          estado: true,
          cedula: true,
          fechaRegistro: true,
          fechaNacimiento: true,
          _count: {
            select: {
              solicitudes: {
                where: {
                  estado: { in: ['Pendiente', 'Aprobada'] }
                }
              }
            }
          }
        },
        orderBy: {
          [sortBy]: sortOrder
        },
        skip,
        take: parseInt(limit)
      }),
      
      prisma.usuario.count({ where })
    ]);

    const pagination = {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      pages: Math.ceil(total / parseInt(limit))
    };

    console.log(`📋 Clientes obtenidos: ${clients.length} de ${total}`);

    res.status(200).json({
      success: true,
      data: {
        clients,
        pagination
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo clientes:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de clientes'
    });
  }
});

router.get('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id || isNaN(parseInt(id))) {
      console.log(`❌ ID inválido proporcionado: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const clienteId = parseInt(id);
    console.log(`🔍 Buscando cliente con ID: ${clienteId}`);

    const clienteExiste = await prisma.usuario.findUnique({
      where: {
        id: clienteId
      },
      select: {
        id: true,
        tipoUsuario: true
      }
    });

    if (!clienteExiste) {
      console.log(`❌ Cliente con ID ${clienteId} no encontrado`);
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (clienteExiste.tipoUsuario !== 'Cliente') {
      console.log(`❌ Usuario ${clienteId} no es un cliente (es: ${clienteExiste.tipoUsuario})`);
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const cliente = await prisma.usuario.findUnique({
      where: {
        id: clienteId
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        estado: true,
        cedula: true,
        fechaRegistro: true,
        fechaNacimiento: true,
        solicitudes: {
          select: {
            id: true,
            fechaSolicitud: true,
            estado: true,
            montoSolicitado: true,
            observaciones: true,
            plazoMeses: true,
            modalidadPago: true,
            articulos: {
              select: {
                id: true,
                descripcion: true,
                marca: true,
                modelo: true,
                color: true
              },
              take: 3
            }
          },
          orderBy: { fechaSolicitud: 'desc' },
          take: 10
        }
      }
    });

    if (!cliente) {
      console.log(`❌ Error inesperado: Cliente ${clienteId} no encontrado en segunda consulta`);
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    console.log(`✅ Cliente encontrado: ${cliente.nombre} ${cliente.apellido} (${cliente.solicitudes?.length || 0} solicitudes)`);

    const solicitudesProcesadas = (cliente.solicitudes || []).map(solicitud => {
      const descripcionArticulos = solicitud.articulos.length > 0
        ? solicitud.articulos
            .map(articulo => {
              const partes = [articulo.descripcion];
              if (articulo.marca) partes.push(articulo.marca);
              if (articulo.modelo) partes.push(articulo.modelo);
              if (articulo.color) partes.push(`(${articulo.color})`);
              return partes.join(' ');
            })
            .join(', ')
        : 'Sin artículos registrados';

      return {
        id: solicitud.id,
        fechaSolicitud: solicitud.fechaSolicitud,
        estado: solicitud.estado,
        montoSolicitado: solicitud.montoSolicitado || 0,
        observaciones: solicitud.observaciones,
        plazoMeses: solicitud.plazoMeses,
        modalidadPago: solicitud.modalidadPago,
        descripcionArticulos: descripcionArticulos,
        cantidadArticulos: solicitud.articulos.length
      };
    });

    const clienteResponse = {
      ...cliente,
      solicitudes: solicitudesProcesadas
    };

    res.status(200).json({
      success: true,
      data: { cliente: clienteResponse }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo detalle de cliente:', error);
    console.error('Error stack:', error.stack);
    
    let statusCode = 500;
    let message = 'Error interno del servidor al obtener detalle del cliente';

    if (error.code === 'P2002') {
      statusCode = 409;
      message = 'Conflicto de datos en la base de datos';
    } else if (error.code === 'P2025') {
      statusCode = 404;
      message = 'Cliente no encontrado';
    } else if (error.code === 'P1001') {
      statusCode = 503;
      message = 'No se puede conectar a la base de datos';
    }

    console.error('Error details:', {
      name: error.name,
      message: error.message,
      code: error.code,
      clientStack: error.clientStack
    });

    const isDevelopment = process.env.NODE_ENV === 'development';
    
    res.status(statusCode).json({
      success: false,
      message,
      ...(isDevelopment && {
        error: {
          message: error.message,
          code: error.code,
          type: error.name
        }
      })
    });
  }
});

router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      cedula,
      password,
      estado = 'Activo',
      fechaNacimiento
    } = req.body;

    if (!nombre || !apellido || !email || !telefono || !direccion || !cedula || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser proporcionados'
      });
    }

    if (!/^\d{13,13}$/.test(cedula)) {
      return res.status(400).json({
        success: false,
        message: 'El DPI debe contener solo números y tener entre 8 y 13 dígitos'
      });
    }

    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email },
          { cedula }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === email ? 
          'Ya existe un usuario con este email' :
          'Ya existe un usuario con este DPI'
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const nuevoCliente = await prisma.usuario.create({
      data: {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
        tipoUsuario: 'Cliente',
        cedula,
        passwordHash,
        estado,
        fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        estado: true,
        cedula: true,
        fechaRegistro: true,
        fechaNacimiento: true
      }
    });

    console.log(`✅ Cliente creado exitosamente: ${nuevoCliente.nombre} ${nuevoCliente.apellido}`);

    res.status(201).json({
      success: true,
      data: { cliente: nuevoCliente }
    });

  } catch (error) {
    console.error('[ERROR] Error creando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando cliente'
    });
  }
});

router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      apellido,
      email,
      telefono,
      direccion,
      estado,
      fechaNacimiento
    } = req.body;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const clienteId = parseInt(id);

    const clienteExistente = await prisma.usuario.findFirst({
      where: {
        id: clienteId,
        tipoUsuario: 'Cliente'
      }
    });

    if (!clienteExistente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (email && email !== clienteExistente.email) {
      const emailExiste = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: clienteId }
        }
      });

      if (emailExiste) {
        return res.status(400).json({
          success: false,
          message: 'Ya existe otro usuario con este email'
        });
      }
    }

    const clienteActualizado = await prisma.usuario.update({
      where: { id: clienteId },
      data: {
        ...(nombre && { nombre }),
        ...(apellido && { apellido }),
        ...(email && { email }),
        ...(telefono && { telefono }),
        ...(direccion && { direccion }),
        ...(estado && { estado }),
        ...(fechaNacimiento && { fechaNacimiento: new Date(fechaNacimiento) })
      },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        telefono: true,
        direccion: true,
        estado: true,
        cedula: true,
        fechaRegistro: true,
        fechaNacimiento: true
      }
    });

    console.log(`✅ Cliente actualizado: ${clienteActualizado.nombre} ${clienteActualizado.apellido}`);

    res.status(200).json({
      success: true,
      data: { cliente: clienteActualizado }
    });

  } catch (error) {
    console.error('[ERROR] Error actualizando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando cliente'
    });
  }
});

router.put('/:id/toggle-status', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const clienteId = parseInt(id);

    const cliente = await prisma.usuario.findFirst({
      where: {
        id: clienteId,
        tipoUsuario: 'Cliente'
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo';

    const clienteActualizado = await prisma.usuario.update({
      where: { id: clienteId },
      data: { estado: nuevoEstado },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        estado: true
      }
    });

    console.log(`✅ Estado del cliente cambiado: ${clienteActualizado.nombre} ${clienteActualizado.apellido} -> ${nuevoEstado}`);

    res.status(200).json({
      success: true,
      message: `Cliente ${nuevoEstado.toLowerCase()} exitosamente`,
      data: { cliente: clienteActualizado }
    });

  } catch (error) {
    console.error('[ERROR] Error cambiando estado del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error cambiando estado del cliente'
    });
  }
});

// ===============================================
// RUTAS DE DOCUMENTOS DPI (USUARIO O EVALUADOR/ADMIN)
// ===============================================

/**
 * POST /api/clients/:id/documentos-identificacion
 * Subir documentos DPI del usuario
 */
router.post('/:id/documentos-identificacion',
  authenticateToken,
  uploadMiddleware,
  validateFileTypes,
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = parseInt(id);

      console.log('[CLIENTS] Subiendo documentos DPI para usuario:', userId);

      // Verificar permisos: el usuario solo puede subir sus propios documentos
      // O un evaluador/admin puede subir documentos de cualquier usuario
      const esPropio = req.user.id === userId;
      const esEvaluadorOAdmin = ['Evaluador', 'Administrador'].includes(req.user.tipoUsuario);

      if (!esPropio && !esEvaluadorOAdmin) {
        return res.status(403).json({
          success: false,
          message: 'No tienes permiso para subir documentos de este usuario'
        });
      }

      // Validar que se enviaron archivos
      if (!req.files || (!req.files.dpiFrontal && !req.files.dpiTrasero)) {
        return res.status(400).json({
          success: false,
          message: 'Debes enviar al menos una foto del DPI (frontal o trasero)'
        });
      }

      // Verificar que el usuario existe
      const usuario = await prisma.usuario.findUnique({
        where: { id: userId },
        select: {
          id: true,
          nombre: true,
          apellido: true,
          cedula: true
        }
      });

      if (!usuario) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      const documentosGuardados = [];

      // Usar transacción para garantizar consistencia
      await prisma.$transaction(async (tx) => {
        // Guardar DPI Frontal
        if (req.files.dpiFrontal) {
          const dpiFrontal = req.files.dpiFrontal;
          
          // Validar tamaño
          if (dpiFrontal.size > 10 * 1024 * 1024) {
            throw new Error('La imagen del DPI frontal no puede exceder 10MB');
          }

          // Guardar archivo físico
          const rutaFrontal = await uploadService.guardarFoto(
            dpiFrontal, 
            `usuarios/${userId}`
          );

          // Crear registro en BD
          const docFrontal = await tx.documento.create({
            data: {
              tipoDocumento: 'Identificacion',
              nombreArchivo: `DPI_Frontal_${usuario.cedula || userId}_${Date.now()}.${dpiFrontal.name.split('.').pop()}`,
              rutaArchivo: rutaFrontal,
              idRelacionado: userId,
              tipoRelacion: 'Usuario',
              tamanoArchivo: BigInt(dpiFrontal.size),
              tipoMime: dpiFrontal.mimetype
            }
          });

          documentosGuardados.push({
            tipo: 'frontal',
            id: docFrontal.id,
            nombreArchivo: docFrontal.nombreArchivo,
            rutaArchivo: docFrontal.rutaArchivo
          });

          console.log('✅ DPI Frontal guardado:', docFrontal.id);
        }

        // Guardar DPI Trasero
        if (req.files.dpiTrasero) {
          const dpiTrasero = req.files.dpiTrasero;
          
          // Validar tamaño
          if (dpiTrasero.size > 10 * 1024 * 1024) {
            throw new Error('La imagen del DPI trasero no puede exceder 10MB');
          }

          // Guardar archivo físico
          const rutaTrasero = await uploadService.guardarFoto(
            dpiTrasero,
            `usuarios/${userId}`
          );

          // Crear registro en BD
          const docTrasero = await tx.documento.create({
            data: {
              tipoDocumento: 'Identificacion',
              nombreArchivo: `DPI_Trasero_${usuario.cedula || userId}_${Date.now()}.${dpiTrasero.name.split('.').pop()}`,
              rutaArchivo: rutaTrasero,
              idRelacionado: userId,
              tipoRelacion: 'Usuario',
              tamanoArchivo: BigInt(dpiTrasero.size),
              tipoMime: dpiTrasero.mimetype
            }
          });

          documentosGuardados.push({
            tipo: 'trasero',
            id: docTrasero.id,
            nombreArchivo: docTrasero.nombreArchivo,
            rutaArchivo: docTrasero.rutaArchivo
          });

          console.log('✅ DPI Trasero guardado:', docTrasero.id);
        }
      });

      console.log(`🎉 Documentos DPI guardados exitosamente para usuario ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Documentos de identificación subidos exitosamente',
        data: {
          usuarioId: userId,
          documentos: documentosGuardados,
          totalDocumentos: documentosGuardados.length
        }
      });

    } catch (error) {
      console.error('[CLIENTS] Error subiendo documentos DPI:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Error al subir documentos de identificación',
        error: process.env.NODE_ENV === 'development' ? error.stack : undefined
      });
    }
  }
);

/**
 * GET /api/clients/:id/documentos-identificacion
 * Obtener documentos DPI del usuario
 */
router.get('/:id/documentos-identificacion', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    console.log('[CLIENTS] Obteniendo documentos DPI de usuario:', userId);

    // Verificar permisos
    const esPropio = req.user.id === userId;
    const esEvaluadorOAdmin = ['Evaluador', 'Administrador'].includes(req.user.tipoUsuario);

    if (!esPropio && !esEvaluadorOAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para ver estos documentos'
      });
    }

    // Obtener documentos DPI
    const documentosDPI = await prisma.documento.findMany({
      where: {
        tipoDocumento: 'Identificacion',
        idRelacionado: userId,
        tipoRelacion: 'Usuario'
      },
      orderBy: { fechaSubida: 'desc' },
      select: {
        id: true,
        nombreArchivo: true,
        rutaArchivo: true,
        fechaSubida: true,
        tamanoArchivo: true,
        tipoMime: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        usuarioId: userId,
        documentos: documentosDPI.map(doc => ({
          id: doc.id,
          nombreArchivo: doc.nombreArchivo,
          rutaArchivo: doc.rutaArchivo,
          fechaSubida: doc.fechaSubida,
          tamanoArchivo: doc.tamanoArchivo ? Number(doc.tamanoArchivo) : 0,
          tipoMime: doc.tipoMime
        })),
        totalDocumentos: documentosDPI.length,
        tieneDocumentos: documentosDPI.length > 0
      }
    });

  } catch (error) {
    console.error('[CLIENTS] Error obteniendo documentos DPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener documentos de identificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * DELETE /api/clients/:id/documentos-identificacion/:docId
 * Eliminar un documento DPI específico
 */
router.delete('/:id/documentos-identificacion/:docId', authenticateToken, async (req, res) => {
  try {
    const { id, docId } = req.params;
    const userId = parseInt(id);
    const documentoId = parseInt(docId);

    console.log('[CLIENTS] Eliminando documento DPI:', documentoId, 'del usuario:', userId);

    // Verificar permisos
    const esPropio = req.user.id === userId;
    const esEvaluadorOAdmin = ['Evaluador', 'Administrador'].includes(req.user.tipoUsuario);

    if (!esPropio && !esEvaluadorOAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para eliminar este documento'
      });
    }

    // Verificar que el documento existe y pertenece al usuario
    const documento = await prisma.documento.findFirst({
      where: {
        id: documentoId,
        tipoDocumento: 'Identificacion',
        idRelacionado: userId,
        tipoRelacion: 'Usuario'
      }
    });

    if (!documento) {
      return res.status(404).json({
        success: false,
        message: 'Documento no encontrado'
      });
    }

    // Eliminar archivo físico
    await uploadService.eliminarArchivo(documento.rutaArchivo);

    // Eliminar registro de BD
    await prisma.documento.delete({
      where: { id: documentoId }
    });

    console.log('✅ Documento DPI eliminado exitosamente');

    res.status(200).json({
      success: true,
      message: 'Documento eliminado exitosamente'
    });

  } catch (error) {
    console.error('[CLIENTS] Error eliminando documento DPI:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar documento',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

export default router;