// ===============================================
// Archivo: BACKEND/src/controllers/prestamos.controller.js
// Controlador para la gestión de préstamos/empéños
// ===============================================

import { PrismaClient } from '@prisma/client';
import prestamoService from '../services/prestamo.service.js';

const prisma = new PrismaClient();

export default {
  // Obtener todos los préstamos del usuario autenticado
  async getMisPrestamos(req, res) {
    try {
      const { userId } = req.user;
      const { estado, limite = 10, pagina = 1 } = req.query;

      console.log(`📊 Obteniendo préstamos para usuario: ${userId}`);

      const whereClause = {
        usuarioId: userId,
        ...(estado && estado !== 'todos' && { estado })
      };

      const prestamos = await prisma.prestamo.findMany({
        where: whereClause,
        include: {
          articulo: {
            include: {
              categoria: true,
              fotos: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' }
          }
        },
        orderBy: { fechaCreacion: 'desc' },
        take: parseInt(limite),
        skip: (parseInt(pagina) - 1) * parseInt(limite)
      });

      // Calcular estadísticas
      const estadisticas = await prestamoService.calcularEstadisticasUsuario(userId);

      res.status(200).json({
        success: true,
        data: {
          prestamos: prestamos.map(prestamo => ({
            id: prestamo.id,
            articulo: prestamo.articulo.nombre,
            categoria: prestamo.articulo.categoria.nombre,
            montoPrestado: prestamo.montoPrestado,
            interesTotal: prestamo.interesTotal,
            totalPagar: prestamo.totalPagar,
            estado: prestamo.estado,
            estadoTexto: prestamoService.getEstadoTexto(prestamo.estado),
            fecha: prestamo.fechaCreacion,
            fechaVencimiento: prestamo.fechaVencimiento,
            plazoMeses: prestamo.plazoMeses,
            tasaInteres: prestamo.tasaInteres,
            diasRestantes: prestamoService.calcularDiasRestantes(prestamo.fechaVencimiento),
            porcentajeTiempo: prestamoService.calcularPorcentajeTiempo(
              prestamo.fechaCreacion,
              prestamo.fechaVencimiento
            ),
            fotos: prestamo.articulo.fotos.map(foto => ({
              id: foto.id,
              url: foto.rutaArchivo,
              esPrincipal: foto.esPrincipal
            })),
            ultimoPago: prestamo.pagos[0] || null
          })),
          estadisticas,
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total: await prisma.prestamo.count({ where: whereClause })
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo préstamos:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo préstamos',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener detalles de un préstamo específico
  async getDetallePrestamo(req, res) {
    try {
      const { prestamoId } = req.params;
      const { userId } = req.user;

      console.log(`🔍 Obteniendo detalle del préstamo: ${prestamoId}`);

      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: prestamoId,
          usuarioId: userId
        },
        include: {
          articulo: {
            include: {
              categoria: true,
              fotos: true,
              especificaciones: true
            }
          },
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
              email: true,
              telefono: true
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' }
          },
          renovaciones: {
            orderBy: { fechaRenovacion: 'desc' }
          },
          avaluo: true
        }
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado'
        });
      }

      // Calcular plan de pagos
      const planPagos = prestamoService.calcularPlanPagos(prestamo);

      res.status(200).json({
        success: true,
        data: {
          prestamo: {
            id: prestamo.id,
            numero: prestamo.numeroPrestamo,
            articulo: {
              id: prestamo.articulo.id,
              nombre: prestamo.articulo.nombre,
              descripcion: prestamo.articulo.descripcion,
              categoria: prestamo.articulo.categoria.nombre,
              estadoFisico: prestamo.articulo.estadoFisico,
              valorEstimado: prestamo.articulo.valorEstimado,
              fotos: prestamo.articulo.fotos.map(foto => ({
                id: foto.id,
                url: foto.rutaArchivo,
                esPrincipal: foto.esPrincipal
              })),
              especificaciones: prestamo.articulo.especificaciones
            },
            montos: {
              prestado: prestamo.montoPrestado,
              interes: prestamo.interesTotal,
              total: prestamo.totalPagar,
              pagado: prestamo.montoPagado,
              pendiente: prestamo.totalPagar - prestamo.montoPagado
            },
            fechas: {
              creacion: prestamo.fechaCreacion,
              vencimiento: prestamo.fechaVencimiento,
              ultimoPago: prestamo.fechaUltimoPago
            },
            condiciones: {
              plazoMeses: prestamo.plazoMeses,
              tasaInteres: prestamo.tasaInteres,
              modalidadPago: prestamo.modalidadPago
            },
            estado: prestamo.estado,
            estadoTexto: prestamoService.getEstadoTexto(prestamo.estado),
            diasRestantes: prestamoService.calcularDiasRestantes(prestamo.fechaVencimiento),
            avaluo: prestamo.avaluo,
            planPagos,
            historialPagos: prestamo.pagos,
            historialRenovaciones: prestamo.renovaciones
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo detalle del préstamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo detalle del préstamo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Procesar pago de préstamo
  async procesarPago(req, res) {
    try {
      const { prestamoId } = req.params;
      const { monto, metodoPago, referencia, notas } = req.body;
      const { userId } = req.user;

      console.log(`💰 Procesando pago para préstamo: ${prestamoId}`);

      // Validar que el préstamo pertenece al usuario
      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: prestamoId,
          usuarioId: userId,
          estado: {
            in: ['activo', 'vencido', 'renovado']
          }
        }
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado o no disponible para pagos'
        });
      }

      // Validar monto
      const montoPendiente = prestamo.totalPagar - prestamo.montoPagado;
      if (monto <= 0 || monto > montoPendiente) {
        return res.status(400).json({
          success: false,
          message: `El monto debe ser mayor a 0 y no exceder Q${montoPendiente.toFixed(2)}`
        });
      }

      // Procesar pago usando servicio
      const resultadoPago = await prestamoService.procesarPago({
        prestamoId,
        monto: parseFloat(monto),
        metodoPago,
        referencia,
        notas,
        usuarioId: userId
      });

      res.status(200).json({
        success: true,
        message: 'Pago procesado exitosamente',
        data: resultadoPago,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error procesando pago:', error);
      res.status(500).json({
        success: false,
        message: 'Error procesando el pago',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Renovar préstamo
  async renovarPrestamo(req, res) {
    try {
      const { prestamoId } = req.params;
      const { nuevosPlazoMeses, pagoInicialRenovacion } = req.body;
      const { userId } = req.user;

      console.log(`🔄 Renovando préstamo: ${prestamoId}`);

      // Validar que el préstamo puede ser renovado
      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: prestamoId,
          usuarioId: userId,
          estado: {
            in: ['activo', 'vencido']
          }
        }
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado o no disponible para renovación'
        });
      }

      // Procesar renovación usando servicio
      const resultadoRenovacion = await prestamoService.renovarPrestamo({
        prestamoId,
        nuevosPlazoMeses: parseInt(nuevosPlazoMeses),
        pagoInicialRenovacion: parseFloat(pagoInicialRenovacion || 0),
        usuarioId: userId
      });

      res.status(200).json({
        success: true,
        message: 'Préstamo renovado exitosamente',
        data: resultadoRenovacion,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error renovando préstamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error renovando el préstamo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Calcular simulación de préstamo
  async calcularSimulacion(req, res) {
    try {
      const { valorArticulo, porcentajePrestamo = 50, plazoMeses = 1 } = req.query;

      console.log('🧮 Calculando simulación de préstamo');

      const simulacion = prestamoService.calcularSimulacion({
        valorArticulo: parseFloat(valorArticulo),
        porcentajePrestamo: parseFloat(porcentajePrestamo),
        plazoMeses: parseInt(plazoMeses)
      });

      res.status(200).json({
        success: true,
        data: simulacion,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error calculando simulación:', error);
      res.status(400).json({
        success: false,
        message: 'Error en los parámetros de simulación',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener estadísticas del usuario
  async getEstadisticas(req, res) {
    try {
      const { userId } = req.user;

      console.log(`📈 Obteniendo estadísticas para usuario: ${userId}`);

      const estadisticas = await prestamoService.calcularEstadisticasUsuario(userId);

      res.status(200).json({
        success: true,
        data: estadisticas,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener historial completo de préstamos
  async getHistorial(req, res) {
    try {
      const { userId } = req.user;
      const { fechaInicio, fechaFin, limite = 20, pagina = 1 } = req.query;

      console.log(`📚 Obteniendo historial para usuario: ${userId}`);

      const whereClause = {
        usuarioId: userId,
        ...(fechaInicio && fechaFin && {
          fechaCreacion: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          }
        })
      };

      const historial = await prisma.prestamo.findMany({
        where: whereClause,
        include: {
          articulo: {
            select: {
              nombre: true,
              categoria: {
                select: { nombre: true }
              }
            }
          }
        },
        orderBy: { fechaCreacion: 'desc' },
        take: parseInt(limite),
        skip: (parseInt(pagina) - 1) * parseInt(limite)
      });

      const total = await prisma.prestamo.count({ where: whereClause });

      res.status(200).json({
        success: true,
        data: {
          historial: historial.map(prestamo => ({
            id: prestamo.id,
            numero: prestamo.numeroPrestamo,
            articulo: prestamo.articulo.nombre,
            categoria: prestamo.articulo.categoria.nombre,
            montoPrestado: prestamo.montoPrestado,
            totalPagar: prestamo.totalPagar,
            estado: prestamo.estado,
            estadoTexto: prestamoService.getEstadoTexto(prestamo.estado),
            fechaCreacion: prestamo.fechaCreacion,
            fechaVencimiento: prestamo.fechaVencimiento
          })),
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo historial:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo historial',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};