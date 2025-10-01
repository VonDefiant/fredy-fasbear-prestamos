// FRONTEND/plugins/auth-restore.client.js
export default defineNuxtPlugin(() => {
  if (!process.client) return

  console.log('[AUTH RESTORE] 🚀 Plugin de restauración iniciado')
  
  const { checkAuth, user, isLoggedIn } = useAuth()
  
  // Intentar restaurar la sesión
  const restored = checkAuth()
  
  if (restored && user.value) {
    console.log('[AUTH RESTORE] ✅ Sesión restaurada:', user.value.email)
  } else {
    console.log('[AUTH RESTORE] ℹ️ No hay sesión para restaurar')
  }
})