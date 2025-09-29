<template>
  <div class="audit-logs-panel">
    <!-- Header del Admin Panel -->
    <header class="admin-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <img src="~/assets/images/logo.png" alt="Logo">
            <div>
              <h1>Fredy Fasbear</h1>
              <span class="admin-badge">Panel Admin</span>
            </div>
          </NuxtLink>
        </div>
        
        <div class="header-right">
          <div class="admin-info">
            <span class="welcome-text">{{ userDisplayName }}</span>
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
          </div>
          
          <div class="admin-actions">
            <button class="btn-logout" @click="handleLogout" title="Cerrar Sesión">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2"/>
                <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
                <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading Overlay -->
    <div v-if="loading && !logs.length" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando logs de auditoría...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-if="!loading || logs.length" class="admin-main">
      <div class="container">
        
        <!-- Page Header -->
        <section class="page-header">
          <div class="header-content">
            <div class="title-section">
              <button @click="navigateTo('/admin')" class="btn-back">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              <div>
                <h2>Auditoría y Logs del Sistema</h2>
                <p>Monitoreo de actividades y acciones de usuarios</p>
              </div>
            </div>
            
            <div class="header-actions">
              <button @click="refreshLogs" class="btn-refresh" :disabled="loading">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 10C21 10 18.995 7.26822 17.3662 5.63824C15.7373 4.00827 13.4864 3 11 3C6.02944 3 2 7.02944 2 12C2 16.9706 6.02944 21 11 21C15.1031 21 18.5649 18.2543 19.6482 14.5" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 10V4M21 10H15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Actualizar
              </button>
              <button @click="exportLogs" class="btn-export">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </section>

        <!-- Stats Cards -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card">
              <div class="stat-icon total">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(totalLogs) }}</h3>
                <p>Total de Registros</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon today">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(logsToday) }}</h3>
                <p>Hoy</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon users">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M23 21V19C22.9993 18.1137 22.7044 17.2528 22.1614 16.5523C21.6184 15.8519 20.8581 15.3516 20 15.13" stroke="currentColor" stroke-width="2"/>
                  <path d="M16 3.13C16.8604 3.35031 17.623 3.85071 18.1676 4.55232C18.7122 5.25392 19.0078 6.11683 19.0078 7.005C19.0078 7.89318 18.7122 8.75608 18.1676 9.45769C17.623 10.1593 16.8604 10.6597 16 10.88" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(uniqueUsers) }}</h3>
                <p>Usuarios Activos</p>
              </div>
            </div>

            <div class="stat-card">
              <div class="stat-icon actions">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ formatNumber(totalActions) }}</h3>
                <p>Acciones Registradas</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Filters Section -->
        <section class="filters-section">
          <div class="filters-card">
            <div class="filters-header">
              <h3>Filtros de Búsqueda</h3>
              <button @click="clearFilters" class="btn-clear">
                Limpiar Filtros
              </button>
            </div>
            
            <div class="filters-grid">
              <!-- Búsqueda por texto -->
              <div class="filter-group">
                <label>Buscar</label>
                <div class="search-input">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                    <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <input 
                    v-model="filters.search" 
                    type="text" 
                    placeholder="Buscar por usuario, acción, entidad..."
                    @input="debouncedSearch"
                  >
                </div>
              </div>

              <!-- Filtro por Acción -->
              <div class="filter-group">
                <label>Acción</label>
                <select v-model="filters.accion" @change="applyFilters">
                  <option value="">Todas las acciones</option>
                  <option value="LOGIN">Login</option>
                  <option value="LOGOUT">Logout</option>
                  <option value="CREAR">Crear</option>
                  <option value="ACTUALIZAR">Actualizar</option>
                  <option value="ELIMINAR">Eliminar</option>
                  <option value="CONSULTAR">Consultar</option>
                  <option value="PAGO">Pago</option>
                  <option value="AVALUO">Avalúo</option>
                  <option value="SECURITY_EVENT">Evento de Seguridad</option>
                </select>
              </div>

              <!-- Filtro por Entidad -->
              <div class="filter-group">
                <label>Entidad</label>
                <select v-model="filters.entidad" @change="applyFilters">
                  <option value="">Todas las entidades</option>
                  <option value="usuario">Usuario</option>
                  <option value="solicitud">Solicitud</option>
                  <option value="prestamo">Préstamo</option>
                  <option value="pago">Pago</option>
                  <option value="producto">Producto</option>
                  <option value="pedido">Pedido</option>
                  <option value="parametro">Parámetro</option>
                  <option value="security">Seguridad</option>
                </select>
              </div>

              <!-- Filtro por Fecha Desde -->
              <div class="filter-group">
                <label>Desde</label>
                <input 
                  v-model="filters.fechaDesde" 
                  type="date" 
                  @change="applyFilters"
                >
              </div>

              <!-- Filtro por Fecha Hasta -->
              <div class="filter-group">
                <label>Hasta</label>
                <input 
                  v-model="filters.fechaHasta" 
                  type="date" 
                  @change="applyFilters"
                >
              </div>

              <!-- Filtro por Usuario -->
              <div class="filter-group">
                <label>Usuario ID</label>
                <input 
                  v-model="filters.usuarioId" 
                  type="number" 
                  placeholder="ID del usuario"
                  @input="debouncedSearch"
                >
              </div>
            </div>
          </div>
        </section>

        <!-- Logs Table -->
        <section class="logs-section">
          <div class="logs-card">
            <div class="logs-header">
              <h3>Registros de Auditoría ({{ formatNumber(totalLogs) }})</h3>
              <div class="pagination-info">
                <span>
                  Mostrando {{ (currentPage - 1) * pageSize + 1 }} - 
                  {{ Math.min(currentPage * pageSize, totalLogs) }} de {{ formatNumber(totalLogs) }}
                </span>
              </div>
            </div>

            <!-- Loading State -->
            <div v-if="loading" class="logs-loading">
              <div class="spinner"></div>
              <p>Cargando registros...</p>
            </div>

            <!-- Empty State -->
            <div v-else-if="!logs.length" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="12" x2="16" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3>No se encontraron registros</h3>
              <p>Intenta ajustar los filtros de búsqueda</p>
            </div>

            <!-- Logs Table -->
            <div v-else class="logs-table-container">
              <table class="logs-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Fecha y Hora</th>
                    <th>Usuario</th>
                    <th>Acción</th>
                    <th>Entidad</th>
                    <th>IP</th>
                    <th>Detalles</th>
                  </tr>
                </thead>
                <tbody>
                  <tr 
                    v-for="log in logs" 
                    :key="log.id"
                    class="log-row"
                    @click="toggleLogDetails(log)"
                  >
                    <td>
                      <span class="log-id">#{{ log.id }}</span>
                    </td>
                    <td>
                      <div class="log-date">
                        <div class="date">{{ formatDate(log.fechaHora) }}</div>
                        <div class="time">{{ formatTime(log.fechaHora) }}</div>
                      </div>
                    </td>
                    <td>
                      <div class="log-user">
                        <div class="user-avatar-small">
                          {{ getInitials(log.usuario) }}
                        </div>
                        <div class="user-info">
                          <div class="user-name">{{ log.usuario?.nombre || 'Sistema' }}</div>
                          <div class="user-email">{{ log.usuario?.email || 'N/A' }}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span :class="['action-badge', getActionClass(log.accion)]">
                        {{ log.accion }}
                      </span>
                    </td>
                    <td>
                      <span class="entity-badge">
                        {{ log.entidad || 'N/A' }}
                      </span>
                    </td>
                    <td>
                      <span class="ip-address">{{ log.ipAddress }}</span>
                    </td>
                    <td>
                      <button 
                        class="btn-details"
                        @click.stop="toggleLogDetails(log)"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="1" fill="currentColor"/>
                          <circle cx="12" cy="5" r="1" fill="currentColor"/>
                          <circle cx="12" cy="19" r="1" fill="currentColor"/>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  
                  <!-- Expandable Details Row -->
                  <tr 
                    v-if="expandedLog === log.id" 
                    v-for="log in logs" 
                    :key="`details-${log.id}`"
                    class="log-details-row"
                  >
                    <td colspan="7">
                      <div class="log-details">
                        <div class="details-grid">
                          <div class="detail-item">
                            <label>ID de Entidad:</label>
                            <span>{{ log.entidadId || 'N/A' }}</span>
                          </div>
                          <div class="detail-item">
                            <label>User Agent:</label>
                            <span class="user-agent">{{ log.userAgent || 'N/A' }}</span>
                          </div>
                          <div class="detail-item full-width">
                            <label>Detalles JSON:</label>
                            <pre class="json-details">{{ formatJSON(log.detalles) }}</pre>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Pagination -->
            <div v-if="totalPages > 1" class="pagination">
              <button 
                @click="goToPage(1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M18 17L13 12L18 7M11 17L6 12L11 7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
              
              <button 
                @click="goToPage(currentPage - 1)"
                :disabled="currentPage === 1"
                class="pagination-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <div class="pagination-numbers">
                <button
                  v-for="page in visiblePages"
                  :key="page"
                  @click="goToPage(page)"
                  :class="['pagination-number', { active: currentPage === page }]"
                >
                  {{ page }}
                </button>
              </div>

              <button 
                @click="goToPage(currentPage + 1)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>

              <button 
                @click="goToPage(totalPages)"
                :disabled="currentPage === totalPages"
                class="pagination-btn"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M6 17L11 12L6 7M13 17L18 12L13 7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </section>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'

// Middleware de autenticación admin
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: false
})

// Meta tags
useHead({
  title: 'Auditoría y Logs - Fredy Fasbear Admin',
  meta: [
    { name: 'description', content: 'Panel de auditoría y logs del sistema' }
  ]
})

// ===== COMPOSABLES =====
const { user } = useAuth()
const { getLogs, exportLogsToCSV } = useAuditLogs()

// ===== ESTADO REACTIVO =====
const loading = ref(false)
const logs = ref([])
const totalLogs = ref(0)
const currentPage = ref(1)
const pageSize = ref(20)
const expandedLog = ref(null)

// Filtros
const filters = ref({
  search: '',
  accion: '',
  entidad: '',
  usuarioId: '',
  fechaDesde: '',
  fechaHasta: ''
})

// Estadísticas
const logsToday = ref(0)
const uniqueUsers = ref(0)
const totalActions = ref(0)

// Debounce timer
let searchTimeout = null

// ===== COMPUTED PROPERTIES =====
const userDisplayName = computed(() => {
  if (!user.value) return 'Administrador Sistema'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  if (nombre && apellido) {
    return `${nombre} ${apellido}`
  } else if (nombre) {
    return nombre
  } else if (user.value.email) {
    return user.value.email.split('@')[0]
  }
  
  return 'Administrador Sistema'
})

const getUserInitials = () => {
  if (!user.value) return 'AS'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicial1 = nombre.charAt(0).toUpperCase() || 'A'
  const inicial2 = apellido.charAt(0).toUpperCase() || 'S'
  
  return `${inicial1}${inicial2}`
}

const totalPages = computed(() => {
  return Math.ceil(totalLogs.value / pageSize.value)
})

const visiblePages = computed(() => {
  const pages = []
  const total = totalPages.value
  const current = currentPage.value
  
  if (total <= 7) {
    for (let i = 1; i <= total; i++) {
      pages.push(i)
    }
  } else {
    if (current <= 4) {
      for (let i = 1; i <= 5; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    } else if (current >= total - 3) {
      pages.push(1)
      pages.push('...')
      for (let i = total - 4; i <= total; i++) pages.push(i)
    } else {
      pages.push(1)
      pages.push('...')
      for (let i = current - 1; i <= current + 1; i++) pages.push(i)
      pages.push('...')
      pages.push(total)
    }
  }
  
  return pages
})

// ===== MÉTODOS =====
const loadLogs = async () => {
  try {
    loading.value = true
    
    const params = {
      page: currentPage.value,
      limit: pageSize.value,
      ...filters.value
    }
    
    const response = await getLogs(params)
    
    if (response.success) {
      logs.value = response.data.logs || []
      totalLogs.value = response.data.total || 0
      
      // Calcular estadísticas
      calculateStats()
    }
  } catch (error) {
    console.error('Error cargando logs:', error)
  } finally {
    loading.value = false
  }
}

const calculateStats = () => {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  logsToday.value = logs.value.filter(log => {
    const logDate = new Date(log.fechaHora)
    logDate.setHours(0, 0, 0, 0)
    return logDate.getTime() === today.getTime()
  }).length
  
  const userIds = new Set(logs.value.map(log => log.usuarioId).filter(Boolean))
  uniqueUsers.value = userIds.size
  
  const actions = new Set(logs.value.map(log => log.accion))
  totalActions.value = actions.size
}

const refreshLogs = () => {
  currentPage.value = 1
  loadLogs()
}

const applyFilters = () => {
  currentPage.value = 1
  loadLogs()
}

const clearFilters = () => {
  filters.value = {
    search: '',
    accion: '',
    entidad: '',
    usuarioId: '',
    fechaDesde: '',
    fechaHasta: ''
  }
  applyFilters()
}

const debouncedSearch = () => {
  if (searchTimeout) {
    clearTimeout(searchTimeout)
  }
  
  searchTimeout = setTimeout(() => {
    applyFilters()
  }, 500)
}

const goToPage = (page) => {
  if (page !== '...' && page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    loadLogs()
  }
}

const toggleLogDetails = (log) => {
  expandedLog.value = expandedLog.value === log.id ? null : log.id
}

const exportLogs = async () => {
  try {
    loading.value = true
    await exportLogsToCSV(filters.value)
  } catch (error) {
    console.error('Error exportando logs:', error)
  } finally {
    loading.value = false
  }
}

const handleLogout = async () => {
  const { logout } = useAuth()
  await logout()
  navigateTo('/login')
}

// ===== FORMATTERS =====
const formatNumber = (num) => {
  return new Intl.NumberFormat('es-GT').format(num)
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTime = (dateStr) => {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
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

const getInitials = (usuario) => {
  if (!usuario) return 'S'
  const nombre = usuario.nombre || ''
  const apellido = usuario.apellido || ''
  
  if (nombre && apellido) {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase()
  } else if (nombre) {
    return nombre.substring(0, 2).toUpperCase()
  }
  return 'S'
}

const getActionClass = (accion) => {
  const actionMap = {
    'LOGIN': 'success',
    'LOGOUT': 'info',
    'CREAR': 'primary',
    'ACTUALIZAR': 'warning',
    'ELIMINAR': 'danger',
    'CONSULTAR': 'info',
    'PAGO': 'success',
    'AVALUO': 'primary',
    'SECURITY_EVENT': 'danger'
  }
  return actionMap[accion] || 'default'
}

// ===== LIFECYCLE =====
onMounted(() => {
  loadLogs()
})

// Watch for filter changes
watch(() => filters.value.accion, applyFilters)
watch(() => filters.value.entidad, applyFilters)
watch(() => filters.value.fechaDesde, applyFilters)
watch(() => filters.value.fechaHasta, applyFilters)
</script>

<style scoped>
/* ===== VARIABLES ===== */
:root {
  --primary-color: #D4AF37;
  --dark-bg: #2C3E50;
  --darker-bg: #1A1A1A;
  --text-dark: #2C3E50;
  --text-light: #4A4A4A;
  --border-color: #e9ecef;
  --success-color: #27AE60;
  --warning-color: #F39C12;
  --danger-color: #E74C3C;
  --info-color: #3498DB;
}

/* ===== LOADING OVERLAY ===== */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* ===== HEADER ===== */
.admin-header {
  background: linear-gradient(135deg, var(--dark-bg) 0%, var(--darker-bg) 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: white;
}

.logo img {
  height: 50px;
  width: auto;
  object-fit: contain;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
  line-height: 1;
}

.admin-badge {
  background: var(--primary-color);
  color: var(--darker-bg);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.7rem;
  font-weight: bold;
  text-transform: uppercase;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.admin-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-text {
  font-weight: 500;
  color: var(--primary-color);
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, var(--primary-color), #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--darker-bg);
  font-weight: bold;
  font-size: 0.9rem;
}

.btn-logout {
  background: rgba(231, 76, 60, 0.2);
  border: 1px solid rgba(231, 76, 60, 0.3);
  color: #ff6b6b;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-logout:hover {
  background: rgba(231, 76, 60, 0.3);
  color: white;
}

/* ===== MAIN CONTENT ===== */
.admin-main {
  padding: 2rem 0;
  min-height: calc(100vh - 80px);
  background: #f8f9fa;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== PAGE HEADER ===== */
.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  background: white;
  border: 1px solid var(--border-color);
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-dark);
}

.btn-back:hover {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.title-section h2 {
  color: var(--text-dark);
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
}

.title-section p {
  color: var(--text-light);
  margin: 0;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-refresh,
.btn-export {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-dark);
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-refresh:hover {
  background: var(--info-color);
  color: white;
  border-color: var(--info-color);
}

.btn-export {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.btn-export:hover {
  background: #B8941F;
}

.btn-refresh:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ===== STATS SECTION ===== */
.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
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
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total {
  background: rgba(52, 152, 219, 0.1);
  color: var(--info-color);
}

.stat-icon.today {
  background: rgba(39, 174, 96, 0.1);
  color: var(--success-color);
}

.stat-icon.users {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.stat-icon.actions {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: var(--text-dark);
}

.stat-content p {
  color: var(--text-light);
  margin: 0;
  font-weight: 500;
}

/* ===== FILTERS SECTION ===== */
.filters-section {
  margin-bottom: 2rem;
}

.filters-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.filters-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.filters-header h3 {
  color: var(--text-dark);
  margin: 0;
  font-size: 1.2rem;
}

.btn-clear {
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-light);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.btn-clear:hover {
  background: var(--danger-color);
  color: white;
  border-color: var(--danger-color);
}

.filters-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  color: var(--text-dark);
  font-weight: 600;
  font-size: 0.9rem;
}

.search-input {
  position: relative;
  display: flex;
  align-items: center;
}

.search-input svg {
  position: absolute;
  left: 0.75rem;
  color: var(--text-light);
}

.search-input input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-group input,
.filter-group select {
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-group input:focus,
.filter-group select:focus,
.search-input input:focus {
  outline: none;
  border-color: var(--primary-color);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* ===== LOGS SECTION ===== */
.logs-section {
  margin-bottom: 2rem;
}

.logs-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.logs-header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logs-header h3 {
  color: var(--text-dark);
  margin: 0;
  font-size: 1.2rem;
}

.pagination-info {
  color: var(--text-light);
  font-size: 0.9rem;
}

/* ===== LOGS LOADING ===== */
.logs-loading {
  padding: 3rem;
  text-align: center;
  color: var(--text-light);
}

/* ===== EMPTY STATE ===== */
.empty-state {
  padding: 3rem;
  text-align: center;
}

.empty-state svg {
  color: var(--text-light);
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: var(--text-dark);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--text-light);
}

/* ===== LOGS TABLE ===== */
.logs-table-container {
  overflow-x: auto;
}

.logs-table {
  width: 100%;
  border-collapse: collapse;
}

.logs-table thead {
  background: #f8f9fa;
}

.logs-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
  border-bottom: 2px solid var(--border-color);
}

.logs-table tbody tr {
  border-bottom: 1px solid var(--border-color);
  transition: background 0.2s ease;
  cursor: pointer;
}

.logs-table tbody tr:hover {
  background: #f8f9fa;
}

.logs-table td {
  padding: 1rem;
  font-size: 0.9rem;
}

.log-id {
  font-weight: 600;
  color: var(--text-light);
}

.log-date {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.log-date .date {
  color: var(--text-dark);
  font-weight: 500;
}

.log-date .time {
  color: var(--text-light);
  font-size: 0.85rem;
}

.log-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.user-avatar-small {
  width: 36px;
  height: 36px;
  background: linear-gradient(45deg, var(--primary-color), #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.8rem;
  flex-shrink: 0;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.user-name {
  color: var(--text-dark);
  font-weight: 500;
}

.user-email {
  color: var(--text-light);
  font-size: 0.85rem;
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
  color: var(--success-color);
}

.action-badge.info {
  background: rgba(52, 152, 219, 0.1);
  color: var(--info-color);
}

.action-badge.warning {
  background: rgba(243, 156, 18, 0.1);
  color: var(--warning-color);
}

.action-badge.danger {
  background: rgba(231, 76, 60, 0.1);
  color: var(--danger-color);
}

.action-badge.primary {
  background: rgba(212, 175, 55, 0.1);
  color: var(--primary-color);
}

.action-badge.default {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

.entity-badge {
  padding: 0.35rem 0.75rem;
  border-radius: 20px;
  background: rgba(52, 73, 94, 0.1);
  color: #34495E;
  font-weight: 500;
  font-size: 0.85rem;
}

.ip-address {
  font-family: 'Courier New', monospace;
  color: var(--text-light);
  font-size: 0.85rem;
}

.btn-details {
  background: transparent;
  border: none;
  color: var(--primary-color);
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-details:hover {
  background: rgba(212, 175, 55, 0.1);
}

/* ===== LOG DETAILS ROW ===== */
.log-details-row {
  background: #f8f9fa;
}

.log-details {
  padding: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detail-item.full-width {
  grid-column: 1 / -1;
}

.detail-item label {
  font-weight: 600;
  color: var(--text-dark);
  font-size: 0.9rem;
}

.detail-item span {
  color: var(--text-light);
  font-size: 0.9rem;
}

.user-agent {
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
}

.json-details {
  background: var(--darker-bg);
  color: #a9dc76;
  padding: 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.85rem;
  overflow-x: auto;
  max-height: 300px;
  overflow-y: auto;
}

/* ===== PAGINATION ===== */
.pagination {
  padding: 1.5rem;
  border-top: 1px solid var(--border-color);
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
}

.pagination-btn {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-dark);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.pagination-btn:hover:not(:disabled) {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.pagination-numbers {
  display: flex;
  gap: 0.25rem;
}

.pagination-number {
  background: white;
  border: 1px solid var(--border-color);
  color: var(--text-dark);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 40px;
  font-weight: 500;
}

.pagination-number:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: var(--primary-color);
}

.pagination-number.active {
  background: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

/* ===== RESPONSIVE ===== */
@media (max-width: 1024px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .filters-grid {
    grid-template-columns: 1fr;
  }
  
  .logs-table-container {
    overflow-x: scroll;
  }
  
  .logs-table {
    min-width: 1000px;
  }
}

@media (max-width: 640px) {
  .title-section {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .header-actions {
    width: 100%;
    flex-direction: column;
  }
  
  .btn-refresh,
  .btn-export {
    width: 100%;
    justify-content: center;
  }
}
</style>