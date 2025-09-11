// middleware/auth.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { isLoggedIn, requireAuth } = useAuth()
  
  // Si no está logueado, redirigir al login
  if (!isLoggedIn.value) {
    return navigateTo('/login')
  }
})