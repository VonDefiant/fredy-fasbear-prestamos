// ===============================================
// Archivo: BACKEND/src/controllers/prestamos.controller.js - CORREGIDO
// Controlador para la gestión de préstamos/empéños
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Obtener todos los préstamos del usuario autenticado
  async getMisPrestamos(req, res) {
    try {
      // CORREGIDO: usar req.user.id en lugar de req.user.userId
      const userId = req.user.id;
      const { estado, limite = 10, pagina = 1 } = req.query;

      console.log(`📊 Obteniendo préstamos para usuario: ${userId}`);

      // Construir la cláusula WHERE basada en la estructura real del schema
      const whereClause = {
        // Los préstamos están relacionados a través de contrato -> solicitud -> usuario
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        },
        ...(estado && estado !== 'todos' && { estado })
      };

      const prestamos = await prisma.prestamo.findMany({
        where: whereClause,
        include: {
          contrato: {
            include: {
              solicitud: {
                include: {
                  usuario: {
                    select: {
                      id: true,
                      nombre: true,
                      apellido: true,
                      email: true
                    }
                  },
                  articulos: {
                    include: {
                      tipoArticulo: true
                    }
                  }
                }
              }
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' }
          },
          planPagos: {
            orderBy: { numeroCuota: 'asc' }
          }
        },
        // CORREGIDO: usar createdAt en lugar de fechaCreacion
        orderBy: { createdAt: 'desc' },
        take: parseInt(limite),
        skip: (parseInt(pagina) - 1) * parseInt(limite)
      });

      // Transformar datos para el frontend
      const prestamosFormateados = prestamos.map(prestamo => {
        // Obtener el primer artículo de la solicitud
        const articulo = prestamo.contrato?.solicitud?.articulos?.[0];
        
        // Calcular días restantes
        const hoy = new Date();
        const vencimiento = new Date(prestamo.fechaVencimiento);
        const diasRestantes = Math.ceil((vencimiento - hoy) / (1000 * 60 * 60 * 24));
        
        // Calcular porcentaje de tiempo transcurrido
        const inicio = new Date(prestamo.fechaInicio);
        const tiempoTotal = vencimiento - inicio;
        const tiempoTranscurrido = hoy - inicio;
        const porcentajeTiempo = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100));

        return {
          id: prestamo.id,
          montoPrestado: prestamo.montoPrestado,
          tasaInteres: prestamo.tasaInteres,
          plazoMeses: prestamo.plazoMeses,
          fechaInicio: prestamo.fechaInicio,
          fechaVencimiento: prestamo.fechaVencimiento,
          estado: prestamo.estado,
          saldoPendiente: prestamo.saldoPendiente,
          costoAlmacenamiento: prestamo.costoAlmacenamiento,
          diasRestantes: Math.max(0, diasRestantes),
          porcentajeTiempo: Math.round(porcentajeTiempo),
          
          // Información del contrato y solicitud
          contrato: {
            id: prestamo.contrato?.id,
            fechaFirma: prestamo.contrato?.fechaFirma,
            estadoFirma: prestamo.contrato?.estadoFirma,
            solicitud: {
              id: prestamo.contrato?.solicitud?.id,
              fechaSolicitud: prestamo.contrato?.solicitud?.fechaSolicitud,
              estado: prestamo.contrato?.solicitud?.estado,
              articulos: prestamo.contrato?.solicitud?.articulos?.map(art => ({
                id: art.id,
                descripcion: art.descripcion,
                marca: art.marca,
                modelo: art.modelo,
                estadoFisico: art.estadoFisico,
                valorEstimadoCliente: art.valorEstimadoCliente,
                tipoArticulo: art.tipoArticulo?.nombre
              }))
            }
          },
          
          // Información de pagos
          ultimoPago: prestamo.pagos?.[0] || null,
          totalPagos: prestamo.pagos?.length || 0,
          
          // Plan de pagos
          planPagos: prestamo.planPagos || []
        };
      });

      // Contar total para paginación
      const total = await prisma.prestamo.count({ where: whereClause });

      res.status(200).json({
        success: true,
        data: {
          prestamos: prestamosFormateados,
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total
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

  // Obtener estadísticas del usuario
  async getEstadisticas(req, res) {
    try {
      // CORREGIDO: usar req.user.id en lugar de req.user.userId
      const userId = req.user.id;

      console.log(`📈 Obteniendo estadísticas para usuario: ${userId}`);

      // Contar préstamos por estado
      const prestamosActivos = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Activo'
        }
      });

      const prestamosVencidos = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Vencido'
        }
      });

      const prestamosEnMora = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'En_Mora'
        }
      });

      const prestamosPagados = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Pagado'
        }
      });

      // Calcular totales monetarios
      const totales = await prisma.prestamo.aggregate({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: {
            in: ['Activo', 'Vencido', 'En_Mora']
          }
        },
        _sum: {
          montoPrestado: true,
          saldoPendiente: true
        }
      });

      // Calcular próximos vencimientos (próximos 30 días)
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() + 30);

      const prestamosPendientes = await prisma.prestamo.count({
        where: {
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: {
            in: ['Activo', 'Vencido']
          },
          fechaVencimiento: {
            lte: fechaLimite
          }
        }
      });

      // Límite disponible (ejemplo: Q50,000 - total prestado)
      const limiteMaximo = 50000;
      const totalPrestado = Number(totales._sum.montoPrestado) || 0;
      const limiteDisponible = Math.max(0, limiteMaximo - totalPrestado);

      const estadisticas = {
        prestamosActivos,
        prestamosPendientes,
        prestamosVencidos,
        prestamosEnMora,
        prestamosPagados,
        totalPrestado,
        saldoPendienteTotal: Number(totales._sum.saldoPendiente) || 0,
        limiteDisponible,
        limiteMaximo
      };

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
      const userId = req.user.id;
      const { fechaInicio, fechaFin, limite = 20, pagina = 1 } = req.query;

      console.log(`📚 Obteniendo historial para usuario: ${userId}`);

      const whereClause = {
        contrato: {
          solicitud: {
            usuarioId: userId
          }
        },
        ...(fechaInicio && fechaFin && {
          createdAt: {
            gte: new Date(fechaInicio),
            lte: new Date(fechaFin)
          }
        })
      };

      const historial = await prisma.prestamo.findMany({
        where: whereClause,
        include: {
          contrato: {
            include: {
              solicitud: {
                include: {
                  articulos: {
                    include: {
                      tipoArticulo: true
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: parseInt(limite),
        skip: (parseInt(pagina) - 1) * parseInt(limite)
      });

      const total = await prisma.prestamo.count({ where: whereClause });

      const historialFormateado = historial.map(prestamo => {
        const articulo = prestamo.contrato?.solicitud?.articulos?.[0];
        return {
          id: prestamo.id,
          montoPrestado: prestamo.montoPrestado,
          saldoPendiente: prestamo.saldoPendiente,
          estado: prestamo.estado,
          fechaInicio: prestamo.fechaInicio,
          fechaVencimiento: prestamo.fechaVencimiento,
          articulo: {
            descripcion: articulo?.descripcion || 'Sin descripción',
            tipoArticulo: articulo?.tipoArticulo?.nombre || 'Sin tipo',
            marca: articulo?.marca,
            modelo: articulo?.modelo
          }
        };
      });

      res.status(200).json({
        success: true,
        data: {
          historial: historialFormateado,
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
  },

  // Calcular simulación de préstamo
  async calcularSimulacion(req, res) {
    try {
      const { valorArticulo, porcentajePrestamo = 50, plazoMeses = 1 } = req.query;

      if (!valorArticulo || valorArticulo <= 0) {
        return res.status(400).json({
          success: false,
          message: 'El valor del artículo debe ser mayor a 0'
        });
      }

      const valor = parseFloat(valorArticulo);
      const porcentaje = parseFloat(porcentajePrestamo);
      const plazo = parseInt(plazoMeses);

      // Tasa de interés mensual (5% por defecto)
      const tasaInteresMensual = 5.0;
      
      // Cálculos
      const montoPrestamo = valor * (porcentaje / 100);
      const interesTotal = montoPrestamo * (tasaInteresMensual / 100) * plazo;
      const totalPagar = montoPrestamo + interesTotal;

      const simulacion = {
        valorArticulo: valor,
        porcentajePrestamo: porcentaje,
        plazoMeses: plazo,
        tasaInteres: tasaInteresMensual,
        montoPrestamo,
        interesTotal,
        totalPagar,
        cuotaMensual: totalPagar / plazo
      };

      res.status(200).json({
        success: true,
        data: simulacion,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error calculando simulación:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculando simulación',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener detalle de un préstamo específico
  async getDetallePrestamo(req, res) {
    try {
      const { prestamoId } = req.params;
      const userId = req.user.id;

      console.log(`🔍 Obteniendo detalle del préstamo: ${prestamoId}`);

      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: parseInt(prestamoId),
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          }
        },
        include: {
          contrato: {
            include: {
              solicitud: {
                include: {
                  usuario: {
                    select: {
                      id: true,
                      nombre: true,
                      apellido: true,
                      email: true,
                      telefono: true
                    }
                  },
                  articulos: {
                    include: {
                      tipoArticulo: true,
                      avaluos: {
                        orderBy: { fechaAvaluo: 'desc' }
                      }
                    }
                  }
                }
              }
            }
          },
          pagos: {
            orderBy: { fechaPago: 'desc' }
          },
          planPagos: {
            orderBy: { numeroCuota: 'asc' }
          }
        }
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado'
        });
      }

      const articulo = prestamo.contrato?.solicitud?.articulos?.[0];
      const avaluo = articulo?.avaluos?.[0];

      const prestamoDetallado = {
        id: prestamo.id,
        montoPrestado: prestamo.montoPrestado,
        tasaInteres: prestamo.tasaInteres,
        plazoMeses: prestamo.plazoMeses,
        fechaInicio: prestamo.fechaInicio,
        fechaVencimiento: prestamo.fechaVencimiento,
        estado: prestamo.estado,
        saldoPendiente: prestamo.saldoPendiente,
        costoAlmacenamiento: prestamo.costoAlmacenamiento,
        
        contrato: {
          id: prestamo.contrato?.id,
          fechaFirma: prestamo.contrato?.fechaFirma,
          estadoFirma: prestamo.contrato?.estadoFirma,
          
          solicitud: {
            id: prestamo.contrato?.solicitud?.id,
            fechaSolicitud: prestamo.contrato?.solicitud?.fechaSolicitud,
            estado: prestamo.contrato?.solicitud?.estado,
            observaciones: prestamo.contrato?.solicitud?.observaciones,
            
            usuario: prestamo.contrato?.solicitud?.usuario,
            
            articulos: prestamo.contrato?.solicitud?.articulos?.map(art => ({
              id: art.id,
              descripcion: art.descripcion,
              marca: art.marca,
              modelo: art.modelo,
              serie: art.serie,
              color: art.color,
              estadoFisico: art.estadoFisico,
              valorEstimadoCliente: art.valorEstimadoCliente,
              especificacionesTecnicas: art.especificacionesTecnicas,
              tipoArticulo: art.tipoArticulo?.nombre,
              avaluos: art.avaluos || []
            }))
          }
        },
        
        pagos: prestamo.pagos || [],
        planPagos: prestamo.planPagos || [],
        
        // Información adicional calculada
        totalPagado: prestamo.pagos?.reduce((sum, pago) => sum + Number(pago.montoPago), 0) || 0,
        proximaCuota: prestamo.planPagos?.find(cuota => cuota.estado === 'Pendiente') || null
      };

      res.status(200).json({
        success: true,
        data: { prestamo: prestamoDetallado },
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
      const { monto, tipoPago, comprobante, notas } = req.body;
      const userId = req.user.id;

      console.log(`💰 Procesando pago para préstamo: ${prestamoId}`);

      // Validar que el préstamo pertenece al usuario
      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: parseInt(prestamoId),
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: {
            in: ['Activo', 'Vencido', 'En_Mora']
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
      const montoNumerico = parseFloat(monto);
      if (montoNumerico <= 0 || montoNumerico > prestamo.saldoPendiente) {
        return res.status(400).json({
          success: false,
          message: `El monto debe ser mayor a 0 y no exceder Q${prestamo.saldoPendiente.toFixed(2)}`
        });
      }

      // Crear el pago
      const pago = await prisma.pago.create({
        data: {
          prestamoId: prestamo.id,
          montoPago: montoNumerico,
          fechaPago: new Date(),
          tipoPago: tipoPago || 'Efectivo',
          comprobante: comprobante || null,
          notas: notas || null,
          estadoValidacion: 'Pendiente'
        }
      });

      // Actualizar saldo pendiente del préstamo
      const nuevoSaldo = Number(prestamo.saldoPendiente) - montoNumerico;
      const nuevoEstado = nuevoSaldo <= 0 ? 'Pagado' : prestamo.estado;

      await prisma.prestamo.update({
        where: { id: prestamo.id },
        data: {
          saldoPendiente: nuevoSaldo,
          estado: nuevoEstado
        }
      });

      res.status(200).json({
        success: true,
        message: 'Pago registrado exitosamente',
        data: {
          pago: {
            id: pago.id,
            monto: pago.montoPago,
            fecha: pago.fechaPago,
            tipo: pago.tipoPago,
            estado: pago.estadoValidacion
          },
          prestamo: {
            id: prestamo.id,
            saldoAnterior: prestamo.saldoPendiente,
            saldoNuevo: nuevoSaldo,
            estadoNuevo: nuevoEstado
          }
        },
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
      const { nuevoPlazo, observaciones } = req.body;
      const userId = req.user.id;

      console.log(`🔄 Renovando préstamo: ${prestamoId}`);

      // Validar que el préstamo pertenece al usuario y está activo
      const prestamo = await prisma.prestamo.findFirst({
        where: {
          id: parseInt(prestamoId),
          contrato: {
            solicitud: {
              usuarioId: userId
            }
          },
          estado: 'Activo'
        }
      });

      if (!prestamo) {
        return res.status(404).json({
          success: false,
          message: 'Préstamo no encontrado o no disponible para renovación'
        });
      }

      // Calcular nueva fecha de vencimiento
      const nuevaFecha = new Date(prestamo.fechaVencimiento);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + (nuevoPlazo || 1));

      // Actualizar préstamo
      const prestamoRenovado = await prisma.prestamo.update({
        where: { id: prestamo.id },
        data: {
          fechaVencimiento: nuevaFecha,
          plazoMeses: prestamo.plazoMeses + (nuevoPlazo || 1)
        }
      });

      res.status(200).json({
        success: true,
        message: 'Préstamo renovado exitosamente',
        data: {
          prestamo: {
            id: prestamoRenovado.id,
            fechaVencimientoAnterior: prestamo.fechaVencimiento,
            fechaVencimientoNueva: prestamoRenovado.fechaVencimiento,
            plazoNuevo: prestamoRenovado.plazoMeses
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error renovando préstamo:', error);
      res.status(500).json({
        success: false,
        message: 'Error renovando préstamo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};