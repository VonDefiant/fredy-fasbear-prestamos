import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

// Función para reintentar operaciones de base de datos en caso de error de conexión
async function executeWithRetry(fn, maxRetries = 3, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      const isConnectionError = 
        error.code === 'P1001' || 
        error.code === 'P1008' ||
        error.code === 'P1017' ||
        error.message?.includes("Can't reach database") ||
        error.message?.includes("terminating connection");

      if (isConnectionError && attempt < maxRetries) {
        console.log(`⚠️ Intento ${attempt}/${maxRetries} falló, reintentando en ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      throw error;
    }
  }
}

// Middleware para logging
router.use((req, res, next) => {
  console.log(`🔑 Admin API: ${req.method} ${req.path}`);
  next();
});

// Aplicar middleware de autenticación y autorización
router.use(authenticateToken);
router.use(requireAdmin);

/**
 * GET /api/admin/stats
 * Obtiene estadísticas generales del dashboard de administración
 */
router.get('/stats', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo estadísticas del dashboard...');

    // Envolver todas las consultas en executeWithRetry
    const stats = await executeWithRetry(async () => {
      return await Promise.all([
        // Total de usuarios
        prisma.usuario.count(),
        
        // Total de clientes
        prisma.usuario.count({
          where: { tipoUsuario: 'Cliente' }
        }),
        
        // Total de evaluadores
        prisma.usuario.count({
          where: { tipoUsuario: 'Evaluador' }
        }),
        
        // Total de cobradores
        prisma.usuario.count({
          where: { tipoUsuario: 'Cobrador' }
        }),
        
        // Total de parámetros del sistema
        prisma.parametrosSistema.count({
          where: {
            nombreParametro: {
              not: {
                startsWith: 'ECOMMERCE_'
              }
            }
          }
        }),
        
        // Total de tipos de artículos
        prisma.tipoArticulo.count({
          where: { estado: 'Activo' }
        }),
        
        // Total de productos en tienda
        prisma.productoTienda.count({
          where: { estado: 'Disponible' }
        }),
        
        // Sesiones activas recientes (últimas 24 horas)
        prisma.sesionUsuario.count({
          where: {
            fechaInicio: {
              gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
            }
          }
        }),
        
        // Solicitudes pendientes
        prisma.solicitudPrestamo.count({
          where: { estado: 'Pendiente' }
        }),
        
        // Préstamos vencidos
        prisma.prestamo.count({
          where: { estado: 'Vencido' }
        })
      ]);
    });

    // Desestructurar después de obtener los resultados
    const [
      totalUsers,
      clientsCount,
      evaluatorsCount,
      collectorsCount,
      systemParameters,
      articleTypes,
      storeProducts,
      activeSessions,
      pendingRequests,
      overdueLoans
    ] = stats;

    const statsData = {
      totalUsers,
      clientsCount,
      activeStaff: evaluatorsCount + collectorsCount,
      evaluators: evaluatorsCount,
      collectors: collectorsCount,
      systemParameters,
      articleTypes,
      storeProducts,
      activeSessions,
      pendingRequests,
      overdueLoans,
      newUsersToday: 0, // TODO: Implementar con fecha actual
      currentRate: 0 // TODO: Obtener de parámetros
    };

    console.log('✅ Estadísticas obtenidas:', statsData);

    res.status(200).json({
      success: true,
      data: statsData
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo estadísticas del dashboard'
    });
  }
});

/**
 * GET /api/admin/recent-activity
 * Obtiene actividad reciente del sistema
 */
router.get('/recent-activity', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    console.log(`[ADMIN] Obteniendo actividad reciente (límite: ${limit})...`);

    const activity = await executeWithRetry(async () => {
      return await Promise.all([
        // Sesiones recientes
        prisma.sesionUsuario.findMany({
          take: parseInt(limit),
          orderBy: { fechaInicio: 'desc' },
          include: {
            usuario: {
              select: {
                nombre: true,
                apellido: true,
                email: true,
                tipoUsuario: true
              }
            }
          }
        }),

        // Solicitudes recientes
        prisma.solicitudPrestamo.findMany({
          take: parseInt(limit),
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
          take: parseInt(limit),
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
    });

    const [recentSessions, recentRequests, recentPayments] = activity;

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

// ===== RUTAS DE PARÁMETROS DEL SISTEMA =====

/**
 * GET /api/admin/system-parameters
 * Obtiene todos los parámetros del sistema
 */
router.get('/system-parameters', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo parámetros del sistema...');

    const parameters = await executeWithRetry(async () => {
      return await prisma.parametrosSistema.findMany({
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
    });

    console.log(`✅ ${parameters.length} parámetros encontrados`);

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
 * PUT /api/admin/system-parameters/:id
 * Actualiza un parámetro del sistema
 */
router.put('/system-parameters/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { valorParametro, descripcion } = req.body;
    const userId = req.user.id;

    console.log(`[ADMIN] Actualizando parámetro ${id}:`, { valorParametro, descripcion });

    // Validaciones básicas
    if (!valorParametro) {
      return res.status(400).json({
        success: false,
        message: 'El valor del parámetro es obligatorio'
      });
    }

    const result = await executeWithRetry(async () => {
      // Verificar que el parámetro existe
      const parametroExistente = await prisma.parametrosSistema.findUnique({
        where: { id: parseInt(id) }
      });

      if (!parametroExistente) {
        throw new Error('PARAMETER_NOT_FOUND');
      }

      // Actualizar parámetro
      return await prisma.parametrosSistema.update({
        where: { id: parseInt(id) },
        data: {
          valorParametro: valorParametro.toString(),
          descripcion: descripcion || parametroExistente.descripcion,
          usuarioModificoId: userId,
          fechaModificacion: new Date()
        },
        include: {
          usuarioModifico: {
            select: {
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      });
    });

    console.log('✅ Parámetro actualizado:', result.nombreParametro);

    res.status(200).json({
      success: true,
      message: 'Parámetro actualizado exitosamente',
      data: { parameter: result }
    });

  } catch (error) {
    console.error('[ERROR] Error actualizando parámetro:', error);
    
    if (error.message === 'PARAMETER_NOT_FOUND' || error.code === 'P2025') {
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
 * POST /api/admin/system-parameters
 * Crea un nuevo parámetro del sistema (opcional)
 */
router.post('/system-parameters', async (req, res) => {
  try {
    const { nombreParametro, valorParametro, descripcion, tipoDato } = req.body;
    const userId = req.user.id;

    console.log('[ADMIN] Creando nuevo parámetro:', { nombreParametro, tipoDato });

    // Validaciones
    if (!nombreParametro || !valorParametro || !tipoDato) {
      return res.status(400).json({
        success: false,
        message: 'Nombre, valor y tipo de dato son obligatorios'
      });
    }

    const nuevoParametro = await executeWithRetry(async () => {
      // Verificar que no existe un parámetro con el mismo nombre
      const parametroExistente = await prisma.parametrosSistema.findUnique({
        where: { nombreParametro }
      });

      if (parametroExistente) {
        throw new Error('PARAMETER_EXISTS');
      }

      // Crear nuevo parámetro
      return await prisma.parametrosSistema.create({
        data: {
          nombreParametro,
          valorParametro: valorParametro.toString(),
          descripcion: descripcion || null,
          tipoDato,
          usuarioModificoId: userId,
          fechaModificacion: new Date()
        },
        include: {
          usuarioModifico: {
            select: {
              nombre: true,
              apellido: true,
              email: true
            }
          }
        }
      });
    });

    console.log('✅ Nuevo parámetro creado:', nuevoParametro.nombreParametro);

    res.status(201).json({
      success: true,
      message: 'Parámetro creado exitosamente',
      data: { parameter: nuevoParametro }
    });

  } catch (error) {
    console.error('[ERROR] Error creando parámetro:', error);
    
    if (error.message === 'PARAMETER_EXISTS' || error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un parámetro con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creando parámetro del sistema'
    });
  }
});

/**
 * DELETE /api/admin/system-parameters/:id
 * Elimina un parámetro del sistema (usar con precaución)
 */
router.delete('/system-parameters/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[ADMIN] Eliminando parámetro ${id}...`);

    const parametroEliminado = await executeWithRetry(async () => {
      // Verificar que el parámetro existe
      const parametroExistente = await prisma.parametrosSistema.findUnique({
        where: { id: parseInt(id) }
      });

      if (!parametroExistente) {
        throw new Error('PARAMETER_NOT_FOUND');
      }

      // Eliminar parámetro
      await prisma.parametrosSistema.delete({
        where: { id: parseInt(id) }
      });

      return parametroExistente;
    });

    console.log('✅ Parámetro eliminado:', parametroEliminado.nombreParametro);

    res.status(200).json({
      success: true,
      message: 'Parámetro eliminado exitosamente'
    });

  } catch (error) {
    console.error('[ERROR] Error eliminando parámetro:', error);
    
    if (error.message === 'PARAMETER_NOT_FOUND' || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Parámetro no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error eliminando parámetro del sistema'
    });
  }
});

// ===== RUTAS DE TIPOS DE ARTÍCULOS =====

/**
 * GET /api/admin/article-types
 * Obtiene todos los tipos de artículos
 */
router.get('/article-types', async (req, res) => {
  try {
    console.log('[ADMIN] Obteniendo tipos de artículos...');

    const articleTypes = await executeWithRetry(async () => {
      return await prisma.tipoArticulo.findMany({
        orderBy: [
          { estado: 'desc' }, // Activos primero
          { nombre: 'asc' }   // Luego alfabético
        ]
      });
    });

    console.log(`✅ ${articleTypes.length} tipos de artículos encontrados`);

    // Transformar los datos para el frontend
    const transformedTypes = articleTypes.map(type => ({
      id: type.id,
      nombre: type.nombre,
      porcentajeMinAvaluo: parseFloat(type.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(type.porcentajeMaxAvaluo),
      requiereElectronico: type.requiereElectronico,
      estado: type.estado,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt
    }));

    res.status(200).json({
      success: true,
      data: { articleTypes: transformedTypes }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo tipos de artículos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo tipos de artículos'
    });
  }
});

/**
 * POST /api/admin/article-types
 * Crea un nuevo tipo de artículo
 */
router.post('/article-types', async (req, res) => {
  try {
    const { nombre, porcentajeMinAvaluo, porcentajeMaxAvaluo, requiereElectronico } = req.body;

    console.log('[ADMIN] Creando nuevo tipo de artículo:', { nombre, porcentajeMinAvaluo, porcentajeMaxAvaluo });

    // Validaciones
    if (!nombre?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del tipo es obligatorio'
      });
    }

    if (porcentajeMinAvaluo < 0 || porcentajeMinAvaluo > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje mínimo debe estar entre 0 y 100'
      });
    }

    if (porcentajeMaxAvaluo < 0 || porcentajeMaxAvaluo > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje máximo debe estar entre 0 y 100'
      });
    }

    if (porcentajeMinAvaluo >= porcentajeMaxAvaluo) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje mínimo debe ser menor al máximo'
      });
    }

    const nuevoTipo = await executeWithRetry(async () => {
      // Verificar que no existe un tipo con el mismo nombre
      const tipoExistente = await prisma.tipoArticulo.findFirst({
        where: { 
          nombre: {
            equals: nombre.trim(),
            mode: 'insensitive'
          }
        }
      });

      if (tipoExistente) {
        throw new Error('ARTICLE_TYPE_EXISTS');
      }

      // Crear nuevo tipo de artículo
      return await prisma.tipoArticulo.create({
        data: {
          nombre: nombre.trim(),
          porcentajeMinAvaluo: parseFloat(porcentajeMinAvaluo),
          porcentajeMaxAvaluo: parseFloat(porcentajeMaxAvaluo),
          requiereElectronico: Boolean(requiereElectronico),
          estado: 'Activo'
        }
      });
    });

    console.log('✅ Nuevo tipo de artículo creado:', nuevoTipo.nombre);

    // Transformar para el frontend
    const tipoTransformado = {
      id: nuevoTipo.id,
      nombre: nuevoTipo.nombre,
      porcentajeMinAvaluo: parseFloat(nuevoTipo.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(nuevoTipo.porcentajeMaxAvaluo),
      requiereElectronico: nuevoTipo.requiereElectronico,
      estado: nuevoTipo.estado,
      createdAt: nuevoTipo.createdAt,
      updatedAt: nuevoTipo.updatedAt
    };

    res.status(201).json({
      success: true,
      message: 'Tipo de artículo creado exitosamente',
      data: { articleType: tipoTransformado }
    });

  } catch (error) {
    console.error('[ERROR] Error creando tipo de artículo:', error);
    
    if (error.message === 'ARTICLE_TYPE_EXISTS' || error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un tipo de artículo con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creando tipo de artículo'
    });
  }
});

/**
 * PUT /api/admin/article-types/:id
 * Actualiza un tipo de artículo
 */
router.put('/article-types/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, porcentajeMinAvaluo, porcentajeMaxAvaluo, requiereElectronico } = req.body;

    console.log(`[ADMIN] Actualizando tipo de artículo ${id}:`, { nombre, porcentajeMinAvaluo, porcentajeMaxAvaluo });

    // Validaciones
    if (!nombre?.trim()) {
      return res.status(400).json({
        success: false,
        message: 'El nombre del tipo es obligatorio'
      });
    }

    if (porcentajeMinAvaluo < 0 || porcentajeMinAvaluo > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje mínimo debe estar entre 0 y 100'
      });
    }

    if (porcentajeMaxAvaluo < 0 || porcentajeMaxAvaluo > 100) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje máximo debe estar entre 0 y 100'
      });
    }

    if (porcentajeMinAvaluo >= porcentajeMaxAvaluo) {
      return res.status(400).json({
        success: false,
        message: 'El porcentaje mínimo debe ser menor al máximo'
      });
    }

    const tipoActualizado = await executeWithRetry(async () => {
      // Verificar que el tipo existe
      const tipoExistente = await prisma.tipoArticulo.findUnique({
        where: { id: parseInt(id) }
      });

      if (!tipoExistente) {
        throw new Error('ARTICLE_TYPE_NOT_FOUND');
      }

      // Verificar que no existe otro tipo con el mismo nombre
      const tipoConMismoNombre = await prisma.tipoArticulo.findFirst({
        where: { 
          nombre: {
            equals: nombre.trim(),
            mode: 'insensitive'
          },
          id: {
            not: parseInt(id)
          }
        }
      });

      if (tipoConMismoNombre) {
        throw new Error('ARTICLE_TYPE_EXISTS');
      }

      // Actualizar tipo de artículo
      return await prisma.tipoArticulo.update({
        where: { id: parseInt(id) },
        data: {
          nombre: nombre.trim(),
          porcentajeMinAvaluo: parseFloat(porcentajeMinAvaluo),
          porcentajeMaxAvaluo: parseFloat(porcentajeMaxAvaluo),
          requiereElectronico: Boolean(requiereElectronico)
        }
      });
    });

    console.log('✅ Tipo de artículo actualizado:', tipoActualizado.nombre);

    // Transformar para el frontend
    const tipoTransformado = {
      id: tipoActualizado.id,
      nombre: tipoActualizado.nombre,
      porcentajeMinAvaluo: parseFloat(tipoActualizado.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(tipoActualizado.porcentajeMaxAvaluo),
      requiereElectronico: tipoActualizado.requiereElectronico,
      estado: tipoActualizado.estado,
      createdAt: tipoActualizado.createdAt,
      updatedAt: tipoActualizado.updatedAt
    };

    res.status(200).json({
      success: true,
      message: 'Tipo de artículo actualizado exitosamente',
      data: { articleType: tipoTransformado }
    });

  } catch (error) {
    console.error('[ERROR] Error actualizando tipo de artículo:', error);
    
    if (error.message === 'ARTICLE_TYPE_NOT_FOUND' || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Tipo de artículo no encontrado'
      });
    }

    if (error.message === 'ARTICLE_TYPE_EXISTS' || error.code === 'P2002') {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un tipo de artículo con ese nombre'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error actualizando tipo de artículo'
    });
  }
});

/**
 * PUT /api/admin/article-types/:id/toggle-status
 * Cambia el estado (Activo/Inactivo) de un tipo de artículo
 */
router.put('/article-types/:id/toggle-status', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[ADMIN] Cambiando estado del tipo de artículo ${id}...`);

    const tipoActualizado = await executeWithRetry(async () => {
      // Verificar que el tipo existe
      const tipoExistente = await prisma.tipoArticulo.findUnique({
        where: { id: parseInt(id) }
      });

      if (!tipoExistente) {
        throw new Error('ARTICLE_TYPE_NOT_FOUND');
      }

      // Cambiar estado
      const nuevoEstado = tipoExistente.estado === 'Activo' ? 'Inactivo' : 'Activo';
      
      return await prisma.tipoArticulo.update({
        where: { id: parseInt(id) },
        data: { estado: nuevoEstado }
      });
    });

    console.log(`✅ Estado cambiado a: ${tipoActualizado.estado} para tipo: ${tipoActualizado.nombre}`);

    // Transformar para el frontend
    const tipoTransformado = {
      id: tipoActualizado.id,
      nombre: tipoActualizado.nombre,
      porcentajeMinAvaluo: parseFloat(tipoActualizado.porcentajeMinAvaluo),
      porcentajeMaxAvaluo: parseFloat(tipoActualizado.porcentajeMaxAvaluo),
      requiereElectronico: tipoActualizado.requiereElectronico,
      estado: tipoActualizado.estado,
      createdAt: tipoActualizado.createdAt,
      updatedAt: tipoActualizado.updatedAt
    };

    res.status(200).json({
      success: true,
      message: `Tipo de artículo ${tipoActualizado.estado.toLowerCase()} exitosamente`,
      data: { articleType: tipoTransformado }
    });

  } catch (error) {
    console.error('[ERROR] Error cambiando estado del tipo de artículo:', error);
    
    if (error.message === 'ARTICLE_TYPE_NOT_FOUND' || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Tipo de artículo no encontrado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error cambiando estado del tipo de artículo'
    });
  }
});

/**
 * DELETE /api/admin/article-types/:id
 * Elimina un tipo de artículo (usar con precaución)
 */
router.delete('/article-types/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`[ADMIN] Eliminando tipo de artículo ${id}...`);

    const result = await executeWithRetry(async () => {
      // Verificar que el tipo existe
      const tipoExistente = await prisma.tipoArticulo.findUnique({
        where: { id: parseInt(id) }
      });

      if (!tipoExistente) {
        throw new Error('ARTICLE_TYPE_NOT_FOUND');
      }

      // Verificar si existen artículos asociados a este tipo
      const articulosAsociados = await prisma.articulo.count({
        where: { tipoArticuloId: parseInt(id) }
      });

      if (articulosAsociados > 0) {
        throw new Error(`HAS_ARTICLES:${articulosAsociados}`);
      }

      // Eliminar tipo de artículo
      await prisma.tipoArticulo.delete({
        where: { id: parseInt(id) }
      });

      return tipoExistente;
    });

    console.log('✅ Tipo de artículo eliminado:', result.nombre);

    res.status(200).json({
      success: true,
      message: 'Tipo de artículo eliminado exitosamente'
    });

  } catch (error) {
    console.error('[ERROR] Error eliminando tipo de artículo:', error);
    
    if (error.message === 'ARTICLE_TYPE_NOT_FOUND' || error.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Tipo de artículo no encontrado'
      });
    }

    if (error.message?.startsWith('HAS_ARTICLES:') || error.code === 'P2003') {
      const count = error.message?.split(':')[1] || 'varios';
      return res.status(409).json({
        success: false,
        message: `No se puede eliminar el tipo porque tiene ${count} artículo(s) asociado(s). Desactívalo en su lugar.`,
        data: { associatedArticles: parseInt(count) || 0 }
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error eliminando tipo de artículo'
    });
  }
});

/**
 * GET /api/admin/article-types/:id/articles
 * Obtiene todos los artículos asociados a un tipo específico
 */
router.get('/article-types/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 10 } = req.query;

    console.log(`[ADMIN] Obteniendo artículos del tipo ${id}...`);

    const result = await executeWithRetry(async () => {
      // Verificar que el tipo existe
      const tipoExistente = await prisma.tipoArticulo.findUnique({
        where: { id: parseInt(id) }
      });

      if (!tipoExistente) {
        throw new Error('ARTICLE_TYPE_NOT_FOUND');
      }

      const skip = (parseInt(page) - 1) * parseInt(limit);

      const [articulos, totalArticulos] = await Promise.all([
        prisma.articulo.findMany({
          where: { tipoArticuloId: parseInt(id) },
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
            }
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: parseInt(limit)
        }),
        prisma.articulo.count({
          where: { tipoArticuloId: parseInt(id) }
        })
      ]);

      return { tipoExistente, articulos, totalArticulos };
    });

    console.log(`✅ ${result.articulos.length} artículos encontrados para el tipo: ${result.tipoExistente.nombre}`);

    res.status(200).json({
      success: true,
      data: {
        articleType: result.tipoExistente,
        articles: result.articulos,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(result.totalArticulos / parseInt(limit)),
          totalItems: result.totalArticulos,
          itemsPerPage: parseInt(limit)
        }
      }
    });

  } catch (error) {
    console.error('[ERROR] Error obteniendo artículos del tipo:', error);
    
    if (error.message === 'ARTICLE_TYPE_NOT_FOUND') {
      return res.status(404).json({
        success: false,
        message: 'Tipo de artículo no encontrado'
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Error obteniendo artículos del tipo'
    });
  }
});

// ===== RUTAS ADICIONALES DEL SISTEMA =====

/**
 * POST /api/admin/backup-database
 * Crea un respaldo de la base de datos (placeholder)
 */
router.post('/backup-database', async (req, res) => {
  try {
    console.log('[ADMIN] Solicitud de respaldo de base de datos...');

    // TODO: Implementar lógica real de respaldo
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

/**
 * GET /api/admin/system-health
 * Verifica el estado del sistema
 */
router.get('/system-health', async (req, res) => {
  try {
    console.log('[ADMIN] Verificando estado del sistema...');

    const healthCheck = {
      database: 'unknown',
      totalUsers: 0,
      activeConnections: 0,
      systemStatus: 'unknown',
      timestamp: new Date().toISOString()
    };

    try {
      // Verificar conexión a base de datos con reintentos
      const dbCheck = await executeWithRetry(async () => {
        await prisma.$connect();
        
        // Obtener métricas básicas
        const [totalUsers, activeConnections] = await Promise.all([
          prisma.usuario.count(),
          prisma.sesionUsuario.count({
            where: {
              fechaFin: null
            }
          })
        ]);

        return { totalUsers, activeConnections };
      });

      healthCheck.database = 'connected';
      healthCheck.totalUsers = dbCheck.totalUsers;
      healthCheck.activeConnections = dbCheck.activeConnections;
      healthCheck.systemStatus = 'healthy';
      
    } catch (dbError) {
      console.error('Error en health check de BD:', dbError);
      healthCheck.database = 'error';
      healthCheck.systemStatus = 'degraded';
    }

    const statusCode = healthCheck.systemStatus === 'healthy' ? 200 : 503;

    res.status(statusCode).json({
      success: healthCheck.systemStatus === 'healthy',
      data: { health: healthCheck }
    });

  } catch (error) {
    console.error('[ERROR] Error en verificación del sistema:', error);
    res.status(500).json({
      success: false,
      message: 'Error verificando estado del sistema'
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