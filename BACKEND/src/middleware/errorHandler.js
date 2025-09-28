// ===============================================
// Archivo: BACKEND/src/middleware/errorHandler.js
// Middleware centralizado para manejo de errores
// ===============================================

import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library.js';

// Clase personalizada para errores de aplicación
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.code = code;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Función para manejar errores de Prisma
const handlePrismaError = (error) => {
  if (error instanceof PrismaClientKnownRequestError) {
    switch (error.code) {
      case 'P2002':
        // Violación de restricción única
        const field = error.meta?.target?.[0] || 'campo';
        return new AppError(`Ya existe un registro con este ${field}`, 400, 'DUPLICATE_FIELD');
      
      case 'P2025':
        // Registro no encontrado
        return new AppError('Registro no encontrado', 404, 'NOT_FOUND');
      
      case 'P2003':
        // Violación de clave foránea
        return new AppError('Operación no válida: referencia a datos inexistentes', 400, 'FOREIGN_KEY_VIOLATION');
      
      case 'P2014':
        // Violación de relación requerida
        return new AppError('Datos requeridos faltantes para esta operación', 400, 'REQUIRED_RELATION_VIOLATION');
      
      case 'P1001':
        // No se puede conectar a la base de datos
        return new AppError('Error de conexión a la base de datos', 503, 'DATABASE_CONNECTION_ERROR');
      
      case 'P1008':
        // Timeout de operación
        return new AppError('La operación tardó demasiado tiempo', 408, 'DATABASE_TIMEOUT');
      
      default:
        return new AppError('Error de base de datos', 500, 'DATABASE_ERROR');
    }
  }
  
  if (error instanceof PrismaClientValidationError) {
    return new AppError('Datos de entrada no válidos', 400, 'VALIDATION_ERROR');
  }
  
  return error;
};

// Función para manejar errores de JWT
const handleJWTError = (error) => {
  if (error.name === 'JsonWebTokenError') {
    return new AppError('Token de autenticación inválido', 401, 'INVALID_TOKEN');
  }
  
  if (error.name === 'TokenExpiredError') {
    return new AppError('Token de autenticación expirado', 401, 'EXPIRED_TOKEN');
  }
  
  if (error.name === 'NotBeforeError') {
    return new AppError('Token de autenticación aún no es válido', 401, 'PREMATURE_TOKEN');
  }
  
  return error;
};

// Función para manejar errores de validación
const handleValidationError = (error) => {
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors || {}).map(err => err.message);
    return new AppError(`Error de validación: ${errors.join(', ')}`, 400, 'VALIDATION_ERROR');
  }
  
  return error;
};

// Función para manejar errores de upload
const handleUploadError = (error) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return new AppError('Archivo muy grande. Verifique el tamaño máximo permitido', 400, 'FILE_TOO_LARGE');
  }
  
  if (error.code === 'LIMIT_FILE_COUNT') {
    return new AppError('Demasiados archivos. Verifique el límite permitido', 400, 'TOO_MANY_FILES');
  }
  
  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return new AppError('Campo de archivo inesperado', 400, 'UNEXPECTED_FILE_FIELD');
  }
  
  return error;
};

// Función para enviar error en desarrollo
const sendErrorDev = (err, res) => {
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      message: err.message,
      code: err.code || 'UNKNOWN_ERROR',
      stack: err.stack,
      details: err,
      timestamp: new Date().toISOString()
    }
  });
};

// Función para enviar error en producción
const sendErrorProd = (err, res) => {
  // Solo enviar errores operacionales al cliente
  if (err.isOperational) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      code: err.code,
      timestamp: new Date().toISOString()
    });
  } else {
    // Log del error para debugging
    console.error('ERROR NO OPERACIONAL:', err);
    
    // Enviar mensaje genérico
    res.status(500).json({
      success: false,
      message: 'Error interno del servidor',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString()
    });
  }
};

// Middleware principal de manejo de errores
export const errorHandler = (err, req, res, next) => {
  // Si no hay error, continuar
  if (!err) return next();
  
  // Copiar error para evitar mutar el original
  let error = { ...err };
  error.message = err.message;
  
  // Log del error
  console.error('🚨 ERROR CAPTURADO:', {
    message: error.message,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString()
  });
  
  // Manejar diferentes tipos de errores
  error = handlePrismaError(error);
  error = handleJWTError(error);
  error = handleValidationError(error);
  error = handleUploadError(error);
  
  // Si no es un AppError, convertirlo
  if (!(error instanceof AppError)) {
    error = new AppError(error.message || 'Error interno del servidor', 500, 'INTERNAL_SERVER_ERROR');
  }
  
  // Enviar respuesta según el entorno
  if (process.env.NODE_ENV ) {
    sendErrorDev(error, res);
  } else {
    sendErrorProd(error, res);
  }
};

// Middleware para capturar errores async
export const catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

// Middleware para rutas no encontradas
export const notFound = (req, res, next) => {
  const error = new AppError(`Ruta ${req.originalUrl} no encontrada`, 404, 'ROUTE_NOT_FOUND');
  next(error);
};

export default {
  errorHandler,
  AppError,
  catchAsync,
  notFound
};