// FRONTEND/middleware/client.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, isClient, isAdmin, user } = useAuth()
  
  console.log('[CLIENT MIDDLEWARE] Verificando acceso cliente:', {
    isLoggedIn: isLoggedIn.value,
    isClient: isClient.value,
    isAdmin: isAdmin.value,
    userType: user.value?.tipoUsuario,
    route: to.path
  })
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn.value) {
    console.log('[CLIENT MIDDLEWARE] Usuario no logueado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Si es administrador tratando de acceder a rutas de cliente, 
  // redirigir al panel admin
  if (isAdmin.value) {
    console.log('[CLIENT MIDDLEWARE] Admin redirigido al panel admin')
    return navigateTo('/admin')
  }
  
  // Si está logueado pero no es cliente ni admin (caso edge)
  if (!isClient.value && !isAdmin.value) {
    console.log('[CLIENT MIDDLEWARE] Tipo de usuario no reconocido, redirigiendo a login')
    
    if (process.client) {
      console.warn('Tipo de usuario no reconocido:', user.value?.tipoUsuario)
    }
    
    return navigateTo('/login')
  }
  
  console.log('[CLIENT MIDDLEWARE] Acceso cliente autorizado')
})