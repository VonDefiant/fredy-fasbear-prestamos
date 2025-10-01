<template>
  <div class="evaluador-detalle-page">
    <div v-if="loading" class="loading-container">
      <div class="loading-spinner">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="50" stroke-dashoffset="0">
            <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="1s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <p>Cargando solicitud...</p>
    </div>

    <div v-else-if="error" class="error-container">
      <div class="error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M12 8V12M12 16H12.01" stroke="currentColor" stroke-width="2"/>
        </svg>
      </div>
      <h2>Error al cargar la solicitud</h2>
      <p>{{ error }}</p>
      <button @click="router.back()" class="btn-primary">Volver</button>
    </div>

    <div v-else-if="solicitud" class="detalle-container">
      <!-- HEADER -->
      <div class="detalle-header">
        <div class="header-navigation">
          <button @click="router.back()" class="btn-back">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" stroke-width="2"/>
            </svg>
            Volver a solicitudes
          </button>
        </div>
        
        <div class="header-content">
          <div class="header-info">
            <h1>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M12 9V15M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ solicitud.numero }}
            </h1>
            <p class="fecha-solicitud">Solicitud recibida el {{ formatearFecha(solicitud.fechaSolicitud) }}</p>
          </div>
          
          <div class="estado-badge" :class="`estado-${solicitud.estado.toLowerCase()}`">
            {{ solicitud.estado }}
          </div>
        </div>
      </div>

      <!-- PESTAÑAS DE NAVEGACIÓN -->
      <div class="pestanas-navegacion">
        <button 
          @click="pestanaActiva = 'informacion'" 
          :class="{ active: pestanaActiva === 'informacion' }"
          class="btn-pestana"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
            <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información General
        </button>
        <button 
          @click="pestanaActiva = 'financiero'" 
          :class="{ active: pestanaActiva === 'financiero' }"
          class="btn-pestana"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
            <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
          </svg>
          Detalles Financieros
        </button>
        <button 
          @click="pestanaActiva = 'archivos'" 
          :class="{ active: pestanaActiva === 'archivos' }"
          class="btn-pestana"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2"/>
          </svg>
          Archivos Adjuntos
          <span v-if="archivos.length > 0" class="contador-badge">{{ archivos.length }}</span>
        </button>
      </div>

      <!-- CONTENIDO DE PESTAÑAS -->
      <div class="pestanas-contenido">
        
        <!-- PESTAÑA: INFORMACIÓN GENERAL -->
        <div v-if="pestanaActiva === 'informacion'" class="pestaña-content">
          <div class="info-section">
            <div class="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/>
                  <path d="M4 20C4 16.6863 6.68629 14 10 14H14C17.3137 14 20 16.6863 20 20" stroke="currentColor" stroke-width="2"/>
                </svg>
                Información del Cliente
              </h2>
            </div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Nombre completo</span>
                  <span class="info-value">{{ solicitud.usuario.nombre }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 8L10.89 13.26C11.5677 13.7157 12.4323 13.7157 13.11 13.26L21 8M5 19H19C20.1046 19 21 18.1046 21 17V7C21 5.89543 20.1046 5 19 5H5C3.89543 5 3 5.89543 3 7V17C3 18.1046 3.89543 19 5 19Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Correo electrónico</span>
                  <span class="info-value">{{ solicitud.usuario.email }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M3 5C3 3.89543 3.89543 3 5 3H8.27924C8.70967 3 9.09181 3.27543 9.22792 3.68377L10.7257 8.17721C10.8831 8.64932 10.6694 9.16531 10.2243 9.38787L7.96701 10.5165C9.06925 12.9612 11.0388 14.9308 13.4835 16.033L14.6121 13.7757C14.8347 13.3306 15.3507 13.1169 15.8228 13.2743L20.3162 14.7721C20.7246 14.9082 21 15.2903 21 15.7208V19C21 20.1046 20.1046 21 19 21H18C9.71573 21 3 14.2843 3 6V5Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Teléfono</span>
                  <span class="info-value">{{ solicitud.usuario.telefono || 'No proporcionado' }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- INFORMACIÓN DEL ARTÍCULO -->
          <div class="info-section" v-if="solicitud.articulos && solicitud.articulos[0]">
            <div class="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M9 9L15 15M15 9L9 15" stroke="currentColor" stroke-width="2"/>
                </svg>
                Artículo en Empeño
              </h2>
            </div>
            <div class="info-grid">
              <div class="info-card">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 7H17M7 12H17M7 17H13" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Tipo de artículo</span>
                  <span class="info-value">{{ solicitud.articulos[0].tipoArticulo }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15M9 5C9 6.10457 9.89543 7 11 7H13C14.1046 7 15 6.10457 15 5M9 5C9 3.89543 9.89543 3 11 3H13C14.1046 3 15 3.89543 15 5M12 12H15M12 16H15M9 12H9.01M9 16H9.01" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Descripción</span>
                  <span class="info-value">{{ solicitud.articulos[0].descripcion }}</span>
                </div>
              </div>

              <div class="info-card" v-if="solicitud.articulos[0].marca">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 20L17 4M7 4H17" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Marca</span>
                  <span class="info-value">{{ solicitud.articulos[0].marca }}</span>
                </div>
              </div>

              <div class="info-card" v-if="solicitud.articulos[0].modelo">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 5H7C5.89543 5 5 5.89543 5 7V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V7C19 5.89543 18.1046 5 17 5H15" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Modelo</span>
                  <span class="info-value">{{ solicitud.articulos[0].modelo }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Estado físico</span>
                  <span class="info-value">{{ solicitud.articulos[0].estadoFisico }}</span>
                </div>
              </div>

              <div class="info-card">
                <div class="info-icon dorado">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="info-content">
                  <span class="info-label">Valor estimado por cliente</span>
                  <span class="info-value monto">Q {{ formatearMoneda(solicitud.articulos[0].valorEstimadoCliente) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: DETALLES FINANCIEROS -->
        <div v-if="pestanaActiva === 'financiero'" class="pestaña-content">
          <div class="financiero-section">
            <div class="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Resumen Financiero
              </h2>
            </div>
            
            <div class="tarjetas-financieras">
              <div class="tarjeta-financiera amarillo">
                <div class="tarjeta-icono">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                    <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="tarjeta-contenido">
                  <p class="tarjeta-titulo">Monto Solicitado</p>
                  <p class="tarjeta-valor">Q {{ formatearMoneda(solicitud.prestamo.montoSolicitado) }}</p>
                </div>
              </div>

              <div class="tarjeta-financiera azul">
                <div class="tarjeta-icono">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                    <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="tarjeta-contenido">
                  <p class="tarjeta-titulo">Tasa de Interés</p>
                  <p class="tarjeta-valor">{{ solicitud.prestamo.tasaInteres }}% mensual</p>
                </div>
              </div>

              <div class="tarjeta-financiera verde">
                <div class="tarjeta-icono">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="6" width="18" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                    <path d="M3 10H21" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
                <div class="tarjeta-contenido">
                  <p class="tarjeta-titulo">Total a Pagar</p>
                  <p class="tarjeta-valor total">Q {{ formatearMoneda(solicitud.prestamo.totalAPagar) }}</p>
                </div>
              </div>
            </div>

            <!-- Detalles del Plan -->
            <div class="plan-detalles">
              <h3>Plan de Pagos</h3>
              <div class="info-grid">
                <div class="detalle-item">
                  <span class="detalle-label">Plazo</span>
                  <span class="detalle-valor">{{ solicitud.prestamo.plazoMeses }} {{ solicitud.prestamo.plazoMeses === 1 ? 'mes' : 'meses' }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Modalidad de Pago</span>
                  <span class="detalle-valor">{{ formatModalidad(solicitud.prestamo.modalidadPago) }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Número de Pagos</span>
                  <span class="detalle-valor">{{ solicitud.prestamo.numeroPagos }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Monto por Pago</span>
                  <span class="detalle-valor destacado">Q {{ formatearMoneda(solicitud.prestamo.montoPorPago) }}</span>
                </div>
                <div class="detalle-item">
                  <span class="detalle-label">Interés Total</span>
                  <span class="detalle-valor">Q {{ formatearMoneda(solicitud.prestamo.interesTotal) }}</span>
                </div>
                <div class="detalle-item" v-if="solicitud.prestamo.comisionApertura">
                  <span class="detalle-label">Comisión de Apertura</span>
                  <span class="detalle-valor">Q {{ formatearMoneda(solicitud.prestamo.comisionApertura) }}</span>
                </div>
              </div>
            </div>

            <!-- Cronograma de Pagos -->
            <div class="cronograma-pagos" v-if="solicitud.prestamo.planPagos && solicitud.prestamo.planPagos.length > 0">
              <h3>Cronograma de Pagos</h3>
              <div class="tabla-wrapper">
                <table class="tabla-pagos">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Fecha</th>
                      <th>Capital</th>
                      <th>Interés</th>
                      <th>Total Cuota</th>
                      <th>Saldo Pendiente</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="pago in solicitud.prestamo.planPagos" :key="pago.numeroPago">
                      <td>{{ pago.numeroPago }}</td>
                      <td>{{ formatearFecha(pago.fechaPago) }}</td>
                      <td>Q {{ formatearMoneda(pago.capital) }}</td>
                      <td>Q {{ formatearMoneda(pago.interes) }}</td>
                      <td class="destacado">Q {{ formatearMoneda(pago.montoPago) }}</td>
                      <td>Q {{ formatearMoneda(pago.saldoPendiente) }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <!-- PESTAÑA: ARCHIVOS ADJUNTOS -->
        <div v-if="pestanaActiva === 'archivos'" class="pestaña-content">
          <div class="archivos-section">
            <div class="section-header">
              <h2>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M13 7H7C5.89543 7 5 7.89543 5 9V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V13M13 7L19 13M13 7V13H19" stroke="currentColor" stroke-width="2"/>
                </svg>
                Archivos Adjuntos
              </h2>
            </div>

            <div v-if="loadingArchivos" class="archivos-loading">
              <div class="spinner-small"></div>
              <p>Cargando archivos...</p>
            </div>

            <div v-else-if="archivos.length === 0" class="sin-archivos">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
                <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>No hay archivos adjuntos en esta solicitud</p>
            </div>

            <div v-else class="archivos-grid">
              <div v-for="archivo in archivos" :key="archivo.id" class="archivo-card" @click="verImagen(archivo)">
                <div v-if="esImagen(archivo)" class="archivo-foto">
                  <img :src="construirUrlArchivo(archivo.rutaArchivo)" :alt="archivo.nombreArchivo" />
                  <div class="archivo-overlay">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M2.5 12C2.5 7.52166 2.5 5.28249 3.89124 3.89124C5.28249 2.5 7.52166 2.5 12 2.5C16.4783 2.5 18.7175 2.5 20.1088 3.89124C21.5 5.28249 21.5 7.52166 21.5 12C21.5 16.4783 21.5 18.7175 20.1088 20.1088C18.7175 21.5 16.4783 21.5 12 21.5C7.52166 21.5 5.28249 21.5 3.89124 20.1088C2.5 18.7175 2.5 16.4783 2.5 12Z" stroke="currentColor" stroke-width="2"/>
                      <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor"/>
                      <path d="M21.5 16L18.6612 13.1612C18.078 12.578 17.1119 12.5771 16.5275 13.1592L13.5 16.1745M13.5 16.1745L11.9179 14.5979C11.3324 14.0149 10.3639 14.0165 9.78042 14.6017L2.5 21.9183M13.5 16.1745L16 18.6745" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                </div>
                <div v-else class="archivo-documento">
                  <div class="documento-icono">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                      <path d="M9 12H15M9 16H15M17 21H7C5.89543 21 5 20.1046 5 19V5C5 3.89543 5.89543 3 7 3H12.5858C12.851 3 13.1054 3.10536 13.2929 3.29289L18.7071 8.70711C18.8946 8.89464 19 9.149 19 9.41421V19C19 20.1046 18.1046 21 17 21Z" stroke="currentColor" stroke-width="2"/>
                    </svg>
                  </div>
                  <div class="documento-info">
                    <p class="documento-nombre">{{ archivo.nombreArchivo }}</p>
                    <p class="documento-tipo">{{ formatTipoDocumento(archivo.tipo) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- FORMULARIO DE EVALUACIÓN -->
      <div class="evaluacion-section" v-if="solicitud.estado === 'Pendiente'">
        <div class="section-header">
          <h2>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
            Evaluación de la Solicitud
          </h2>
        </div>
        
        <div class="form-evaluacion">
          <div class="form-group">
            <label>Monto Autorizado</label>
            <div class="input-con-simbolo">
              <span class="simbolo-quetzal">Q</span>
              <input 
                type="number" 
                v-model.number="formEvaluacion.montoAutorizado"
                step="0.01"
                min="0"
                :max="solicitud.prestamo.montoSolicitado"
                placeholder="0.00"
                class="input-monto"
              />
            </div>
            <p class="form-help">Monto máximo solicitado: Q {{ formatearMoneda(solicitud.prestamo.montoSolicitado) }}</p>
          </div>

          <div class="form-group">
            <label>Observaciones</label>
            <textarea 
              v-model="formEvaluacion.observaciones"
              rows="4"
              placeholder="Ingrese observaciones sobre la evaluación (opcional)"
              class="input-textarea"
            ></textarea>
          </div>

          <div v-if="errorSubmit" class="error-mensaje">
            {{ errorSubmit }}
          </div>

          <div class="botones-evaluacion">
            <button 
              @click="abrirConfirmacion('Aprobada')"
              :disabled="!formValido || submitting"
              class="btn-aprobar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
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

      <!-- ESTADO EVALUADO -->
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

    <!-- MODAL VISUALIZADOR DE IMÁGENES -->
    <div v-if="imagenVisualizando" class="modal-imagen-overlay" @click="cerrarVisualizadorImagen">
      <div class="modal-imagen-content" @click.stop>
        <button @click="cerrarVisualizadorImagen" class="btn-cerrar-imagen">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
            <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        <img :src="imagenVisualizando" alt="Imagen del artículo" />
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
    
    // Cargar archivos automáticamente
    await cargarArchivos()
    
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
    
    // CORRECCIÓN: Usar la ruta del evaluador
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

// CORRECCIÓN CRÍTICA: Construir URL de archivos correctamente
const construirUrlArchivo = (rutaArchivo) => {
  if (!rutaArchivo) return ''
  
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

const esImagen = (archivo) => {
  const tiposImagen = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  return tiposImagen.includes(archivo.tipoMime) || archivo.tipo === 'Foto_Prenda'
}

const verImagen = (archivo) => {
  if (esImagen(archivo)) {
    imagenVisualizando.value = construirUrlArchivo(archivo.rutaArchivo)
  }
}

const cerrarVisualizadorImagen = () => {
  imagenVisualizando.value = null
}

const descargarArchivo = (archivo) => {
  const url = construirUrlArchivo(archivo.rutaArchivo)
  window.open(url, '_blank')
}

const formatTipoDocumento = (tipo) => {
  const tipos = {
    'Foto_Prenda': 'Fotografía',
    'Especificaciones': 'Especificaciones Técnicas',
    'Factura': 'Factura',
    'Garantia': 'Garantía'
  }
  return tipos[tipo] || tipo
}

const formatModalidad = (modalidad) => {
  const modalidades = {
    'mensual': 'Mensual',
    'quincenal': 'Quincenal',
    'semanal': 'Semanal',
    'contado': 'Pago al Contado'
  }
  return modalidades[modalidad] || modalidad
}

const formatearFecha = (fecha) => {
  if (!fecha) return 'N/A'
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearMoneda = (valor) => {
  if (!valor) return '0.00'
  return parseFloat(valor).toLocaleString('es-GT', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
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

    const datosEvaluacion = {
      estado: decisionPendiente.value,
      montoAutorizado: formEvaluacion.value.montoAutorizado,
      observaciones: formEvaluacion.value.observaciones
    }

    console.log('Enviando evaluación:', datosEvaluacion)

    const response = await api(`/evaluador/solicitudes/${route.params.id}/evaluar`, {
      method: 'POST',
      body: JSON.stringify(datosEvaluacion)
    })

    console.log('Evaluación exitosa:', response)
    
    // Recargar la solicitud
    await cargarSolicitud()
    cerrarConfirmacion()

  } catch (err) {
    console.error('Error evaluando solicitud:', err)
    errorSubmit.value = err.message || 'Error al procesar la evaluación'
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  cargarSolicitud()
})
</script>

<style scoped>
/* ===== VARIABLES CSS CON PALETA CORPORATIVA ===== */
:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-dorado-claro: #F4D03F;
  --color-rojo-granate: #8B0000;
  --color-verde-bosque: #1B4332;
  
  --border-radius: 12px;
  --shadow-card: 0 15px 35px rgba(26, 26, 26, 0.2);
  --transition: all 0.3s ease;
}

/* ===== ESTILOS BASE ===== */
.evaluador-detalle-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem 0;
}

.detalle-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* ===== LOADING Y ERROR ===== */
.loading-container, .error-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  color: var(--color-blanco-perla);
  padding: 2rem;
}

.loading-spinner svg {
  color: var(--color-dorado-vintage);
}

.error-icon {
  color: var(--color-rojo-granate);
  margin-bottom: 1rem;
}

.error-container h2 {
  font-size: 1.75rem;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: var(--color-gris-acero);
  margin-bottom: 2rem;
}

/* ===== HEADER ===== */
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
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0 0 0.5rem 0;
}

.header-info h1 svg {
  color: var(--color-dorado-vintage);
}

.fecha-solicitud {
  color: var(--color-gris-acero);
  margin: 0;
}

.estado-badge {
  padding: 0.75rem 1.5rem;
  border-radius: 2rem;
  font-weight: 700;
  font-size: 0.95rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.estado-badge.estado-pendiente {
  background: #FEF3C7;
  color: #92400E;
}

.estado-badge.estado-aprobada {
  background: #D1FAE5;
  color: #065F46;
}

.estado-badge.estado-rechazada {
  background: #FEE2E2;
  color: var(--color-rojo-granate);
}

/* ===== PESTAÑAS ===== */
.pestanas-navegacion {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  background: var(--color-blanco-perla);
  padding: 1rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow-x: auto;
}

.btn-pestana {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  border: 2px solid transparent;
  background: transparent;
  color: var(--color-gris-acero);
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.btn-pestana:hover {
  background: #F8FAFC;
  transform: translateY(-2px);
}

.btn-pestana.active {
  background: var(--color-dorado-vintage);
  color: white;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.contador-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 700;
}

.btn-pestana.active .contador-badge {
  background: rgba(255, 255, 255, 0.2);
}

/* ===== CONTENIDO ===== */
.pestaña-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.info-section, .financiero-section, .archivos-section, .evaluacion-section {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  margin-bottom: 2rem;
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
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0;
}

.section-header h2 svg {
  color: var(--color-dorado-vintage);
}

/* ===== INFO GRID ===== */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.info-card {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  padding: 1.75rem;
  background: white;
  border-radius: var(--border-radius);
  border: 2px solid #e5e7eb;
  transition: var(--transition);
}

.info-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.15);
  border-color: var(--color-dorado-vintage);
}

.info-icon {
  padding: 1.25rem;
  background: var(--color-dorado-vintage);
  border-radius: var(--border-radius);
  color: white;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.info-icon.dorado {
  background: var(--color-dorado-vintage);
}

.info-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  flex: 1;
}

.info-label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.info-value {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.info-value.monto {
  color: var(--color-dorado-vintage);
  font-size: 1.5rem;
}

/* ===== FINANCIERO ===== */
.tarjetas-financieras {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.tarjeta-financiera {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 2rem;
  border-radius: 16px;
  transition: var(--transition);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tarjeta-financiera.amarillo {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 100%);
}

.tarjeta-financiera.azul {
  background: linear-gradient(135deg, #DBEAFE 0%, #BFDBFE 100%);
}

.tarjeta-financiera.verde {
  background: linear-gradient(135deg, #D1FAE5 0%, #A7F3D0 100%);
}

.tarjeta-financiera:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tarjeta-icono {
  padding: 1rem;
  background: rgba(255, 255, 255, 0.5);
  border-radius: 12px;
  color: var(--color-negro-carbon);
}

.tarjeta-contenido {
  flex: 1;
}

.tarjeta-titulo {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 0.5rem 0;
}

.tarjeta-valor {
  font-size: 2rem;
  font-weight: 800;
  color: var(--color-negro-carbon);
  margin: 0;
}

.tarjeta-valor.total {
  color: var(--color-verde-bosque);
}

/* ===== PLAN DETALLES ===== */
.plan-detalles, .cronograma-pagos {
  padding: 2rem;
  border-top: 1px solid #e5e7eb;
}

.plan-detalles h3, .cronograma-pagos h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin: 0 0 1.5rem 0;
}

.detalle-item {
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.detalle-label {
  font-weight: 600;
  color: var(--color-gris-acero);
}

.detalle-valor {
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.detalle-valor.destacado {
  color: var(--color-dorado-vintage);
  font-size: 1.125rem;
}

/* ===== TABLA PAGOS ===== */
.tabla-wrapper {
  overflow-x: auto;
  border-radius: 8px;
}

.tabla-pagos {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.tabla-pagos th, .tabla-pagos td {
  padding: 1rem;
  text-align: left;
  border-bottom: 1px solid #e5e7eb;
}

.tabla-pagos th {
  background: var(--color-gris-acero);
  color: white;
  font-weight: 700;
  text-transform: uppercase;
  font-size: 0.875rem;
  letter-spacing: 0.5px;
}

.tabla-pagos td {
  color: var(--color-negro-carbon);
}

.tabla-pagos td.destacado {
  font-weight: 800;
  color: var(--color-dorado-vintage);
}

.tabla-pagos tr:hover {
  background: #f8fafc;
}

/* ===== ARCHIVOS ===== */
.archivos-loading, .sin-archivos {
  text-align: center;
  padding: 4rem 2rem;
  color: var(--color-gris-acero);
}

.spinner-small {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(212, 175, 55, 0.3);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.sin-archivos svg {
  color: #d1d5db;
  margin-bottom: 1rem;
}

.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.archivo-card {
  border-radius: 12px;
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.archivo-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.archivo-foto {
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  background: #f3f4f6;
}

.archivo-foto img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.archivo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(26, 26, 26, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
  color: white;
}

.archivo-foto:hover .archivo-overlay {
  opacity: 1;
}

.archivo-documento {
  padding: 2rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  background: white;
  text-align: center;
}

.archivo-documento:hover {
  background: var(--color-dorado-vintage);
}

.archivo-documento:hover .documento-icono,
.archivo-documento:hover .documento-info {
  color: white;
}

.documento-icono {
  color: var(--color-dorado-vintage);
  transition: var(--transition);
}

.documento-nombre {
  font-weight: 700;
  color: var(--color-negro-carbon);
  font-size: 0.875rem;
  margin: 0;
  word-break: break-word;
}

.documento-tipo {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
  margin: 0;
}

/* ===== EVALUACIÓN ===== */
.form-evaluacion {
  padding: 2rem;
}

.form-group {
  margin-bottom: 2rem;
}

.form-group label {
  display: block;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.input-con-simbolo {
  position: relative;
}

.simbolo-quetzal {
  position: absolute;
  left: 1.5rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-dorado-vintage);
  font-weight: 800;
  font-size: 1.25rem;
}

.input-monto {
  width: 100%;
  padding: 1rem 1.5rem 1rem 3.5rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  transition: var(--transition);
}

.input-monto:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
}

.input-textarea {
  width: 100%;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  border-radius: var(--border-radius);
  font-size: 1rem;
  font-family: inherit;
  color: var(--color-negro-carbon);
  resize: vertical;
  min-height: 120px;
  transition: var(--transition);
}

.input-textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
}

.form-help {
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

/* ===== ESTADO EVALUADO ===== */
.estado-evaluado {
  padding: 2rem;
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
  background: rgba(255, 255, 255, 0.6);
  border-radius: 12px;
  font-size: 1rem;
}

/* ===== MODALES ===== */
.modal-overlay, .modal-imagen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
  animation: fadeIn 0.2s ease;
}

.modal-content {
  background: white;
  padding: 2.5rem;
  border-radius: 20px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-content h3 {
  margin: 0 0 1.5rem 0;
  color: var(--color-negro-carbon);
  font-size: 1.5rem;
  font-weight: 800;
}

.modal-content p {
  margin-bottom: 2rem;
  color: var(--color-gris-acero);
  line-height: 1.6;
}

.modal-botones {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-primary, .btn-secondary {
  padding: 1rem 2rem;
  border-radius: var(--border-radius);
  font-weight: 700;
  cursor: pointer;
  transition: var(--transition);
  border: none;
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-primary:hover {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
}

.btn-secondary {
  background: #f3f4f6;
  color: var(--color-gris-acero);
}

.btn-secondary:hover:not(:disabled) {
  background: #e5e7eb;
}

.btn-secondary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Modal de imagen */
.modal-imagen-content {
  max-width: 90vw;
  max-height: 90vh;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
}

.modal-imagen-content img {
  max-width: 100%;
  max-height: 90vh;
  display: block;
}

.btn-cerrar-imagen {
  position: absolute;
  top: -4rem;
  right: 0;
  background: white;
  border: none;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-negro-carbon);
  transition: var(--transition);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.btn-cerrar-imagen:hover {
  background: var(--color-dorado-vintage);
  color: white;
  transform: rotate(90deg);
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
  }

  .pestanas-navegacion {
    flex-direction: column;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }

  .tarjetas-financieras {
    grid-template-columns: 1fr;
  }

  .botones-evaluacion {
    flex-direction: column;
  }

  .archivos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style>