<template>
  <div class="solicitudes-aprobadas-container">
    <div class="header-section">
      <div class="header-title">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
          <path d="M8 6V4c0-1.1.9-2 2-2h4c1.1 0 2 .9 2 2v2" stroke="currentColor" stroke-width="2"/>
        </svg>
        <div>
          <h1>Solicitudes Aprobadas</h1>
          <p>Revisión de documentación de clientes</p>
        </div>
      </div>

      <div class="header-actions">
        <div class="search-box">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            type="text" 
            v-model="filtros.busqueda"
            @input="buscarSolicitudes"
            placeholder="Buscar por nombre, cédula, email..."
          >
        </div>

        <button @click="cargarSolicitudes" class="btn-refresh" :disabled="loading">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :class="{ rotating: loading }">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2" 
              stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Actualizar
        </button>
      </div>
    </div>

    <!-- Estadísticas rápidas -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon green">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ solicitudesConDocumentos }}</h3>
          <p>Con Documentos</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon orange">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ solicitudesSinDocumentos }}</h3>
          <p>Pendientes de Documentos</p>
        </div>
      </div>

      <div class="stat-card">
        <div class="stat-icon blue">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="stat-content">
          <h3>{{ totalSolicitudes }}</h3>
          <p>Total Aprobadas</p>
        </div>
      </div>
    </div>

    <!-- Loader -->
    <div v-if="loading && !solicitudes.length" class="loading-container">
      <div class="spinner"></div>
      <p>Cargando solicitudes aprobadas...</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="error-container">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M12 8v4m0 4h.01" stroke="currentColor" stroke-width="2"/>
      </svg>
      <p>{{ error }}</p>
      <button @click="cargarSolicitudes" class="btn-primary">Reintentar</button>
    </div>

    <!-- Lista de solicitudes -->
    <div v-else-if="solicitudes.length > 0" class="solicitudes-grid">
      <div 
        v-for="solicitud in solicitudes" 
        :key="solicitud.id"
        class="solicitud-card"
        :class="{ 'sin-documentos': !solicitud.documentacion.tieneDocumentos }"
      >
        <!-- Header -->
        <div class="card-header">
          <div class="card-title-section">
            <h3>{{ solicitud.numero }}</h3>
            <span class="badge badge-success">Aprobada</span>
          </div>
          <button 
            @click="verDetalle(solicitud.id)" 
            class="btn-icon"
            title="Ver detalle completo"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Cliente Info -->
        <div class="card-section">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h4>Información del Cliente</h4>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Nombre:</span>
              <span class="value">{{ solicitud.usuario.nombre }}</span>
            </div>
            <div class="info-item">
              <span class="label">DPI:</span>
              <span class="value">{{ solicitud.usuario.cedula || 'No proporcionado' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">{{ solicitud.usuario.email }}</span>
            </div>
            <div class="info-item">
              <span class="label">Teléfono:</span>
              <span class="value">{{ solicitud.usuario.telefono }}</span>
            </div>
          </div>
        </div>

        <!-- Préstamo Info -->
        <div class="card-section">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h4>Datos del Préstamo</h4>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Monto Aprobado:</span>
              <span class="value strong">Q {{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Plazo:</span>
              <span class="value">{{ solicitud.prestamo.plazoMeses }} meses</span>
            </div>
            <div class="info-item">
              <span class="label">Total a Pagar:</span>
              <span class="value">Q {{ formatCurrency(solicitud.prestamo.totalAPagar) }}</span>
            </div>
            <div class="info-item">
              <span class="label">Modalidad:</span>
              <span class="value">{{ solicitud.prestamo.modalidadPago }}</span>
            </div>
          </div>
        </div>

        <!-- Documentación -->
        <div class="card-section documentacion-section">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h4>Documentación de Identidad</h4>
          </div>

          <div v-if="solicitud.documentacion.tieneDocumentos" class="documentos-info">
            <div class="docs-status success">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span>{{ solicitud.documentacion.totalDocumentos }} documento(s) DPI recibido(s)</span>
            </div>

            <div class="documentos-grid">
              <div 
                v-for="doc in solicitud.documentacion.documentos" 
                :key="doc.id"
                class="documento-item"
              >
                <div class="doc-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/>
                    <path d="M4 16l4-4 3 3 5-5 4 4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="doc-info">
                  <p class="doc-name">{{ doc.nombreArchivo }}</p>
                  <p class="doc-date">{{ formatDate(doc.fechaSubida) }}</p>
                </div>
                <button 
                  @click="verDocumento(doc.rutaArchivo)" 
                  class="btn-view"
                  title="Ver documento"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" stroke="currentColor" stroke-width="2"/>
                    <path d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <div v-else class="docs-status warning">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" stroke="currentColor" stroke-width="2"/>
            </svg>
            <span>Cliente aún no ha enviado su DPI</span>
          </div>
        </div>

        <!-- Artículos -->
        <div class="card-section">
          <div class="section-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" stroke="currentColor" stroke-width="2"/>
            </svg>
            <h4>Artículos en Garantía</h4>
          </div>
          <div class="articulos-list">
            <div v-for="articulo in solicitud.articulos" :key="articulo.id" class="articulo-item">
              <div class="articulo-info">
                <p class="articulo-desc">{{ articulo.descripcion }}</p>
                <p class="articulo-details">
                  {{ articulo.tipoArticulo }} • {{ articulo.marca }} {{ articulo.modelo }}
                </p>
              </div>
              <div class="articulo-avaluo" v-if="articulo.avaluo">
                <span class="avaluo-label">Avalúo:</span>
                <span class="avaluo-value">Q {{ formatCurrency(articulo.avaluo.montoPrestamo) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Acciones -->
        <div class="card-actions">
          <button 
            @click="verDocumentacionCompleta(solicitud.id)" 
            class="btn-secondary"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Ver Toda la Documentación
          </button>
          
          <button 
            @click="procesarContrato(solicitud.id)" 
            class="btn-primary"
            :disabled="!solicitud.documentacion.tieneDocumentos"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Procesar Contrato
          </button>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
        <path d="M9 12l2 2 4-4" stroke="currentColor" stroke-width="2"/>
        <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
      </svg>
      <h3>No hay solicitudes aprobadas</h3>
      <p>Las solicitudes que apruebes aparecerán aquí para su seguimiento</p>
    </div>

    <!-- Paginación -->
    <div v-if="pagination.totalPaginas > 1" class="pagination">
      <button 
        @click="cambiarPagina(pagination.pagina - 1)"
        :disabled="pagination.pagina === 1"
        class="btn-pagination"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2"/>
        </svg>
        Anterior
      </button>

      <span class="pagination-info">
        Página {{ pagination.pagina }} de {{ pagination.totalPaginas }}
      </span>

      <button 
        @click="cambiarPagina(pagination.pagina + 1)"
        :disabled="pagination.pagina === pagination.totalPaginas"
        class="btn-pagination"
      >
        Siguiente
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
const { api } = useApi()
const router = useRouter()

// Estado
const solicitudes = ref([])
const loading = ref(false)
const error = ref(null)
const filtros = ref({
  busqueda: '',
  limite: 20,
  pagina: 1
})

const pagination = ref({
  total: 0,
  pagina: 1,
  limite: 20,
  totalPaginas: 0
})

// Computed
const totalSolicitudes = computed(() => pagination.value.total)
const solicitudesConDocumentos = computed(() => 
  solicitudes.value.filter(s => s.documentacion.tieneDocumentos).length
)
const solicitudesSinDocumentos = computed(() => 
  solicitudes.value.filter(s => !s.documentacion.tieneDocumentos).length
)

// Cargar solicitudes
const cargarSolicitudes = async () => {
  try {
    loading.value = true
    error.value = null

    const params = new URLSearchParams({
      limite: filtros.value.limite,
      pagina: filtros.value.pagina,
      busqueda: filtros.value.busqueda
    })

    const response = await api(`/evaluador/solicitudes-aprobadas?${params}`)
    
    if (response.success) {
      solicitudes.value = response.data
      pagination.value = response.pagination
    }
  } catch (err) {
    console.error('Error cargando solicitudes:', err)
    error.value = 'Error al cargar las solicitudes aprobadas'
  } finally {
    loading.value = false
  }
}

// Buscar con debounce
let buscarTimeout = null
const buscarSolicitudes = () => {
  clearTimeout(buscarTimeout)
  buscarTimeout = setTimeout(() => {
    filtros.value.pagina = 1
    cargarSolicitudes()
  }, 500)
}

// Cambiar página
const cambiarPagina = (nuevaPagina) => {
  filtros.value.pagina = nuevaPagina
  cargarSolicitudes()
}

// Ver detalle
const verDetalle = (id) => {
  navigateTo(`/evaluador/solicitudes/${id}`)
}

// Ver documentación completa
const verDocumentacionCompleta = async (solicitudId) => {
  try {
    const response = await api(`/evaluador/solicitudes/${solicitudId}/documentacion`)
    if (response.success) {
      // Aquí podrías abrir un modal con todos los documentos
      console.log('Documentación:', response.data)
      // Por ahora redirigimos al detalle
      navigateTo(`/evaluador/solicitudes/${solicitudId}`)
    }
  } catch (err) {
    console.error('Error cargando documentación:', err)
  }
}

// Ver documento individual
const verDocumento = (rutaArchivo) => {
  // Abrir documento en nueva pestaña
  const baseURL = useRuntimeConfig().public.apiBase || 'http://localhost:3001'
  const url = `${baseURL}${rutaArchivo}`
  window.open(url, '_blank')
}

// Procesar contrato
const procesarContrato = (solicitudId) => {
  // Aquí implementarías la lógica para generar/procesar el contrato
  console.log('Procesando contrato para solicitud:', solicitudId)
  // Por ahora redirigimos al detalle
  navigateTo(`/evaluador/solicitudes/${solicitudId}`)
}

// Formato
const formatCurrency = (value) => {
  if (!value) return '0.00'
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
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Lifecycle
onMounted(() => {
  cargarSolicitudes()
})
</script>

<style scoped>
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-verde-bosque: #1B4332;
  --color-rojo-granate: #8B0000;
}

.solicitudes-aprobadas-container {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}

/* Header */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-title svg {
  color: var(--color-dorado-vintage);
}

.header-title h1 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0;
}

.header-title p {
  font-size: 0.95rem;
  color: var(--color-gris-acero);
  margin: 0.25rem 0 0 0;
}

.header-actions {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-box {
  display: flex;
  align-items: center;
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  gap: 0.5rem;
  min-width: 300px;
}

.search-box svg {
  color: var(--color-gris-acero);
}

.search-box input {
  border: none;
  outline: none;
  font-size: 0.95rem;
  width: 100%;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: var(--color-azul-marino);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-refresh:hover:not(:disabled) {
  background: var(--color-negro-carbon);
  transform: translateY(-2px);
}

.btn-refresh:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.rotating {
  animation: rotate 1s linear infinite;
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
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

.stat-icon.green {
  background: linear-gradient(135deg, #1B4332, #2D6A4F);
  color: white;
}

.stat-icon.orange {
  background: linear-gradient(135deg, #F4D03F, #D4AF37);
  color: var(--color-negro-carbon);
}

.stat-icon.blue {
  background: linear-gradient(135deg, #2C3E50, #34495E);
  color: white;
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0 0 0.25rem 0;
}

.stat-content p {
  font-size: 0.9rem;
  color: var(--color-gris-acero);
  margin: 0;
}

/* Solicitudes Grid */
.solicitudes-grid {
  display: grid;
  gap: 1.5rem;
}

.solicitud-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid var(--color-verde-bosque);
  transition: all 0.3s;
}

.solicitud-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
}

.solicitud-card.sin-documentos {
  border-left-color: #F4D03F;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #F0F0F0;
}

.card-title-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.card-title-section h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0;
}

.badge {
  padding: 0.4rem 0.85rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
}

.badge-success {
  background: var(--color-verde-bosque);
  color: white;
}

.btn-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: 2px solid #E0E0E0;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-icon:hover {
  border-color: var(--color-dorado-vintage);
  background: #FFF9E6;
}

/* Card Sections */
.card-section {
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #F0F0F0;
}

.card-section:last-of-type {
  border-bottom: none;
  padding-bottom: 0;
  margin-bottom: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.section-title svg {
  color: var(--color-dorado-vintage);
}

.section-title h4 {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item .label {
  font-size: 0.85rem;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.info-item .value {
  font-size: 0.95rem;
  color: var(--color-negro-carbon);
}

.info-item .value.strong {
  font-weight: 700;
  color: var(--color-verde-bosque);
}

/* Documentación */
.documentacion-section {
  background: #F8F9FA;
  padding: 1.25rem;
  border-radius: 8px;
  border: none !important;
}

.docs-status {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.docs-status.success {
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.1), rgba(45, 106, 79, 0.1));
  color: var(--color-verde-bosque);
}

.docs-status.warning {
  background: linear-gradient(135deg, rgba(244, 208, 63, 0.2), rgba(212, 175, 55, 0.2));
  color: #B8860B;
}

.documentos-grid {
  display: grid;
  gap: 0.75rem;
}

.documento-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 8px;
  border: 2px solid #E0E0E0;
}

.doc-icon {
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-negro-carbon));
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.doc-icon svg {
  color: white;
}

.doc-info {
  flex: 1;
}

.doc-name {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.25rem 0;
}

.doc-date {
  font-size: 0.8rem;
  color: var(--color-gris-acero);
  margin: 0;
}

.btn-view {
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: none;
  background: var(--color-dorado-vintage);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-view:hover {
  background: var(--color-negro-carbon);
  transform: scale(1.1);
}

/* Artículos */
.articulos-list {
  display: grid;
  gap: 0.75rem;
}

.articulo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  border-left: 3px solid var(--color-dorado-vintage);
}

.articulo-desc {
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.25rem 0;
}

.articulo-details {
  font-size: 0.85rem;
  color: var(--color-gris-acero);
  margin: 0;
}

.articulo-avaluo {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}

.avaluo-label {
  font-size: 0.8rem;
  color: var(--color-gris-acero);
}

.avaluo-value {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--color-verde-bosque);
}

/* Card Actions */
.card-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
  flex-wrap: wrap;
}

.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  background: white;
  color: var(--color-azul-marino);
  border: 2px solid var(--color-azul-marino);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-secondary:hover {
  background: var(--color-azul-marino);
  color: white;
}

.btn-primary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.85rem 1.25rem;
  background: linear-gradient(135deg, var(--color-verde-bosque), #2D6A4F);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Loading, Error, Empty States */
.loading-container,
.error-container,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #E0E0E0;
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: rotate 1s linear infinite;
  margin: 0 auto 1rem;
}

.error-container svg,
.empty-state svg {
  color: var(--color-gris-acero);
  margin-bottom: 1rem;
}

/* Paginación */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-pagination {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: white;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-pagination:hover:not(:disabled) {
  border-color: var(--color-dorado-vintage);
  background: #FFF9E6;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-weight: 600;
  color: var(--color-gris-acero);
}

/* Responsive */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }

  .header-actions {
    flex-direction: column;
  }

  .search-box {
    min-width: 100%;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .card-actions {
    flex-direction: column;
  }
}
</style>