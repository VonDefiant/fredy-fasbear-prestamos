// FRONTEND/middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, user, checkAuth } = useAuth()
  
  console.log('[AUTH MIDDLEWARE] 🔍 Verificando ruta:', to.path)
  console.log('[AUTH MIDDLEWARE] Estado inicial:', {
    isLoggedIn: isLoggedIn.value,
    hasUser: !!user.value,
    userEmail: user.value?.email
  })
  
  // CRÍTICO: Si no está logueado en el estado, verificar localStorage primero
  if (!isLoggedIn.value && process.client) {
    console.log('[AUTH MIDDLEWARE] 🔄 Estado no autenticado, verificando localStorage...')
    
    // Verificar directamente en localStorage
    const hasToken = localStorage.getItem('token')
    const hasUserData = localStorage.getItem('user_data')
    
    console.log('[AUTH MIDDLEWARE] localStorage:', {
      hasToken: !!hasToken,
      hasUserData: !!hasUserData
    })
    
    // Si hay datos en localStorage, intentar restaurar
    if (hasToken && hasUserData) {
      console.log('[AUTH MIDDLEWARE] 🔄 Datos encontrados, restaurando sesión...')
      const restored = checkAuth()
      
      console.log('[AUTH MIDDLEWARE] Resultado de restauración:', {
        restored,
        isLoggedIn: isLoggedIn.value,
        hasUser: !!user.value
      })
      
      // Si se restauró exitosamente, permitir el acceso
      if (restored && isLoggedIn.value) {
        console.log('[AUTH MIDDLEWARE] ✅ Sesión restaurada, permitiendo acceso')
        return
      }
    }
  }
  
  // Si no está logueado después de intentar restaurar, redirigir al login
  if (!isLoggedIn.value) {
    console.log('[AUTH MIDDLEWARE] ❌ No autenticado, redirigiendo a login')
    
    // Guardar la ruta para redirigir después del login
    if (process.client && to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
      console.log('[AUTH MIDDLEWARE] 💾 Ruta guardada para redirección:', to.fullPath)
    }
    
    return navigateTo('/login')
  }
  
  console.log('[AUTH MIDDLEWARE] ✅ Usuario autenticado, acceso permitido')
})