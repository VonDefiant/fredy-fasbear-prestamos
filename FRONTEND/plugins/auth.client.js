// FRONTEND/plugins/auth.client.js
export default defineNuxtPlugin(() => {
  // Solo ejecutar en el cliente
  if (process.client) {
    console.log('[AUTH PLUGIN] Inicializando autenticación...')
    
    // Inicializar autenticación cuando cargue la app
    const { initAuth, user } = useAuth()
    initAuth()
    
    // Debug para verificar el estado
    console.log('[AUTH PLUGIN] Estado inicial del usuario:', user.value)
    
    // Verificar tokens disponibles
    const possibleTokenKeys = ['token', 'auth_token', 'auth-token', 'authToken']
    let foundTokens = []
    
    possibleTokenKeys.forEach(key => {
      const localToken = localStorage.getItem(key)
      const sessionToken = sessionStorage.getItem(key)
      
      if (localToken) foundTokens.push(`localStorage.${key}`)
      if (sessionToken) foundTokens.push(`sessionStorage.${key}`)
    })
    
    console.log('[AUTH PLUGIN] Tokens encontrados:', foundTokens)
  }
})