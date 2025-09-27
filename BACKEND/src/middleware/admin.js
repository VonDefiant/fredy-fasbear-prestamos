export default defineNuxtRouteMiddleware((to) => {
  // Obtener el composable de autenticación
  const { user, isAuthenticated } = useAuth()

  // Verificar si el usuario está autenticado
  if (!isAuthenticated.value) {
    console.warn('🚫 Usuario no autenticado intentando acceder a admin')
    
    // Guardar la ruta intentada para redirigir después del login
    const returnUrl = to.fullPath
    
    return navigateTo({
      path: '/login',
      query: { redirect: returnUrl }
    })
  }

  // Verificar si el usuario tiene rol de administrador
  if (!user.value || user.value.tipoUsuario !== 'Administrador') {
    console.warn('🚫 Usuario sin permisos de administrador:', {
      email: user.value?.email,
      tipoUsuario: user.value?.tipoUsuario,
      rutaIntentada: to.fullPath
    })
    
    // Mostrar error de acceso denegado
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso Denegado',
      data: {
        message: 'No tienes permisos para acceder a esta sección.',
        requiredRole: 'Administrador',
        currentRole: user.value?.tipoUsuario || 'Sin rol',
        suggestion: 'Contacta al administrador del sistema si necesitas acceso.'
      }
    })
  }

  // Si llegamos aquí, el usuario es administrador y puede continuar
  console.log('✅ Acceso autorizado a admin:', {
    email: user.value.email,
    nombre: `${user.value.nombre} ${user.value.apellido}`,
    ruta: to.fullPath
  })
})