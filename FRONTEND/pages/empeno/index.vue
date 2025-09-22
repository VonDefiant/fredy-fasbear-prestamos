<!--
  Archivo: pages/empeno/index.vue
  Página principal de empéños/préstamos - DISEÑO ORIGINAL + FUNCIONALIDAD CANCELAR
-->
<template>
  <div class="empenos-page">
    <!-- Header -->
    <header class="empenos-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/dashboard" class="back-link">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            Volver al Dashboard
          </NuxtLink>
          <div class="page-title">
            <h1>Gestión de Empéños</h1>
            <p>Administra tus préstamos pignoraticios</p>
          </div>
        </div>
        <div class="header-right">
          <div class="user-info">
            <span class="welcome-text">Hola, {{ user?.nombre }} {{ user?.apellido || '' }}</span>
            <div class="user-avatar">
              <span class="user-initials">{{ getUserInitials() }}</span>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Loading state -->
    <div v-if="loadingData" class="loading-overlay">
      <div class="loading-spinner">
        <svg class="animate-spin" width="40" height="40" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" opacity="0.25"/>
          <path fill="currentColor" opacity="0.75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        <p>Cargando información...</p>
      </div>
    </div>

    <!-- Error state -->
    <div v-if="error && !loadingData" class="error-state">
      <div class="error-icon">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h3>Error al cargar los datos</h3>
      <p>{{ error }}</p>
      <button class="btn-primary" @click="cargarDatos">
        Reintentar
      </button>
    </div>

    <!-- Contenido principal -->
    <main class="empenos-main" v-else>
      <div class="container">
        <!-- Estadísticas rápidas -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="stat-card active">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Préstamos Activos</h3>
                <p class="stat-number">{{ estadisticas.prestamosActivos }}</p>
                <span class="stat-subtitle">En proceso</span>
              </div>
            </div>

            <div class="stat-card pending">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Solicitudes Pendientes</h3>
                <p class="stat-number">{{ estadisticas.solicitudesPendientes }}</p>
                <span class="stat-subtitle">En evaluación</span>
              </div>
            </div>

            <div class="stat-card total">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2V22M17 5H9.5C8.83696 5 8.20107 5.26339 7.73223 5.73223C7.26339 6.20107 7 6.83696 7 7.5S7.26339 8.79893 7.73223 9.26777C8.20107 9.73661 8.83696 10 9.5 10H14.5C15.163 10 15.7989 10.2634 16.2678 10.7322C16.7366 11.2011 17 11.837 17 12.5S16.7366 13.7989 16.2678 14.2678C15.7989 14.7366 15.163 15 14.5 15H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Total Prestado</h3>
                <p class="stat-number">Q{{ formatCurrency(estadisticas.totalPrestado) }}</p>
                <span class="stat-subtitle">Monto acumulado</span>
              </div>
            </div>

            <div class="stat-card completed">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Préstamos Completados</h3>
                <p class="stat-number">{{ estadisticas.prestamosCompletados }}</p>
                <span class="stat-subtitle">Finalizados</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Acciones principales -->
        <section class="actions-section">
          <div class="actions-container">
            <button class="action-btn primary" @click="abrirFormularioEmpeno">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Nuevo Empéño
            </button>
            <button class="action-btn secondary" @click="mostrarCalculadora = true">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" stroke-width="2" fill="none"/>
                <path d="M8 6H16M8 10H16M8 14H16M8 18H16" stroke="currentColor" stroke-width="2"/>
              </svg>
              Calculadora de Préstamo
            </button>
            <button class="action-btn tertiary" @click="descargarReporte">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V15" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Descargar Reporte
            </button>
          </div>
        </section>

        <!-- Lista de préstamos y solicitudes -->
        <section class="prestamos-section">
          <div class="section-header">
            <h2>Mis Préstamos y Solicitudes</h2>
            <div class="filters">
              <select v-model="filtroEstado" class="filter-select" @change="aplicarFiltros">
                <option value="">Todos</option>
                <option value="Pendiente">Solicitudes Pendientes</option>
                <option value="Evaluando">En Evaluación</option>
                <option value="Aprobada">Aprobadas</option>
                <option value="Activo">Préstamos Activos</option>
                <option value="Vencido">Vencidos</option>
                <option value="Pagado">Pagados</option>
                <option value="Rechazada">Rechazadas</option>
              </select>
            </div>
          </div>

          <div class="prestamos-grid" v-if="itemsFiltrados.length > 0">
            <div 
              v-for="item in itemsFiltrados" 
              :key="`${item.tipo}-${item.id}`" 
              class="prestamo-card"
              :class="[item.estado.toLowerCase().replace('_', '-'), item.tipo]"
            >
              <div class="prestamo-header">
                <div class="prestamo-info">
                  <h3 class="prestamo-titulo">{{ getItemTitulo(item) }}</h3>
                  <p class="prestamo-fecha">{{ getItemFecha(item) }}</p>
                  <span class="tipo-badge" :class="item.tipo">{{ item.tipo === 'solicitud' ? 'Solicitud' : 'Préstamo' }}</span>
                </div>
                <div class="prestamo-estado">
                  <span class="estado-badge" :class="item.estado.toLowerCase().replace('_', '-')">
                    {{ formatEstado(item.estado) }}
                  </span>
                </div>
              </div>

              <div class="prestamo-body">
                <div class="prestamo-details">
                  <div class="detail-item" v-if="item.tipo === 'prestamo'">
                    <span class="detail-label">Monto prestado:</span>
                    <span class="detail-value">Q{{ formatCurrency(item.montoPrestado || 0) }}</span>
                  </div>
                  <div class="detail-item" v-if="item.tipo === 'prestamo'">
                    <span class="detail-label">Interés:</span>
                    <span class="detail-value">{{ item.tasaInteres || 0 }}%</span>
                  </div>
                  <div class="detail-item" v-if="item.valorEstimado">
                    <span class="detail-label">Valor estimado:</span>
                    <span class="detail-value">Q{{ formatCurrency(item.valorEstimado) }}</span>
                  </div>
                  <div class="detail-item" v-if="item.fechaVencimiento">
                    <span class="detail-label">Vencimiento:</span>
                    <span class="detail-value" :class="{ 'vencido': isVencido(item.fechaVencimiento) }">
                      {{ formatDate(item.fechaVencimiento) }}
                    </span>
                  </div>
                  <div class="detail-item" v-if="item.tipo === 'prestamo' && item.saldoPendiente">
                    <span class="detail-label">Saldo pendiente:</span>
                    <span class="detail-value total">Q{{ formatCurrency(item.saldoPendiente) }}</span>
                  </div>
                  <div class="detail-item" v-if="item.observaciones">
                    <span class="detail-label">Observaciones:</span>
                    <span class="detail-value">{{ item.observaciones }}</span>
                  </div>
                </div>

                <div class="prestamo-actions">
                  <button class="btn-action primary" @click="verDetalle(item)">
                    Ver Detalle
                  </button>
                  <button 
                    class="btn-action secondary" 
                    @click="renovarPrestamo(item)" 
                    v-if="item.tipo === 'prestamo' && item.estado === 'Activo'"
                    :disabled="loadingOperaciones"
                  >
                    {{ loadingOperaciones ? 'Procesando...' : 'Renovar' }}
                  </button>
                  <button 
                    class="btn-action success" 
                    @click="pagarPrestamo(item)" 
                    v-if="item.tipo === 'prestamo' && ['Activo', 'Vencido', 'En_Mora'].includes(item.estado)"
                    :disabled="loadingOperaciones"
                  >
                    {{ loadingOperaciones ? 'Procesando...' : 'Pagar' }}
                  </button>
                  <!-- BOTÓN CANCELAR MEJORADO -->
                  <button 
                    class="btn-action warning" 
                    @click="confirmarCancelacion(item)" 
                    v-if="item.tipo === 'solicitud' && ['Pendiente', 'Evaluando'].includes(item.estado)"
                    :disabled="loadingOperaciones"
                  >
                    {{ loadingOperaciones ? 'Cancelando...' : 'Cancelar' }}
                  </button>
                </div>
              </div>

              <div class="prestamo-progress" v-if="item.tipo === 'prestamo' && item.fechaVencimiento">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: calcularPorcentajeTiempo(item) + '%' }"></div>
                </div>
                <span class="progress-text">{{ calcularDiasRestantes(item) }} días restantes</span>
              </div>

              <div class="solicitud-progress" v-if="item.tipo === 'solicitud'">
                <div class="progress-steps">
                  <div class="step" :class="{ active: true, completed: ['Evaluando', 'Aprobada', 'Rechazada'].includes(item.estado) }">
                    <span class="step-number">1</span>
                    <span class="step-label">Enviada</span>
                  </div>
                  <div class="step" :class="{ active: ['Evaluando', 'Aprobada', 'Rechazada'].includes(item.estado), completed: ['Aprobada', 'Rechazada'].includes(item.estado) }">
                    <span class="step-number">2</span>
                    <span class="step-label">Evaluación</span>
                  </div>
                  <div class="step" :class="{ active: item.estado === 'Aprobada', completed: false }">
                    <span class="step-number">3</span>
                    <span class="step-label">Aprobación</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div class="empty-state" v-else-if="!loadingData">
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <h3>{{ filtroEstado ? 'No hay elementos con este estado' : 'No tienes préstamos o solicitudes' }}</h3>
            <p>¡Comienza tu primer empéño y obtén el efectivo que necesitas!</p>
            <button class="btn-primary" @click="abrirFormularioEmpeno">
              Crear Nuevo Empéño
            </button>
          </div>
        </section>
      </div>
    </main>

    <!-- Modal para nuevo préstamo - ARREGLADO EL SCROLL -->
    <Teleport to="body" v-if="mostrarNuevoPrestamo">
      <div class="modal-overlay" @click="cerrarModalNuevoPrestamo">
        <div class="modal-content formulario-modal" @click.stop>
          <button class="modal-close-floating" @click="cerrarModalNuevoPrestamo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          
          <!-- Contenedor con scroll arreglado -->
          <div class="modal-scroll-container">
            <FormularioNuevoEmpeno 
              :visible="mostrarNuevoPrestamo"
              @close="cerrarModalNuevoPrestamo"
              @submit="procesarSolicitudEmpeno"
            />
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Modal calculadora -->
    <div class="modal-overlay" v-if="mostrarCalculadora" @click="mostrarCalculadora = false">
      <div class="modal-content calculator-modal" @click.stop>
        <div class="modal-header">
          <h3>Calculadora de Préstamo</h3>
          <button class="modal-close" @click="mostrarCalculadora = false">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="calculator-form">
            <div class="form-group">
              <label>Valor estimado del artículo</label>
              <input 
                type="number" 
                v-model="calculadora.valor" 
                @input="calcularPrestamo"
                placeholder="Q 0.00"
                class="form-input"
              >
            </div>
            <div class="form-group">
              <label>Porcentaje de préstamo ({{ calculadora.porcentaje }}%)</label>
              <input 
                type="range" 
                v-model="calculadora.porcentaje" 
                @input="calcularPrestamo"
                min="30" 
                max="80" 
                class="form-range"
              >
            </div>
            <div class="form-group">
              <label>Plazo (meses)</label>
              <select v-model="calculadora.plazo" @change="calcularPrestamo" class="form-select">
                <option value="1">1 mes</option>
                <option value="2">2 meses</option>
                <option value="3">3 meses</option>
                <option value="6">6 meses</option>
              </select>
            </div>
            <div class="form-group">
              <button class="btn-secondary full-width" @click="obtenerSimulacionOficial" :disabled="loadingSimulacion">
                {{ loadingSimulacion ? 'Calculando...' : 'Obtener Cálculo Oficial' }}
              </button>
            </div>
          </div>
          <div class="calculator-result">
            <div class="result-item">
              <span>Monto del préstamo:</span>
              <strong>Q{{ formatCurrency(calculadora.montoPrestamo) }}</strong>
            </div>
            <div class="result-item">
              <span>Interés total ({{ calculadora.interesMensual }}% mensual):</span>
              <strong>Q{{ formatCurrency(calculadora.interesTotal) }}</strong>
            </div>
            <div class="result-item total">
              <span>Total a pagar:</span>
              <strong>Q{{ formatCurrency(calculadora.totalPagar) }}</strong>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE CANCELACIÓN -->
    <div class="modal-overlay" v-if="mostrarConfirmacionCancelacion" @click="cerrarConfirmacionCancelacion">
      <div class="modal-content confirmation-modal" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Cancelación</h3>
          <button class="modal-close" @click="cerrarConfirmacionCancelacion">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="warning-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M10.29 3.86L1.82 18A2 2 0 0 0 3.64 21H20.36A2 2 0 0 0 22.18 18L13.71 3.86A2 2 0 0 0 10.29 3.86Z" stroke="currentColor" stroke-width="2" fill="none"/>
              <line x1="12" y1="9" x2="12" y2="13" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="17" r="1" fill="currentColor"/>
            </svg>
          </div>
          
          <div class="warning-content">
            <h4>¿Estás seguro de que deseas cancelar esta solicitud?</h4>
            <p>
              Esta acción no se puede deshacer. La solicitud será marcada como cancelada 
              y no podrá ser procesada.
            </p>

            <div class="solicitud-info" v-if="solicitudACancel">
              <div class="info-row">
                <span>Artículo:</span>
                <span>{{ getItemTitulo(solicitudACancel) }}</span>
              </div>
              <div class="info-row">
                <span>Estado actual:</span>
                <span class="status-badge" :class="`status-${solicitudACancel.estado?.toLowerCase()}`">
                  {{ solicitudACancel.estado }}
                </span>
              </div>
              <div class="info-row">
                <span>Fecha de solicitud:</span>
                <span>{{ formatDate(solicitudACancel.fecha) }}</span>
              </div>
            </div>

            <div class="motivo-section">
              <label for="motivoCancelacion">Motivo de cancelación (opcional):</label>
              <textarea 
                id="motivoCancelacion"
                v-model="motivoCancelacion"
                placeholder="Escribe el motivo por el cual deseas cancelar esta solicitud..."
                rows="3"
              ></textarea>
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button @click="cerrarConfirmacionCancelacion" class="btn-secondary">
            No, mantener solicitud
          </button>
          <button 
            @click="ejecutarCancelacion" 
            :disabled="loadingCancelacion"
            class="btn-danger"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" v-if="!loadingCancelacion">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
              <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
            </svg>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="spinning" v-else>
              <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
            </svg>
            {{ loadingCancelacion ? 'Cancelando...' : 'Sí, cancelar solicitud' }}
          </button>
        </div>
      </div>
    </div>

    <!-- Toast notifications -->
    <div v-if="notification.show" class="notification-toast" :class="notification.type">
      <div class="notification-content">
        <svg v-if="notification.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else-if="notification.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>{{ notification.message }}</span>
      </div>
      <button @click="notification.show = false" class="notification-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
// Proteger la ruta con middleware
definePageMeta({
  middleware: 'auth'
})

// Meta tags
useHead({
  title: 'Mis Empéños - Gestión de Préstamos',
  meta: [
    { name: 'description', content: 'Administra tus préstamos pignoraticios de manera fácil y segura' }
  ]
})

// ===== COMPOSABLES Y DEPENDENCIAS =====
const { user } = useAuth()
const { api } = useApi()
const { crearSolicitudEmpeno } = useSolicitudes()

// Importar el componente del formulario
import FormularioNuevoEmpeno from '~/pages/empeno/FormularioNuevoEmpeno.vue'

// ===== ESTADO REACTIVO =====
const mostrarNuevoPrestamo = ref(false)
const mostrarCalculadora = ref(false)
const filtroEstado = ref('')

// Estados de carga
const loadingData = ref(true)
const loadingOperaciones = ref(false)
const loadingSimulacion = ref(false)
const loadingCancelacion = ref(false)
const error = ref(null)

// Modal de confirmación para cancelación
const mostrarConfirmacionCancelacion = ref(false)
const solicitudACancel = ref(null)
const motivoCancelacion = ref('')

// Datos combinados (solicitudes + préstamos)
const solicitudes = ref([])
const prestamos = ref([])
const estadisticas = ref({
  prestamosActivos: 0,
  solicitudesPendientes: 0,
  totalPrestado: 0,
  prestamosCompletados: 0
})

// Calculadora
const calculadora = ref({
  valor: 0,
  porcentaje: 50,
  plazo: 1,
  interesMensual: 5,
  montoPrestamo: 0,
  interesTotal: 0,
  totalPagar: 0
})

// Sistema de notificaciones
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

// ===== COMPUTED PROPERTIES =====
const itemsCombinados = computed(() => {
  const items = []
  
  // Agregar solicitudes
  solicitudes.value.forEach(solicitud => {
    const articulo = solicitud.articulos?.[0]
    items.push({
      id: solicitud.id,
      tipo: 'solicitud',
      estado: solicitud.estado,
      fecha: solicitud.fechaSolicitud,
      observaciones: solicitud.observaciones,
      valorEstimado: articulo?.valorEstimadoCliente || 0,
      descripcion: articulo?.descripcion || 'Sin descripción',
      marca: articulo?.marca,
      modelo: articulo?.modelo,
      articulos: solicitud.articulos || []
    })
  })
  
  // Agregar préstamos
  prestamos.value.forEach(prestamo => {
    items.push({
      id: prestamo.id,
      tipo: 'prestamo',
      estado: prestamo.estado,
      fecha: prestamo.fechaInicio,
      fechaVencimiento: prestamo.fechaVencimiento,
      montoPrestado: prestamo.montoPrestado,
      tasaInteres: prestamo.tasaInteres,
      saldoPendiente: prestamo.saldoPendiente,
      descripcion: getArticuloDescripcion(prestamo),
      contrato: prestamo.contrato
    })
  })
  
  // Ordenar por fecha (más recientes primero)
  return items.sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
})

const itemsFiltrados = computed(() => {
  if (!filtroEstado.value) {
    return itemsCombinados.value
  }
  return itemsCombinados.value.filter(item => item.estado === filtroEstado.value)
})

// ===== MÉTODOS DE UTILIDAD =====
const getUserInitials = () => {
  if (!user.value) return 'U'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'U'
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatEstado = (estado) => {
  const estados = {
    'Pendiente': 'Pendiente',
    'Evaluando': 'En Evaluación',
    'Aprobada': 'Aprobada',
    'Rechazada': 'Rechazada',
    'Activo': 'Activo',
    'Vencido': 'Vencido', 
    'En_Mora': 'En Mora',
    'Pagado': 'Pagado'
  }
  return estados[estado] || estado
}

const isVencido = (fechaVencimiento) => {
  if (!fechaVencimiento) return false
  return new Date(fechaVencimiento) < new Date()
}

const getItemTitulo = (item) => {
  if (item.tipo === 'solicitud') {
    return item.descripcion || 'Solicitud de empéño'
  }
  return item.descripcion || 'Préstamo activo'
}

const getItemFecha = (item) => {
  if (item.tipo === 'solicitud') {
    return `Solicitud: ${formatDate(item.fecha)}`
  }
  return `Fecha inicio: ${formatDate(item.fecha)}`
}

const getArticuloDescripcion = (prestamo) => {
  if (prestamo.contrato?.solicitud?.articulos?.[0]) {
    const articulo = prestamo.contrato.solicitud.articulos[0]
    return `${articulo.descripcion}${articulo.marca ? ` - ${articulo.marca}` : ''}`
  }
  return 'Artículo en empéño'
}

const calcularDiasRestantes = (item) => {
  if (!item.fechaVencimiento) return 0
  
  const hoy = new Date()
  const vencimiento = new Date(item.fechaVencimiento)
  const diferencia = vencimiento - hoy
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  
  return Math.max(0, dias)
}

const calcularPorcentajeTiempo = (item) => {
  if (!item.fecha || !item.fechaVencimiento) return 0
  
  const inicio = new Date(item.fecha)
  const vencimiento = new Date(item.fechaVencimiento)
  const hoy = new Date()
  
  const tiempoTotal = vencimiento - inicio
  const tiempoTranscurrido = hoy - inicio
  
  const porcentaje = Math.min(100, Math.max(0, (tiempoTranscurrido / tiempoTotal) * 100))
  return Math.round(porcentaje)
}

// ===== MÉTODOS DE NOTIFICACIÓN =====
const mostrarNotificacion = (message, type = 'success') => {
  notification.value = {
    show: true,
    type,
    message
  }
  
  setTimeout(() => {
    notification.value.show = false
  }, 5000)
}

// ===== MÉTODOS DE CARGA DE DATOS =====
const cargarSolicitudes = async () => {
  try {
    console.log('🔄 Cargando solicitudes...')
    const response = await api('/solicitudes')
    
    if (response.success) {
      solicitudes.value = response.data.solicitudes || []
      console.log('✅ Solicitudes cargadas:', solicitudes.value.length)
    }
  } catch (err) {
    console.error('❌ Error cargando solicitudes:', err)
  }
}

const cargarPrestamos = async () => {
  try {
    console.log('🔄 Cargando préstamos...')
    const response = await api('/prestamos', {
      params: { limite: 50, pagina: 1 }
    })
    
    if (response.success) {
      prestamos.value = response.data.prestamos || []
      console.log('✅ Préstamos cargados:', prestamos.value.length)
    }
  } catch (err) {
    console.error('❌ Error cargando préstamos:', err)
    // No es error crítico si no hay préstamos aún
  }
}

const calcularEstadisticas = () => {
  const stats = {
    prestamosActivos: prestamos.value.filter(p => p.estado === 'Activo').length,
    solicitudesPendientes: solicitudes.value.filter(s => s.estado === 'Pendiente').length,
    totalPrestado: prestamos.value.reduce((sum, p) => sum + (Number(p.montoPrestado) || 0), 0),
    prestamosCompletados: prestamos.value.filter(p => p.estado === 'Pagado').length
  }
  
  estadisticas.value = stats
  console.log('📊 Estadísticas calculadas:', stats)
}

const cargarDatos = async () => {
  try {
    loadingData.value = true
    error.value = null
    W
    
    // Cargar solicitudes y préstamos en paralelo
    await Promise.all([
      cargarSolicitudes(),
      cargarPrestamos()
    ])
    
    // Calcular estadísticas
    calcularEstadisticas()
    
  } catch (err) {
    console.error('❌ Error cargando datos:', err)
    error.value = err.message || 'Error al cargar los datos'
    mostrarNotificacion('Error al cargar los datos', 'error')
  } finally {
    loadingData.value = false
  }
}

const aplicarFiltros = () => {
  console.log('🔍 Aplicando filtro:', filtroEstado.value)
}

// ===== MÉTODOS DE OPERACIONES =====
const abrirFormularioEmpeno = () => {
  mostrarNuevoPrestamo.value = true
  console.log('📝 Abriendo formulario de empéño...')
}

const cerrarModalNuevoPrestamo = () => {
  mostrarNuevoPrestamo.value = false
}

const procesarSolicitudEmpeno = async (formData) => {
  try {
    console.log('📤 Procesando solicitud de empéño...')
    
    // Mostrar loading mientras se procesa
    loadingData.value = true
    
    // Obtener token del usuario autenticado
    const { getToken } = useAuth()
    const token = getToken()
    
    if (!token) {
      throw new Error('No tienes sesión activa. Por favor inicia sesión.')
    }
    
    // Hacer petición directa al backend con FormData
    console.log('🚀 Enviando solicitud al backend...')
    const response = await fetch('http://localhost:3001/api/solicitudes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // NO agregar Content-Type, fetch lo manejará automáticamente para FormData
      },
      body: formData
    })
    
    console.log('📡 Respuesta recibida:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Solicitud exitosa:', result)
    
    // Cerrar modal primero
    cerrarModalNuevoPrestamo()
    
    // Mostrar notificación de éxito
    mostrarNotificacion(
      `¡Solicitud enviada exitosamente! Número: ${result.data.solicitud.numero}. Te contactaremos pronto para el avalúo.`, 
      'success'
    )
    
    // Recargar datos para mostrar la nueva solicitud
    await cargarDatos()
    
  } catch (error) {
    console.error('❌ Error procesando solicitud:', error)
    mostrarNotificacion('Error al enviar la solicitud: ' + (error.message || 'Error desconocido'), 'error')
  } finally {
    loadingData.value = false
  }
}

const verDetalle = (item) => {
  console.log('👁️ Ver detalle:', item)
  if (item.tipo === 'solicitud') {
    navigateTo(`/empeno/solicitudes/${item.id}`)
  } else {
    navigateTo(`/empeno/${item.id}`)
  }
}

const renovarPrestamo = async (prestamo) => {
  try {
    loadingOperaciones.value = true
    mostrarNotificacion('Funcionalidad de renovación próximamente', 'info')
  } catch (error) {
    mostrarNotificacion('Error al renovar el préstamo', 'error')
  } finally {
    loadingOperaciones.value = false
  }
}

const pagarPrestamo = async (prestamo) => {
  try {
    loadingOperaciones.value = true
    navigateTo(`/empeno/${prestamo.id}?action=pagar`)
  } catch (error) {
    mostrarNotificacion('Error al procesar el pago', 'error')
  } finally {
    loadingOperaciones.value = false
  }
}

// ===== MÉTODOS DE CANCELACIÓN MEJORADOS =====
const confirmarCancelacion = (solicitud) => {
  console.log('⚠️ Iniciando confirmación de cancelación:', solicitud)
  
  // Verificar que la solicitud puede ser cancelada
  if (!['Pendiente', 'Evaluando'].includes(solicitud.estado)) {
    mostrarNotificacion('Esta solicitud no puede ser cancelada en su estado actual', 'warning')
    return
  }
  
  solicitudACancel.value = solicitud
  motivoCancelacion.value = ''
  mostrarConfirmacionCancelacion.value = true
}

const cerrarConfirmacionCancelacion = () => {
  mostrarConfirmacionCancelacion.value = false
  solicitudACancel.value = null
  motivoCancelacion.value = ''
}

const ejecutarCancelacion = async () => {
  if (!solicitudACancel.value) {
    mostrarNotificacion('Error: No se encontró la solicitud a cancelar', 'error')
    return
  }

  try {
    loadingCancelacion.value = true
    
    console.log('❌ Cancelando solicitud:', {
      id: solicitudACancel.value.id,
      motivo: motivoCancelacion.value
    })
    
    const response = await api(`/solicitudes/${solicitudACancel.value.id}/cancelar`, {
      method: 'PUT',
      body: { 
        motivo: motivoCancelacion.value || 'Cancelada por el usuario desde la interfaz web'
      }
    })
    
    if (response.success) {
      mostrarNotificacion(
        'Solicitud cancelada exitosamente', 
        'success'
      )
      
      // Cerrar el modal
      cerrarConfirmacionCancelacion()
      
      // Recargar los datos para reflejar el cambio
      await cargarDatos()
      
      console.log('✅ Solicitud cancelada exitosamente')
    } else {
      throw new Error(response.message || 'Error desconocido al cancelar')
    }
    
  } catch (error) {
    console.error('❌ Error cancelando solicitud:', error)
    
    let mensajeError = 'Error al cancelar la solicitud'
    
    // Personalizar mensaje de error según el tipo
    if (error.message) {
      if (error.message.includes('estado')) {
        mensajeError = 'La solicitud no puede ser cancelada en su estado actual'
      } else if (error.message.includes('autorizado')) {
        mensajeError = 'No tienes permisos para cancelar esta solicitud'
      } else if (error.message.includes('encontrada')) {
        mensajeError = 'La solicitud no fue encontrada'
      } else {
        mensajeError = error.message
      }
    }
    
    mostrarNotificacion(mensajeError, 'error')
  } finally {
    loadingCancelacion.value = false
  }
}

const descargarReporte = async () => {
  try {
    mostrarNotificacion('Funcionalidad de reportes próximamente', 'info')
  } catch (error) {
    mostrarNotificacion('Error al descargar el reporte', 'error')
  }
}

// ===== CALCULADORA =====
const calcularPrestamo = () => {
  const valor = parseFloat(calculadora.value.valor) || 0
  const porcentaje = parseFloat(calculadora.value.porcentaje) || 50
  const plazo = parseInt(calculadora.value.plazo) || 1
  const interesMensual = parseFloat(calculadora.value.interesMensual) || 5

  calculadora.value.montoPrestamo = valor * (porcentaje / 100)
  calculadora.value.interesTotal = calculadora.value.montoPrestamo * (interesMensual / 100) * plazo
  calculadora.value.totalPagar = calculadora.value.montoPrestamo + calculadora.value.interesTotal
}

const obtenerSimulacionOficial = async () => {
  try {
    loadingSimulacion.value = true
    
    const response = await api('/prestamos/simulacion', {
      params: {
        valorArticulo: calculadora.value.valor,
        porcentajePrestamo: calculadora.value.porcentaje,
        plazoMeses: calculadora.value.plazo
      }
    })
    
    if (response.success) {
      const simData = response.data
      calculadora.value.montoPrestamo = simData.montoPrestamo
      calculadora.value.interesTotal = simData.interesTotal
      calculadora.value.totalPagar = simData.totalPagar
      calculadora.value.interesMensual = simData.tasaInteres
      
      mostrarNotificacion('Simulación actualizada con datos oficiales', 'success')
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo simulación:', error)
    mostrarNotificacion('Error al obtener la simulación oficial', 'error')
  } finally {
    loadingSimulacion.value = false
  }
}

// ===== LIFECYCLE HOOKS =====
onMounted(async () => {
  console.log('🚀 Inicializando página de empéños...')
  
  if (!user.value) {
    console.log('❌ Usuario no autenticado, redirigiendo...')
    navigateTo('/login')
    return
  }
  
  console.log('✅ Usuario autenticado:', user.value.nombre)
  
  // Cargar datos iniciales
  await cargarDatos()
  
  // Calcular préstamo inicial
  calcularPrestamo()
})

onUnmounted(() => {
  notification.value.show = false
})
</script>

<style scoped>
/* MANTENER TODOS LOS ESTILOS ORIGINALES + ESTILOS PARA MODAL DE CANCELACIÓN */

/* Mantener todos los estilos originales con mejoras */
.empenos-page {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Header */
.empenos-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1.5rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 2rem;
}

.back-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #D4AF37;
  text-decoration: none;
  font-weight: 500;
  transition: opacity 0.3s ease;
}

.back-link:hover {
  opacity: 0.8;
}

.page-title h1 {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
}

.page-title p {
  margin: 0.25rem 0 0;
  color: #B0BEC5;
  font-size: 0.9rem;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-text {
  font-weight: 500;
  color: #F5F5F5;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

/* Loading y Error States */
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #D4AF37;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  min-height: 50vh;
}

.error-icon {
  color: #E74C3C;
  margin-bottom: 1rem;
}

/* Main content */
.empenos-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Stats section */
.stats-section {
  margin-bottom: 3rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  border-left: 4px solid;
  transition: transform 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-card.active {
  border-left-color: #27AE60;
}

.stat-card.pending {
  border-left-color: #F39C12;
}

.stat-card.total {
  border-left-color: #D4AF37;
}

.stat-card.completed {
  border-left-color: #3498DB;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card.active .stat-icon {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-card.pending .stat-icon {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.stat-card.total .stat-icon {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.stat-card.completed .stat-icon {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-content h3 {
  margin: 0 0 0.5rem;
  font-size: 0.9rem;
  color: #666;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 1.8rem;
  font-weight: bold;
  color: #2C3E50;
}

.stat-subtitle {
  font-size: 0.8rem;
  color: #888;
}

/* Actions section */
.actions-section {
  margin-bottom: 3rem;
}

.actions-container {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.action-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.action-btn.primary {
  background: #D4AF37;
  color: white;
}

.action-btn.primary:hover {
  background: #B8941F;
  transform: translateY(-1px);
}

.action-btn.secondary {
  background: #3498DB;
  color: white;
}

.action-btn.secondary:hover {
  background: #2980B9;
}

.action-btn.tertiary {
  background: white;
  color: #2C3E50;
  border: 1px solid #E0E0E0;
}

.action-btn.tertiary:hover {
  background: #F8F9FA;
  border-color: #D4AF37;
}

/* Préstamos section */
.prestamos-section {
  margin-bottom: 3rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.section-header h2 {
  margin: 0;
  color: #2C3E50;
  font-size: 1.5rem;
}

.filters {
  display: flex;
  gap: 1rem;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  background: white;
  color: #2C3E50;
  cursor: pointer;
}

.prestamos-grid {
  display: grid;
  gap: 1.5rem;
}

.prestamo-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
  border-left: 4px solid;
}

.prestamo-card:hover {
  transform: translateY(-2px);
}

.prestamo-card.pendiente {
  border-left-color: #F39C12;
}

.prestamo-card.evaluando {
  border-left-color: #3498DB;
}

.prestamo-card.aprobada {
  border-left-color: #27AE60;
}

.prestamo-card.rechazada {
  border-left-color: #E74C3C;
}

.prestamo-card.activo {
  border-left-color: #27AE60;
}

.prestamo-card.vencido {
  border-left-color: #E74C3C;
}

.prestamo-card.en-mora {
  border-left-color: #E67E22;
}

.prestamo-card.pagado {
  border-left-color: #95A5A6;
}

.prestamo-header {
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: start;
  background: #F8F9FA;
  border-bottom: 1px solid #E0E0E0;
}

.prestamo-titulo {
  margin: 0 0 0.25rem;
  color: #2C3E50;
  font-size: 1.1rem;
  font-weight: 600;
}

.prestamo-fecha {
  margin: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

.tipo-badge {
  padding: 0.2rem 0.5rem;
  border-radius: 10px;
  font-size: 0.7rem;
  font-weight: 500;
  text-transform: uppercase;
  margin-top: 0.5rem;
}

.tipo-badge.solicitud {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.tipo-badge.prestamo {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.estado-badge.pendiente {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.estado-badge.evaluando {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.estado-badge.aprobada {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.estado-badge.rechazada {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.estado-badge.activo {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.estado-badge.vencido {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.estado-badge.en-mora {
  background: rgba(230, 126, 34, 0.1);
  color: #E67E22;
}

.estado-badge.pagado {
  background: rgba(149, 165, 166, 0.1);
  color: #95A5A6;
}

.prestamo-body {
  padding: 1.5rem;
}

.prestamo-details {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.detail-label {
  font-size: 0.9rem;
  color: #666;
}

.detail-value {
  font-weight: 600;
  color: #2C3E50;
}

.detail-value.vencido {
  color: #E74C3C;
}

.detail-value.total {
  font-size: 1.1rem;
  color: #D4AF37;
}

.prestamo-actions {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.btn-action {
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  border: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-action:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-action.primary {
  background: #3498DB;
  color: white;
}

.btn-action.secondary {
  background: #F39C12;
  color: white;
}

.btn-action.success {
  background: #27AE60;
  color: white;
}

.btn-action.warning {
  background: #E67E22;
  color: white;
}

.btn-action:not(:disabled):hover {
  transform: translateY(-1px);
  filter: brightness(1.1);
}

.prestamo-progress {
  padding: 1rem 1.5rem;
  background: #F8F9FA;
  border-top: 1px solid #E0E0E0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #E0E0E0;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #27AE60, #2ECC71);
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.8rem;
  color: #666;
  white-space: nowrap;
}

/* Progreso de solicitudes */
.solicitud-progress {
  padding: 1rem 1.5rem;
  background: #F8F9FA;
  border-top: 1px solid #E0E0E0;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background: #E0E0E0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 2;
  background: #F8F9FA;
  padding: 0 0.5rem;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #E0E0E0;
  color: #666;
  font-weight: bold;
  font-size: 0.8rem;
  transition: all 0.3s ease;
}

.step.active .step-number {
  background: #3498DB;
  color: white;
}

.step.completed .step-number {
  background: #27AE60;
  color: white;
}

.step-label {
  font-size: 0.7rem;
  color: #666;
  text-align: center;
  font-weight: 500;
}

.step.active .step-label {
  color: #3498DB;
  font-weight: 600;
}

.step.completed .step-label {
  color: #27AE60;
  font-weight: 600;
}

/* Empty state */
.empty-state {
  text-align: center;
  padding: 3rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.empty-icon {
  color: #D4AF37;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 0 0 0.5rem;
  color: #2C3E50;
}

.empty-state p {
  color: #666;
  margin-bottom: 1.5rem;
}

.btn-primary {
  background: #D4AF37;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  background: #B8941F;
  transform: translateY(-1px);
}

.btn-secondary {
  background: #3498DB;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #2980B9;
  transform: translateY(-1px);
}

.btn-danger {
  background: #E74C3C;
  color: white;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-danger:hover {
  background: #C0392B;
  transform: translateY(-1px);
}

.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.full-width {
  width: 100%;
}

/* Modal styles - ARREGLADO EL SCROLL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  backdrop-filter: blur(5px);
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
  display: flex;
  flex-direction: column;
}

.formulario-modal {
  max-width: 900px;
  max-height: 95vh;
  width: 95%;
  position: relative;
}

.confirmation-modal {
  max-width: 600px;
}

/* ARREGLO DEL SCROLL - CONTENEDOR ESPECIAL */
.modal-scroll-container {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  max-height: calc(95vh - 2rem);
  padding: 0;
}

.modal-scroll-container::-webkit-scrollbar {
  width: 8px;
}

.modal-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

.modal-scroll-container::-webkit-scrollbar-thumb {
  background: #D4AF37;
  border-radius: 4px;
}

.modal-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #B8941F;
}

.modal-close-floating {
  position: absolute;
  top: 1rem;
  right: 1rem;
  z-index: 1001;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(10px);
}

.modal-close-floating:hover {
  background: rgba(0, 0, 0, 0.8);
  transform: scale(1.1);
}

.calculator-modal {
  max-width: 600px;
}

.modal-header {
  padding: 1.5rem;
  border-bottom: 1px solid #E0E0E0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h3 {
  margin: 0;
  color: #2C3E50;
}

.modal-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.modal-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid #E0E0E0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* === ESTILOS ESPECÍFICOS DEL MODAL DE CANCELACIÓN === */
.warning-icon {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #F39C12;
}

.warning-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2C3E50;
  margin-bottom: 1rem;
  text-align: center;
}

.warning-content p {
  color: #666;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
}

.solicitud-info {
  background: #F8F9FA;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 1.5rem;
  border: 1px solid #E0E0E0;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  font-size: 0.875rem;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid #E0E0E0;
}

.info-row span:first-child {
  font-weight: 500;
  color: #666;
}

.info-row span:last-child {
  font-weight: 600;
  color: #2C3E50;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.status-pendiente {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.status-evaluando {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.motivo-section {
  margin-top: 1.5rem;
}

.motivo-section label {
  display: block;
  font-weight: 500;
  color: #2C3E50;
  margin-bottom: 0.5rem;
}

.motivo-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.3s ease;
}

.motivo-section textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

/* Calculator form */
.calculator-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #2C3E50;
  font-size: 0.9rem;
}

.form-input,
.form-select {
  padding: 0.75rem;
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.form-range {
  width: 100%;
  height: 6px;
  border-radius: 3px;
  background: #E0E0E0;
  outline: none;
  cursor: pointer;
}

.form-range::-webkit-slider-thumb {
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: pointer;
}

.form-range::-moz-range-thumb {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #D4AF37;
  cursor: pointer;
  border: none;
}

.calculator-result {
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #D4AF37;
}

.result-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E0E0E0;
}

.result-item:last-child {
  border-bottom: none;
}

.result-item.total {
  background: rgba(212, 175, 55, 0.1);
  margin: 0.5rem -1.5rem -1.5rem;
  padding: 1rem 1.5rem;
  font-size: 1.1rem;
}

.result-item span {
  color: #666;
}

.result-item strong {
  color: #2C3E50;
  font-size: 1.1rem;
}

.result-item.total strong {
  color: #D4AF37;
  font-size: 1.3rem;
}

/* Notification Toast */
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  z-index: 1100;
  max-width: 400px;
  border-left: 4px solid;
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

.notification-toast.success {
  border-left-color: #27AE60;
  color: #27AE60;
}

.notification-toast.error {
  border-left-color: #E74C3C;
  color: #E74C3C;
}

.notification-toast.warning {
  border-left-color: #F39C12;
  color: #F39C12;
}

.notification-toast.info {
  border-left-color: #3498DB;
  color: #3498DB;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
}

.notification-content span {
  color: #2C3E50;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.notification-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* Spinning animation */
.spinning {
  animation: spin 1s linear infinite;
}

/* Responsive design */
@media (max-width: 768px) {
  .header-container {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .header-left {
    flex-direction: column;
    gap: 0.5rem;
  }

  .stats-grid {
    grid-template-columns: 1fr;
  }

  .actions-container {
    flex-direction: column;
  }

  .action-btn {
    justify-content: center;
  }

  .prestamo-details {
    grid-template-columns: 1fr;
  }

  .prestamo-actions {
    flex-direction: column;
  }

  .prestamo-progress {
    flex-direction: column;
    gap: 0.5rem;
    text-align: center;
  }

  .modal-content {
    margin: 1rem;
  }

  .formulario-modal {
    width: 95%;
    height: 95vh;
    margin: 0;
  }

  .modal-close-floating {
    top: 0.5rem;
    right: 0.5rem;
  }

  .notification-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    max-width: none;
  }

  .progress-steps {
    gap: 0.5rem;
  }

  .step-label {
    font-size: 0.6rem;
  }

  .modal-footer {
    flex-direction: column;
  }

  .modal-footer .btn-secondary,
  .modal-footer .btn-danger {
    width: 100%;
    justify-content: center;
  }
}
</style>