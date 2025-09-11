// nuxt.config.ts
export default defineNuxtConfig({
  compatibilityDate: '2024-07-15',
  devtools: { enabled: true },

  // CSS global
  css: [
    '~/assets/css/main.css',
    '~/assets/css/global.css'
  ],

  // Plugins
  plugins: [
    '~/plugins/api.js',
    '~/plugins/primevue.js'
  ],

  // Variables de entorno públicas
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3001/api',
      siteName: 'Fredy Fasbear Industries'
    }
  },

  // Meta tags globales
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Fredy Fasbear Industries - Empeña y Compra con Confianza',
      meta: [
        { name: 'description', content: 'Sistema de empeño profesional y confiable en Guatemala' },
        { name: 'keywords', content: 'empeño, guatemala, joyas, electrónicos, vehículos, préstamos' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  },

  // Configuración del servidor de desarrollo
  devServer: {
    port: 3000,
    host: '0.0.0.0' // Expone en todas las interfaces de red
  },

  // Configuración de TypeScript
  typescript: {
    typeCheck: false // Desactiva el chequeo de tipos durante el desarrollo para mayor velocidad
  },

  // Configuración de Nitro (servidor)
  nitro: {
    preset: 'node-server'
  },

  // Configuración de build
  build: {
    transpile: []
  },

  // Configuración de Vite
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: `
            $primary-color: #D4AF37;
            $secondary-color: #2C3E50;
          `
        }
      }
    }
  },

  // Configuración de SSR
  ssr: true,

  // Configuración de componentes auto-importados
  components: [
    {
      path: '~/components',
      pathPrefix: false,
    }
  ],

  // Auto-imports personalizados
  imports: {
    dirs: [
      'composables',
      'utils'
    ]
  }
})