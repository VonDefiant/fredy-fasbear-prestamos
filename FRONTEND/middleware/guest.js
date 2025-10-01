// FRONTEND/middleware/guest.js
// Middleware para páginas que solo usuarios NO autenticados pueden ver
export default defineNuxtRouteMiddleware((to, from) => {
  const { user } = useAuth()
  
  // Si hay usuario autenticado, redirigir según su rol
  if (user.value) {
    console.log('[GUEST MIDDLEWARE] Usuario autenticado detectado, redirigiendo...')
    
    // Verificar si hay URL de redirección guardada
    const redirectUrl = process.client ? sessionStorage.getItem('redirect_after_login') : null
    
    if (redirectUrl) {
      sessionStorage.removeItem('redirect_after_login')
      console.log('[GUEST MIDDLEWARE] Redirigiendo a URL guardada:', redirectUrl)
      return navigateTo(redirectUrl)
    }
    
    // Redirigir según el rol del usuario
    switch (user.value.tipoUsuario) {
      case 'Administrador':
        return navigateTo('/admin')
      case 'Evaluador':
        return navigateTo('/evaluator')
      case 'Cobrador':
        return navigateTo('/collector')
      case 'Cliente':
        return navigateTo('/dashboard')
      default:
        return navigateTo('/dashboard')
    }
  }
  
  // Si no hay usuario, permitir acceso a la página (login/register)
  console.log('[GUEST MIDDLEWARE] Sin usuario, permitiendo acceso a', to.path)
})