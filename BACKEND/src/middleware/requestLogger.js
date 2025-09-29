import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const getClientIP = (req) => {
  return req.ip ||
         req.connection?.remoteAddress ||
         req.socket?.remoteAddress ||
         req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
         req.headers['x-real-ip'] ||
         'unknown';
};

const getUserAgent = (req) => {
  return req.headers['user-agent'] || 'unknown';
};

const determinarTipoAccion = (method, path) => {
  if (path.includes('/auth/login')) return 'LOGIN';
  if (path.includes('/auth/logout')) return 'LOGOUT';
  if (path.includes('/solicitudes') && method === 'POST') return 'CREAR';
  if (path.includes('/prestamos') && path.includes('/pagar')) return 'PAGO';
  if (path.includes('/prestamos') && path.includes('/renovar')) return 'RENOVACION';
  if (path.includes('/avaluos')) return 'AVALUO';
  
  switch (method) {
    case 'POST': return 'CREAR';
    case 'PUT':
    case 'PATCH': return 'ACTUALIZAR';
    case 'DELETE': return 'ELIMINAR';
    case 'GET': return 'CONSULTAR';
    default: return 'CONSULTAR';
  }
};

const extraerEntidadId = (path) => {
  const matches = path.match(/\/api\/\w+\/([a-zA-Z0-9\-_]+)/);
  return matches ? matches[1] : null;
};

const determinarEntidad = (path) => {
  if (path.includes('/prestamos')) return 'prestamo';
  if (path.includes('/solicitudes')) return 'solicitud';
  if (path.includes('/usuarios') || path.includes('/auth') || path.includes('/personal') || path.includes('/clients')) return 'usuario';
  if (path.includes('/avaluos')) return 'avaluo';
  if (path.includes('/articulos')) return 'articulo';
  if (path.includes('/parametro')) return 'parametro';
  if (path.includes('/admin')) return 'admin';
  if (path.includes('/pago')) return 'pago';
  if (path.includes('/producto')) return 'producto';
  if (path.includes('/pedido')) return 'pedido';
  if (path.includes('/ecommerce')) return 'ecommerce';
  return 'sistema';
};

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

export const requestLogger = async (req, res, next) => {
  const startTime = Date.now();
  const timestamp = new Date().toISOString();
  
  const requestInfo = {
    method: req.method,
    url: req.originalUrl,
    path: req.path,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    timestamp
  };
  
  if (process.env.NODE_ENV === 'development') {
    console.log(`🌐 ${requestInfo.timestamp} - ${requestInfo.method} ${requestInfo.url} - IP: ${requestInfo.ip}`);
  }
  
  const originalSend = res.send;
  const originalJson = res.json;
  let responseBody = null;
  let responseLogged = false;
  
  res.send = function(data) {
    if (!responseLogged) {
      responseBody = data;
      logResponse();
    }
    return originalSend.call(this, data);
  };
  
  res.json = function(data) {
    if (!responseLogged) {
      responseBody = data;
      logResponse();
    }
    return originalJson.call(this, data);
  };
  
  const logResponse = async () => {
    if (responseLogged) return;
    responseLogged = true;
    
    const endTime = Date.now();
    const duration = endTime - startTime;
    
    const responseInfo = {
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      contentLength: res.get('content-length') || 0
    };
    
    if (process.env.NODE_ENV === 'development') {
      const statusEmoji = res.statusCode < 400 ? '✅' : res.statusCode < 500 ? '⚠️' : '❌';
      console.log(`${statusEmoji} ${responseInfo.statusCode} - ${responseInfo.duration} - ${req.method} ${req.originalUrl}`);
      
      if (res.statusCode >= 400) {
        console.log(`   Error details: ${JSON.stringify(sanitizarDatos(responseBody), null, 2)}`);
      }
    }
    
    if (shouldLogToDatabase(req, res)) {
      try {
        await logToDatabase(req, res, requestInfo, responseInfo, duration);
      } catch (error) {
        // Silencioso en producción para no afectar rendimiento
      }
    }
  };
  
  req.on('error', (error) => {
    console.error('🚨 Request Error:', error);
  });
  
  res.on('error', (error) => {
    console.error('🚨 Response Error:', error);
  });
  
  next();
};

// MODIFICACIÓN PRINCIPAL: Función más inclusiva
const shouldLogToDatabase = (req, res) => {
  if (req.path.includes('/health') || req.path.includes('/info')) {
    return false;
  }
  
  if (req.path.includes('/uploads/') || req.path.includes('/static/')) {
    return false;
  }
  
  if (req.path.includes('/audit-logs')) {
    return false;
  }
  
  const importantPaths = [
    '/auth/', '/prestamos/', '/solicitudes/', '/avaluos/', '/pagos/',
    '/admin/', '/personal/', '/clients/', '/parametro', '/ecommerce',
    '/productos/', '/pedidos/', '/system-reports/'
  ];
  
  const isImportantPath = importantPaths.some(path => req.path.includes(path));
  const isError = res.statusCode >= 400;
  const isModifyAction = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method);
  
  const isImportantGET = req.method === 'GET' && (
    req.path.includes('/stats') ||
    req.path.includes('/dashboard') ||
    req.path.includes('/me') ||
    req.path.match(/\/\d+$/)
  );
  
  return (isImportantPath && (isModifyAction || isError || isImportantGET)) ||
         (req.user && isModifyAction);
};

const logToDatabase = async (req, res, requestInfo, responseInfo, duration) => {
  try {
    const userId = req.user?.id || req.user?.userId || null;
    const accion = determinarTipoAccion(req.method, req.path);
    const entidad = determinarEntidad(req.path);
    const entidadId = extraerEntidadId(req.path);
    
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

    try {
      const tableExists = await prisma.$queryRaw`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = 'log_actividad'
        );
      `;
      
      if (tableExists[0]?.exists) {
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
      }
    } catch (dbError) {
      // Silencioso para no afectar rendimiento
    }
    
  } catch (error) {
    // CRÍTICO: No relanzar el error para no afectar el request principal
  }
};

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
    userId: req.user?.id || req.user?.userId || null,
    timestamp: new Date().toISOString(),
    ...additionalInfo
  };
  
  console.error('❌ ERROR:', errorInfo);
};

export const logSecurityEvent = async (eventType, req, details = {}) => {
  const securityInfo = {
    eventType,
    ip: getClientIP(req),
    userAgent: getUserAgent(req),
    url: req.originalUrl,
    userId: req.user?.id || req.user?.userId || null,
    timestamp: new Date().toISOString(),
    details
  };
  
  console.warn('🔒 SECURITY EVENT:', securityInfo);

  try {
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'log_actividad'
      );
    `;
    
    if (tableExists[0]?.exists) {
      await prisma.logActividad.create({
        data: {
          usuarioId: req.user?.id || req.user?.userId || null,
          accion: 'SECURITY_EVENT',
          entidad: 'security',
          entidadId: eventType,
          detalles: securityInfo,
          ipAddress: getClientIP(req),
          userAgent: getUserAgent(req),
          fechaHora: new Date()
        }
      });
    }
  } catch (error) {
    // Silencioso
  }
};

export default {
  requestLogger,
  logError,
  logSecurityEvent
};