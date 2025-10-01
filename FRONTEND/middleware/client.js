// FRONTEND/middleware/client.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, isClient, isAdmin, user, checkAuth } = useAuth()
  
  console.log('[CLIENT MIDDLEWARE] 🔍 Verificando acceso cliente:', {
    isLoggedIn: isLoggedIn.value,
    isClient: isClient.value,
    isAdmin: isAdmin.value,
    userType: user.value?.tipoUsuario,
    route: to.path
  })
  
  // Si no está logueado, intentar restaurar sesión primero
  if (!isLoggedIn.value && process.client) {
    const hasToken = localStorage.getItem('token')
    const hasUserData = localStorage.getItem('user_data')
    
    if (hasToken && hasUserData) {
      console.log('[CLIENT MIDDLEWARE] 🔄 Restaurando sesión...')
      checkAuth()
    }
  }
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn.value) {
    console.log('[CLIENT MIDDLEWARE] ❌ Usuario no logueado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Si es administrador tratando de acceder a rutas de cliente, 
  // redirigir al panel admin
  if (isAdmin.value) {
    console.log('[CLIENT MIDDLEWARE] 🔄 Admin redirigido al panel admin')
    return navigateTo('/admin')
  }
  
  // Si está logueado pero no es cliente ni admin
  if (!isClient.value && !isAdmin.value) {
    console.log('[CLIENT MIDDLEWARE] ❌ Tipo de usuario no reconocido')
    console.warn('[CLIENT MIDDLEWARE] Tipo de usuario:', user.value?.tipoUsuario)
    
    return navigateTo('/login')
  }
  
  console.log('[CLIENT MIDDLEWARE] ✅ Acceso cliente autorizado')
})