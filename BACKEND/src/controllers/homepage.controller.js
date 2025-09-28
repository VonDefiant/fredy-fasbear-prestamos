// ===============================================
// Archivo: BACKEND/src/controllers/homepage.controller.js
// Controlador para la API de la homepage
// ===============================================

export default {
  // Obtener datos principales de la homepage
  async getHomeData(req, res) {
    try {
      console.log('📊 Obteniendo datos de la homepage...');

      // Aquí puedes conectar con tu base de datos para obtener datos dinámicos
      // Ejemplo con datos estáticos por ahora
      const homeData = {
        heroSection: {
          title: "Empeña y Compra con Confianza",
          subtitle: "Bienvenido a nuestro servicio",
          description: "Te brindamos préstamos por tus artículos y precios accesibles en tus compras. Una experiencia única de empeño y comercio con la confianza y elegancia que nos caracteriza.",
          ctaButtons: [
            {
              text: "Nuestra Tienda",
              link: "/tienda",
              type: "primary"
            },
            {
              text: "Empieza A Empeñar Tus Productos",
              link: "/prestamos",
              type: "secondary"
            }
          ]
        },
        features: [
          {
            id: 1,
            title: "Avalúo Profesional",
            description: "Evaluamos tus artículos con criterios profesionales para ofrecerte el mejor valor por tus pertenencias.",
            icon: "diamond"
          },
          {
            id: 2,
            title: "Proceso Rápido",
            description: "Obtén tu préstamo en minutos con nuestro sistema digital optimizado y contratos electrónicos.",
            icon: "lightning"
          },
          {
            id: 3,
            title: "Máxima Seguridad",
            description: "Tus artículos están protegidos con la más alta seguridad mientras gestionamos tu préstamo.",
            icon: "shield"
          },
          {
            id: 4,
            title: "Tienda Premium",
            description: "Encuentra artículos únicos en nuestra tienda con precios accesibles y calidad garantizada.",
            icon: "store"
          },
          {
            id: 5,
            title: "Plataforma Digital",
            description: "Gestiona todo desde tu móvil: solicitudes, pagos, seguimiento y compras en línea.",
            icon: "mobile"
          },
          {
            id: 6,
            title: "Confianza Total",
            description: "Más de una década brindando servicios de empeño con transparencia y profesionalismo.",
            icon: "trust"
          }
        ],
        testimonials: [
          {
            id: 1,
            name: "María González",
            comment: "Excelente servicio, muy rápido y confiable.",
            rating: 5,
            location: "Guatemala City"
          },
          {
            id: 2,
            name: "Carlos Méndez",
            comment: "El mejor lugar para empeñar artículos, precios justos.",
            rating: 5,
            location: "Mixco"
          }
        ]
      };

      res.status(200).json({
        success: true,
        data: homeData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo datos de homepage:', error);
      res.status(500).json({
        success: false,
        message: 'Error interno del servidor',
        error: process.env.NODE_ENV ? error.message : undefined
      });
    }
  },

  // Obtener estadísticas dinámicas
  async getStats(req, res) {
    try {
      console.log('📈 Obteniendo estadísticas...');

      // Aquí conectarías con tu base de datos real
      // Por ahora datos de ejemplo
      const stats = {
        totalClientes: 1547,
        prestamosActivos: 324,
        articulosEnVenta: 892,
        montoTotalPrestado: 2650000, // En quetzales
        satisfaccionCliente: 98.5,
        añosExperiencia: 12
      };

      // Si tienes modelos de base de datos, sería algo así:
      /*
      const stats = {
        totalClientes: await Cliente.count(),
        prestamosActivos: await Prestamo.count({ 
          where: { estado: 'activo' } 
        }),
        articulosEnVenta: await Articulo.count({ 
          where: { estado: 'en_venta' } 
        }),
        montoTotalPrestado: await Prestamo.sum('monto', {
          where: { estado: ['activo', 'completado'] }
        })
      };
      */

      res.status(200).json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo estadísticas',
        error: process.env.NODE_ENV ? error.message : undefined
      });
    }
  },

  // Obtener productos destacados para la homepage
  async getFeaturedProducts(req, res) {
    try {
      const { limit = 6 } = req.query;
      
      console.log(`🏆 Obteniendo ${limit} productos destacados...`);

      // Datos de ejemplo - conectar con tu base de datos real
      const featuredProducts = [
        {
          id: 1,
          name: "iPhone 14 Pro",
          price: 8500,
          originalPrice: 12000,
          discount: 29,
          image: "/images/products/iphone14.jpg",
          category: "Electrónicos",
          condition: "Excelente",
          inStock: true
        },
        {
          id: 2,
          name: "Collar de Oro 18k",
          price: 3200,
          originalPrice: 4500,
          discount: 23,
          image: "/images/products/collar-oro.jpg",
          category: "Joyería",
          condition: "Nuevo",
          inStock: true
        },
        // Más productos...
      ];

      const limitedProducts = featuredProducts.slice(0, parseInt(limit));

      res.status(200).json({
        success: true,
        data: limitedProducts,
        total: limitedProducts.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error obteniendo productos destacados:', error);
      res.status(500).json({
        success: false,
        message: 'Error obteniendo productos destacados',
        error: process.env.NODE_ENV   ? error.message : undefined
      });
    }
  },

  // Endpoint para contacto desde la homepage
  async sendContactMessage(req, res) {
    try {
      const { name, email, phone, message, subject } = req.body;

      // Validación básica
      if (!name || !email || !message) {
        return res.status(400).json({
          success: false,
          message: 'Nombre, email y mensaje son requeridos'
        });
      }

      console.log('📧 Nuevo mensaje de contacto:', { name, email, subject });

      // Aquí guardarías en base de datos y/o enviarías email
      /*
      await ContactMessage.create({
        name,
        email,
        phone,
        message,
        subject,
        source: 'homepage',
        createdAt: new Date()
      });

      // Enviar email de notificación
      await sendNotificationEmail({
        to: process.env.BUSINESS_EMAIL,
        subject: `Nuevo contacto: ${subject}`,
        content: `
          Nombre: ${name}
          Email: ${email}
          Teléfono: ${phone || 'No proporcionado'}
          Mensaje: ${message}
        `
      });
      */

      res.status(200).json({
        success: true,
        message: 'Mensaje enviado correctamente. Te contactaremos pronto.',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error enviando mensaje de contacto:', error);
      res.status(500).json({
        success: false,
        message: 'Error enviando mensaje de contacto',
        error: process.env.NODE_ENV  ? error.message : undefined
      });
    }
  },

  // Endpoint para newsletter signup
  async subscribeNewsletter(req, res) {
    try {
      const { email, name } = req.body;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email es requerido'
        });
      }

      console.log('📬 Nueva suscripción al newsletter:', email);

      // Aquí guardarías en base de datos
      /*
      await Newsletter.findOrCreate({
        where: { email },
        defaults: {
          email,
          name,
          subscribed: true,
          source: 'homepage',
          subscribedAt: new Date()
        }
      });
      */

      res.status(200).json({
        success: true,
        message: 'Suscripción exitosa. ¡Gracias por unirte!',
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('❌ Error en suscripción newsletter:', error);
      res.status(500).json({
        success: false,
        message: 'Error en suscripción',
        error: process.env.NODE_ENV   ? error.message : undefined
      });
    }
  }
};