<template>
  <div class="formulario-empeno">
    <!-- Progress Indicator -->
    <div class="progress-header">
      <div class="progress-steps">
        <div 
          v-for="(step, index) in pasos" 
          :key="index"
          class="step-indicator"
          :class="{ 
            'active': pasoActual === index + 1,
            'completed': pasoActual > index + 1 
          }"
        >
          <div class="step-number">
            <svg v-if="pasoActual > index + 1" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20 6L9 17L4 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>{{ index + 1 }}</span>
          </div>
          <span class="step-title">{{ step.titulo }}</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" :style="{ width: `${(pasoActual / pasos.length) * 100}%` }"></div>
      </div>
    </div>

    <!-- Formulario por pasos -->
    <form @submit.prevent="procesarFormulario" class="formulario-contenido">
      
      <!-- PASO 1: Información del Artículo -->
      <div v-if="pasoActual === 1" class="paso-contenido">
        <div class="paso-header">
          <h2>Información del Artículo</h2>
          <p>Cuéntanos sobre el artículo que deseas empeñar</p>
        </div>

        <div class="form-grid">
          <div class="form-group">
            <label class="form-label required">Tipo de Artículo</label>
            
            <!-- Loading state -->
            <div v-if="cargandoTipos" class="loading-tipos">
              <div class="spinner"></div>
              <span>Cargando tipos de artículos...</span>
            </div>
            
            <!-- Select con tipos dinámicos -->
            <select 
              v-else
              v-model="formulario.tipoArticulo" 
              class="form-select"
              @change="onTipoArticuloChange"
              required
            >
              <option value="">Selecciona el tipo de artículo</option>
              <optgroup v-for="(tipos, categoria) in tiposAgrupados" :key="categoria" :label="categoria">
                <option v-for="tipo in tipos" :key="tipo.id" :value="tipo.id">
                  {{ tipo.nombre }}
                </option>
              </optgroup>
            </select>
            
            <!-- Error loading tipos -->
            <div v-if="errorCargandoTipos" class="error-tipos">
              <span>Error cargando tipos. </span>
              <button type="button" @click="cargarTiposArticulos" class="btn-retry">Reintentar</button>
            </div>
            
            <!-- Información del tipo seleccionado -->
            <div v-if="tipoSeleccionado" class="tipo-info">
              <div class="tipo-icon">
                <div class="tipo-svg" v-html="tipoSeleccionado.iconoSvg"></div>
                <span class="tipo-nombre">{{ tipoSeleccionado.nombre }}</span>
              </div>
              <div class="avaluo-range">
                <span class="range-label">Rango de avalúo:</span>
                <span class="range-value">{{ tipoSeleccionado.rangoAvaluo }}</span>
              </div>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Descripción Detallada</label>
            <textarea 
              v-model="formulario.descripcion" 
              class="form-textarea"
              placeholder="Describe tu artículo con el mayor detalle posible (marca, modelo, año, condiciones especiales, etc.)"
              rows="4"
              required
              minlength="10"
            ></textarea>
            <div class="char-counter">
              {{ formulario.descripcion.length }}/500 caracteres
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Estado Físico</label>
            <div class="radio-group">
              <label class="radio-option">
                <input type="radio" v-model="formulario.estadoFisico" value="Excelente" required>
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <strong>Excelente</strong>
                  <span>Como nuevo, sin marcas de uso</span>
                </div>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="formulario.estadoFisico" value="Bueno" required>
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <strong>Bueno</strong>
                  <span>Ligeras marcas de uso, funciona perfectamente</span>
                </div>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="formulario.estadoFisico" value="Regular" required>
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <strong>Regular</strong>
                  <span>Marcas de uso visibles, funciona correctamente</span>
                </div>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="formulario.estadoFisico" value="Malo" required>
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <strong>Necesita reparación</strong>
                  <span>Daños evidentes, puede necesitar reparación</span>
                </div>
              </label>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Valor Estimado (Q)</label>
            <div class="input-group">
              <span class="input-prefix">Q</span>
              <input 
                type="number" 
                v-model="formulario.valorEstimado" 
                class="form-input"
                placeholder="0.00"
                step="0.01"
                min="100"
                required
                @input="calcularRangoAvaluo"
              >
            </div>
            <div v-if="rangoAvaluoCalculado.max > 0" class="avaluo-calculado">
              <div class="avaluo-item">
                <span>Préstamo estimado:</span>
                <strong>Q{{ formatCurrency(rangoAvaluoCalculado.min) }} - Q{{ formatCurrency(rangoAvaluoCalculado.max) }}</strong>
              </div>
            </div>
          </div>

          <!-- Campos adicionales para electrónicos -->
          <div v-if="tipoSeleccionado && tipoSeleccionado.requiereElectronico" class="form-row">
            <div class="form-group">
              <label class="form-label required">Marca</label>
              <input 
                type="text" 
                v-model="formulario.marca" 
                class="form-input"
                placeholder="Ej: Apple, Samsung, Sony"
                required
              >
            </div>
            <div class="form-group">
              <label class="form-label">Modelo</label>
              <input 
                type="text" 
                v-model="formulario.modelo" 
                class="form-input"
                placeholder="Ej: iPhone 14 Pro, Galaxy S23"
              >
            </div>
          </div>

          <div v-if="tipoSeleccionado && tipoSeleccionado.requiereElectronico" class="form-group">
            <label class="form-label required">Especificaciones Técnicas</label>
            <textarea 
              v-model="formulario.especificacionesTecnicas" 
              class="form-textarea"
              placeholder="Incluye detalles como: capacidad de almacenamiento, RAM, procesador, año de fabricación, accesorios incluidos, estado de la batería, etc."
              rows="4"
              required
              minlength="20"
            ></textarea>
          </div>
        </div>
      </div>

      <!-- PASO 2: Evidencia Digital -->
      <div v-if="pasoActual === 2" class="paso-contenido">
        <div class="paso-header">
          <h2>Evidencia Digital</h2>
          <p>Sube fotos claras de tu artículo para el proceso de avalúo</p>
        </div>

        <div class="upload-section">
          <div class="upload-area" @drop="handleDrop" @dragover.prevent @dragenter.prevent>
            <input 
              ref="fileInput" 
              type="file" 
              multiple 
              accept="image/*"
              @change="handleFileSelect"
              class="file-input"
            >
            <div class="upload-content">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" class="upload-icon">
                <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,10 12,15 17,10" stroke="currentColor" stroke-width="2"/>
                <line x1="12" y1="15" x2="12" y2="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <h3>Sube fotos de tu artículo</h3>
              <p>Arrastra las imágenes aquí o <button type="button" @click="$refs.fileInput.click()" class="upload-button">selecciona archivos</button></p>
              <small>Máximo 5 fotos, 5MB cada una. Formatos: JPG, PNG, WEBP</small>
            </div>
          </div>

          <!-- Previsualización de imágenes -->
          <div v-if="formulario.fotos.length > 0" class="fotos-preview">
            <h4>Fotos seleccionadas ({{ formulario.fotos.length }}/5)</h4>
            <div class="fotos-grid">
              <div v-for="(foto, index) in formulario.fotos" :key="index" class="foto-item">
                <img :src="foto.preview" :alt="`Foto ${index + 1}`" class="foto-thumbnail">
                <div class="foto-info">
                  <span class="foto-nombre">{{ foto.name }}</span>
                  <span class="foto-tamaño">{{ formatFileSize(foto.size) }}</span>
                </div>
                <button type="button" @click="removerFoto(index)" class="foto-remove">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                    <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Recomendaciones para fotos -->
          <div class="foto-tips">
            <h4>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="tip-icon">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <line x1="12" y1="17" x2="12.01" y2="17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              Recomendaciones para mejores fotos:
            </h4>
            <ul>
              <li>Toma fotos con buena iluminación natural</li>
              <li>Incluye vista frontal, lateral y trasera del artículo</li>
              <li>Muestra claramente marcas, modelos y números de serie</li>
              <li>Captura cualquier daño o marca de desgaste</li>
              <li>Para electrónicos: foto de la pantalla encendida si es posible</li>
            </ul>
          </div>
        </div>

        <!-- Documento técnico para electrónicos -->
        <div v-if="tipoSeleccionado && tipoSeleccionado.requiereElectronico" class="documento-section">
          <h3>Documentación Técnica (Opcional pero recomendado)</h3>
          <div class="upload-area documento-upload">
            <input 
              ref="documentoInput" 
              type="file" 
              accept=".pdf,.doc,.docx,.txt"
              @change="handleDocumentoSelect"
              class="file-input"
            >
            <div class="upload-content">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              <p>Sube documento con especificaciones técnicas</p>
              <button type="button" @click="$refs.documentoInput.click()" class="upload-button">Seleccionar archivo</button>
              <small>PDF, DOC, DOCX o TXT</small>
            </div>
          </div>
          
          <div v-if="formulario.documentoTecnico" class="documento-selected">
            <div class="documento-info">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="currentColor" stroke-width="2"/>
                <polyline points="14,2 14,8 20,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              <div>
                <span class="documento-nombre">{{ formulario.documentoTecnico.name }}</span>
                <span class="documento-tamaño">{{ formatFileSize(formulario.documentoTecnico.size) }}</span>
              </div>
              <button type="button" @click="removerDocumento" class="documento-remove">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                  <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 3: Términos del Préstamo -->
      <div v-if="pasoActual === 3" class="paso-contenido">
        <div class="paso-header">
          <h2>Términos del Préstamo</h2>
          <p>Define las condiciones de tu préstamo pignoraticio</p>
        </div>

        <div class="prestamo-config">
          <div class="form-row">
            <div class="form-group">
              <label class="form-label required">Monto Solicitado (Q)</label>
              <div class="input-group">
                <span class="input-prefix">Q</span>
                <input 
                  type="number" 
                  v-model="formulario.montoSolicitado" 
                  class="form-input"
                  :max="rangoAvaluoCalculado.max"
                  :min="rangoAvaluoCalculado.min"
                  step="0.01"
                  required
                  @input="calcularPlanPagos"
                >
              </div>
              <div v-if="rangoAvaluoCalculado.max > 0" class="range-hint">
                Rango disponible: Q{{ formatCurrency(rangoAvaluoCalculado.min) }} - Q{{ formatCurrency(rangoAvaluoCalculado.max) }}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label required">Plazo del Préstamo</label>
              <select v-model="formulario.plazoMeses" @change="calcularPlanPagos" class="form-select" required>
                <option value="">Selecciona el plazo</option>
                <option value="1">1 mes</option>
                <option value="2">2 meses</option>
                <option value="3">3 meses</option>
                <option value="4">4 meses</option>
                <option value="5">5 meses</option>
                <option value="6">6 meses</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label required">Modalidad de Pago</label>
            <div class="radio-group horizontal">
              <label class="radio-option">
                <input type="radio" v-model="formulario.modalidadPago" value="mensual" @change="calcularPlanPagos" required>
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <strong>Mensual</strong>
                  <span>Un pago por mes</span>
                </div>
              </label>
              <label class="radio-option">
                <input type="radio" v-model="formulario.modalidadPago" value="semanal" @change="calcularPlanPagos" required>
                <span class="radio-custom"></span>
                <div class="radio-content">
                  <strong>Semanal</strong>
                  <span>Pagos cada semana</span>
                </div>
              </label>
            </div>
          </div>

          <!-- Resumen del plan de pagos -->
          <div v-if="planPagosCalculado.cuotas.length > 0" class="plan-pagos">
            <h3>Resumen de tu Préstamo</h3>
            <div class="resumen-grid">
              <div class="resumen-item">
                <span class="resumen-label">Monto del préstamo:</span>
                <span class="resumen-valor">Q{{ formatCurrency(parseFloat(formulario.montoSolicitado)) }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Tasa de interés:</span>
                <span class="resumen-valor">{{ planPagosCalculado.tasaInteres }}% {{ formulario.modalidadPago }}</span>
              </div>
              <div class="resumen-item">
                <span class="resumen-label">Total de intereses:</span>
                <span class="resumen-valor">Q{{ formatCurrency(planPagosCalculado.totalIntereses) }}</span>
              </div>
              <div class="resumen-item total">
                <span class="resumen-label">Total a pagar:</span>
                <span class="resumen-valor">Q{{ formatCurrency(planPagosCalculado.totalPagar) }}</span>
              </div>
            </div>

            <div class="cuotas-detalle">
              <h4>Detalle de Cuotas ({{ planPagosCalculado.cuotas.length }})</h4>
              <div class="cuotas-lista">
                <div v-for="(cuota, index) in planPagosCalculado.cuotas" :key="index" class="cuota-item">
                  <span class="cuota-numero">{{ index + 1 }}</span>
                  <span class="cuota-fecha">{{ formatDate(cuota.fecha) }}</span>
                  <span class="cuota-monto">Q{{ formatCurrency(cuota.monto) }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PASO 4: Confirmación -->
      <div v-if="pasoActual === 4" class="paso-contenido">
        <div class="paso-header">
          <h2>Confirmación de Solicitud</h2>
          <p>Revisa toda la información antes de enviar tu solicitud</p>
        </div>

        <div class="confirmacion-resumen">
          <!-- Resumen del artículo -->
          <div class="resumen-seccion">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Información del Artículo
            </h3>
            <div class="resumen-contenido">
              <div class="resumen-row">
                <span class="label">Tipo:</span>
                <span class="value">
                  <div class="tipo-svg-small" v-html="tipoSeleccionado?.iconoSvg"></div>
                  {{ tipoSeleccionado?.nombre }}
                </span>
              </div>
              <div class="resumen-row">
                <span class="label">Descripción:</span>
                <span class="value">{{ formulario.descripcion }}</span>
              </div>
              <div class="resumen-row">
                <span class="label">Estado:</span>
                <span class="value">{{ formatEstadoFisico(formulario.estadoFisico) }}</span>
              </div>
              <div class="resumen-row">
                <span class="label">Valor estimado:</span>
                <span class="value">Q{{ formatCurrency(parseFloat(formulario.valorEstimado)) }}</span>
              </div>
              <div v-if="formulario.marca" class="resumen-row">
                <span class="label">Marca/Modelo:</span>
                <span class="value">{{ formulario.marca }} {{ formulario.modelo }}</span>
              </div>
              <div class="resumen-row">
                <span class="label">Fotos adjuntas:</span>
                <span class="value">{{ formulario.fotos.length }} imagen(es)</span>
              </div>
            </div>
          </div>

          <!-- Resumen del préstamo -->
          <div class="resumen-seccion">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2V22M17 5H9.5C8.83696 5 8.20107 5.26339 7.73223 5.73223C7.26339 6.20107 7 6.83696 7 7.5S7.26339 8.79893 7.73223 9.26777C8.20107 9.73661 8.83696 10 9.5 10H14.5C15.163 10 15.7989 10.2634 16.2678 10.7322C16.7366 11.2011 17 11.837 17 12.5S16.7366 13.7989 16.2678 14.2678C15.7989 14.7366 15.163 15 14.5 15H7" stroke="currentColor" stroke-width="2"/>
              </svg>
              Términos del Préstamo
            </h3>
            <div class="resumen-contenido">
              <div class="resumen-row">
                <span class="label">Monto solicitado:</span>
                <span class="value">Q{{ formatCurrency(parseFloat(formulario.montoSolicitado)) }}</span>
              </div>
              <div class="resumen-row">
                <span class="label">Plazo:</span>
                <span class="value">{{ formulario.plazoMeses }} mes(es)</span>
              </div>
              <div class="resumen-row">
                <span class="label">Modalidad:</span>
                <span class="value">Pagos {{ formulario.modalidadPago }}es</span>
              </div>
              <div class="resumen-row">
                <span class="label">Total a pagar:</span>
                <span class="value highlight">Q{{ formatCurrency(planPagosCalculado.totalPagar) }}</span>
              </div>
            </div>
          </div>

          <!-- Términos y condiciones -->
          <div class="terminos-seccion">
            <h3>Términos y Condiciones</h3>
            <div class="terminos-contenido">
              <div class="terminos-lista">
                <div class="termino-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <span>He proporcionado información veraz sobre el artículo a empeñar</span>
                </div>
                <div class="termino-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <span>Entiendo que el valor final del préstamo será determinado por el evaluador</span>
                </div>
                <div class="termino-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <span>Acepto las tasas de interés y condiciones de pago establecidas</span>
                </div>
                <div class="termino-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2" fill="none"/>
                    <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none"/>
                  </svg>
                  <span>El artículo puede ser vendido si no cumplo con los pagos en el tiempo acordado</span>
                </div>
              </div>
              
              <div class="aceptacion-terminos">
                <label class="checkbox-option">
                  <input type="checkbox" v-model="formulario.aceptaTerminos" required>
                  <span class="checkbox-custom"></span>
                  <span>Acepto los términos y condiciones del servicio de empeño</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Botones de navegación -->
      <div class="form-navigation">
        <button 
          v-if="pasoActual > 1" 
          type="button" 
          @click="pasoAnterior" 
          class="btn-nav secondary"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2"/>
          </svg>
          Anterior
        </button>

        <button 
          v-if="pasoActual < pasos.length" 
          type="button" 
          @click="pasoSiguiente" 
          :disabled="!puedeAvanzar"
          class="btn-nav primary"
        >
          Siguiente
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 18L15 12L9 6" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>

        <button 
          v-if="pasoActual === pasos.length" 
          type="submit" 
          :disabled="!formularioValido || enviando"
          class="btn-nav primary"
        >
          <svg v-if="enviando" width="16" height="16" viewBox="0 0 24 24" fill="none" class="spinning">
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            <path d="M12 3C16.2 3 19 5.8 19 10" stroke="currentColor" stroke-width="2"/>
          </svg>
          <span v-if="!enviando">Enviar Solicitud</span>
          <span v-else>Enviando...</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'

// Props
const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['close', 'submit'])

// Estado del formulario
const pasoActual = ref(1)
const enviando = ref(false)

// Estado para tipos de artículos dinámicos
const tiposArticulos = ref([])
const cargandoTipos = ref(false)
const errorCargandoTipos = ref(false)

// Pasos del formulario
const pasos = [
  { titulo: 'Artículo' },
  { titulo: 'Evidencia' },
  { titulo: 'Préstamo' },
  { titulo: 'Confirmar' }
]

// Datos del formulario
const formulario = ref({
  // Paso 1: Información del artículo
  tipoArticulo: '',
  descripcion: '',
  estadoFisico: '',
  valorEstimado: '',
  marca: '',
  modelo: '',
  especificacionesTecnicas: '',
  
  // Paso 2: Evidencia digital
  fotos: [],
  documentoTecnico: null,
  
  // Paso 3: Términos del préstamo
  montoSolicitado: '',
  plazoMeses: '',
  modalidadPago: 'mensual',
  
  // Paso 4: Confirmación
  aceptaTerminos: false
})

const rangoAvaluoCalculado = ref({ min: 0, max: 0 })
const planPagosCalculado = ref({ 
  cuotas: [], 
  totalIntereses: 0, 
  totalPagar: 0, 
  tasaInteres: 5 
})

// CARGAR TIPOS DE ARTÍCULOS DESDE LA API
const cargarTiposArticulos = async () => {
  cargandoTipos.value = true
  errorCargandoTipos.value = false
  
  try {
    console.log('🔍 Cargando tipos de artículos desde la API...')
    
    const { getToken } = useAuth()
    const token = getToken()
    
    const response = await fetch('http://localhost:3001/api/solicitudes/categorias', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Error ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Tipos cargados:', result)
    
    if (result.success && result.data) {
      // Mapear los tipos de artículos desde la API
      tiposArticulos.value = result.data.map(tipo => ({
        id: tipo.id,
        nombre: tipo.nombre,
        categoria: obtenerCategoria(tipo.nombre),
        porcentajeMinAvaluo: parseFloat(tipo.porcentajeMinAvaluo),
        porcentajeMaxAvaluo: parseFloat(tipo.porcentajeMaxAvaluo),
        requiereElectronico: tipo.requiereElectronico,
        iconoSvg: obtenerIconoSvg(tipo.nombre)
      }))
      
      console.log('📦 Tipos procesados:', tiposArticulos.value)
    } else {
      throw new Error('Formato de respuesta inválido')
    }
    
  } catch (error) {
    console.error('❌ Error cargando tipos de artículos:', error)
    errorCargandoTipos.value = true
    
    // Fallback: usar tipos básicos predeterminados
    tiposArticulos.value = [
      {
        id: 1,
        nombre: 'Joyería General',
        categoria: 'Joyería',
        porcentajeMinAvaluo: 30,
        porcentajeMaxAvaluo: 70,
        requiereElectronico: false,
        iconoSvg: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3H18L20 7L12 21L4 7L6 3Z"/></svg>'
      }
    ]
  } finally {
    cargandoTipos.value = false
  }
}

// Funciones auxiliares para mapear datos
const obtenerCategoria = (nombre) => {
  const nombreLower = nombre.toLowerCase()
  
  if (nombreLower.includes('oro') || nombreLower.includes('plata') || nombreLower.includes('joya') || nombreLower.includes('reloj') || nombreLower.includes('diamante')) {
    return 'Joyería'
  } else if (nombreLower.includes('celular') || nombreLower.includes('computadora') || nombreLower.includes('electro') || nombreLower.includes('televisor')) {
    return 'Electrónicos'
  } else if (nombreLower.includes('auto') || nombreLower.includes('vehiculo') || nombreLower.includes('moto')) {
    return 'Vehículos'
  } else if (nombreLower.includes('herramienta')) {
    return 'Herramientas'
  } else if (nombreLower.includes('hogar') || nombreLower.includes('electrodomestico')) {
    return 'Hogar'
  } else {
    return 'Otros'
  }
}

const obtenerIconoSvg = (nombre) => {
  const nombreLower = nombre.toLowerCase()
  
  if (nombreLower.includes('oro') || nombreLower.includes('joya')) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3H18L20 7L12 21L4 7L6 3Z"/><path d="M6 7L12 13L18 7"/></svg>'
  } else if (nombreLower.includes('celular')) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="2" width="14" height="20" rx="2" ry="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>'
  } else if (nombreLower.includes('computadora')) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>'
  } else if (nombreLower.includes('auto') || nombreLower.includes('vehiculo')) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 17C7 18.1046 6.10457 19 5 19C3.89543 19 3 18.1046 3 17C3 15.8954 3.89543 15 5 15C6.10457 15 7 15.8954 7 17Z"/><path d="M21 17C21 18.1046 20.1046 19 19 19C17.8954 19 17 18.1046 17 17C17 15.8954 17.8954 15 19 15C20.1046 15 21 15.8954 21 17Z"/><path d="M5 17H17M5 17V7C5 6.44772 5.44772 6 6 6H15L17 8V17"/></svg>'
  } else if (nombreLower.includes('reloj')) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>'
  } else if (nombreLower.includes('herramienta')) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.7 6.3C16.1 4.9 18.4 4.9 19.8 6.3C21.2 7.7 21.2 10 19.8 11.4L17.5 13.7L10.3 6.5L12.6 4.2"/></svg>'
  } else {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
  }
}

// Computed
const tiposAgrupados = computed(() => {
  const grupos = {}
  tiposArticulos.value.forEach(tipo => {
    if (!grupos[tipo.categoria]) {
      grupos[tipo.categoria] = []
    }
    grupos[tipo.categoria].push(tipo)
  })
  return grupos
})

const tipoSeleccionado = computed(() => {
  const tipo = tiposArticulos.value.find(tipo => tipo.id === parseInt(formulario.value.tipoArticulo))
  if (tipo) {
    return {
      ...tipo,
      rangoAvaluo: `${tipo.porcentajeMinAvaluo}% - ${tipo.porcentajeMaxAvaluo}%`,
      requiereElectronico: tipo.requiereElectronico
    }
  }
  return null
})

const puedeAvanzar = computed(() => {
  switch (pasoActual.value) {
    case 1:
      return formulario.value.tipoArticulo && 
             formulario.value.descripcion.length >= 10 && 
             formulario.value.estadoFisico && 
             formulario.value.valorEstimado &&
             (!tipoSeleccionado.value?.requiereElectronico || 
              (formulario.value.marca && formulario.value.especificacionesTecnicas.length >= 20))
    
    case 2:
      return formulario.value.fotos.length > 0
    
    case 3:
      return formulario.value.montoSolicitado && 
             formulario.value.plazoMeses && 
             formulario.value.modalidadPago
    
    default:
      return true
  }
})

const formularioValido = computed(() => {
  return puedeAvanzar.value && formulario.value.aceptaTerminos
})

// Cargar tipos al montar el componente
onMounted(() => {
  cargarTiposArticulos()
})

// Métodos
const onTipoArticuloChange = () => {
  calcularRangoAvaluo()
}

const calcularRangoAvaluo = () => {
  if (tipoSeleccionado.value && formulario.value.valorEstimado) {
    const valor = parseFloat(formulario.value.valorEstimado)
    const min = Math.round(valor * (tipoSeleccionado.value.porcentajeMinAvaluo / 100))
    const max = Math.round(valor * (tipoSeleccionado.value.porcentajeMaxAvaluo / 100))
    
    rangoAvaluoCalculado.value = { min, max }
    
    // Ajustar monto solicitado si está fuera del rango
    if (formulario.value.montoSolicitado) {
      const montoActual = parseFloat(formulario.value.montoSolicitado)
      if (montoActual > max) {
        formulario.value.montoSolicitado = max.toString()
      } else if (montoActual < min) {
        formulario.value.montoSolicitado = min.toString()
      }
    }
  }
}

const calcularPlanPagos = () => {
  if (formulario.value.montoSolicitado && formulario.value.plazoMeses && formulario.value.modalidadPago) {
    const monto = parseFloat(formulario.value.montoSolicitado)
    const plazo = parseInt(formulario.value.plazoMeses)
    const tasaInteres = 5 // 5% mensual
    
    let numeroCuotas
    let tasaPorCuota
    
    if (formulario.value.modalidadPago === 'semanal') {
      numeroCuotas = plazo * 4
      tasaPorCuota = tasaInteres / 4
    } else {
      numeroCuotas = plazo
      tasaPorCuota = tasaInteres
    }
    
    const interesTotal = monto * (tasaInteres / 100) * plazo
    const totalPagar = monto + interesTotal
    const montoCuota = totalPagar / numeroCuotas
    
    const cuotas = []
    const fechaInicio = new Date()
    
    for (let i = 0; i < numeroCuotas; i++) {
      const fechaCuota = new Date(fechaInicio)
      if (formulario.value.modalidadPago === 'semanal') {
        fechaCuota.setDate(fechaCuota.getDate() + (i * 7))
      } else {
        fechaCuota.setMonth(fechaCuota.getMonth() + i)
      }
      
      cuotas.push({
        numero: i + 1,
        fecha: fechaCuota.toISOString(),
        monto: montoCuota
      })
    }
    
    planPagosCalculado.value = {
      cuotas,
      totalIntereses: interesTotal,
      totalPagar,
      tasaInteres
    }
  }
}

// Manejo de archivos
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  procesarArchivos(files)
}

const handleDrop = (event) => {
  event.preventDefault()
  const files = Array.from(event.dataTransfer.files)
  procesarArchivos(files)
}

const procesarArchivos = (files) => {
  files.forEach(file => {
    if (formulario.value.fotos.length >= 5) {
      alert('Máximo 5 fotos permitidas')
      return
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert(`El archivo ${file.name} es muy grande. Máximo 5MB.`)
      return
    }
    
    if (!file.type.startsWith('image/')) {
      alert(`${file.name} no es una imagen válida.`)
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      formulario.value.fotos.push({
        file,
        name: file.name,
        size: file.size,
        preview: e.target.result
      })
    }
    reader.readAsDataURL(file)
  })
}

const removerFoto = (index) => {
  formulario.value.fotos.splice(index, 1)
}

const handleDocumentoSelect = (event) => {
  const file = event.target.files[0]
  if (file) {
    if (file.size > 10 * 1024 * 1024) {
      alert('El documento es muy grande. Máximo 10MB.')
      return
    }
    formulario.value.documentoTecnico = file
  }
}

const removerDocumento = () => {
  formulario.value.documentoTecnico = null
}

// Navegación
const pasoSiguiente = () => {
  if (puedeAvanzar.value && pasoActual.value < pasos.length) {
    pasoActual.value++
  }
}

const pasoAnterior = () => {
  if (pasoActual.value > 1) {
    pasoActual.value--
  }
}

// Procesamiento del formulario - CONECTADO AL BACKEND
const procesarFormulario = async () => {
  if (!formularioValido.value) return
  
  enviando.value = true
  
  try {
    // Crear FormData para enviar archivos
    const datosFormulario = new FormData()
    
    // Agregar datos básicos del formulario
    datosFormulario.append('tipoArticulo', formulario.value.tipoArticulo)
    datosFormulario.append('descripcion', formulario.value.descripcion)
    datosFormulario.append('estadoFisico', formulario.value.estadoFisico)
    datosFormulario.append('valorEstimado', formulario.value.valorEstimado)
    datosFormulario.append('montoSolicitado', formulario.value.montoSolicitado)
    datosFormulario.append('plazoMeses', formulario.value.plazoMeses)
    datosFormulario.append('modalidadPago', formulario.value.modalidadPago)
    datosFormulario.append('aceptaTerminos', 'true')
    
    // Agregar campos opcionales
    if (formulario.value.marca) {
      datosFormulario.append('marca', formulario.value.marca)
    }
    if (formulario.value.modelo) {
      datosFormulario.append('modelo', formulario.value.modelo)
    }
    if (formulario.value.especificacionesTecnicas) {
      datosFormulario.append('especificacionesTecnicas', formulario.value.especificacionesTecnicas)
    }
    
    // Agregar plan de pagos y rango de avalúo calculados
    datosFormulario.append('planPagos', JSON.stringify(planPagosCalculado.value))
    datosFormulario.append('rangoAvaluo', JSON.stringify(rangoAvaluoCalculado.value))
    
    // Agregar fotos
    formulario.value.fotos.forEach((foto) => {
      datosFormulario.append('fotos', foto.file)
    })
    
    // Agregar documento técnico si existe
    if (formulario.value.documentoTecnico) {
      datosFormulario.append('documentoTecnico', formulario.value.documentoTecnico)
    }
    
    // Obtener token del usuario autenticado
    const { getToken } = useAuth()
    const token = getToken()
    
    console.log('🔐 Token encontrado:', token?.substring(0, 20) + '...')
    
    if (!token) {
      throw new Error('No tienes sesión activa. Por favor inicia sesión.')
    }
    
    // PETICIÓN REAL AL BACKEND
    console.log('🚀 Enviando solicitud al backend...')
    const response = await fetch('http://localhost:3001/api/solicitudes', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
        // NO agregues Content-Type, fetch lo hará automáticamente para FormData
      },
      body: datosFormulario
    })
    
    console.log('📡 Respuesta recibida:', response.status, response.statusText)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
    }
    
    const result = await response.json()
    console.log('✅ Solicitud exitosa:', result)
    
    // Mostrar mensaje de éxito REAL
    alert(`¡Solicitud enviada exitosamente!\n\nNúmero de solicitud: ${result.data.numeroSolicitud}\nEstado: ${result.data.estado}\n\nTe contactaremos pronto para el avalúo.`)
    
    // Emitir evento para cerrar el modal
    emit('close')
    
    // Opcional: recargar la página o redirigir
    // window.location.reload()
    
  } catch (error) {
    console.error('❌ Error enviando solicitud:', error)
    
    // Mostrar error específico al usuario
    if (error.message.includes('No tienes sesión')) {
      alert('Tu sesión ha expirado. Por favor inicia sesión nuevamente.')
      // Redirigir al login
      window.location.href = '/login'
    } else {
      alert(`Error al enviar la solicitud:\n${error.message}\n\nPor favor, inténtalo nuevamente.`)
    }
  } finally {
    enviando.value = false
  }
}

// Funciones de utilidad
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount || 0)
}

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-GT', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

const formatEstadoFisico = (estado) => {
  const estados = {
    'Excelente': 'Excelente',
    'Bueno': 'Bueno',
    'Regular': 'Regular',
    'Malo': 'Necesita reparación'
  }
  return estados[estado] || estado
}

// Limpiar formulario al cerrar
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    // Reset formulario
    Object.keys(formulario.value).forEach(key => {
      if (key === 'fotos') {
        formulario.value[key] = []
      } else if (key === 'documentoTecnico') {
        formulario.value[key] = null
      } else if (key === 'modalidadPago') {
        formulario.value[key] = 'mensual'
      } else if (key === 'aceptaTerminos') {
        formulario.value[key] = false
      } else {
        formulario.value[key] = ''
      }
    })
    pasoActual.value = 1
    rangoAvaluoCalculado.value = { min: 0, max: 0 }
    planPagosCalculado.value = { cuotas: [], totalIntereses: 0, totalPagar: 0, tasaInteres: 5 }
  }
})

// Watch para recargar tipos cuando el formulario se hace visible
watch(() => props.visible, (newValue) => {
  if (newValue && tiposArticulos.value.length === 0) {
    cargarTiposArticulos()
  }
})
</script>

<style scoped>
/* Estilos del formulario - Incluye estilos para loading */
.formulario-empeno {
  background: white;
  border-radius: 12px;
  overflow: hidden;
}

/* Progress Header */
.progress-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1.5rem;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  position: relative;
}

.step-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex: 1;
  position: relative;
  z-index: 10;
}

.step-number {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.7);
  transition: all 0.3s ease;
  position: relative;
  z-index: 10;
}

.step-indicator.active .step-number {
  background: #D4AF37;
  color: white;
}

.step-indicator.completed .step-number {
  background: #27AE60;
  color: white;
}

.step-title {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.8);
}

.step-indicator.active .step-title {
  color: #D4AF37;
  font-weight: 600;
}

.progress-bar {
  height: 4px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #D4AF37, #F4D03F);
  transition: width 0.3s ease;
}

/* Loading de tipos */
.loading-tipos {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  border: 2px solid #E0E0E0;
}

.spinner {
  width: 16px;
  height: 16px;
  border: 2px solid #E0E0E0;
  border-top: 2px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.error-tipos {
  padding: 1rem;
  background: #FFF5F5;
  border: 2px solid #FEB2B2;
  border-radius: 8px;
  color: #C53030;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-retry {
  background: none;
  border: none;
  color: #D4AF37;
  text-decoration: underline;
  cursor: pointer;
  font-weight: 500;
}

/* Formulario Content */
.formulario-contenido {
  padding: 2rem;
}

.paso-contenido {
  min-height: 400px;
}

.paso-header {
  text-align: center;
  margin-bottom: 2rem;
}

.paso-header h2 {
  margin: 0 0 0.5rem;
  color: #2C3E50;
  font-size: 1.8rem;
  font-weight: 600;
}

.paso-header p {
  margin: 0;
  color: #666;
  font-size: 1rem;
}

/* Form Elements */
.form-grid {
  display: grid;
  gap: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.9rem;
}

.form-label.required::after {
  content: ' *';
  color: #E74C3C;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
  font-family: inherit;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
}

.input-group {
  position: relative;
  display: flex;
}

.input-prefix {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
  font-weight: 600;
  z-index: 2;
}

.input-group .form-input {
  padding-left: 2rem;
}

.char-counter {
  font-size: 0.8rem;
  color: #888;
  text-align: right;
}

/* Tipo de artículo */
.tipo-info {
  background: #F8F9FA;
  padding: 0.75rem;
  border-radius: 6px;
  border-left: 4px solid #D4AF37;
}

.tipo-icon {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.tipo-svg {
  width: 20px;
  height: 20px;
  color: #D4AF37;
}

.tipo-svg-small {
  width: 16px;
  height: 16px;
  color: #D4AF37;
  display: inline-block;
  vertical-align: middle;
  margin-right: 0.25rem;
}

.tipo-nombre {
  font-weight: 600;
  color: #2C3E50;
}

.avaluo-range {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-label {
  font-size: 0.9rem;
  color: #666;
}

.range-value {
  font-weight: 600;
  color: #D4AF37;
}

.avaluo-calculado {
  background: rgba(212, 175, 55, 0.1);
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #D4AF37;
}

.avaluo-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.range-hint {
  font-size: 0.8rem;
  color: #666;
  margin-top: 0.25rem;
}

/* Radio buttons */
.radio-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.radio-group.horizontal {
  flex-direction: row;
  gap: 1.5rem;
}

.radio-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px solid #E0E0E0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.radio-option:hover {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.radio-option input[type="radio"] {
  display: none;
}

.radio-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #E0E0E0;
  border-radius: 50%;
  position: relative;
  transition: all 0.3s ease;
}

.radio-option input[type="radio"]:checked + .radio-custom {
  border-color: #D4AF37;
  background: #D4AF37;
}

.radio-option input[type="radio"]:checked + .radio-custom::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: white;
  border-radius: 50%;
}

.radio-content {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.radio-content strong {
  color: #2C3E50;
  font-size: 0.9rem;
}

.radio-content span {
  color: #666;
  font-size: 0.8rem;
}

/* Upload Area */
.upload-section {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.upload-area {
  border: 2px dashed #D0D0D0;
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
}

.upload-area:hover {
  border-color: #D4AF37;
  background: rgba(212, 175, 55, 0.05);
}

.upload-area.documento-upload {
  padding: 1.5rem;
}

.file-input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.upload-icon {
  color: #D4AF37;
}

.upload-content h3 {
  margin: 0;
  color: #2C3E50;
  font-size: 1.2rem;
}

.upload-content p {
  margin: 0;
  color: #666;
}

.upload-button {
  background: none;
  border: none;
  color: #D4AF37;
  font-weight: 600;
  text-decoration: underline;
  cursor: pointer;
}

.upload-content small {
  color: #888;
  font-size: 0.8rem;
}

/* Fotos preview */
.fotos-preview h4 {
  margin: 0 0 1rem;
  color: #2C3E50;
}

.fotos-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
}

.foto-item {
  position: relative;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.foto-thumbnail {
  width: 100%;
  height: 120px;
  object-fit: cover;
}

.foto-info {
  padding: 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.foto-nombre {
  font-size: 0.8rem;
  font-weight: 500;
  color: #2C3E50;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.foto-tamaño {
  font-size: 0.7rem;
  color: #888;
}

.foto-remove {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: rgba(231, 76, 60, 0.9);
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.3s ease;
}

.foto-remove:hover {
  background: #E74C3C;
}

/* Foto tips */
.foto-tips {
  background: #F0F8FF;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #3498DB;
}

.foto-tips h4 {
  margin: 0 0 0.5rem;
  color: #2C3E50;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.tip-icon {
  color: #3498DB;
  flex-shrink: 0;
}

.foto-tips ul {
  margin: 0;
  padding-left: 1.5rem;
}

.foto-tips li {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 0.25rem;
}

/* Documento section */
.documento-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #E0E0E0;
}

.documento-section h3 {
  margin: 0 0 1rem;
  color: #2C3E50;
}

.documento-selected {
  margin-top: 1rem;
}

.documento-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #F8F9FA;
  border-radius: 8px;
  border-left: 4px solid #27AE60;
}

.documento-info svg {
  color: #27AE60;
  flex-shrink: 0;
}

.documento-info div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  flex: 1;
}

.documento-nombre {
  font-weight: 500;
  color: #2C3E50;
}

.documento-tamaño {
  font-size: 0.8rem;
  color: #666;
}

.documento-remove {
  background: #E74C3C;
  color: white;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Plan de pagos */
.prestamo-config {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.plan-pagos {
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 12px;
  border-left: 4px solid #D4AF37;
}

.plan-pagos h3 {
  margin: 0 0 1rem;
  color: #2C3E50;
}

.resumen-grid {
  display: grid;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.resumen-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #E0E0E0;
}

.resumen-item:last-child {
  border-bottom: none;
}

.resumen-item.total {
  background: rgba(212, 175, 55, 0.1);
  padding: 1rem;
  margin: 0.5rem -1.5rem -1.5rem;
  border-bottom: none;
  font-size: 1.1rem;
  font-weight: 600;
}

.resumen-label {
  color: #666;
}

.resumen-valor {
  font-weight: 600;
  color: #2C3E50;
}

.resumen-item.total .resumen-valor {
  color: #D4AF37;
  font-size: 1.2rem;
}

.cuotas-detalle h4 {
  margin: 0 0 1rem;
  color: #2C3E50;
  font-size: 1rem;
}

.cuotas-lista {
  display: grid;
  gap: 0.5rem;
  max-height: 200px;
  overflow-y: auto;
}

.cuota-item {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 1rem;
  padding: 0.75rem;
  background: white;
  border-radius: 6px;
  align-items: center;
}

.cuota-numero {
  width: 24px;
  height: 24px;
  background: #D4AF37;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
}

.cuota-fecha {
  color: #666;
  font-size: 0.9rem;
}

.cuota-monto {
  font-weight: 600;
  color: #2C3E50;
}

/* Confirmación */
.confirmacion-resumen {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.resumen-seccion {
  background: #F8F9FA;
  border-radius: 12px;
  overflow: hidden;
}

.resumen-seccion h3 {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 1.5rem;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
}

.resumen-contenido {
  padding: 1.5rem;
}

.resumen-row {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 0.75rem 0;
  border-bottom: 1px solid #E0E0E0;
}

.resumen-row:last-child {
  border-bottom: none;
}

.resumen-row .label {
  font-weight: 500;
  color: #666;
  flex: 1;
}

.resumen-row .value {
  color: #2C3E50;
  font-weight: 500;
  text-align: right;
  flex: 2;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.25rem;
}

.resumen-row .value.highlight {
  color: #D4AF37;
  font-weight: 600;
  font-size: 1.1rem;
}

/* Términos y condiciones */
.terminos-seccion {
  background: #F0F8FF;
  border-radius: 12px;
  overflow: hidden;
}

.terminos-seccion h3 {
  background: #3498DB;
  color: white;
  padding: 1rem 1.5rem;
  margin: 0;
  font-size: 1.1rem;
}

.terminos-contenido {
  padding: 1.5rem;
}

.terminos-lista {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.termino-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #2C3E50;
  font-size: 0.9rem;
}

.termino-item svg {
  color: #27AE60;
  flex-shrink: 0;
}

.aceptacion-terminos {
  padding-top: 1rem;
  border-top: 1px solid #E0E0E0;
}

.checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  cursor: pointer;
  font-weight: 500;
  color: #2C3E50;
}

.checkbox-option input[type="checkbox"] {
  display: none;
}

.checkbox-custom {
  width: 20px;
  height: 20px;
  border: 2px solid #3498DB;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox-option input[type="checkbox"]:checked + .checkbox-custom {
  background: #3498DB;
}

.checkbox-option input[type="checkbox"]:checked + .checkbox-custom::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 0.8rem;
  font-weight: bold;
}

/* Navegación */
.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-top: 1px solid #E0E0E0;
  background: #F8F9FA;
}

.btn-nav {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
}

.btn-nav:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-nav.primary {
  background: #D4AF37;
  color: white;
}

.btn-nav.primary:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-1px);
}

.btn-nav.secondary {
  background: #E0E0E0;
  color: #2C3E50;
}

.btn-nav.secondary:hover:not(:disabled) {
  background: #D0D0D0;
}

/* Spinning animation */
.spinning {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .formulario-contenido {
    padding: 1rem;
  }
  
  .progress-steps {
    flex-wrap: wrap;
    gap: 1rem 0.5rem;
    justify-content: center;
  }
  
  .step-indicator {
    flex: none;
    min-width: 120px;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .radio-group.horizontal {
    flex-direction: column;
  }
  
  .fotos-grid {
    grid-template-columns: 1fr 1fr;
  }
  
  .cuota-item {
    grid-template-columns: 1fr;
    text-align: center;
    gap: 0.5rem;
  }
  
  .resumen-row {
    flex-direction: column;
    align-items: start;
    gap: 0.25rem;
  }
  
  .resumen-row .value {
    text-align: left;
    justify-content: flex-start;
  }
  
  .form-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-nav {
    width: 100%;
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .fotos-grid {
    grid-template-columns: 1fr;
  }
}
</style>