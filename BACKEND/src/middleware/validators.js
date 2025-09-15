// ===============================================
// Archivo: BACKEND/src/middleware/validators.js
// Middlewares de validación para rutas
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Validar que el préstamo existe y pertenece al usuario
export const validarPrestamo = async (req, res, next) => {
  try {
    const { prestamoId } = req.params;
    const { userId } = req.user;

    // Validar formato de ID
    if (!prestamoId || typeof prestamoId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de préstamo no válido'
      });
    }

    // Buscar el préstamo
    const prestamo = await prisma.prestamo.findFirst({
      where: {
        id: prestamoId,
        usuarioId: userId
      }
    });

    if (!prestamo) {
      const error = new Error('Préstamo no encontrado');
      error.code = 'PRESTAMO_NO_ENCONTRADO';
      error.status = 404;
      return next(error);
    }

    // Agregar préstamo al request para uso posterior
    req.prestamo = prestamo;
    next();

  } catch (error) {
    console.error('Error validando préstamo:', error);
    
    const validationError = new Error('Error validando préstamo');
    validationError.code = 'PRESTAMO_VALIDATION_ERROR';
    validationError.status = 500;
    next(validationError);
  }
};

// Validar que la solicitud existe y pertenece al usuario
export const validarSolicitud = async (req, res, next) => {
  try {
    const { solicitudId } = req.params;
    const { userId } = req.user;

    // Validar formato de ID
    if (!solicitudId || typeof solicitudId !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'ID de solicitud no válido'
      });
    }

    // Buscar la solicitud
    const solicitud = await prisma.solicitudEmpeno.findFirst({
      where: {
        id: solicitudId,
        usuarioId: userId
      }
    });

    if (!solicitud) {
      const error = new Error('Solicitud no encontrada');
      error.code = 'SOLICITUD_NO_ENCONTRADA';
      error.status = 404;
      return next(error);
    }

    // Agregar solicitud al request para uso posterior
    req.solicitud = solicitud;
    next();

  } catch (error) {
    console.error('Error validando solicitud:', error);
    
    const validationError = new Error('Error validando solicitud');
    validationError.code = 'SOLICITUD_VALIDATION_ERROR';
    validationError.status = 500;
    next(validationError);
  }
};

// Validar archivos subidos
export const validarArchivos = (req, res, next) => {
  try {
    const { files } = req;

    if (!files) {
      return res.status(400).json({
        success: false,
        message: 'No se encontraron archivos'
      });
    }

    // Validar fotos
    if (files.fotos) {
      const fotos = Array.isArray(files.fotos) ? files.fotos : [files.fotos];
      
      // Límite de cantidad
      if (fotos.length > 5) {
        const error = new Error('Máximo 5 fotos permitidas');
        error.code = 'LIMITE_ARCHIVOS_EXCEDIDO';
        error.status = 400;
        return next(error);
      }

      // Validar cada foto
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        
        // Validar tipo MIME
        const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!tiposPermitidos.includes(foto.mimetype)) {
          const error = new Error(`Foto ${i + 1}: Tipo de archivo no permitido. Use JPG, PNG o WebP`);
          error.code = 'TIPO_ARCHIVO_NO_PERMITIDO';
          error.status = 400;
          return next(error);
        }

        // Validar tamaño (5MB máximo)
        if (foto.size > 5 * 1024 * 1024) {
          const error = new Error(`Foto ${i + 1}: Archivo muy grande. Máximo 5MB`);
          error.code = 'ARCHIVO_MUY_GRANDE';
          error.status = 400;
          return next(error);
        }

        // Validar nombre de archivo
        if (!foto.name || foto.name.length > 255) {
          const error = new Error(`Foto ${i + 1}: Nombre de archivo no válido`);
          error.code = 'NOMBRE_ARCHIVO_INVALIDO';
          error.status = 400;
          return next(error);
        }
      }
    }

    // Validar documento técnico (opcional)
    if (files.documentoTecnico) {
      const doc = files.documentoTecnico;
      
      // Validar tipo MIME
      const tiposDocPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ];
      
      if (!tiposDocPermitidos.includes(doc.mimetype)) {
        const error = new Error('Documento técnico: Solo se permiten archivos PDF o Word');
        error.code = 'TIPO_ARCHIVO_NO_PERMITIDO';
        error.status = 400;
        return next(error);
      }

      // Validar tamaño (10MB máximo)
      if (doc.size > 10 * 1024 * 1024) {
        const error = new Error('Documento técnico: Archivo muy grande. Máximo 10MB');
        error.code = 'ARCHIVO_MUY_GRANDE';
        error.status = 400;
        return next(error);
      }
    }

    next();

  } catch (error) {
    console.error('Error validando archivos:', error);
    
    const validationError = new Error('Error validando archivos');
    validationError.code = 'ARCHIVO_VALIDATION_ERROR';
    validationError.status = 500;
    next(validationError);
  }
};

// Validar datos de pago
export const validarDatosPago = (req, res, next) => {
  try {
    const { monto, metodoPago, referencia } = req.body;

    // Validar monto
    if (!monto || isNaN(parseFloat(monto)) || parseFloat(monto) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El monto debe ser un número mayor a 0'
      });
    }

    // Validar método de pago
    const metodosPermitidos = ['efectivo', 'transferencia', 'tarjeta', 'deposito'];
    if (!metodoPago || !metodosPermitidos.includes(metodoPago)) {
      return res.status(400).json({
        success: false,
        message: 'Método de pago no válido. Métodos permitidos: ' + metodosPermitidos.join(', ')
      });
    }

    // Validar referencia para métodos que la requieren
    if (['transferencia', 'tarjeta', 'deposito'].includes(metodoPago)) {
      if (!referencia || referencia.trim().length < 3) {
        return res.status(400).json({
          success: false,
          message: 'La referencia es requerida para este método de pago'
        });
      }
    }

    // Normalizar datos
    req.body.monto = parseFloat(monto);
    req.body.referencia = referencia ? referencia.trim() : null;

    next();

  } catch (error) {
    console.error('Error validando datos de pago:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando datos de pago'
    });
  }
};

// Validar datos de renovación
export const validarDatosRenovacion = (req, res, next) => {
  try {
    const { nuevosPlazoMeses, pagoInicialRenovacion } = req.body;

    // Validar plazo
    if (!nuevosPlazoMeses || isNaN(parseInt(nuevosPlazoMeses))) {
      return res.status(400).json({
        success: false,
        message: 'El plazo debe ser un número válido'
      });
    }

    const plazo = parseInt(nuevosPlazoMeses);
    if (plazo < 1 || plazo > 12) {
      return res.status(400).json({
        success: false,
        message: 'El plazo debe ser entre 1 y 12 meses'
      });
    }

    // Validar pago inicial (opcional)
    if (pagoInicialRenovacion !== undefined && pagoInicialRenovacion !== '') {
      const pagoInicial = parseFloat(pagoInicialRenovacion);
      if (isNaN(pagoInicial) || pagoInicial < 0) {
        return res.status(400).json({
          success: false,
          message: 'El pago inicial debe ser un número mayor o igual a 0'
        });
      }
      req.body.pagoInicialRenovacion = pagoInicial;
    } else {
      req.body.pagoInicialRenovacion = 0;
    }

    // Normalizar datos
    req.body.nuevosPlazoMeses = plazo;

    next();

  } catch (error) {
    console.error('Error validando datos de renovación:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando datos de renovación'
    });
  }
};

// Validar parámetros de consulta común
export const validarParametrosConsulta = (req, res, next) => {
  try {
    let { limite, pagina, estado } = req.query;

    // Validar y normalizar límite
    if (limite) {
      limite = parseInt(limite);
      if (isNaN(limite) || limite < 1 || limite > 100) {
        return res.status(400).json({
          success: false,
          message: 'El límite debe ser un número entre 1 y 100'
        });
      }
    } else {
      limite = 10; // valor por defecto
    }

    // Validar y normalizar página
    if (pagina) {
      pagina = parseInt(pagina);
      if (isNaN(pagina) || pagina < 1) {
        return res.status(400).json({
          success: false,
          message: 'La página debe ser un número mayor a 0'
        });
      }
    } else {
      pagina = 1; // valor por defecto
    }

    // Validar estado si se proporciona
    if (estado) {
      const estadosPrestamoPermitidos = ['activo', 'vencido', 'completado', 'renovado', 'cancelado', 'todos'];
      const estadosSolicitudPermitidos = ['pendiente', 'en_evaluacion', 'aprobada', 'rechazada', 'cancelada', 'expirada', 'convertida', 'todas'];
      
      // Determinar qué tipo de estado validar basado en la ruta
      const esRutaPrestamos = req.originalUrl.includes('/prestamos');
      const estadosPermitidos = esRutaPrestamos ? estadosPrestamoPermitidos : estadosSolicitudPermitidos;
      
      if (!estadosPermitidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: `Estado no válido. Estados permitidos: ${estadosPermitidos.join(', ')}`
        });
      }
    }

    // Actualizar query con valores normalizados
    req.query.limite = limite;
    req.query.pagina = pagina;
    req.query.estado = estado;

    next();

  } catch (error) {
    console.error('Error validando parámetros de consulta:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando parámetros de consulta'
    });
  }
};

// Validar fechas en consultas
export const validarFechas = (req, res, next) => {
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (fechaInicio) {
      const inicio = new Date(fechaInicio);
      if (isNaN(inicio.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de inicio no válida. Use formato ISO (YYYY-MM-DD)'
        });
      }
      req.query.fechaInicio = inicio;
    }

    if (fechaFin) {
      const fin = new Date(fechaFin);
      if (isNaN(fin.getTime())) {
        return res.status(400).json({
          success: false,
          message: 'Fecha de fin no válida. Use formato ISO (YYYY-MM-DD)'
        });
      }
      req.query.fechaFin = fin;
    }

    // Validar que fecha inicio sea menor que fecha fin
    if (req.query.fechaInicio && req.query.fechaFin && req.query.fechaInicio > req.query.fechaFin) {
      return res.status(400).json({
        success: false,
        message: 'La fecha de inicio debe ser menor que la fecha de fin'
      });
    }

    next();

  } catch (error) {
    console.error('Error validando fechas:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando fechas'
    });
  }
};

// Validar simulación de préstamo
export const validarSimulacion = (req, res, next) => {
  try {
    const { valorArticulo, porcentajePrestamo, plazoMeses } = req.query;

    // Validar valor del artículo (requerido)
    if (!valorArticulo || isNaN(parseFloat(valorArticulo)) || parseFloat(valorArticulo) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'El valor del artículo es requerido y debe ser mayor a 0'
      });
    }

    // Validar porcentaje de préstamo (opcional, default 50)
    if (porcentajePrestamo) {
      const porcentaje = parseFloat(porcentajePrestamo);
      if (isNaN(porcentaje) || porcentaje < 10 || porcentaje > 80) {
        return res.status(400).json({
          success: false,
          message: 'El porcentaje de préstamo debe ser entre 10% y 80%'
        });
      }
      req.query.porcentajePrestamo = porcentaje;
    } else {
      req.query.porcentajePrestamo = 50;
    }

    // Validar plazo en meses (opcional, default 1)
    if (plazoMeses) {
      const plazo = parseInt(plazoMeses);
      if (isNaN(plazo) || plazo < 1 || plazo > 12) {
        return res.status(400).json({
          success: false,
          message: 'El plazo debe ser entre 1 y 12 meses'
        });
      }
      req.query.plazoMeses = plazo;
    } else {
      req.query.plazoMeses = 1;
    }

    // Normalizar valor del artículo
    req.query.valorArticulo = parseFloat(valorArticulo);

    next();

  } catch (error) {
    console.error('Error validando simulación:', error);
    res.status(500).json({
      success: false,
      message: 'Error validando parámetros de simulación'
    });
  }
};

// Middleware combinado para rutas de préstamos
export const validacionesPrestamoCompleta = [
  validarParametrosConsulta,
  validarFechas
];

// Middleware combinado para rutas de solicitudes
export const validacionesSolicitudCompleta = [
  validarParametrosConsulta,
  validarFechas
];