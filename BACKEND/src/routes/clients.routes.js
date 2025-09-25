import express from 'express';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

router.use((req, res, next) => {
  console.log(`👤 Clients API: ${req.method} ${req.path}`);
  next();
});

router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/clients/stats
 * Obtiene estadísticas de los clientes - FUNCIONANDO
 */
router.get('/stats', async (req, res) => {
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

/**
 * GET /api/clients
 * Obtiene lista de clientes con filtros y paginación - FUNCIONANDO
 */
router.get('/', async (req, res) => {
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

/**
 * GET /api/clients/:id
 * Obtiene detalle completo de un cliente - ⚠️ PROBLEMA AQUÍ - SOLUCIONADO
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número válido
    if (!id || isNaN(parseInt(id))) {
      console.log(`❌ ID inválido proporcionado: ${id}`);
      return res.status(400).json({
        success: false,
        message: 'ID de cliente inválido'
      });
    }

    const clienteId = parseInt(id);
    console.log(`🔍 Buscando cliente con ID: ${clienteId}`);

    // Primero verificar que el cliente existe
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

    // Ahora obtener el cliente completo con manejo de errores más robusto
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
        // Solicitudes con manejo más seguro
        solicitudes: {
          select: {
            id: true,
            fechaSolicitud: true,
            estado: true,
            montoSolicitado: true,
            descripcionArticulo: true
          },
          orderBy: { fechaSolicitud: 'desc' },
          take: 10
        }
      }
    });

    // Esta verificación adicional es redundante pero más segura
    if (!cliente) {
      console.log(`❌ Error inesperado: Cliente ${clienteId} no encontrado en segunda consulta`);
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    console.log(`✅ Cliente encontrado: ${cliente.nombre} ${cliente.apellido} (${cliente.solicitudes?.length || 0} solicitudes)`);

    // Procesar solicitudes para asegurar datos seguros
    const solicitudesProcesadas = (cliente.solicitudes || []).map(solicitud => ({
      id: solicitud.id,
      fechaSolicitud: solicitud.fechaSolicitud,
      estado: solicitud.estado,
      montoSolicitado: solicitud.montoSolicitado || 0,
      descripcionArticulo: solicitud.descripcionArticulo || 'Sin descripción'
    }));

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
    
    // Determinar tipo de error para respuesta más específica
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

    // Logging detallado para debugging
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

/**
 * POST /api/clients
 * Crea un nuevo cliente
 */
router.post('/', async (req, res) => {
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

    // Validaciones básicas
    if (!nombre || !apellido || !email || !telefono || !direccion || !cedula || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser proporcionados'
      });
    }
s)
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

    console.log(`✅ Cliente creado: ${nuevoCliente.nombre} ${nuevoCliente.apellido} (ID: ${nuevoCliente.id})`);

    res.status(201).json({
      success: true,
      data: { cliente: nuevoCliente }
    });

  } catch (error) {
    console.error('[ERROR] Error creando cliente:', error);
    
    if (error.code === 'P2002') {
      return res.status(400).json({
        success: false,
        message: 'Ya existe un cliente con estos datos'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creando cliente'
    });
  }
});

/**
 * PUT /api/clients/:id
 * Actualiza los datos de un cliente
 */
router.put('/:id', async (req, res) => {
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

    // Verificar que el cliente existe
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

    // Verificar email único si se está cambiando
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

/**
 * PUT /api/clients/:id/toggle-status
 * Cambia el estado de un cliente (Activo/Inactivo)
 */
router.put('/:id/toggle-status', async (req, res) => {
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

    console.log(`🔄 Estado cambiado: ${clienteActualizado.nombre} ${clienteActualizado.apellido} -> ${nuevoEstado}`);

    res.status(200).json({
      success: true,
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

export default router;