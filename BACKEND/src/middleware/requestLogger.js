// ===============================================
// Archivo: BACKEND/src/middleware/requestLogger.js
// Middleware para logging personalizado de requests
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Función para obtener la dirección IP real del cliente
const getClientIP = (req) => {
  return req.ip ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

// Función para obtener el User Agent
const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

// Función para determinar el tipo de acción basado en la ruta y método
const determinarTipoAccion = (method, path) => {
  // Mapeo de rutas a tipos de acción
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/solicitudes') && method === 'POST') return 'CREAR';
  if (path.includes('/prestamos') && path.includes('/pagar')) return 'PAGO';
  if (path.includes('/prestamos') && path.includes('/renovar')) return 'RENOVACION';
  if (path.includes('/avaluos')) return 'AVALUO';
  
  // Mapeo genérico por método HTTP
  switch (method) {
    case 'POST': return 'CREAR';
    case 'PUT':
    case 'PATCH': return 'ACTUALIZAR';
    case 'DELETE': return 'ELIMINAR';
    case 'GET': return 'CONSULTAR';
    default: return 'CONSULTAR';
  }
};

// Función para extraer el ID de entidad de la URL
const extraerEntidadId = (path) => {
  // Buscar patrones como /api/prestamos/123 o /api/solicitudes/abc-def
  const matches = path.match(/\/api\/\w+\/([a-zA-Z0-9\-_]+)/);
  return matches ? matches[1] : null;
};

// Función para determinar el tipo de entidad
const determinarEntidad = (path) => {
  if (path.includes('/prestamos')) return 'prestamo';
  if (path.includes('/solicitudes')) return 'solicitud';
  if (path.includes('/usuarios') || path.includes('/auth')) return 'usuario';
  if (path.includes('/avaluos')) return 'avaluo';
  if (path.includes('/articulos')) return 'articulo';
  return 'sistema';
};

// Función para sanitizar datos sensibles antes del logging
const sanitizarDatos = (data) => {
  if (!data || typeof data !== 'object') return data;
  
  const sensitiveFields = ['password', 'token', 'authorization', 'cookie'];
  const sanitized = { ...data };
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  });
  
  return sanitized;
};

// Middleware principal de logging
export const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  // Información básica del request
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    timestamp
  };
  
  // Log inmediato para desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 ${requestInfo.timestamp} - ${requestInfo.method} ${requestInfo.url} - IP: ${requestInfo.ip}`);
  }
  
  // Interceptar la respuesta para logging
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody = null;
  let responseLogged = false;
  
  // Sobrescribir res.send
  res.send = function(data) {
    if (!responseLogged) {
      responseBody = data;
      logResponse();
    }
    return originalSend.call(this, data);
  };
  
  // Sobrescribir res.json
  res.json = function(data) {
    if (!responseLogged) {
      responseBody = data;
      logResponse();
    }
    return originalJson.call(this, data);
  };
  
  // Función para hacer el log de la respuesta
  const logResponse = async () => {
    if (responseLogged) return;
    responseLogged = true;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    // Información de la respuesta
    const responseInfo = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0
    };
    
    // Log detallado para desarrollo
    if (process.env.NODE_ENV === 'development') {
      const statusEmoji = res.statusCode < 400 ? '✅' : res.statusCode < 500 ? '⚠️' : '❌';
      console.log(`${statusEmoji} ${responseInfo.statusCode} - ${responseInfo.duration} - ${req.method} ${req.originalUrl}`);
      
      // Log adicional para errores
      if (res.statusCode >= 400) {
        console.log(`   Error details: ${JSON.stringify(sanitizarDatos(responseBody), null, 2)}`);
      }
    }
    
    // Guardar en base de datos para acciones importantes (opcional)
    if (shouldLogToDatabase(req, res)) {
      try {
        await logToDatabase(req, res, requestInfo, responseInfo, duration);
      } catch (error) {
        console.error('Error logging to database:', error);
        // No fallar el request por errores de logging
      }
    }
  };
  
  // Manejar errores en el request
  req.on('error', (error) => {
    console.error('🚨 Request Error:', error);
  });
  
  res.on('error', (error) => {
    console.error('🚨 Response Error:', error);
  });
  
  next();
};

// Función para determinar si se debe guardar el log en la base de datos
const shouldLogToDatabase = (req, res) => {
  // No loguear requests de salud/info
  if (req.path.includes('/health') || req.path.includes('/info')) {
    return false;
  }
  
  // No loguear assets estáticos
  if (req.path.includes('/uploads/') || req.path.includes('/static/')) {
    return false;
  }
  
  // Loguear solo APIs importantes
  const importantPaths = ['/auth/', '/prestamos/', '/solicitudes/', '/avaluos/'];
  const isImportantPath = importantPaths.some(path => req.path.includes(path));
  
  // Loguear errores siempre
  const isError = res.statusCode >= 400;
  
  // Loguear acciones de modificación siempre
  const isModifyAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  
  return isImportantPath && (isModifyAction || isError);
};

// Función para guardar el log en la base de datos
const logToDatabase = async (req, res, requestInfo, responseInfo, duration) => {
  try {
    const userId = req.user?.userId || null;
    const accion = determinarTipoAccion(req.method, req.path);
    const entidad = determinarEntidad(req.path);
    const entidadId = extraerEntidadId(req.path);
    
    // Preparar detalles del log
    const detalles = {
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: sanitizarDatos(req.headers),
        query: req.query,
        body: sanitizarDatos(req.body)
      },
      response: {
        statusCode: res.statusCode,
        duration,
        contentLength: responseInfo.contentLength
      },
      metadata: {
        userAgent: requestInfo.userAgent,
        timestamp: requestInfo.timestamp
      }
    };
    
    // Guardar en la base de datos
    await prisma.logActividad.create({
      data: {
        usuarioId,
        accion,
        entidad,
        entidadId,
        detalles,
        ipAddress: requestInfo.ip,
        userAgent: requestInfo.userAgent,
        fechaHora: new Date()
      }
    });
    
  } catch (error) {
    console.error('Error guardando log en base de datos:', error);
    // No relanzar el error para no afectar el request principal
  }
};

// Middleware para logging de errores específicos
export const logError = (error, req, additionalInfo = {}) => {
  const errorInfo = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode,
    url: req.originalUrl,
    method: req.method,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    userId: req.user?.userId || null,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  console.error('🚨 ERROR LOG:', JSON.stringify(errorInfo, null, 2));
  
  // En producción, aquí podrías enviar a un servicio de logging externo
  // como Sentry, LogRocket, etc.
  if (process.env.NODE_ENV === 'production') {
    // Ejemplo: Sentry.captureException(error, { extra: errorInfo });
  }
};

// Middleware para logging de eventos de seguridad
export const logSecurityEvent = async (eventType, req, details = {}) => {
  const securityInfo = {
    eventType,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    url: req.originalUrl,
    userId: req.user?.userId || null,
    timestamp: new Date().toISOString(),
    details
  };
  
  console.warn('🔒 SECURITY EVENT:', JSON.stringify(securityInfo, null, 2));
  
  // Guardar eventos de seguridad importantes en la base de datos
  try {
    await prisma.logActividad.create({
      data: {
        usuarioId: req.user?.userId || null,
        accion: 'SECURITY_EVENT',
        entidad: 'security',
        entidadId: eventType,
        detalles: securityInfo,
        ipAddress: getClientIP(req),
        userAgent: getUserAgent(req),
        fechaHora: new Date()
      }
    });
  } catch (error) {
    console.error('Error logging security event:', error);
  }
};

export default {
  requestLogger,
  logError,
  logSecurityEvent
};