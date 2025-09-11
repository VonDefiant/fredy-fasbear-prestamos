// ===============================================
// Archivo: BACKEND/src/app.js
// Archivo principal del servidor Express
// ===============================================

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

// Importar rutas
import apiRoutes from './routes/index.js';

// ===== CONFIGURACIÓN INICIAL =====
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ===== LOGGING INICIAL CON DETALLES =====
console.log('==========================================');
console.log('INICIANDO FREDY FASBEAR INDUSTRIES API');
console.log('==========================================');
console.log(`Puerto configurado: ${PORT}`);
console.log(`Entorno: ${NODE_ENV}`);
console.log(`Base de datos: ${process.env.DATABASE_URL ? 'Configurada [OK]' : 'NO configurada [ERROR]'}`);
console.log(`JWT Secret: ${process.env.JWT_SECRET ? 'Configurado [OK]' : 'NO configurado [ERROR]'}`);
console.log(`JWT Expires: ${process.env.JWT_EXPIRES_IN || '24h'}`);
console.log('==========================================');

// ===== INICIALIZAR PRISMA =====
const prisma = new PrismaClient({
  log: NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Probar conexión a la base de datos
async function testDatabaseConnection() {
  try {
    await prisma.$connect();
    console.log('[OK] Conexion a PostgreSQL establecida correctamente');
    
    // Verificar que las tablas existan
    const userCount = await prisma.usuario.count();
    console.log(`[INFO] Usuarios registrados: ${userCount}`);
  } catch (error) {
    console.error('[ERROR] Error conectando a la base de datos:', error.message);
    console.error('[TIP] Verifica tu DATABASE_URL en el archivo .env');
    process.exit(1);
  }
}

// ===== MIDDLEWARES GLOBALES =====

// Seguridad
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

// CORS
const corsOptions = {
  origin: [
    'http://localhost:3000',  // Frontend Nuxt
    'http://127.0.0.1:3000',
    'https://fredy-fasbear.vercel.app', // Si tienes dominio en producción
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
};

app.use(cors(corsOptions));

// Logging de requests
if (NODE_ENV === 'development') {
  app.use(morgan('[API] :method :url :status :res[content-length] - :response-time ms'));
} else {
  app.use(morgan('combined'));
}

// Compresión
app.use(compression());

// Parsing del body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ===== RUTAS PRINCIPALES =====

// Ruta raíz para verificación rápida
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Fredy Fasbear Industries API funcionando correctamente',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: NODE_ENV,
    port: PORT,
    endpoints: {
      api: '/api',
      health: '/api/health',
      info: '/api/info',
      auth: '/api/auth',
      homepage: '/api/homepage'
    }
  });
});

// Todas las rutas de API
app.use('/api', apiRoutes);

// ===== MANEJO DE ERRORES GLOBAL =====

// Middleware para rutas no encontradas
app.use((req, res) => {
  console.log(`[404] Ruta no encontrada: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: `Ruta no encontrada: ${req.method} ${req.originalUrl}`,
    suggestion: 'Verifica la URL y consulta /api/info para endpoints disponibles',
    timestamp: new Date().toISOString()
  });
});

// Middleware de manejo de errores
app.use((error, req, res, next) => {
  console.error('[ERROR] Error global capturado:', error);
  
  // Error de validación de JSON
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    return res.status(400).json({
      success: false,
      message: 'JSON inválido en el cuerpo de la petición',
      error: 'Syntax Error'
    });
  }

  // Error de Prisma
  if (error.code && error.code.startsWith('P')) {
    console.error('[PRISMA] Error de base de datos:', error.code, error.message);
    return res.status(500).json({
      success: false,
      message: 'Error en la base de datos',
      error: NODE_ENV === 'development' ? error.message : 'Database Error'
    });
  }

  // Error genérico
  res.status(error.status || 500).json({
    success: false,
    message: error.message || 'Error interno del servidor',
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
    method: req.method,
    ...(NODE_ENV === 'development' && { stack: error.stack })
  });
});

// ===== MANEJO DE PROCESOS =====

// Graceful shutdown
const gracefulShutdown = async (signal) => {
  console.log(`\n[SHUTDOWN] Recibida señal ${signal}. Cerrando servidor...`);
  
  try {
    await prisma.$disconnect();
    console.log('[OK] Desconectado de la base de datos');
    
    process.exit(0);
  } catch (error) {
    console.error('[ERROR] Error durante el cierre:', error);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Manejar errores no capturados
process.on('unhandledRejection', (reason, promise) => {
  console.error('[ERROR] Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[ERROR] Uncaught Exception:', error);
  process.exit(1);
});

// ===== INICIAR SERVIDOR =====

const startServer = async () => {
  try {
    console.log('[INIT] Probando conexion a base de datos...');
    
    // Probar conexión a base de datos primero
    await testDatabaseConnection();
    
    console.log('[INIT] Iniciando servidor HTTP...');
    
    // Iniciar servidor
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log('==========================================');
      console.log('SERVIDOR INICIADO EXITOSAMENTE!');
      console.log('==========================================');
      console.log(`Servidor corriendo en: http://localhost:${PORT}`);
      console.log(`API disponible en: http://localhost:${PORT}/api`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
      console.log(`Info de API: http://localhost:${PORT}/api/info`);
      console.log(`Auth endpoints: http://localhost:${PORT}/api/auth`);
      console.log(`Entorno: ${NODE_ENV}`);
      console.log(`Tiempo de inicio: ${new Date().toLocaleString()}`);
      console.log('==========================================');
      
      if (NODE_ENV === 'development') {
        console.log('TIPS PARA DESARROLLO:');
        console.log('  • Frontend: http://localhost:3000');
        console.log('  • Prisma Studio: npm run db:studio');
        console.log('  • Ver logs en tiempo real en esta consola');
        console.log('==========================================');
      }
    });

    // Configurar timeout
    server.timeout = 30000; // 30 segundos

    return server;
    
  } catch (error) {
    console.error('[FATAL] Error fatal al iniciar el servidor:', error);
    process.exit(1);
  }
};

// Exportar para testing
export { app, prisma };

// ===== INICIAR SERVIDOR INMEDIATAMENTE =====
console.log('[INIT] Iniciando aplicacion...');
startServer().catch(error => {
  console.error('[FATAL] Error en startServer:', error);
  process.exit(1);
});