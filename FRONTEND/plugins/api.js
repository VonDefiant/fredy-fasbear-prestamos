// plugins/api.js
export default defineNuxtPlugin((nuxtApp) => {
  const config = useRuntimeConfig()
  
  // Configuración global de la API
  const $api = {
    baseURL: config.public.apiBase,
    
    // Método para hacer peticiones GET
    async get(endpoint) {
      try {
        const { data } = await $fetch(`${this.baseURL}${endpoint}`)
        return data
      } catch (error) {
        console.error('API GET Error:', error)
        throw error
      }
    },
    
    // Método para hacer peticiones POST
    async post(endpoint, body) {
      try {
        const { data } = await $fetch(`${this.baseURL}${endpoint}`, {
          method: 'POST',
          body
        })
        return data
      } catch (error) {
        console.error('API POST Error:', error)
        throw error
      }
    },
    
    // Método para hacer peticiones PUT
    async put(endpoint, body) {
      try {
        const { data } = await $fetch(`${this.baseURL}${endpoint}`, {
          method: 'PUT',
          body
        })
        return data
      } catch (error) {
        console.error('API PUT Error:', error)
        throw error
      }
    },
    
    // Método para hacer peticiones DELETE
    async delete(endpoint) {
      try {
        const { data } = await $fetch(`${this.baseURL}${endpoint}`, {
          method: 'DELETE'
        })
        return data
      } catch (error) {
        console.error('API DELETE Error:', error)
        throw error
      }
    }
  }
  
  // Hacer disponible globalmente
  nuxtApp.provide('api', $api)
})