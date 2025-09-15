// ===============================================
// Archivo: BACKEND/src/app.js
// Archivo principal de la aplicación Fredy Fasbear Prestamos
// ===============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import dotenv from 'dotenv';

// Configurar rutas de archivos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Cargar variables de entorno
dotenv.config();

// Importar rutas
import routes from './routes/index.js';

// Importar middlewares personalizados
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';

// Crear aplicación Express
const app = express();

// ===== CONFIGURACIÓN DE SEGURIDAD =====

// Helmet para headers de seguridad
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// ===== MIDDLEWARES GENERALES =====

// Compresión gzip
app.use(compression());

// Parser de cookies
app.use(cookieParser());

// Logging de requests en desarrollo
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// Logger personalizado
app.use(requestLogger);

// Parser de JSON con límite
app.use(express.json({ 
  limit: '10mb',
  strict: true
}));

// Parser de URL encoded
app.use(express.urlencoded({ 
  extended: true, 
  limit: '10mb' 
}));

// ===== CONFIGURACIÓN DE UPLOAD DE ARCHIVOS =====

app.use(fileUpload({
  createParentPath: true,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB máximo
  },
  useTempFiles: true,
  tempFileDir: './tmp/',
  debug: process.env.NODE_ENV === 'development',
  abortOnLimit: true,
  responseOnLimit: 'El archivo es muy grande. Máximo 10MB permitido.',
  uploadTimeout: 60000, // 60 segundos timeout
  safeFileNames: true,
  preserveExtension: true
}));

// ===== SERVIR ARCHIVOS ESTÁTICOS =====

// Servir uploads de manera segura
app.use('/uploads', express.static(join(process.cwd(), 'uploads'), {
  maxAge: '1d',
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    // Configurar headers de seguridad para uploads
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    
    // Permitir solo ciertos tipos de archivo
    const allowedExtensions = ['.jpg', '.jpeg', '.png', '.webp', '.pdf', '.doc', '.docx'];
    const ext = path.substring(path.lastIndexOf('.')).toLowerCase();
    
    if (!allowedExtensions.includes(ext)) {
      res.status(403).end('Tipo de archivo no permitido');
    }
  }
}));

// ===== RUTAS PRINCIPALES =====

// Endpoint de salud básico (antes de las rutas principales)
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Fredy Fasbear Prestamos API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Registrar todas las rutas de la API
app.use('/api', routes);

// ===== MANEJO DE ERRORES Y RUTAS NO ENCONTRADAS =====

// Ruta catch-all para APIs no encontradas
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint de API no encontrado',
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Verifica la documentación de la API en /api/info'
  });
});

// Catch-all para otras rutas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Ruta no encontrada',
    path: req.originalUrl,
    available_endpoints: [
      '/ - Información básica',
      '/api/info - Información de la API',
      '/api/health - Estado del servicio',
      '/api/auth/* - Autenticación',
      '/api/prestamos/* - Gestión de préstamos',
      '/api/solicitudes/* - Gestión de solicitudes'
    ]
  });
});

// ===== MIDDLEWARE DE MANEJO DE ERRORES =====

app.use(errorHandler);

// ===== MANEJO DE ERRORES NO CAPTURADOS =====

process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// ===== GRACEFUL SHUTDOWN =====

const gracefulShutdown = (signal) => {
  console.log(`\n🛑 Recibida señal ${signal}. Cerrando servidor...`);
  
  server.close(() => {
    console.log('✅ Servidor cerrado correctamente');
    process.exit(0);
  });
  
  // Forzar cierre después de 10 segundos
  setTimeout(() => {
    console.error('⚠️ Forzando cierre del servidor');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// ===== INICIO DEL SERVIDOR =====

const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log('\n🚀 ====================================');
  console.log('   FREDY FASBEAR PRESTAMOS API');
  console.log('====================================');
  console.log(`🌍 Servidor corriendo en: http://${HOST}:${PORT}`);
  console.log(`📖 Documentación: http://${HOST}:${PORT}/api/info`);
  console.log(`❤️  Estado: http://${HOST}:${PORT}/api/health`);
  console.log(`🔧 Entorno: ${process.env.NODE_ENV || 'development'}`);
  console.log(`📅 Iniciado: ${new Date().toLocaleString()}`);
  console.log('====================================\n');
  
  // Información adicional en desarrollo
  if (process.env.NODE_ENV === 'development') {
    console.log('🛠️  MODO DESARROLLO ACTIVO');
    console.log('   - Logging detallado habilitado');
    console.log('   - Hot reload con nodemon');
    console.log('   - CORS permisivo configurado');
    console.log('   - Upload debugging habilitado\n');
  }
});

// Configurar timeouts del servidor
server.timeout = 120000; // 2 minutos
server.keepAliveTimeout = 65000; // 65 segundos
server.headersTimeout = 66000; // 66 segundos

export default app;