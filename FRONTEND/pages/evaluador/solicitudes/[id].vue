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

      <!-- NAVEGACIÓN DE PESTAÑAS -->
      <div class="pestanas-navegacion">
        <button 
          @click="pestanaActiva = 'informacion'"
          :class="['btn-pestana', { active: pestanaActiva === 'informacion' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
            <path d="M12 8V12" stroke="currentColor" stroke-width="2"/>
            <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
          </svg>
          Información General
        </button>

        <button 
          @click="pestanaActiva = 'financiero'"
          :class="['btn-pestana', { active: pestanaActiva === 'financiero' }]"
          v-if="solicitud.prestamo"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
            <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Detalles Financieros
          <span v-if="solicitud.prestamo.montoSolicitado" class="contador-badge">
            Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}
          </span>
        </button>

        <button 
          @click="pestanaActiva = 'archivos'"
          :class="['btn-pestana', { active: pestanaActiva === 'archivos' }]"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
            <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
          </svg>
          Archivos Adjuntos
          <span v-if="archivos.length > 0" class="contador-badge">{{ archivos.length }}</span>
        </button>
      </div>

      <!-- CONTENIDO DE PESTAÑAS -->
      
      <!-- PESTAÑA: INFORMACIÓN GENERAL -->
      <div v-if="pestanaActiva === 'informacion'" class="pestaña-content">
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
              <span class="value">{{ solicitud.usuario?.nombre }} {{ solicitud.usuario?.apellido }}</span>
            </div>
            <div class="info-item">
              <span class="label">Cédula:</span>
              <span class="value">{{ solicitud.usuario?.cedula || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Email:</span>
              <span class="value">{{ solicitud.usuario?.email || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Teléfono:</span>
              <span class="value">{{ solicitud.usuario?.telefono || 'N/A' }}</span>
            </div>
            <div class="info-item full-width">
              <span class="label">Dirección:</span>
              <span class="value">{{ solicitud.usuario?.direccion || 'N/A' }}</span>
            </div>
          </div>
        </div>

        <!-- INFORMACIÓN DEL ARTÍCULO -->
        <div v-for="articulo in solicitud.articulos" :key="articulo.id" class="info-card articulo-info">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V12L15 15" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Información del Artículo
            </h3>
          </div>
          <div class="info-grid">
            <div class="info-item">
              <span class="label">Tipo de Artículo:</span>
              <span class="value">{{ articulo.tipoArticulo?.nombre || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Marca:</span>
              <span class="value">{{ articulo.marca || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Modelo:</span>
              <span class="value">{{ articulo.modelo || 'N/A' }}</span>
            </div>
            <div class="info-item">
              <span class="label">Valor Estimado por el Cliente:</span>
              <span class="value highlight">Q{{ formatCurrency(articulo.valorEstimadoCliente) }}</span>
            </div>
            <div v-if="articulo.descripcion" class="info-item full-width">
              <span class="label">Descripción:</span>
              <span class="value">{{ articulo.descripcion }}</span>
            </div>
          </div>
        </div>

        <!-- RESUMEN DE LA SOLICITUD DEL CLIENTE -->
        <div v-if="solicitud.prestamo" class="info-card solicitud-resumen">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
              </svg>
              Solicitud del Cliente
            </h3>
          </div>
          <div class="solicitud-grid">
            <div class="solicitud-item destacado">
              <div class="solicitud-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="solicitud-info">
                <span class="solicitud-label">Monto Solicitado</span>
                <span class="solicitud-valor">Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
              </div>
            </div>

            <div class="solicitud-item">
              <div class="solicitud-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="solicitud-info">
                <span class="solicitud-label">Plazo</span>
                <span class="solicitud-valor">{{ solicitud.prestamo.plazoMeses }} meses</span>
              </div>
            </div>

            <div class="solicitud-item">
              <div class="solicitud-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="solicitud-info">
                <span class="solicitud-label">Tasa de Interés</span>
                <span class="solicitud-valor">{{ solicitud.prestamo.tasaInteres }}% mensual</span>
              </div>
            </div>

            <div class="solicitud-item">
              <div class="solicitud-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="solicitud-info">
                <span class="solicitud-label">Modalidad de Pago</span>
                <span class="solicitud-valor modalidad">{{ formatModalidad(solicitud.prestamo.modalidadPago) }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- FORMULARIO DE EVALUACIÓN SIMPLIFICADO -->
        <div class="evaluacion-form">
          <div class="form-header">
            <h2>Formulario de Evaluación</h2>
            <p class="form-subtitle">Decide el monto a autorizar para esta solicitud</p>
          </div>

          <div class="form-content">
            <!-- Referencia del monto solicitado -->
            <div class="monto-referencia">
              <div class="referencia-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 8V12" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="referencia-content">
                  <span class="referencia-label">Monto que solicita el cliente:</span>
                  <span class="referencia-valor">Q{{ formatCurrency(solicitud.prestamo?.montoSolicitado || 0) }}</span>
                </div>
              </div>
              <div class="referencia-item">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                <div class="referencia-content">
                  <span class="referencia-label">Valoración del cliente:</span>
                  <span class="referencia-valor">Q{{ formatCurrency(solicitud.articulos?.[0]?.valorEstimadoCliente || 0) }}</span>
                </div>
              </div>
            </div>

            <!-- Campo de monto a autorizar -->
            <div class="form-group-large">
              <label for="montoAutorizado">Monto Autorizado del Préstamo (Q) *</label>
              <div class="input-monto-wrapper">
                <span class="currency-prefix">Q</span>
                <input
                  id="montoAutorizado"
                  v-model="formEvaluacion.montoAutorizado"
                  type="number"
                  step="0.01"
                  min="0"
                  :max="solicitud.prestamo?.montoSolicitado"
                  placeholder="0.00"
                  required
                  class="input-monto"
                />
              </div>
              <p class="input-help">Puedes autorizar hasta el monto solicitado o menos según tu evaluación</p>
            </div>

            <!-- Observaciones -->
            <div class="form-group-large">
              <label for="observaciones">Observaciones de la Evaluación</label>
              <textarea
                id="observaciones"
                v-model="formEvaluacion.observaciones"
                rows="4"
                placeholder="Escribe tus observaciones sobre la solicitud, el artículo y el monto autorizado..."
              ></textarea>
            </div>
          </div>

          <!-- MENSAJES DE ERROR -->
          <div v-if="errorSubmit" class="alert alert-error">
            {{ errorSubmit }}
          </div>

          <!-- BOTONES DE ACCIÓN -->
          <div class="form-actions">
            <button
              @click="prepararSubmit('Rechazada')"
              class="btn btn-reject"
              :disabled="submitting"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
                <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
              </svg>
              Rechazar Solicitud
            </button>

            <button
              @click="prepararSubmit('Aprobada')"
              class="btn btn-approve"
              :disabled="!formValido || submitting"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              Aprobar Solicitud
            </button>
          </div>
        </div>
      </div>

      <!-- PESTAÑA: DETALLES FINANCIEROS -->
      <div v-if="pestanaActiva === 'financiero' && solicitud.prestamo" class="pestaña-content">
        <div class="info-card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
              </svg>
              Resumen Financiero Solicitado
            </h3>
          </div>

          <!-- MONTOS PRINCIPALES -->
          <div class="montos-grid">
            <div class="monto-card principal">
              <div class="monto-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="1" x2="12" y2="23" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5C7.01 5 5 7.01 5 9.5S7.01 14 9.5 14H14.5C16.99 14 19 16.01 19 18.5S16.99 23 14.5 23H6" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="monto-info">
                <span class="monto-label">Monto Solicitado</span>
                <span class="monto-valor">Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
              </div>
            </div>

            <div class="monto-card">
              <div class="monto-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <path d="M12 6V12L16 14" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="monto-info">
                <span class="monto-label">Plazo</span>
                <span class="monto-valor">{{ solicitud.prestamo.plazoMeses }} meses</span>
              </div>
            </div>

            <div class="monto-card">
              <div class="monto-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L15 8L22 9L17 14L18 21L12 18L6 21L7 14L2 9L9 8L12 2Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="monto-info">
                <span class="monto-label">Tasa de Interés</span>
                <span class="monto-valor">{{ solicitud.prestamo.tasaInteres }}%</span>
              </div>
            </div>

            <div class="monto-card">
              <div class="monto-icono">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="monto-info">
                <span class="monto-label">Modalidad de Pago</span>
                <span class="monto-valor modalidad">{{ formatModalidad(solicitud.prestamo.modalidadPago) }}</span>
              </div>
            </div>
          </div>

          <!-- TOTAL A PAGAR -->
          <div v-if="solicitud.prestamo.resumenFinanciero" class="total-pagar">
            <div class="total-item">
              <span class="total-label">Monto del Préstamo</span>
              <span class="total-valor">Q{{ formatCurrency(solicitud.prestamo.montoSolicitado) }}</span>
            </div>
            <div class="total-item">
              <span class="total-label">Total Intereses</span>
              <span class="total-valor">Q{{ formatCurrency(solicitud.prestamo.resumenFinanciero.interesTotal) }}</span>
            </div>
            <div class="total-item destacado">
              <span class="total-label">Total a Pagar</span>
              <span class="total-valor">Q{{ formatCurrency(solicitud.prestamo.resumenFinanciero.totalPagar) }}</span>
            </div>
          </div>

          <!-- PLAN DE PAGOS -->
          <div v-if="solicitud.prestamo.planPagos && solicitud.prestamo.planPagos.length > 0" class="plan-pagos">
            <h4>Plan de Pagos Propuesto</h4>
            <div class="tabla-pagos">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Fecha</th>
                    <th>Capital</th>
                    <th>Interés</th>
                    <th>Total Cuota</th>
                    <th>Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="pago in solicitud.prestamo.planPagos" :key="pago.numeroPago">
                    <td>{{ pago.numeroPago }}</td>
                    <td>{{ formatDateShort(pago.fechaPago) }}</td>
                    <td>Q{{ formatCurrency(pago.capital) }}</td>
                    <td>Q{{ formatCurrency(pago.interes) }}</td>
                    <td class="destacado">Q{{ formatCurrency(pago.montoPago) }}</td>
                    <td>Q{{ formatCurrency(pago.saldoPendiente) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- PESTAÑA: ARCHIVOS ADJUNTOS -->
      <div v-if="pestanaActiva === 'archivos'" class="pestaña-content">
        <div class="info-card">
          <div class="card-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
                <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
              </svg>
              Archivos Adjuntos
            </h3>
            <button @click="cargarArchivos" class="btn-refresh-archivos" :disabled="loadingArchivos">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :class="{ spinning: loadingArchivos }">
                <polyline points="23,4 23,10 17,10" stroke="currentColor" stroke-width="2"/>
                <polyline points="1,20 1,14 7,14" stroke="currentColor" stroke-width="2"/>
                <path d="M3.51 9A9 9 0 0 1 20.49 15" stroke="currentColor" stroke-width="2"/>
                <path d="M20.49 15A9 9 0 0 1 3.51 9" stroke="currentColor" stroke-width="2"/>
              </svg>
            </button>
          </div>

          <!-- LOADING ARCHIVOS -->
          <div v-if="loadingArchivos" class="archivos-loading">
            <div class="spinner-small"></div>
            <p>Cargando archivos...</p>
          </div>

          <!-- SIN ARCHIVOS -->
          <div v-else-if="archivos.length === 0" class="sin-archivos">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
              <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
              <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
            </svg>
            <p>No hay archivos adjuntos</p>
          </div>

          <!-- LISTA DE ARCHIVOS -->
          <div v-else class="archivos-grid">
            <div v-for="archivo in archivos" :key="archivo.id" class="archivo-card">
              <!-- Si es foto -->
              <div v-if="archivo.tipo === 'Foto_Prenda'" class="archivo-foto" @click="verImagen(archivo)">
                <img :src="construirUrlArchivo(archivo.rutaArchivo)" :alt="archivo.nombreArchivo" />
                <div class="archivo-overlay">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                    <path d="M1 12C1 12 5 4 12 4C19 4 23 12 23 12C23 12 19 20 12 20C5 20 1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </div>
              </div>

              <!-- Si es documento -->
              <div v-else class="archivo-documento" @click="descargarArchivo(archivo)">
                <div class="documento-icono">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
                    <polyline points="13,2 13,9 20,9" stroke="currentColor" stroke-width="2"/>
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

    <!-- MODAL DE CONFIRMACIÓN -->
    <div v-if="mostrarModalConfirmacion" class="modal-overlay" @click="cerrarModal">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>Confirmar {{ decisionPendiente === 'Aprobada' ? 'Aprobación' : 'Rechazo' }}</h3>
        </div>
        <div class="modal-body">
          <p>¿Está seguro que desea {{ decisionPendiente === 'Aprobada' ? 'aprobar' : 'rechazar' }} esta solicitud?</p>
          
          <div v-if="decisionPendiente === 'Aprobada'" class="summary">
            <div class="summary-item">
              <span>Monto Solicitado por el Cliente:</span>
              <strong>Q{{ formatCurrency(solicitud.prestamo?.montoSolicitado || 0) }}</strong>
            </div>
            <div class="summary-item highlight">
              <span>Monto Autorizado:</span>
              <strong>Q{{ formatCurrency(formEvaluacion.montoAutorizado) }}</strong>
            </div>
            <div v-if="formEvaluacion.observaciones" class="summary-observaciones">
              <span>Observaciones:</span>
              <p>{{ formEvaluacion.observaciones }}</p>
            </div>
          </div>
        </div>
        <div class="modal-actions">
          <button @click="cerrarModal" class="btn btn-secondary" :disabled="submitting">
            Cancelar
          </button>
          <button @click="confirmarSubmit" class="btn btn-primary" :disabled="submitting">
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
    
    const response = await api(`/solicitudes/${solicitudId}/archivos`)
    
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

const construirUrlArchivo = (rutaArchivo) => {
  if (!rutaArchivo) return ''
  if (rutaArchivo.startsWith('http')) return rutaArchivo
  return `${config.public.apiBase}${rutaArchivo}`
}

const verImagen = (archivo) => {
  imagenVisualizando.value = construirUrlArchivo(archivo.rutaArchivo)
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
    'al_vencimiento': 'Al Vencimiento',
    'contado': 'Contado'
  }
  return modalidades[modalidad] || modalidad
}

const prepararSubmit = (decision) => {
  if (decision === 'Aprobada' && !formValido.value) {
    errorSubmit.value = 'Por favor ingresa el monto autorizado'
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
      montoAutorizado: parseFloat(formEvaluacion.value.montoAutorizado),
      observaciones: formEvaluacion.value.observaciones || null,
      estado: decisionPendiente.value
    }
    
    console.log('Enviando evaluación:', datosEvaluacion)
    
    const response = await api(`/evaluador/solicitudes/${solicitudId}/evaluar`, {
      method: 'POST',
      body: JSON.stringify(datosEvaluacion)
    })
    
    console.log('Evaluación guardada:', response)
    
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

const formatDateShort = (date) => {
  if (!date) return 'N/A'
  return new Date(date).toLocaleDateString('es-GT', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

onMounted(() => {
  cargarSolicitud()
})
</script>

<style scoped>
/* Todos los estilos CSS del artifact anterior se mantienen igual, 
   solo se agregan los nuevos estilos para el formulario simplificado */

/* NUEVOS ESTILOS PARA FORMULARIO SIMPLIFICADO */

.form-subtitle {
  color: var(--color-gris-acero);
  font-size: 0.875rem;
  margin-top: 0.5rem;
}

.form-content {
  padding: 0;
}

.monto-referencia {
  background: linear-gradient(135deg, #F0F9FF, #E0F2FE);
  border: 2px solid #0EA5E9;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  display: flex;
  gap: 2rem;
}

.referencia-item {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  flex: 1;
}

.referencia-item svg {
  color: #0EA5E9;
  flex-shrink: 0;
  margin-top: 0.25rem;
}

.referencia-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.referencia-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.referencia-valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0284C7;
}

.form-group-large {
  margin-bottom: 2rem;
}

.form-group-large label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 0.75rem;
}

.input-monto-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.currency-prefix {
  position: absolute;
  left: 1rem;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-dorado-vintage);
  pointer-events: none;
}

.input-monto {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 3px solid #E5E7EB;
  border-radius: 12px;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  transition: all 0.3s ease;
  background: white;
}

.input-monto:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 4px rgba(212, 175, 55, 0.1);
}

.input-help {
  margin-top: 0.5rem;
  font-size: 0.875rem;
  color: var(--color-gris-acero);
  font-style: italic;
}

.form-group-large textarea {
  width: 100%;
  padding: 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  font-size: 1rem;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.3s ease;
}

.form-group-large textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.solicitud-resumen {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border: 2px solid var(--color-dorado-vintage);
}

.solicitud-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.solicitud-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  border: 2px solid #E5E7EB;
  transition: all 0.3s ease;
}

.solicitud-item.destacado {
  border-color: var(--color-dorado-vintage);
  background: linear-gradient(135deg, white, #FFFBEB);
}

.solicitud-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.solicitud-icono {
  width: 60px;
  height: 60px;
  background: var(--color-azul-marino);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.solicitud-item.destacado .solicitud-icono {
  background: var(--color-dorado-vintage);
}

.solicitud-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.solicitud-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-gris-acero);
}

.solicitud-valor {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.solicitud-item.destacado .solicitud-valor {
  font-size: 1.5rem;
  color: var(--color-dorado-vintage);
}

.solicitud-valor.modalidad {
  font-size: 1rem;
  text-transform: capitalize;
}

.summary-observaciones {
  grid-column: 1 / -1;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #E5E7EB;
}

.summary-observaciones span {
  display: block;
  font-weight: 600;
  color: var(--color-gris-acero);
  margin-bottom: 0.5rem;
}

.summary-observaciones p {
  color: var(--color-negro-carbon);
  font-style: italic;
  line-height: 1.5;
  margin: 0;
}

/* Responsive para formulario simplificado */
@media (max-width: 768px) {
  .monto-referencia {
    flex-direction: column;
    gap: 1rem;
  }

  .input-monto {
    font-size: 1.5rem;
    padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  }

  .currency-prefix {
    font-size: 1.25rem;
    left: 0.75rem;
  }

  .solicitud-grid {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
}


:root {
  --color-negro-carbon: #1A1A1A;
  --color-blanco-perla: #F5F5F5;
  --color-gris-acero: #4A4A4A;
  --color-azul-marino: #2C3E50;
  --color-dorado-vintage: #D4AF37;
  --color-dorado-claro: #F4D03F;
  --color-rojo-granate: #8B0000;
  --color-verde-bosque: #1B4332;
}

.evaluacion-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
}

/* NAVIGATION HEADER */
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

/* LOADING STATE */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  color: var(--color-blanco-perla);
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid rgba(212, 175, 55, 0.3);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ERROR STATE */
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

.error-icon {
  margin-bottom: 1.5rem;
  color: var(--color-rojo-granate);
}

.error-container h2 {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
}

.error-container p {
  color: #94A3B8;
  margin-bottom: 2rem;
}

.error-actions {
  display: flex;
  gap: 1rem;
}

.btn-retry,
.btn-volver {
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-decoration: none;
  display: inline-block;
}

.btn-retry {
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
}

.btn-volver {
  background: transparent;
  color: var(--color-blanco-perla);
  border: 2px solid var(--color-blanco-perla);
}

/* EVALUACION CONTAINER */
.evaluacion-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* SOLICITUD HEADER */
.solicitud-header {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
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
  font-size: 1rem;
}

.estado-badge {
  display: inline-block;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
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

/* PESTAÑAS NAVEGACIÓN */
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
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid transparent;
  background: transparent;
  color: var(--color-gris-acero);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.btn-pestana:hover {
  background: #F8FAFC;
}

.btn-pestana.active {
  background: var(--color-dorado-vintage);
  color: white;
  border-color: var(--color-dorado-vintage);
}

.contador-badge {
  background: rgba(255, 255, 255, 0.3);
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
}

.btn-pestana.active .contador-badge {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

/* PESTAÑA CONTENT */
.pestaña-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

/* INFO CARDS */
.info-card {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.card-header {
  margin-bottom: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.card-header h3 svg {
  color: var(--color-dorado-vintage);
}

.btn-refresh-archivos {
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh-archivos:hover:not(:disabled) {
  background: var(--color-dorado-claro);
  transform: rotate(90deg);
}

.btn-refresh-archivos:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.spinning {
  animation: spin 1s linear infinite;
}

/* INFO GRID */
.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.info-item.full-width {
  grid-column: 1 / -1;
}

.info-item .label {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.info-item .value {
  font-size: 1rem;
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.info-item .value.highlight {
  color: var(--color-dorado-vintage);
  font-size: 1.25rem;
}

/* MONTOS GRID (Pestaña Financiero) */
.montos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.monto-card {
  background: linear-gradient(135deg, #F8FAFC, #F1F5F9);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  border: 2px solid #E2E8F0;
  transition: all 0.3s ease;
}

.monto-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
}

.monto-card.principal {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  border-color: var(--color-dorado-vintage);
}

.monto-icono {
  width: 56px;
  height: 56px;
  background: white;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-dorado-vintage);
  flex-shrink: 0;
}

.monto-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.monto-label {
  font-size: 0.875rem;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.monto-valor {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.monto-valor.modalidad {
  font-size: 1.25rem;
  text-transform: capitalize;
}

/* TOTAL A PAGAR */
.total-pagar {
  background: linear-gradient(135deg, #EFF6FF, #DBEAFE);
  border: 2px solid #3B82F6;
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.total-item {
  display: flex;
  justify-content: space-between;
  padding: 0.75rem 0;
  border-bottom: 1px solid #BFDBFE;
}

.total-item:last-child {
  border-bottom: none;
}

.total-item.destacado {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  padding: 1rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  border: none;
}

.total-label {
  font-weight: 600;
  color: var(--color-gris-acero);
}

.total-valor {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

/* PLAN DE PAGOS */
.plan-pagos {
  margin-top: 2rem;
}

.plan-pagos h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  margin-bottom: 1rem;
}

.tabla-pagos {
  overflow-x: auto;
}

.tabla-pagos table {
  width: 100%;
  border-collapse: collapse;
}

.tabla-pagos th,
.tabla-pagos td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #E5E7EB;
}

.tabla-pagos th {
  background: #F8FAFC;
  font-weight: 600;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.tabla-pagos td {
  color: var(--color-negro-carbon);
}

.tabla-pagos td.destacado {
  font-weight: 700;
  color: var(--color-dorado-vintage);
}

/* ARCHIVOS */
.archivos-loading,
.sin-archivos {
  text-align: center;
  padding: 3rem;
  color: var(--color-gris-acero);
}

.spinner-small {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(212, 175, 55, 0.3);
  border-top-color: var(--color-dorado-vintage);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

.archivos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.archivo-card {
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
}

.archivo-foto {
  position: relative;
  aspect-ratio: 1;
  overflow: hidden;
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
  background: rgba(0, 0, 0, 0.6);
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
  background: #F8FAFC;
  border: 2px solid #E5E7EB;
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transition: all 0.3s ease;
}

.archivo-documento:hover {
  background: var(--color-dorado-vintage);
  border-color: var(--color-dorado-vintage);
  transform: translateY(-4px);
}

.archivo-documento:hover .documento-icono {
  color: white;
}

.archivo-documento:hover .documento-info {
  color: white;
}

.documento-icono {
  color: var(--color-dorado-vintage);
}

.documento-info {
  text-align: center;
}

.documento-nombre {
  font-weight: 600;
  color: var(--color-negro-carbon);
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.documento-tipo {
  font-size: 0.75rem;
  color: var(--color-gris-acero);
}

/* MODAL IMAGEN */
.modal-imagen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 2rem;
}

.modal-imagen-content {
  position: relative;
  max-width: 90%;
  max-height: 90%;
}

.modal-imagen-content img {
  max-width: 100%;
  max-height: 80vh;
  object-fit: contain;
  border-radius: 8px;
}

.btn-cerrar-imagen {
  position: absolute;
  top: -50px;
  right: 0;
  background: var(--color-dorado-vintage);
  color: white;
  border: none;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-cerrar-imagen:hover {
  background: var(--color-dorado-claro);
  transform: scale(1.1);
}

/* EVALUACION FORM */
.evaluacion-form {
  background: var(--color-blanco-perla);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group.calculated {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  padding: 1rem;
  border-radius: 12px;
  border: 2px solid var(--color-dorado-vintage);
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-gris-acero);
}

.form-group input,
.form-group textarea {
  padding: 0.75rem 1rem;
  border: 2px solid #E5E7EB;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.calculated-value {
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-dorado-vintage);
  text-align: center;
}

/* ALERTS */
.alert {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.alert-error {
  background: #FEE2E2;
  color: var(--color-rojo-granate);
  border: 1px solid var(--color-rojo-granate);
}

/* FORM ACTIONS */
.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-reject {
  background: #FEE2E2;
  color: var(--color-rojo-granate);
}

.btn-reject:hover:not(:disabled) {
  background: var(--color-rojo-granate);
  color: white;
  transform: translateY(-2px);
}

.btn-approve {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-approve:hover:not(:disabled) {
  background: var(--color-dorado-claro);
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
}

/* MODAL */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 16px;
  padding: 2rem;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
  margin-bottom: 1rem;
}

.modal-body {
  margin-bottom: 2rem;
}

.modal-body p {
  color: var(--color-gris-acero);
  margin-bottom: 1rem;
}

.summary {
  background: #F8FAFC;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E5E7EB;
}

.summary-item:last-child {
  border-bottom: none;
}

.summary-item.highlight {
  background: linear-gradient(135deg, #FEF3C7, #FDE68A);
  padding: 0.75rem;
  border-radius: 8px;
  margin-top: 0.5rem;
  border: none;
}

.summary-item strong {
  color: var(--color-negro-carbon);
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.btn-secondary {
  background: #E5E7EB;
  color: var(--color-gris-acero);
}

.btn-secondary:hover:not(:disabled) {
  background: #CBD5E1;
}

.btn-primary {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background: var(--color-dorado-claro);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .evaluacion-container {
    padding: 1rem;
  }

  .solicitud-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .pestanas-navegacion {
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .modal-content {
    width: 95%;
    padding: 1.5rem;
  }

  .archivos-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}

</style>