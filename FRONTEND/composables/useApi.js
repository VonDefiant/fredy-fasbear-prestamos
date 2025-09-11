// FRONTEND/composables/useApi.js
export const useApi = () => {
  const config = useRuntimeConfig()
  const baseURL = config.public.apiBase || 'http://localhost:3001/api'

  const api = $fetch.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json'
    },
    onRequest({ request, options }) {
      // Agregar token automáticamente si existe
      if (process.client) {
        const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
        if (token) {
          options.headers = {
            ...options.headers,
            Authorization: `Bearer ${token}`
          }
        }
      }
    },
    onResponseError({ response }) {
      // Manejar errores de autenticación
      if (response.status === 401) {
        // Token expirado o inválido
        if (process.client) {
          const { logout } = useAuth()
          logout()
          navigateTo('/login')
        }
      }
    }
  })

  return { api }
}