// FRONTEND/composables/useAuth.js
export const useAuth = () => {
  // ===== CONFIGURACIÓN DE TOKENS =====
  const TOKEN_KEY = 'token'
  const USER_DATA_KEY = 'user_data'

  // ===== FUNCIONES AUXILIARES =====
  
  const findExistingToken = () => {
    if (!process.client) return null
    
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    
    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (token) return token
    }
    return null
  }

  const findExistingUserData = () => {
    if (!process.client) return null
    
    const possibleUserKeys = ['user_data', 'user-data', 'userData']
    
    for (const key of possibleUserKeys) {
      const userDataStr = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (userDataStr) {
        try {
          return JSON.parse(userDataStr)
        } catch (error) {
          console.error(`[AUTH] ✗ Error parseando datos:`, error)
        }
      }
    }
    return null
  }

  const clearAllTokens = () => {
    if (!process.client) return
    
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    const possibleUserKeys = ['user_data', 'user-data', 'userData']
    
    possibleTokenKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
    
    possibleUserKeys.forEach(key => {
      localStorage.removeItem(key)
      sessionStorage.removeItem(key)
    })
  }

  // ===== INICIALIZACIÓN AUTOMÁTICA DEL ESTADO =====
  const initializeUserState = () => {
    if (!process.client) return null
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      return userData
    }
    
    return null
  }

  // Estado reactivo con inicialización automática
  const user = useState('auth.user', () => initializeUserState())

  // ===== FUNCIÓN DE REDIRECCIÓN SEGÚN TIPO DE USUARIO =====
  
  const redirectAfterLogin = (tipoUsuario) => {
    console.log('[AUTH] 🔄 Redirigiendo usuario tipo:', tipoUsuario)
    
    switch(tipoUsuario) {
      case 'Administrador':
        return navigateTo('/admin')
        
      case 'Evaluador':
        return navigateTo('/evaluador')
        
      case 'Cobrador':
        return navigateTo('/cobrador')
        
      case 'Cliente':
        return navigateTo('/cliente')
        
      default:
        console.error('[AUTH] ⚠️ Tipo de usuario desconocido:', tipoUsuario)
        return navigateTo('/')
    }
  }

  // ===== FUNCIONES PRINCIPALES =====
  
  // Verificar si el usuario está autenticado
  const checkAuth = () => {
    if (!process.client) return false
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      // Actualizar solo si es necesario
      if (!user.value || user.value.email !== userData.email) {
        user.value = { ...userData }
      }
      return true
    }
    
    user.value = null
    return false
  }

  // Iniciar sesión
  const login = (userData, token, remember = false) => {
    if (!process.client) return
    
    console.log('[AUTH LOGIN] 🔐 Iniciando sesión:', userData.email)
    
    // Limpiar sesiones anteriores
    clearAllTokens()
    
    // Guardar en localStorage
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    
    // Actualizar estado
    user.value = { ...userData }
    
    console.log('[AUTH LOGIN] ✅ Login completado')
    
    // Redirigir según tipo de usuario
    redirectAfterLogin(userData.tipoUsuario)
  }

  // Cerrar sesión
  const logout = () => {
    if (!process.client) return
    
    console.log('[AUTH LOGOUT] 🚪 Cerrando sesión')
    
    user.value = null
    clearAllTokens()
    
    console.log('[AUTH LOGOUT] ✅ Sesión cerrada')
  }

  // Obtener token actual
  const getToken = () => {
    if (!process.client) return null
    return findExistingToken()
  }

  // ===== COMPUTED PROPERTIES =====
  
  const isLoggedIn = computed(() => !!user.value)
  const isClient = computed(() => user.value && user.value.tipoUsuario === 'Cliente')
  const isAdmin = computed(() => user.value && user.value.tipoUsuario === 'Administrador')
  const isEvaluator = computed(() => user.value && user.value.tipoUsuario === 'Evaluador')
  const isCollector = computed(() => user.value && user.value.tipoUsuario === 'Cobrador')

  // ===== UTILIDADES =====
  
  const requireAuth = (redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      navigateTo(redirectTo)
      return false
    }
    return true
  }

  const requireAuthWithMessage = (message = 'Debes iniciar sesión', redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      if (process.client) {
        sessionStorage.setItem('auth_message', message)
      }
      navigateTo(redirectTo)
      return false
    }
    return true
  }

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

  const initAuth = () => {
    if (process.client) {
      return checkAuth()
    }
    return false
  }

  // ===== DEBUG INFO =====
  
  const getDebugInfo = () => {
    if (!process.client) return {}
    
    return {
      userState: user.value,
      isLoggedIn: isLoggedIn.value,
      isAdmin: isAdmin.value,
      isClient: isClient.value,
      isEvaluator: isEvaluator.value,
      isCollector: isCollector.value,
      token: getToken() ? 'Present' : 'Missing',
      tokensInStorage: {
        localStorage: Object.keys(localStorage).filter(key => 
          key.includes('token') || key.includes('user')),
        sessionStorage: Object.keys(sessionStorage).filter(key => 
          key.includes('token') || key.includes('user'))
      }
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
    
    // Métodos principales
    login,
    logout,
    checkAuth,
    getToken,
    initAuth,
    
    // Redirección
    redirectAfterLogin,
    
    // Utilidades
    requireAuth,
    requireAuthWithMessage,
    getAuthMessage,
    
    // Debug
    getDebugInfo
  }
}