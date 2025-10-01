// FRONTEND/middleware/admin.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, isAdmin, user, checkAuth } = useAuth()
  
  console.log('[ADMIN MIDDLEWARE] 🔍 Verificando acceso admin:', {
    isLoggedIn: isLoggedIn.value,
    isAdmin: isAdmin.value,
    userType: user.value?.tipoUsuario,
    route: to.path
  })
  
  // Si no está logueado, intentar restaurar sesión primero
  if (!isLoggedIn.value && process.client) {
    const hasToken = localStorage.getItem('token')
    const hasUserData = localStorage.getItem('user_data')
    
    if (hasToken && hasUserData) {
      console.log('[ADMIN MIDDLEWARE] 🔄 Restaurando sesión...')
      checkAuth()
    }
  }
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn.value) {
    console.log('[ADMIN MIDDLEWARE] ❌ Usuario no logueado, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Si está logueado pero no es administrador
  if (!isAdmin.value) {
    console.log('[ADMIN MIDDLEWARE] ❌ Usuario sin permisos de admin')
    console.warn('[ADMIN MIDDLEWARE] Tipo de usuario:', user.value?.tipoUsuario)
    
    if (process.client) {
      alert('⚠️ No tienes permisos de administrador')
    }
    
    // Redirigir al dashboard de usuario
    return navigateTo('/dashboard')
  }
  
  console.log('[ADMIN MIDDLEWARE] ✅ Acceso admin autorizado')
})