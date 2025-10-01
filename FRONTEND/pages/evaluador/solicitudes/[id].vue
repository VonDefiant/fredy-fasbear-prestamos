<template>
  <div class="evaluacion-page">
    <!-- HEADER DE NAVEGACIÓN -->
    <div class="navigation-header">
      <NuxtLink to="/evaluador" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Volver al Panel de Evaluador
      </NuxtLink>
    </div>

    <!-- LOADING STATE -->
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando solicitud...</p>
      </div>
    </div>

    <!-- ERROR STATE -->
    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Error al cargar la solicitud</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="cargarSolicitud" class="btn-retry">Reintentar</button>
        <NuxtLink to="/evaluador" class="btn-volver">Volver al Panel</NuxtLink>
      </div>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-else-if="solicitud" class="evaluacion-container">
      <!-- HEADER DE LA SOLICITUD -->
      <div class="solicitud-header">
        <div class="header-info">
          <h1>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
            </svg>
            Evaluación de Solicitud #{{ solicitud.id }}
          </h1>
          <p>Fecha de solicitud: {{ formatDate(solicitud.fechaSolicitud) }}</p>
        </div>
        <div class="estado-badge" :class="solicitud.estado.toLowerCase()">
          {{ solicitud.estado }}
        </div>
      </div>

      <!-- INFORMACIÓN DEL CLIENTE -->
      <div class="info-card cliente-info">
        <div class="card-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
            </svg>
            Información del Cliente
          </h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="label">Nombre Completo:</span>
            <span class="value">{{ solicitud.usuario.nombre }} {{ solicitud.usuario.apellido }}</span>
          </div>
          <div class="info-item">
            <span class="label">Cédula:</span>
            <span class="value">{{ solicitud.usuario.cedula }}</span>
          </div>
          <div class="info-item">
            <span class="label">Email:</span>
            <span class="value">{{ solicitud.usuario.email }}</span>
          </div>
          <div class="info-item">
            <span class="label">Teléfono:</span>
            <span class="value">{{ solicitud.usuario.telefono }}</span>
          </div>
          <div class="info-item full-width">
            <span class="label">Dirección:</span>
            <span class="value">{{ solicitud.usuario.direccion }}</span>
          </div>
        </div>
      </div>

      <!-- INFORMACIÓN DEL ARTÍCULO -->
      <div v-for="articulo in solicitud.Articulo" :key="articulo.id" class="info-card articulo-info">
        <div class="card-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M21 16V8C20.9996 7.64927 20.9071 7.30481 20.7315 7.00116C20.556 6.69751 20.3037 6.44536 20 6.27L13 2.27C12.696 2.09446 12.3511 2.00205 12 2.00205C11.6489 2.00205 11.304 2.09446 11 2.27L4 6.27C3.69626 6.44536 3.44398 6.69751 3.26846 7.00116C3.09294 7.30481 3.00036 7.64927 3 8V16C3.00036 16.3507 3.09294 16.6952 3.26846 16.9988C3.44398 17.3025 3.69626 17.5546 4 17.73L11 21.73C11.304 21.9055 11.6489 21.9979 12 21.9979C12.3511 21.9979 12.696 21.9055 13 21.73L20 17.73C20.3037 17.5546 20.556 17.3025 20.7315 16.9988C20.9071 16.6952 20.9996 16.3507 21 16Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="3.27,6.96 12,12.01 20.73,6.96" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="22.08" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Información del Artículo
          </h3>
          <span class="tipo-badge">{{ articulo.tipoArticulo?.nombre }}</span>
        </div>

        <div class="info-grid">
          <div class="info-item">
            <span class="label">Tipo de Artículo:</span>
            <span class="value">{{ articulo.tipoArticulo?.nombre }}</span>
          </div>
          <div class="info-item">
            <span class="label">Estado Físico:</span>
            <span class="value estado-fisico" :class="articulo.estadoFisico.toLowerCase()">
              {{ articulo.estadoFisico }}
            </span>
          </div>
          <div class="info-item full-width">
            <span class="label">Descripción:</span>
            <span class="value">{{ articulo.descripcion }}</span>
          </div>
          <div class="info-item">
            <span class="label">Marca:</span>
            <span class="value">{{ articulo.marca || 'No especificada' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Modelo:</span>
            <span class="value">{{ articulo.modelo || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Color:</span>
            <span class="value">{{ articulo.color || 'No especificado' }}</span>
          </div>
          <div class="info-item">
            <span class="label">Serie:</span>
            <span class="value">{{ articulo.serie || 'No especificada' }}</span>
          </div>
          <div class="info-item destacado">
            <span class="label">Valor Estimado por el Cliente:</span>
            <span class="value valor-estimado">Q{{ formatCurrency(articulo.valorEstimadoCliente) }}</span>
          </div>
        </div>

        <!-- ESPECIFICACIONES TÉCNICAS -->
        <div v-if="articulo.especificacionesTecnicas" class="especificaciones">
          <h4>Especificaciones Técnicas:</h4>
          <p>{{ articulo.especificacionesTecnicas }}</p>
        </div>
      </div>

      <!-- FORMULARIO DE EVALUACIÓN -->
      <div v-if="solicitud.estado === 'Pendiente'" class="evaluacion-form-card">
        <div class="card-header">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            </svg>
            Formulario de Evaluación
          </h3>
        </div>

        <form @submit.prevent="submitEvaluacion" class="evaluacion-form">
          <div class="form-group">
            <label for="valorComercial">Valor Comercial del Artículo *</label>
            <div class="input-wrapper">
              <span class="currency-symbol">Q</span>
              <input
                id="valorComercial"
                v-model.number="formEvaluacion.valorComercial"
                type="number"
                step="0.01"
                min="0"
                required
                placeholder="0.00"
                class="form-input"
              />
            </div>
            <small>Valor comercial actual del artículo según investigación de mercado</small>
          </div>

          <div class="form-group">
            <label for="porcentajeAplicado">Porcentaje de Préstamo *</label>
            <div class="porcentaje-input-group">
              <input
                id="porcentajeAplicado"
                v-model.number="formEvaluacion.porcentajeAplicado"
                type="number"
                step="0.01"
                min="0"
                max="100"
                required
                placeholder="0.00"
                class="form-input"
              />
              <span class="porcentaje-symbol">%</span>
            </div>
            <div class="porcentaje-info">
              <small>Rango recomendado: {{ solicitud.Articulo[0]?.tipoArticulo?.porcentajeMinAvaluo || 25 }}% - 
                {{ solicitud.Articulo[0]?.tipoArticulo?.porcentajeMaxAvaluo || 85 }}%</small>
            </div>
          </div>

          <div class="monto-calculado">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
              <path d="M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2"/>
            </svg>
            <div class="monto-info">
              <span class="monto-label">Monto del Préstamo:</span>
              <span class="monto-value">Q{{ formatCurrency(montoCalculado) }}</span>
            </div>
          </div>

          <div class="form-group">
            <label for="observaciones">Observaciones</label>
            <textarea
              id="observaciones"
              v-model="formEvaluacion.observaciones"
              rows="4"
              placeholder="Detalles adicionales sobre la evaluación, condiciones específicas, etc."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="decision-section">
            <h4>Decisión de Evaluación</h4>
            <p>Selecciona el resultado de tu evaluación:</p>
            
            <div class="decision-buttons">
              <button
                type="button"
                @click="prepararSubmit('Aprobada')"
                class="btn-decision aprobar"
                :disabled="submitting || !formValido"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.3 2 18.23 3.68 19.9 6.3" stroke="currentColor" stroke-width="2"/>
                  <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
                </svg>
                Aprobar Solicitud
              </button>

              <button
                type="button"
                @click="prepararSubmit('Rechazada')"
                class="btn-decision rechazar"
                :disabled="submitting"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Rechazar Solicitud
              </button>
            </div>
          </div>

          <div v-if="errorSubmit" class="alert alert-error">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
            </svg>
            {{ errorSubmit }}
          </div>
        </form>
      </div>

      <!-- AVALÚO EXISTENTE (si ya fue evaluado) -->
      <div v-else-if="solicitud.articulos?.[0]?.avaluo" class="info-card avaluo-info">      
        <div class="card-header resultado">
          <h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
              <rect x="9" y="3" width="6" height="4" rx="1" stroke="currentColor" stroke-width="2"/>
              <polyline points="9,11 11,13 15,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            Resultado de la Evaluación
          </h3>
          <span class="estado-badge" :class="solicitud.estado.toLowerCase()">
            {{ solicitud.estado }}
          </span>
        </div>

        <div class="avaluo-details">
          <div class="avaluo-item">
            <span class="label">Evaluador:</span>
            <span class="value">
  {{ solicitud.articulos[0]?.avaluo?.evaluador?.nombre }}
              {{ solicitud.Articulo[0].Avaluo.evaluador?.apellido }}
            </span>
          </div>
          <div class="avaluo-item">
            <span class="label">Fecha de Evaluación:</span>
            <span class="value">{{ formatDate(solicitud.Articulo[0].Avaluo.fechaAvaluo) }}</span>
          </div>
          <div class="avaluo-item destacado">
            <span class="label">Valor Comercial Determinado:</span>
            <span class="value">Q{{ formatCurrency(solicitud.Articulo[0].Avaluo.valorComercial) }}</span>
          </div>
          <div class="avaluo-item destacado">
            <span class="label">Porcentaje Aplicado:</span>
            <span class="value">{{ solicitud.Articulo[0].Avaluo.porcentajeAplicado }}%</span>
          </div>
          <div class="avaluo-item monto-prestamo">
            <span class="label">Monto del Préstamo:</span>
            <span class="value">Q{{ formatCurrency(solicitud.Articulo[0].Avaluo.montoPrestamo) }}</span>
          </div>
          <div v-if="solicitud.Articulo[0].Avaluo.observaciones" class="avaluo-item full-width">
            <span class="label">Observaciones:</span>
            <span class="value">{{ solicitud.Articulo[0].Avaluo.observaciones }}</span>
          </div>
        </div>
      </div>

    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="mostrarModalConfirmacion" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal-content">
        <div class="modal-header" :class="decisionPendiente.toLowerCase()">
          <svg v-if="decisionPendiente === 'Aprobada'" width="48" height="48" viewBox="0 0 24 24" fill="none">
            <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C15.3 2 18.23 3.68 19.9 6.3" stroke="currentColor" stroke-width="2"/>
            <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else width="48" height="48" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <h3>Confirmar {{ decisionPendiente === 'Aprobada' ? 'Aprobación' : 'Rechazo' }}</h3>
        </div>

        <div class="modal-body">
          <p v-if="decisionPendiente === 'Aprobada'">
            ¿Estás seguro de que deseas <strong>aprobar</strong> esta solicitud con los siguientes datos?
          </p>
          <p v-else>
            ¿Estás seguro de que deseas <strong>rechazar</strong> esta solicitud?
          </p>

          <div class="confirmacion-detalles">
            <div class="detalle-row">
              <span>Valor Comercial:</span>
              <strong>Q{{ formatCurrency(formEvaluacion.valorComercial) }}</strong>
            </div>
            <div class="detalle-row">
              <span>Porcentaje Aplicado:</span>
              <strong>{{ formEvaluacion.porcentajeAplicado }}%</strong>
            </div>
            <div class="detalle-row destacado">
              <span>Monto del Préstamo:</span>
              <strong>Q{{ formatCurrency(montoCalculado) }}</strong>
            </div>
          </div>

          <p class="advertencia">Esta acción no se puede deshacer.</p>
        </div>

        <div class="modal-actions">
          <button @click="cerrarModal" class="btn-cancelar" :disabled="submitting">
            Cancelar
          </button>
          <button @click="confirmarSubmit" class="btn-confirmar" :class="decisionPendiente.toLowerCase()" :disabled="submitting">
            <span v-if="submitting" class="spinner-small"></span>
            {{ submitting ? 'Procesando...' : `Confirmar ${decisionPendiente === 'Aprobada' ? 'Aprobación' : 'Rechazo'}` }}
          </button>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '~/composables/useAuth'

definePageMeta({
  middleware: ['evaluador']
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()

const loading = ref(true)
const error = ref(null)
const solicitud = ref(null)
const submitting = ref(false)
const errorSubmit = ref(null)
const mostrarModalConfirmacion = ref(false)
const decisionPendiente = ref(null)

const formEvaluacion = ref({
  valorComercial: 0,
  porcentajeAplicado: 0,
  observaciones: ''
})

const montoCalculado = computed(() => {
  const valor = parseFloat(formEvaluacion.value.valorComercial) || 0
  const porcentaje = parseFloat(formEvaluacion.value.porcentajeAplicado) || 0
  return (valor * porcentaje) / 100
})

const formValido = computed(() => {
  return formEvaluacion.value.valorComercial > 0 && 
         formEvaluacion.value.porcentajeAplicado > 0 &&
         formEvaluacion.value.porcentajeAplicado <= 100
})

const api = async (endpoint, options = {}) => {
  const { getToken } = useAuth()
  const token = getToken()

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

const cargarSolicitud = async () => {
  try {
    loading.value = true
    error.value = null
    
    const solicitudId = route.params.id
    console.log('Cargando solicitud:', solicitudId)
    
    const response = await api(`/evaluador/solicitudes/${solicitudId}`)
    solicitud.value = response.data
    
    // Pre-cargar valores sugeridos
    if (solicitud.value.articulos && solicitud.value.articulos[0]) {
      const articulo = solicitud.value.articulos[0]
      formEvaluacion.value.valorComercial = parseFloat(articulo.valorEstimadoCliente) || 0
      
      // Porcentaje por defecto según tipo de artículo
      const porcentajeMin = articulo.tipoArticulo?.porcentajeMinAvaluo || 25
      const porcentajeMax = articulo.tipoArticulo?.porcentajeMaxAvaluo || 85
      formEvaluacion.value.porcentajeAplicado = Math.round((porcentajeMin + porcentajeMax) / 2)
    }
    
    console.log('Solicitud cargada:', solicitud.value)
    
  } catch (err) {
    console.error('Error cargando solicitud:', err)
    error.value = err.message || 'Error al cargar la solicitud'
  } finally {
    loading.value = false
  }
}

const prepararSubmit = (decision) => {
  if (decision === 'Aprobada' && !formValido.value) {
    errorSubmit.value = 'Por favor completa todos los campos requeridos correctamente'
    return
  }
  
  decisionPendiente.value = decision
  mostrarModalConfirmacion.value = true
  errorSubmit.value = null
}

const cerrarModal = () => {
  if (!submitting.value) {
    mostrarModalConfirmacion.value = false
    decisionPendiente.value = null
  }
}

const confirmarSubmit = async () => {
  try {
    submitting.value = true
    errorSubmit.value = null
    
    const solicitudId = route.params.id
    const datosEvaluacion = {
      valorComercial: parseFloat(formEvaluacion.value.valorComercial),
      porcentajeAplicado: parseFloat(formEvaluacion.value.porcentajeAplicado),
      observaciones: formEvaluacion.value.observaciones || null,
      estado: decisionPendiente.value
    }
    
    console.log('Enviando evaluación:', datosEvaluacion)
    
    const response = await api(`/evaluador/solicitudes/${solicitudId}/evaluar`, {
      method: 'POST',
      body: JSON.stringify(datosEvaluacion)
    })
    
    console.log('Evaluación guardada:', response)
    
    // Mostrar mensaje de éxito y redirigir
    alert(`Solicitud ${decisionPendiente.value.toLowerCase()} exitosamente`)
    router.push('/evaluador')
    
  } catch (err) {
    console.error('Error guardando evaluación:', err)
    errorSubmit.value = err.message || 'Error al guardar la evaluación'
    mostrarModalConfirmacion.value = false
  } finally {
    submitting.value = false
  }
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
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

onMounted(() => {
  cargarSolicitud()
})
</script>

<style scoped>
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-rojo-granate: #8B0000;
}

.avaluos-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
}

.navigation-header {
  background: var(--color-blanco-perla);
  padding: 1rem 2rem;
  border-bottom: 1px solid #E5E7EB;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--color-gris-acero);
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--color-dorado-vintage);
  color: white;
  transform: translateX(-4px);
}

.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* PAGE HEADER */
.page-header {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-content h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.header-content h1 svg {
  color: var(--color-dorado-vintage);
}

.header-content p {
  color: var(--color-gris-acero);
  font-size: 1rem;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: #F4D03F;
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* STATS CARDS */
.stats-cards {
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
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
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

.stat-icon.blue {
  background: linear-gradient(135deg, #DBEAFE, #BFDBFE);
  color: #1E40AF;
}

.stat-icon.green {
  background: linear-gradient(135deg, #D1FAE5, #A7F3D0);
  color: #065F46;
}

.stat-icon.red {
  background: linear-gradient(135deg, #FEE2E2, #FECACA);
  color: var(--color-rojo-granate);
}

.stat-icon.gold {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  color: #92400E;
}

.stat-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.stat-label {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.stat-value {
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

/* LOADING & EMPTY */
.loading-state,
.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
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

.empty-state svg {
  color: #D1D5DB;
  margin-bottom: 1rem;
}

.empty-state h3 {
  font-size: 1.5rem;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: var(--color-gris-acero);
}

/* TABLA */
.avaluos-table-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  margin-bottom: 2rem;
}

.avaluos-table {
  width: 100%;
  border-collapse: collapse;
}

.avaluos-table thead {
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-gris-acero));
  color: white;
}

.avaluos-table th {
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avaluos-table tbody tr {
  border-bottom: 1px solid #E5E7EB;
  transition: all 0.3s ease;
}

.avaluos-table tbody tr:hover {
  background: var(--color-blanco-perla);
}

.avaluos-table td {
  padding: 1rem;
  font-size: 0.95rem;
  color: var(--color-gris-acero);
}

.id-cell {
  font-weight: 600;
  color: var(--color-azul-marino);
}

.cliente-cell .cliente-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: var(--color-negro-carbon);
}

.articulo-cell {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.tipo-badge {
  display: inline-block;
  background: var(--color-azul-marino);
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  width: fit-content;
}

.articulo-desc {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.monto-cell {
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.monto-cell.destacado {
  color: var(--color-dorado-vintage);
  font-size: 1.1rem;
}

.porcentaje-cell {
  font-weight: 600;
  color: var(--color-azul-marino);
}

.estado-badge {
  display: inline-block;
  padding: 0.375rem 0.875rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.estado-badge.aprobada {
  background: #D1FAE5;
  color: #065F46;
}

.estado-badge.rechazada {
  background: #FEE2E2;
  color: var(--color-rojo-granate);
}

.estado-badge.pendiente {
  background: #FEF3C7;
  color: #92400E;
}

.actions-cell {
  text-align: center;
}

.btn-ver {
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.btn-ver:hover {
  background: #F4D03F;
  transform: scale(1.1);
}

/* PAGINACIÓN */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.btn-pagina {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pagina:hover:not(:disabled) {
  background: #F4D03F;
  transform: translateY(-2px);
}

.btn-pagina:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagina-info {
  font-weight: 600;
  color: var(--color-gris-acero);
}

/* RESPONSIVE */
@media (max-width: 1200px) {
  .avaluos-table-container {
    overflow-x: auto;
  }

  .avaluos-table {
    min-width: 1000px;
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .pagination {
    flex-direction: column;
    gap: 1rem;
  }
}
</style>