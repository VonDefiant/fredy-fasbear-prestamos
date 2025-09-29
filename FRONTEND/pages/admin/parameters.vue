<template>
  <div class="audit-logs-panel">
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
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="icon-wrapper">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M12 22S8 18 8 13V7L12 5L16 7V13C16 18 12 22 12 22Z" stroke="currentColor" stroke-width="2"/>
              <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div>
            <h1>Auditoría y Seguridad</h1>
            <p>Logs de actividad y auditoría del sistema</p>
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
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalLogs }}</h3>
            <p>{{ totalLogs === 1 ? 'Registro encontrado' : 'Registros encontrados' }}</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ ultimaActualizacion }}</h3>
            <p>Última Actualización</p>
          </div>
        </div>
      </div>

      <!-- Filtros -->
      <div class="filtros-section">
        <div class="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="filtros.search" 
            type="text" 
            placeholder="Buscar por usuario, acción, entidad..."
            @input="debouncedSearch"
          >
        </div>

        <div class="filter-controls">
          <select v-model="filtros.accion" @change="aplicarFiltros" class="filter-select">
            <option value="">Todas las acciones</option>
            <option value="LOGIN">Login</option>
            <option value="LOGOUT">Logout</option>
            <option value="CREAR">Crear</option>
            <option value="ACTUALIZAR">Actualizar</option>
            <option value="ELIMINAR">Eliminar</option>
            <option value="CONSULTAR">Consultar</option>
          </select>

          <select v-model="filtros.entidad" @change="aplicarFiltros" class="filter-select">
            <option value="">Todas las entidades</option>
            <option value="usuario">Usuario</option>
            <option value="solicitud">Solicitud</option>
            <option value="prestamo">Préstamo</option>
            <option value="pago">Pago</option>
            <option value="producto">Producto</option>
          </select>

          <button @click="limpiarFiltros" class="btn-clear">
            Limpiar filtros
          </button>
        </div>
      </div>

      <!-- Empty State -->
      <div v-if="!logs.length && !loading" class="empty-state">
        <svg width="80" height="80" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
          <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No se encontraron registros</h3>
        <p>
          {{ filtrosActivos ? 'Intenta ajustar los filtros de búsqueda' : 'Los logs aparecerán aquí cuando se realicen actividades en el sistema' }}
        </p>
        <button v-if="filtrosActivos" @click="limpiarFiltros" class="btn-secondary">
          Limpiar filtros
        </button>
      </div>

      <!-- Logs Grid -->
      <div v-else class="logs-grid">
        <div 
          v-for="log in logs" 
          :key="log.id" 
          class="log-card"
          @click="toggleDetalles(log)"
          :class="{ 'expandido': logExpandido === log.id }"
        >
          <div class="log-header">
            <div class="log-info">
              <div class="log-title">
                <span :class="['action-badge', getActionClass(log.accion)]">
                  {{ log.accion }}
                </span>
                <h3>{{ log.entidad || 'Sistema' }}</h3>
              </div>
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
  title: 'Auditoría y Logs - Fredy Fasbear Admin'
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
  const diff = Math.floor((now - new Date()) / 1000)
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
/* Variables */
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
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

/* Page Header */
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
}

.btn-primary {
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
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

/* Stats Overview */
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

/* Filtros */
.filtros-section {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
}

.search-bar {
  position: relative;
  margin-bottom: 1rem;
}

.search-bar svg {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-text);
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  flex: 1;
  min-width: 200px;
  padding: 0.75rem;
  border: 1px solid var(--color-border);
  border-radius: 8px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.btn-clear {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-clear:hover {
  background: var(--color-danger);
  color: white;
  border-color: var(--color-danger);
}

/* Empty State */
.empty-state {
  background: white;
  padding: 4rem 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  text-align: center;
}

.empty-state svg {
  color: var(--color-text);
  opacity: 0.5;
  margin-bottom: 1.5rem;
}

.empty-state h3 {
  color: var(--color-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-text);
  margin-bottom: 1.5rem;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
}

.btn-secondary {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}

/* Logs Grid */
.logs-grid {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.log-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.log-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.log-card.expandido {
  border: 2px solid var(--color-primary);
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 1rem;
}

.log-info {
  flex: 1;
}

.log-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.75rem;
}

.log-title h3 {
  margin: 0;
  color: var(--color-dark);
  font-size: 1.1rem;
}

.action-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.8rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.action-badge.success {
  background: rgba(39, 174, 96, 0.1);
  color: var(--color-success);
}

.action-badge.info {
  background: rgba(52, 152, 219, 0.1);
  color: var(--color-info);
}

.action-badge.warning {
  background: rgba(243, 156, 18, 0.1);
  color: var(--color-warning);
}

.action-badge.danger {
  background: rgba(231, 76, 60, 0.1);
  color: var(--color-danger);
}

.action-badge.primary {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-primary);
}

.action-badge.default {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

.log-meta {
  display: flex;
  gap: 1.5rem;
  flex-wrap: wrap;
}

.log-meta span {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-text);
  font-size: 0.9rem;
}

.log-meta svg {
  color: var(--color-text);
  opacity: 0.6;
}

.toggle-btn {
  background: rgba(212, 175, 55, 0.1);
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  color: var(--color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-btn:hover {
  background: var(--color-primary);
  color: white;
}

/* Log Details */
.log-details {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--color-border);
}

.detail-row {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 1rem;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.detail-row.full-width {
  grid-template-columns: 1fr;
}

.detail-row .label {
  font-weight: 600;
  color: var(--color-dark);
}

.detail-row .value {
  color: var(--color-text);
}

.detail-row .value.ip {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.detail-row .value.user-agent {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  word-break: break-all;
}

.json-details {
  background: #2C3E50;
  color: #a9dc76;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.pagination-btn {
  background: white;
  border: 1px solid var(--color-border);
  color: var(--color-text);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
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
  border-color: var(--color-primary);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-info {
  color: var(--color-text);
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .btn-primary {
    width: 100%;
    justify-content: center;
  }
  
  .stats-overview {
    grid-template-columns: 1fr;
  }
  
  .filter-controls {
    flex-direction: column;
  }
  
  .filter-select {
    width: 100%;
  }
  
  .detail-row {
    grid-template-columns: 1fr;
  }
}
</style>