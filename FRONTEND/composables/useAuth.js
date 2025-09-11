// composables/useAuth.js
export const useAuth = () => {
  // Estado reactivo del usuario
  const user = useState('auth.user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  // Verificar si el usuario está autenticado
  const checkAuth = () => {
    if (process.client) {
      // Verificar si hay un token guardado
      const token = localStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data')
      
      if (token && userData) {
        try {
          user.value = JSON.parse(userData)
          return true
        } catch (error) {
          console.error('Error parsing user data:', error)
          logout()
          return false
        }
      }
    }
    return false
  }

  // Iniciar sesión
  const login = (userData, token, remember = false) => {
    if (process.client) {
      // Guardar datos del usuario
      user.value = userData
      
      // Guardar en localStorage o sessionStorage según "remember"
      const storage = remember ? localStorage : sessionStorage
      storage.setItem('auth_token', token)
      storage.setItem('user_data', JSON.stringify(userData))
      
      console.log('Usuario logueado:', userData)
    }
  }

  // Cerrar sesión
  const logout = () => {
    if (process.client) {
      user.value = null
      
      // Limpiar tanto localStorage como sessionStorage
      localStorage.removeItem('auth_token')
      localStorage.removeItem('user_data')
      sessionStorage.removeItem('auth_token')
      sessionStorage.removeItem('user_data')
      
      console.log('Usuario deslogueado')
    }
  }

  // Obtener token actual
  const getToken = () => {
    if (process.client) {
      return localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
    }
    return null
  }

  // Verificar si el usuario es cliente
  const isClient = computed(() => {
    return user.value && user.value.tipo_usuario === 'Cliente'
  })

  // Verificar si el usuario es administrador
  const isAdmin = computed(() => {
    return user.value && user.value.tipo_usuario === 'Administrador'
  })

  // Redirigir a login si no está autenticado
  const requireAuth = (redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      navigateTo(redirectTo)
      return false
    }
    return true
  }

  // Redirigir a login con mensaje personalizado
  const requireAuthWithMessage = (message = 'Debes iniciar sesión para acceder', redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      // Guardar el mensaje para mostrarlo en la página de login
      if (process.client) {
        sessionStorage.setItem('auth_message', message)
      }
      navigateTo(redirectTo)
      return false
    }
    return true
  }

  // Obtener mensaje de autenticación guardado
  const getAuthMessage = () => {
    if (process.client) {
      const message = sessionStorage.getItem('auth_message')
      if (message) {
        sessionStorage.removeItem('auth_message')
        return message
      }
    }
    return null
  }

  // Inicializar autenticación al cargar
  const initAuth = () => {
    if (process.client) {
      checkAuth()
    }
  }

  return {
    // Estado
    user: readonly(user),
    isLoggedIn,
    isClient,
    isAdmin,
    
    // Métodos
    login,
    logout,
    checkAuth,
    getToken,
    requireAuth,
    requireAuthWithMessage,
    getAuthMessage,
    initAuth
  }
}