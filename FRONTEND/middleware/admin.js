// FRONTEND/middleware/admin.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()

  
  if (!user.value) {
    console.log('[ADMIN MIDDLEWARE] ❌ Sin usuario, redirigiendo a login')
    return navigateTo('/login')
  }
  
  if (user.value.tipoUsuario !== 'Administrador') {
    console.log('[ADMIN MIDDLEWARE] ❌ Sin permisos de admin')
    
    if (process.client) {
      alert('⚠️ No tienes permisos de administrador')
    }
    
    return navigateTo('/dashboard')
  }
  
  console.log('[ADMIN MIDDLEWARE] ✅ Acceso autorizado')
})