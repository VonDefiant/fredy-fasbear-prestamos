// FRONTEND/composables/useAuth.js
// VERSIÓN FINAL - Con inicialización correcta

export const useAuth = () => {
  // ===== CONFIGURACIÓN DE TOKENS =====
  const TOKEN_KEY = 'token'
  const USER_DATA_KEY = 'user_data'

  // ===== FUNCIONES AUXILIARES (declaradas primero) =====
  
  const findExistingToken = () => {
    if (!process.client) return null
    
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    
    for (const key of possibleTokenKeys) {
      const token = localStorage.getItem(key) || sessionStorage.getItem(key)
      if (token) {
        console.log(`[AUTH] ✓ Token encontrado con clave: ${key}`)
        return token
      }
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
          const userData = JSON.parse(userDataStr)
          console.log(`[AUTH] ✓ Datos de usuario encontrados con clave: ${key}`, userData.email)
          return userData
        } catch (error) {
          console.error(`[AUTH] ✗ Error parseando datos de usuario de ${key}:`, error)
        }
      }
    }
    return null
  }

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

  // ===== INICIALIZACIÓN DEL ESTADO =====
  const getInitialUser = () => {
    if (!process.client) return null
    
    console.log('[AUTH INIT] 🔍 Buscando usuario en storage...')
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      console.log('[AUTH INIT] ✅ Usuario encontrado:', userData.email)
      return userData
    }
    
    console.log('[AUTH INIT] ℹ️ No hay sesión guardada')
    return null
  }

  // Estado reactivo del usuario
  const user = useState('auth.user', () => getInitialUser())

  // ===== FUNCIONES PRINCIPALES =====
  
  // Verificar si el usuario está autenticado
  const checkAuth = () => {
    if (!process.client) return false
    
    console.log('[AUTH CHECK] 🔍 Verificando autenticación...')
    console.log('[AUTH CHECK] Estado actual:', user.value ? user.value.email : 'null')
    
    const token = findExistingToken()
    const userData = findExistingUserData()
    
    if (token && userData) {
      // Si ya tenemos el usuario en el estado, no hace falta actualizarlo
      if (!user.value || user.value.email !== userData.email) {
        console.log('[AUTH CHECK] 🔄 Actualizando estado del usuario')
        user.value = { ...userData }
      }
      
      console.log('[AUTH CHECK] ✅ Autenticado:', userData.email)
      return true
    }
    
    console.log('[AUTH CHECK] ❌ No autenticado')
    user.value = null
    return false
  }

  // Iniciar sesión - SIEMPRE USA LOCALSTORAGE
  const login = (userData, token, remember = false) => {
    if (!process.client) return
    
    console.log('[AUTH LOGIN] 🔐 Iniciando sesión...')
    console.log('[AUTH LOGIN] Usuario:', userData.email, userData.nombre)
    
    // 1. Limpiar cualquier sesión anterior
    clearAllTokens()
    console.log('[AUTH LOGIN] ✓ Sesiones anteriores limpiadas')
    
    // 2. Guardar en localStorage PRIMERO
    localStorage.setItem(TOKEN_KEY, token)
    localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData))
    console.log('[AUTH LOGIN] ✓ Datos guardados en localStorage')
    
    // 3. Actualizar el estado reactivo
    user.value = { ...userData }
    console.log('[AUTH LOGIN] ✓ Estado reactivo actualizado')
    
    // 4. Verificar que se guardó correctamente
    setTimeout(() => {
      const savedToken = localStorage.getItem(TOKEN_KEY)
      const savedData = localStorage.getItem(USER_DATA_KEY)
      
      console.log('[AUTH LOGIN] 📋 Verificación post-login:', {
        tokenGuardado: !!savedToken,
        datosGuardados: !!savedData,
        estadoUsuario: !!user.value,
        tokenLength: savedToken ? savedToken.length : 0
      })
      
      if (!savedToken || !savedData) {
        console.error('[AUTH LOGIN] ⚠️ ADVERTENCIA: Los datos NO se guardaron correctamente en localStorage')
      }
    }, 100)
    
    console.log('[AUTH LOGIN] ✅ Login completado')
  }

  // Cerrar sesión
  const logout = () => {
    if (!process.client) return
    
    console.log('[AUTH LOGOUT] 🚪 Cerrando sesión...')
    
    // Limpiar estado
    user.value = null
    
    // Limpiar todos los tokens posibles
    clearAllTokens()
    
    console.log('[AUTH LOGOUT] ✅ Sesión cerrada')
  }

  // Obtener token actual
  const getToken = () => {
    if (!process.client) return null
    
    let token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY)
    
    if (!token) {
      token = findExistingToken()
    }
    
    return token
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