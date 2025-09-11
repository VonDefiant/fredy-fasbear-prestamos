// BACKEND/src/controllers/auth.controller.js
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

// Generar JWT usando variables de entorno
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      tipoUsuario: user.tipoUsuario
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

// Formatear datos del usuario (remover passwordHash)
const formatUserResponse = (user) => {
  const { passwordHash, ...userWithoutPassword } = user;
  return userWithoutPassword;
};

const authController = {
  // POST /api/auth/register
  register: async (req, res) => {
    try {
      const {
        nombre,
        apellido,
        email,
        telefono,
        cedula,
        direccion,
        password,
        tipoUsuario = 'Cliente',
        fechaNacimiento
      } = req.body;

      console.log('[AUTH] Iniciando registro de usuario:', email);

      // Validaciones básicas
      if (!nombre || !apellido || !email || !password || !cedula) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos obligatorios deben ser completados'
        });
      }

      if (password.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      // Verificar si el usuario ya existe
      const existingUser = await prisma.usuario.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { cedula }
          ]
        }
      });

      if (existingUser) {
        console.log('[AUTH] Usuario ya existe:', email);
        return res.status(400).json({
          success: false,
          message: existingUser.email === email.toLowerCase() 
            ? 'Ya existe una cuenta con este email' 
            : 'Ya existe una cuenta con esta cédula'
        });
      }

      // Encriptar contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      console.log('[AUTH] Creando usuario en base de datos...');

      // Crear usuario (usando passwordHash como está en el schema)
      const newUser = await prisma.usuario.create({
        data: {
          nombre: nombre.trim(),
          apellido: apellido.trim(),
          email: email.toLowerCase().trim(),
          telefono,
          cedula,
          direccion,
          passwordHash: hashedPassword, // Campo correcto según schema
          tipoUsuario,
          fechaNacimiento: fechaNacimiento ? new Date(fechaNacimiento) : null,
          estado: 'Activo'
        }
      });

      // Generar token
      const token = generateToken(newUser);

      console.log('[AUTH] Usuario registrado exitosamente:', newUser.email);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: formatUserResponse(newUser),
          token
        }
      });

    } catch (error) {
      console.error('[ERROR] Error en registro:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // POST /api/auth/login
  login: async (req, res) => {
    try {
      const { email, password, remember = false } = req.body;

      console.log('[AUTH] Intento de login:', email);

      // Validaciones básicas
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email y contraseña son obligatorios'
        });
      }

      // Buscar usuario
      const user = await prisma.usuario.findUnique({
        where: {
          email: email.toLowerCase().trim()
        }
      });

      if (!user) {
        console.log('[AUTH] Usuario no encontrado:', email);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Verificar estado del usuario
      if (user.estado !== 'Activo') {
        console.log('[AUTH] Usuario inactivo:', email);
        return res.status(401).json({
          success: false,
          message: 'Cuenta inactiva. Contacta al administrador'
        });
      }

      // Verificar contraseña (usando passwordHash)
      const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
      if (!isPasswordValid) {
        console.log('[AUTH] Contraseña incorrecta para:', email);
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Actualizar último acceso
      await prisma.usuario.update({
        where: { id: user.id },
        data: { ultimoAcceso: new Date() }
      });

      // Generar token con duración según "remember"
      const tokenExpiry = remember ? '30d' : process.env.JWT_EXPIRES_IN;
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          tipoUsuario: user.tipoUsuario
        },
        process.env.JWT_SECRET,
        { expiresIn: tokenExpiry }
      );

      console.log('[AUTH] Login exitoso:', user.email);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: formatUserResponse(user),
          token,
          remember
        }
      });

    } catch (error) {
      console.error('[ERROR] Error en login:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // GET /api/auth/me
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id; // Del middleware de auth

      const user = await prisma.usuario.findUnique({
        where: { id: userId },
        include: {
          solicitudesPrestamo: {
            where: { estado: 'Aprobada' },
            take: 5,
            orderBy: { fechaSolicitud: 'desc' }
          }
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user: formatUserResponse(user)
        }
      });

    } catch (error) {
      console.error('[ERROR] Error obteniendo perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // PUT /api/auth/profile
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const { nombre, apellido, telefono, direccion } = req.body;

      const updatedUser = await prisma.usuario.update({
        where: { id: userId },
        data: {
          ...(nombre && { nombre: nombre.trim() }),
          ...(apellido && { apellido: apellido.trim() }),
          ...(telefono && { telefono }),
          ...(direccion && { direccion })
        }
      });

      console.log('[AUTH] Perfil actualizado:', updatedUser.email);

      res.status(200).json({
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: formatUserResponse(updatedUser)
        }
      });

    } catch (error) {
      console.error('[ERROR] Error actualizando perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // POST /api/auth/change-password
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual y nueva son obligatorias'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          success: false,
          message: 'La nueva contraseña debe tener al menos 8 caracteres'
        });
      }

      // Buscar usuario
      const user = await prisma.usuario.findUnique({
        where: { id: userId }
      });

      // Verificar contraseña actual (usando passwordHash)
      const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
      if (!isCurrentPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Contraseña actual incorrecta'
        });
      }

      // Encriptar nueva contraseña
      const hashedNewPassword = await bcrypt.hash(newPassword, 12);

      // Actualizar contraseña (usando passwordHash)
      await prisma.usuario.update({
        where: { id: userId },
        data: { passwordHash: hashedNewPassword }
      });

      console.log('[AUTH] Contraseña cambiada:', user.email);

      res.status(200).json({
        success: true,
        message: 'Contraseña actualizada exitosamente'
      });

    } catch (error) {
      console.error('[ERROR] Error cambiando contraseña:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  },

  // POST /api/auth/logout
  logout: async (req, res) => {
    try {
      // En un sistema con blacklist de tokens, aquí agregar el token a la blacklist
      // Por ahora, el logout se maneja principalmente en el frontend

      res.status(200).json({
        success: true,
        message: 'Logout exitoso'
      });

    } catch (error) {
      console.error('[ERROR] Error en logout:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor'
      });
    }
  }
};

export default authController;