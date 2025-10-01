// FRONTEND/middleware/client.js
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  
  if (!user.value) {
    console.log('[CLIENT MIDDLEWARE] ❌ Sin usuario, redirigiendo a login')
    return navigateTo('/login')
  }
  
  // Si es admin, redirigir al panel admin
  if (user.value.tipoUsuario === 'Administrador') {
    console.log('[CLIENT MIDDLEWARE] 🔄 Admin redirigido a su panel')
    return navigateTo('/admin')
  }
  
  // Verificar que sea cliente
  if (user.value.tipoUsuario !== 'Cliente') {
    console.log('[CLIENT MIDDLEWARE] ❌ Tipo de usuario no válido')
    return navigateTo('/login')
  }
  
  console.log('[CLIENT MIDDLEWARE] ✅ Acceso autorizado')
})