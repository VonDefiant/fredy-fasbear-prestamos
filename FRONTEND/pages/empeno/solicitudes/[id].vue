<template>
  <div class="detalle-solicitud-page">
    <div class="loading-container" v-if="loading">
      <div class="loading-spinner">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="spinning">
          <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2" fill="none"/>
        </svg>
      </div>
      <p>Cargando detalle de solicitud...</p>
    </div>

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

    <div class="detalle-container" v-else-if="solicitud">
      
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

        <div class="progress-steps">
          <div class="step" :class="{ active: true, completed: ['Evaluando', 'Aprobada', 'Rechazada'].includes(solicitud.estado) }">
            <span class="step-number">1</span>
            <span class="step-label">Solicitud Enviada</span>
            <span class="step-date">{{ formatDate(solicitud.fechaSolicitud) }}</span>
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
          </p>
          <p v-if="solicitud.observaciones">
            <strong>Observaciones:</strong> {{ solicitud.observaciones }}
          </p>
          
          <div class="approval-actions">
            <button 
              @click="solicitarPrestamo" 
              :disabled="loadingAction"
              class="btn-solicitar-prestamo"
            >
              <div class="btn-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 10h20" stroke="currentColor" stroke-width="2"/>
                  <circle cx="7" cy="15" r="1" fill="currentColor"/>
                </svg>
              </div>
              <div class="btn-content">
                <span class="btn-title">{{ loadingAction ? 'Procesando...' : 'Solicitar Préstamo' }}</span>
                <span class="btn-subtitle">Continuar con la aceptación</span>
              </div>
              <div class="btn-arrow">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
            </button>
            
            <div v-if="solicitud.prestamo?.montoSolicitado" class="info-monto-aprobado">
              <div class="info-item">
                <span class="info-label">Monto aprobado:</span>
                <span class="info-valor">Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
              </div>
              <div class="info-item" v-if="solicitud.prestamo?.plazoMeses">
                <span class="info-label">Plazo:</span>
                <span class="info-valor">{{ solicitud.prestamo.plazoMeses }} meses</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="pestanas-navegacion">
        <button 
          @click="pestanaActiva = 'informacion'"
          :class="['btn-pestana', { active: pestanaActiva === 'informacion' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información General
        </button>

        <button 
          @click="pestanaActiva = 'financiero'"
          :class="['btn-pestana', { active: pestanaActiva === 'financiero' }]"
          v-if="tieneInformacionFinanciera"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Detalles Financieros
          <span v-if="solicitud.prestamo?.montoSolicitado" class="contador-badge">Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
        </button>
        
        <button 
          @click="pestanaActiva = 'archivos'"
          :class="['btn-pestana', { active: pestanaActiva === 'archivos' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M21.44 11.05L12.25 20.24C11.84 20.65 11.84 21.28 12.25 21.69C12.66 22.1 13.29 22.1 13.7 21.69L22.89 12.5C24.46 10.93 24.46 8.37 22.89 6.8C21.32 5.23 18.76 5.23 17.19 6.8L7.71 16.28C6.53 17.46 6.53 19.34 7.71 20.52C8.89 21.7 10.77 21.7 11.95 20.52L20.83 11.64" stroke="currentColor" stroke-width="2"/>
          </svg>
          Archivos Adjuntos
          <span v-if="archivos.length" class="contador-badge">{{ archivos.length }}</span>
        </button>
      </div>

      <div class="pestanas-contenido">
        
        <div v-if="pestanaActiva === 'informacion'" class="detalle-content">
          
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
                    <div class="tipo-icono">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </div>
                    <span>{{ articulo.tipo_articulo?.nombre || 'Artículo' }}</span>
                  </div>
                  <div class="articulo-estado" :class="`estado-${articulo.estado_fisico?.toLowerCase()}`">
                    {{ formatearEstadoFisico(articulo.estado_fisico) }}
                  </div>
                </div>

                <div class="articulo-content">
                  <div class="articulo-descripcion">
                    <h4>{{ articulo.descripcion || 'Sin descripción' }}</h4>
                  </div>

                  <div v-if="articulo.valor_estimado_cliente" class="valoracion-cliente">
                    <div class="valoracion-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                        <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>Valoración Estimada del Cliente</span>
                    </div>
                    <div class="valoracion-monto">{{ formatCurrency(articulo.valor_estimado_cliente) }}</div>
                  </div>

                  <div class="articulo-detalles">
                    <div class="detalles-grid">
                      <div class="detalle-item" v-if="articulo.marca">
                        <span class="detalle-label">Marca:</span>
                        <span class="detalle-valor">{{ articulo.marca }}</span>
                      </div>
                      <div class="detalle-item" v-if="articulo.modelo">
                        <span class="detalle-label">Modelo:</span>
                        <span class="detalle-valor">{{ articulo.modelo }}</span>
                      </div>
                      <div class="detalle-item" v-if="articulo.serie">
                        <span class="detalle-label">Serie:</span>
                        <span class="detalle-valor">{{ articulo.serie }}</span>
                      </div>
                      <div class="detalle-item" v-if="articulo.color">
                        <span class="detalle-label">Color:</span>
                        <div class="color-info">
                          <span class="color-muestra" :style="{ backgroundColor: getColorHex(articulo.color) }"></span>
                          <span class="detalle-valor">{{ articulo.color }}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-if="articulo.especificaciones_tecnicas" class="especificaciones-section">
                    <div class="specs-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                        <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <span>Especificaciones Técnicas</span>
                    </div>
                    <div class="specs-content">
                      <pre>{{ articulo.especificaciones_tecnicas }}</pre>
                    </div>
                  </div>

                  <div v-if="articulo.avaluo" class="avaluo-section">
                    <div class="avaluo-header">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11H15M9 15H15M17 21L20 18L17 15M3 19V5C3 3.89 3.89 3 5 3H19C20.11 3 21 3.89 21 5V12.5" stroke="currentColor" stroke-width="2" fill="none"/>
                      </svg>
                      <span>Evaluación Profesional</span>
                    </div>
                    <div class="avaluo-grid">
                      <div class="avaluo-item">
                        <span class="avaluo-label">Valor Comercial:</span>
                        <span class="avaluo-valor comercial">{{ formatCurrency(articulo.avaluo.valorComercial) }}</span>
                      </div>
                      <div class="avaluo-item">
                        <span class="avaluo-label">Porcentaje Aplicado:</span>
                        <span class="avaluo-valor porcentaje">{{ articulo.avaluo.porcentajeAplicado }}%</span>
                      </div>
                      <div class="avaluo-item">
                        <span class="avaluo-label">Monto Máximo de Préstamo:</span>
                        <span class="avaluo-valor prestamo">{{ formatCurrency(articulo.avaluo.montoPrestamo) }}</span>
                      </div>
                      <div v-if="articulo.avaluo.observaciones" class="avaluo-observaciones">
                        <span class="avaluo-label">Observaciones del Evaluador:</span>
                        <p class="avaluo-obs-text">{{ articulo.avaluo.observaciones }}</p>
                      </div>
                    </div>
                  </div>

                  <div class="articulo-media" v-if="articulo.documentos && articulo.documentos.length > 0">
                    
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

        <div v-if="pestanaActiva === 'financiero'" class="detalle-content">
          
          <div class="financiero-section">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                </svg>
                Resumen Financiero
              </h2>
            </div>

            <div class="financiero-resumen">
              <div class="montos-principales">
                <div class="monto-card principal" v-if="solicitud.prestamo?.montoSolicitado">
                  <div class="monto-icono">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                      <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="monto-info">
                    <span class="monto-label">Monto Solicitado</span>
                    <span class="monto-valor">{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
                  </div>
                </div>

                <div class="monto-card" v-if="solicitud.prestamo?.tasaInteres">
                  <div class="monto-icono">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                      <path d="M8 14S9.5 16 12 16S16 14 16 14" stroke="currentColor" stroke-width="2"/>
                      <line x1="9" y1="9" x2="9.01" y2="9" stroke="currentColor" stroke-width="2"/>
                      <line x1="15" y1="9" x2="15.01" y2="9" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="monto-info">
                    <span class="monto-label">Tasa de Interés</span>
                    <span class="monto-valor">{{ solicitud.prestamo.tasaInteres }}% mensual</span>
                  </div>
                </div>

                <div class="monto-card destacada" v-if="solicitud.prestamo?.totalAPagar">
                  <div class="monto-icono">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <path d="M16 4H18C19.1 4 20 4.9 20 6V18C20 19.1 19.1 20 18 20H6C4.9 20 4 19.1 4 18V6C4 4.9 4.9 4 6 4H8" stroke="currentColor" stroke-width="2"/>
                      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" stroke="currentColor" stroke-width="2"/>
                      <path d="M9 14L11 16L15 12" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="monto-info">
                    <span class="monto-label">Total a Pagar</span>
                    <span class="monto-valor">{{ formatCurrency(solicitud.prestamo.totalAPagar) }}</span>
                  </div>
                </div>

                <div class="monto-card" v-if="solicitud.prestamo?.modalidadPago">
                  <div class="monto-icono">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                      <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                      <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="monto-info">
                    <span class="monto-label">Modalidad de Pago</span>
                    <span class="monto-valor">{{ formatModalidadPago(solicitud.prestamo.modalidadPago) }}</span>
                  </div>
                </div>
              </div>

              <div v-if="solicitud.prestamo?.modalidadPago !== 'contado' && planPagosCalculado.length > 0" class="plan-pagos-section">
                <div class="plan-header">
                  <h3>Plan de Pagos</h3>
                  <div class="plan-resumen">
                    <span class="numero-pagos">{{ planPagosCalculado.length }} pagos</span>
                    <span class="monto-por-pago">{{ formatCurrency(montoPorPago) }} cada {{ frequenciaPago }}</span>
                  </div>
                </div>

                <div class="tabla-pagos">
                  <div class="tabla-header">
                    <div class="col-cuota">Cuota</div>
                    <div class="col-fecha">Fecha</div>
                    <div class="col-capital">Capital</div>
                    <div class="col-interes">Interés</div>
                    <div class="col-total">Total</div>
                    <div class="col-saldo">Saldo</div>
                  </div>
                  
                  <div 
                    v-for="pago in planPagosCalculado" 
                    :key="pago.numero"
                    class="tabla-row"
                    :class="{ 'row-final': pago.numero === planPagosCalculado.length }"
                  >
                    <div class="col-cuota">
                      <span class="cuota-numero">{{ pago.numero }}</span>
                    </div>
                    <div class="col-fecha">
                      <span class="fecha-corta">{{ formatDateShort(pago.fecha) }}</span>
                    </div>
                    <div class="col-capital">
                      <span class="monto capital">{{ formatCurrency(pago.capital) }}</span>
                    </div>
                    <div class="col-interes">
                      <span class="monto interes">{{ formatCurrency(pago.interes) }}</span>
                    </div>
                    <div class="col-total">
                      <span class="monto total">{{ formatCurrency(pago.totalCuota) }}</span>
                    </div>
                    <div class="col-saldo">
                      <span class="monto saldo" :class="{ 'saldo-cero': pago.saldoPendiente === 0 }">
                        {{ formatCurrency(pago.saldoPendiente) }}
                      </span>
                    </div>
                  </div>
                </div>

                <div class="plan-totales">
                  <div class="total-item">
                    <span class="total-label">Total Capital:</span>
                    <span class="total-valor">{{ formatCurrency(solicitud.prestamo?.montoSolicitado) }}</span>
                  </div>
                  <div class="total-item">
                    <span class="total-label">Total Intereses:</span>
                    <span class="total-valor">{{ formatCurrency(totalIntereses) }}</span>
                  </div>
                  <div class="total-item destacado">
                    <span class="total-label">Total a Pagar:</span>
                    <span class="total-valor">{{ formatCurrency(solicitud.prestamo?.totalAPagar) }}</span>
                  </div>
                </div>
              </div>

              <div class="info-adicional" v-if="solicitud.prestamo?.plazoMeses">
                <div class="info-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                    <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                    <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>Plazo: {{ solicitud.prestamo.plazoMeses }} {{ solicitud.prestamo.plazoMeses === 1 ? 'mes' : 'meses' }}</span>
                </div>
                
                <div class="info-item" v-if="fechaVencimientoCalculada">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  <span>Vencimiento: {{ formatDateLong(fechaVencimientoCalculada) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="pestanaActiva === 'archivos'" class="archivos-pestana">
          <ArchivosAdjuntos 
            :archivos="archivos"
            :loading="loadingArchivos"
          /> 
          <div v-if="!loadingArchivos && archivos.length === 0" class="archivos-estado-vacio">
            <div class="estado-vacio-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="icono-vacio">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#9CA3AF" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="#9CA3AF" stroke-width="2"/>
              </svg>
              <h4>No hay archivos adjuntos</h4>
              <p>Esta solicitud no tiene documentos o fotos adjuntas.</p>
              
              <button @click="refrescarArchivos" class="btn-refresh">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21C9.5 21 7.26 19.81 5.77 17.96" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 12L6 9L9 12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Refrescar archivos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

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
import ArchivosAdjuntos from '~/pages/empeno/solicitudes/ArchivosAdjuntos.vue'

definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const { user } = useAuth()
const { api } = useApi()
const { 
  obtenerDetalleSolicitud, 
  cancelarSolicitud,
  obtenerArchivosAdjuntos
} = useSolicitudes()
const config = useRuntimeConfig()

useHead({
  title: 'Detalle de Solicitud - Mis Empéños',
  meta: [
    { name: 'description', content: 'Ver detalle completo de tu solicitud de empeño' }
  ]
})

const loading = ref(true)
const error = ref(null)
const solicitud = ref(null)
const loadingAction = ref(false)
const loadingCancelacion = ref(false)

const archivos = ref([])
const loadingArchivos = ref(false)

const pestanaActiva = ref('informacion')

const mostrarConfirmacionCancelacion = ref(false)
const motivoCancelacion = ref('')

const imagenVisualizando = ref(null)
const imagenesVisualizando = ref([])
const indiceImagenActual = ref(0)
const tituloImagenVisualizando = ref('')

const notification = ref({
  show: false,
  type: 'success',
  message: ''
})

const solicitudId = computed(() => {
  return parseInt(route.params.id)
})

const tieneInformacionFinanciera = computed(() => {
  return solicitud.value && solicitud.value.prestamo && (
    solicitud.value.prestamo.montoSolicitado || 
    solicitud.value.prestamo.tasaInteres || 
    solicitud.value.prestamo.modalidadPago || 
    solicitud.value.prestamo.plazoMeses
  )
})

const planPagosCalculado = computed(() => {
  if (!solicitud.value || 
      !solicitud.value.prestamo || 
      !solicitud.value.prestamo.planPagos ||
      !Array.isArray(solicitud.value.prestamo.planPagos)) {
    return []
  }

  return solicitud.value.prestamo.planPagos.map(pago => ({
    numero: pago.numeroPago,
    fecha: new Date(pago.fechaPago),
    capital: pago.capital,
    interes: pago.interes,
    totalCuota: pago.montoPago,
    saldoPendiente: pago.saldoPendiente,
    comision: pago.comision || 0
  }))
})

const montoPorPago = computed(() => {
  if (solicitud.value?.prestamo?.resumenFinanciero?.montoPorPago) {
    return solicitud.value.prestamo.resumenFinanciero.montoPorPago
  }
  return 0
})

const frequenciaPago = computed(() => {
  if (!solicitud.value?.prestamo?.modalidadPago) return ''
  
  const frecuencias = {
    'mensual': 'mes',
    'quincenal': '15 días',
    'semanal': 'semana',
    'contado': 'pago único'
  }
  
  return frecuencias[solicitud.value.prestamo.modalidadPago] || ''
})

const totalIntereses = computed(() => {
  if (solicitud.value?.prestamo?.resumenFinanciero?.interesTotal) {
    return solicitud.value.prestamo.resumenFinanciero.interesTotal
  }
  return 0
})

const fechaVencimientoCalculada = computed(() => {
  if (!solicitud.value?.fechaSolicitud || !solicitud.value?.prestamo?.plazoMeses) return null
  
  const fechaInicio = new Date(solicitud.value.fechaSolicitud)
  fechaInicio.setMonth(fechaInicio.getMonth() + parseInt(solicitud.value.prestamo.plazoMeses))
  
  return fechaInicio
})

const cargarArchivosAdjuntos = async () => {
  try {
    loadingArchivos.value = true
    
    if (!solicitudId.value || isNaN(solicitudId.value)) {
      return
    }
    
    const response = await obtenerArchivosAdjuntos(solicitudId.value)
    
    if (response.success && response.data) {
      const { archivos: archivosPorTipo } = response.data
      const todosLosArchivos = []
      
      if (archivosPorTipo.fotos) {
        archivosPorTipo.fotos.forEach(foto => {
          todosLosArchivos.push({
            id: foto.id,
            tipoDocumento: foto.tipo,
            nombreArchivo: foto.nombreArchivo,
            rutaArchivo: foto.rutaArchivo,
            fechaSubida: foto.fechaSubida,
            tamanoArchivo: foto.tamanoArchivo,
            tipoMime: foto.tipoMime,
            urlDescarga: foto.urlDescarga
          })
        })
      }
      
      if (archivosPorTipo.documentos) {
        archivosPorTipo.documentos.forEach(doc => {
          todosLosArchivos.push({
            id: doc.id,
            tipoDocumento: doc.tipo,
            nombreArchivo: doc.nombreArchivo,
            rutaArchivo: doc.rutaArchivo,
            fechaSubida: doc.fechaSubida,
            tamanoArchivo: doc.tamanoArchivo,
            tipoMime: doc.tipoMime,
            urlDescarga: doc.urlDescarga
          })
        })
      }
      
      if (archivosPorTipo.otros) {
        archivosPorTipo.otros.forEach(otro => {
          todosLosArchivos.push({
            id: otro.id,
            tipoDocumento: otro.tipo,
            nombreArchivo: otro.nombreArchivo,
            rutaArchivo: otro.rutaArchivo,
            fechaSubida: otro.fechaSubida,
            tamanoArchivo: otro.tamanoArchivo,
            tipoMime: otro.tipoMime,
            urlDescarga: otro.urlDescarga
          })
        })
      }
      
      archivos.value = todosLosArchivos
      
    } else {
      archivos.value = []
    }
    
  } catch (err) {
    archivos.value = []
  } finally {
    loadingArchivos.value = false
  }
}

const refrescarArchivos = async () => {
  await cargarArchivosAdjuntos()
}

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0.00'
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
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

const formatDateShort = (dateString) => {
  if (!dateString) return 'Sin fecha'
  return new Date(dateString).toLocaleDateString('es-GT', {
    month: 'short',
    day: 'numeric'
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

const formatModalidadPago = (modalidad) => {
  const modalidades = {
    'contado': 'Pago al Contado',
    'mensual': 'Pagos Mensuales',
    'quincenal': 'Pagos Quincenales',
    'semanal': 'Pagos Semanales'
  }
  return modalidades[modalidad] || modalidad
}

const getColorHex = (colorName) => {
  if (!colorName) return '#CCCCCC'
  
  const colores = {
    'rojo': '#FF0000',
    'azul': '#0000FF',
    'verde': '#008000',
    'amarillo': '#FFFF00',
    'negro': '#000000',
    'blanco': '#FFFFFF',
    'gris': '#808080',
    'rosa': '#FFC0CB',
    'morado': '#800080',
    'naranja': '#FFA500',
    'plata': '#C0C0C0',
    'oro': '#FFD700',
    'bronce': '#CD7F32',
    'azul marino': '#000080',
    'verde oscuro': '#006400',
    'rojo oscuro': '#8B0000',
    'gris oscuro': '#2F2F2F',
    'gris claro': '#D3D3D3',
    'beige': '#F5F5DC',
    'café': '#A0522D',
    'marrón': '#A0522D'
  }
  
  return colores[colorName.toLowerCase()] || '#CCCCCC'
}

const obtenerTipoDocumento = (tipoMime) => {
  const tipos = {
    'application/pdf': 'PDF',
    'application/msword': 'Word',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'Word',
    'text/plain': 'Texto',
    'image/jpeg': 'Imagen',
    'image/jpg': 'Imagen',
    'image/png': 'Imagen',
    'image/gif': 'Imagen',
    'image/webp': 'Imagen'
  }
  return tipos[tipoMime] || 'Documento'
}

const construirUrlArchivo = (rutaArchivo) => {
  if (!rutaArchivo) return '/images/placeholder.jpg'
  
  if (rutaArchivo.startsWith('http')) {
    return rutaArchivo
  }
  
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

const manejarErrorImagen = (event) => {
  event.target.src = '/images/error-image.svg'
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

const cargarDetalle = async () => {
  try {
    loading.value = true
    error.value = null
    
    if (!solicitudId.value || isNaN(solicitudId.value)) {
      throw new Error('ID de solicitud inválido')
    }
    
    const response = await obtenerDetalleSolicitud(solicitudId.value)
    
    if (response.success && response.data) {
      solicitud.value = response.data
      
      useHead({
        title: `${solicitud.value.numero} - Detalle de Solicitud`,
      })
      
      await cargarArchivosAdjuntos()
      
    } else {
      throw new Error(response.message || 'No se pudo cargar el detalle')
    }
    
  } catch (err) {
    error.value = err.message || 'Error al cargar el detalle de la solicitud'
  } finally {
    loading.value = false
  }
}

const volverAlInicio = () => {
  navigateTo('/empeno')
}

const crearNuevaSolicitud = () => {
  navigateTo('/empeno?nueva=true')
}

const solicitarPrestamo = async () => {
  try {
    loadingAction.value = true
    
    await navigateTo(`/empeno/solicitudes/aceptar?id=${solicitudId.value}`)
    
  } catch (error) {
    mostrarNotificacion('Error al procesar la solicitud del préstamo', 'error')
  } finally {
    loadingAction.value = false
  }
}

const aceptarOferta = async () => {
  try {
    loadingAction.value = true
    
    navigateTo(`/empeno/solicitudes/${solicitudId.value}/aceptar`)
    
  } catch (error) {
    mostrarNotificacion('Error al procesar la aceptación', 'error')
  } finally {
    loadingAction.value = false
  }
}

const confirmarCancelacion = () => {
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
    
    const response = await cancelarSolicitud(
      solicitud.value.id_solicitud,
      motivoCancelacion.value || 'Cancelada por el usuario desde la página de detalle'
    )
    
    if (response.success) {
      mostrarNotificacion(
        `Solicitud ${solicitud.value.numero} cancelada exitosamente`, 
        'success'
      )
      
      cerrarConfirmacionCancelacion()
      await cargarDetalle()
    } else {
      throw new Error(response.message || 'Error desconocido al cancelar')
    }
    
  } catch (error) {
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

watch(() => route.params.id, (newId, oldId) => {
  if (newId && newId !== oldId) {
    cargarDetalle()
  }
})

watch(() => tieneInformacionFinanciera.value, (tieneInfo) => {
  if (tieneInfo && pestanaActiva.value === 'informacion') {
  }
})

onMounted(async () => {
  await cargarDetalle()
})

defineExpose({
  refrescarArchivos,
  cargarArchivosAdjuntos,
  cargarDetalle
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
  --border-radius: 12px;
  --shadow-card: 0 15px 35px rgba(26, 26, 26, 0.2);
  --transition: all 0.3s ease;
}

.detalle-solicitud-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem 0;
}

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

.detalle-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.detalle-header {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
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
  transition: var(--transition);
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
  transition: var(--transition);
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

.rejection-alert,
.approval-alert {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  border-radius: var(--border-radius);
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

.approval-actions {
  margin-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-solicitar-prestamo {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #059669 0%, #047857 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(5, 150, 105, 0.3);
  width: 100%;
  text-align: left;
}

.btn-solicitar-prestamo:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(5, 150, 105, 0.4);
  background: linear-gradient(135deg, #047857 0%, #065f46 100%);
}

.btn-solicitar-prestamo:active:not(:disabled) {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(5, 150, 105, 0.3);
}

.btn-solicitar-prestamo:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  flex-shrink: 0;
}

.btn-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.btn-title {
  font-size: 1rem;
  font-weight: 600;
  line-height: 1.2;
}

.btn-subtitle {
  font-size: 0.875rem;
  opacity: 0.9;
  font-weight: 400;
}

.btn-arrow {
  display: flex;
  align-items: center;
  opacity: 0.8;
  transition: transform 0.3s ease;
}

.btn-solicitar-prestamo:hover:not(:disabled) .btn-arrow {
  transform: translateX(4px);
}

.info-monto-aprobado {
  display: flex;
  gap: 1.5rem;
  padding: 1rem;
  background: rgba(16, 185, 129, 0.1);
  border-radius: 8px;
  border-left: 3px solid #10b981;
}

.info-monto-aprobado .info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-monto-aprobado .info-label {
  font-size: 0.75rem;
  color: #047857;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-monto-aprobado .info-valor {
  font-size: 1.125rem;
  font-weight: 700;
  color: #065f46;
}

.pestanas-navegacion {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0 1rem;
  border-bottom: 2px solid #e9ecef;
}

.btn-pestana {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: white;
  border: none;
  border-bottom: 3px solid transparent;
  color: var(--color-negro-carbon);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  border-radius: 8px 8px 0 0;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-pestana:hover {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  color: var(--color-negro-carbon);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.btn-pestana.active {
  color: white;
  background: var(--color-dorado-vintage);
  border-bottom-color: var(--color-dorado-vintage);
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(212, 175, 55, 0.3);
}

.contador-badge {
  background: var(--color-dorado-vintage);
  color: white;
  font-size: 0.75rem;
  font-weight: 600;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  min-width: 20px;
  text-align: center;
}

.pestanas-contenido {
  animation: fadeIn 0.3s ease;
}

.archivos-pestana {
  margin: 0 1rem 2rem 1rem;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.detalle-content {
  display: grid;
  gap: 2rem;
}

.info-section,
.articulos-section,
.actions-section,
.financiero-section {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
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
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
  transition: var(--transition);
}

.info-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
  border-color: var(--color-dorado-vintage);
}

.info-icon {
  padding: 1rem;
  background: var(--color-dorado-vintage);
  border-radius: var(--border-radius);
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

.articulos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(500px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.articulo-card {
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
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

.tipo-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-dorado-vintage);
  border-radius: 6px;
  color: white;
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

.articulo-descripcion {
  margin-bottom: 1.5rem;
}

.articulo-descripcion h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin: 0;
  line-height: 1.4;
}

.valoracion-cliente {
  background: linear-gradient(135deg, #fef3c7, #fde68a);
  border: 2px solid var(--color-dorado-vintage);
  border-radius: var(--border-radius);
  padding: 1rem;
  margin-bottom: 1.5rem;
}

.valoracion-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-marron-chocolate);
  margin-bottom: 0.5rem;
}

.valoracion-header svg {
  color: var(--color-dorado-vintage);
}

.valoracion-monto {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dorado-vintage);
}

.articulo-detalles {
  margin-bottom: 1.5rem;
}

.detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  padding: 0.5rem;
  background: #f8fafc;
  border-radius: 6px;
}

.detalle-label {
  color: var(--color-gris-acero);
  font-weight: 500;
}

.detalle-valor {
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.color-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.color-muestra {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  border: 2px solid #e5e7eb;
  flex-shrink: 0;
}

.especificaciones-section {
  margin-bottom: 1.5rem;
  background: linear-gradient(135deg, #f8fafc, #f1f5f9);
  border: 1px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;
}

.specs-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  padding: 1rem;
  background: linear-gradient(135deg, #e5e7eb, #d1d5db);
  border-bottom: 1px solid #d1d5db;
}

.specs-header svg {
  color: var(--color-dorado-vintage);
}

.specs-content {
  padding: 1rem;
}

.specs-content pre {
  font-family: 'Inter', sans-serif;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-gris-acero);
  margin: 0;
  white-space: pre-wrap;
  word-wrap: break-word;
}

.avaluo-section {
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #0ea5e9;
  border-radius: var(--border-radius);
  overflow: hidden;
  margin-bottom: 1.5rem;
}

.avaluo-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-azul-marino);
  padding: 1rem;
  background: linear-gradient(135deg, #0ea5e9, #0284c7);
  color: white;
}

.avaluo-header svg {
  color: white;
}

.avaluo-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
  padding: 1rem;
}

.avaluo-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e0f2fe;
}

.avaluo-label {
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.avaluo-valor {
  font-weight: 700;
  font-size: 1rem;
}

.avaluo-valor.comercial {
  color: var(--color-azul-marino);
}

.avaluo-valor.porcentaje {
  color: var(--color-verde-bosque);
}

.avaluo-valor.prestamo {
  color: var(--color-dorado-vintage);
  font-size: 1.125rem;
}

.avaluo-observaciones {
  grid-column: 1 / -1;
  margin-top: 0.5rem;
}

.avaluo-obs-text {
  margin-top: 0.5rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  font-style: italic;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  line-height: 1.5;
  border-left: 3px solid var(--color-azul-marino);
  margin: 0;
}

.financiero-section {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.financiero-resumen {
  padding: 2rem;
}

.montos-principales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.monto-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, white, #f8fafc);
  border-radius: var(--border-radius);
  border: 2px solid transparent;
  transition: var(--transition);
}

.monto-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
}

.monto-card.principal {
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, #fef3c7, #fde68a);
}

.monto-card.destacada {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.monto-icono {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 60px;
  height: 60px;
  border-radius: var(--border-radius);
  color: white;
  flex-shrink: 0;
}

.monto-card.principal .monto-icono {
  background: var(--color-dorado-vintage);
}

.monto-card.destacada .monto-icono {
  background: var(--color-verde-bosque);
}

.monto-card:not(.principal):not(.destacada) .monto-icono {
  background: var(--color-azul-marino);
}

.monto-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.monto-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.monto-valor {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.monto-card.principal .monto-valor {
  color: var(--color-dorado-vintage);
  font-size: 1.5rem;
}

.monto-card.destacada .monto-valor {
  color: var(--color-verde-bosque);
  font-size: 1.5rem;
}

.plan-pagos-section {
  background: white;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
  overflow: hidden;
  margin-top: 2rem;
}

.plan-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-azul-marino), var(--color-gris-acero));
  color: white;
}

.plan-header h3 {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
}

.plan-resumen {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  text-align: right;
}

.numero-pagos {
  font-size: 0.875rem;
  font-weight: 600;
}

.monto-por-pago {
  font-size: 0.75rem;
  opacity: 0.9;
}

.tabla-pagos {
  overflow-x: auto;
}

.tabla-header,
.tabla-row {
  display: grid;
  grid-template-columns: 80px 1fr 1fr 1fr 1fr 1fr;
  gap: 0.5rem;
  align-items: center;
  min-width: 600px;
}

.tabla-header {
  background: var(--color-dorado-vintage);
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
  padding: 1rem;
}

.tabla-row {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  font-size: 0.875rem;
  transition: var(--transition);
}

.tabla-row:hover {
  background: #f8fafc;
}

.tabla-row.row-final {
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
  font-weight: 600;
}

.tabla-row:last-child {
  border-bottom: none;
}

.col-cuota,
.col-fecha,
.col-capital,
.col-interes,
.col-total,
.col-saldo {
  text-align: center;
  padding: 0.25rem;
}

.cuota-numero {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  background: var(--color-dorado-vintage);
  color: white;
  border-radius: 50%;
  font-weight: 600;
  font-size: 0.75rem;
}

.fecha-corta {
  font-weight: 500;
  color: var(--color-gris-acero);
}

.monto {
  font-weight: 600;
}

.monto.capital {
  color: var(--color-azul-marino);
}

.monto.interes {
  color: var(--color-rojo-granate);
}

.monto.total {
  color: var(--color-negro-carbon);
}

.monto.saldo {
  color: var(--color-gris-acero);
}

.monto.saldo.saldo-cero {
  color: var(--color-verde-bosque);
  font-weight: 700;
}

.plan-totales {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-top: 1px solid #e5e7eb;
}

.total-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
}

.total-item.destacado {
  border-color: var(--color-verde-bosque);
  background: linear-gradient(135deg, #d1fae5, #a7f3d0);
}

.total-label {
  font-weight: 500;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.total-valor {
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.total-item.destacado .total-label {
  color: var(--color-verde-bosque);
}

.total-item.destacado .total-valor {
  color: var(--color-verde-bosque);
  font-size: 1.125rem;
}

.info-adicional {
  display: flex;
  gap: 2rem;
  margin-top: 2rem;
  padding: 1.5rem;
  background: #f8fafc;
  border-radius: var(--border-radius);
  border: 1px solid #e5e7eb;
}

.info-adicional .info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.info-adicional .info-item svg {
  color: var(--color-dorado-vintage);
}

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
  transition: var(--transition);
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
  transition: var(--transition);
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
  transition: var(--transition);
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

.archivos-estado-vacio {
  padding: 3rem 2rem;
  text-align: center;
  background: white;
  border-radius: var(--border-radius);
  margin: 1rem;
}

.estado-vacio-content {
  max-width: 400px;
  margin: 0 auto;
}

.icono-vacio {
  margin: 0 auto 1.5rem;
  opacity: 0.6;
}

.estado-vacio-content h4 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.5rem;
}

.estado-vacio-content p {
  color: #6B7280;
  margin-bottom: 2rem;
  line-height: 1.5;
}

.btn-refresh {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #F3F4F6;
  border: 1px solid #D1D5DB;
  border-radius: 8px;
  color: #374151;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.btn-refresh:hover {
  background: #E5E7EB;
  border-color: #9CA3AF;
  transform: translateY(-1px);
}

.btn-refresh svg {
  transition: transform 0.2s ease;
}

.btn-refresh:hover svg {
  transform: rotate(180deg);
}

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
  border-radius: var(--border-radius);
  background: var(--color-blanco-perla);
  cursor: pointer;
  transition: var(--transition);
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
  border-radius: var(--border-radius);
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
  transition: var(--transition);
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
  transition: var(--transition);
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
  transition: var(--transition);
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
  transition: var(--transition);
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
  transition: var(--transition);
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
  border-radius: var(--border-radius);
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
  
  .info-grid,
  .montos-principales {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .articulos-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
  
  .detalles-grid {
    grid-template-columns: 1fr;
  }
  
  .avaluo-grid {
    grid-template-columns: 1fr;
  }
  
  .fotos-grid {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }

  .info-monto-aprobado {
    flex-direction: column;
    gap: 1rem;
  }
  
  .tabla-header,
  .tabla-row {
    grid-template-columns: 60px 1fr 1fr 1fr;
    gap: 0.25rem;
    font-size: 0.75rem;
  }
  
  .col-capital,
  .col-interes {
    display: none;
  }
  
  .plan-totales {
    grid-template-columns: 1fr;
  }
  
  .info-adicional {
    flex-direction: column;
    gap: 1rem;
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

  .pestanas-navegacion {
    padding: 0 0.5rem;
    overflow-x: auto;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }

  .pestanas-navegacion::-webkit-scrollbar {
    display: none;
  }

  .btn-pestana {
    padding: 0.75rem 1rem;
    white-space: nowrap;
    font-size: 0.875rem;
  }

  .archivos-pestana {
    margin: 0 0.5rem 1rem 0.5rem;
  }

  .btn-solicitar-prestamo {
    padding: 1rem;
  }
  
  .btn-icon {
    width: 36px;
    height: 36px;
  }
  
  .btn-title {
    font-size: 0.9375rem;
  }
  
  .btn-subtitle {
    font-size: 0.8125rem;
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
  
  .tabla-header,
  .tabla-row {
    grid-template-columns: 50px 1fr 80px;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
  }
  
  .col-fecha,
  .col-capital,
  .col-interes,
  .col-saldo {
    display: none;
  }
  
  .monto-card {
    padding: 1rem;
  }
  
  .monto-icono {
    width: 48px;
    height: 48px;
  }

  .btn-solicitar-prestamo {
    flex-direction: column;
    text-align: center;
    gap: 0.75rem;
  }
  
  .btn-arrow {
    transform: rotate(90deg);
  }
  
  .btn-solicitar-prestamo:hover:not(:disabled) .btn-arrow {
    transform: rotate(90deg) translateX(4px);
  }

  .approval-actions {
    margin-top: 1rem;
  }
}
</style>