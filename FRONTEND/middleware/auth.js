// FRONTEND/middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { user, isLoggedIn } = useAuth()

  
  if (!isLoggedIn.value) {
    console.log('[AUTH MIDDLEWARE] ❌ No autenticado, redirigiendo a login')
    
    // Guardar la ruta para redirigir después del login
    if (process.client && to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    
    return navigateTo('/login')
  }
  
  console.log('[AUTH MIDDLEWARE] ✅ Usuario autenticado:', user.value.email)
})