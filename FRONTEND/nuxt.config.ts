// nuxt.config.js
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  // CSS global
  css: [
    '~/assets/css/main.css',
    '~/assets/css/global.css'
  ],

  // Variables de entorno públicas
  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || 'http://localhost:3000/api',
      siteName: 'Freddy Fasbear Industries'
    }
  },

  // Meta tags globales
  app: {
    head: {
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1',
      title: 'Freddy Fasbear Industries - Empeña y Compra con Confianza'
    }
  }
})