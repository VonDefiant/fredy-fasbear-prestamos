<template>
  <div class="evaluador-panel">
    <header class="evaluador-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <img src="~/assets/images/logo.png" alt="Logo">
            <div>
              <h1>Fredy Fasbear</h1>
              <span class="evaluador-badge">Panel Evaluador</span>
            </div>
          </NuxtLink>
        </div>
        
        <div class="header-right">
          <div class="evaluador-info">
            <span class="welcome-text">{{ userDisplayName }}</span>
            <div class="user-avatar">
              {{ getUserInitials() }}
            </div>
          </div>
          
          <div class="evaluador-actions">
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

    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando panel de evaluador...</p>
      </div>
    </div>

    <div v-if="error && !loading" class="error-state">
      <div class="container">
        <div class="error-content">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>Error al cargar el dashboard</h3>
          <p>{{ error }}</p>
          <button @click="loadDashboardData" class="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    </div>

    <main v-if="!loading && !error" class="evaluador-main">
      <div class="container">
        
        <section class="dashboard-overview">
          <div class="section-header">
            <h2>Panel de Evaluación de Solicitudes</h2>
            <p>Gestiona las solicitudes de préstamo y realiza avalúos</p>
          </div>

          <div class="stats-grid">
            <div class="stat-card pendientes">
              <div class="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Pendientes</h3>
                <p class="stat-value">{{ dashboardStats.solicitudesPendientes || 0 }}</p>
                <span class="stat-label">Por evaluar</span>
              </div>
            </div>

            <div class="stat-card aprobadas">
              <div class="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.3 2 18.23 3.68 19.9 6.3" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Aprobadas</h3>
                <p class="stat-value">{{ dashboardStats.solicitudesAprobadas || 0 }}</p>
                <span class="stat-label">Tasa: {{ dashboardStats.tasaAprobacion || 0 }}%</span>
              </div>
            </div>

            <div class="stat-card rechazadas">
              <div class="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Rechazadas</h3>
                <p class="stat-value">{{ dashboardStats.solicitudesRechazadas || 0 }}</p>
                <span class="stat-label">Total rechazadas</span>
              </div>
            </div>

            <div class="stat-card avaluos">
              <div class="stat-icon">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
                  <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 12H15M9 16H15" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Avalúos Realizados</h3>
                <p class="stat-value">{{ dashboardStats.avaluosRealizados || 0 }}</p>
                <span class="stat-label">Q{{ formatCurrency(dashboardStats.valorTotalAvaluado || 0) }} total</span>
              </div>
            </div>
          </div>
        </section>

        <div class="dashboard-grid">
          <section class="solicitudes-pendientes">
            <div class="section-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
                Solicitudes Pendientes de Evaluación
              </h3>
              <button @click="cargarSolicitudes" class="btn-refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M23 4V10H17" stroke="currentColor" stroke-width="2"/>
                  <path d="M1 20V14H7" stroke="currentColor" stroke-width="2"/>
                  <path d="M3.51 9C4.15 6.7 5.74 4.75 7.85 3.55C11.85 1.41 16.79 2.74 19.07 6.51L23 10M1 14L4.93 17.49C7.21 21.26 12.15 22.59 16.15 20.45C18.26 19.25 19.85 17.3 20.49 15" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>

            <div v-if="loadingSolicitudes" class="loading-state">
              <div class="spinner-small"></div>
              <p>Cargando solicitudes...</p>
            </div>

            <div v-else-if="solicitudesPendientes.length === 0" class="empty-state">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2"/>
                <path d="M21 12V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h4>No hay solicitudes pendientes</h4>
              <p>Todas las solicitudes han sido evaluadas</p>
            </div>

            <div v-else class="solicitudes-list">
              <div 
                v-for="solicitud in solicitudesPendientes" 
                :key="solicitud.id" 
                class="solicitud-card"
                @click="verDetalleSolicitud(solicitud.id)"
              >
                <div class="solicitud-header">
                  <div class="solicitud-info">
                    <h4>Solicitud #{{ solicitud.id }}</h4>
                    <p class="cliente-nombre">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      {{ solicitud.usuario.nombre }} {{ solicitud.usuario.apellido }}
                    </p>
                  </div>
                  <span class="estado-badge pendiente">{{ solicitud.estado }}</span>
                </div>

                <div class="solicitud-details">
                  <div class="detail-item">
                    <span class="label">Artículo:</span>
                    <span class="value">{{ solicitud.Articulo[0]?.tipoArticulo?.nombre || 'N/A' }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Valor estimado:</span>
                    <span class="value">Q{{ formatCurrency(solicitud.Articulo[0]?.valorEstimadoCliente || 0) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="label">Fecha solicitud:</span>
                    <span class="value">{{ formatDate(solicitud.fechaSolicitud) }}</span>
                  </div>
                </div>

                <div class="solicitud-actions">
                  <button class="btn-evaluar">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
                      <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Evaluar Solicitud
                  </button>
                </div>
              </div>
            </div>
          </section>

          <section class="actividad-reciente">
            <div class="section-header">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Actividad Reciente
              </h3>
            </div>

            <div v-if="loadingActivity" class="loading-state">
              <div class="spinner-small"></div>
              <p>Cargando actividad...</p>
            </div>

            <div v-else-if="actividadReciente.length === 0" class="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Sin actividad reciente</p>
            </div>

            <div v-else class="activity-list">
              <div 
                v-for="actividad in actividadReciente" 
                :key="actividad.id"
                class="activity-item"
              >
                <div class="activity-icon" :class="actividad.estado.toLowerCase()">
                  <svg v-if="actividad.estado === 'Aprobada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else-if="actividad.estado === 'Rechazada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="activity-content">
                  <p class="activity-description">{{ actividad.descripcion }}</p>
                  <p class="activity-meta">
                    Cliente: <strong>{{ actividad.cliente }}</strong> • 
                    Q{{ formatCurrency(actividad.monto) }} • 
                    {{ formatTimeAgo(actividad.fecha) }}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['evaluador']
})

const { user, logout } = useAuth()
const loading = ref(true)
const loadingSolicitudes = ref(false)
const loadingActivity = ref(false)
const error = ref(null)
const refreshInterval = ref(null)

const dashboardStats = ref({
  solicitudesPendientes: 0,
  solicitudesAprobadas: 0,
  solicitudesRechazadas: 0,
  avaluosRealizados: 0,
  valorTotalAvaluado: 0,
  valorPromedioAvaluo: 0,
  tasaAprobacion: 0,
  solicitudesHoy: 0
})

const solicitudesPendientes = ref([])
const actividadReciente = ref([])

const userDisplayName = computed(() => {
  if (!user.value) return 'Evaluador'
  return `${user.value.nombre} ${user.value.apellido}`
})

const api = async (endpoint, options = {}) => {
  const config = useRuntimeConfig()
  const token = useCookie('authToken').value

  const response = await fetch(`${config.public.apiBase}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    }
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.message || 'Error en la petición')
  }

  return data
}

const getEvaluadorStats = async () => {
  try {
    const response = await api('/evaluador/stats')
    return response.data
  } catch (err) {
    console.error('Error obteniendo estadísticas:', err)
    throw err
  }
}

const cargarSolicitudes = async () => {
  try {
    loadingSolicitudes.value = true
    const response = await api('/evaluador/solicitudes?estado=Pendiente&limite=10')
    solicitudesPendientes.value = response.data
    console.log('Solicitudes pendientes cargadas:', solicitudesPendientes.value.length)
  } catch (err) {
    console.error('Error cargando solicitudes:', err)
  } finally {
    loadingSolicitudes.value = false
  }
}

const loadRecentActivity = async () => {
  try {
    loadingActivity.value = true
    const response = await api('/evaluador/recent-activity')
    actividadReciente.value = response.data || []
  } catch (err) {
    console.error('Error cargando actividad:', err)
    actividadReciente.value = []
  } finally {
    loadingActivity.value = false
  }
}

const loadDashboardData = async () => {
  try {
    loading.value = true
    error.value = null
    console.log('Cargando panel de evaluador...')
    
    const stats = await getEvaluadorStats()
    dashboardStats.value = stats
    
    await Promise.all([
      cargarSolicitudes(),
      loadRecentActivity()
    ])
    
    console.log('Panel cargado exitosamente')
    
  } catch (err) {
    console.error('Error cargando panel:', err)
    error.value = err.message || 'Error al cargar el dashboard'
  } finally {
    loading.value = false
  }
}

const startAutoRefresh = () => {
  refreshInterval.value = setInterval(() => {
    console.log('Actualizando estadísticas...')
    loadDashboardData()
  }, 5 * 60 * 1000)
}

const stopAutoRefresh = () => {
  if (refreshInterval.value) {
    clearInterval(refreshInterval.value)
    refreshInterval.value = null
  }
}

const handleLogout = () => {
  stopAutoRefresh()
  logout()
  navigateTo('/')
}

const getUserInitials = () => {
  if (!user.value) return 'E'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'E'
}

const verDetalleSolicitud = (id) => {
  navigateTo(`/evaluador/solicitudes/${id}`)
}

const formatCurrency = (value) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

const formatDate = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatTimeAgo = (timestamp) => {
  const now = new Date()
  const date = new Date(timestamp)
  const diff = now - date
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes}m`
  if (hours < 24) return `Hace ${hours}h`
  if (days < 30) return `Hace ${days}d`
  return formatDate(timestamp)
}

onMounted(() => {
  loadDashboardData()
  startAutoRefresh()
})

onUnmounted(() => {
  stopAutoRefresh()
})
</script>

<style scoped>
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-dorado-claro: #F4D03F;
  --color-rojo-granate: #8B0000;
  --color-marron-chocolate: #3E2723;
  --color-verde-bosque: #1B4332;
}

.evaluador-panel {
  min-height: 100vh;
  background: #F5F5F5;
}

/* HEADER */
.evaluador-header {
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-negro-carbon));
  border-bottom: 3px solid var(--color-dorado-vintage);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 1rem;
  color: var(--color-blanco-perla);
  text-decoration: none;
}

.logo img {
  height: 48px;
  width: auto;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
}

.evaluador-badge {
  display: inline-block;
  background: var(--color-dorado-vintage);
  color: var(--color-negro-carbon);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  margin-top: 0.25rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.evaluador-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.welcome-text {
  color: var(--color-blanco-perla);
  font-weight: 500;
  font-size: 0.95rem;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--color-dorado-vintage);
  color: var(--color-negro-carbon);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 0.95rem;
  border: 2px solid var(--color-blanco-perla);
}

.btn-logout {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: var(--color-blanco-perla);
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-logout:hover {
  background: var(--color-rojo-granate);
  border-color: var(--color-rojo-granate);
  transform: translateY(-2px);
}

/* LOADING & ERROR */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(245, 245, 245, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-spinner {
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.2);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(212, 175, 55, 0.2);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.loading-spinner p {
  color: var(--color-gris-acero);
  font-weight: 500;
}

.error-state {
  padding: 4rem 2rem;
}

.error-content {
  text-align: center;
  max-width: 500px;
  margin: 0 auto;
}

.error-content svg {
  color: var(--color-rojo-granate);
  margin-bottom: 1rem;
}

.btn-retry {
  background: var(--color-dorado-vintage);
  color: var(--color-negro-carbon);
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* MAIN CONTENT */
.evaluador-main {
  padding: 2rem 0;
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section-header {
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.section-header p {
  color: var(--color-gris-acero);
  font-size: 1rem;
}

/* STATS GRID */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  transition: all 0.3s ease;
  border-left: 4px solid transparent;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
}

.stat-card.pendientes {
  border-left-color: #F59E0B;
}

.stat-card.pendientes .stat-icon {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
}

.stat-card.aprobadas {
  border-left-color: #10B981;
}

.stat-card.aprobadas .stat-icon {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #065F46;
}

.stat-card.rechazadas {
  border-left-color: var(--color-rojo-granate);
}

.stat-card.rechazadas .stat-icon {
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  color: var(--color-rojo-granate);
}

.stat-card.avaluos {
  border-left-color: var(--color-azul-marino);
}

.stat-card.avaluos .stat-icon {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: var(--color-azul-marino);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content h3 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  margin-bottom: 0.25rem;
}

.stat-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  line-height: 1;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

/* DASHBOARD GRID */
.dashboard-grid {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
  margin-top: 2rem;
}

@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}

/* SECCIONES */
.solicitudes-pendientes,
.actividad-reciente {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.btn-refresh {
  background: var(--color-blanco-perla);
  border: 1px solid #E5E7EB;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  color: var(--color-gris-acero);
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: var(--color-dorado-vintage);
  color: white;
  border-color: var(--color-dorado-vintage);
  transform: rotate(180deg);
}

/* LOADING & EMPTY STATES */
.loading-state,
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: var(--color-gris-acero);
}

.spinner-small {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(212, 175, 55, 0.2);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 1rem;
}

.empty-state svg {
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.empty-state h4 {
  color: var(--color-negro-carbon);
  font-weight: 600;
  margin-bottom: 0.5rem;
}

/* SOLICITUDES LIST */
.solicitudes-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.solicitud-card {
  background: var(--color-blanco-perla);
  border: 1px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.25rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.solicitud-card:hover {
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2);
  transform: translateX(4px);
}

.solicitud-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.solicitud-info h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 0.25rem;
}

.cliente-nombre {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.estado-badge.pendiente {
  background: #FEF3C7;
  color: #92400E;
}

.solicitud-details {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 8px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item .label {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.detail-item .value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.solicitud-actions {
  display: flex;
  gap: 0.75rem;
}

.btn-evaluar {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.75rem 1.25rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-evaluar:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(212, 175, 55, 0.3);
}

/* ACTIVITY LIST */
.activity-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.activity-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: var(--color-blanco-perla);
  border-radius: 8px;
  border-left: 3px solid transparent;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.activity-icon.aprobada {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #065F46;
  border-left-color: #10B981;
}

.activity-icon.rechazada {
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  color: var(--color-rojo-granate);
  border-left-color: var(--color-rojo-granate);
}

.activity-content {
  flex: 1;
}

.activity-description {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-negro-carbon);
  margin-bottom: 0.25rem;
}

.activity-meta {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

.activity-meta strong {
  color: var(--color-negro-carbon);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .solicitud-details {
    grid-template-columns: 1fr;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>