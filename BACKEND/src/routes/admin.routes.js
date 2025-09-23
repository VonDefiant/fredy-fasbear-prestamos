

import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware para logging de rutas de admin
router.use((req, res, next) => {
  console.log(`🔧 Admin API: ${req.method} ${req.path}`);
  next();
});

// Middleware de autenticación para todas las rutas de admin
router.use(authenticateToken);
router.use(requireAdmin);

// ===== ESTADÍSTICAS DEL DASHBOARD =====

/**
 * GET /api/admin/stats
 * Obtiene estadísticas generales del sistema para el dashboard
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo estadísticas del dashboard...');

    // Obtener estadísticas en paralelo para mejor rendimiento
    const [
      totalUsers,
      clientsCount,
      activeStaff,
      evaluators,
      collectors,
      systemParameters,
      activeSessions,
      articleTypes,
      storeProducts,
      pendingRequests,
      overdueLoans,
      newUsersToday
    ] = await Promise.all([
      // Total de usuarios
      prisma.usuario.count(),
      
      // Clientes
      prisma.usuario.count({
        where: { tipoUsuario: 'Cliente' }
      }),
      
      // Personal activo
      prisma.usuario.count({
        where: {
          tipoUsuario: { in: ['Administrador', 'Evaluador', 'Cobrador'] },
          estado: 'Activo'
        }
      }),
      
      // Evaluadores
      prisma.usuario.count({
        where: { tipoUsuario: 'Evaluador' }
      }),
      
      // Cobradores
      prisma.usuario.count({
        where: { tipoUsuario: 'Cobrador' }
      }),
      
      // Parámetros del sistema
      prisma.parametrosSistema.count(),
      
      // Sesiones activas (últimas 24 horas)
      prisma.sesionUsuario.count({
        where: {
          fechaInicio: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      
      // Tipos de artículos
      prisma.tipoArticulo.count(),
      
      // Productos en tienda
      prisma.productoTienda.count({
        where: { estado: 'Disponible' }
      }),
      
      // Solicitudes pendientes
      prisma.solicitudPrestamo.count({
        where: { estado: 'Pendiente' }
      }),
      
      // Préstamos vencidos
      prisma.prestamo.count({
        where: {
          estado: 'Vencido',
          fechaVencimiento: {
            lt: new Date()
          }
        }
      }),
      
      // Usuarios registrados hoy
      prisma.usuario.count({
        where: {
          fechaRegistro: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Obtener tasa de interés actual
    const tasaParametro = await prisma.parametrosSistema.findFirst({
      where: { nombreParametro: 'TASA_INTERES_MENSUAL' }
    });

    const currentRate = tasaParametro ? parseFloat(tasaParametro.valorParametro) : 5.0;

    const stats = {
      totalUsers,
      clientsCount,
      activeStaff,
      evaluators,
      collectors,
      systemParameters,
      currentRate,
      activeSessions,
      articleTypes,
      storeProducts,
      newUsersToday,
      pendingRequests,
      overdueLoans
    };

    console.log('[ADMIN] Estadísticas obtenidas:', stats);

    res.status(200).json({
      success: true,
      data: { stats }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas del sistema',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/admin/users-overview
 * Obtiene resumen detallado de usuarios por tipo
 */
router.get('/users-overview', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo resumen de usuarios...');

    const usersByType = await prisma.usuario.groupBy({
      by: ['tipoUsuario', 'estado'],
      _count: {
        id: true
      }
    });

    const recentUsers = await prisma.usuario.findMany({
      take: 10,
      orderBy: { fechaRegistro: 'desc' },
      select: {
        id: true,
        nombre: true,
        apellido: true,
        email: true,
        tipoUsuario: true,
        estado: true,
        fechaRegistro: true
      }
    });

    res.status(200).json({
      success: true,
      data: {
        usersByType,
        recentUsers
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo resumen de usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo resumen de usuarios'
    });
  }
});

/**
 * GET /api/admin/system-health
 * Obtiene información sobre la salud del sistema
 */
router.get('/system-health', async (req, res) => {
  try {
    console.log('[ADMIN] Verificando salud del sistema...');

    // Verificar conexión a la base de datos
    const dbCheck = await prisma.$queryRaw`SELECT 1 as test`;
    
    // Obtener información del sistema
    const systemInfo = {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      nodeVersion: process.version,
      environment: process.env.NODE_ENV || 'development',
      databaseConnected: !!dbCheck,
      memoryUsage: process.memoryUsage()
    };

    // Verificar últimas actividades
    const lastActivity = await prisma.sesionUsuario.findFirst({
      orderBy: { fechaInicio: 'desc' },
      include: {
        usuario: {
          select: {
            nombre: true,
            apellido: true,
            tipoUsuario: true
          }
        }
      }
    });

    res.status(200).json({
      success: true,
      data: {
        systemInfo,
        lastActivity
      }
    });

  } catch (error) {
    console.error('[ERROR] Error verificando salud del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando salud del sistema'
    });
  }
});

/**
 * GET /api/admin/recent-activity
 * Obtiene actividad reciente del sistema
 */
router.get('/recent-activity', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo actividad reciente...');

    const limit = parseInt(req.query.limit) || 20;

    // Obtener actividades recientes
    const [recentSessions, recentRequests, recentPayments] = await Promise.all([
      // Sesiones recientes
      prisma.sesionUsuario.findMany({
        take: limit,
        orderBy: { fechaInicio: 'desc' },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              tipoUsuario: true
            }
          }
        }
      }),

      // Solicitudes recientes
      prisma.solicitudPrestamo.findMany({
        take: limit,
        orderBy: { fechaSolicitud: 'desc' },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true
            }
          }
        }
      }),

      // Pagos recientes
      prisma.pago.findMany({
        take: limit,
        orderBy: { fechaPago: 'desc' },
        include: {
          prestamo: {
            include: {
              contrato: {
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
                  }
                }
              }
            }
          }
        }
      })
    ]);

    res.status(200).json({
      success: true,
      data: {
        recentSessions,
        recentRequests,
        recentPayments
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo actividad reciente:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo actividad reciente'
    });
  }
});

/**
 * PUT /api/admin/system-parameters/:id
 * Actualiza un parámetro del sistema
 */
router.put('/system-parameters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { valorParametro, descripcion } = req.body;
    const userId = req.user.id;

    console.log(`[ADMIN] Actualizando parámetro ${id}:`, { valorParametro, descripcion });

    // Validaciones
    if (!valorParametro) {
      return res.status(400).json({
        success: false,
        message: 'El valor del parámetro es obligatorio'
      });
    }

    // Actualizar parámetro
    const updatedParameter = await prisma.parametrosSistema.update({
      where: { id: parseInt(id) },
      data: {
        valorParametro: valorParametro.toString(),
        descripcion: descripcion || undefined,
        usuarioModificoId: userId,
        fechaModificacion: new Date()
      }
    });

    console.log('[ADMIN] Parámetro actualizado:', updatedParameter);

    res.status(200).json({
      success: true,
      message: 'Parámetro actualizado exitosamente',
      data: { parameter: updatedParameter }
    });

  } catch (error) {
    console.error('[ERROR] Error actualizando parámetro:', error);
    
    if (error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Parámetro no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error actualizando parámetro del sistema'
    });
  }
});

/**
 * GET /api/admin/system-parameters
 * Obtiene todos los parámetros del sistema
 */
router.get('/system-parameters', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo parámetros del sistema...');

    const parameters = await prisma.parametrosSistema.findMany({
      include: {
        usuarioModifico: {
          select: {
            nombre: true,
            apellido: true,
            email: true
          }
        }
      },
      orderBy: { nombreParametro: 'asc' }
    });

    res.status(200).json({
      success: true,
      data: { parameters }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo parámetros:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo parámetros del sistema'
    });
  }
});

/**
 * POST /api/admin/backup-database
 * Crea un respaldo de la base de datos (placeholder)
 */
router.post('/backup-database', async (req, res) => {
  try {
    console.log('[ADMIN] Solicitud de respaldo de base de datos...');

    // TODO: Implementar lógica real de respaldo
    // Por ahora es un placeholder que simula la operación

    const backupInfo = {
      timestamp: new Date().toISOString(),
      requestedBy: req.user.email,
      status: 'simulated',
      message: 'Funcionalidad de respaldo pendiente de implementación'
    };

    res.status(200).json({
      success: true,
      message: 'Respaldo simulado exitosamente',
      data: { backup: backupInfo }
    });

  } catch (error) {
    console.error('[ERROR] Error en respaldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando respaldo de la base de datos'
    });
  }
});

// ===== MIDDLEWARE DE ERROR ESPECÍFICO PARA ADMIN =====
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de admin:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de administración',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;