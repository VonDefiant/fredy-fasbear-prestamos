<!-- 
  Archivo: pages/empeno/index.vue
  Página principal de empéños/préstamos
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

    <!-- Contenido principal -->
    <main class="empenos-main">
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
                <p class="stat-number">{{ prestamosActivos.length }}</p>
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
                <h3>Pendientes de Pago</h3>
                <p class="stat-number">{{ prestamosPendientes.length }}</p>
                <span class="stat-subtitle">Próximos vencimientos</span>
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
                <p class="stat-number">Q{{ formatCurrency(totalPrestado) }}</p>
                <span class="stat-subtitle">Monto acumulado</span>
              </div>
            </div>

            <div class="stat-card available">
              <div class="stat-icon">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="stat-content">
                <h3>Límite Disponible</h3>
                <p class="stat-number">Q{{ formatCurrency(limiteDisponible) }}</p>
                <span class="stat-subtitle">Para nuevos préstamos</span>
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

        <!-- Lista de préstamos activos -->
        <section class="prestamos-section">
          <div class="section-header">
            <h2>Mis Préstamos Activos</h2>
            <div class="filters">
              <select v-model="filtroEstado" class="filter-select">
                <option value="todos">Todos los estados</option>
                <option value="activo">Activos</option>
                <option value="vencido">Vencidos</option>
                <option value="renovado">Renovados</option>
              </select>
            </div>
          </div>

          <div class="prestamos-grid" v-if="prestamosFiltrados.length > 0">
            <div 
              v-for="prestamo in prestamosFiltrados" 
              :key="prestamo.id" 
              class="prestamo-card"
              :class="prestamo.estado"
            >
              <div class="prestamo-header">
                <div class="prestamo-info">
                  <h3 class="prestamo-titulo">{{ prestamo.articulo }}</h3>
                  <p class="prestamo-fecha">Fecha: {{ formatDate(prestamo.fecha) }}</p>
                </div>
                <div class="prestamo-estado">
                  <span class="estado-badge" :class="prestamo.estado">{{ prestamo.estadoTexto }}</span>
                </div>
              </div>

              <div class="prestamo-body">
                <div class="prestamo-details">
                  <div class="detail-item">
                    <span class="detail-label">Monto prestado:</span>
                    <span class="detail-value">Q{{ formatCurrency(prestamo.montoPrestado) }}</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Interés:</span>
                    <span class="detail-value">{{ prestamo.interes }}%</span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Vencimiento:</span>
                    <span class="detail-value" :class="{ 'vencido': isVencido(prestamo.fechaVencimiento) }">
                      {{ formatDate(prestamo.fechaVencimiento) }}
                    </span>
                  </div>
                  <div class="detail-item">
                    <span class="detail-label">Total a pagar:</span>
                    <span class="detail-value total">Q{{ formatCurrency(prestamo.totalPagar) }}</span>
                  </div>
                </div>

                <div class="prestamo-actions">
                  <button class="btn-action primary" @click="verDetalle(prestamo)">
                    Ver Detalle
                  </button>
                  <button class="btn-action secondary" @click="renovarPrestamo(prestamo)" v-if="prestamo.estado === 'activo'">
                    Renovar
                  </button>
                  <button class="btn-action success" @click="pagarPrestamo(prestamo)" v-if="prestamo.estado === 'activo'">
                    Pagar
                  </button>
                </div>
              </div>

              <div class="prestamo-progress">
                <div class="progress-bar">
                  <div class="progress-fill" :style="{ width: prestamo.porcentajeTiempo + '%' }"></div>
                </div>
                <span class="progress-text">{{ prestamo.diasRestantes }} días restantes</span>
              </div>
            </div>
          </div>

          <!-- Estado vacío -->
          <div class="empty-state" v-else>
            <div class="empty-icon">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
            </div>
            <h3>No tienes préstamos activos</h3>
            <p>¡Comienza tu primer empéño y obtén el efectivo que necesitas!</p>
            <button class="btn-primary" @click="abrirFormularioEmpeno">
              Crear Nuevo Empéño
            </button>
          </div>
        </section>
      </div>
    </main>

    <!-- Modal para nuevo préstamo -->
    <Teleport to="body" v-if="mostrarNuevoPrestamo">
      <div class="modal-overlay" @click="cerrarModalNuevoPrestamo">
        <div class="modal-content formulario-modal" @click.stop>
          <button class="modal-close-floating" @click="cerrarModalNuevoPrestamo">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          
          <!-- Componente del formulario -->
          <FormularioNuevoEmpeno 
            :visible="mostrarNuevoPrestamo"
            @close="cerrarModalNuevoPrestamo"
            @submit="procesarSolicitudEmpeno"
          />
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

// Auth composable
const { user } = useAuth()

// Importar el componente del formulario
import FormularioNuevoEmpeno from '~/pages/empeno/FormularioNuevoEmpeno.vue'

// Estado reactivo
const mostrarNuevoPrestamo = ref(false)
const mostrarCalculadora = ref(false)
const filtroEstado = ref('todos')

// Datos de ejemplo para préstamos
const prestamosActivos = ref([
  {
    id: 1,
    articulo: 'Cadena de Oro 18k',
    fecha: '2024-08-15',
    fechaVencimiento: '2024-09-15',
    montoPrestado: 5000,
    interes: 5,
    totalPagar: 5250,
    estado: 'activo',
    estadoTexto: 'Activo',
    diasRestantes: 12,
    porcentajeTiempo: 60
  },
  {
    id: 2,
    articulo: 'iPhone 14 Pro',
    fecha: '2024-08-01',
    fechaVencimiento: '2024-09-01',
    montoPrestado: 8000,
    interes: 5,
    totalPagar: 8400,
    estado: 'vencido',
    estadoTexto: 'Vencido',
    diasRestantes: -2,
    porcentajeTiempo: 100
  }
])

const prestamosPendientes = ref([])

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

// Computed
const totalPrestado = computed(() => {
  return prestamosActivos.value.reduce((total, prestamo) => total + prestamo.montoPrestado, 0)
})

const limiteDisponible = computed(() => {
  return 50000 - totalPrestado.value // Límite de ejemplo
})

const prestamosFiltrados = computed(() => {
  if (filtroEstado.value === 'todos') {
    return prestamosActivos.value
  }
  return prestamosActivos.value.filter(prestamo => prestamo.estado === filtroEstado.value)
})

// Métodos
const getUserInitials = () => {
  if (!user.value) return 'U'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'U'
}

const abrirFormularioEmpeno = () => {
  mostrarNuevoPrestamo.value = true
  console.log('Abriendo formulario de empéño...')
}

const cerrarModalNuevoPrestamo = () => {
  mostrarNuevoPrestamo.value = false
}

const procesarSolicitudEmpeno = async (datosFormulario) => {
  try {
    // Aquí harías la petición a tu API para procesar la solicitud
    // Ejemplo de estructura de datos que recibes del formulario:
    /*
    datosFormulario contiene:
    - tipoArticulo: ID del tipo de artículo
    - descripcion: Descripción detallada
    - estadoFisico: Estado del artículo
    - valorEstimado: Valor estimado por el cliente
    - marca, modelo: Para artículos electrónicos
    - especificacionesTecnicas: Para electrónicos
    - fotos: Array de archivos de imagen
    - documentoTecnico: Archivo PDF/DOC (opcional)
    - montoSolicitado: Monto del préstamo solicitado
    - plazoMeses: Plazo en meses (1-6)
    - modalidadPago: 'mensual' o 'semanal'
    - aceptaTerminos: boolean
    - plan_pagos: JSON con plan calculado
    - rango_avaluo: JSON con rango de avalúo
    */
    
    // const response = await $fetch('/api/empenos/solicitudes', {
    //   method: 'POST',
    //   body: datosFormulario
    // })
    
    console.log('Datos de la solicitud:', datosFormulario)
    
    // Simular procesamiento exitoso
    alert('¡Solicitud enviada exitosamente! Te contactaremos pronto para el avalúo.')
    cerrarModalNuevoPrestamo()
    
    // Opcional: actualizar la lista de préstamos o redirigir
    // await refreshPrestamos()
    
  } catch (error) {
    console.error('Error al procesar solicitud:', error)
    alert('Error al enviar la solicitud. Inténtalo nuevamente.')
  }
}

const contactarAsesor = () => {
  // Aquí puedes implementar la lógica para contactar al asesor
  alert('Redirigiendo a WhatsApp...')
  window.open('https://wa.me/50212345678?text=Hola,%20me%20interesa%20hacer%20un%20empeño', '_blank')
}

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const isVencido = (fechaVencimiento) => {
  return new Date(fechaVencimiento) < new Date()
}

const calcularPrestamo = () => {
  const valor = parseFloat(calculadora.value.valor) || 0
  const porcentaje = parseFloat(calculadora.value.porcentaje) || 50
  const plazo = parseInt(calculadora.value.plazo) || 1
  const interesMensual = parseFloat(calculadora.value.interesMensual) || 5

  calculadora.value.montoPrestamo = valor * (porcentaje / 100)
  calculadora.value.interesTotal = calculadora.value.montoPrestamo * (interesMensual / 100) * plazo
  calculadora.value.totalPagar = calculadora.value.montoPrestamo + calculadora.value.interesTotal
}

const verDetalle = (prestamo) => {
  // Navegar a la página de detalle del préstamo
  navigateTo(`/empeno/${prestamo.id}`)
}

const renovarPrestamo = (prestamo) => {
  alert(`Renovando préstamo de ${prestamo.articulo}...`)
  // Implementar lógica de renovación
}

const pagarPrestamo = (prestamo) => {
  alert(`Procesando pago de ${prestamo.articulo}...`)
  // Implementar lógica de pago
}

const descargarReporte = () => {
  alert('Descargando reporte...')
  // Implementar lógica de descarga
}

// Verificar autenticación
onMounted(() => {
  if (!user.value) {
    navigateTo('/login')
  }
  calcularPrestamo()
})
</script>

<style scoped>
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

.stat-card.available {
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

.stat-card.available .stat-icon {
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

.prestamo-card.activo {
  border-left-color: #27AE60;
}

.prestamo-card.vencido {
  border-left-color: #E74C3C;
}

.prestamo-card.renovado {
  border-left-color: #F39C12;
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
  margin: 0;
  color: #666;
  font-size: 0.9rem;
}

.estado-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
  text-transform: uppercase;
}

.estado-badge.activo {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.estado-badge.vencido {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.estado-badge.renovado {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
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

.btn-action:hover {
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

/* Modal styles */
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
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  position: relative;
}

.formulario-modal {
  max-width: 900px;
  max-height: 95vh;
  width: 95%;
  position: relative;
  overflow: hidden;
}

.formulario-modal .formulario-empeno {
  border-radius: 0;
  max-height: 95vh;
  overflow-y: auto;
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

  .modal-footer {
    flex-direction: column;
  }
}
</style>