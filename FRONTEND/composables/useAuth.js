// composables/useAuth.js
export const useAuth = () => {
  // Estado reactivo del usuario
  const user = useState('auth.user', () => null)
  const isLoggedIn = computed(() => !!user.value)

  // Verificar si el usuario está autenticado
  const checkAuth = () => {
    if (process.client) {
      // Verificar si hay un token guardado
      const token = localStorage.getItem('auth_token') || sessionStorage.getItem('auth_token')
      const userData = localStorage.getItem('user_data') || sessionStorage.getItem('user_data')
      
      if (token && userData) {
        try {
          user.value = JSON.parse(userData)
          console.log('[AUTH] Usuario restaurado desde storage:', user.value)
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
      
      console.log('[AUTH] Usuario logueado:', userData)
      console.log('[AUTH] Tipo de usuario detectado:', userData.tipoUsuario)
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
      
      console.log('[AUTH] Usuario deslogueado')
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
    const result = user.value && user.value.tipoUsuario === 'Cliente'
    console.log('[AUTH] isClient computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  // Verificar si el usuario es administrador
  const isAdmin = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Administrador'
    console.log('[AUTH] isAdmin computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  // Verificar si el usuario es evaluador
  const isEvaluator = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Evaluador'
    console.log('[AUTH] isEvaluator computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  // Verificar si el usuario es cobrador
  const isCollector = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Cobrador'
    console.log('[AUTH] isCollector computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
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
    isEvaluator,
    isCollector,
    
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