// FRONTEND/composables/useAuth.js
export const useAuth = () => {
  // Estado reactivo del usuario
  const user = useState('auth.user', () => null)

  // ===== CONFIGURACIÓN DE TOKENS =====
  const TOKEN_KEY = 'token'
  const USER_DATA_KEY = 'user_data'

  // ===== FUNCIONES AUXILIARES =====
  
  // Limpiar todos los tokens antiguos con diferentes nombres
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

  // Buscar token existente con cualquier nombre
  const findExistingToken = () => {
    if (!process.client) return null
    
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    
    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (token) {
        console.log(`[AUTH] Token encontrado con clave: ${key}`)
        return token
      }
    }
    return null
  }

  // Buscar datos de usuario existentes con cualquier nombre
  const findExistingUserData = () => {
    if (!process.client) return null
    
    const possibleUserKeys = ['user_data', 'user-data', 'userData']
    
    for (const key of possibleUserKeys) {
      const userDataStr = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (userDataStr) {
        try {
          const userData = JSON.parse(userDataStr)
          console.log(`[AUTH] Datos de usuario encontrados con clave: ${key}`)
          return userData
        } catch (error) {
          console.error(`[AUTH] Error parseando datos de usuario de ${key}:`, error)
        }
      }
    }
    return null
  }

  // ===== FUNCIONES PRINCIPALES =====
  
  // Verificar si el usuario está autenticado
  const checkAuth = () => {
    if (!process.client) return false
    
    console.log('[AUTH] 🔍 Verificando autenticación...')
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      user.value = userData
      console.log('[AUTH] ✅ Usuario autenticado restaurado:', {
        nombre: userData.nombre,
        email: userData.email,
        tipoUsuario: userData.tipoUsuario
      })
      return true
    } else {
      console.log('[AUTH] ❌ No se encontraron datos de autenticación válidos')
      user.value = null
      return false
    }
  }

  // Iniciar sesión
  const login = (userData, token, remember = false) => {
    if (!process.client) return
    
    console.log('[AUTH] 🔐 Iniciando sesión para:', userData.nombre, userData.email)
    
    // Limpiar tokens antiguos primero
    clearAllTokens()
    
    // Guardar datos del usuario en el estado
    user.value = userData
    
    // Guardar en storage (usar localStorage si remember=true, sino sessionStorage)
    const storage = remember ? localStorage : sessionStorage
    
    storage.setItem(TOKEN_KEY, token)
    storage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    
    console.log('[AUTH] ✅ Datos guardados en:', remember ? 'localStorage' : 'sessionStorage')
    console.log('[AUTH] ✅ Usuario autenticado:', {
      nombre: userData.nombre,
      email: userData.email,
      tipoUsuario: userData.tipoUsuario,
      isLoggedIn: true
    })
  }

  // Cerrar sesión
  const logout = () => {
    if (!process.client) return
    
    console.log('[AUTH] 🚪 Cerrando sesión...')
    
    // Limpiar estado
    user.value = null
    
    // Limpiar todos los tokens posibles
    clearAllTokens()
    
    console.log('[AUTH] ✅ Sesión cerrada completamente')
  }

  // Obtener token actual
  const getToken = () => {
    if (!process.client) return null
    
    // Primero buscar con el nombre estándar
    let token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    
    // Si no se encuentra, buscar con nombres alternativos
    if (!token) {
      token = findExistingToken()
    }
    
    return token
  }

  // ===== COMPUTED PROPERTIES =====
  
  const isLoggedIn = computed(() => {
    const result = !!user.value
    console.log('[AUTH] isLoggedIn computed:', result, 'user:', user.value?.nombre || 'null')
    return result
  })

  const isClient = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Cliente'
    console.log('[AUTH] isClient computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  const isAdmin = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Administrador'
    console.log('[AUTH] isAdmin computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  const isEvaluator = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Evaluador'
    console.log('[AUTH] isEvaluator computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  const isCollector = computed(() => {
    const result = user.value && user.value.tipoUsuario === 'Cobrador'
    console.log('[AUTH] isCollector computed:', result, 'tipoUsuario:', user.value?.tipoUsuario)
    return result
  })

  // ===== UTILIDADES =====
  
  const requireAuth = (redirectTo = '/login') => {
    if (!isLoggedIn.value) {
      navigateTo(redirectTo)
      return false
    }
    return true
  }

  const requireAuthWithMessage = (message = 'Debes iniciar sesión para acceder', redirectTo = '/login') => {
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
      console.log('[AUTH] 🚀 Inicializando autenticación...')
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
      token: getToken() ? 'Present' : 'Missing',
      tokensInStorage: {
        localStorage: Object.keys(localStorage).filter(key => key.includes('token') || key.includes('user')),
        sessionStorage: Object.keys(sessionStorage).filter(key => key.includes('token') || key.includes('user'))
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
    
    // Utilidades
    requireAuth,
    requireAuthWithMessage,
    getAuthMessage,
    
    // Debug
    getDebugInfo
  }
}