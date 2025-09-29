<template>
  <div class="system-reports-page">
    
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
            <NuxtLink to="/admin" class="btn-back">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
              </svg>
              Volver al Dashboard
            </NuxtLink>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading Overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Generando reportes del sistema...</p>
      </div>
    </div>

    <!-- Main Content -->
    <main v-if="!loading" class="reports-main">
      <div class="container">
        
        <!-- Page Header -->
        <section class="page-header">
          <div class="section-header">
            <h2>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 17H7A5 5 0 0 1 7 7h2m6 0h2a5 5 0 1 1 0 10h-2" stroke="currentColor" stroke-width="2"/>
                <path d="M12 12h-2m0 0V8m0 4v4" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Reportes del Sistema
            </h2>
            <p>Análisis completo de la arquitectura y estado de la base de datos</p>
          </div>
          
          <!-- Controles de filtros -->
          <div class="controls-section">
            <div class="filters-row">
              <div class="search-box">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
                  <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
                </svg>
                <input 
                  v-model="searchTerm" 
                  type="text" 
                  placeholder="Buscar en reportes..."
                />
              </div>
              
              <select v-model="selectedTimeRange" class="filter-select">
                <option value="today">Hoy</option>
                <option value="week">Esta semana</option>
                <option value="month">Este mes</option>
                <option value="all">Todo el tiempo</option>
              </select>
              
              <button @click="exportReport" class="btn-export">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" stroke-width="2"/>
                  <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                </svg>
                Exportar
              </button>
            </div>
          </div>
        </section>

        <!-- System Overview Stats -->
        <section class="system-overview">
          <div class="stats-grid">
            <div class="stat-card database">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <ellipse cx="12" cy="5" rx="9" ry="3" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ systemStats.totalTables }}</h3>
                <p>Tablas Totales</p>
                <span class="stat-change positive">+{{ systemStats.newTables }} nuevas</span>
              </div>
            </div>

            <div class="stat-card columns">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                  <rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ systemStats.totalColumns }}</h3>
                <p>Columnas Registradas</p>
                <span class="stat-change positive">+{{ systemStats.newColumns }} este mes</span>
              </div>
            </div>

            <div class="stat-card schemas">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="11" x2="15" y2="11" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ systemStats.totalSchemas }}</h3>
                <p>Esquemas Activos</p>
                <span class="stat-change neutral">Sin cambios</span>
              </div>
            </div>

            <div class="stat-card performance">
              <div class="stat-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>{{ systemStats.responseTime }}ms</h3>
                <p>Tiempo de Respuesta</p>
                <span class="stat-change positive">-15% mejora</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Database Analysis -->
        <section class="database-analysis">
          <div class="section-header">
            <h3>Análisis de Base de Datos</h3>
            <p>Distribución y estadísticas detalladas del esquema</p>
          </div>

          <div class="analysis-grid">
            <!-- DBMS Distribution Chart -->
            <div class="analysis-card chart-card">
              <div class="card-header">
                <h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 12h20" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Distribución por DBMS
                </h4>
              </div>
              <div class="chart-container">
                <canvas ref="dbmsChart" width="400" height="300"></canvas>
              </div>
              <div class="chart-legend">
                <div v-for="(value, key) in dbmsDistribution" :key="key" class="legend-item">
                  <span class="legend-color" :style="{ backgroundColor: getDBMSColor(key) }"></span>
                  <span class="legend-label">{{ key }}: {{ value }}</span>
                </div>
              </div>
            </div>

            <!-- Data Types Chart -->
            <div class="analysis-card chart-card">
              <div class="card-header">
                <h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Tipos de Datos
                </h4>
              </div>
              <div class="chart-container">
                <canvas ref="dataTypesChart" width="400" height="300"></canvas>
              </div>
              <div class="data-types-list">
                <div v-for="(count, type) in dataTypesDistribution" :key="type" class="data-type-item">
                  <span class="type-name">{{ type }}</span>
                  <span class="type-count">{{ count }}</span>
                  <div class="type-bar">
                    <div class="type-progress" :style="{ width: (count / maxDataTypeCount) * 100 + '%' }"></div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schema Statistics -->
            <div class="analysis-card table-card">
              <div class="card-header">
                <h4>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Estadísticas por Esquema
                </h4>
                <div class="card-actions">
                  <button @click="refreshSchemaStats" class="btn-refresh">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" stroke="currentColor" stroke-width="2"/>
                      <path d="M21 3v5h-5" stroke="currentColor" stroke-width="2"/>
                      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" stroke="currentColor" stroke-width="2"/>
                      <path d="M8 16H3v5" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </button>
                </div>
              </div>
              <div class="table-container">
                <table class="schema-table">
                  <thead>
                    <tr>
                      <th>Esquema</th>
                      <th>Tablas</th>
                      <th>Columnas</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="schema in schemaStats" :key="schema.name">
                      <td class="schema-name">{{ schema.name }}</td>
                      <td class="table-count">{{ schema.tableCount }}</td>
                      <td class="column-count">{{ schema.columnCount }}</td>
                      <td>
                        <span class="status-badge" :class="schema.status">
                          {{ schema.status === 'active' ? 'Activo' : 'Inactivo' }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>

        <!-- System Health Monitoring -->
        <section class="system-health">
          <div class="section-header">
            <h3>Monitoreo del Sistema</h3>
            <p>Estado actual y métricas de rendimiento</p>
          </div>

          <div class="health-grid">
            <div class="health-card cpu">
              <div class="health-header">
                <h4>CPU</h4>
                <span class="health-percentage">{{ systemHealth.cpu }}%</span>
              </div>
              <div class="health-bar">
                <div class="health-progress cpu" :style="{ width: systemHealth.cpu + '%' }"></div>
              </div>
              <p class="health-status">Normal</p>
            </div>

            <div class="health-card memory">
              <div class="health-header">
                <h4>Memoria</h4>
                <span class="health-percentage">{{ systemHealth.memory }}%</span>
              </div>
              <div class="health-bar">
                <div class="health-progress memory" :style="{ width: systemHealth.memory + '%' }"></div>
              </div>
              <p class="health-status">Normal</p>
            </div>

            <div class="health-card storage">
              <div class="health-header">
                <h4>Almacenamiento</h4>
                <span class="health-percentage">{{ systemHealth.storage }}%</span>
              </div>
              <div class="health-bar">
                <div class="health-progress storage" :style="{ width: systemHealth.storage + '%' }"></div>
              </div>
              <p class="health-status">Normal</p>
            </div>

            <div class="health-card network">
              <div class="health-header">
                <h4>Red</h4>
                <span class="health-value">{{ systemHealth.network }} Mbps</span>
              </div>
              <div class="network-indicator">
                <div class="signal-bars">
                  <div class="bar active"></div>
                  <div class="bar active"></div>
                  <div class="bar active"></div>
                  <div class="bar"></div>
                </div>
              </div>
              <p class="health-status">Buena</p>
            </div>
          </div>
        </section>

        <!-- Recent Activity -->
        <section class="recent-activity">
          <div class="section-header">
            <h3>Actividad Reciente</h3>
            <p>Últimas operaciones en el sistema</p>
          </div>

          <div class="activity-card">
            <div class="activity-list">
              <div v-for="activity in recentActivities" :key="activity.id" class="activity-item">
                <div class="activity-icon" :class="activity.type">
                  <component :is="getActivityIcon(activity.type)"></component>
                </div>
                <div class="activity-content">
                  <h5>{{ activity.title }}</h5>
                  <p>{{ activity.description }}</p>
                  <time>{{ formatTime(activity.timestamp) }}</time>
                </div>
                <div class="activity-status" :class="activity.status">
                  {{ activity.status === 'success' ? 'Exitoso' : activity.status === 'warning' ? 'Advertencia' : 'Error' }}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'

// Middleware de autenticación admin
definePageMeta({
  middleware: 'admin',
  layout: false
})

// Meta tags
useHead({
  title: 'Reportes del Sistema - Fredy Fasbear Admin',
  meta: [
    { name: 'description', content: 'Panel de reportes y monitoreo del sistema' }
  ]
})

// ===== COMPOSABLES =====
const { user } = useAuth()
const { 
  loading,
  error,
  overviewLoading,
  databaseLoading,
  healthLoading,
  activityLoading,
  isLoading,
  hasError,
  getSystemOverview,
  getDatabaseAnalysis,
  getSystemHealth,
  getRecentActivity,
  exportSystemReport,
  refreshAllData,
  formatTimeAgo,
  formatNumber,
  getDBMSColor,
  getActivityIcon,
  getHealthStatus,
  clearError
} = useSystemReports()

// ===== ESTADO REACTIVO =====
const searchTerm = ref('')
const selectedTimeRange = ref('month')

// Datos del sistema
const systemStats = ref({
  totalTables: 0,
  newTables: 0,
  totalColumns: 0,
  newColumns: 0,
  totalSchemas: 0,
  responseTime: 0,
  totalUsers: 0,
  activeSessions: 0
})

const dbmsDistribution = ref({})
const dataTypesDistribution = ref({})
const schemaStats = ref([])
const systemHealth = ref({
  cpu: 0,
  memory: 0,
  storage: 0,
  network: 0,
  dbConnections: 0,
  dbSize: '0 MB',
  uptime: 0
})
const recentActivities = ref([])

// Intervalos para actualización automática
const refreshInterval = ref(null)
const healthInterval = ref(null)

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

const maxDataTypeCount = computed(() => {
  const values = Object.values(dataTypesDistribution.value)
  return values.length > 0 ? Math.max(...values) : 1
})

const filteredActivities = computed(() => {
  if (!searchTerm.value) return recentActivities.value
  
  const term = searchTerm.value.toLowerCase()
  return recentActivities.value.filter(activity => 
    activity.title.toLowerCase().includes(term) ||
    activity.description.toLowerCase().includes(term) ||
    activity.user.toLowerCase().includes(term)
  )
})

// ===== MÉTODOS =====

/**
 * Cargar todos los datos iniciales
 */
const loadInitialData = async () => {
  try {
    console.log('🚀 Cargando datos iniciales del panel de reportes...')
    
    // Cargar estadísticas generales
    const overview = await getSystemOverview()
    systemStats.value = {
      ...systemStats.value,
      ...overview
    }
    
    // Cargar análisis de base de datos
    const dbAnalysis = await getDatabaseAnalysis()
    dbmsDistribution.value = dbAnalysis.dbmsDistribution || {}
    dataTypesDistribution.value = dbAnalysis.dataTypesDistribution || {}
    schemaStats.value = dbAnalysis.schemaStats || []
    
    // Cargar métricas de salud
    const health = await getSystemHealth()
    systemHealth.value = {
      ...systemHealth.value,
      ...health
    }
    
    // Cargar actividad reciente
    const activities = await getRecentActivity(15)
    recentActivities.value = activities || []
    
    console.log('✅ Datos iniciales cargados exitosamente')
    
  } catch (err) {
    console.error('❌ Error cargando datos iniciales:', err)
  }
}

/**
 * Actualizar solo las métricas de salud (más frecuente)
 */
const updateHealthMetrics = async () => {
  try {
    const health = await getSystemHealth()
    systemHealth.value = {
      ...systemHealth.value,
      ...health
    }
  } catch (err) {
    console.error('❌ Error actualizando métricas de salud:', err)
  }
}

/**
 * Actualizar estadísticas de esquemas
 */
const refreshSchemaStats = async () => {
  try {
    console.log('🔄 Actualizando estadísticas de esquemas...')
    const dbAnalysis = await getDatabaseAnalysis()
    schemaStats.value = dbAnalysis.schemaStats || []
    console.log('✅ Estadísticas de esquemas actualizadas')
  } catch (err) {
    console.error('❌ Error actualizando esquemas:', err)
  }
}

/**
 * Exportar reporte
 */
const exportReport = async () => {
  try {
    console.log('📤 Iniciando exportación de reporte...')
    
    const exportInfo = await exportSystemReport({
      reportType: 'system-overview',
      format: 'csv',
      dateRange: {
        start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días
        end: new Date()
      }
    })
    
    // Mostrar mensaje de éxito (podrías usar una notificación)
    console.log('✅ Reporte exportado:', exportInfo.fileName)
    alert(`Reporte exportado exitosamente: ${exportInfo.fileName}`)
    
  } catch (err) {
    console.error('❌ Error exportando reporte:', err)
    alert('Error exportando el reporte. Inténtalo de nuevo.')
  }
}

/**
 * Actualizar todos los datos manualmente
 */
const refreshAllReports = async () => {
  try {
    console.log('🔄 Actualizando todos los reportes...')
    await loadInitialData()
    console.log('✅ Todos los reportes actualizados')
  } catch (err) {
    console.error('❌ Error actualizando reportes:', err)
  }
}

/**
 * Configurar intervalos de actualización automática
 */
const setupAutoRefresh = () => {
  // Actualizar todos los datos cada 5 minutos
  refreshInterval.value = setInterval(() => {
    console.log('🔄 Actualización automática programada...')
    loadInitialData()
  }, 5 * 60 * 1000)
  
  // Actualizar métricas de salud cada 30 segundos
  healthInterval.value = setInterval(() => {
    updateHealthMetrics()
  }, 30 * 1000)
}

/**
 * Limpiar intervalos
 */
const clearIntervals = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
  
  if (healthInterval.value) {
    clearInterval(healthInterval.value)
    healthInterval.value = null
  }
}

// ===== LIFECYCLE HOOKS =====
onMounted(async () => {
  try {
    // Cargar datos iniciales
    await loadInitialData()
    
    // Configurar actualización automática
    setupAutoRefresh()
    
    console.log('🎉 Panel de reportes del sistema listo')
    
  } catch (error) {
    console.error('❌ Error inicializando panel de reportes:', error)
  }
})

onUnmounted(() => {
  // Limpiar intervalos al destruir el componente
  clearIntervals()
  console.log('🧹 Intervalos de actualización limpiados')
})

// ===== FUNCIONES DE TEMPLATE =====

/**
 * Determinar clase CSS para el estado de salud
 */
const getHealthClass = (value, thresholds = { warning: 70, critical: 90 }) => {
  if (value >= thresholds.critical) return 'critical'
  if (value >= thresholds.warning) return 'warning'
  return 'normal'
}

/**
 * Formatear tiempo de uptime
 */
const formatUptime = (seconds) => {
  if (!seconds) return 'Desconocido'
  
  const days = Math.floor(seconds / (24 * 60 * 60))
  const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
  const minutes = Math.floor((seconds % (60 * 60)) / 60)
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m`
  if (hours > 0) return `${hours}h ${minutes}m`
  return `${minutes}m`
}
</script>

<style scoped>
/* Paleta de colores del sistema */
.system-reports-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
}

/* Loading Overlay */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
  color: #D4AF37;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top: 3px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Header */
.admin-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
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
  background: #D4AF37;
  color: #1A1A1A;
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
  color: #D4AF37;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #1A1A1A;
  font-weight: bold;
  font-size: 0.9rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.2);
  border: 1px solid rgba(212, 175, 55, 0.3);
  color: #D4AF37;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  font-weight: 500;
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.3);
  color: white;
}

/* Main Content */
.reports-main {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Page Header */
.page-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  overflow: hidden;
}

.section-header {
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2C3E50;
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

.section-header h2 svg {
  color: #D4AF37;
}

.section-header p {
  color: #4A4A4A;
  margin: 0;
  font-size: 1rem;
}

.controls-section {
  padding: 1.5rem 2rem;
  background: #f8f9fa;
}

.filters-row {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
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
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background: white;
}

.search-box input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.btn-export {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-export:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

/* System Overview Stats */
.system-overview {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
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
  border-left: 4px solid;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.stat-card.database { 
  border-left-color: #3498DB; 
}

.stat-card.columns { 
  border-left-color: #27AE60; 
}

.stat-card.schemas { 
  border-left-color: #D4AF37; 
}

.stat-card.performance { 
  border-left-color: #9B59B6; 
}

.stat-icon {
  padding: 1rem;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.database .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-card.columns .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.schemas .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.stat-card.performance .stat-icon {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.stat-content h3 {
  font-size: 2rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: #2C3E50;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0 0 0.5rem;
  font-weight: 500;
}

.stat-change {
  font-size: 0.8rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
}

.stat-change.positive {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-change.neutral {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

/* Database Analysis */
.database-analysis {
  margin-bottom: 3rem;
}

.database-analysis .section-header {
  background: white;
  border-radius: 16px 16px 0 0;
  margin-bottom: 0;
  padding: 2rem;
}

.database-analysis .section-header h3 {
  color: #2C3E50;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

.analysis-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
}

.analysis-card {
  background: white;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.analysis-card:first-child {
  border-radius: 0 16px 16px 16px;
}

.analysis-card:nth-child(2) {
  border-radius: 16px 0 16px 16px;
}

.analysis-card:last-child {
  border-radius: 16px 16px 0 16px;
  grid-column: 1 / -1;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h4 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #2C3E50;
  font-weight: 600;
  margin: 0;
}

.card-header h4 svg {
  color: #D4AF37;
}

.card-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-refresh {
  background: none;
  border: 1px solid #e9ecef;
  color: #6c757d;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  border-color: #D4AF37;
  color: #D4AF37;
}

.chart-container {
  padding: 1.5rem;
  min-height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.chart-legend {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 2px;
}

.legend-label {
  color: #4A4A4A;
  font-weight: 500;
}

.data-types-list {
  padding: 1.5rem;
  max-height: 300px;
  overflow-y: auto;
}

.data-type-item {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 1rem;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.data-type-item:last-child {
  border-bottom: none;
}

.type-name {
  font-weight: 500;
  color: #2C3E50;
}

.type-count {
  background: #D4AF37;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: bold;
  min-width: 30px;
  text-align: center;
}

.type-bar {
  grid-column: 1 / -1;
  background: #f8f9fa;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.type-progress {
  height: 100%;
  background: linear-gradient(90deg, #D4AF37, #F4D03F);
  transition: width 0.5s ease;
}

.table-container {
  overflow-x: auto;
}

.schema-table {
  width: 100%;
  border-collapse: collapse;
}

.schema-table th,
.schema-table td {
  padding: 1rem 1.5rem;
  text-align: left;
  border-bottom: 1px solid #e9ecef;
}

.schema-table th {
  background: #f8f9fa;
  color: #2C3E50;
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.schema-name {
  font-weight: 600;
  color: #2C3E50;
}

.table-count,
.column-count {
  font-weight: 500;
  color: #4A4A4A;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.active {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.status-badge.inactive {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

/* System Health */
.system-health {
  margin-bottom: 3rem;
}

.system-health .section-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.system-health .section-header h3 {
  color: #2C3E50;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

.health-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.health-card {
  background: white;
  padding: 1.5rem;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.health-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
}

.health-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.health-header h4 {
  color: #2C3E50;
  font-weight: 600;
  margin: 0;
}

.health-percentage {
  font-size: 1.2rem;
  font-weight: bold;
  color: #D4AF37;
}

.health-value {
  font-size: 1.2rem;
  font-weight: bold;
  color: #D4AF37;
}

.health-bar {
  background: #f8f9fa;
  height: 8px;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.75rem;
}

.health-progress {
  height: 100%;
  border-radius: 4px;
  transition: width 0.5s ease;
}

.health-progress.cpu {
  background: linear-gradient(90deg, #3498DB, #5DADE2);
}

.health-progress.memory {
  background: linear-gradient(90deg, #27AE60, #58D68D);
}

.health-progress.storage {
  background: linear-gradient(90deg, #D4AF37, #F4D03F);
}

.network-indicator {
  margin-bottom: 0.75rem;
}

.signal-bars {
  display: flex;
  gap: 2px;
  align-items: end;
}

.bar {
  width: 8px;
  background: #e9ecef;
  border-radius: 2px;
}

.bar:nth-child(1) { height: 10px; }
.bar:nth-child(2) { height: 15px; }
.bar:nth-child(3) { height: 20px; }
.bar:nth-child(4) { height: 25px; }

.bar.active {
  background: linear-gradient(180deg, #27AE60, #58D68D);
}

.health-status {
  color: #4A4A4A;
  font-size: 0.9rem;
  margin: 0;
  font-weight: 500;
}

/* Recent Activity */
.recent-activity .section-header {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 1.5rem;
}

.recent-activity .section-header h3 {
  color: #2C3E50;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0 0 0.5rem;
}

.activity-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.activity-list {
  padding: 1.5rem;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 0;
  border-bottom: 1px solid #f8f9fa;
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.database {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.activity-icon.security {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.activity-icon.maintenance {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.activity-icon.error {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.activity-content {
  flex: 1;
}

.activity-content h5 {
  color: #2C3E50;
  font-weight: 600;
  margin: 0 0 0.25rem;
  font-size: 0.95rem;
}

.activity-content p {
  color: #4A4A4A;
  margin: 0 0 0.25rem;
  font-size: 0.9rem;
}

.activity-content time {
  color: #6c757d;
  font-size: 0.8rem;
}

.activity-status {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  flex-shrink: 0;
}

.activity-status.success {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.activity-status.warning {
  background: rgba(241, 196, 15, 0.1);
  color: #F1C40F;
}

.activity-status.error {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

/* Responsive Design */
@media (max-width: 768px) {
  .container {
    padding: 0 1rem;
  }

  .header-container {
    padding: 0 1rem;
  }

  .filters-row {
    flex-direction: column;
    align-items: stretch;
  }

  .search-box {
    min-width: auto;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .analysis-grid {
    grid-template-columns: 1fr;
  }

  .health-grid {
    grid-template-columns: 1fr;
  }

  .analysis-card:last-child {
    grid-column: auto;
  }

  .activity-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.75rem;
  }

  .activity-status {
    align-self: flex-start;
  }
}
</style>