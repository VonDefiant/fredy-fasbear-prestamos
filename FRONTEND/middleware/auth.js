// FRONTEND/middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, user } = useAuth()
  
  console.log('[AUTH MIDDLEWARE] Verificando autenticación:', {
    isLoggedIn: isLoggedIn.value,
    userType: user.value?.tipoUsuario,
    route: to.path,
    from: from?.path
  })
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn.value) {
    console.log('[AUTH MIDDLEWARE] Usuario no logueado, redirigiendo a login')
    

    if (process.client && to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    
    return navigateTo('/login')
  }
  
  console.log('[AUTH MIDDLEWARE] Usuario autenticado, acceso permitido')
})