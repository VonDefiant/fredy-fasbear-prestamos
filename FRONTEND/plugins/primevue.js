// plugins/primevue.js
// OPCIÓN 1: Si quieres usar PrimeVue, instala primevue primero:
// npm install primevue

/*
import PrimeVue from 'primevue/config'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(PrimeVue)
  nuxtApp.vueApp.use(ToastService)
  
  // Registrar componentes globalmente
  nuxtApp.vueApp.component('Button', Button)
  nuxtApp.vueApp.component('InputText', InputText)
  nuxtApp.vueApp.component('Toast', Toast)
})
*/

// OPCIÓN 2: Plugin básico sin PrimeVue (recomendado por ahora)
export default defineNuxtPlugin((nuxtApp) => {
  // Plugin básico para funcionalidad de UI personalizada
  const $ui = {
    // Método para mostrar notificaciones
    notify(message, type = 'info') {
      if (process.client) {
        // Implementación básica de notificaciones
        console.log(`[${type.toUpperCase()}]: ${message}`)
        
        // Aquí podrías implementar tu propio sistema de notificaciones
        // o usar una librería más ligera como vue-toastification
      }
    },
    
    // Método para validaciones básicas
    validate: {
      email(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return re.test(email)
      },
      
      required(value) {
        return value !== null && value !== undefined && value !== ''
      },
      
      minLength(value, min) {
        return value && value.length >= min
      }
    }
  }
  
  // Hacer disponible globalmente
  nuxtApp.provide('ui', $ui)
})