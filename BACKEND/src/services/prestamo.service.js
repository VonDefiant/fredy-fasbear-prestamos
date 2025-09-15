// ===============================================
// Archivo: BACKEND/src/services/prestamo.service.js
// Servicio para la lógica de negocio de préstamos
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Configuración de tasas e intereses
const CONFIGURACION = {
  TASA_INTERES_MENSUAL: 5, // 5% mensual
  TASA_INTERES_SEMANAL: 1.25, // 1.25% semanal
  PORCENTAJE_MAXIMO_PRESTAMO: 70, // 70% del valor del artículo
  MONTO_MINIMO_PRESTAMO: 100, // Q100 mínimo
  MONTO_MAXIMO_PRESTAMO: 50000, // Q50,000 máximo por préstamo
  LIMITE_PRESTAMOS_ACTIVOS: 5, // Máximo 5 préstamos activos por usuario
  DIAS_GRACIA_VENCIMIENTO: 7 // 7 días de gracia después del vencimiento
};

export default {
  // Calcular simulación de préstamo
  calcularSimulacion({ valorArticulo, porcentajePrestamo = 50, plazoMeses = 1 }) {
    const montoPrestamo = valorArticulo * (porcentajePrestamo / 100);
    const tasaInteres = CONFIGURACION.TASA_INTERES_MENSUAL / 100;
    const interesTotal = montoPrestamo * tasaInteres * plazoMeses;
    const totalPagar = montoPrestamo + interesTotal;
    
    // Calcular plan de pagos mensual
    const pagoMensual = totalPagar / plazoMeses;
    
    const planPagos = [];
    const fechaInicio = new Date();
    
    for (let i = 1; i <= plazoMeses; i++) {
      const fechaPago = new Date(fechaInicio);
      fechaPago.setMonth(fechaPago.getMonth() + i);
      
      planPagos.push({
        cuota: i,
        fechaVencimiento: fechaPago,
        montoCuota: pagoMensual,
        capital: montoPrestamo / plazoMeses,
        interes: interesTotal / plazoMeses,
        saldoPendiente: totalPagar - (pagoMensual * i)
      });
    }
    
    return {
      valorArticulo,
      porcentajePrestamo,
      montoPrestamo,
      plazoMeses,
      tasaInteresMensual: CONFIGURACION.TASA_INTERES_MENSUAL,
      interesTotal,
      totalPagar,
      pagoMensual,
      planPagos,
      rangoRecomendado: {
        minimo: valorArticulo * 0.3,
        maximo: valorArticulo * 0.7,
        recomendado: valorArticulo * 0.5
      }
    };
  },

  // Calcular estadísticas del usuario
  async calcularEstadisticasUsuario(usuarioId) {
    try {
      // Obtener todos los préstamos del usuario
      const prestamos = await prisma.prestamo.findMany({
        where: { usuarioId },
        include: {
          pagos: true
        }
      });

      // Calcular estadísticas
      const prestamosActivos = prestamos.filter(p => p.estado === 'activo').length;
      const prestamosVencidos = prestamos.filter(p => 
        p.estado === 'vencido' || (p.estado === 'activo' && new Date(p.fechaVencimiento) < new Date())
      ).length;
      const prestamosCompletados = prestamos.filter(p => p.estado === 'completado').length;
      
      const totalPrestado = prestamos.reduce((sum, p) => sum + p.montoPrestado, 0);
      const totalPagado = prestamos.reduce((sum, p) => sum + p.montoPagado, 0);
      const totalPendiente = prestamos
        .filter(p => ['activo', 'vencido', 'renovado'].includes(p.estado))
        .reduce((sum, p) => sum + (p.totalPagar - p.montoPagado), 0);
      
      // Límite disponible (basado en límite máximo por usuario)
      const limiteMaximo = CONFIGURACION.MONTO_MAXIMO_PRESTAMO * CONFIGURACION.LIMITE_PRESTAMOS_ACTIVOS;
      const limiteUtilizado = prestamos
        .filter(p => ['activo', 'vencido', 'renovado'].includes(p.estado))
        .reduce((sum, p) => sum + p.montoPrestado, 0);
      const limiteDisponible = Math.max(0, limiteMaximo - limiteUtilizado);
      
      // Calcular historial crediticio
      const tasaPagosPuntuales = prestamosCompletados > 0 
        ? (prestamosCompletados / (prestamosCompletados + prestamosVencidos)) * 100 
        : 100;
      
      return {
        prestamosActivos,
        prestamosVencidos,
        prestamosCompletados,
        totalPrestamos: prestamos.length,
        montos: {
          totalPrestado,
          totalPagado,
          totalPendiente,
          limiteMaximo,
          limiteUtilizado,
          limiteDisponible
        },
        historialCrediticio: {
          tasaPagosPuntuales: Math.round(tasaPagosPuntuales),
          prestamosCompletos: prestamosCompletados,
          prestamosVencidos,
          calificacion: this.calcularCalificacionCrediticia(tasaPagosPuntuales, prestamos.length)
        }
      };
    } catch (error) {
      console.error('Error calculando estadísticas:', error);
      throw error;
    }
  },

  // Calcular calificación crediticia
  calcularCalificacionCrediticia(tasaPagosPuntuales, totalPrestamos) {
    if (totalPrestamos === 0) return 'NUEVO';
    if (tasaPagosPuntuales >= 95) return 'EXCELENTE';
    if (tasaPagosPuntuales >= 85) return 'BUENO';
    if (tasaPagosPuntuales >= 70) return 'REGULAR';
    return 'MALO';
  },

  // Procesar pago de préstamo
  async procesarPago({ prestamoId, monto, metodoPago, referencia, notas, usuarioId }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Obtener préstamo actual
        const prestamo = await tx.prestamo.findFirst({
          where: {
            id: prestamoId,
            usuarioId: usuarioId
          }
        });

        if (!prestamo) {
          throw new Error('Préstamo no encontrado');
        }

        // Validar monto
        const montoPendiente = prestamo.totalPagar - prestamo.montoPagado;
        if (monto > montoPendiente) {
          throw new Error(`El monto excede lo pendiente: Q${montoPendiente.toFixed(2)}`);
        }

        // Registrar el pago
        const pago = await tx.pagoPrestamo.create({
          data: {
            prestamoId,
            monto,
            metodoPago,
            referencia,
            notas,
            fechaPago: new Date(),
            procesadoPor: usuarioId
          }
        });

        // Actualizar el préstamo
        const nuevoMontoPagado = prestamo.montoPagado + monto;
        const prestamoActualizado = await tx.prestamo.update({
          where: { id: prestamoId },
          data: {
            montoPagado: nuevoMontoPagado,
            fechaUltimoPago: new Date(),
            estado: nuevoMontoPagado >= prestamo.totalPagar ? 'completado' : prestamo.estado
          }
        });

        // Si el préstamo se completó, actualizar el artículo
        if (nuevoMontoPagado >= prestamo.totalPagar) {
          await tx.articulo.update({
            where: { id: prestamo.articuloId },
            data: { estado: 'devuelto' }
          });
        }

        return {
          pago,
          prestamo: prestamoActualizado,
          montoPendiente: prestamo.totalPagar - nuevoMontoPagado,
          completado: nuevoMontoPagado >= prestamo.totalPagar
        };
      });
    } catch (error) {
      console.error('Error procesando pago:', error);
      throw error;
    }
  },

  // Renovar préstamo
  async renovarPrestamo({ prestamoId, nuevosPlazoMeses, pagoInicialRenovacion = 0, usuarioId }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Obtener préstamo actual
        const prestamo = await tx.prestamo.findFirst({
          where: {
            id: prestamoId,
            usuarioId: usuarioId
          }
        });

        if (!prestamo) {
          throw new Error('Préstamo no encontrado');
        }

        if (!['activo', 'vencido'].includes(prestamo.estado)) {
          throw new Error('El préstamo no puede ser renovado en su estado actual');
        }

        // Calcular nuevos montos
        const montoPendiente = prestamo.totalPagar - prestamo.montoPagado - pagoInicialRenovacion;
        const nuevosIntereses = montoPendiente * (CONFIGURACION.TASA_INTERES_MENSUAL / 100) * nuevosPlazoMeses;
        const nuevoTotalPagar = montoPendiente + nuevosIntereses;

        // Registrar pago inicial si existe
        if (pagoInicialRenovacion > 0) {
          await tx.pagoPrestamo.create({
            data: {
              prestamoId,
              monto: pagoInicialRenovacion,
              metodoPago: 'efectivo',
              notas: 'Pago inicial de renovación',
              fechaPago: new Date(),
              procesadoPor: usuarioId
            }
          });
        }

        // Registrar la renovación
        const renovacion = await tx.renovacionPrestamo.create({
          data: {
            prestamoId,
            plazoAnteriorMeses: prestamo.plazoMeses,
            plazoNuevoMeses: nuevosPlazoMeses,
            montoAnterior: prestamo.totalPagar,
            montoNuevo: nuevoTotalPagar,
            pagoInicialRenovacion,
            fechaRenovacion: new Date(),
            procesadoPor: usuarioId
          }
        });

        // Calcular nueva fecha de vencimiento
        const nuevaFechaVencimiento = new Date();
        nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + nuevosPlazoMeses);

        // Actualizar el préstamo
        const prestamoRenovado = await tx.prestamo.update({
          where: { id: prestamoId },
          data: {
            plazoMeses: nuevosPlazoMeses,
            interesTotal: prestamo.interesTotal + nuevosIntereses,
            totalPagar: prestamo.montoPagado + pagoInicialRenovacion + nuevoTotalPagar,
            montoPagado: prestamo.montoPagado + pagoInicialRenovacion,
            fechaVencimiento: nuevaFechaVencimiento,
            estado: 'renovado',
            fechaUltimoPago: pagoInicialRenovacion > 0 ? new Date() : prestamo.fechaUltimoPago
          }
        });

        return {
          prestamo: prestamoRenovado,
          renovacion,
          nuevaFechaVencimiento,
          nuevoTotalPagar: nuevoTotalPagar
        };
      });
    } catch (error) {
      console.error('Error renovando préstamo:', error);
      throw error;
    }
  },

  // Calcular plan de pagos detallado
  calcularPlanPagos(prestamo) {
    const montoPendiente = prestamo.totalPagar - prestamo.montoPagado;
    
    if (montoPendiente <= 0) {
      return {
        completado: true,
        montoPendiente: 0,
        cuotasRestantes: []
      };
    }

    const cuotasRestantes = [];
    const fechaActual = new Date();
    
    // Si el préstamo es mensual
    if (prestamo.modalidadPago === 'mensual') {
      const cuotasMensuales = prestamo.plazoMeses;
      const montoPorCuota = montoPendiente / cuotasMensuales;
      
      for (let i = 1; i <= cuotasMensuales; i++) {
        const fechaVencimiento = new Date(fechaActual);
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + i);
        
        cuotasRestantes.push({
          numero: i,
          fechaVencimiento,
          monto: montoPorCuota,
          estado: fechaVencimiento < fechaActual ? 'vencida' : 'pendiente'
        });
      }
    } else {
      // Si el préstamo es semanal
      const semanasTotal = prestamo.plazoMeses * 4; // 4 semanas por mes aproximadamente
      const montoPorSemana = montoPendiente / semanasTotal;
      
      for (let i = 1; i <= semanasTotal; i++) {
        const fechaVencimiento = new Date(fechaActual);
        fechaVencimiento.setDate(fechaVencimiento.getDate() + (i * 7));
        
        cuotasRestantes.push({
          numero: i,
          fechaVencimiento,
          monto: montoPorSemana,
          estado: fechaVencimiento < fechaActual ? 'vencida' : 'pendiente'
        });
      }
    }

    return {
      completado: false,
      montoPendiente,
      cuotasRestantes
    };
  },

  // Calcular días restantes hasta vencimiento
  calcularDiasRestantes(fechaVencimiento) {
    const hoy = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diferencia = vencimiento.getTime() - hoy.getTime();
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  },

  // Calcular porcentaje de tiempo transcurrido
  calcularPorcentajeTiempo(fechaCreacion, fechaVencimiento) {
    const inicio = new Date(fechaCreacion);
    const fin = new Date(fechaVencimiento);
    const hoy = new Date();
    
    const tiempoTotal = fin.getTime() - inicio.getTime();
    const tiempoTranscurrido = hoy.getTime() - inicio.getTime();
    
    const porcentaje = (tiempoTranscurrido / tiempoTotal) * 100;
    return Math.min(Math.max(porcentaje, 0), 100);
  },

  // Obtener texto descriptivo del estado
  getEstadoTexto(estado) {
    const estados = {
      'activo': 'Activo',
      'vencido': 'Vencido',
      'completado': 'Completado',
      'renovado': 'Renovado',
      'cancelado': 'Cancelado',
      'en_recuperacion': 'En Recuperación'
    };
    
    return estados[estado] || estado;
  },

  // Generar número único de préstamo
  async generarNumeroPrestamo() {
    const año = new Date().getFullYear();
    const contador = await prisma.prestamo.count({
      where: {
        fechaCreacion: {
          gte: new Date(`${año}-01-01`),
          lt: new Date(`${año + 1}-01-01`)
        }
      }
    });
    
    return `PR-${año}-${String(contador + 1).padStart(6, '0')}`;
  },

  // Validar si el usuario puede tomar un nuevo préstamo
  async validarLimitesUsuario(usuarioId, montoSolicitado) {
    try {
      const prestamosActivos = await prisma.prestamo.count({
        where: {
          usuarioId,
          estado: {
            in: ['activo', 'vencido', 'renovado']
          }
        }
      });

      if (prestamosActivos >= CONFIGURACION.LIMITE_PRESTAMOS_ACTIVOS) {
        return {
          esValido: false,
          mensaje: `Máximo ${CONFIGURACION.LIMITE_PRESTAMOS_ACTIVOS} préstamos activos permitidos`
        };
      }

      if (montoSolicitado < CONFIGURACION.MONTO_MINIMO_PRESTAMO) {
        return {
          esValido: false,
          mensaje: `El monto mínimo es Q${CONFIGURACION.MONTO_MINIMO_PRESTAMO}`
        };
      }

      if (montoSolicitado > CONFIGURACION.MONTO_MAXIMO_PRESTAMO) {
        return {
          esValido: false,
          mensaje: `El monto máximo es Q${CONFIGURACION.MONTO_MAXIMO_PRESTAMO}`
        };
      }

      return {
        esValido: true,
        mensaje: 'Validación exitosa'
      };
    } catch (error) {
      console.error('Error validando límites:', error);
      return {
        esValido: false,
        mensaje: 'Error validando límites del usuario'
      };
    }
  }
};