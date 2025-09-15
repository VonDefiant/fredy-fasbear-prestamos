// ===============================================
// Archivo: BACKEND/src/controllers/solicitudes.controller.js
// Controlador temporal para solicitudes (sin dependencias externas)
// ===============================================

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default {
  // Crear nueva solicitud de empéño
  async crearSolicitud(req, res) {
    try {
      const { userId } = req.user;
      const {
        tipoArticulo,
        descripcion,
        estadoFisico,
        valorEstimado,
        marca,
        modelo,
        especificacionesTecnicas,
        montoSolicitado,
        plazoMeses,
        modalidadPago,
        planPagos,
        rangoAvaluo,
        aceptaTerminos
      } = req.body;

      console.log(`📝 Creando nueva solicitud para usuario: ${userId}`);

      // Validaciones básicas
      if (!tipoArticulo || !descripcion || !valorEstimado || !montoSolicitado) {
        return res.status(400).json({
          success: false,
          message: 'Faltan campos obligatorios'
        });
      }

      if (!aceptaTerminos || aceptaTerminos === 'false') {
        return res.status(400).json({
          success: false,
          message: 'Debe aceptar los términos y condiciones'
        });
      }

      // Generar número único de solicitud
      const año = new Date().getFullYear();
      const contador = await prisma.solicitudEmpeno?.count?.({
        where: {
          fechaSolicitud: {
            gte: new Date(`${año}-01-01`),
            lt: new Date(`${año + 1}-01-01`)
          }
        }
      }) || 0;
      
      const numeroSolicitud = `SOL-${año}-${String(contador + 1).padStart(6, '0')}`;

      // Procesar archivos subidos (simplificado)
      let fotosInfo = [];
      let documentoInfo = null;

      if (req.files) {
        // Procesar fotos
        if (req.files.fotos) {
          const fotos = Array.isArray(req.files.fotos) ? req.files.fotos : [req.files.fotos];
          fotosInfo = fotos.map((foto, index) => ({
            nombre: foto.name,
            tamaño: foto.size,
            tipo: foto.mimetype,
            esPrincipal: index === 0
          }));
        }

        // Procesar documento técnico
        if (req.files.documentoTecnico) {
          documentoInfo = {
            nombre: req.files.documentoTecnico.name,
            tamaño: req.files.documentoTecnico.size,
            tipo: req.files.documentoTecnico.mimetype
          };
        }
      }

      // Crear solicitud en base de datos (simulado sin Prisma por ahora)
      const solicitudData = {
        numeroSolicitud,
        usuarioId: userId,
        tipoArticulo: parseInt(tipoArticulo),
        descripcion,
        estadoFisico,
        valorEstimado: parseFloat(valorEstimado),
        marca,
        modelo,
        especificacionesTecnicas,
        montoSolicitado: parseFloat(montoSolicitado),
        plazoMeses: parseInt(plazoMeses),
        modalidadPago,
        planPagosJson: planPagos ? JSON.stringify(planPagos) : null,
        rangoAvaluoJson: rangoAvaluo ? JSON.stringify(rangoAvaluo) : null,
        aceptaTerminos: true,
        fotosInfo: JSON.stringify(fotosInfo),
        documentoInfo: documentoInfo ? JSON.stringify(documentoInfo) : null,
        fechaSolicitud: new Date(),
        estado: 'pendiente'
      };

      // Por ahora solo devolvemos los datos sin guardar en DB
      console.log('📝 Datos de solicitud procesados:', {
        numero: numeroSolicitud,
        usuario: userId,
        articulo: descripcion,
        monto: montoSolicitado,
        fotos: fotosInfo.length,
        documento: !!documentoInfo
      });

      res.status(201).json({
        success: true,
        message: 'Solicitud creada exitosamente',
        data: {
          solicitud: {
            id: `temp_${Date.now()}`,
            numero: numeroSolicitud,
            estado: 'pendiente',
            fechaSolicitud: new Date(),
            montoSolicitado: parseFloat(montoSolicitado),
            plazoMeses: parseInt(plazoMeses),
            articulo: {
              descripcion,
              valorEstimado: parseFloat(valorEstimado)
            }
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error creando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error creando la solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener solicitudes del usuario
  async getMisSolicitudes(req, res) {
    try {
      const { userId } = req.user;
      const { estado, limite = 10, pagina = 1 } = req.query;

      console.log(`📋 Obteniendo solicitudes para usuario: ${userId}`);

      // Datos de ejemplo por ahora
      const solicitudesEjemplo = [
        {
          id: 'temp_001',
          numero: 'SOL-2024-000001',
          estado: 'pendiente',
          estadoTexto: 'Pendiente de Evaluación',
          fechaSolicitud: new Date('2024-09-01'),
          fechaRespuesta: null,
          montoSolicitado: 5000,
          montoAprobado: null,
          plazoMeses: 3,
          articulo: {
            id: 'art_001',
            nombre: 'iPhone 14 Pro',
            categoria: 'Celulares',
            valorEstimado: 8000,
            fotoPrincipal: null
          },
          ultimoAvaluo: null,
          diasTranscurridos: 13
        }
      ];

      const solicitudesFiltradas = estado && estado !== 'todas' 
        ? solicitudesEjemplo.filter(s => s.estado === estado)
        : solicitudesEjemplo;

      res.status(200).json({
        success: true,
        data: {
          solicitudes: solicitudesFiltradas,
          paginacion: {
            pagina: parseInt(pagina),
            limite: parseInt(limite),
            total: solicitudesFiltradas.length
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo solicitudes:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo solicitudes',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener detalle de una solicitud
  async getDetalleSolicitud(req, res) {
    try {
      const { solicitudId } = req.params;
      const { userId } = req.user;

      console.log(`🔍 Obteniendo detalle de solicitud: ${solicitudId}`);

      // Datos de ejemplo por ahora
      const solicitudEjemplo = {
        id: solicitudId,
        numero: 'SOL-2024-000001',
        estado: 'pendiente',
        estadoTexto: 'Pendiente de Evaluación',
        fechas: {
          solicitud: new Date('2024-09-01'),
          respuesta: null,
          vencimiento: null
        },
        montos: {
          solicitado: 5000,
          aprobado: null
        },
        condiciones: {
          plazoMeses: 3,
          modalidadPago: 'mensual'
        },
        articulo: {
          id: 'art_001',
          nombre: 'iPhone 14 Pro',
          descripcion: 'iPhone 14 Pro de 256GB en excelente estado',
          categoria: 'Celulares',
          estadoFisico: 'excelente',
          valorEstimado: 8000,
          marca: 'Apple',
          modelo: 'iPhone 14 Pro',
          fotos: [],
          especificaciones: {}
        },
        avaluos: [],
        planPagos: null,
        rangoAvaluo: null,
        prestamo: null,
        diasTranscurridos: 13,
        documentoTecnico: null
      };

      res.status(200).json({
        success: true,
        data: {
          solicitud: solicitudEjemplo
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo detalle de solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo detalle de solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Cancelar solicitud
  async cancelarSolicitud(req, res) {
    try {
      const { solicitudId } = req.params;
      const { motivo } = req.body;
      const { userId } = req.user;

      console.log(`❌ Cancelando solicitud: ${solicitudId}`);

      res.status(200).json({
        success: true,
        message: 'Solicitud cancelada exitosamente',
        data: {
          solicitud: {
            id: solicitudId,
            estado: 'cancelada',
            fechaCancelacion: new Date()
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error cancelando solicitud:', error);
      res.status(500).json({
        success: false,
        message: 'Error cancelando la solicitud',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Aceptar oferta de préstamo
  async aceptarOferta(req, res) {
    try {
      const { solicitudId } = req.params;
      const { aceptaCondiciones } = req.body;
      const { userId } = req.user;

      console.log(`✅ Aceptando oferta para solicitud: ${solicitudId}`);

      if (!aceptaCondiciones) {
        return res.status(400).json({
          success: false,
          message: 'Debe aceptar las condiciones de la oferta'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Oferta aceptada y préstamo creado exitosamente',
        data: {
          prestamo: {
            id: `prestamo_${Date.now()}`,
            numero: `PR-2024-${String(Math.floor(Math.random() * 1000)).padStart(6, '0')}`,
            montoPrestado: 5000,
            fechaCreacion: new Date(),
            fechaVencimiento: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // 90 días
          }
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error aceptando oferta:', error);
      res.status(500).json({
        success: false,
        message: 'Error aceptando la oferta',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  },

  // Obtener categorías de artículos disponibles
  async getCategorias(req, res) {
    try {
      console.log('📂 Obteniendo categorías de artículos');

      // Categorías de ejemplo por ahora
      const categoriasEjemplo = [
        {
          id: 1,
          nombre: 'Joyería',
          descripcion: 'Joyas, anillos, collares, pulseras',
          porcentajeMaximoPrestamo: 70,
          requiereEspecificaciones: false,
          camposEspecificaciones: null
        },
        {
          id: 2,
          nombre: 'Oro',
          descripcion: 'Artículos de oro puro o aleaciones',
          porcentajeMaximoPrestamo: 80,
          requiereEspecificaciones: false,
          camposEspecificaciones: null
        },
        {
          id: 3,
          nombre: 'Plata',
          descripcion: 'Artículos de plata pura o aleaciones',
          porcentajeMaximoPrestamo: 60,
          requiereEspecificaciones: false,
          camposEspecificaciones: null
        },
        {
          id: 4,
          nombre: 'Celulares',
          descripcion: 'Teléfonos móviles y smartphones',
          porcentajeMaximoPrestamo: 75,
          requiereEspecificaciones: true,
          camposEspecificaciones: ['marca', 'modelo', 'capacidad', 'estado_bateria']
        },
        {
          id: 5,
          nombre: 'Computadoras',
          descripcion: 'Laptops, PCs, tablets',
          porcentajeMaximoPrestamo: 65,
          requiereEspecificaciones: true,
          camposEspecificaciones: ['marca', 'modelo', 'procesador', 'ram', 'almacenamiento']
        },
        {
          id: 6,
          nombre: 'Televisores',
          descripcion: 'Televisores y monitores',
          porcentajeMaximoPrestamo: 55,
          requiereEspecificaciones: true,
          camposEspecificaciones: ['marca', 'modelo', 'tamaño', 'tipo_pantalla']
        },
        {
          id: 7,
          nombre: 'Relojes',
          descripcion: 'Relojes de pulsera y de bolsillo',
          porcentajeMaximoPrestamo: 75,
          requiereEspecificaciones: false,
          camposEspecificaciones: null
        },
        {
          id: 8,
          nombre: 'Vehículos',
          descripcion: 'Automóviles, motocicletas',
          porcentajeMaximoPrestamo: 85,
          requiereEspecificaciones: true,
          camposEspecificaciones: ['marca', 'modelo', 'año', 'kilometraje', 'combustible']
        },
        {
          id: 9,
          nombre: 'Herramientas',
          descripcion: 'Herramientas eléctricas y manuales',
          porcentajeMaximoPrestamo: 50,
          requiereEspecificaciones: false,
          camposEspecificaciones: null
        },
        {
          id: 10,
          nombre: 'Electrodomésticos',
          descripcion: 'Refrigeradoras, lavadoras, etc.',
          porcentajeMaximoPrestamo: 45,
          requiereEspecificaciones: true,
          camposEspecificaciones: ['marca', 'modelo', 'capacidad', 'tipo']
        }
      ];

      res.status(200).json({
        success: true,
        data: { categorias: categoriasEjemplo },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo categorías:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo categorías',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }
};