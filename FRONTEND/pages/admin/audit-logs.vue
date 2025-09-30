<template>
  <div class="audit-logs-panel">
    <!-- Botón de regreso al panel de administración -->
    <div class="navigation-header">
      <NuxtLink to="/admin" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al Panel de Administración
      </NuxtLink>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando logs de auditoría...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar logs</h3>
        <p>{{ error }}</p>
        <button @click="cargarLogs" class="btn-retry">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && !error" class="logs-content">
      <!-- Page Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
              <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
              <polyline points="10,9 9,9 8,9" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <h1>Auditoría y Logs del Sistema</h1>
            <p>Monitoreo y registro de todas las actividades del sistema</p>
          </div>
        </div>
        
        <button @click="cargarLogs" class="btn-primary" :disabled="loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Actualizar
        </button>
      </div>

      <!-- Stats Overview -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalLogs }}</h3>
            <p>Eventos Registrados</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ ultimaActualizacion }}</h3>
            <p>Última Actualización</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ logs.filter(l => l.usuario).length }}</h3>
            <p>Usuarios Activos</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros-section">
        <div class="filtros-header">
          <h2>Filtros de búsqueda</h2>
        </div>
        
        <div class="filtros-content">
          <div class="search-box">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
              <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
            </svg>
            <input 
              v-model="filtros.search"
              @input="debouncedSearch"
              type="text" 
              placeholder="Buscar por acción, entidad, usuario o IP..."
            >
          </div>

          <div class="filtros-grid">
            <div class="filtro-item">
              <label>Acción</label>
              <select v-model="filtros.accion" @change="aplicarFiltros">
                <option value="">Todas las acciones</option>
                <option value="LOGIN">Login</option>
                <option value="LOGOUT">Logout</option>
                <option value="CREAR">Crear</option>
                <option value="ACTUALIZAR">Actualizar</option>
                <option value="ELIMINAR">Eliminar</option>
                <option value="CONSULTAR">Consultar</option>
                <option value="PAGO">Pago</option>
              </select>
            </div>

            <div class="filtro-item">
              <label>Entidad</label>
              <select v-model="filtros.entidad" @change="aplicarFiltros">
                <option value="">Todas las entidades</option>
                <option value="Usuario">Usuario</option>
                <option value="Cliente">Cliente</option>
                <option value="Evento">Evento</option>
                <option value="Paquete">Paquete</option>
                <option value="Parametro">Parámetro</option>
              </select>
            </div>

            <div class="filtro-item" v-if="filtrosActivos">
              <label>&nbsp;</label>
              <button @click="limpiarFiltros" class="btn-secondary">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
                Limpiar filtros
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="logs.length === 0" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" stroke-width="2"/>
          <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
          <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No hay logs registrados</h3>
        <p>No se encontraron eventos que coincidan con los filtros aplicados.</p>
      </div>

      <!-- Logs List -->
      <div v-else class="logs-list">
        <div 
          v-for="log in logs" 
          :key="log.id" 
          class="log-card"
          @click="toggleDetalles(log)"
        >
          <div class="log-header">
            <div class="log-main-info">
              <span class="action-badge" :class="getActionClass(log.accion)">
                {{ log.accion }}
              </span>
              <span class="entity">{{ log.entidad }}</span>
              <div class="log-meta">
                <span class="user">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ log.usuario ? `${log.usuario.nombre} ${log.usuario.apellido}` : 'Sistema' }}
                </span>
                <span class="date">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ formatFecha(log.fechaHora) }}
                </span>
              </div>
            </div>
            <button class="toggle-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path :d="logExpandido === log.id ? 'M18 15L12 9L6 15' : 'M6 9L12 15L18 9'" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <div v-if="logExpandido === log.id" class="log-details">
            <div class="detail-row">
              <span class="label">ID:</span>
              <span class="value">#{{ log.id }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Entidad ID:</span>
              <span class="value">{{ log.entidadId || 'N/A' }}</span>
            </div>
            <div class="detail-row">
              <span class="label">Dirección IP:</span>
              <span class="value ip">{{ log.ipAddress }}</span>
            </div>
            <div class="detail-row">
              <span class="label">User Agent:</span>
              <span class="value user-agent">{{ log.userAgent || 'N/A' }}</span>
            </div>
            <div v-if="log.detalles" class="detail-row full-width">
              <span class="label">Detalles:</span>
              <pre class="json-details">{{ formatJSON(log.detalles) }}</pre>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div v-if="totalPages > 1" class="pagination">
        <button 
          @click="cambiarPagina(paginaActual - 1)"
          :disabled="paginaActual === 1"
          class="pagination-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Anterior
        </button>

        <span class="pagination-info">
          Página {{ paginaActual }} de {{ totalPages }}
        </span>

        <button 
          @click="cambiarPagina(paginaActual + 1)"
          :disabled="paginaActual === totalPages"
          class="pagination-btn"
        >
          Siguiente
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Middleware
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

// Meta tags
useHead({
  title: 'Auditoría y Logs - Admin'
})

// Composables
const { getLogs } = useAuditLogs()

// Estado
const loading = ref(false)
const error = ref(null)
const logs = ref([])
const totalLogs = ref(0)
const paginaActual = ref(1)
const registrosPorPagina = ref(20)
const logExpandido = ref(null)

// Filtros
const filtros = ref({
  search: '',
  accion: '',
  entidad: ''
})

// Debounce timer
let searchTimeout = null

// Computed
const totalPages = computed(() => {
  return Math.ceil(totalLogs.value / registrosPorPagina.value)
})

const ultimaActualizacion = computed(() => {
  if (!logs.value.length) return 'N/A'
  const now = new Date()
  const latest = new Date(logs.value[0].fechaHora)
  const diff = Math.floor((now - latest) / 1000)
  if (diff < 60) return 'Ahora'
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`
  return `Hace ${Math.floor(diff / 3600)} hrs`
})

const filtrosActivos = computed(() => {
  return filtros.value.search || filtros.value.accion || filtros.value.entidad
})

// Métodos
const cargarLogs = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = {
      page: paginaActual.value,
      limit: registrosPorPagina.value,
      ...filtros.value
    }
    
    const response = await getLogs(params)
    
    if (response.success) {
      logs.value = response.data.logs || []
      totalLogs.value = response.data.total || 0
    }
  } catch (err) {
    console.error('Error cargando logs:', err)
    error.value = err.message || 'Error al cargar los logs'
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  paginaActual.value = 1
  cargarLogs()
}

const limpiarFiltros = () => {
  filtros.value = {
    search: '',
    accion: '',
    entidad: ''
  }
  aplicarFiltros()
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    aplicarFiltros()
  }, 500)
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 1 && nuevaPagina <= totalPages.value) {
    paginaActual.value = nuevaPagina
    cargarLogs()
  }
}

const toggleDetalles = (log) => {
  logExpandido.value = logExpandido.value === log.id ? null : log.id
}

// Formatters
const formatFecha = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatJSON = (json) => {
  if (!json) return 'N/A'
  try {
    return JSON.stringify(json, null, 2)
  } catch {
    return 'Formato inválido'
  }
}

const getActionClass = (accion) => {
  const actionMap = {
    'LOGIN': 'success',
    'LOGOUT': 'info',
    'CREAR': 'primary',
    'ACTUALIZAR': 'warning',
    'ELIMINAR': 'danger',
    'CONSULTAR': 'info',
    'PAGO': 'success'
  }
  return actionMap[accion] || 'default'
}

// Lifecycle
onMounted(() => {
  cargarLogs()
})
</script>

<style scoped>
/* Variables - MISMA PALETA que parameters.vue */
:root {
  --color-primary: #D4AF37;
  --color-success: #27AE60;
  --color-warning: #F39C12;
  --color-danger: #E74C3C;
  --color-info: #3498DB;
  --color-dark: #2C3E50;
  --color-text: #4A4A4A;
  --color-border: #e9ecef;
}

/* Contenedor principal */
.audit-logs-panel {
  padding: 0;
}

/* Botón de regreso - EXACTO como parameters.vue */
.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #D4AF37;
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
  font-size: 0.95rem;
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
  transform: translateX(-2px);
}

/* Loading State */
.loading-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.loading-spinner {
  text-align: center;
}

.loading-spinner p {
  margin-top: 1rem;
  color: var(--color-text);
  font-weight: 500;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--color-primary);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-content svg {
  color: var(--color-danger);
  margin-bottom: 1rem;
}

.error-content h3 {
  color: var(--color-dark);
  margin-bottom: 0.5rem;
  font-size: 1.5rem;
  font-weight: 600;
}

.error-content p {
  color: var(--color-text);
  margin-bottom: 1.5rem;
}

.btn-retry {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

/* Main Content */
.logs-content {
  padding: 0;
}

/* Page Header - EXACTO como parameters.vue */
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.icon-wrapper {
  width: 60px;
  height: 60px;
  background: linear-gradient(135deg, var(--color-primary), #F4D03F);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.header-left h1 {
  color: var(--color-dark);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
}

.header-left p {
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Stats Overview - EXACTO como parameters.vue */
.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
}

.stat-icon {
  width: 56px;
  height: 56px;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  flex-shrink: 0;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: var(--color-dark);
}

.stat-content p {
  color: var(--color-text);
  margin: 0;
  font-weight: 500;
}

/* Filtros - EXACTO como parameters.vue */
.filtros-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.filtros-header {
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--color-border);
}

.filtros-header h2 {
  font-size: 1.2rem;
  color: var(--color-dark);
  margin: 0;
  font-weight: 600;
}

.filtros-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.search-box {
  position: relative;
  flex: 1;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: #6c757d;
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filtros-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  align-items: end;
}

.filtro-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filtro-item label {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.9rem;
}

.filtro-item select {
  padding: 0.75rem;
  border: 2px solid var(--color-border);
  border-radius: 10px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: white;
}

.filtro-item select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.btn-secondary {
  background: white;
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
}

/* Empty State */
.empty-state {
  background: white;
  padding: 3rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-state svg {
  color: var(--color-text);
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h3 {
  color: var(--color-dark);
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.empty-state p {
  color: var(--color-text);
  margin: 0;
}

/* Logs List */
.logs-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.log-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.log-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.12);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem;
  gap: 1rem;
}

.log-main-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.action-badge {
  display: inline-flex;
  align-items: center;
  padding: 0.35rem 0.85rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 600;
  width: fit-content;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-badge.success {
  background: rgba(39, 174, 96, 0.1);
  color: var(--color-success);
}

.action-badge.warning {
  background: rgba(243, 156, 18, 0.1);
  color: var(--color-warning);
}

.action-badge.danger {
  background: rgba(231, 76, 60, 0.1);
  color: var(--color-danger);
}

.action-badge.info {
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-info);
}

.action-badge.primary {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-primary);
}

.entity {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--color-dark);
}

.log-meta {
  display: flex;
  gap: 1.5rem;
  font-size: 0.9rem;
  color: var(--color-text);
}

.log-meta span {
  display: flex;
  align-items: center;
  gap: 0.4rem;
}

.toggle-btn {
  background: rgba(212, 175, 55, 0.1);
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.toggle-btn:hover {
  background: rgba(212, 175, 55, 0.2);
}

/* Log Details */
.log-details {
  padding: 1.25rem;
  background: #f8f9fa;
  border-top: 1px solid var(--color-border);
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-row {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-row.full-width {
  grid-column: 1 / -1;
}

.detail-row .label {
  font-weight: 600;
  color: var(--color-dark);
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.detail-row .value {
  color: var(--color-text);
  font-size: 0.95rem;
}

.detail-row .value.ip {
  font-family: 'Courier New', monospace;
  background: white;
  padding: 0.5rem;
  border-radius: 6px;
  font-size: 0.9rem;
}

.detail-row .value.user-agent {
  font-size: 0.85rem;
  line-height: 1.4;
}

.json-details {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  overflow-x: auto;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  color: var(--color-dark);
  border: 1px solid var(--color-border);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
  padding: 1rem;
}

.pagination-btn {
  background: white;
  border: 2px solid var(--color-primary);
  color: var(--color-primary);
  padding: 0.75rem 1.25rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--color-primary);
  color: white;
  transform: translateY(-2px);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--color-text);
  font-weight: 600;
  padding: 0 1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .header-left {
    width: 100%;
  }

  .btn-primary {
    width: 100%;
    justify-content: center;
  }

  .stats-overview {
    grid-template-columns: 1fr;
  }

  .filtros-grid {
    grid-template-columns: 1fr;
  }

  .log-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .toggle-btn {
    align-self: flex-end;
  }

  .log-details {
    grid-template-columns: 1fr;
  }
}
</style>