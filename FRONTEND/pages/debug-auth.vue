<template>
  <div class="debug-page">
    <div class="debug-container">
      <h1>🔍 Debug de Autenticación</h1>
      
      <div class="debug-section">
        <h2>Estado Actual</h2>
        <div class="debug-info">
          <p><strong>Usuario Logueado:</strong> {{ isLoggedIn ? '✅ Sí' : '❌ No' }}</p>
          <p><strong>Es Admin:</strong> {{ isAdmin ? '✅ Sí' : '❌ No' }}</p>
          <p><strong>Tipo Usuario:</strong> {{ user?.tipoUsuario || 'No definido' }}</p>
          <p><strong>Nombre:</strong> {{ user?.nombre || 'No disponible' }}</p>
          <p><strong>Email:</strong> {{ user?.email || 'No disponible' }}</p>
        </div>
      </div>

      <div class="debug-section">
        <h2>Tokens en Storage</h2>
        <div class="debug-info">
          <h3>localStorage:</h3>
          <ul>
            <li v-for="item in localStorageItems" :key="item.key">
              <strong>{{ item.key }}:</strong> {{ item.value.substring(0, 50) }}{{ item.value.length > 50 ? '...' : '' }}
            </li>
          </ul>
          
          <h3>sessionStorage:</h3>
          <ul>
            <li v-for="item in sessionStorageItems" :key="item.key">
              <strong>{{ item.key }}:</strong> {{ item.value.substring(0, 50) }}{{ item.value.length > 50 ? '...' : '' }}
            </li>
          </ul>
        </div>
      </div>

      <div class="debug-section">
        <h2>Debug Completo</h2>
        <pre class="debug-json">{{ JSON.stringify(debugInfo, null, 2) }}</pre>
      </div>

      <div class="debug-actions">
        <button @click="refreshDebugInfo" class="btn-debug">🔄 Refrescar</button>
        <button @click="testLogin" class="btn-debug">🧪 Test Login</button>
        <button @click="forceLogout" class="btn-debug danger">🚪 Force Logout</button>
        <button @click="clearAllStorage" class="btn-debug danger">🗑️ Limpiar Todo</button>
        <NuxtLink to="/admin" class="btn-debug">🎯 Ir a Admin</NuxtLink>
        <NuxtLink to="/login" class="btn-debug">🔐 Ir a Login</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// ===== IMPORTS =====
const { user, isLoggedIn, isAdmin, getDebugInfo, logout, checkAuth } = useAuth()

// ===== ESTADO =====
const debugInfo = ref({})
const localStorageItems = ref([])
const sessionStorageItems = ref([])

// ===== MÉTODOS =====
const refreshDebugInfo = () => {
  console.log('[DEBUG] Refrescando información de debug...')
  
  // Obtener info del composable
  debugInfo.value = getDebugInfo()
  
  // Obtener items de localStorage
  if (process.client) {
    localStorageItems.value = []
    sessionStorageItems.value = []
    
    // localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && (key.includes('token') || key.includes('user') || key.includes('auth'))) {
        localStorageItems.value.push({
          key,
          value: localStorage.getItem(key) || ''
        })
      }
    }
    
    // sessionStorage
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      if (key && (key.includes('token') || key.includes('user') || key.includes('auth'))) {
        sessionStorageItems.value.push({
          key,
          value: sessionStorage.getItem(key) || ''
        })
      }
    }
  }
  
  console.log('[DEBUG] Info actualizada:', debugInfo.value)
}

const testLogin = () => {
  console.log('[DEBUG] Ejecutando test de login...')
  
  // Datos de prueba del admin
  const testUserData = {
    id: 1,
    nombre: 'Administrador',
    apellido: 'Test',
    email: 'admin@freddyfasbear.com',
    tipoUsuario: 'Administrador'
  }
  
  const testToken = 'test-token-' + Date.now()
  
  const { login } = useAuth()
  login(testUserData, testToken, true)
  
  setTimeout(refreshDebugInfo, 100)
}

const forceLogout = () => {
  console.log('[DEBUG] Ejecutando logout forzado...')
  logout()
  setTimeout(refreshDebugInfo, 100)
}

const clearAllStorage = () => {
  console.log('[DEBUG] Limpiando todo el storage...')
  
  if (process.client) {
    localStorage.clear()
    sessionStorage.clear()
  }
  
  setTimeout(refreshDebugInfo, 100)
}

// ===== LIFECYCLE =====
onMounted(() => {
  refreshDebugInfo()
  
  // Refrescar cada 5 segundos
  const interval = setInterval(refreshDebugInfo, 5000)
  
  onUnmounted(() => {
    clearInterval(interval)
  })
})
</script>

<style scoped>
.debug-page {
  min-height: 100vh;
  background: #1a1a1a;
  color: #fff;
  font-family: 'Courier New', monospace;
  padding: 2rem;
}

.debug-container {
  max-width: 1200px;
  margin: 0 auto;
}

.debug-container h1 {
  color: #D4AF37;
  text-align: center;
  margin-bottom: 2rem;
}

.debug-section {
  background: #2a2a2a;
  border: 1px solid #444;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.debug-section h2 {
  color: #D4AF37;
  margin-bottom: 1rem;
  border-bottom: 1px solid #444;
  padding-bottom: 0.5rem;
}

.debug-section h3 {
  color: #ccc;
  margin: 1rem 0 0.5rem 0;
  font-size: 1rem;
}

.debug-info p, .debug-info li {
  margin: 0.5rem 0;
  font-size: 0.9rem;
}

.debug-info ul {
  list-style: none;
  padding: 0;
}

.debug-info li {
  background: #333;
  padding: 0.5rem;
  margin: 0.25rem 0;
  border-radius: 4px;
  word-break: break-all;
}

.debug-json {
  background: #000;
  border: 1px solid #444;
  border-radius: 4px;
  padding: 1rem;
  overflow-x: auto;
  font-size: 0.8rem;
  white-space: pre-wrap;
  max-height: 400px;
  overflow-y: auto;
}

.debug-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 2rem;
}

.btn-debug {
  padding: 0.75rem 1.5rem;
  background: #D4AF37;
  color: #1a1a1a;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-debug:hover {
  background: #F4D03F;
  transform: translateY(-2px);
}

.btn-debug.danger {
  background: #e74c3c;
  color: white;
}

.btn-debug.danger:hover {
  background: #c0392b;
}
</style>