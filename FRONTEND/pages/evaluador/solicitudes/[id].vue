<template>
  <div class="evaluador-solicitud-container">
    <!-- LOADING -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Cargando solicitud...</p>
    </div>

    <!-- ERROR -->
    <div v-else-if="error" class="error-state">
      <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" stroke-width="2"/>
        <circle cx="12" cy="16" r="1" fill="currentColor"/>
      </svg>
      <h3>Error al cargar</h3>
      <p>{{ error }}</p>
      <button @click="router.push('/evaluador/solicitudes')" class="btn-secondary">
        Volver al panel
      </button>
    </div>

    <!-- CONTENIDO PRINCIPAL -->
    <div v-else-if="solicitud" class="solicitud-detalle">
      <!-- HEADER CON BOTÓN VOLVER -->
      <div class="header-con-navegacion">
        <button @click="volverAlPanel" class="btn-volver">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Volver al Panel
        </button>

        <div class="header-info">
          <h1>Solicitud {{ solicitud.numero }}</h1>
          <span :class="`estado-badge ${solicitud.estado.toLowerCase()}`">
            {{ solicitud.estado }}
          </span>
        </div>
      </div>

      <!-- SISTEMA DE PESTAÑAS -->
      <div class="tabs-navigation">
        <button 
          @click="pestanaActiva = 'informacion'" 
          :class="['tab-button', { active: pestanaActiva === 'informacion' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12Z" stroke="currentColor" stroke-width="2"/>
            <path d="M3 20C3 16.13 7.58 13 12 13C16.42 13 21 16.13 21 20" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información del Cliente
        </button>
        <button 
          @click="pestanaActiva = 'articulos'" 
          :class="['tab-button', { active: pestanaActiva === 'articulos' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="2" y="7" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M16 7V5C16 3.895 15.105 3 14 3H10C8.895 3 8 3.895 8 5V7" stroke="currentColor" stroke-width="2"/>
          </svg>
          Artículos
        </button>
        <button 
          @click="pestanaActiva = 'archivos'" 
          :class="['tab-button', { active: pestanaActiva === 'archivos' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
            <polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2"/>
          </svg>
          Archivos ({{ archivos.length }})
        </button>
        <button 
          @click="pestanaActiva = 'evaluacion'" 
          :class="['tab-button', { active: pestanaActiva === 'evaluacion' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 11L12 14L22 4" stroke="currentColor" stroke-width="2"/>
            <path d="M21 12V19C21 20.1 20.1 21 19 21H5C3.9 21 3 20.1 3 19V5C3 3.9 3.9 3 5 3H16" stroke="currentColor" stroke-width="2"/>
          </svg>
          Evaluación
        </button>
      </div>

      <!-- CONTENIDO DE LAS PESTAÑAS -->
      <div class="tab-content">
        <!-- PESTAÑA: INFORMACIÓN DEL CLIENTE -->
        <div v-if="pestanaActiva === 'informacion'" class="informacion-cliente">
          <div class="seccion-card">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                <path d="M6 21V19C6 17.3431 7.34315 16 9 16H15C16.6569 16 18 17.3431 18 19V21" stroke="currentColor" stroke-width="2"/>
              </svg>
              Datos Personales
            </h2>
            <div class="datos-grid">
              <div class="dato-item">
                <span class="dato-label">Nombre Completo</span>
                <span class="dato-valor">{{ solicitud.usuario.nombre }}</span>
              </div>
              <div class="dato-item">
                <span class="dato-label">Cédula / DPI</span>
                <span class="dato-valor">{{ solicitud.usuario.cedula || 'No proporcionado' }}</span>
              </div>
              <div class="dato-item">
                <span class="dato-label">Email</span>
                <span class="dato-valor">{{ solicitud.usuario.email }}</span>
              </div>
              <div class="dato-item">
                <span class="dato-label">Teléfono</span>
                <span class="dato-valor">{{ solicitud.usuario.telefono || 'No proporcionado' }}</span>
              </div>
              <div class="dato-item">
                <span class="dato-label">Dirección</span>
                <span class="dato-valor">{{ solicitud.usuario.direccion || 'No proporcionado' }}</span>
              </div>
              <div class="dato-item">
                <span class="dato-label">Fecha de Nacimiento</span>
                <span class="dato-valor">{{ formatearFecha(solicitud.usuario.fechaNacimiento) }}</span>
              </div>
            </div>
          </div>

          <!-- DOCUMENTOS DPI DEL CLIENTE -->
          <div class="seccion-card">
            <h2>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                <circle cx="9" cy="11" r="2" stroke="currentColor" stroke-width="2"/>
                <path d="M16 10h-3M16 13h-3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Documentos de Identificación
            </h2>
            
            <div v-if="loadingDPI" class="loading-mini">
              <div class="spinner-small"></div>
              <span>Cargando documentos DPI...</span>
            </div>

            <div v-else-if="documentosDPI.length > 0" class="dpi-grid">
              <div v-for="doc in documentosDPI" :key="doc.id" class="dpi-card">
                <div class="dpi-image-container">
                  <img 
                    :src="construirUrlArchivo(doc.rutaArchivo)" 
                    :alt="doc.nombreArchivo"
                    @click="verImagen(construirUrlArchivo(doc.rutaArchivo))"
                    @error="handleImageError"
                  />
                  <div class="dpi-overlay" @click="verImagen(construirUrlArchivo(doc.rutaArchivo))">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                      <path d="M15 12C15 13.6569 13.6569 15 12 15C10.3431 15 9 13.6569 9 12C9 10.3431 10.3431 9 12 9C13.6569 9 15 10.3431 15 12Z" stroke="white" stroke-width="2"/>
                      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="white" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                <div class="dpi-info">
                  <span class="dpi-nombre">{{ doc.nombreArchivo }}</span>
                  <button @click="descargarArchivo(doc)" class="btn-mini-download">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V15" stroke="currentColor" stroke-width="2"/>
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Descargar
                  </button>
                </div>
              </div>
            </div>

            <div v-else class="empty-state-mini">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="6" width="18" height="12" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M8 10L10 12L14 8" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>No se han cargado documentos de identificación</p>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: ARTÍCULOS -->
        <div v-if="pestanaActiva === 'articulos'" class="articulos-content">
          <div v-for="articulo in solicitud.articulos" :key="articulo.id" class="articulo-card">
            <h3>{{ articulo.descripcion }}</h3>
            <div class="articulo-detalles-grid">
              <div class="detalle-item">
                <span class="label">Marca:</span>
                <span class="value">{{ articulo.marca || 'No especificado' }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">Modelo:</span>
                <span class="value">{{ articulo.modelo || 'No especificado' }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">Estado Físico:</span>
                <span class="value">{{ articulo.estadoFisico }}</span>
              </div>
              <div class="detalle-item">
                <span class="label">Valor Estimado por Cliente:</span>
                <span class="value">Q {{ formatearMoneda(articulo.valorEstimadoCliente) }}</span>
              </div>
              <div class="detalle-item" v-if="articulo.avaluo">
                <span class="label">Valor Comercial (Evaluador):</span>
                <span class="value destacado">Q {{ formatearMoneda(articulo.avaluo.valorComercial) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: ARCHIVOS -->
        <div v-if="pestanaActiva === 'archivos'" class="archivos-content">
          <div v-if="loadingArchivos" class="loading-mini">
            <div class="spinner-small"></div>
            <span>Cargando archivos adjuntos...</span>
          </div>

          <div v-else-if="archivos.length > 0" class="archivos-grid">
            <div v-for="archivo in archivos" :key="archivo.id" class="archivo-card">
              <div class="archivo-preview">
                <img 
                  v-if="esImagen(archivo)" 
                  :src="construirUrlArchivo(archivo.rutaArchivo)" 
                  :alt="archivo.nombreArchivo"
                  @click="verImagen(construirUrlArchivo(archivo.rutaArchivo))"
                  @error="handleImageError"
                />
                <div v-else class="archivo-icon-placeholder">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
              </div>
              <div class="archivo-info">
                <span class="archivo-nombre">{{ archivo.nombreArchivo }}</span>
                <span class="archivo-tipo">{{ archivo.tipo }}</span>
                <div class="archivo-acciones">
                  <button v-if="esImagen(archivo)" @click="verImagen(construirUrlArchivo(archivo.rutaArchivo))" class="btn-ver">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Ver
                  </button>
                  <button @click="descargarArchivo(archivo)" class="btn-descargar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M21 15V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V15" stroke="currentColor" stroke-width="2"/>
                      <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2"/>
                      <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Descargar
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div v-else class="empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="13 2 13 9 20 9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>No hay archivos adjuntos</p>
          </div>
        </div>

        <!-- PESTAÑA: EVALUACIÓN -->
        <div v-if="pestanaActiva === 'evaluacion'" class="evaluacion-content">
          <!-- SI AÚN NO HA SIDO EVALUADA -->
          <div v-if="solicitud.estado === 'Pendiente'" class="formulario-evaluacion">
            <div class="seccion-card">
              <h2>Evaluar Solicitud</h2>
              <p class="descripcion-evaluacion">
                Ingresa el monto autorizado basado en la evaluación del artículo y agrega observaciones si es necesario.
              </p>

              <div v-if="errorSubmit" class="error-mensaje">
                {{ errorSubmit }}
              </div>

              <div class="form-group">
                <label for="montoAutorizado">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2V22M17 5H9.5C8.57174 5 7.6815 5.36875 7.02513 6.02513C6.36875 6.6815 6 7.57174 6 8.5C6 9.42826 6.36875 10.3185 7.02513 10.9749C7.6815 11.6313 8.57174 12 9.5 12H14.5C15.4283 12 16.3185 12.3687 16.9749 13.0251C17.6313 13.6815 18 14.5717 18 15.5C18 16.4283 17.6313 17.3185 16.9749 17.9749C16.3185 18.6313 15.4283 19 14.5 19H6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Monto Autorizado (Q)
                </label>
                <input
                  type="number"
                  id="montoAutorizado"
                  v-model.number="formEvaluacion.montoAutorizado"
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  class="input-monto"
                  :disabled="submitting"
                />
                <span class="form-help">Ingresa el monto que autorizas para el préstamo</span>
              </div>

              <div class="form-group">
                <label for="observaciones">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M11 5H6C5.46957 5 4.96086 5.21071 4.58579 5.58579C4.21071 5.96086 4 6.46957 4 7V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V7C20 6.46957 19.7893 5.96086 19.4142 5.58579C19.0391 5.21071 18.5304 5 18 5H13" stroke="currentColor" stroke-width="2"/>
                    <path d="M9 3H15V7H9V3Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Observaciones (Opcional)
                </label>
                <textarea
                  id="observaciones"
                  v-model="formEvaluacion.observaciones"
                  placeholder="Agrega comentarios sobre la evaluación..."
                  class="input-textarea"
                  :disabled="submitting"
                ></textarea>
                <span class="form-help">Información adicional sobre la decisión</span>
              </div>

              <div class="botones-evaluacion">
                <button 
                  @click="abrirConfirmacion('Aprobada')"
                  :disabled="!formValido || submitting"
                  class="btn-aprobar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
                    <path d="M5 10L8 13L15 6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Aprobar Solicitud
                </button>

                <button 
                  @click="abrirConfirmacion('Rechazada')"
                  :disabled="submitting"
                  class="btn-rechazar"
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M6 6L14 14M6 14L14 6" stroke="currentColor" stroke-width="2"/>
                  </svg>
                  Rechazar Solicitud
                </button>
              </div>
            </div>
          </div>

          <!-- SI YA FUE EVALUADA -->
          <div v-else class="estado-evaluado">
            <div :class="`mensaje-estado ${solicitud.estado.toLowerCase()}`">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path v-if="solicitud.estado === 'Aprobada'" d="M8 12L11 15L16 9" stroke="currentColor" stroke-width="2"/>
                <path v-else d="M9 9L15 15M9 15L15 9" stroke="currentColor" stroke-width="2"/>
              </svg>
              <div class="mensaje-contenido">
                <h3>Solicitud {{ solicitud.estado }}</h3>
                <p v-if="solicitud.fechaEvaluacion">
                  Evaluada el {{ formatearFecha(solicitud.fechaEvaluacion) }}
                </p>
                <p v-if="solicitud.observaciones" class="observaciones-evaluacion">
                  <strong>Observaciones:</strong> {{ solicitud.observaciones }}
                </p>

                <!-- BOTÓN PROCESAR CONTRATO SI ESTÁ APROBADA -->
                <div v-if="solicitud.estado === 'Aprobada'" class="acciones-post-evaluacion">
                  <!-- Si NO existe contrato, mostrar botón para generar -->
                  <button 
                    v-if="!contrato"
                    @click="procesarContrato" 
                    :disabled="loadingContrato"
                    class="btn-procesar-contrato"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                      <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
                      <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="2"/>
                      <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    {{ loadingContrato ? 'Generando contrato...' : 'Procesar y Generar Contrato' }}
                  </button>

                  <!-- Si YA existe contrato, mostrar info y botones -->
                  <div v-else class="contrato-existente">
                    <div class="contrato-info-card">
                      <div class="contrato-header">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                          <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <div>
                          <h4>Contrato {{ contrato.numeroContrato }}</h4>
                          <p class="fecha-contrato">Generado el {{ formatearFecha(contrato.fechaCreacion) }}</p>
                        </div>
                      </div>

                      <div :class="`estado-firma ${contrato.estadoFirma.toLowerCase()}`">
                        <svg v-if="contrato.estadoFirma === 'Firmado'" width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                        </svg>
                        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                          <path d="M12 6V12" stroke="currentColor" stroke-width="2"/>
                          <circle cx="12" cy="16" r="1" fill="currentColor"/>
                        </svg>
                        <span v-if="contrato.estadoFirma === 'Firmado'">
                          Firmado el {{ formatearFecha(contrato.fechaFirma) }}
                        </span>
                        <span v-else>Pendiente de Firma</span>
                      </div>

                      <div class="contrato-acciones">
                        <button @click="verContrato" class="btn-ver-contrato">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                            <path d="M2 12C2 12 5 5 12 5C19 5 22 12 22 12C22 12 19 19 12 19C5 19 2 12 2 12Z" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Ver Contrato
                        </button>

                        <button @click="descargarPDF" class="btn-descargar-pdf">
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M21 15V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V15" stroke="currentColor" stroke-width="2"/>
                            <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2"/>
                            <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
                          </svg>
                          Descargar PDF
                        </button>
                      </div>
                    </div>
                  </div>

                  <p v-if="mensajeContrato" class="mensaje-contrato-info">
                    {{ mensajeContrato }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="mostrarModalConfirmacion" class="modal-overlay" @click="cerrarConfirmacion">
      <div class="modal-content" @click.stop>
        <h3>Confirmar {{ decisionPendiente }}</h3>
        <p v-if="decisionPendiente === 'Aprobada'">
          ¿Está seguro que desea aprobar esta solicitud por un monto de <strong>Q {{ formatearMoneda(formEvaluacion.montoAutorizado) }}</strong>?
        </p>
        <p v-else>
          ¿Está seguro que desea rechazar esta solicitud?
        </p>
        
        <div class="modal-botones">
          <button @click="cerrarConfirmacion" :disabled="submitting" class="btn-secondary">
            Cancelar
          </button>
          <button 
            @click="confirmarEvaluacion" 
            :disabled="submitting"
            :class="decisionPendiente === 'Aprobada' ? 'btn-aprobar' : 'btn-rechazar'"
          >
            {{ submitting ? 'Procesando...' : `Confirmar ${decisionPendiente === 'Aprobada' ? 'Aprobación' : 'Rechazo'}` }}
          </button>
        </div>
      </div>
    </div>

    <!-- MODAL DE VISUALIZACIÓN DE CONTRATO -->
    <div v-if="mostrarModalContrato" class="modal-overlay" @click="cerrarModalContrato">
      <div class="modal-contrato-content" @click.stop>
        <div class="modal-contrato-header">
          <h3>Contrato {{ contrato?.numeroContrato }}</h3>
          <button @click="cerrarModalContrato" class="btn-cerrar-modal">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <div class="modal-contrato-body">
          <div class="contrato-meta">
            <div class="meta-item">
              <span class="label">Estado:</span>
              <span :class="`badge ${contrato?.estadoFirma.toLowerCase()}`">
                {{ contrato?.estadoFirma === 'Firmado' ? 'Firmado' : 'Pendiente de Firma' }}
              </span>
            </div>
            <div class="meta-item">
              <span class="label">Fecha de Creación:</span>
              <span>{{ formatearFecha(contrato?.fechaCreacion) }}</span>
            </div>
            <div v-if="contrato?.estadoFirma === 'Firmado'" class="meta-item">
              <span class="label">Fecha de Firma:</span>
              <span>{{ formatearFecha(contrato?.fechaFirma) }}</span>
            </div>
          </div>

          <div class="contrato-contenido">
            <pre>{{ contrato?.contenidoContrato }}</pre>
          </div>

          <div class="contrato-footer">
            <button @click="descargarPDF" class="btn-descargar-principal">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M21 15V19C21 19.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V15" stroke="currentColor" stroke-width="2"/>
                <polyline points="7 10 12 15 17 10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              Descargar PDF
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL VISUALIZADOR DE IMÁGENES -->
    <div v-if="imagenVisualizando" class="modal-imagen-overlay" @click="cerrarVisualizadorImagen">
      <div class="modal-imagen-content" @click.stop>
        <button @click="cerrarVisualizadorImagen" class="btn-cerrar-imagen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <img :src="imagenVisualizando" alt="Visualización" @error="handleImageError" />
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

// Sistema de pestañas
const pestanaActiva = ref('informacion')

// Archivos adjuntos
const archivos = ref([])
const loadingArchivos = ref(false)
const imagenVisualizando = ref(null)

// Documentos DPI
const documentosDPI = ref([])
const loadingDPI = ref(false)

// Contrato
const loadingContrato = ref(false)
const mensajeContrato = ref('')
const contrato = ref(null)
const loadingContratoInfo = ref(false)
const mostrarModalContrato = ref(false)

const formEvaluacion = ref({
  montoAutorizado: 0,
  observaciones: ''
})

const formValido = computed(() => {
  return formEvaluacion.value.montoAutorizado > 0
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

const volverAlPanel = () => {
  navigateTo('/evaluador/solicitudes')
}

const cargarSolicitud = async () => {
  try {
    loading.value = true
    error.value = null
    
    const solicitudId = route.params.id
    console.log('Cargando solicitud:', solicitudId)
    
    const response = await api(`/evaluador/solicitudes/${solicitudId}`)
    solicitud.value = response.data
    
    // Pre-cargar el monto solicitado por el cliente como valor inicial
    if (solicitud.value?.prestamo?.montoSolicitado) {
      formEvaluacion.value.montoAutorizado = solicitud.value.prestamo.montoSolicitado
    }
    
    console.log('Solicitud cargada:', solicitud.value)
    
    // Cargar archivos, DPI y verificar si existe contrato
    await Promise.all([
      cargarArchivos(),
      cargarDocumentosDPI(),
      verificarContrato()
    ])
    
  } catch (err) {
    console.error('Error cargando solicitud:', err)
    error.value = err.message || 'Error al cargar la solicitud'
  } finally {
    loading.value = false
  }
}

const cargarArchivos = async () => {
  try {
    loadingArchivos.value = true
    const solicitudId = route.params.id
    
    console.log('Cargando archivos de la solicitud:', solicitudId)
    
    const response = await api(`/evaluador/solicitudes/${solicitudId}/archivos`)
    
    if (response.success && response.data) {
      const todosLosArchivos = []
      const { archivos: archivosPorTipo } = response.data
      
      // Agregar fotos
      if (archivosPorTipo.fotos) {
        archivosPorTipo.fotos.forEach(foto => {
          todosLosArchivos.push({
            ...foto,
            tipo: 'Foto_Prenda'
          })
        })
      }
      
      // Agregar documentos
      if (archivosPorTipo.documentos) {
        archivosPorTipo.documentos.forEach(doc => {
          todosLosArchivos.push({
            ...doc,
            tipo: 'Especificaciones'
          })
        })
      }
      
      archivos.value = todosLosArchivos
      console.log('Archivos cargados:', archivos.value.length)
    }
    
  } catch (err) {
    console.error('Error cargando archivos:', err)
    archivos.value = []
  } finally {
    loadingArchivos.value = false
  }
}

const cargarDocumentosDPI = async () => {
  try {
    loadingDPI.value = true
    
    if (!solicitud.value?.usuario?.id) {
      console.log('No hay usuario en la solicitud')
      return
    }

    const usuarioId = solicitud.value.usuario.id
    console.log('Cargando documentos DPI del usuario:', usuarioId)
    
    // Usar el endpoint correcto: /clients/:id/documentos-identificacion
    const response = await api(`/clients/${usuarioId}/documentos-identificacion`)
    
    if (response.success && response.data) {
      documentosDPI.value = response.data.documentos || []
      console.log('Documentos DPI cargados:', documentosDPI.value.length)
    }
    
  } catch (err) {
    console.error('Error cargando documentos DPI:', err)
    documentosDPI.value = []
  } finally {
    loadingDPI.value = false
  }
}

// Construir URL de archivos correctamente
const construirUrlArchivo = (rutaArchivo) => {
  if (!rutaArchivo) {
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5JbWFnZW4gbm8gZGlzcG9uaWJsZTwvdGV4dD48L3N2Zz4='
  }
  
  // Si ya es una URL completa, devolverla tal como está
  if (rutaArchivo.startsWith('http')) {
    return rutaArchivo
  }
  
  // Obtener la base URL sin /api
  const baseUrl = config.public.apiBase || ''
  const urlBase = baseUrl.replace('/api', '')
  
  // Si la ruta ya empieza con /uploads, solo agregar el dominio
  if (rutaArchivo.startsWith('/uploads')) {
    return `${urlBase}${rutaArchivo}`
  }
  
  // Si no, construir la URL completa
  return `${urlBase}/uploads/${rutaArchivo}`
}

const handleImageError = (event) => {
  console.error('Error cargando imagen:', event.target.src)
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI0YzRjRGNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiM5OTkiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5FcnJvciBjYXJnYW5kbyBpbWFnZW48L3RleHQ+PC9zdmc+'
}

const esImagen = (archivo) => {
  const tiposImagen = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return tiposImagen.includes(archivo.tipoMime) || archivo.tipo === 'Foto_Prenda'
}

const verImagen = (url) => {
  imagenVisualizando.value = url
}

const cerrarVisualizadorImagen = () => {
  imagenVisualizando.value = null
}

const descargarArchivo = (archivo) => {
  const url = construirUrlArchivo(archivo.rutaArchivo)
  window.open(url, '_blank')
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'No especificada'
  const date = new Date(fecha)
  return date.toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearMoneda = (monto) => {
  if (!monto) return '0.00'
  return parseFloat(monto).toLocaleString('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })
}

const abrirConfirmacion = (decision) => {
  decisionPendiente.value = decision
  mostrarModalConfirmacion.value = true
}

const cerrarConfirmacion = () => {
  mostrarModalConfirmacion.value = false
  decisionPendiente.value = null
}

const confirmarEvaluacion = async () => {
  try {
    submitting.value = true
    errorSubmit.value = null

    const solicitudId = route.params.id
    const datosEvaluacion = {
      estado: decisionPendiente.value,
      montoAutorizado: formEvaluacion.value.montoAutorizado,
      observaciones: formEvaluacion.value.observaciones || null
    }

    console.log('Enviando evaluación:', datosEvaluacion)

    const response = await api(`/evaluador/solicitudes/${solicitudId}/evaluar`, {
      method: 'POST',
      body: JSON.stringify(datosEvaluacion)
    })

    console.log('Evaluación exitosa:', response)

    // Cerrar modal
    cerrarConfirmacion()

    // Recargar solicitud
    await cargarSolicitud()

    // Cambiar a pestaña de evaluación
    pestanaActiva.value = 'evaluacion'

    // Mostrar mensaje de éxito
    alert(`Solicitud ${decisionPendiente.value === 'Aprobada' ? 'aprobada' : 'rechazada'} exitosamente`)

  } catch (err) {
    console.error('Error evaluando solicitud:', err)
    errorSubmit.value = err.message || 'Error al evaluar la solicitud'
  } finally {
    submitting.value = false
  }
}

const procesarContrato = async () => {
  try {
    loadingContrato.value = true
    mensajeContrato.value = ''

    const solicitudId = route.params.id

    console.log('Procesando contrato para solicitud:', solicitudId)

    // Llamar al endpoint de generar contrato
    const response = await api(`/contratos/generar/${solicitudId}`, {
      method: 'POST'
    })

    console.log('Contrato generado:', response)

    mensajeContrato.value = 'Contrato generado exitosamente'

    // Recargar info del contrato
    await verificarContrato()

  } catch (err) {
    console.error('Error procesando contrato:', err)
    mensajeContrato.value = `Error: ${err.message || 'No se pudo generar el contrato'}`
  } finally {
    loadingContrato.value = false
  }
}

const verificarContrato = async () => {
  try {
    loadingContratoInfo.value = true
    const solicitudId = route.params.id

    const response = await api(`/contratos/solicitud/${solicitudId}`)
    
    if (response.success && response.data) {
      contrato.value = response.data
      console.log('Contrato encontrado:', contrato.value)
    }
  } catch (err) {
    // Si no existe el contrato, es normal
    console.log('No existe contrato aún')
    contrato.value = null
  } finally {
    loadingContratoInfo.value = false
  }
}

const verContrato = () => {
  mostrarModalContrato.value = true
}

const cerrarModalContrato = () => {
  mostrarModalContrato.value = false
}

const descargarPDF = async () => {
  if (!contrato.value) return
  
  try {
    const { getToken } = useAuth()
    const token = getToken()

    const response = await fetch(`${config.public.apiBase}/contratos/${contrato.value.id}/pdf`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })

    if (!response.ok) {
      throw new Error('Error al descargar el PDF')
    }

    // Convertir la respuesta en un blob
    const blob = await response.blob()
    
    // Crear un enlace temporal para descargar
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `contrato-${contrato.value.numeroContrato}.pdf`
    document.body.appendChild(a)
    a.click()
    
    // Limpiar
    window.URL.revokeObjectURL(url)
    document.body.removeChild(a)
    
  } catch (error) {
    console.error('Error descargando PDF:', error)
    alert('Error al descargar el PDF. Por favor intenta nuevamente.')
  }
}

onMounted(() => {
  cargarSolicitud()
})
</script>

<style scoped>
:root {
  --color-dorado-vintage: #D4AF37;
  --color-negro-carbon: #1A1A1A;
  --color-gris-acero: #6B7280;
  --color-verde-bosque: #1B4332;
  --color-rojo-granate: #8B0000;
  --border-radius: 12px;
  --transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.evaluador-solicitud-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 2rem;
}

/* ESTADOS DE CARGA */
.loading-state, .error-state {
  min-height: 60vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 3rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #f3f4f6;
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.spinner-small {
  width: 24px;
  height: 24px;
  border: 3px solid #f3f4f6;
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-mini {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  padding: 2rem;
  color: var(--color-gris-acero);
}

/* HEADER CON NAVEGACIÓN */
.header-con-navegacion {
  margin-bottom: 2rem;
}

.btn-volver {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  color: var(--color-negro-carbon);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  margin-bottom: 1rem;
}

.btn-volver:hover {
  background: var(--color-dorado-vintage);
  border-color: var(--color-dorado-vintage);
  color: white;
  transform: translateX(-4px);
}

.header-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
}

.header-info h1 {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-negro-carbon);
  margin: 0;
}

.estado-badge {
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.pendiente {
  background: #FEF3C7;
  color: #92400E;
}

.estado-badge.aprobada {
  background: #D1FAE5;
  color: #065F46;
}

.estado-badge.rechazada {
  background: #FEE2E2;
  color: var(--color-rojo-granate);
}

/* SISTEMA DE PESTAÑAS */
.tabs-navigation {
  display: flex;
  gap: 0.5rem;
  background: white;
  padding: 0.5rem;
  border-radius: var(--border-radius);
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  margin-bottom: 2rem;
  overflow-x: auto;
}

.tab-button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  background: transparent;
  border: 2px solid transparent;
  border-radius: 8px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.tab-button:hover {
  background: #f3f4f6;
  color: var(--color-negro-carbon);
}

.tab-button.active {
  background: var(--color-dorado-vintage);
  color: white;
  border-color: var(--color-dorado-vintage);
}

/* CONTENIDO DE PESTAÑAS */
.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* SECCIÓN CARD */
.seccion-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  margin-bottom: 2rem;
}

.seccion-card h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-negro-carbon);
  margin: 0 0 1.5rem 0;
}

/* DATOS DEL CLIENTE */
.datos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dato-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.dato-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.dato-valor {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

/* DOCUMENTOS DPI */
.dpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.dpi-card {
  background: #f9fafb;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
}

.dpi-card:hover {
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.2);
}

.dpi-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: white;
}

.dpi-image-container img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  cursor: pointer;
}

.dpi-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: var(--transition);
  cursor: pointer;
}

.dpi-image-container:hover .dpi-overlay {
  opacity: 1;
}

.dpi-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.dpi-nombre {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  word-break: break-all;
}

.btn-mini-download {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-mini-download:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

/* ARTÍCULOS */
.articulos-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.articulo-card {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
}

.articulo-card h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0 0 1.5rem 0;
}

.articulo-detalles-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle-item .label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
}

.detalle-item .value {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.detalle-item .value.destacado {
  color: var(--color-dorado-vintage);
  font-size: 1.25rem;
}

/* ARCHIVOS */
.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
}

.archivo-card {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  overflow: hidden;
  transition: var(--transition);
}

.archivo-card:hover {
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 6px 16px rgba(212, 175, 55, 0.2);
}

.archivo-preview {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background: #f9fafb;
  display: flex;
  align-items: center;
  justify-content: center;
}

.archivo-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
  transition: var(--transition);
}

.archivo-preview img:hover {
  transform: scale(1.05);
}

.archivo-icon-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: var(--color-gris-acero);
}

.archivo-info {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.archivo-nombre {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  word-break: break-all;
}

.archivo-tipo {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.archivo-acciones {
  display: flex;
  gap: 0.5rem;
}

.btn-ver, .btn-descargar {
  flex: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-ver {
  background: var(--color-verde-bosque);
  color: white;
}

.btn-ver:hover {
  background: #0f2e21;
  transform: translateY(-2px);
}

.btn-descargar {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-descargar:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

/* EVALUACIÓN */
.formulario-evaluacion {
  max-width: 800px;
  margin: 0 auto;
}

.descripcion-evaluacion {
  font-size: 1rem;
  color: var(--color-gris-acero);
  margin: 0 0 2rem 0;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.75rem;
}

.input-monto, .input-textarea {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  color: var(--color-negro-carbon);
  transition: var(--transition);
}

.input-monto {
  font-weight: 700;
  font-size: 1.5rem;
}

.input-textarea {
  resize: vertical;
  min-height: 120px;
}

.input-monto:focus, .input-textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
}

.form-help {
  display: block;
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.error-mensaje {
  padding: 1rem 1.5rem;
  background: #FEE2E2;
  color: var(--color-rojo-granate);
  border-radius: var(--border-radius);
  margin-bottom: 1.5rem;
  font-weight: 600;
}

.botones-evaluacion {
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
}

.btn-aprobar, .btn-rechazar {
  flex: 1;
  padding: 1.25rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-aprobar {
  background: var(--color-verde-bosque);
  color: white;
  box-shadow: 0 4px 12px rgba(27, 67, 50, 0.3);
}

.btn-aprobar:hover:not(:disabled) {
  background: #0f2e21;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4);
}

.btn-rechazar {
  background: var(--color-rojo-granate);
  color: white;
  box-shadow: 0 4px 12px rgba(139, 0, 0, 0.3);
}

.btn-rechazar:hover:not(:disabled) {
  background: #6b0000;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(139, 0, 0, 0.4);
}

.btn-aprobar:disabled, .btn-rechazar:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* ESTADO EVALUADO */
.estado-evaluado {
  max-width: 800px;
  margin: 0 auto;
}

.mensaje-estado {
  padding: 2.5rem;
  border-radius: 16px;
  display: flex;
  align-items: start;
  gap: 2rem;
}

.mensaje-estado.aprobada {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #065F46;
}

.mensaje-estado.rechazada {
  background: linear-gradient(135deg, #FEE2E2 0%, #FECACA 100%);
  color: var(--color-rojo-granate);
}

.mensaje-contenido {
  flex: 1;
}

.mensaje-contenido h3 {
  font-size: 1.75rem;
  font-weight: 800;
  margin: 0 0 0.5rem 0;
}

.mensaje-contenido p {
  margin: 0.5rem 0;
  font-size: 1rem;
}

.observaciones-evaluacion {
  margin-top: 1.5rem;
  padding: 1.5rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 8px;
}

.acciones-post-evaluacion {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.btn-procesar-contrato {
  padding: 1.25rem 2rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-procesar-contrato:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

.btn-procesar-contrato:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.mensaje-contrato-info {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
}

/* MODAL DE CONFIRMACIÓN */
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-content {
  background: white;
  border-radius: var(--border-radius);
  padding: 2rem;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-negro-carbon);
  margin: 0 0 1rem 0;
}

.modal-content p {
  font-size: 1rem;
  color: var(--color-gris-acero);
  margin: 0 0 1.5rem 0;
}

.modal-botones {
  display: flex;
  gap: 1rem;
}

.btn-secondary {
  flex: 1;
  padding: 1rem;
  background: #f3f4f6;
  color: var(--color-negro-carbon);
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.btn-secondary:hover {
  background: #e5e7eb;
}

/* MODAL VISUALIZADOR DE IMÁGENES */
.modal-imagen-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1001;
  padding: 2rem;
}

.modal-imagen-content {
  position: relative;
  max-width: 90vw;
  max-height: 90vh;
}

.modal-imagen-content img {
  max-width: 100%;
  max-height: 90vh;
  object-fit: contain;
  border-radius: var(--border-radius);
}

.btn-cerrar-imagen {
  position: absolute;
  top: -60px;
  right: 0;
  padding: 0.75rem;
  background: white;
  color: var(--color-negro-carbon);
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
}

.btn-cerrar-imagen:hover {
  background: var(--color-rojo-granate);
  color: white;
  transform: rotate(90deg);
}

/* EMPTY STATES */
.empty-state, .empty-state-mini {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  color: var(--color-gris-acero);
}

.empty-state svg, .empty-state-mini svg {
  margin-bottom: 1rem;
  color: #d1d5db;
}

.empty-state-mini {
  padding: 2rem;
}

/* CONTRATO EXISTENTE */
.contrato-existente {
  margin-top: 2rem;
}

.contrato-info-card {
  background: white;
  border: 2px solid var(--color-dorado-vintage);
  border-radius: var(--border-radius);
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.contrato-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.contrato-header svg {
  color: var(--color-dorado-vintage);
}

.contrato-header h4 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--color-negro-carbon);
}

.fecha-contrato {
  margin: 0.25rem 0 0 0;
  font-size: 0.875rem;
  color: var(--color-gris-acero);
}

.estado-firma {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
}

.estado-firma.firmado {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
  color: #065F46;
}

.estado-firma.pendiente {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
  color: #92400E;
}

.contrato-acciones {
  display: flex;
  gap: 1rem;
}

.btn-ver-contrato, .btn-descargar-pdf {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
}

.btn-ver-contrato {
  background: var(--color-verde-bosque);
  color: white;
}

.btn-ver-contrato:hover {
  background: #0f2e21;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(27, 67, 50, 0.4);
}

.btn-descargar-pdf {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-descargar-pdf:hover {
  background: #B8941F;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* MODAL DE CONTRATO */
.modal-contrato-content {
  background: white;
  border-radius: var(--border-radius);
  max-width: 900px;
  width: 90vw;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.modal-contrato-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.5rem 2rem;
  border-bottom: 2px solid #f3f4f6;
  background: linear-gradient(135deg, var(--color-dorado-vintage) 0%, #B8941F 100%);
  color: white;
}

.modal-contrato-header h3 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
}

.btn-cerrar-modal {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  color: white;
}

.btn-cerrar-modal:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: rotate(90deg);
}

.modal-contrato-body {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
}

.contrato-meta {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: #f9fafb;
  border-radius: 8px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.meta-item .label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge.firmado {
  background: #D1FAE5;
  color: #065F46;
}

.badge.pendiente {
  background: #FEF3C7;
  color: #92400E;
}

.contrato-contenido {
  background: white;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  padding: 2rem;
  margin-bottom: 2rem;
}

.contrato-contenido pre {
  margin: 0;
  font-family: 'Courier New', Courier, monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  color: var(--color-negro-carbon);
  white-space: pre-wrap;
  word-wrap: break-word;
}

.contrato-footer {
  display: flex;
  justify-content: center;
}

.btn-descargar-principal {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.btn-descargar-principal:hover {
  background: #B8941F;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .evaluador-solicitud-container {
    padding: 1rem;
  }

  .header-info h1 {
    font-size: 1.5rem;
  }

  .tabs-navigation {
    flex-wrap: nowrap;
    overflow-x: auto;
  }

  .tab-button {
    flex-shrink: 0;
  }

  .datos-grid {
    grid-template-columns: 1fr;
  }

  .botones-evaluacion {
    flex-direction: column;
  }

  .modal-botones {
    flex-direction: column;
  }
}
</style>