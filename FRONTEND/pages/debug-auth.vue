<template>
  <div class="debug-page">
    <h1>🔍 Debug de Autenticación</h1>
    
    <div class="debug-section">
      <h2>Estado Actual</h2>
      <div class="info-grid">
        <div class="info-item">
          <strong>Usuario:</strong>
          <span>{{ user ? user.nombre : 'null' }}</span>
        </div>
        <div class="info-item">
          <strong>Email:</strong>
          <span>{{ user ? user.email : 'null' }}</span>
        </div>
        <div class="info-item">
          <strong>Tipo:</strong>
          <span>{{ user ? user.tipoUsuario : 'null' }}</span>
        </div>
        <div class="info-item">
          <strong>isLoggedIn:</strong>
          <span :class="isLoggedIn ? 'success' : 'error'">{{ isLoggedIn }}</span>
        </div>
      </div>
    </div>

    <div class="debug-section">
      <h2>LocalStorage</h2>
      <pre>{{ localStorageData }}</pre>
    </div>

    <div class="debug-section">
      <h2>SessionStorage</h2>
      <pre>{{ sessionStorageData }}</pre>
    </div>

    <div class="debug-section">
      <h2>Acciones</h2>
      <div class="button-group">
        <button @click="reloadAuth" class="btn-primary">
          🔄 Recargar Auth
        </button>
        <button @click="testLogin" class="btn-success">
          ✅ Test Login
        </button>
        <button @click="clearAll" class="btn-danger">
          🗑️ Limpiar Todo
        </button>
        <button @click="location.reload()" class="btn-warning">
          🔃 Recargar Página
        </button>
      </div>
    </div>

    <div class="debug-section">
      <h2>Logs en Consola</h2>
      <p>Abre la consola del navegador (F12) para ver logs detallados</p>
    </div>
  </div>
</template>

<script setup>
const { user, isLoggedIn, checkAuth, login, logout, getDebugInfo } = useAuth()

const localStorageData = ref({})
const sessionStorageData = ref({})

const loadStorageData = () => {
  if (process.client) {
    // LocalStorage
    const localData = {}
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      localData[key] = localStorage.getItem(key)
    }
    localStorageData.value = localData

    // SessionStorage
    const sessionData = {}
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i)
      sessionData[key] = sessionStorage.getItem(key)
    }
    sessionStorageData.value = sessionData

    console.log('[DEBUG] Storage cargado:', {
      localStorage: localData,
      sessionStorage: sessionData
    })
  }
}

const reloadAuth = () => {
  console.log('[DEBUG] Recargando autenticación...')
  const result = checkAuth()
  console.log('[DEBUG] Resultado checkAuth:', result)
  console.log('[DEBUG] Estado usuario:', user.value)
  console.log('[DEBUG] isLoggedIn:', isLoggedIn.value)
  console.log('[DEBUG] Debug completo:', getDebugInfo())
  loadStorageData()
}

const testLogin = () => {
  console.log('[DEBUG] Ejecutando test login...')
  
  const testUser = {
    id: 999,
    nombre: 'Test',
    apellido: 'Usuario',
    email: 'test@test.com',
    tipoUsuario: 'Cliente'
  }
  
  const testToken = 'test-token-' + Date.now()
  
  login(testUser, testToken, false)
  
  console.log('[DEBUG] Login de prueba ejecutado')
  console.log('[DEBUG] Usuario después del login:', user.value)
  console.log('[DEBUG] isLoggedIn después del login:', isLoggedIn.value)
  
  setTimeout(() => {
    loadStorageData()
  }, 100)
}

const clearAll = () => {
  console.log('[DEBUG] Limpiando todo...')
  logout()
  localStorage.clear()
  sessionStorage.clear()
  loadStorageData()
  console.log('[DEBUG] Todo limpiado')
}

onMounted(() => {
  console.log('[DEBUG PAGE] Montando página de debug...')
  loadStorageData()
  reloadAuth()
})

// Recargar storage cada 2 segundos
if (process.client) {
  setInterval(loadStorageData, 2000)
}
</script>

<style scoped>
.debug-page {
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem;
  font-family: monospace;
}

h1 {
  color: #2c3e50;
  margin-bottom: 2rem;
}

.debug-section {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.debug-section h2 {
  margin-top: 0;
  color: #34495e;
  border-bottom: 2px solid #3498db;
  padding-bottom: 0.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 4px;
}

.info-item strong {
  color: #7f8c8d;
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.info-item span {
  font-size: 1.1rem;
  font-weight: bold;
}

.success {
  color: #27ae60;
}

.error {
  color: #e74c3c;
}

pre {
  background: #2c3e50;
  color: #ecf0f1;
  padding: 1rem;
  border-radius: 4px;
  overflow-x: auto;
  font-size: 0.9rem;
  max-height: 300px;
}

.button-group {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s;
  font-family: inherit;
}

.btn-primary {
  background: #3498db;
  color: white;
}

.btn-primary:hover {
  background: #2980b9;
}

.btn-success {
  background: #27ae60;
  color: white;
}

.btn-success:hover {
  background: #229954;
}

.btn-danger {
  background: #e74c3c;
  color: white;
}

.btn-danger:hover {
  background: #c0392b;
}

.btn-warning {
  background: #f39c12;
  color: white;
}

.btn-warning:hover {
  background: #d68910;
}
</style>