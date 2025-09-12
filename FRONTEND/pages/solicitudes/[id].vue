<!-- FRONTEND/pages/solicitudes/[id].vue -->
<template>
  <div class="solicitud-detalle-page">
    <!-- Loading state -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando solicitud...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="error-container">
      <div class="error-card">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="#dc2626" stroke-width="2"/>
          <path d="M15 9L9 15M9 9L15 15" stroke="#dc2626" stroke-width="2"/>
        </svg>
        <h2>Error al cargar la solicitud</h2>
        <p>{{ error }}</p>
        <button @click="$router.back()" class="btn-primary">
          Volver
        </button>
      </div>
    </div>

    <!-- Content -->
    <div v-else-if="solicitud" class="content">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <button @click="$router.back()" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          
          <div class="header-info">
            <div class="title-section">
              <h1 class="page-title">
                Solicitud #{{ solicitud.id.toString().padStart(4, '0') }}
              </h1>
              <div :class="['status-badge', getEstadoClasses(solicitud.estado)]">
                <span class="status-icon">{{ getEstadoIcon(solicitud.estado) }}</span>
                <span>{{ getEstadoTexto(solicitud.estado) }}</span>
              </div>
            </div>
            <p class="page-subtitle">
              Creada el {{ formatDate(solicitud.fechaSolicitud) }}
            </p>
          </div>
        </div>
      </div>

      <div class="main-content">
        <!-- Información general -->
        <div class="info-card">
          <div class="card-header">
            <h2>Información General</h2>
          </div>
          <div class="card-content">
            <div class="info-grid">
              <div class="info-item">
                <label>Estado Actual</label>
                <div :class="['status-display', getEstadoClasses(solicitud.estado)]">
                  {{ getEstadoTexto(solicitud.estado) }}
                </div>
              </div>
              <div class="info-item">
                <label>Fecha de Solicitud</label>
                <span>{{ formatDate(solicitud.fechaSolicitud) }}</span>
              </div>
              <div v-if="solicitud.fechaEvaluacion" class="info-item">
                <label>Fecha de Evaluación</label>
                <span>{{ formatDate(solicitud.fechaEvaluacion) }}</span>
              </div>
              <div class="info-item">
                <label>Total de Artículos</label>
                <span>{{ solicitud.articulos.length }} artículo(s)</span>
              </div>
            </div>
            
            <div v-if="solicitud.observaciones" class="observaciones-section">
              <label>Observaciones</label>
              <p class="observaciones-text">{{ solicitud.observaciones }}</p>
            </div>
          </div>
        </div>

        <!-- Lista de artículos -->
        <div class="articulos-card">
          <div class="card-header">
            <h2>Artículos Empeñados</h2>
            <span class="article-count">{{ solicitud.articulos.length }}</span>
          </div>
          <div class="card-content">
            <div class="articulos-list">
              <div 
                v-for="(articulo, index) in solicitud.articulos" 
                :key="articulo.id"
                class="articulo-item"
              >
                <div class="articulo-header">
                  <div class="articulo-number">{{ index + 1 }}</div>
                  <div class="articulo-tipo">
                    <h3>{{ articulo.tipoArticulo.nombre }}</h3>
                    <div :class="['estado-fisico', getEstadoFisicoClasses(articulo.estadoFisico)]">
                      {{ articulo.estadoFisico }}
                    </div>
                  </div>
                </div>

                <div class="articulo-details">
                  <div class="description">
                    <label>Descripción</label>
                    <p>{{ articulo.descripcion }}</p>
                  </div>

                  <div class="details-grid">
                    <div v-if="articulo.marca" class="detail-item">
                      <label>Marca</label>
                      <span>{{ articulo.marca }}</span>
                    </div>
                    <div v-if="articulo.modelo" class="detail-item">
                      <label>Modelo</label>
                      <span>{{ articulo.modelo }}</span>
                    </div>
                    <div v-if="articulo.serie" class="detail-item">
                      <label>Serie</label>
                      <span>{{ articulo.serie }}</span>
                    </div>
                    <div v-if="articulo.color" class="detail-item">
                      <label>Color</label>
                      <span>{{ articulo.color }}</span>
                    </div>
                    <div v-if="articulo.valorEstimadoCliente" class="detail-item">
                      <label>Valor Estimado (Cliente)</label>
                      <span class="precio">
                        ${{ Number(articulo.valorEstimadoCliente).toLocaleString('es-CO') }}
                      </span>
                    </div>
                  </div>

                  <div v-if="articulo.especificacionesTecnicas" class="especificaciones">
                    <label>Especificaciones Técnicas</label>
                    <p>{{ articulo.especificacionesTecnicas }}</p>
                  </div>

                  <!-- Información del avalúo (si existe) -->
                  <div v-if="articulo.avaluo" class="avaluo-info">
                    <div class="avaluo-header">
                      <h4>Avalúo Realizado</h4>
                      <div class="avaluo-fecha">
                        {{ formatDate(articulo.avaluo.fechaAvaluo) }}
                      </div>
                    </div>
                    <div class="avaluo-details">
                      <div class="avaluo-item">
                        <label>Valor Tasado</label>
                        <span class="precio destacado">
                          ${{ Number(articulo.avaluo.valorTasado).toLocaleString('es-CO') }}
                        </span>
                      </div>
                      <div class="avaluo-item">
                        <label>Valor Préstamo</label>
                        <span class="precio">
                          ${{ Number(articulo.avaluo.valorPrestamo).toLocaleString('es-CO') }}
                        </span>
                      </div>
                      <div class="avaluo-item">
                        <label>Evaluado por</label>
                        <span>{{ articulo.avaluo.evaluador.nombre }} {{ articulo.avaluo.evaluador.apellido }}</span>
                      </div>
                    </div>
                    <div v-if="articulo.avaluo.observaciones" class="avaluo-observaciones">
                      <label>Observaciones del Evaluador</label>
                      <p>{{ articulo.avaluo.observaciones }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Información del contrato (si existe) -->
        <div v-if="solicitud.contrato" class="contrato-card">
          <div class="card-header">
            <h2>Información del Contrato</h2>
            <div class="contrato-numero">
              Contrato #{{ solicitud.contrato.numeroContrato }}
            </div>
          </div>
          <div class="card-content">
            <div class="contrato-info">
              <div class="info-grid">
                <div class="info-item">
                  <label>Monto del Préstamo</label>
                  <span class="precio destacado">
                    ${{ Number(solicitud.contrato.prestamo.montoPrestamo).toLocaleString('es-CO') }}
                  </span>
                </div>
                <div class="info-item">
                  <label>Tasa de Interés</label>
                  <span>{{ solicitud.contrato.prestamo.tasaInteres }}% mensual</span>
                </div>
                <div class="info-item">
                  <label>Plazo</label>
                  <span>{{ solicitud.contrato.prestamo.plazoPago }} meses</span>
                </div>
                <div class="info-item">
                  <label>Fecha de Inicio</label>
                  <span>{{ formatDate(solicitud.contrato.prestamo.fechaInicio) }}</span>
                </div>
                <div class="info-item">
                  <label>Fecha de Vencimiento</label>
                  <span>{{ formatDate(solicitud.contrato.prestamo.fechaVencimiento) }}</span>
                </div>
                <div class="info-item">
                  <label>Estado del Préstamo</label>
                  <div :class="['status-display', getEstadoPrestamoClasses(solicitud.contrato.prestamo.estado)]">
                    {{ solicitud.contrato.prestamo.estado }}
                  </div>
                </div>
              </div>

              <!-- Próximas cuotas -->
              <div v-if="solicitud.contrato.prestamo.cuotas && solicitud.contrato.prestamo.cuotas.length > 0" class="cuotas-section">
                <h3>Próximas Cuotas</h3>
                <div class="cuotas-list">
                  <div 
                    v-for="cuota in solicitud.contrato.prestamo.cuotas" 
                    :key="cuota.id"
                    class="cuota-item"
                  >
                    <div class="cuota-info">
                      <span class="cuota-numero">Cuota {{ cuota.numeroCuota }}</span>
                      <span class="cuota-fecha">{{ formatDate(cuota.fechaVencimiento) }}</span>
                    </div>
                    <div class="cuota-monto">
                      ${{ Number(cuota.montoCuota).toLocaleString('es-CO') }}
                    </div>
                    <div :class="['cuota-estado', getEstadoCuotaClasses(cuota.estado)]">
                      {{ cuota.estado }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Timeline de estados -->
        <div class="timeline-card">
          <div class="card-header">
            <h2>Historial de la Solicitud</h2>
          </div>
          <div class="card-content">
            <div class="timeline">
              <div class="timeline-item active">
                <div class="timeline-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="timeline-content">
                  <h4>Solicitud Creada</h4>
                  <p>{{ formatDate(solicitud.fechaSolicitud) }}</p>
                </div>
              </div>
              
              <div v-if="solicitud.fechaEvaluacion" class="timeline-item active">
                <div class="timeline-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="timeline-content">
                  <h4>Solicitud Evaluada</h4>
                  <p>{{ formatDate(solicitud.fechaEvaluacion) }}</p>
                </div>
              </div>

              <div v-if="solicitud.contrato" class="timeline-item active">
                <div class="timeline-icon">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="timeline-content">
                  <h4>Contrato Generado</h4>
                  <p>{{ formatDate(solicitud.contrato.fechaCreacion) }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta y middleware
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

// Composables
const { getSolicitudDetalle, formatearEstado } = useSolicitudes()
const route = useRoute()
const router = useRouter()

// Estado reactivo
const loading = ref(false)
const error = ref(null)
const solicitud = ref(null)

// SEO dinámico
const title = computed(() => {
  if (solicitud.value) {
    return `Solicitud #${solicitud.value.id.toString().padStart(4, '0')} - Fredy Fasbear`
  }
  return 'Detalle de Solicitud - Fredy Fasbear'
})

useSeoMeta({
  title,
  description: 'Detalle de solicitud de préstamo prendario'
})

// Lifecycle
onMounted(async () => {
  await cargarSolicitud()
})

// Métodos
const cargarSolicitud = async () => {
  try {
    loading.value = true
    error.value = null
    
    const solicitudId = parseInt(route.params.id)
    if (isNaN(solicitudId)) {
      throw new Error('ID de solicitud inválido')
    }
    
    solicitud.value = await getSolicitudDetalle(solicitudId)
    
  } catch (err) {
    console.error('Error cargando solicitud:', err)
    error.value = err.message || 'Error desconocido'
  } finally {
    loading.value = false
  }
}

// Utilidades de formateo
const formatDate = (dateString) => {
  if (!dateString) return 'No disponible'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  } catch (error) {
    return 'Fecha inválida'
  }
}

const getEstadoTexto = (estado) => {
  const estados = {
    'Pendiente': 'Pendiente',
    'EnEvaluacion': 'En Evaluación',
    'Aprobada': 'Aprobada',
    'Rechazada': 'Rechazada',
    'Cancelada': 'Cancelada'
  }
  return estados[estado] || estado
}

const getEstadoClasses = (estado) => {
  const classes = {
    'Pendiente': 'warning',
    'EnEvaluacion': 'info',
    'Aprobada': 'success',
    'Rechazada': 'danger',
    'Cancelada': 'secondary'
  }
  return classes[estado] || 'secondary'
}

const getEstadoIcon = (estado) => {
  const iconos = {
    'Pendiente': '⏳',
    'EnEvaluacion': '🔍',
    'Aprobada': '✅',
    'Rechazada': '❌',
    'Cancelada': '⭕'
  }
  return iconos[estado] || '📋'
}

const getEstadoFisicoClasses = (estado) => {
  const classes = {
    'Excelente': 'success',
    'Bueno': 'info',
    'Regular': 'warning',
    'Malo': 'danger'
  }
  return classes[estado] || 'secondary'
}

const getEstadoPrestamoClasses = (estado) => {
  const classes = {
    'Activo': 'success',
    'Vencido': 'danger',
    'Pagado': 'info',
    'Liquidado': 'secondary'
  }
  return classes[estado] || 'secondary'
}

const getEstadoCuotaClasses = (estado) => {
  const classes = {
    'Pendiente': 'warning',
    'Pagada': 'success',
    'Vencida': 'danger'
  }
  return classes[estado] || 'secondary'
}
</script>

<style scoped>
.solicitud-detalle-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.loading-container,
.error-container {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
}

.loading-spinner {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-card {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-card svg {
  margin-bottom: 1rem;
}

.error-card h2 {
  color: #dc2626;
  margin-bottom: 0.5rem;
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  padding: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e2e8f0;
  color: #475569;
}

.title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.25rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-badge.success {
  background: #d1fae5;
  color: #065f46;
}

.status-badge.warning {
  background: #fef3c7;
  color: #92400e;
}

.status-badge.info {
  background: #dbeafe;
  color: #1e40af;
}

.status-badge.danger {
  background: #fee2e2;
  color: #991b1b;
}

.status-badge.secondary {
  background: #f1f5f9;
  color: #475569;
}

.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.info-card,
.articulos-card,
.contrato-card,
.timeline-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.card-header {
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.card-content {
  padding: 1.5rem;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.status-display {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  width: fit-content;
}

.observaciones-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.observaciones-section label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  display: block;
  margin-bottom: 0.5rem;
}

.observaciones-text {
  color: #374151;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 6px;
  margin: 0;
  font-style: italic;
}

.article-count {
  background: #3b82f6;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.articulos-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.articulo-item {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
}

.articulo-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
}

.articulo-number {
  width: 32px;
  height: 32px;
  background: #3b82f6;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  flex-shrink: 0;
}

.articulo-tipo {
  flex: 1;
}

.articulo-tipo h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.estado-fisico {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.articulo-details {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.description label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  display: block;
  margin-bottom: 0.25rem;
}

.description p {
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.detail-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.precio {
  font-weight: 600;
  color: #059669;
}

.precio.destacado {
  font-size: 1.1rem;
  color: #047857;
}

.especificaciones {
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

.especificaciones label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  display: block;
  margin-bottom: 0.5rem;
}

.especificaciones p {
  color: #374151;
  margin: 0;
  line-height: 1.5;
}

.avaluo-info {
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 6px;
  padding: 1rem;
  margin-top: 1rem;
}

.avaluo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.avaluo-header h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #14532d;
  margin: 0;
}

.avaluo-fecha {
  font-size: 0.875rem;
  color: #166534;
}

.avaluo-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.avaluo-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.avaluo-item label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #166534;
}

.avaluo-observaciones label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #166534;
  display: block;
  margin-bottom: 0.5rem;
}

.avaluo-observaciones p {
  color: #14532d;
  margin: 0;
  font-style: italic;
}

.contrato-numero {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
}

.cuotas-section {
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

.cuotas-section h3 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.cuotas-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.cuota-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
}

.cuota-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.cuota-numero {
  font-weight: 500;
  color: #374151;
}

.cuota-fecha {
  font-size: 0.875rem;
  color: #6b7280;
}

.cuota-monto {
  font-weight: 600;
  color: #059669;
}

.cuota-estado {
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.timeline {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.timeline-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  position: relative;
}

.timeline-item:not(:last-child)::after {
  content: '';
  position: absolute;
  left: 12px;
  top: 32px;
  bottom: -16px;
  width: 2px;
  background: #e2e8f0;
}

.timeline-item.active::after {
  background: #3b82f6;
}

.timeline-icon {
  width: 24px;
  height: 24px;
  background: #e2e8f0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: #6b7280;
}

.timeline-item.active .timeline-icon {
  background: #3b82f6;
  color: white;
}

.timeline-content h4 {
  font-size: 1rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0 0 0.25rem 0;
}

.timeline-content p {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
  cursor: pointer;
}

.btn-primary:hover {
  background: #2563eb;
}

@media (max-width: 768px) {
  .info-grid,
  .details-grid,
  .avaluo-details {
    grid-template-columns: 1fr;
  }
  
  .main-content {
    padding: 1rem;
  }
  
  .card-content {
    padding: 1rem;
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
  
  .cuota-item {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .timeline-item {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>