// ===============================================
// Archivo: BACKEND/src/services/solicitud.service.js
// Servicio para la lógica de negocio de solicitudes
// ===============================================

import { PrismaClient } from '@prisma/client';
import prestamoService from './prestamo.service.js';

const prisma = new PrismaClient();

// Configuración de solicitudes
const CONFIGURACION = {
  LIMITE_SOLICITUDES_PENDIENTES: 3, // Máximo 3 solicitudes pendientes por usuario
  MONTO_MINIMO_SOLICITUD: 100, // Q100 mínimo
  MONTO_MAXIMO_SOLICITUD: 50000, // Q50,000 máximo
  DIAS_EXPIRACION_SOLICITUD: 30, // 30 días para responder
  DIAS_VALIDEZ_OFERTA: 7, // 7 días para aceptar oferta
  PORCENTAJE_MINIMO_AVALUO: 30, // 30% mínimo del valor estimado
  PORCENTAJE_MAXIMO_AVALUO: 80 // 80% máximo del valor estimado
};

export default {
  // Generar número único de solicitud
  async generarNumeroSolicitud() {
    const año = new Date().getFullYear();
    const contador = await prisma.solicitudEmpeno.count({
      where: {
        fechaSolicitud: {
          gte: new Date(`${año}-01-01`),
          lt: new Date(`${año + 1}-01-01`)
        }
      }
    });
    
    return `SOL-${año}-${String(contador + 1).padStart(6, '0')}`;
  },

  // Validar límites del usuario para crear solicitudes
  async validarLimitesUsuario(usuarioId, montoSolicitado) {
    try {
      // Verificar solicitudes pendientes
      const solicitudesPendientes = await prisma.solicitudEmpeno.count({
        where: {
          usuarioId,
          estado: {
            in: ['pendiente', 'en_evaluacion', 'aprobada']
          }
        }
      });

      if (solicitudesPendientes >= CONFIGURACION.LIMITE_SOLICITUDES_PENDIENTES) {
        return {
          esValido: false,
          mensaje: `Máximo ${CONFIGURACION.LIMITE_SOLICITUDES_PENDIENTES} solicitudes pendientes permitidas`
        };
      }

      // Verificar monto mínimo y máximo
      if (montoSolicitado < CONFIGURACION.MONTO_MINIMO_SOLICITUD) {
        return {
          esValido: false,
          mensaje: `El monto mínimo de solicitud es Q${CONFIGURACION.MONTO_MINIMO_SOLICITUD}`
        };
      }

      if (montoSolicitado > CONFIGURACION.MONTO_MAXIMO_SOLICITUD) {
        return {
          esValido: false,
          mensaje: `El monto máximo de solicitud es Q${CONFIGURACION.MONTO_MAXIMO_SOLICITUD}`
        };
      }

      // Verificar límites de préstamos activos
      const validacionPrestamos = await prestamoService.validarLimitesUsuario(usuarioId, montoSolicitado);
      if (!validacionPrestamos.esValido) {
        return validacionPrestamos;
      }

      return {
        esValido: true,
        mensaje: 'Validación exitosa'
      };

    } catch (error) {
      console.error('Error validando límites de usuario:', error);
      return {
        esValido: false,
        mensaje: 'Error validando límites del usuario'
      };
    }
  },

  // Notificar nueva solicitud al equipo
  async notificarNuevaSolicitud(solicitudId) {
    try {
      console.log(`📧 Notificando nueva solicitud: ${solicitudId}`);
      
      // Aquí puedes implementar:
      // - Envío de email al equipo de avalúos
      // - Notificación push a la app del equipo
      // - Mensaje de Slack/Teams
      // - Webhook a sistemas externos
      
      // Por ahora solo logueamos
      const solicitud = await prisma.solicitudEmpeno.findUnique({
        where: { id: solicitudId },
        include: {
          usuario: {
            select: {
              nombre: true,
              apellido: true,
              email: true
            }
          },
          articulo: {
            include: {
              categoria: true
            }
          }
        }
      });

      if (solicitud) {
        console.log(`📬 Nueva solicitud de empéño:
          • ID: ${solicitud.numeroSolicitud}
          • Cliente: ${solicitud.usuario.nombre} ${solicitud.usuario.apellido}
          • Artículo: ${solicitud.articulo.nombre}
          • Categoría: ${solicitud.articulo.categoria.nombre}
          • Monto solicitado: Q${solicitud.montoSolicitado}
          • Email: ${solicitud.usuario.email}
        `);
      }

      return {
        success: true,
        mensaje: 'Notificación enviada'
      };

    } catch (error) {
      console.error('Error notificando nueva solicitud:', error);
      return {
        success: false,
        mensaje: 'Error enviando notificación'
      };
    }
  },

  // Convertir solicitud aprobada a préstamo
  async convertirSolicitudAPrestamo(solicitud) {
    try {
      return await prisma.$transaction(async (tx) => {
        // Obtener el último avalúo
        const ultimoAvaluo = await tx.avaluo.findFirst({
          where: { articuloId: solicitud.articuloId },
          orderBy: { fechaAvaluo: 'desc' }
        });

        if (!ultimoAvaluo) {
          throw new Error('No se encontró avalúo para la solicitud');
        }

        // Generar número de préstamo
        const numeroPrestamo = await prestamoService.generarNumeroPrestamo();

        // Calcular fechas
        const fechaCreacion = new Date();
        const fechaVencimiento = new Date();
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + solicitud.plazoMeses);

        // Calcular montos finales
        const montoPrestado = solicitud.montoAprobado || ultimoAvaluo.montoMaximoPrestamo;
        const tasaInteres = 5; // 5% mensual
        const interesTotal = montoPrestado * (tasaInteres / 100) * solicitud.plazoMeses;
        const totalPagar = montoPrestado + interesTotal;

        // Crear el préstamo
        const prestamo = await tx.prestamo.create({
          data: {
            numeroPrestamo,
            usuarioId: solicitud.usuarioId,
            articuloId: solicitud.articuloId,
            solicitudId: solicitud.id,
            montoPrestado,
            interesTotal,
            totalPagar,
            montoPagado: 0,
            plazoMeses: solicitud.plazoMeses,
            tasaInteres,
            modalidadPago: solicitud.modalidadPago,
            fechaCreacion,
            fechaVencimiento,
            estado: 'activo'
          }
        });

        // Actualizar la solicitud
        await tx.solicitudEmpeno.update({
          where: { id: solicitud.id },
          data: {
            estado: 'convertida',
            fechaRespuesta: new Date()
          }
        });

        // Actualizar el artículo
        await tx.articulo.update({
          where: { id: solicitud.articuloId },
          data: { estado: 'empenado' }
        });

        return prestamo;
      });

    } catch (error) {
      console.error('Error convirtiendo solicitud a préstamo:', error);
      throw error;
    }
  },

  // Calcular días transcurridos desde la solicitud
  calcularDiasTranscurridos(fechaSolicitud) {
    const hoy = new Date();
    const solicitud = new Date(fechaSolicitud);
    const diferencia = hoy.getTime() - solicitud.getTime();
    return Math.floor(diferencia / (1000 * 60 * 60 * 24));
  },

  // Verificar si una solicitud ha expirado
  solicitudExpirada(fechaSolicitud) {
    const diasTranscurridos = this.calcularDiasTranscurridos(fechaSolicitud);
    return diasTranscurridos > CONFIGURACION.DIAS_EXPIRACION_SOLICITUD;
  },

  // Verificar si una oferta ha expirado
  ofertaExpirada(fechaAprobacion) {
    if (!fechaAprobacion) return false;
    
    const hoy = new Date();
    const aprobacion = new Date(fechaAprobacion);
    const diferencia = hoy.getTime() - aprobacion.getTime();
    const diasTranscurridos = Math.floor(diferencia / (1000 * 60 * 60 * 24));
    
    return diasTranscurridos > CONFIGURACION.DIAS_VALIDEZ_OFERTA;
  },

  // Obtener texto descriptivo del estado
  getEstadoTexto(estado) {
    const estados = {
      'pendiente': 'Pendiente de Evaluación',
      'en_evaluacion': 'En Evaluación',
      'aprobada': 'Aprobada',
      'rechazada': 'Rechazada',
      'cancelada': 'Cancelada',
      'expirada': 'Expirada',
      'convertida': 'Convertida a Préstamo'
    };
    
    return estados[estado] || estado;
  },

  // Calcular rango de avalúo estimado
  calcularRangoAvaluoEstimado(valorEstimadoCliente, categoriaId) {
    // Obtener porcentajes según la categoría
    const porcentajeMinimo = CONFIGURACION.PORCENTAJE_MINIMO_AVALUO;
    const porcentajeMaximo = CONFIGURACION.PORCENTAJE_MAXIMO_AVALUO;
    
    return {
      valorMinimo: valorEstimadoCliente * (porcentajeMinimo / 100),
      valorMaximo: valorEstimadoCliente * (porcentajeMaximo / 100),
      montoMinimoPrestamoEstimado: valorEstimadoCliente * (porcentajeMinimo / 100) * 0.7,
      montoMaximoPrestamoEstimado: valorEstimadoCliente * (porcentajeMaximo / 100) * 0.7,
      observaciones: 'Estos valores son estimados y pueden variar según el avalúo profesional'
    };
  },

  // Validar archivos de solicitud
  validarArchivos(archivos) {
    const errores = [];
    
    // Validar fotos
    if (!archivos.fotos || archivos.fotos.length === 0) {
      errores.push('Se requiere al menos una foto del artículo');
    } else {
      const fotos = Array.isArray(archivos.fotos) ? archivos.fotos : [archivos.fotos];
      
      if (fotos.length > 5) {
        errores.push('Máximo 5 fotos permitidas');
      }
      
      fotos.forEach((foto, index) => {
        // Validar tipo de archivo
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!tiposPermitidos.includes(foto.mimetype)) {
          errores.push(`Foto ${index + 1}: Tipo de archivo no permitido. Use JPG, PNG o WebP`);
        }
        
        // Validar tamaño (5MB máximo)
        if (foto.size > 5 * 1024 * 1024) {
          errores.push(`Foto ${index + 1}: Archivo muy grande. Máximo 5MB`);
        }
      });
    }
    
    // Validar documento técnico (opcional)
    if (archivos.documentoTecnico) {
      const tiposDocPermitidos = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (!tiposDocPermitidos.includes(archivos.documentoTecnico.mimetype)) {
        errores.push('Documento técnico: Solo se permiten archivos PDF o Word');
      }
      
      if (archivos.documentoTecnico.size > 10 * 1024 * 1024) {
        errores.push('Documento técnico: Archivo muy grande. Máximo 10MB');
      }
    }
    
    return {
      esValido: errores.length === 0,
      errores
    };
  },

  // Procesar solicitudes expiradas automáticamente
  async procesarSolicitudesExpiradas() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - CONFIGURACION.DIAS_EXPIRACION_SOLICITUD);
      
      const solicitudesExpiradas = await prisma.solicitudEmpeno.updateMany({
        where: {
          estado: {
            in: ['pendiente', 'en_evaluacion']
          },
          fechaSolicitud: {
            lt: fechaLimite
          }
        },
        data: {
          estado: 'expirada',
          fechaRespuesta: new Date(),
          motivoCancelacion: 'Solicitud expirada por tiempo límite'
        }
      });

      console.log(`⏰ Procesadas ${solicitudesExpiradas.count} solicitudes expiradas`);
      return solicitudesExpiradas.count;

    } catch (error) {
      console.error('Error procesando solicitudes expiradas:', error);
      throw error;
    }
  },

  // Procesar ofertas expiradas automáticamente  
  async procesarOfertasExpiradas() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - CONFIGURACION.DIAS_VALIDEZ_OFERTA);
      
      const ofertasExpiradas = await prisma.solicitudEmpeno.updateMany({
        where: {
          estado: 'aprobada',
          fechaRespuesta: {
            lt: fechaLimite
          }
        },
        data: {
          estado: 'expirada',
          motivoCancelacion: 'Oferta expirada por tiempo límite'
        }
      });

      console.log(`⏰ Procesadas ${ofertasExpiradas.count} ofertas expiradas`);
      return ofertasExpiradas.count;

    } catch (error) {
      console.error('Error procesando ofertas expiradas:', error);
      throw error;
    }
  },

  // Obtener estadísticas de solicitudes
  async obtenerEstadisticasSolicitudes(usuarioId = null) {
    try {
      const whereClause = usuarioId ? { usuarioId } : {};
      
      const solicitudes = await prisma.solicitudEmpeno.findMany({
        where: whereClause
      });

      const estadisticas = {
        total: solicitudes.length,
        pendientes: solicitudes.filter(s => s.estado === 'pendiente').length,
        enEvaluacion: solicitudes.filter(s => s.estado === 'en_evaluacion').length,
        aprobadas: solicitudes.filter(s => s.estado === 'aprobada').length,
        rechazadas: solicitudes.filter(s => s.estado === 'rechazada').length,
        canceladas: solicitudes.filter(s => s.estado === 'cancelada').length,
        expiradas: solicitudes.filter(s => s.estado === 'expirada').length,
        convertidas: solicitudes.filter(s => s.estado === 'convertida').length
      };

      // Calcular tiempos promedio
      const solicitudesRespondidas = solicitudes.filter(s => s.fechaRespuesta);
      if (solicitudesRespondidas.length > 0) {
        const tiemposRespuesta = solicitudesRespondidas.map(s => {
          const inicio = new Date(s.fechaSolicitud);
          const fin = new Date(s.fechaRespuesta);
          return (fin.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24); // días
        });
        
        estadisticas.tiempoPromedioRespuesta = tiemposRespuesta.reduce((a, b) => a + b, 0) / tiemposRespuesta.length;
      } else {
        estadisticas.tiempoPromedioRespuesta = 0;
      }

      // Calcular tasa de aprobación
      const solicitudesEvaluadas = solicitudes.filter(s => ['aprobada', 'rechazada'].includes(s.estado));
      estadisticas.tasaAprobacion = solicitudesEvaluadas.length > 0 
        ? (estadisticas.aprobadas / solicitudesEvaluadas.length) * 100 
        : 0;

      return estadisticas;

    } catch (error) {
      console.error('Error obteniendo estadísticas de solicitudes:', error);
      throw error;
    }
  }
};