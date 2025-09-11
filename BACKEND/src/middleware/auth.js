// BACKEND/src/middleware/auth.js
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Middleware principal de autenticación
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acceso requerido'
      });
    }

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
    
    // Buscar usuario en base de datos
    const user = await prisma.usuario.findUnique({
      where: { id: decoded.id }
    });

    if (!user || user.estado !== 'Activo') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido o usuario inactivo'
      });
    }

    // Agregar usuario al request
    req.user = {
      id: user.id,
      email: user.email,
      tipoUsuario: user.tipoUsuario,
      nombre: user.nombre,
      apellido: user.apellido
    };

    next();

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    console.error('❌ Error en middleware de auth:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor'
    });
  }
};

// Middleware para verificar rol de administrador
export const requireAdmin = (req, res, next) => {
  if (req.user.tipoUsuario !== 'Administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de administrador'
    });
  }
  next();
};

// Middleware para verificar rol de cliente
export const requireClient = (req, res, next) => {
  if (req.user.tipoUsuario !== 'Cliente') {
    return res.status(403).json({
      success: false,
      message: 'Acceso denegado. Se requieren permisos de cliente'
    });
  }
  next();
};

// Middleware opcional de auth (no falla si no hay token)
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tu_clave_secreta_aqui');
      const user = await prisma.usuario.findUnique({
        where: { id: decoded.id }
      });

      if (user && user.estado === 'Activo') {
        req.user = {
          id: user.id,
          email: user.email,
          tipoUsuario: user.tipoUsuario,
          nombre: user.nombre,
          apellido: user.apellido
        };
      }
    }

    next();
  } catch (error) {
    // En auth opcional, no fallar si hay error con el token
    next();
  }
};