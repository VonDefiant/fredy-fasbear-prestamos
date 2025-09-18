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
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
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
            <span class="step-date">{{ formatDate(solicitud.fecha_solicitud) }}</span>
          </div>
          <div class="step" :class="{ active: ['Evaluando', 'Aprobada', 'Rechazada'].includes(solicitud.estado), completed: ['Aprobada', 'Rechazada'].includes(solicitud.estado) }">
            <span class="step-number">2</span>
            <span class="step-label">En Evaluación</span>
            <span class="step-date" v-if="solicitud.fecha_evaluacion">{{ formatDate(solicitud.fecha_evaluacion) }}</span>
          </div>
          <div class="step" :class="{ 
            active: ['Aprobada', 'Rechazada'].includes(solicitud.estado), 
            completed: solicitud.estado === 'Aprobada',
            rejected: solicitud.estado === 'Rechazada'
          }">
            <span class="step-number">
              <svg v-if="solicitud.estado === 'Rechazada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else-if="solicitud.estado === 'Aprobada'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <polyline points="20,6 9,17 4,12" stroke="currentColor" stroke-width="2"/>
              </svg>
              <span v-else>3</span>
            </span>
            <span class="step-label">
              {{ solicitud.estado === 'Rechazada' ? 'Rechazada' : solicitud.estado === 'Aprobada' ? 'Aprobada' : 'Resultado' }}
            </span>
            <span class="step-date" v-if="solicitud.fecha_evaluacion && ['Aprobada', 'Rechazada'].includes(solicitud.estado)">
              {{ formatDate(solicitud.fecha_evaluacion) }}
            </span>
          </div>
        </div>
      </div>

      <!-- Alertas según estado -->
      <div v-if="solicitud.estado === 'Rechazada'" class="rejection-alert">
        <div class="rejection-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
            <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
          </svg>
        </div>
        <div class="rejection-content">
          <h3>Solicitud Rechazada</h3>
          <p>
            Lamentablemente, tu solicitud <strong>{{ solicitud.numero }}</strong> no pudo ser aprobada en esta ocasión.
          </p>
          <p v-if="solicitud.observaciones">
            <strong>Motivo:</strong> {{ solicitud.observaciones }}
          </p>
          <p>
            Puedes crear una nueva solicitud con diferentes artículos o condiciones.
          </p>
        </div>
      </div>

      <div v-if="solicitud.estado === 'Aprobada'" class="approval-alert">
        <div class="approval-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
          </svg>
        </div>
        <div class="approval-content">
          <h3>¡Solicitud Aprobada!</h3>
          <p>
            Tu solicitud <strong>{{ solicitud.numero }}</strong> ha sido aprobada.
            Ahora puedes revisar la oferta y proceder con la aceptación del préstamo.
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

            <div class="info-card">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-label">Estado Actual</span>
                <span class="info-value">{{ formatearEstado(solicitud.estado) }}</span>
              </div>
            </div>

            <div class="info-card" v-if="solicitud.fecha_evaluacion">
              <div class="info-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 11H15M9 15H15M17 21L20 18L17 15M3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V12.5" stroke="currentColor" stroke-width="2" fill="none"/>
                </svg>
              </div>
              <div class="info-content">
                <span class="info-label">Fecha de Evaluación</span>
                <span class="info-value">{{ formatDateLong(solicitud.fecha_evaluacion) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Artículos Incluidos -->
        <div class="articulos-section">
          <div class="section-header">
            <h2>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
              </svg>
              Artículos Incluidos
              <span class="items-count" v-if="solicitud.articulos">
                ({{ solicitud.articulos.length }} {{ solicitud.articulos.length === 1 ? 'artículo' : 'artículos' }})
              </span>
            </h2>
          </div>

          <div class="articulos-grid" v-if="solicitud.articulos && solicitud.articulos.length > 0">
            <div v-for="articulo in solicitud.articulos" :key="articulo.id_articulo" class="articulo-card">
              <div class="articulo-header">
                <div class="articulo-tipo">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                    <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  {{ articulo.tipo_articulo?.nombre || 'Artículo' }}
                </div>
                <div class="articulo-estado" :class="`estado-${articulo.estado_fisico?.toLowerCase()}`">
                  {{ formatearEstadoFisico(articulo.estado_fisico) }}
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
                  <div class="detail-row" v-if="articulo.valor_estimado_cliente">
                    <span class="detail-label">Valor Estimado:</span>
                    <span class="detail-value currency">{{ formatCurrency(articulo.valor_estimado_cliente) }}</span>
                  </div>
                </div>

                <div class="articulo-specs" v-if="articulo.especificaciones_tecnicas">
                  <h5>Especificaciones Técnicas:</h5>
                  <p>{{ articulo.especificaciones_tecnicas }}</p>
                </div>

                <!-- Media (Fotos y Documentos) -->
                <div class="articulo-media" v-if="articulo.documentos && articulo.documentos.length > 0">
                  
                  <!-- Fotos -->
                  <div class="media-section" v-if="obtenerFotos(articulo.documentos).length > 0">
                    <div class="media-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="2"/>
                        <polyline points="21,15 16,10 5,21" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Fotos ({{ obtenerFotos(articulo.documentos).length }})
                    </div>
                    <div class="fotos-grid">
                      <div 
                        v-for="(foto, index) in obtenerFotos(articulo.documentos)" 
                        :key="index" 
                        class="foto-item"
                        @click="abrirVisualizadorImagen(foto, obtenerFotos(articulo.documentos))"
                      >
                        <img 
                          :src="construirUrlArchivo(foto.ruta_archivo)" 
                          :alt="foto.nombre_original"
                          @error="manejarErrorImagen"
                        />
                        <div class="foto-overlay">
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                            <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Documentos -->
                  <div class="media-section" v-if="obtenerDocumentos(articulo.documentos).length > 0">
                    <div class="media-title">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                        <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      Documentos ({{ obtenerDocumentos(articulo.documentos).length }})
                    </div>
                    <div class="documentos-list">
                      <div 
                        v-for="(documento, index) in obtenerDocumentos(articulo.documentos)" 
                        :key="index" 
                        class="documento-item"
                        @click="abrirDocumento(documento)"
                      >
                        <div class="documento-icon">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2Z" stroke="currentColor" stroke-width="2" fill="none"/>
                            <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                        <div class="documento-info">
                          <div class="documento-nombre">{{ documento.nombre_original }}</div>
                          <div class="documento-tipo">{{ obtenerTipoDocumento(documento.tipo_mime) }}</div>
                          <div class="documento-tamaño" v-if="documento.tamaño">{{ formatFileSize(documento.tamaño) }}</div>
                        </div>
                        <div class="documento-actions">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M18 13V19C18 20.1 17.1 21 16 21H5C3.9 21 3 20.1 3 19V8C3 6.9 3.9 6 5 6H11" stroke="currentColor" stroke-width="2"/>
                            <path d="M15 3H21V9" stroke="currentColor" stroke-width="2"/>
                            <path d="M10 14L21 3" stroke="currentColor" stroke-width="2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <span class="action-description">Cancela esta solicitud antes de que sea evaluada</span>
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
                  <span class="action-description">Procede con la aceptación del préstamo</span>
                </div>
              </button>
            </template>

            <!-- Acción universal: Nueva solicitud -->
            <template v-if="['Rechazada', 'Completada'].includes(solicitud.estado)">
              <button @click="crearNuevaSolicitud" class="action-button primary">
                <div class="action-icon">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <line x1="12" y1="5" x2="12" y2="19" stroke="currentColor" stroke-width="2"/>
                    <line x1="5" y1="12" x2="19" y2="12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="action-content">
                  <span class="action-title">Nueva Solicitud</span>
                  <span class="action-description">Crear una nueva solicitud de empeño</span>
                </div>
              </button>
            </template>

            <!-- Botón universal: Volver al inicio -->
            <button @click="volverAlInicio" class="action-button secondary">
              <div class="action-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M3 9L12 2L21 9V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9Z" stroke="currentColor" stroke-width="2"/>
                  <polyline points="9,22 9,12 15,12 15,22" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="action-content">
                <span class="action-title">Volver al Panel</span>
                <span class="action-description">Regresar a la lista de solicitudes</span>
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
          <h3>Cancelar Solicitud</h3>
          <button @click="cerrarConfirmacionCancelacion" class="modal-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
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

    <!-- MODAL VISUALIZADOR DE IMÁGENES -->
    <div class="modal-overlay" v-if="imagenVisualizando" @click="cerrarVisualizadorImagen">
      <div class="image-viewer" @click.stop>
        <div class="viewer-header">
          <div class="viewer-title">
            <h3>{{ tituloImagenVisualizando }}</h3>
            <span class="image-counter">{{ indiceImagenActual + 1 }} de {{ imagenesVisualizando.length }}</span>
          </div>
          <button @click="cerrarVisualizadorImagen" class="viewer-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="viewer-content">
          <button 
            v-if="imagenesVisualizando.length > 1"
            @click="imagenAnterior" 
            class="viewer-nav prev"
            :disabled="indiceImagenActual === 0"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="15,18 9,12 15,6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
          
          <div class="image-container">
            <img 
              :src="construirUrlArchivo(imagenVisualizando.ruta_archivo)" 
              :alt="tituloImagenVisualizando"
              @error="manejarErrorImagen"
            />
          </div>
          
          <button 
            v-if="imagenesVisualizando.length > 1"
            @click="imagenSiguiente" 
            class="viewer-nav next"
            :disabled="indiceImagenActual === imagenesVisualizando.length - 1"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <polyline points="9,18 15,12 9,6" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="viewer-footer" v-if="imagenesVisualizando.length > 1">
          <div class="thumbnails">
            <button 
              v-for="(imagen, index) in imagenesVisualizando" 
              :key="index"
              @click="cambiarImagen(index)"
              class="thumbnail"
              :class="{ active: index === indiceImagenActual }"
            >
              <img 
                :src="construirUrlArchivo(imagen.ruta_archivo)" 
                :alt="`Miniatura ${index + 1}`"
                @error="manejarErrorImagen"
              />
            </button>
          </div>
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
const config = useRuntimeConfig()

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

// Visualizador de imágenes
const imagenVisualizando = ref(null)
const imagenesVisualizando = ref([])
const indiceImagenActual = ref(0)
const tituloImagenVisualizando = ref('')

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

const formatFileSize = (bytes) => {
  if (!bytes) return ''
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
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

const obtenerTipoDocumento = (tipoMime) => {
  const tipos = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'text/plain': 'Texto',
    'image/jpeg': 'Imagen',
    'image/jpg': 'Imagen',
    'image/png': 'Imagen'
  }
  return tipos[tipoMime] || 'Documento'
}

const construirUrlArchivo = (rutaArchivo) => {
  if (!rutaArchivo) return '/images/placeholder.jpg'
  
  // Si ya es una URL completa, devolverla tal como está
  if (rutaArchivo.startsWith('http')) {
    return rutaArchivo
  }
  
  // Construir URL con la base del API
  const baseUrl = config.public.apiBase.replace('/api', '')
  return `${baseUrl}${rutaArchivo}`
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

// ===== MÉTODOS DE GESTIÓN DE ARCHIVOS =====
const manejarErrorImagen = (event) => {
  event.target.src = '/images/error-image.svg'
  console.warn('Error cargando imagen:', event.target.src)
}

const obtenerFotos = (documentos) => {
  if (!documentos || !Array.isArray(documentos)) return []
  return documentos.filter(doc => 
    doc.tipo_mime && doc.tipo_mime.startsWith('image/')
  )
}

const obtenerDocumentos = (documentos) => {
  if (!documentos || !Array.isArray(documentos)) return []
  return documentos.filter(doc => 
    doc.tipo_mime && !doc.tipo_mime.startsWith('image/')
  )
}

const abrirVisualizadorImagen = (imagen, todasLasImagenes) => {
  imagenVisualizando.value = imagen
  imagenesVisualizando.value = todasLasImagenes || [imagen]
  indiceImagenActual.value = todasLasImagenes ? todasLasImagenes.findIndex(img => img === imagen) : 0
  tituloImagenVisualizando.value = imagen.nombre_original || 'Imagen del artículo'
}

const cerrarVisualizadorImagen = () => {
  imagenVisualizando.value = null
  imagenesVisualizando.value = []
  indiceImagenActual.value = 0
  tituloImagenVisualizando.value = ''
}

const imagenAnterior = () => {
  if (indiceImagenActual.value > 0) {
    indiceImagenActual.value--
    imagenVisualizando.value = imagenesVisualizando.value[indiceImagenActual.value]
  }
}

const imagenSiguiente = () => {
  if (indiceImagenActual.value < imagenesVisualizando.value.length - 1) {
    indiceImagenActual.value++
    imagenVisualizando.value = imagenesVisualizando.value[indiceImagenActual.value]
  }
}

const cambiarImagen = (index) => {
  indiceImagenActual.value = index
  imagenVisualizando.value = imagenesVisualizando.value[index]
}

const abrirDocumento = (documento) => {
  const url = construirUrlArchivo(documento.ruta_archivo)
  window.open(url, '_blank')
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
      id: solicitud.value.id_solicitud,
      numero: solicitud.value.numero,
      motivo: motivoCancelacion.value
    })
    
    const response = await cancelarSolicitud(
      solicitud.value.id_solicitud,
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
/* ===== VARIABLES CSS CON PALETA CORPORATIVA ===== */
:root {
  /* Colores principales del logo */
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  
  /* Colores complementarios */
  --color-dorado-vintage: #D4AF37;
  --color-dorado-claro: #F4D03F;
  --color-rojo-granate: #8B0000;
  --color-marron-chocolate: #3E2723;
  --color-verde-bosque: #1B4332;
}

/* ===== ESTILOS BASE ===== */
.detalle-solicitud-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
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
  color: var(--color-blanco-perla);
}

.loading-spinner {
  margin-bottom: 1.5rem;
}

.loading-spinner svg {
  color: var(--color-dorado-vintage);
}

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--color-rojo-granate);
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-blanco-perla);
  margin-bottom: 0.5rem;
}

.error-container p {
  color: var(--color-gris-acero);
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
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(26, 26, 26, 0.2);
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-navigation {
  padding: 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
  transform: translateX(-2px);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e5e7eb;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.5rem;
}

.header-info h1 svg {
  color: var(--color-dorado-vintage);
}

.header-info p {
  color: var(--color-gris-acero);
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
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-marron-chocolate);
}

.status-pendiente .status-dot {
  background: var(--color-dorado-vintage);
}

.status-evaluando {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: var(--color-azul-marino);
}

.status-evaluando .status-dot {
  background: var(--color-azul-marino);
}

.status-aprobada {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--color-verde-bosque);
}

.status-aprobada .status-dot {
  background: var(--color-verde-bosque);
}

.status-rechazada {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: var(--color-rojo-granate);
}

.status-rechazada .status-dot {
  background: var(--color-rojo-granate);
}

/* ===== PROGRESS STEPS ===== */
.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 2rem;
  position: relative;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50px;
  left: 20%;
  right: 20%;
  height: 2px;
  background: linear-gradient(90deg, var(--color-gris-acero), var(--color-dorado-vintage));
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
  position: relative;
  z-index: 2;
  background: var(--color-blanco-perla);
  padding: 0 1rem;
  text-align: center;
  flex: 1;
}

.step-number {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid var(--color-gris-acero);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 1rem;
  color: var(--color-gris-acero);
  background: var(--color-blanco-perla);
  transition: all 0.3s ease;
}

.step.active .step-number {
  border-color: var(--color-dorado-vintage);
  color: var(--color-dorado-vintage);
}

.step.completed .step-number {
  background: var(--color-verde-bosque);
  border-color: var(--color-verde-bosque);
  color: var(--color-blanco-perla);
}

.step.rejected .step-number {
  background: var(--color-rojo-granate);
  border-color: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.step-label {
  font-weight: 500;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.step.active .step-label {
  color: var(--color-dorado-vintage);
  font-weight: 600;
}

.step.completed .step-label {
  color: var(--color-verde-bosque);
  font-weight: 600;
}

.step.rejected .step-label {
  color: var(--color-rojo-granate);
  font-weight: 600;
}

.step-date {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
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
  border-left-color: var(--color-rojo-granate);
}

.approval-alert {
  background: linear-gradient(135deg, #f0fdf4, #dcfce7);
  border-left-color: var(--color-verde-bosque);
}

.rejection-icon {
  color: var(--color-rojo-granate);
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.approval-icon {
  color: var(--color-verde-bosque);
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
  color: var(--color-rojo-granate);
}

.approval-content h3 {
  color: var(--color-verde-bosque);
}

.rejection-content p,
.approval-content p {
  margin: 0;
  line-height: 1.6;
  font-size: 0.875rem;
}

.rejection-content p {
  color: var(--color-marron-chocolate);
}

.approval-content p {
  color: var(--color-verde-bosque);
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
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: 0 15px 35px rgba(26, 26, 26, 0.2);
  overflow: hidden;
}

.section-header {
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.section-header h2 svg {
  color: var(--color-dorado-vintage);
}

.items-count {
  font-size: 0.875rem;
  font-weight: 400;
  color: var(--color-gris-acero);
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
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  transition: all 0.3s ease;
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
  border-color: var(--color-dorado-vintage);
}

.info-icon {
  padding: 1rem;
  background: var(--color-dorado-vintage);
  border-radius: 12px;
  color: var(--color-blanco-perla);
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
  color: var(--color-gris-acero);
}

.info-value {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

/* ===== ARTÍCULOS ===== */
.articulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.articulo-card {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  background: var(--color-blanco-perla);
}

.articulo-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
  border-color: var(--color-dorado-vintage);
}

.articulo-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-bottom: 1px solid #e5e7eb;
}

.articulo-tipo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-dorado-vintage);
}

.articulo-estado {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 500;
}

.estado-excelente {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  color: var(--color-verde-bosque);
}

.estado-bueno {
  background: linear-gradient(135deg, #dbeafe, #bfdbfe);
  color: var(--color-azul-marino);
}

.estado-regular {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-marron-chocolate);
}

.estado-malo {
  background: linear-gradient(135deg, #fee2e2, #fecaca);
  color: var(--color-rojo-granate);
}

.articulo-content {
  padding: 1.5rem;
}

.articulo-titulo {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
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
  color: var(--color-gris-acero);
  font-weight: 500;
}

.detail-value {
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.detail-value.currency {
  color: var(--color-dorado-vintage);
  font-weight: 700;
}

.articulo-specs {
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  margin-bottom: 1.5rem;
}

.articulo-specs h5 {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0 0 0.5rem 0;
}

.articulo-specs p {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
  margin: 0;
  line-height: 1.5;
}

/* ===== MEDIA (FOTOS Y DOCUMENTOS) ===== */
.articulo-media {
  margin-top: 1rem;
}

.media-section {
  margin-bottom: 1.5rem;
}

.media-section:last-child {
  margin-bottom: 0;
}

.media-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 1rem;
}

.media-title svg {
  color: var(--color-dorado-vintage);
}

/* ===== GALERÍA DE FOTOS ===== */
.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 0.75rem;
}

.foto-item {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
}

.foto-item:hover {
  transform: scale(1.05);
  border-color: var(--color-dorado-vintage);
}

.foto-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.foto-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: var(--color-blanco-perla);
}

.foto-item:hover .foto-overlay {
  opacity: 1;
}

/* ===== LISTA DE DOCUMENTOS ===== */
.documentos-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.documento-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-radius: 8px;
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.3s ease;
}

.documento-item:hover {
  transform: translateX(4px);
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
}

.documento-icon {
  padding: 0.75rem;
  background: var(--color-azul-marino);
  border-radius: 8px;
  color: var(--color-blanco-perla);
  flex-shrink: 0;
}

.documento-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.documento-nombre {
  font-weight: 600;
  color: var(--color-negro-carbon);
  font-size: 0.875rem;
}

.documento-tipo {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  font-weight: 500;
}

.documento-tamaño {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

.documento-actions {
  color: var(--color-dorado-vintage);
  flex-shrink: 0;
}

/* ===== ESTADO VACÍO ===== */
.empty-articulos {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  text-align: center;
  color: var(--color-gris-acero);
}

.empty-articulos svg {
  margin-bottom: 1rem;
  color: var(--color-gris-acero);
  opacity: 0.5;
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
  background: var(--color-blanco-perla);
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
}

.action-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
}

.action-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.action-button.primary {
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.action-button.primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #fde68a, #fcd34d);
}

.action-button.secondary {
  border-color: var(--color-gris-acero);
  background: linear-gradient(135deg, var(--color-blanco-perla), #f3f4f6);
}

.action-button.secondary:hover:not(:disabled) {
  background: linear-gradient(135deg, #f3f4f6, #e5e7eb);
}

.action-button.success {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.action-button.success:hover:not(:disabled) {
  background: linear-gradient(135deg, #a7f3d0, #6ee7b7);
}

.action-button.danger {
  border-color: var(--color-rojo-granate);
  background: linear-gradient(135deg, #fee2e2, #fecaca);
}

.action-button.danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #fecaca, #fca5a5);
}

.action-icon {
  padding: 1rem;
  border-radius: 12px;
  flex-shrink: 0;
}

.action-button.primary .action-icon {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
}

.action-button.secondary .action-icon {
  background: var(--color-gris-acero);
  color: var(--color-blanco-perla);
}

.action-button.success .action-icon {
  background: var(--color-verde-bosque);
  color: var(--color-blanco-perla);
}

.action-button.danger .action-icon {
  background: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.action-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.action-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.action-description {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

/* ===== MODAL ===== */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  box-shadow: 0 25px 50px rgba(26, 26, 26, 0.25);
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
  border-bottom: 1px solid #e5e7eb;
}

.modal-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
}

.modal-close {
  background: none;
  border: none;
  color: var(--color-gris-acero);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.modal-close:hover {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.modal-content {
  padding: 2rem;
}

.warning-icon {
  text-align: center;
  margin-bottom: 1.5rem;
  color: var(--color-dorado-vintage);
}

.warning-content h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 1rem;
  text-align: center;
}

.warning-content p {
  color: var(--color-gris-acero);
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
  color: var(--color-negro-carbon);
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
  transition: border-color 0.3s ease;
}

.motivo-section textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
}

.modal-footer {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
}

/* ===== VISUALIZADOR DE IMÁGENES ===== */
.image-viewer {
  background: var(--color-negro-carbon);
  border-radius: 16px;
  max-width: 95vw;
  max-height: 95vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.viewer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  background: var(--color-blanco-perla);
  border-bottom: 1px solid #e5e7eb;
}

.viewer-title h3 {
  color: var(--color-negro-carbon);
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0;
}

.image-counter {
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.viewer-close {
  background: none;
  border: none;
  color: var(--color-gris-acero);
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.viewer-close:hover {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.viewer-content {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  position: relative;
  min-height: 400px;
  background: var(--color-negro-carbon);
}

.image-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  max-height: 70vh;
}

.image-container img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 8px;
}

.viewer-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(245, 245, 245, 0.9);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--color-negro-carbon);
  transition: all 0.3s ease;
}

.viewer-nav:hover:not(:disabled) {
  background: var(--color-blanco-perla);
  transform: translateY(-50%) scale(1.1);
}

.viewer-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.viewer-nav.prev {
  left: 1rem;
}

.viewer-nav.next {
  right: 1rem;
}

.viewer-footer {
  padding: 1rem;
  background: var(--color-blanco-perla);
  border-top: 1px solid #e5e7eb;
}

.thumbnails {
  display: flex;
  gap: 0.5rem;
  justify-content: center;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumbnail {
  width: 60px;
  height: 60px;
  border: 2px solid transparent;
  border-radius: 6px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.thumbnail.active {
  border-color: var(--color-dorado-vintage);
}

.thumbnail:hover {
  transform: scale(1.05);
  border-color: var(--color-dorado-vintage);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: var(--color-blanco-perla);
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-dorado-claro);
  transform: translateY(-1px);
}

.btn-secondary {
  background: var(--color-gris-acero);
  color: var(--color-blanco-perla);
}

.btn-secondary:hover:not(:disabled) {
  background: var(--color-negro-carbon);
  transform: translateY(-1px);
}

.btn-danger {
  background: var(--color-rojo-granate);
  color: var(--color-blanco-perla);
}

.btn-danger:hover:not(:disabled) {
  background: #dc2626;
  transform: translateY(-1px);
}

.btn-primary:disabled,
.btn-secondary:disabled,
.btn-danger:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
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
  box-shadow: 0 25px 50px rgba(26, 26, 26, 0.25);
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
  background: linear-gradient(135deg, rgba(27, 67, 50, 0.95), rgba(5, 150, 105, 0.95));
  color: var(--color-blanco-perla);
}

.notification-error {
  background: linear-gradient(135deg, rgba(139, 0, 0, 0.95), rgba(220, 38, 38, 0.95));
  color: var(--color-blanco-perla);
}

.notification-info {
  background: linear-gradient(135deg, rgba(44, 62, 80, 0.95), rgba(59, 130, 246, 0.95));
  color: var(--color-blanco-perla);
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
  
  .fotos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
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
  
  .image-viewer {
    max-width: 100vw;
    max-height: 100vh;
    border-radius: 0;
  }
  
  .viewer-nav {
    width: 40px;
    height: 40px;
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
  
  .fotos-grid {
    grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  }
}
</style>