// FRONTEND/middleware/evaluador.js
export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()

  if (!user.value) {
    console.warn('🚫 Usuario no autenticado intentando acceder a evaluador')
    
    if (process.client && to.path !== '/login') {
      sessionStorage.setItem('redirect_after_login', to.fullPath)
    }
    
    return navigateTo('/login')
  }

  if (user.value.tipoUsuario !== 'Evaluador') {
    console.warn('🚫 Usuario sin permisos de evaluador:', {
      email: user.value?.email,
      tipoUsuario: user.value?.tipoUsuario,
      rutaIntentada: to.fullPath
    })
    
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso Denegado',
      data: {
        message: 'No tienes permisos para acceder a esta sección.',
        requiredRole: 'Evaluador',
        currentRole: user.value?.tipoUsuario || 'Sin rol',
        suggestion: 'Contacta al administrador si necesitas acceso.'
      }
    })
  }

  console.log('✅ Acceso autorizado a evaluador:', {
    email: user.value.email,
    nombre: `${user.value.nombre} ${user.value.apellido}`,
    ruta: to.fullPath
  })
})