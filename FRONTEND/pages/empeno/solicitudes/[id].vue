<template>
  <div class="detalle-solicitud-page">
    <!-- Loading State -->
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="spinning">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <p>Cargando detalle de solicitud...</p>
    </div>

    <!-- Error State -->
    <div class="error-container" v-else-if="error">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Error al cargar solicitud</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button @click="cargarDetalle" class="btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M1 4V10H7" stroke="currentColor" stroke-width="2"/>
            <path d="M23 20V14H17" stroke="currentColor" stroke-width="2"/>
            <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2"/>
          </svg>
          Reintentar
        </button>
        <button @click="volverAlInicio" class="btn-secondary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al Inicio
        </button>
      </div>
    </div>

    <!-- Contenido Principal -->
    <div class="detalle-container" v-else-if="solicitud">
      
      <!-- Header con navegación y estado -->
      <div class="detalle-header">
        <div class="header-navigation">
          <button @click="volverAlInicio" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
            </svg>
            Volver a Mis Empéños
          </button>
        </div>

        <div class="header-content">
          <div class="header-info">
            <h1>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ solicitud.numero }}
            </h1>
            <p>Detalle de tu solicitud de empeño</p>
          </div>

          <div class="header-status">
            <div class="status-badge" :class="`status-${solicitud.estado?.toLowerCase()}`">
              <span class="status-dot"></span>
              {{ formatearEstado(solicitud.estado) }}
            </div>
          </div>
        </div>

        <!-- Progress Steps -->
        <div class="progress-steps">
          <div class="step" :class="{ active: true, completed: ['Evaluando', 'Aprobada', 'Rechazada'].includes(solicitud.estado) }">
            <span class="step-number">1</span>
            <span class="step-label">Solicitud Enviada</span>
            <span class="step-date">{{ formatDate(solicitud.fechaSolicitud) }}</span>
          </div>
          <div class="step" :class="{ active: ['Evaluando', 'Aprobada', 'Rechazada'].includes(solicitud.estado), completed: ['Aprobada', 'Rechazada'].includes(solicitud.estado) }">
            <span class="step-number">2</span>
            <span class="step-label">En Evaluación</span>
            <span class="step-date" v-if="solicitud.fechaEvaluacion">{{ formatDate(solicitud.fechaEvaluacion) }}</span>
          </div>
          <div class="step" :class="{ 
            active: ['Aprobada', 'Rechazada'].includes(solicitud.estado), 
            completed: solicitud.estado === 'Aprobada',
            rejected: solicitud.estado === 'Rechazada'
          }">
            <span class="step-number">
              <svg v-if="solicitud.estado === 'Rechazada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="solicitud.estado === 'Aprobada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              <span v-else>3</span>
            </span>
            <span class="step-label">
              {{ solicitud.estado === 'Rechazada' ? 'Rechazada' : solicitud.estado === 'Aprobada' ? 'Aprobada' : 'Evaluación Final' }}
            </span>
            <span class="step-date" v-if="solicitud.fechaEvaluacion && ['Aprobada', 'Rechazada'].includes(solicitud.estado)">
              {{ formatDate(solicitud.fechaEvaluacion) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Alerta para solicitudes rechazadas -->
      <div class="rejection-alert" v-if="solicitud.estado === 'Rechazada'">
        <div class="rejection-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="rejection-content">
          <h3>Solicitud Rechazada</h3>
          <p v-if="solicitud.observaciones && !solicitud.observaciones.includes('Cancelada por el usuario')">
            <strong>Motivo del rechazo:</strong> {{ solicitud.observaciones }}
          </p>
          <p v-else-if="solicitud.observaciones && solicitud.observaciones.includes('Cancelada por el usuario')">
            Esta solicitud fue <strong>cancelada</strong> por tu solicitud el {{ formatDate(solicitud.fechaEvaluacion) }}.
          </p>
          <p v-else>
            No se especificó un motivo detallado para el rechazo. 
            Puedes contactarnos para más información o crear una nueva solicitud con las mejoras necesarias.
          </p>
        </div>
      </div>

      <!-- Alerta para solicitudes aprobadas -->
      <div class="approval-alert" v-if="solicitud.estado === 'Aprobada'">
        <div class="approval-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="approval-content">
          <h3>¡Solicitud Aprobada!</h3>
          <p>
            Tu solicitud ha sido aprobada. Ahora puedes revisar la oferta y proceder con la aceptación del préstamo.
            Te contactaremos pronto para coordinar la entrega del artículo y la firma del contrato.
          </p>
          <p v-if="solicitud.observaciones">
            <strong>Observaciones:</strong> {{ solicitud.observaciones }}
          </p>
        </div>
      </div>

      <!-- Contenido Principal -->
      <div class="detalle-content">
        
        <!-- Información General -->
        <div class="info-section">
          <div class="section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22" stroke="currentColor" stroke-width="2"/>
              </svg>
              Información General
            </h2>
          </div>

          <div class="info-grid">
            <div class="info-card">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-label">Número de Solicitud</span>
                <span class="info-value">{{ solicitud.numero }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-label">Fecha de Solicitud</span>
                <span class="info-value">{{ formatDateLong(solicitud.fechaSolicitud) }}</span>
              </div>
            </div>

            <div class="info-card" v-if="solicitud.fechaEvaluacion">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-label">Fecha de Evaluación</span>
                <span class="info-value">{{ formatDateLong(solicitud.fechaEvaluacion) }}</span>
              </div>
            </div>

            <div class="info-card">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 16.79 18.21 15 16 15H8C5.79 15 4 16.79 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-label">Solicitante</span>
                <span class="info-value">{{ solicitud.usuario?.nombre || 'No especificado' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Artículos Empeñados -->
        <div class="articulos-section">
          <div class="section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Artículos en Empeño
              <span class="items-count">({{ solicitud.articulos?.length || 0 }})</span>
            </h2>
          </div>

          <div class="articulos-grid" v-if="solicitud.articulos?.length">
            <div 
              v-for="(articulo, index) in solicitud.articulos" 
              :key="articulo.id || index"
              class="articulo-card"
            >
              <div class="articulo-header">
                <div class="articulo-tipo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ articulo.tipo || 'Artículo' }}
                </div>
                <div class="articulo-estado" :class="`estado-${articulo.estadoFisico?.toLowerCase()}`">
                  {{ formatearEstadoFisico(articulo.estadoFisico) }}
                </div>
              </div>

              <div class="articulo-content">
                <h4 class="articulo-titulo">{{ articulo.descripcion || 'Sin descripción' }}</h4>
                
                <div class="articulo-details">
                  <div class="detail-row" v-if="articulo.marca">
                    <span class="detail-label">Marca:</span>
                    <span class="detail-value">{{ articulo.marca }}</span>
                  </div>
                  <div class="detail-row" v-if="articulo.modelo">
                    <span class="detail-label">Modelo:</span>
                    <span class="detail-value">{{ articulo.modelo }}</span>
                  </div>
                  <div class="detail-row" v-if="articulo.serie">
                    <span class="detail-label">Serie:</span>
                    <span class="detail-value">{{ articulo.serie }}</span>
                  </div>
                  <div class="detail-row" v-if="articulo.color">
                    <span class="detail-label">Color:</span>
                    <span class="detail-value">{{ articulo.color }}</span>
                  </div>
                  <div class="detail-row" v-if="articulo.valorEstimadoCliente">
                    <span class="detail-label">Valor Estimado:</span>
                    <span class="detail-value currency">{{ formatCurrency(articulo.valorEstimadoCliente) }}</span>
                  </div>
                </div>

                <div class="articulo-specs" v-if="articulo.especificacionesTecnicas">
                  <h5>Especificaciones Técnicas:</h5>
                  <p>{{ articulo.especificacionesTecnicas }}</p>
                </div>
              </div>
            </div>
          </div>

          <div class="empty-articulos" v-else>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>No se encontraron artículos en esta solicitud</p>
          </div>
        </div>

        <!-- Acciones Disponibles -->
        <div class="actions-section">
          <div class="section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M9 11H15M9 15H15M17 21L20 18L17 15M3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V12.5" stroke="currentColor" stroke-width="2" fill="none"/>
              </svg>
              Acciones Disponibles
            </h2>
          </div>

          <div class="actions-grid">
            
            <!-- Acciones para Pendiente/Evaluando -->
            <template v-if="['Pendiente', 'Evaluando'].includes(solicitud.estado)">
              <button @click="confirmarCancelacion" class="action-button danger" :disabled="loadingAction">
                <div class="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                    <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="action-content">
                  <span class="action-title">{{ loadingAction ? 'Cancelando...' : 'Cancelar Solicitud' }}</span>
                  <span class="action-description">Cancelar esta solicitud permanentemente</span>
                </div>
              </button>
            </template>

            <!-- Acciones para Aprobada -->
            <template v-if="solicitud.estado === 'Aprobada'">
              <button @click="aceptarOferta" class="action-button success" :disabled="loadingAction">
                <div class="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                </div>
                <div class="action-content">
                  <span class="action-title">{{ loadingAction ? 'Procesando...' : 'Aceptar Oferta' }}</span>
                  <span class="action-description">Proceder con el préstamo aprobado</span>
                </div>
              </button>
            </template>

            <!-- Acciones para Rechazada -->
            <template v-if="solicitud.estado === 'Rechazada'">
              <button @click="crearNuevaSolicitud" class="action-button primary">
                <div class="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M14 9V5C14 4.45 13.55 4 13 4H5C4.45 4 4 4.45 4 5V19C4 19.55 4.45 20 5 20H13C13.55 20 14 19.55 14 19V15" stroke="currentColor" stroke-width="2" fill="none"/>
                    <path d="M3 9H21L18 6M21 9L18 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="action-content">
                  <span class="action-title">Nueva Solicitud</span>
                  <span class="action-description">Crear una nueva solicitud mejorada</span>
                </div>
              </button>
            </template>

            <!-- Acción siempre disponible -->
            <button @click="volverAlInicio" class="action-button secondary">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.55 20.55 21 20 21H4C3.45 21 3 20.55 3 20V9Z" stroke="currentColor" stroke-width="2" fill="none"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="action-content">
                <span class="action-title">Volver al Inicio</span>
                <span class="action-description">Regresar a la lista de empéños</span>
              </div>
            </button>
          </div>
        </div>

      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN DE CANCELACIÓN -->
    <div class="modal-overlay" v-if="mostrarConfirmacionCancelacion" @click="cerrarConfirmacionCancelacion">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h3>Confirmar Cancelación</h3>
          <button @click="cerrarConfirmacionCancelacion" class="modal-close">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-content">
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
              Esta acción no se puede deshacer. La solicitud <strong>{{ solicitud?.numero }}</strong>
              será marcada como cancelada y no podrá ser procesada.
            </p>

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

    <!-- Sistema de notificaciones -->
    <div class="notification-container" v-if="notification.show">
      <div class="notification" :class="`notification-${notification.type}`">
        <div class="notification-content">
          <svg v-if="notification.type === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
          <svg v-else-if="notification.type === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
          <svg v-else-if="notification.type === 'info'" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
            <path d="M12 16V12" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8H12.01" stroke="currentColor" stroke-width="2"/>
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

  </div>
</template>

<script setup>
// Proteger la ruta con middleware
definePageMeta({
  middleware: 'auth'
})

// ===== COMPOSABLES Y DEPENDENCIAS =====
const route = useRoute()
const { user } = useAuth()
const { api } = useApi()
const { obtenerDetalleSolicitud, cancelarSolicitud } = useSolicitudes()

// ===== META TAGS =====
useHead({
  title: 'Detalle de Solicitud - Mis Empéños',
  meta: [
    { name: 'description', content: 'Ver detalle completo de tu solicitud de empeño' }
  ]
})

// ===== ESTADO REACTIVO =====
const loading = ref(true)
const error = ref(null)
const solicitud = ref(null)
const loadingAction = ref(false)
const loadingCancelacion = ref(false)

// Modal de confirmación
const mostrarConfirmacionCancelacion = ref(false)
const motivoCancelacion = ref('')

// Sistema de notificaciones
const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

// ===== COMPUTED =====
const solicitudId = computed(() => {
  return parseInt(route.params.id)
})

// ===== MÉTODOS DE UTILIDAD =====
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    style: 'currency',
    currency: 'GTQ',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  if (!dateString) return 'Sin fecha'
  return new Date(dateString).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatDateLong = (dateString) => {
  if (!dateString) return 'Sin fecha'
  return new Date(dateString).toLocaleDateString('es-GT', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatearEstado = (estado) => {
  const estados = {
    'Pendiente': 'Pendiente de Evaluación',
    'Evaluando': 'En Proceso de Evaluación', 
    'Aprobada': 'Aprobada - Lista para Firma',
    'Rechazada': 'Rechazada',
    'Completada': 'Completada'
  }
  return estados[estado] || estado
}

const formatearEstadoFisico = (estado) => {
  const estados = {
    'Excelente': 'Excelente',
    'Bueno': 'Buen Estado',
    'Regular': 'Estado Regular',
    'Malo': 'Estado Deficiente'
  }
  return estados[estado] || estado || 'No especificado'
}

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
const cargarDetalle = async () => {
  try {
    loading.value = true
    error.value = null
    
    console.log('🔍 Cargando detalle de solicitud:', solicitudId.value)
    
    if (!solicitudId.value || isNaN(solicitudId.value)) {
      throw new Error('ID de solicitud inválido')
    }
    
    const response = await obtenerDetalleSolicitud(solicitudId.value)
    
    if (response.success && response.data) {
      solicitud.value = response.data
      console.log('✅ Detalle cargado:', solicitud.value)
      
      // Actualizar meta tags dinámicamente
      useHead({
        title: `${solicitud.value.numero} - Detalle de Solicitud`,
      })
    } else {
      throw new Error(response.message || 'No se pudo cargar el detalle')
    }
    
  } catch (err) {
    console.error('❌ Error cargando detalle:', err)
    error.value = err.message || 'Error al cargar el detalle de la solicitud'
  } finally {
    loading.value = false
  }
}

// ===== MÉTODOS DE NAVEGACIÓN =====
const volverAlInicio = () => {
  navigateTo('/empeno')
}

const crearNuevaSolicitud = () => {
  navigateTo('/empeno?nueva=true')
}

// ===== MÉTODOS DE ACCIONES =====
const aceptarOferta = async () => {
  try {
    loadingAction.value = true
    console.log('✅ Redirigiendo para aceptar oferta:', solicitudId.value)
    
    // Redirigir a una página específica de aceptación de oferta
    navigateTo(`/empeno/solicitudes/${solicitudId.value}/aceptar`)
    
  } catch (error) {
    console.error('❌ Error procesando aceptación:', error)
    mostrarNotificacion('Error al procesar la aceptación', 'error')
  } finally {
    loadingAction.value = false
  }
}

const confirmarCancelacion = () => {
  console.log('⚠️ Solicitando confirmación de cancelación')
  mostrarConfirmacionCancelacion.value = true
  motivoCancelacion.value = ''
}

const cerrarConfirmacionCancelacion = () => {
  mostrarConfirmacionCancelacion.value = false
  motivoCancelacion.value = ''
}

const ejecutarCancelacion = async () => {
  if (!solicitud.value) {
    mostrarNotificacion('Error: No se encontró la solicitud', 'error')
    return
  }

  try {
    loadingCancelacion.value = true
    
    console.log('❌ Cancelando solicitud:', {
      id: solicitud.value.id,
      numero: solicitud.value.numero,
      motivo: motivoCancelacion.value
    })
    
    const response = await cancelarSolicitud(
      solicitud.value.id,
      motivoCancelacion.value || 'Cancelada por el usuario desde la página de detalle'
    )
    
    if (response.success) {
      mostrarNotificacion(
        `Solicitud ${solicitud.value.numero} cancelada exitosamente`, 
        'success'
      )
      
      // Cerrar modal
      cerrarConfirmacionCancelacion()
      
      // Recargar detalle
      await cargarDetalle()
      
      console.log('✅ Solicitud cancelada exitosamente')
    } else {
      throw new Error(response.message || 'Error desconocido al cancelar')
    }
    
  } catch (error) {
    console.error('❌ Error cancelando solicitud:', error)
    
    let mensajeError = 'Error al cancelar la solicitud'
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

// ===== LIFECYCLE =====
onMounted(async () => {
  console.log('🚀 Iniciando página de detalle de solicitud...')
  console.log('📄 ID de solicitud:', solicitudId.value)
  await cargarDetalle()
})
</script>

<style scoped>
/* ===== ESTILOS BASE ===== */
.detalle-solicitud-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 0;
}

/* ===== ESTADOS DE CARGA Y ERROR ===== */
.loading-container,
.error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  padding: 2rem;
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.loading-spinner svg {
  color: #3b82f6;
}

.error-icon {
  margin-bottom: 1.5rem;
  color: #ef4444;
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #6b7280;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
}

/* ===== CONTAINER PRINCIPAL ===== */
.detalle-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== HEADER ===== */
.detalle-header {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-navigation {
  padding: 1rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.btn-back:hover {
  background: #e5e7eb;
  color: #374151;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #f3f4f6;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 0.5rem;
}

.header-info h1 svg {
  color: #3b82f6;
}

.header-info p {
  color: #6b7280;
  margin: 0;
}

.header-status {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-pendiente {
  background: #fef3c7;
  color: #d97706;
}

.status-pendiente .status-dot {
  background: #f59e0b;
}

.status-evaluando {
  background: #dbeafe;
  color: #1d4ed8;
}

.status-evaluando .status-dot {
  background: #3b82f6;
}

.status-aprobada {
  background: #d1fae5;
  color: #047857;
}

.status-aprobada .status-dot {
  background: #10b981;
}

.status-rechazada {
  background: #fee2e2;
  color: #dc2626;
}

.status-rechazada .status-dot {
  background: #ef4444;
}

/* ===== PROGRESS STEPS ===== */
.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  position: relative;
  background: #f8fafc;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: #e5e7eb;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
  background: #f8fafc;
  padding: 0 1rem;
  text-align: center;
  flex: 1;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #e5e7eb;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  color: #9ca3af;
  background: white;
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: #3b82f6;
  color: #3b82f6;
}

.step.completed .step-number {
  background: #10b981;
  border-color: #10b981;
  color: white;
}

.step.rejected .step-number {
  background: #ef4444;
  border-color: #ef4444;
  color: white;
}

.step-label {
  font-weight: 500;
  color: #6b7280;
  font-size: 0.875rem;
}

.step.active .step-label {
  color: #3b82f6;
  font-weight: 600;
}

.step.completed .step-label {
  color: #10b981;
  font-weight: 600;
}

.step.rejected .step-label {
  color: #ef4444;
  font-weight: 600;
}

.step-date {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

/* ===== ALERTAS ===== */
.rejection-alert,
.approval-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: 12px;
  border-left: 4px solid;
}

.rejection-alert {
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
  border-left-color: #ef4444;
}

.approval-alert {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-left-color: #10b981;
}

.rejection-icon {
  color: #dc2626;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.approval-icon {
  color: #059669;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.rejection-content h3,
.approval-content h3 {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.75rem 0;
}

.rejection-content h3 {
  color: #dc2626;
}

.approval-content h3 {
  color: #059669;
}

.rejection-content p,
.approval-content p {
  margin: 0;
  line-height: 1.6;
  font-size: 0.875rem;
}

.rejection-content p {
  color: #7f1d1d;
}

.approval-content p {
  color: #064e3b;
}

.rejection-content p:not(:last-child),
.approval-content p:not(:last-child) {
  margin-bottom: 0.75rem;
}

.rejection-content strong,
.approval-content strong {
  font-weight: 600;
}

/* ===== CONTENIDO PRINCIPAL ===== */
.detalle-content {
  display: grid;
  gap: 2rem;
}

/* ===== SECCIONES ===== */
.info-section,
.articulos-section,
.actions-section {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #f3f4f6;
  background: #f8fafc;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.section-header h2 svg {
  color: #3b82f6;
}

.items-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: #6b7280;
}

/* ===== INFORMACIÓN GENERAL ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.2s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.info-icon {
  padding: 1rem;
  background: #3b82f6;
  border-radius: 12px;
  color: white;
  flex-shrink: 0;
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

/* ===== ARTÍCULOS ===== */
.articulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.articulo-card {
  border: 2px solid #f3f4f6;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: white;
}

.articulo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #e5e7eb;
}

.articulo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: #f8fafc;
  border-bottom: 1px solid #f3f4f6;
}

.articulo-tipo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: #3b82f6;
}

.articulo-estado {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.estado-excelente {
  background: #d1fae5;
  color: #047857;
}

.estado-bueno {
  background: #dbeafe;
  color: #1d4ed8;
}

.estado-regular {
  background: #fef3c7;
  color: #d97706;
}

.estado-malo {
  background: #fee2e2;
  color: #dc2626;
}

.articulo-content {
  padding: 1.5rem;
}

.articulo-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
}

.articulo-details {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
}

.detail-label {
  color: #6b7280;
  font-weight: 500;
}

.detail-value {
  color: #1f2937;
  font-weight: 600;
}

.detail-value.currency {
  color: #059669;
  font-weight: 700;
}

.articulo-specs {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.articulo-specs h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.articulo-specs p {
  font-size: 0.875rem;
  color: #6b7280;
  margin: 0;
  line-height: 1.5;
}

.empty-articulos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: #6b7280;
}

.empty-articulos svg {
  margin-bottom: 1rem;
  color: #d1d5db;
}

/* ===== ACCIONES ===== */
.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.action-button {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border: 2px solid transparent;
  border-radius: 12px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
}

.action-button.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #dbeafe, #bae6fd);
}

.action-button.secondary {
  border-color: #6b7280;
  background: linear-gradient(135deg, #f9fafb, #f3f4f6);
}

.action-button.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.action-button.success {
  border-color: #10b981;
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
}

.action-button.success:hover:not(:disabled) {
  background: linear-gradient(135deg, #dcfce7, #bbf7d0);
}

.action-button.danger {
  border-color: #ef4444;
  background: linear-gradient(135deg, #fef2f2, #fee2e2);
}

.action-button.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.action-icon {
  padding: 1rem;
  border-radius: 12px;
  flex-shrink: 0;
}

.action-button.primary .action-icon {
  background: #3b82f6;
  color: white;
}

.action-button.secondary .action-icon {
  background: #6b7280;
  color: white;
}

.action-button.success .action-icon {
  background: #10b981;
  color: white;
}

.action-button.danger .action-icon {
  background: #ef4444;
  color: white;
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: #1f2937;
}

.action-description {
  font-size: 0.875rem;
  color: #6b7280;
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  max-width: 500px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: #374151;
}

.modal-content {
  padding: 2rem;
}

.warning-icon {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #f59e0b;
}

.warning-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 1rem;
  text-align: center;
}

.warning-content p {
  color: #6b7280;
  margin-bottom: 1.5rem;
  text-align: center;
  line-height: 1.6;
}

.motivo-section {
  margin-top: 1.5rem;
}

.motivo-section label {
  display: block;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.motivo-section textarea {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.875rem;
  resize: vertical;
  min-height: 80px;
}

.motivo-section textarea:focus {
  outline: none;
  border-color: #3b82f6;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #f3f4f6;
}

/* ===== BOTONES ===== */
.btn-primary,
.btn-secondary,
.btn-danger {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: #2563eb;
}

.btn-secondary {
  background: #6b7280;
  color: white;
}

.btn-secondary:hover:not(:disabled) {
  background: #4b5563;
}

.btn-danger {
  background: #ef4444;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* ===== NOTIFICACIONES ===== */
.notification-container {
  position: fixed;
  top: 2rem;
  right: 2rem;
  z-index: 1100;
}

.notification {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  max-width: 400px;
  padding: 1rem 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  animation: slideIn 0.3s ease;
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

.notification-success {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.9), rgba(5, 150, 105, 0.9));
  color: white;
}

.notification-error {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.9), rgba(220, 38, 38, 0.9));
  color: white;
}

.notification-info {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(37, 99, 235, 0.9));
  color: white;
}

.notification-content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.notification-content svg {
  margin-top: 0.125rem;
  flex-shrink: 0;
}

.notification-close {
  background: none;
  border: none;
  color: currentColor;
  opacity: 0.7;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: opacity 0.2s ease;
}

.notification-close:hover {
  opacity: 1;
}

/* ===== UTILIDADES ===== */
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* ===== RESPONSIVE ===== */
@media (max-width: 768px) {
  .detalle-container {
    padding: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
  }
  
  .progress-steps {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
    padding: 1rem;
  }
  
  .progress-steps::before {
    display: none;
  }
  
  .step {
    flex-direction: row;
    text-align: left;
    padding: 0;
  }
  
  .step-number {
    width: 40px;
    height: 40px;
    font-size: 0.875rem;
  }
  
  .info-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .articulos-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .articulo-details {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .modal-overlay {
    padding: 0.5rem;
  }
  
  .modal-footer {
    flex-direction: column;
  }
  
  .modal-footer .btn-secondary,
  .modal-footer .btn-danger {
    width: 100%;
    justify-content: center;
  }
  
  .notification-container {
    top: 1rem;
    right: 1rem;
    left: 1rem;
  }
  
  .notification {
    max-width: 100%;
  }
}

@media (max-width: 480px) {
  .header-navigation {
    padding: 0.75rem 1rem;
  }
  
  .header-content {
    padding: 1rem;
  }
  
  .header-info h1 {
    font-size: 1.5rem;
  }
  
  .section-header {
    padding: 1rem 1.5rem;
  }
  
  .section-header h2 {
    font-size: 1.125rem;
  }
  
  .info-card,
  .articulo-card {
    padding: 1rem;
  }
  
  .action-button {
    padding: 1rem;
  }
  
  .action-icon {
    padding: 0.75rem;
  }
}
</style>