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
        try {
          const { getToken } = useAuth()
          const token = getToken()
          
          if (token) {
            options.headers = {
              ...options.headers,
              Authorization: `Bearer ${token}`
            }
            console.log(`[API] ✅ Token agregado a petición: ${request}`)
          } else {
            console.log(`[API] ⚠️ No hay token para: ${request}`)
          }
        } catch (error) {
          console.error('[API] Error obteniendo token:', error)
        }
      }
    },
    onResponse({ request, response }) {
      const status = response.status
      const statusIcon = status >= 200 && status < 300 ? '✅' : status >= 400 ? '❌' : '⚠️'
      console.log(`[API] ${statusIcon} ${status} - ${request}`)
    },
    onResponseError({ request, response }) {
      console.error(`[API] ❌ Error ${response.status} - ${request}:`, response._data)
      
      // Manejar errores de autenticación
      if (response.status === 401) {
        console.log('[API] 🚨 Token expirado/inválido, cerrando sesión...')
        
        if (process.client) {
          try {
            const { logout } = useAuth()
            logout()
            
            // Redirigir al login después de un pequeño delay
            setTimeout(() => {
              navigateTo('/login')
            }, 100)
          } catch (error) {
            console.error('[API] Error durante logout automático:', error)
            // Fallback: redirigir directamente
            window.location.href = '/login'
          }
        }
      }
    }
  })

  return { 
    api,
    // Función auxiliar para compatibilidad
    $api: (url, options = {}) => {
      return api(url, options)
    }
  }
}