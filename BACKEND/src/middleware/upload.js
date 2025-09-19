// ===============================================
// Archivo: BACKEND/src/middleware/upload.js
// Middleware para manejo de subida de archivos
// ===============================================

import fileUpload from 'express-fileupload';
import path from 'path';
import fs from 'fs/promises';

// Configuración de subida de archivos
const UPLOAD_CONFIG = {
  // Límites de tamaño
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB máximo por archivo
    files: 6 // máximo 6 archivos (5 fotos + 1 documento)
  },
  
  // Opciones adicionales
  useTempFiles: true,
  tempFileDir: './tmp/',
  createParentPath: true,
  preserveExtension: true,
  safeFileNames: true,
  
  // Tiempo límite para la subida
  uploadTimeout: 60000, // 60 segundos
  
  // Configuración de debug
  debug: process.env.NODE_ENV === 'development'
};

// Tipos MIME permitidos
const ALLOWED_MIME_TYPES = {
  images: [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'image/webp'
  ],
  documents: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
};

// Extensiones permitidas
const ALLOWED_EXTENSIONS = {
  images: ['.jpg', '.jpeg', '.png', '.webp'],
  documents: ['.pdf', '.doc', '.docx', '.txt']
};

// Middleware principal de upload
export const uploadMiddleware = fileUpload(UPLOAD_CONFIG);

// Middleware para validar tipos de archivo
export const validateFileTypes = (req, res, next) => {
  try {
    if (!req.files) {
      return next();
    }

    const errors = [];

    // Validar fotos
    if (req.files.fotos) {
      const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
      
      fotos.forEach((foto, index) => {
        const extension = path.extname(foto.name).toLowerCase();
        
        if (!ALLOWED_MIME_TYPES.images.includes(foto.mimetype)) {
          errors.push(`Foto ${index + 1}: Tipo MIME no permitido (${foto.mimetype})`);
        }
        
        if (!ALLOWED_EXTENSIONS.images.includes(extension)) {
          errors.push(`Foto ${index + 1}: Extensión no permitida (${extension})`);
        }
      });
    }

    // Validar documento técnico
    if (req.files.documentoTecnico) {
      const doc = req.files.documentoTecnico;
      const extension = path.extname(doc.name).toLowerCase();
      
      if (!ALLOWED_MIME_TYPES.documents.includes(doc.mimetype)) {
        errors.push(`Documento: Tipo MIME no permitido (${doc.mimetype})`);
      }
      
      if (!ALLOWED_EXTENSIONS.documents.includes(extension)) {
        errors.push(`Documento: Extensión no permitida (${extension})`);
      }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Tipos de archivo no válidos',
        errors
      });
    }

    next();

  } catch (error) {
    console.error('Error validando tipos de archivo:', error);
    res.status(500).json({
      success: false,
      message: 'Error procesando archivos'
    });
  }
};

// Servicio de upload
export class UploadService {
  constructor() {
    this.uploadPath = process.env.UPLOAD_PATH || './uploads';
    this.ensureDirectories();
  }

  // Asegurar que los directorios de upload existen
  async ensureDirectories() {
    try {
      const directories = [
        `${this.uploadPath}/solicitudes/fotos`,
        `${this.uploadPath}/solicitudes/documentos`,
        `${this.uploadPath}/prestamos/contratos`,
        `${this.uploadPath}/prestamos/recibos`,
        `${this.uploadPath}/usuarios/avatars`,
        `${this.uploadPath}/temp`
      ];

      for (const dir of directories) {
        await fs.mkdir(dir, { recursive: true });
      }

      console.log('📁 Directorios de upload creados/verificados');
    } catch (error) {
      console.error('❌ Error creando directorios de upload:', error);
    }
  }

  // Guardar foto de solicitud
  async guardarFotoSolicitud(archivo, solicitudId) {
    try {
      const extension = path.extname(archivo.name);
      const timestamp = Date.now();
      const nombreArchivo = `${solicitudId}_${timestamp}${extension}`;
      const rutaDestino = path.join(this.uploadPath, 'solicitudes/fotos', nombreArchivo);

      await archivo.mv(rutaDestino);

      return {
        rutaArchivo: `/uploads/solicitudes/fotos/${nombreArchivo}`,
        nombreOriginal: archivo.name,
        tamano: archivo.size,
        tipoMime: archivo.mimetype
      };

    } catch (error) {
      console.error('Error guardando foto de solicitud:', error);
      throw new Error('Error guardando la foto');
    }
  }

  // Guardar documento técnico
  async guardarDocumentoTecnico(archivo, solicitudId) {
    try {
      const extension = path.extname(archivo.name);
      const timestamp = Date.now();
      const nombreArchivo = `doc_${solicitudId}_${timestamp}${extension}`;
      const rutaDestino = path.join(this.uploadPath, 'solicitudes/documentos', nombreArchivo);

      await archivo.mv(rutaDestino);

      return {
        rutaArchivo: `/uploads/solicitudes/documentos/${nombreArchivo}`,
        nombreOriginal: archivo.name,
        tamano: archivo.size,
        tipoMime: archivo.mimetype
      };

    } catch (error) {
      console.error('Error guardando documento técnico:', error);
      throw new Error('Error guardando el documento');
    }
  }

  // Guardar avatar de usuario
  async guardarAvatarUsuario(archivo, usuarioId) {
    try {
      const extension = path.extname(archivo.name);
      const nombreArchivo = `avatar_${usuarioId}${extension}`;
      const rutaDestino = path.join(this.uploadPath, 'usuarios/avatars', nombreArchivo);

      // Eliminar avatar anterior si existe
      await this.eliminarAvatarAnterior(usuarioId, extension);

      await archivo.mv(rutaDestino);

      return {
        rutaArchivo: `/uploads/usuarios/avatars/${nombreArchivo}`,
        nombreOriginal: archivo.name,
        tamano: archivo.size,
        tipoMime: archivo.mimetype
      };

    } catch (error) {
      console.error('Error guardando avatar:', error);
      throw new Error('Error guardando el avatar');
    }
  }

  // Eliminar avatar anterior
  async eliminarAvatarAnterior(usuarioId, nuevaExtension) {
    try {
      const extensionesPosibles = ['.jpg', '.jpeg', '.png', '.webp'];
      const avatarDirectory = path.join(this.uploadPath, 'usuarios/avatars');

      for (const ext of extensionesPosibles) {
        if (ext === nuevaExtension) continue;
        
        const rutaAnterior = path.join(avatarDirectory, `avatar_${usuarioId}${ext}`);
        
        try {
          await fs.access(rutaAnterior);
          await fs.unlink(rutaAnterior);
          console.log(`🗑️ Avatar anterior eliminado: ${rutaAnterior}`);
        } catch {
          // El archivo no existe, continuar
        }
      }
    } catch (error) {
      console.error('Error eliminando avatar anterior:', error);
      // No lanzar error, es opcional
    }
  }

  // Eliminar archivo
  async eliminarArchivo(rutaArchivo) {
    try {
      const rutaCompleta = path.join(process.cwd(), rutaArchivo);
      await fs.unlink(rutaCompleta);
      console.log(`🗑️ Archivo eliminado: ${rutaArchivo}`);
      return true;
    } catch (error) {
      console.error('Error eliminando archivo:', error);
      return false;
    }
  }

  // Limpiar archivos temporales
  async limpiarTemporales() {
    try {
      const tempDir = path.join(this.uploadPath, 'temp');
      const archivos = await fs.readdir(tempDir);
      
      const ahora = Date.now();
      const unDiaEnMs = 24 * 60 * 60 * 1000;

      for (const archivo of archivos) {
        const rutaArchivo = path.join(tempDir, archivo);
        const stats = await fs.stat(rutaArchivo);
        
        // Eliminar archivos más antiguos que 1 día
        if (ahora - stats.mtime.getTime() > unDiaEnMs) {
          await fs.unlink(rutaArchivo);
          console.log(`🧹 Archivo temporal eliminado: ${archivo}`);
        }
      }

    } catch (error) {
      console.error('Error limpiando archivos temporales:', error);
    }
  }

  // Obtener información de archivo
  async obtenerInfoArchivo(rutaArchivo) {
    try {
      const rutaCompleta = path.join(process.cwd(), rutaArchivo);
      const stats = await fs.stat(rutaCompleta);
      
      return {
        existe: true,
        tamano: stats.size,
        fechaCreacion: stats.birthtime,
        fechaModificacion: stats.mtime,
        esArchivo: stats.isFile(),
        esDirectorio: stats.isDirectory()
      };

    } catch (error) {
      return {
        existe: false,
        error: error.message
      };
    }
  }

  // Validar espacio disponible
  async validarEspacioDisponible(tamanioRequerido) {
    try {
      // Implementar lógica de verificación de espacio
      // Por ahora retornamos true
      return true;
    } catch (error) {
      console.error('Error validando espacio:', error);
      return false;
    }
  }
}

// Instancia global del servicio
export const uploadService = new UploadService();

// Middleware para limpiar archivos temporales en caso de error
export const cleanupOnError = (req, res, next) => {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Si hay error y archivos temporales, limpiarlos
    if (res.statusCode >= 400 && req.files) {
      setTimeout(() => {
        uploadService.limpiarTemporales().catch(console.error);
      }, 1000);
    }
    
    return originalSend.call(this, data);
  };
  
  next();
};

// Middleware para servir archivos estáticos de uploads
export const serveUploads = (req, res, next) => {
  const rutaArchivo = req.path;
  const rutaCompleta = path.join(process.cwd(), 'uploads', rutaArchivo);
  
  // Verificar que el archivo existe y está dentro del directorio permitido
  fs.access(rutaCompleta)
    .then(() => {
      res.sendFile(rutaCompleta);
    })
    .catch(() => {
      res.status(404).json({
        success: false,
        message: 'Archivo no encontrado'
      });
    });
};

export default {
  uploadMiddleware,
  validateFileTypes,
  uploadService,
  cleanupOnError,
  serveUploads
};