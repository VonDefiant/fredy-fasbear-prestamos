<!-- FRONTEND/pages/solicitudes/index.vue -->
<template>
  <div class="solicitudes-container">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <div class="title-section">
          <h1 class="page-title">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" class="title-icon">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M14 2V8H20" stroke="currentColor" stroke-width="2" fill="none"/>
              <path d="M16 13H8M16 17H8M10 9H9H8" stroke="currentColor" stroke-width="2"/>
            </svg>
            Mis Solicitudes de Préstamo
          </h1>
          <p class="page-subtitle">
            Gestiona tus solicitudes de empeño y consulta su estado
          </p>
        </div>
        
        <NuxtLink to="/solicitudes/nueva" class="btn-primary">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2"/>
          </svg>
          Nueva Solicitud
        </NuxtLink>
      </div>
    </div>

    <!-- Estadísticas -->
    <div v-if="estadisticas" class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon total">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ estadisticas.total }}</span>
            <span class="stat-label">Total</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon pending">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ estadisticas.pendientes }}</span>
            <span class="stat-label">Pendientes</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon approved">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
              <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ estadisticas.aprobadas }}</span>
            <span class="stat-label">Aprobadas</span>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon rejected">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <span class="stat-number">{{ estadisticas.rechazadas }}</span>
            <span class="stat-label">Rechazadas</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Filtros -->
    <div class="filters-section">
      <div class="filters-container">
        <div class="filter-group">
          <label class="filter-label">Estado:</label>
          <select v-model="filtros.estado" @change="aplicarFiltros" class="filter-select">
            <option value="todas">Todas</option>
            <option value="Pendiente">Pendientes</option>
            <option value="Aprobada">Aprobadas</option>
            <option value="Rechazada">Rechazadas</option>
          </select>
        </div>

        <div class="filter-group">
          <button @click="recargarSolicitudes" class="btn-secondary" :disabled="loading">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :class="{ 'animate-spin': loading }">
              <path d="M3 12C3 7.03 7.03 3 12 3C16.97 3 21 7.03 21 12" stroke="currentColor" stroke-width="2"/>
              <path d="M21 12C21 16.97 16.97 21 12 21C7.03 21 3 16.97 3 12" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ loading ? 'Cargando...' : 'Actualizar' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Mensaje de error -->
    <div v-if="error" class="error-message">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
      </svg>
      {{ error }}
    </div>

    <!-- Lista de solicitudes -->
    <div class="solicitudes-content">
      <!-- Loading state -->
      <div v-if="loading && solicitudes.length === 0" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Cargando solicitudes...</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && solicitudes.length === 0" class="empty-state">
        <div class="empty-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <h3>No tienes solicitudes aún</h3>
        <p>¡Crea tu primera solicitud de préstamo para comenzar!</p>
        <NuxtLink to="/solicitudes/nueva" class="btn-primary">
          Crear Primera Solicitud
        </NuxtLink>
      </div>

      <!-- Lista de solicitudes -->
      <div v-else class="solicitudes-grid">
        <div 
          v-for="solicitud in solicitudes" 
          :key="solicitud.id" 
          class="solicitud-card"
          @click="verDetalle(solicitud.id)"
        >
          <!-- Estado visual -->
          <div class="card-header">
            <div class="solicitud-numero">
              <span class="numero-label">Solicitud</span>
              <span class="numero-value">#{{ solicitud.id.toString().padStart(4, '0') }}</span>
            </div>
            <div :class="['estado-badge', formatearEstado(solicitud.estado).color]">
              <span class="estado-icon">{{ formatearEstado(solicitud.estado).icono }}</span>
              <span>{{ formatearEstado(solicitud.estado).texto }}</span>
            </div>
          </div>

          <!-- Información principal -->
          <div class="card-body">
            <div class="fecha-solicitud">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ new Date(solicitud.fechaSolicitud).toLocaleDateString('es-ES') }}
            </div>

            <!-- Artículos -->
            <div class="articulos-resumen">
              <div class="articulos-count">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09293 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09293 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ solicitud.articulos.length }} artículo{{ solicitud.articulos.length !== 1 ? 's' : '' }}
              </div>
              
              <div class="articulos-preview">
                <div 
                  v-for="(articulo, index) in solicitud.articulos.slice(0, 2)" 
                  :key="articulo.id"
                  class="articulo-preview"
                >
                  <span class="articulo-tipo">{{ articulo.tipoArticulo.nombre }}</span>
                  <span class="articulo-descripcion">{{ 
                    articulo.descripcion.length > 30 
                      ? articulo.descripcion.substring(0, 30) + '...' 
                      : articulo.descripcion 
                  }}</span>
                </div>
                <div v-if="solicitud.articulos.length > 2" class="mas-articulos">
                  +{{ solicitud.articulos.length - 2 }} más
                </div>
              </div>
            </div>

            <!-- Información de avalúo si está aprobada -->
            <div v-if="solicitud.estado === 'Aprobada' && solicitud.articulos.some(a => a.avaluo)" class="avaluo-info">
              <div class="avaluo-total">
                <span class="avaluo-label">Monto aprobado:</span>
                <span class="avaluo-monto">
                  Q{{ solicitud.articulos.reduce((total, a) => total + (a.avaluo?.montoPrestamo || 0), 0).toLocaleString('es-GT', { minimumFractionDigits: 2 }) }}
                </span>
              </div>
            </div>

            <!-- Información de observaciones -->
            <div v-if="solicitud.observaciones" class="observaciones">
              <span class="observaciones-label">Observaciones:</span>
              <p class="observaciones-texto">{{ solicitud.observaciones }}</p>
            </div>
          </div>

          <!-- Card footer -->
          <div class="card-footer">
            <button class="btn-outline-small">
              Ver Detalle
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>

            <div class="workflow-indicator">
              <div class="workflow-step" :class="{ active: true }">1</div>
              <div class="workflow-line" :class="{ completed: solicitud.estado !== 'Pendiente' }"></div>
              <div class="workflow-step" :class="{ 
                active: solicitud.estado === 'Aprobada' || solicitud.estado === 'Rechazada',
                success: solicitud.estado === 'Aprobada',
                error: solicitud.estado === 'Rechazada'
              }">2</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Paginación -->
      <div v-if="pagination && pagination.totalPages > 1" class="pagination">
        <button 
          @click="cambiarPagina(pagination.page - 1)"
          :disabled="pagination.page <= 1 || loading"
          class="pagination-btn"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Anterior
        </button>
        
        <div class="pagination-info">
          Página {{ pagination.page }} de {{ pagination.totalPages }}
        </div>
        
        <button 
          @click="cambiarPagina(pagination.page + 1)"
          :disabled="pagination.page >= pagination.totalPages || loading"
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
// Meta tags y configuración
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Mis Solicitudes - Fredy Fasbear',
  description: 'Gestiona tus solicitudes de préstamo y consulta su estado'
})

// Composables
const { 
  solicitudesState, 
  getSolicitudesUsuario, 
  getEstadisticas,
  formatearEstado 
} = useSolicitudes()

const router = useRouter()

// Estado local
const loading = ref(false)
const error = ref(null)
const filtros = ref({
  estado: 'todas',
  page: 1,
  limit: 12
})

// Computed
const solicitudes = computed(() => solicitudesState.value.solicitudes)
const pagination = computed(() => solicitudesState.value.pagination)
const estadisticas = computed(() => solicitudesState.value.estadisticas)

// Métodos
const cargarSolicitudes = async () => {
  try {
    loading.value = true
    error.value = null
    
    await getSolicitudesUsuario(filtros.value)
  } catch (err) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const cargarEstadisticas = async () => {
  try {
    await getEstadisticas()
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
  }
}

const aplicarFiltros = () => {
  filtros.value.page = 1
  cargarSolicitudes()
}

const cambiarPagina = (nuevaPagina) => {
  filtros.value.page = nuevaPagina
  cargarSolicitudes()
}

const recargarSolicitudes = () => {
  cargarSolicitudes()
  cargarEstadisticas()
}

const verDetalle = (id) => {
  router.push(`/solicitudes/${id}`)
}

// Lifecycle
onMounted(() => {
  cargarSolicitudes()
  cargarEstadisticas()
})
</script>

<style scoped>
.solicitudes-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.page-header {
  margin-bottom: 2rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 2rem;
  flex-wrap: wrap;
}

.title-section {
  flex: 1;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
  font-size: 2.5rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0 0 0.5rem 0;
}

.title-icon {
  color: #667eea;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #718096;
  margin: 0;
}

.stats-section {
  margin-bottom: 2rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.total { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
.stat-icon.pending { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
.stat-icon.approved { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
.stat-icon.rejected { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2rem;
  font-weight: 700;
  color: #2d3748;
  line-height: 1;
}

.stat-label {
  font-size: 0.875rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.filters-section {
  background: white;
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
}

.filters-container {
  display: flex;
  gap: 2rem;
  align-items: center;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.filter-label {
  font-weight: 600;
  color: #4a5568;
  font-size: 0.875rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.875rem;
  min-width: 150px;
}

.error-message {
  background: #fed7d7;
  border: 1px solid #feb2b2;
  color: #c53030;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.loading-state, .empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e2e8f0;
  border-top: 3px solid #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #4a5568;
  margin: 0 0 0.5rem 0;
}

.solicitudes-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
}

.solicitud-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
}

.solicitud-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.solicitud-numero {
  display: flex;
  flex-direction: column;
}

.numero-label {
  font-size: 0.75rem;
  color: #718096;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.numero-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: #2d3748;
}

.estado-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.estado-badge.warning {
  background: #fef5e7;
  color: #d69e2e;
}

.estado-badge.success {
  background: #f0fff4;
  color: #38a169;
}

.estado-badge.error {
  background: #fed7d7;
  color: #e53e3e;
}

.card-body {
  padding: 1.5rem;
}

.fecha-solicitud {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #718096;
  font-size: 0.875rem;
  margin-bottom: 1rem;
}

.articulos-resumen {
  margin-bottom: 1rem;
}

.articulos-count {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #4a5568;
  font-weight: 600;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.articulos-preview {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.articulo-preview {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: #f7fafc;
  border-radius: 8px;
}

.articulo-tipo {
  font-size: 0.75rem;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.articulo-descripcion {
  font-size: 0.875rem;
  color: #4a5568;
}

.mas-articulos {
  font-size: 0.875rem;
  color: #718096;
  font-style: italic;
  padding: 0.5rem 0.75rem;
}

.avaluo-info {
  background: #f0fff4;
  border-left: 4px solid #38a169;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.avaluo-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avaluo-label {
  font-size: 0.875rem;
  color: #2f855a;
  font-weight: 600;
}

.avaluo-monto {
  font-size: 1.25rem;
  font-weight: 700;
  color: #38a169;
}

.card-footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.btn-outline-small {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: transparent;
  color: #667eea;
  border: 1px solid #667eea;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-outline-small:hover {
  background: #667eea;
  color: white;
}

.workflow-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.workflow-step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  background: #e2e8f0;
  color: #718096;
  transition: all 0.3s ease;
}

.workflow-step.active {
  background: #667eea;
  color: white;
}

.workflow-step.success {
  background: #38a169;
  color: white;
}

.workflow-step.error {
  background: #e53e3e;
  color: white;
}

.workflow-line {
  width: 24px;
  height: 2px;
  background: #e2e8f0;
  transition: all 0.3s ease;
}

.workflow-line.completed {
  background: #38a169;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 3rem;
  padding: 2rem;
}

.pagination-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  font-weight: 600;
  transition: all 0.2s;
}

.pagination-btn:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #718096;
  font-weight: 600;
}

/* Botones globales */
.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.875rem 1.5rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  color: #4a5568;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
}

.btn-secondary:hover:not(:disabled) {
  background: #f7fafc;
  border-color: #667eea;
  color: #667eea;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .solicitudes-container {
    padding: 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: stretch;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .solicitudes-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .filters-container {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }
}
</style>