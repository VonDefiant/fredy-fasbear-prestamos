import express from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import archiver from 'archiver';
import prisma from '../config/database.js';
import uploadService from '../services/upload.service.js';

const router = express.Router();
const execAsync = promisify(exec);

// Directorio base para almacenar respaldos
const BACKUP_DIR = path.join(process.cwd(), 'backups');

// Asegurar que existe el directorio de respaldos
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
    console.log('📁 Directorio de respaldos creado:', BACKUP_DIR);
  }
}

// Middleware para logging
router.use((req, res, next) => {
  console.log(`💾 Backups API: ${req.method} ${req.path}`);
  next();
});

/**
 * GET /api/admin/backups
 * Obtiene la lista de todos los respaldos disponibles
 */
router.get('/', async (req, res) => {
  try {
    console.log('[BACKUPS] Obteniendo lista de respaldos...');
    
    await ensureBackupDir();
    
    // Leer archivos del directorio de respaldos
    const files = await fs.readdir(BACKUP_DIR);
    
    // Procesar información de cada respaldo
    const backups = await Promise.all(
      files
        .filter(file => file.endsWith('.zip') || file.endsWith('.sql'))
        .map(async (file) => {
          try {
            const filePath = path.join(BACKUP_DIR, file);
            const stats = await fs.stat(filePath);
            
            // Extraer información del nombre del archivo
            // Formato esperado: backup_TIPO_YYYYMMDD_HHMMSS.ext
            const nameParts = file.split('_');
            const tipo = nameParts[1] || 'unknown';
            
            return {
              id: file,
              nombre: file,
              tipo: determinarTipo(file),
              tipoLabel: obtenerTipoLabel(determinarTipo(file)),
              fecha: stats.mtime,
              tamano: formatearTamano(stats.size),
              tamanoBytes: stats.size,
              estado: 'completado',
              estadoLabel: 'Completado',
              usuario: 'Sistema', 
              ruta: filePath
            };
          } catch (error) {
            console.error(`Error procesando archivo ${file}:`, error);
            return null;
          }
        })
    );
    
    // Filtrar nulls y ordenar por fecha (más reciente primero)
    const backupsValidos = backups
      .filter(b => b !== null)
      .sort((a, b) => b.fecha - a.fecha);
    
    // Calcular estadísticas
    const estadisticas = {
      total: backupsValidos.length,
      tamanoTotal: backupsValidos.reduce((acc, b) => acc + b.tamanoBytes, 0),
      ultimo: backupsValidos.length > 0 ? backupsValidos[0].fecha : null,
      porTipo: {
        database: backupsValidos.filter(b => b.tipo === 'database').length,
        files: backupsValidos.filter(b => b.tipo === 'files').length,
        full: backupsValidos.filter(b => b.tipo === 'full').length
      }
    };
    
    console.log(`✅ ${backupsValidos.length} respaldos encontrados`);
    
    res.status(200).json({
      success: true,
      data: {
        backups: backupsValidos,
        estadisticas
      }
    });
    
  } catch (error) {
    console.error('[ERROR] Error obteniendo respaldos:', error);
    res.status(500).json({
      success: false,
      message: 'Error obteniendo lista de respaldos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * POST /api/admin/backups
 * Crea un nuevo respaldo del sistema
 * Body: { tipo: 'database' | 'files' | 'full' }
 */
router.post('/', async (req, res) => {
  try {
    const { tipo = 'full' } = req.body;
    const userId = req.user?.id || 'sistema';
    
    console.log(`[BACKUPS] Creando respaldo de tipo: ${tipo}`);
    
    await ensureBackupDir();
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    let backupPath = '';
    let backupInfo = {};
    
    switch (tipo) {
      case 'database':
        backupInfo = await crearRespaldoDB(timestamp);
        break;
        
      case 'files':
        backupInfo = await crearRespaldoArchivos(timestamp);
        break;
        
      case 'full':
        const dbBackup = await crearRespaldoDB(timestamp);
        const filesBackup = await crearRespaldoArchivos(timestamp);
        backupInfo = {
          tipo: 'full',
          archivos: [dbBackup.ruta, filesBackup.ruta],
          tamano: dbBackup.tamanoBytes + filesBackup.tamanoBytes
        };
        break;
        
      default:
        throw new Error('Tipo de respaldo no válido');
    }
    
    // Registrar en auditoría (opcional)
    try {
      await prisma.auditLog.create({
        data: {
          accion: 'BACKUP_CREATED',
          descripcion: `Respaldo ${tipo} creado exitosamente`,
          usuarioId: userId,
          metadata: JSON.stringify(backupInfo)
        }
      });
    } catch (auditError) {
      console.warn('No se pudo registrar en auditoría:', auditError.message);
    }
    
    console.log('✅ Respaldo creado exitosamente');
    
    res.status(201).json({
      success: true,
      message: 'Respaldo creado exitosamente',
      data: {
        backup: {
          tipo,
          timestamp: new Date().toISOString(),
          ...backupInfo
        }
      }
    });
    
  } catch (error) {
    console.error('[ERROR] Error creando respaldo:', error);
    res.status(500).json({
      success: false,
      message: 'Error creando respaldo del sistema',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * GET /api/admin/backups/:id
 * Obtiene detalles de un respaldo específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const backupPath = path.join(BACKUP_DIR, id);
    
    console.log(`[BACKUPS] Obteniendo detalles del respaldo: ${id}`);
    
    // Verificar que existe
    await fs.access(backupPath);
    const stats = await fs.stat(backupPath);
    
    const detalles = {
      id,
      nombre: id,
      tipo: determinarTipo(id),
      tipoLabel: obtenerTipoLabel(determinarTipo(id)),
      fecha: stats.mtime,
      tamano: formatearTamano(stats.size),
      tamanoBytes: stats.size,
      ruta: backupPath,
      checksum: await calcularChecksum(backupPath)
    };
    
    res.status(200).json({
      success: true,
      data: { backup: detalles }
    });
    
  } catch (error) {
    console.error('[ERROR] Error obteniendo detalles del respaldo:', error);
    
    if (error.code === 'ENOENT') {
      res.status(404).json({
        success: false,
        message: 'Respaldo no encontrado'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error obteniendo detalles del respaldo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * GET /api/admin/backups/:id/download
 * Descarga un respaldo específico
 */
router.get('/:id/download', async (req, res) => {
  try {
    const { id } = req.params;
    const backupPath = path.join(BACKUP_DIR, id);
    
    console.log(`[BACKUPS] Descargando respaldo: ${id}`);
    
    // Verificar que existe
    await fs.access(backupPath);
    
    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${id}"`);
    
    // Stream del archivo
    const fileStream = await fs.readFile(backupPath);
    res.send(fileStream);
    
    console.log('✅ Descarga iniciada');
    
  } catch (error) {
    console.error('[ERROR] Error descargando respaldo:', error);
    
    if (error.code === 'ENOENT') {
      res.status(404).json({
        success: false,
        message: 'Respaldo no encontrado'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error descargando respaldo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * DELETE /api/admin/backups/:id
 * Elimina un respaldo específico
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const backupPath = path.join(BACKUP_DIR, id);
    
    console.log(`[BACKUPS] Eliminando respaldo: ${id}`);
    
    // Verificar que existe
    await fs.access(backupPath);
    
    // Eliminar archivo
    await fs.unlink(backupPath);
    
    console.log('✅ Respaldo eliminado exitosamente');
    
    res.status(200).json({
      success: true,
      message: 'Respaldo eliminado exitosamente'
    });
    
  } catch (error) {
    console.error('[ERROR] Error eliminando respaldo:', error);
    
    if (error.code === 'ENOENT') {
      res.status(404).json({
        success: false,
        message: 'Respaldo no encontrado'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Error eliminando respaldo',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
});

/**
 * POST /api/admin/backups/cleanup
 * Limpia respaldos antiguos según política de retención
 * Body: { diasRetencion: 30 }
 */
router.post('/cleanup', async (req, res) => {
  try {
    const { diasRetencion = 30 } = req.body;
    
    console.log(`[BACKUPS] Limpiando respaldos con más de ${diasRetencion} días`);
    
    await ensureBackupDir();
    const files = await fs.readdir(BACKUP_DIR);
    
    const now = Date.now();
    const maxAge = diasRetencion * 24 * 60 * 60 * 1000; // días a milisegundos
    
    let eliminados = 0;
    
    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = await fs.stat(filePath);
      
      const edad = now - stats.mtime.getTime();
      
      if (edad > maxAge) {
        await fs.unlink(filePath);
        eliminados++;
        console.log(`🗑️ Eliminado respaldo antiguo: ${file}`);
      }
    }
    
    console.log(`✅ ${eliminados} respaldos eliminados`);
    
    res.status(200).json({
      success: true,
      message: `${eliminados} respaldos antiguos eliminados`,
      data: { eliminados }
    });
    
  } catch (error) {
    console.error('[ERROR] Error en limpieza de respaldos:', error);
    res.status(500).json({
      success: false,
      message: 'Error en limpieza de respaldos',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ===== FUNCIONES AUXILIARES =====

/**
 * Crea un respaldo de la base de datos
 */
async function crearRespaldoDB(timestamp) {
  try {
    const fileName = `backup_database_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);
    
    // Variables de entorno de la base de datos
    const {
      DATABASE_URL,
      DB_HOST = 'localhost',
      DB_PORT = '5432',
      DB_NAME,
      DB_USER,
      DB_PASSWORD
    } = process.env;
    
    // Comando para PostgreSQL
    const command = `PGPASSWORD="${DB_PASSWORD}" pg_dump -h ${DB_HOST} -p ${DB_PORT} -U ${DB_USER} -d ${DB_NAME} -F c -b -v -f "${filePath}"`;
    
    console.log('📊 Creando respaldo de base de datos...');
    await execAsync(command);
    
    const stats = await fs.stat(filePath);
    
    console.log('✅ Respaldo de base de datos creado');
    
    return {
      tipo: 'database',
      nombre: fileName,
      ruta: filePath,
      tamano: formatearTamano(stats.size),
      tamanoBytes: stats.size,
      fecha: new Date()
    };
    
  } catch (error) {
    console.error('Error creando respaldo de DB:', error);
    throw new Error('Error al crear respaldo de base de datos: ' + error.message);
  }
}

/**
 * Crea un respaldo de archivos del sistema
 */
async function crearRespaldoArchivos(timestamp) {
  try {
    const fileName = `backup_files_${timestamp}.zip`;
    const filePath = path.join(BACKUP_DIR, fileName);
    
    console.log('📦 Creando respaldo de archivos...');
    
    // Directorios a respaldar
    const dirsToBackup = [
      path.join(process.cwd(), 'uploads'),
      path.join(process.cwd(), 'public/uploads')
    ];
    
    // Crear archivo ZIP
    const output = await fs.open(filePath, 'w');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    archive.pipe(output.createWriteStream());
    
    // Agregar directorios al archivo
    for (const dir of dirsToBackup) {
      try {
        await fs.access(dir);
        archive.directory(dir, path.basename(dir));
      } catch {
        console.warn(`Directorio no existe: ${dir}`);
      }
    }
    
    await archive.finalize();
    
    const stats = await fs.stat(filePath);
    
    console.log('✅ Respaldo de archivos creado');
    
    return {
      tipo: 'files',
      nombre: fileName,
      ruta: filePath,
      tamano: formatearTamano(stats.size),
      tamanoBytes: stats.size,
      fecha: new Date()
    };
    
  } catch (error) {
    console.error('Error creando respaldo de archivos:', error);
    throw new Error('Error al crear respaldo de archivos: ' + error.message);
  }
}

/**
 * Determina el tipo de respaldo según el nombre del archivo
 */
function determinarTipo(fileName) {
  if (fileName.includes('_database_')) return 'database';
  if (fileName.includes('_files_')) return 'files';
  if (fileName.includes('_full_')) return 'full';
  return 'unknown';
}

/**
 * Obtiene la etiqueta legible del tipo
 */
function obtenerTipoLabel(tipo) {
  const labels = {
    database: 'Base de Datos',
    files: 'Archivos',
    full: 'Completo',
    unknown: 'Desconocido'
  };
  return labels[tipo] || 'Desconocido';
}

/**
 * Formatea el tamaño en bytes a formato legible
 */
function formatearTamano(bytes) {
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  const size = (bytes / Math.pow(1024, i)).toFixed(2);
  
  return `${size} ${sizes[i]}`;
}

/**
 * Calcula el checksum MD5 de un archivo (opcional)
 */
async function calcularChecksum(filePath) {
  try {
    const crypto = await import('crypto');
    const fileBuffer = await fs.readFile(filePath);
    const hashSum = crypto.createHash('md5');
    hashSum.update(fileBuffer);
    return hashSum.digest('hex');
  } catch (error) {
    console.warn('No se pudo calcular checksum:', error.message);
    return null;
  }
}

// ===== MIDDLEWARE DE ERROR =====
router.use((error, req, res, next) => {
  console.error('❌ Error en rutas de respaldos:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: 'Error en API de respaldos',
    error: process.env.NODE_ENV === 'development' ? error.message : 'Error interno del servidor'
  });
});

export default router;