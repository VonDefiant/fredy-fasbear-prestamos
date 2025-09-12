<!-- FRONTEND/pages/solicitudes/nueva.vue -->
<template>
  <div class="create-solicitud-page">
    <!-- Header -->
    <div class="page-header">
      <div class="header-content">
        <button @click="$router.back()" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
          </svg>
        </button>
        
        <div class="header-info">
          <h1 class="page-title">Nueva Solicitud</h1>
          <p class="page-subtitle">Ingresa los datos de los artículos que deseas empeñar</p>
        </div>
      </div>
    </div>

    <!-- Formulario -->
    <div class="form-container">
      <form @submit.prevent="submitSolicitud" novalidate>
        
        <!-- Progress Steps -->
        <div class="progress-steps">
          <div :class="['step', { active: currentStep >= 1 }]">
            <div class="step-number">1</div>
            <span>Artículos</span>
          </div>
          <div class="step-line"></div>
          <div :class="['step', { active: currentStep >= 2 }]">
            <div class="step-number">2</div>
            <span>Documentos</span>
          </div>
          <div class="step-line"></div>
          <div :class="['step', { active: currentStep >= 3 }]">
            <div class="step-number">3</div>
            <span>Revisión</span>
          </div>
        </div>

        <!-- Step 1: Artículos -->
        <div v-if="currentStep === 1" class="form-step">
          <div class="step-header">
            <h2>Artículos a Empeñar</h2>
            <p>Máximo 5 artículos por solicitud</p>
          </div>

          <!-- Lista de artículos -->
          <div class="articulos-list">
            <div 
              v-for="(articulo, index) in form.articulos" 
              :key="index" 
              class="articulo-form-card"
            >
              <div class="card-header">
                <h3>Artículo {{ index + 1 }}</h3>
                <button 
                  v-if="form.articulos.length > 1"
                  type="button" 
                  @click="removeArticulo(index)"
                  class="btn-remove"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>

              <div class="form-grid">
                <!-- Tipo de artículo -->
                <div class="form-group">
                  <label class="form-label required">Tipo de Artículo</label>
                  <select 
                    v-model="articulo.tipoArticuloId" 
                    class="form-select"
                    :class="{ error: errors[`articulos.${index}.tipoArticuloId`] }"
                    required
                  >
                    <option value="">Selecciona un tipo</option>
                    <option 
                      v-for="tipo in tiposArticulo" 
                      :key="tipo.id" 
                      :value="tipo.id"
                    >
                      {{ tipo.nombre }}
                    </option>
                  </select>
                  <span v-if="errors[`articulos.${index}.tipoArticuloId`]" class="error-text">
                    {{ errors[`articulos.${index}.tipoArticuloId`] }}
                  </span>
                </div>

                <!-- Descripción -->
                <div class="form-group full-width">
                  <label class="form-label required">Descripción Detallada</label>
                  <textarea 
                    v-model="articulo.descripcion"
                    class="form-textarea"
                    :class="{ error: errors[`articulos.${index}.descripcion`] }"
                    placeholder="Describe el artículo con el mayor detalle posible..."
                    rows="3"
                    maxlength="500"
                    required
                  ></textarea>
                  <div class="form-help">
                    {{ articulo.descripcion?.length || 0 }}/500 caracteres
                  </div>
                  <span v-if="errors[`articulos.${index}.descripcion`]" class="error-text">
                    {{ errors[`articulos.${index}.descripcion`] }}
                  </span>
                </div>

                <!-- Marca -->
                <div class="form-group">
                  <label class="form-label">Marca</label>
                  <input 
                    v-model="articulo.marca"
                    type="text" 
                    class="form-input"
                    placeholder="Ej: Samsung, Apple, etc."
                  />
                </div>

                <!-- Modelo -->
                <div class="form-group">
                  <label class="form-label">Modelo</label>
                  <input 
                    v-model="articulo.modelo"
                    type="text" 
                    class="form-input"
                    placeholder="Ej: Galaxy S23, iPhone 14, etc."
                  />
                </div>

                <!-- Serie -->
                <div class="form-group">
                  <label class="form-label">Número de Serie</label>
                  <input 
                    v-model="articulo.serie"
                    type="text" 
                    class="form-input"
                    placeholder="Si está disponible..."
                  />
                </div>

                <!-- Color -->
                <div class="form-group">
                  <label class="form-label">Color</label>
                  <input 
                    v-model="articulo.color"
                    type="text" 
                    class="form-input"
                    placeholder="Ej: Negro, Dorado, etc."
                  />
                </div>

                <!-- Estado Físico -->
                <div class="form-group">
                  <label class="form-label required">Estado Físico</label>
                  <select 
                    v-model="articulo.estadoFisico"
                    class="form-select"
                    :class="{ error: errors[`articulos.${index}.estadoFisico`] }"
                    required
                  >
                    <option value="">Selecciona el estado</option>
                    <option value="Excelente">Excelente</option>
                    <option value="Bueno">Bueno</option>
                    <option value="Regular">Regular</option>
                    <option value="Malo">Malo</option>
                  </select>
                  <span v-if="errors[`articulos.${index}.estadoFisico`]" class="error-text">
                    {{ errors[`articulos.${index}.estadoFisico`] }}
                  </span>
                </div>

                <!-- Valor Estimado -->
                <div class="form-group">
                  <label class="form-label">Valor Estimado (Opcional)</label>
                  <div class="currency-input">
                    <span class="currency-symbol">$</span>
                    <input 
                      v-model="articulo.valorEstimadoCliente"
                      type="number" 
                      class="form-input"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div class="form-help">
                    Este valor es referencial para la evaluación
                  </div>
                </div>

                <!-- Especificaciones Técnicas -->
                <div class="form-group full-width">
                  <label class="form-label">Especificaciones Técnicas</label>
                  <textarea 
                    v-model="articulo.especificacionesTecnicas"
                    class="form-textarea"
                    placeholder="RAM, almacenamiento, resolución de pantalla, características especiales, etc."
                    rows="2"
                    maxlength="1000"
                  ></textarea>
                  <div class="form-help">
                    {{ articulo.especificacionesTecnicas?.length || 0 }}/1000 caracteres
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Agregar artículo -->
          <div v-if="form.articulos.length < 5" class="add-articulo-section">
            <button 
              type="button" 
              @click="addArticulo"
              class="btn-add-articulo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                <path d="M12 8V16M8 12H16" stroke="currentColor" stroke-width="2"/>
              </svg>
              Agregar otro artículo
            </button>
          </div>

          <!-- Observaciones generales -->
          <div class="form-group">
            <label class="form-label">Observaciones Adicionales</label>
            <textarea 
              v-model="form.observaciones"
              class="form-textarea"
              placeholder="Información adicional que consideres importante..."
              rows="3"
              maxlength="1000"
            ></textarea>
            <div class="form-help">
              {{ form.observaciones?.length || 0 }}/1000 caracteres
            </div>
          </div>
        </div>

        <!-- Step 2: Documentos -->
        <div v-if="currentStep === 2" class="form-step">
          <div class="step-header">
            <h2>Documentos y Fotos</h2>
            <p>Sube fotos claras de tus artículos y documentos técnicos si los tienes</p>
          </div>

          <!-- Upload de fotos -->
          <div class="upload-section">
            <h3>Fotos de los Artículos</h3>
            <div class="upload-area">
              <input 
                ref="fotosInput"
                type="file" 
                multiple 
                accept="image/*"
                @change="handleFileUpload($event, 'fotos')"
                hidden
              />
              <button 
                type="button" 
                @click="$refs.fotosInput.click()"
                class="upload-button"
                :disabled="uploadLoading"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M14.5 4H20.5A2 2 0 0 1 22.5 6V20A2 2 0 0 1 20.5 22H3.5A2 2 0 0 1 1.5 20V6A2 2 0 0 1 3.5 4H9.5" stroke="currentColor" stroke-width="2"/>
                  <path d="M15.5 1L12.5 4L9.5 1" stroke="currentColor" stroke-width="2"/>
                  <circle cx="9" cy="13" r="2" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 15L16 10L5 21" stroke="currentColor" stroke-width="2"/>
                </svg>
                {{ uploadLoading ? 'Subiendo...' : 'Seleccionar Fotos' }}
              </button>
              <p class="upload-help">Máximo 5 fotos, hasta 5MB cada una</p>
            </div>

            <!-- Preview de fotos -->
            <div v-if="uploadedFiles.fotos.length > 0" class="files-preview">
              <div 
                v-for="(foto, index) in uploadedFiles.fotos" 
                :key="index"
                class="file-preview"
              >
                <img :src="foto.url" :alt="foto.name" />
                <button 
                  type="button"
                  @click="removeFile('fotos', index)"
                  class="remove-file-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- Upload de documentos -->
          <div class="upload-section">
            <h3>Documentos Técnicos (Opcional)</h3>
            <div class="upload-area">
              <input 
                ref="documentosInput"
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx"
                @change="handleFileUpload($event, 'documentos')"
                hidden
              />
              <button 
                type="button" 
                @click="$refs.documentosInput.click()"
                class="upload-button secondary"
                :disabled="uploadLoading"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M13 2V9H20" stroke="currentColor" stroke-width="2"/>
                </svg>
                Seleccionar Documentos
              </button>
              <p class="upload-help">Facturas, garantías, manuales, etc.</p>
            </div>

            <!-- Preview de documentos -->
            <div v-if="uploadedFiles.documentos.length > 0" class="files-list">
              <div 
                v-for="(doc, index) in uploadedFiles.documentos" 
                :key="index"
                class="file-item"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M13 2H6A2 2 0 0 0 4 4V20A2 2 0 0 0 6 22H18A2 2 0 0 0 20 20V9L13 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M13 2V9H20" stroke="currentColor" stroke-width="2"/>
                </svg>
                <span class="file-name">{{ doc.name }}</span>
                <button 
                  type="button"
                  @click="removeFile('documentos', index)"
                  class="remove-file-btn"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Step 3: Revisión -->
        <div v-if="currentStep === 3" class="form-step">
          <div class="step-header">
            <h2>Revisión de Solicitud</h2>
            <p>Verifica que toda la información esté correcta antes de enviar</p>
          </div>

          <!-- Resumen de artículos -->
          <div class="review-section">
            <h3>Artículos ({{ form.articulos.length }})</h3>
            <div class="review-articles">
              <div 
                v-for="(articulo, index) in form.articulos" 
                :key="index"
                class="review-article"
              >
                <div class="article-header">
                  <span class="article-number">{{ index + 1 }}.</span>
                  <strong>{{ getTipoNombre(articulo.tipoArticuloId) }}</strong>
                  <span class="article-state">{{ articulo.estadoFisico }}</span>
                </div>
                <p class="article-description">{{ articulo.descripcion }}</p>
                <div v-if="articulo.marca || articulo.modelo" class="article-details">
                  <span v-if="articulo.marca">{{ articulo.marca }}</span>
                  <span v-if="articulo.modelo">{{ articulo.modelo }}</span>
                  <span v-if="articulo.valorEstimadoCliente" class="estimated-value">
                    ${{ Number(articulo.valorEstimadoCliente).toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Observaciones -->
          <div v-if="form.observaciones" class="review-section">
            <h3>Observaciones</h3>
            <p class="review-observaciones">{{ form.observaciones }}</p>
          </div>

          <!-- Archivos -->
          <div v-if="uploadedFiles.fotos.length > 0 || uploadedFiles.documentos.length > 0" class="review-section">
            <h3>Archivos Adjuntos</h3>
            <div class="review-files">
              <div v-if="uploadedFiles.fotos.length > 0" class="file-type">
                <strong>Fotos:</strong> {{ uploadedFiles.fotos.length }} archivo(s)
              </div>
              <div v-if="uploadedFiles.documentos.length > 0" class="file-type">
                <strong>Documentos:</strong> {{ uploadedFiles.documentos.length }} archivo(s)
              </div>
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div class="form-navigation">
          <button 
            v-if="currentStep > 1"
            type="button" 
            @click="currentStep--"
            class="btn-secondary"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M19 12H5M5 12L12 19M5 12L12 5" stroke="currentColor" stroke-width="2"/>
            </svg>
            Anterior
          </button>

          <button 
            v-if="currentStep < 3"
            type="button" 
            @click="nextStep"
            class="btn-primary"
          >
            Continuar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>

          <button 
            v-if="currentStep === 3"
            type="submit" 
            class="btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Enviando...' : 'Enviar Solicitud' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Creando tu solicitud...</p>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta y middleware
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard'
})

useSeoMeta({
  title: 'Nueva Solicitud - Fredy Fasbear',
  description: 'Crear nueva solicitud de préstamo prendario'
})

// Composables
const { 
  crearSolicitud, 
  getTiposArticulo,
  uploadFiles
} = useSolicitudes()

const router = useRouter()

// Estado local
const loading = ref(false)
const uploadLoading = ref(false)
const currentStep = ref(1)
const tiposArticulo = ref([])
const errors = ref({})

// Formulario
const form = ref({
  articulos: [{
    tipoArticuloId: '',
    descripcion: '',
    marca: '',
    modelo: '',
    serie: '',
    color: '',
    estadoFisico: '',
    valorEstimadoCliente: null,
    especificacionesTecnicas: ''
  }],
  observaciones: ''
})

// Archivos subidos
const uploadedFiles = ref({
  fotos: [],
  documentos: []
})

// Lifecycle
onMounted(async () => {
  try {
    tiposArticulo.value = await getTiposArticulo()
  } catch (error) {
    console.error('Error cargando tipos de artículo:', error)
  }
})

// Métodos
const addArticulo = () => {
  if (form.value.articulos.length < 5) {
    form.value.articulos.push({
      tipoArticuloId: '',
      descripcion: '',
      marca: '',
      modelo: '',
      serie: '',
      color: '',
      estadoFisico: '',
      valorEstimadoCliente: null,
      especificacionesTecnicas: ''
    })
  }
}

const removeArticulo = (index) => {
  if (form.value.articulos.length > 1) {
    form.value.articulos.splice(index, 1)
  }
}

const validateStep = (step) => {
  errors.value = {}
  
  if (step === 1) {
    form.value.articulos.forEach((articulo, index) => {
      if (!articulo.tipoArticuloId) {
        errors.value[`articulos.${index}.tipoArticuloId`] = 'Selecciona un tipo de artículo'
      }
      if (!articulo.descripcion?.trim()) {
        errors.value[`articulos.${index}.descripcion`] = 'La descripción es obligatoria'
      }
      if (!articulo.estadoFisico) {
        errors.value[`articulos.${index}.estadoFisico`] = 'Selecciona el estado físico'
      }
    })
  }
  
  return Object.keys(errors.value).length === 0
}

const nextStep = () => {
  if (validateStep(currentStep.value)) {
    currentStep.value++
  }
}

const handleFileUpload = async (event, tipo) => {
  const files = Array.from(event.target.files)
  
  if (files.length === 0) return
  
  try {
    uploadLoading.value = true
    
    const formData = new FormData()
    files.forEach(file => {
      formData.append(tipo === 'fotos' ? 'fotosPrenda' : 'documentosTecnicos', file)
    })
    
    const result = await uploadFiles(formData)
    
    if (tipo === 'fotos') {
      uploadedFiles.value.fotos.push(...result.fotosPrenda)
    } else {
      uploadedFiles.value.documentos.push(...result.documentosTecnicos)
    }
    
  } catch (error) {
    console.error('Error subiendo archivos:', error)
  } finally {
    uploadLoading.value = false
  }
}

const removeFile = (tipo, index) => {
  uploadedFiles.value[tipo].splice(index, 1)
}

const getTipoNombre = (tipoId) => {
  const tipo = tiposArticulo.value.find(t => t.id == tipoId)
  return tipo ? tipo.nombre : 'Sin especificar'
}

const submitSolicitud = async () => {
  if (!validateStep(1)) {
    currentStep.value = 1
    return
  }
  
  try {
    loading.value = true
    
    const solicitudData = {
      articulos: form.value.articulos.map(articulo => ({
        ...articulo,
        valorEstimadoCliente: articulo.valorEstimadoCliente ? parseFloat(articulo.valorEstimadoCliente) : null
      })),
      observaciones: form.value.observaciones?.trim() || null,
      archivos: uploadedFiles.value
    }
    
    const nuevaSolicitud = await crearSolicitud(solicitudData)
    
    // Redirigir al detalle de la solicitud creada
    router.push(`/solicitudes/${nuevaSolicitud.id}`)
    
  } catch (error) {
    console.error('Error creando solicitud:', error)
    // Aquí podrías mostrar una notificación de error
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.create-solicitud-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.page-header {
  background: white;
  border-bottom: 1px solid #e2e8f0;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #64748b;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e2e8f0;
  color: #475569;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.page-subtitle {
  color: #64748b;
  margin: 0;
  font-size: 0.875rem;
}

.form-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

.progress-steps {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2rem;
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  opacity: 0.5;
  transition: opacity 0.3s;
}

.step.active {
  opacity: 1;
}

.step-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  color: #64748b;
}

.step.active .step-number {
  background: #3b82f6;
  color: white;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #e2e8f0;
  margin: 0 1rem;
}

.form-step {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.step-header {
  text-align: center;
  margin-bottom: 2rem;
}

.step-header h2 {
  font-size: 1.25rem;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.articulo-form-card {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
}

.card-header {
  display: flex;
  justify-content: between;
  align-items: center;
  margin-bottom: 1rem;
}

.card-header h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
}

.btn-remove {
  padding: 0.5rem;
  background: #fee2e2;
  color: #dc2626;
  border: none;
  border-radius: 6px;
  transition: all 0.2s;
}

.btn-remove:hover {
  background: #fecaca;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.5rem;
}

.form-label.required::after {
  content: " *";
  color: #dc2626;
}

.form-input,
.form-select,
.form-textarea {
  padding: 0.75rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.form-input.error,
.form-select.error,
.form-textarea.error {
  border-color: #dc2626;
}

.currency-input {
  position: relative;
}

.currency-symbol {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #6b7280;
  font-weight: 500;
}

.currency-input .form-input {
  padding-left: 2rem;
}

.form-help {
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 0.25rem;
}

.error-text {
  font-size: 0.75rem;
  color: #dc2626;
  margin-top: 0.25rem;
}

.add-articulo-section {
  text-align: center;
  margin: 2rem 0;
}

.btn-add-articulo {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #f8fafc;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  color: #64748b;
  font-weight: 500;
  transition: all 0.2s;
}

.btn-add-articulo:hover {
  background: #e2e8f0;
  border-color: #94a3b8;
}

.upload-section {
  margin-bottom: 2rem;
}

.upload-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.upload-area {
  text-align: center;
  padding: 2rem;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  background: #f8fafc;
}

.upload-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: background-color 0.2s;
}

.upload-button:hover {
  background: #2563eb;
}

.upload-button.secondary {
  background: #6b7280;
}

.upload-button.secondary:hover {
  background: #4b5563;
}

.upload-help {
  font-size: 0.875rem;
  color: #6b7280;
  margin-top: 0.5rem;
}

.files-preview {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.file-preview {
  position: relative;
  aspect-ratio: 1;
  border-radius: 8px;
  overflow: hidden;
}

.file-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-file-btn {
  position: absolute;
  top: 0.25rem;
  right: 0.25rem;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.files-list {
  margin-top: 1rem;
}

.file-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 6px;
  margin-bottom: 0.5rem;
}

.file-name {
  flex: 1;
  font-size: 0.875rem;
  color: #374151;
}

.review-section {
  margin-bottom: 2rem;
}

.review-section h3 {
  font-size: 1.1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.review-articles {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: hidden;
}

.review-article {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
}

.review-article:last-child {
  border-bottom: none;
}

.article-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.article-number {
  font-weight: 600;
  color: #6b7280;
}

.article-state {
  padding: 0.25rem 0.5rem;
  background: #f0fdf4;
  color: #16a34a;
  border-radius: 4px;
  font-size: 0.75rem;
  font-weight: 500;
}

.article-description {
  color: #6b7280;
  font-size: 0.875rem;
  margin-bottom: 0.5rem;
}

.article-details {
  display: flex;
  gap: 1rem;
  font-size: 0.875rem;
  color: #374151;
}

.estimated-value {
  font-weight: 600;
  color: #059669;
}

.review-observaciones {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
  color: #374151;
  font-style: italic;
}

.review-files {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 6px;
}

.file-type {
  margin-bottom: 0.5rem;
  color: #374151;
}

.form-navigation {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid #e2e8f0;
}

.btn-primary,
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.2s;
  cursor: pointer;
}

.btn-primary {
  background: #3b82f6;
  color: white;
}

.btn-primary:hover {
  background: #2563eb;
}

.btn-primary:disabled {
  background: #9ca3af;
  cursor: not-allowed;
}

.btn-secondary {
  background: #f3f4f6;
  color: #374151;
}

.btn-secondary:hover {
  background: #e5e7eb;
}

.loading-overlay {
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
}

.loading-spinner {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #e2e8f0;
  border-top: 4px solid #3b82f6;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

@media (max-width: 768px) {
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .progress-steps {
    padding: 1rem;
  }
  
  .form-container {
    padding: 1rem;
  }
  
  .form-step {
    padding: 1rem;
  }
  
  .form-navigation {
    flex-direction: column;
    gap: 1rem;
  }
  
  .btn-primary,
  .btn-secondary {
    width: 100%;
    justify-content: center;
  }
}
</style>