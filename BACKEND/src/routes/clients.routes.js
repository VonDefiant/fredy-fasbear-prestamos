import express from 'express';
import bcrypt from 'bcryptjs';
import path from 'path';
import fs from 'fs/promises';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

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

    console.log('Estadísticas calculadas:', stats);

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

    console.log(`Clientes obtenidos: ${clients.length} de ${total}`);

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
      console.log(`ID inválido proporcionado: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const clienteId = parseInt(id);
    console.log(`Buscando cliente con ID: ${clienteId}`);

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
      console.log(`Cliente con ID ${clienteId} no encontrado`);
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    if (clienteExiste.tipoUsuario !== 'Cliente') {
      console.log(`Usuario ${clienteId} no es un cliente (es: ${clienteExiste.tipoUsuario})`);
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
      console.log(`Error inesperado: Cliente ${clienteId} no encontrado en segunda consulta`);
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    console.log(`Cliente encontrado: ${cliente.nombre} ${cliente.apellido} (${cliente.solicitudes?.length || 0} solicitudes)`);

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

    console.log(`Cliente creado exitosamente: ${nuevoCliente.nombre} ${nuevoCliente.apellido}`);

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

    console.log(`Cliente actualizado: ${clienteActualizado.nombre} ${clienteActualizado.apellido}`);

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

    console.log(`Estado del cliente cambiado: ${clienteActualizado.nombre} ${clienteActualizado.apellido} -> ${nuevoEstado}`);

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
// RUTAS DE DOCUMENTOS DPI
// ===============================================

/**
 * POST /api/clients/:id/documentos-identificacion
 * Subir documentos DPI del cliente (dpiFrontal y dpiTrasero)
 */
router.post('/:id/documentos-identificacion', authenticateToken, async (req, res) => {
  let dpiFrontalPath, dpiTraseroPath;
  
  try {
    const { id } = req.params;
    const userId = parseInt(id);

    console.log('[CLIENTS] Iniciando subida de documentos DPI');
    console.log('[CLIENTS] Usuario ID:', userId);
    console.log('[CLIENTS] Files recibidos:', req.files ? Object.keys(req.files) : 'ninguno');
    console.log('[CLIENTS] Headers Content-Type:', req.headers['content-type']);

    // Verificar permisos
    const esPropio = req.user.id === userId;
    const esEvaluadorOAdmin = ['Evaluador', 'Administrador'].includes(req.user.tipoUsuario);

    if (!esPropio && !esEvaluadorOAdmin) {
      return res.status(403).json({
        success: false,
        message: 'No tienes permiso para subir documentos de este usuario'
      });
    }

    // Validar que se enviaron archivos
    if (!req.files) {
      console.log('[CLIENTS] ERROR: No se recibieron archivos en req.files');
      return res.status(400).json({
        success: false,
        message: 'No se recibieron archivos. Verifica que estés enviando el formulario correctamente.'
      });
    }

    const { dpiFrontal, dpiTrasero } = req.files;

    if (!dpiFrontal && !dpiTrasero) {
      console.log('[CLIENTS] ERROR: Faltan archivos dpiFrontal y dpiTrasero');
      return res.status(400).json({
        success: false,
        message: 'Debes enviar al menos una foto del DPI (dpiFrontal o dpiTrasero)'
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

    console.log('[CLIENTS] Usuario encontrado:', usuario.nombre, usuario.apellido);

    // Crear directorio si no existe
    const uploadDir = path.join(process.cwd(), 'uploads', 'clientes', 'dpi');
    await fs.mkdir(uploadDir, { recursive: true });
    console.log('[CLIENTS] Directorio de upload verificado:', uploadDir);

    const documentosGuardados = [];

    // Procesar DPI Frontal
    if (dpiFrontal) {
      console.log('[CLIENTS] Procesando DPI Frontal:', dpiFrontal.name, '|', dpiFrontal.size, 'bytes');
      
      // Validar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(dpiFrontal.mimetype)) {
        return res.status(400).json({
          success: false,
          message: 'DPI Frontal: Solo se permiten imágenes JPG, PNG o WebP'
        });
      }

      // Validar tamaño (10MB)
      if (dpiFrontal.size > 10 * 1024 * 1024) {
        return res.status(400).json({
          success: false,
          message: 'DPI Frontal: El archivo no debe exceder 10MB'
        });
      }

      // Generar nombre único
      const timestamp = Date.now();
      const extension = path.extname(dpiFrontal.name);
      const dpiFrontalName = `dpi-frontal-${userId}-${timestamp}${extension}`;
      dpiFrontalPath = path.join(uploadDir, dpiFrontalName);

      // Mover archivo usando express-fileupload
      console.log('[CLIENTS] Guardando DPI Frontal en:', dpiFrontalPath);
      await dpiFrontal.mv(dpiFrontalPath);
      console.log('[CLIENTS] DPI Frontal guardado exitosamente');

      // Guardar en base de datos
      const docFrontal = await prisma.documento.create({
        data: {
          tipoDocumento: 'Identificacion',
          nombreArchivo: dpiFrontalName,
          rutaArchivo: `/uploads/clientes/dpi/${dpiFrontalName}`,
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
        rutaArchivo: docFrontal.rutaArchivo,
        tamaño: dpiFrontal.size
      });

      console.log('[CLIENTS] Registro de DPI Frontal creado con ID:', docFrontal.id);
    }

    // Procesar DPI Trasero
    if (dpiTrasero) {
      console.log('[CLIENTS] Procesando DPI Trasero:', dpiTrasero.name, '|', dpiTrasero.size, 'bytes');
      
      // Validar tipo MIME
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(dpiTrasero.mimetype)) {
        // Limpiar archivo frontal si ya se guardó
        if (dpiFrontalPath) {
          await fs.unlink(dpiFrontalPath).catch(() => {});
        }
        return res.status(400).json({
          success: false,
          message: 'DPI Trasero: Solo se permiten imágenes JPG, PNG o WebP'
        });
      }

      // Validar tamaño (10MB)
      if (dpiTrasero.size > 10 * 1024 * 1024) {
        // Limpiar archivo frontal si ya se guardó
        if (dpiFrontalPath) {
          await fs.unlink(dpiFrontalPath).catch(() => {});
        }
        return res.status(400).json({
          success: false,
          message: 'DPI Trasero: El archivo no debe exceder 10MB'
        });
      }

      // Generar nombre único
      const timestamp = Date.now();
      const extension = path.extname(dpiTrasero.name);
      const dpiTraseroName = `dpi-trasero-${userId}-${timestamp}${extension}`;
      dpiTraseroPath = path.join(uploadDir, dpiTraseroName);

      // Mover archivo usando express-fileupload
      console.log('[CLIENTS] Guardando DPI Trasero en:', dpiTraseroPath);
      await dpiTrasero.mv(dpiTraseroPath);
      console.log('[CLIENTS] DPI Trasero guardado exitosamente');

      // Guardar en base de datos
      const docTrasero = await prisma.documento.create({
        data: {
          tipoDocumento: 'Identificacion',
          nombreArchivo: dpiTraseroName,
          rutaArchivo: `/uploads/clientes/dpi/${dpiTraseroName}`,
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
        rutaArchivo: docTrasero.rutaArchivo,
        tamaño: dpiTrasero.size
      });

      console.log('[CLIENTS] Registro de DPI Trasero creado con ID:', docTrasero.id);
    }

    // Crear log de auditoría
    try {
      await prisma.auditLog.create({
        data: {
          usuarioId: req.user.id,
          accion: 'CREAR',
          tabla: 'documento',
          descripcion: `Documentos DPI subidos para cliente ${userId}`,
          detalles: JSON.stringify({
            clienteId: userId,
            documentos: documentosGuardados.map(d => d.nombreArchivo)
          })
        }
      });
    } catch (auditError) {
      console.error('[CLIENTS] Error creando audit log:', auditError);
      // No fallar la operación si el audit log falla
    }

    console.log(`[CLIENTS] Proceso completado exitosamente. Total documentos: ${documentosGuardados.length}`);

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
    console.error('[CLIENTS] ERROR subiendo documentos DPI:', error);
    console.error('[CLIENTS] Stack trace:', error.stack);

    // Limpiar archivos en caso de error
    if (dpiFrontalPath) {
      await fs.unlink(dpiFrontalPath).catch(err => 
        console.error('[CLIENTS] Error eliminando archivo frontal:', err)
      );
    }
    if (dpiTraseroPath) {
      await fs.unlink(dpiTraseroPath).catch(err => 
        console.error('[CLIENTS] Error eliminando archivo trasero:', err)
      );
    }

    res.status(500).json({
      success: false,
      message: 'Error al subir documentos de identificación',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

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
    const rutaCompleta = path.join(process.cwd(), documento.rutaArchivo);
    await fs.unlink(rutaCompleta).catch(err => {
      console.error('[CLIENTS] Error eliminando archivo físico:', err);
    });

    // Eliminar registro de BD
    await prisma.documento.delete({
      where: { id: documentoId }
    });

    console.log('[CLIENTS] Documento DPI eliminado exitosamente');

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