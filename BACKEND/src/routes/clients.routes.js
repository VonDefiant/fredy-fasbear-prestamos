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
 * Obtiene estadísticas de los clientes
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
 * Obtiene lista de clientes con filtros y paginación
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
 * Obtiene detalle completo de un cliente
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const cliente = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
        tipoUsuario: 'Cliente'
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
            contrato: {
              select: {
                prestamo: {
                  select: {
                    id: true,
                    estado: true,
                    montoAprobado: true,
                    fechaInicio: true,
                    fechaVencimiento: true
                  }
                }
              }
            }
          },
          orderBy: { fechaSolicitud: 'desc' },
          take: 10
        }
      }
    });

    if (!cliente) {
      return res.status(404).json({
        success: false,
        message: 'Cliente no encontrado'
      });
    }

    res.status(200).json({
      success: true,
      data: { cliente }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo detalle de cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo detalle del cliente'
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

    if (!nombre || !apellido || !email || !telefono || !direccion || !cedula || !password) {
      return res.status(400).json({
        success: false,
        message: 'Todos los campos obligatorios deben ser proporcionados'
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
          'Ya existe un usuario con esta cédula'
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

    res.status(201).json({
      success: true,
      data: { cliente: nuevoCliente },
      message: 'Cliente creado exitosamente'
    });

  } catch (error) {
    console.error('[ERROR] Error creando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando el cliente'
    });
  }
});

/**
 * PUT /api/clients/:id
 * Actualiza un cliente existente
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

    const clienteExistente = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
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
      const emailEnUso = await prisma.usuario.findFirst({
        where: {
          email,
          id: { not: parseInt(id) }
        }
      });

      if (emailEnUso) {
        return res.status(400).json({
          success: false,
          message: 'El email ya está en uso por otro usuario'
        });
      }
    }

    const clienteActualizado = await prisma.usuario.update({
      where: { id: parseInt(id) },
      data: {
        nombre,
        apellido,
        email,
        telefono,
        direccion,
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

    res.status(200).json({
      success: true,
      data: { cliente: clienteActualizado },
      message: 'Cliente actualizado exitosamente'
    });

  } catch (error) {
    console.error('[ERROR] Error actualizando cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error actualizando el cliente'
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

    const cliente = await prisma.usuario.findFirst({
      where: {
        id: parseInt(id),
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
      where: { id: parseInt(id) },
      data: { estado: nuevoEstado },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        estado: true
      }
    });

    res.status(200).json({
      success: true,
      data: { cliente: clienteActualizado },
      message: `Cliente ${nuevoEstado.toLowerCase()} exitosamente`
    });

  } catch (error) {
    console.error('[ERROR] Error cambiando estado del cliente:', error);
    res.status(500).json({
      success: false,
      message: 'Error cambiando el estado del cliente'
    });
  }
});

router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de clientes:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en gestión de clientes',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;