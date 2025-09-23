// FRONTEND/plugins/00.auth-init.client.js
export default defineNuxtPlugin(async () => {
  // Solo ejecutar en el cliente
  if (process.client) {
    console.log('[AUTH PLUGIN] 🚀 Inicializando sistema de autenticación...')
    
    try {
      // Obtener composable de auth
      const { checkAuth, user, isLoggedIn } = useAuth()
      
      // Verificar si hay datos de autenticación guardados
      console.log('[AUTH PLUGIN] 🔍 Verificando tokens guardados...')
      
      // Buscar tokens con diferentes nombres posibles
      const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
      const possibleUserKeys = ['user_data', 'user-data', 'userData']
      
      let foundTokens = []
      let foundUserData = []
      
      possibleTokenKeys.forEach(key => {
        const localToken = localStorage.getItem(key)
        const sessionToken = sessionStorage.getItem(key)
        
        if (localToken) foundTokens.push(`localStorage.${key}`)
        if (sessionToken) foundTokens.push(`sessionStorage.${key}`)
      })
      
      possibleUserKeys.forEach(key => {
        const localData = localStorage.getItem(key)
        const sessionData = sessionStorage.getItem(key)
        
        if (localData) foundUserData.push(`localStorage.${key}`)
        if (sessionData) foundUserData.push(`sessionStorage.${key}`)
      })
      
      console.log('[AUTH PLUGIN] 📊 Tokens encontrados:', foundTokens)
      console.log('[AUTH PLUGIN] 📊 Datos de usuario encontrados:', foundUserData)
      
      // Inicializar autenticación
      const authResult = checkAuth()
      
      if (authResult && user.value) {
        console.log('[AUTH PLUGIN] ✅ Usuario autenticado:', {
          nombre: user.value.nombre,
          email: user.value.email,
          tipoUsuario: user.value.tipoUsuario,
          isLoggedIn: isLoggedIn.value
        })
      } else {
        console.log('[AUTH PLUGIN] ❌ No hay sesión activa')
      }
      
    } catch (error) {
      console.error('[AUTH PLUGIN] ❌ Error inicializando autenticación:', error)
    }
  }
})