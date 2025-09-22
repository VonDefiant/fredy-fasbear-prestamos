// FRONTEND/middleware/admin.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, isAdmin, user } = useAuth()
  
  console.log('[ADMIN MIDDLEWARE] Verificando acceso admin:', {
    isLoggedIn: isLoggedIn.value,
    isAdmin: isAdmin.value,
    userType: user.value?.tipoUsuario,
    route: to.path
  })
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn.value) {
    console.log('[ADMIN MIDDLEWARE] Usuario no logueado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Si está logueado pero no es administrador
  if (!isAdmin.value) {
    console.log('[ADMIN MIDDLEWARE] Usuario sin permisos de admin, redirigiendo a dashboard')
    

    if (process.client) {
      console.warn('Acceso denegado: Se requieren permisos de administrador')
      // Aquí puedes agregar una notificación/toast si tienes un sistema implementado

    }
    
    // Redirigir al dashboard de usuario
    return navigateTo('/dashboard')
  }
  
  console.log('[ADMIN MIDDLEWARE] Acceso admin autorizado')
})