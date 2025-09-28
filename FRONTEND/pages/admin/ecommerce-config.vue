<template>
  <div class="admin-ecommerce-config">
    <div class="navigation-header">
      <NuxtLink to="/admin" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al Panel de Administración
      </NuxtLink>
    </div>

    <div class="header-section">
      <div class="page-title">
        <div class="title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1>Configuración E-commerce</h1>
          <p>Gestiona las configuraciones de la tienda en línea y políticas comerciales</p>
        </div>
      </div>
      
      <button @click="cargarConfiguraciones" class="btn-primary" :disabled="loading">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M1 4V10H7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M23 20V14H17" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10M23 14L18.36 18.36A9 9 0 0 1 3.51 15" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Actualizar
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>Cargando configuraciones...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-icon">⚠️</div>
      <h3>Error al cargar configuraciones</h3>
      <p>{{ error }}</p>
      <button @click="cargarConfiguraciones" class="btn-secondary">
        Reintentar
      </button>
    </div>

    <div v-else class="content-section">
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>{{ totalConfiguraciones }}</h3>
            <p>Configuraciones</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📂</div>
          <div class="stat-content">
            <h3>{{ totalCategorias }}</h3>
            <p>Categorías</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🕒</div>
          <div class="stat-content">
            <h3>{{ ultimaModificacion }}</h3>
            <p>Última modificación</p>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="filters-row">
          <div class="filter-group">
            <label>Buscar configuración:</label>
            <input
              v-model="filtros.busqueda"
              type="text"
              placeholder="Buscar por nombre o descripción..."
              class="filter-input"
            />
          </div>
          
          <div class="filter-group">
            <label>Categoría:</label>
            <select v-model="filtros.categoria" class="filter-select">
              <option value="">Todas las categorías</option>
              <option value="general">General</option>
              <option value="pagos">Métodos de Pago</option>
              <option value="envios">Envíos</option>
              <option value="promociones">Promociones</option>
              <option value="politicas">Políticas</option>
              <option value="apariencia">Apariencia</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Tipo de dato:</label>
            <select v-model="filtros.tipoDato" class="filter-select">
              <option value="">Todos los tipos</option>
              <option value="STRING">Texto</option>
              <option value="INTEGER">Entero</option>
              <option value="DECIMAL">Decimal</option>
              <option value="BOOLEAN">Booleano</option>
              <option value="DATE">Fecha</option>
            </select>
          </div>
        </div>
      </div>

      <div class="configuraciones-grid">
        <div v-for="categoria in categoriasFiltradas" :key="categoria.nombre" class="categoria-section">
          <div class="categoria-header">
            <h2>{{ categoria.titulo }}</h2>
            <p>{{ categoria.descripcion }}</p>
            <span class="configuraciones-count">{{ categoria.configuraciones.length }} configuraciones</span>
          </div>

          <div class="configuraciones-list">
            <div 
              v-for="config in categoria.configuraciones" 
              :key="config.id"
              class="config-card"
              :class="{ 'editing': configEditando?.id === config.id }"
            >
              <div class="config-header">
                <div class="config-info">
                  <h3>{{ config.nombre.replace('ECOMMERCE_', '').replace(/_/g, ' ') }}</h3>
                  <p>{{ config.descripcion }}</p>
                </div>
                <div class="config-meta">
                  <span class="config-type">{{ formatTipoConfig(config.tipo) }}</span>
                  <span class="config-category">{{ config.categoria }}</span>
                </div>
              </div>

              <div class="config-content">
                <div v-if="configEditando?.id === config.id" class="config-edit-form">
                  <div class="form-group">
                    <label>Valor:</label>
                    <input
                      v-if="config.tipo === 'STRING' || config.tipo === 'INTEGER' || config.tipo === 'DECIMAL'"
                      v-model="configEditando.valor"
                      :type="config.tipo === 'INTEGER' || config.tipo === 'DECIMAL' ? 'number' : 'text'"
                      :step="config.tipo === 'DECIMAL' ? '0.01' : undefined"
                      class="form-input"
                    />
                    <select
                      v-else-if="config.tipo === 'BOOLEAN'"
                      v-model="configEditando.valor"
                      class="form-select"
                    >
                      <option value="true">Sí / Habilitado</option>
                      <option value="false">No / Deshabilitado</option>
                    </select>
                    <input
                      v-else-if="config.tipo === 'DATE'"
                      v-model="configEditando.valor"
                      type="date"
                      class="form-input"
                    />
                    <textarea
                      v-else
                      v-model="configEditando.valor"
                      class="form-textarea"
                      rows="3"
                    ></textarea>
                  </div>

                  <div class="form-group">
                    <label>Descripción:</label>
                    <input
                      v-model="configEditando.descripcion"
                      type="text"
                      class="form-input"
                    />
                  </div>

                  <div class="form-actions">
                    <button @click="guardarConfiguracion" class="btn-success" :disabled="guardando">
                      <span v-if="guardando">Guardando...</span>
                      <span v-else>Guardar</span>
                    </button>
                    <button @click="cancelarEdicion" class="btn-secondary">
                      Cancelar
                    </button>
                  </div>
                </div>

                <div v-else class="config-view">
                  <div class="config-value">
                    <strong>Valor actual:</strong>
                    <span class="value-display">{{ formatValorConfig(config.valor, config.tipo) }}</span>
                  </div>
                  
                  <div class="config-actions">
                    <button @click="editarConfiguracion(config)" class="btn-edit">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M18.5 2.49998C18.8978 2.10216 19.4374 1.87866 20 1.87866C20.5626 1.87866 21.1022 2.10216 21.5 2.49998C21.8978 2.89781 22.1213 3.43737 22.1213 3.99998C22.1213 4.56259 21.8978 5.10216 21.5 5.49998L12 15L8 16L9 12L18.5 2.49998Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                      Editar
                    </button>
                  </div>
                </div>
              </div>

              <div class="config-footer">
                <span class="config-modified">
                  Última modificación: {{ formatFechaRelativa(config.fechaModificacion) }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="notificacion.mostrar" class="notification" :class="notificacion.tipo">
      <div class="notification-content">
        <span>{{ notificacion.mensaje }}</span>
        <button @click="cerrarNotificacion" class="notification-close">×</button>
      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'admin',
  middleware: ['auth', 'admin']
})

const loading = ref(false)
const error = ref(null)
const guardando = ref(false)
const configuracionesEcommerce = ref([])
const configEditando = ref(null)

const filtros = ref({
  busqueda: '',
  categoria: '',
  tipoDato: ''
})

const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})

const categoriasFiltradas = computed(() => {
  const categorias = {
    general: {
      nombre: 'general',
      titulo: 'Configuración General',
      descripcion: 'Configuraciones básicas de la tienda',
      configuraciones: []
    },
    pagos: {
      nombre: 'pagos',
      titulo: 'Métodos de Pago',
      descripcion: 'Configuraciones de formas de pago',
      configuraciones: []
    },
    envios: {
      nombre: 'envios',
      titulo: 'Configuración de Envíos',
      descripcion: 'Opciones y costos de envío',
      configuraciones: []
    },
    promociones: {
      nombre: 'promociones',
      titulo: 'Promociones y Descuentos',
      descripcion: 'Gestión de ofertas especiales',
      configuraciones: []
    },
    politicas: {
      nombre: 'politicas',
      titulo: 'Políticas de la Tienda',
      descripcion: 'Términos, devoluciones y garantías',
      configuraciones: []
    },
    apariencia: {
      nombre: 'apariencia',
      titulo: 'Apariencia de la Tienda',
      descripcion: 'Personalización visual',
      configuraciones: []
    }
  }

  let configsFiltradas = configuracionesEcommerce.value.filter(config => {
    const coincideBusqueda = !filtros.value.busqueda || 
      config.nombre.toLowerCase().includes(filtros.value.busqueda.toLowerCase()) ||
      config.descripcion?.toLowerCase().includes(filtros.value.busqueda.toLowerCase())
    
    const coincideCategoria = !filtros.value.categoria || 
      config.categoria === filtros.value.categoria

    const coincideTipo = !filtros.value.tipoDato || 
      config.tipo === filtros.value.tipoDato

    return coincideBusqueda && coincideCategoria && coincideTipo
  })

  configsFiltradas.forEach(config => {
    if (categorias[config.categoria]) {
      categorias[config.categoria].configuraciones.push(config)
    }
  })

  return Object.values(categorias).filter(cat => cat.configuraciones.length > 0)
})

const totalConfiguraciones = computed(() => configuracionesEcommerce.value.length)

const totalCategorias = computed(() => {
  const categoriasConConfig = new Set(configuracionesEcommerce.value.map(c => c.categoria))
  return categoriasConConfig.size
})

const ultimaModificacion = computed(() => {
  if (configuracionesEcommerce.value.length === 0) return 'N/A'
  
  const fechas = configuracionesEcommerce.value
    .map(c => new Date(c.fechaModificacion))
    .sort((a, b) => b - a)
  
  return formatFechaRelativa(fechas[0])
})

const cargarConfiguraciones = async () => {
  try {
    loading.value = true
    error.value = null

    const token = process.client ? sessionStorage.getItem('token') : null

    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    const apiBase = useRuntimeConfig().public.apiBase || 'http://localhost:3001/api'
    const url = `${apiBase}/admin/ecommerce-config`

    const response = await $fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    })

    if (!response.success) {
      throw new Error(response.message || 'Error obteniendo configuraciones')
    }

    configuracionesEcommerce.value = response.data || []
    
    mostrarNotificacion('success', `Se cargaron ${configuracionesEcommerce.value.length} configuraciones`)
    
  } catch (err) {
    console.error('Error cargando configuraciones:', err)
    
    let mensajeError = 'Error cargando configuraciones'
    
    if (err.status === 401) {
      mensajeError = 'Sesión expirada. Por favor, inicia sesión nuevamente'
    } else if (err.status === 403) {
      mensajeError = 'No tienes permisos para acceder a esta sección'
    } else if (err.status === 404) {
      mensajeError = 'El endpoint de configuraciones no fue encontrado'
    } else if (err.message) {
      mensajeError = err.message
    }
    
    error.value = mensajeError
    mostrarNotificacion('error', mensajeError)
    configuracionesEcommerce.value = []
    
  } finally {
    loading.value = false
  }
}

const editarConfiguracion = (config) => {
  configEditando.value = {
    id: config.id,
    nombre: config.nombre,
    valor: config.valor,
    descripcion: config.descripcion,
    tipo: config.tipo
  }
}

const cancelarEdicion = () => {
  configEditando.value = null
}

const guardarConfiguracion = async () => {
  try {
    guardando.value = true

    const token = process.client ? sessionStorage.getItem('token') : null

    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    const apiBase = useRuntimeConfig().public.apiBase || 'http://localhost:3001/api'
    const url = `${apiBase}/admin/ecommerce-config/${configEditando.value.id}`

    const response = await $fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: {
        valor: configEditando.value.valor,
        descripcion: configEditando.value.descripcion
      }
    })

    if (!response.success) {
      throw new Error(response.message || 'Error actualizando configuración')
    }

    const index = configuracionesEcommerce.value.findIndex(c => c.id === configEditando.value.id)
    if (index !== -1) {
      configuracionesEcommerce.value[index] = {
        ...configuracionesEcommerce.value[index],
        ...response.data
      }
    }

    mostrarNotificacion('success', 'Configuración actualizada correctamente')
    configEditando.value = null
    
  } catch (err) {
    console.error('Error guardando configuración:', err)
    
    let mensajeError = 'Error actualizando configuración'
    
    if (err.status === 400) {
      mensajeError = 'Datos inválidos. Verifica los valores ingresados'
    } else if (err.status === 404) {
      mensajeError = 'Configuración no encontrada'
    } else if (err.message) {
      mensajeError = err.message
    }
    
    mostrarNotificacion('error', mensajeError)
  } finally {
    guardando.value = false
  }
}

const mostrarNotificacion = (tipo, mensaje) => {
  notificacion.value = {
    mostrar: true,
    tipo,
    mensaje
  }

  setTimeout(() => {
    notificacion.value.mostrar = false
  }, 5000)
}

const cerrarNotificacion = () => {
  notificacion.value.mostrar = false
}

const formatTipoConfig = (tipo) => {
  const tipos = {
    STRING: 'Texto',
    INTEGER: 'Entero',
    DECIMAL: 'Decimal',
    BOOLEAN: 'Booleano',
    DATE: 'Fecha',
    TEXT: 'Texto Largo'
  }
  return tipos[tipo] || tipo
}

const formatValorConfig = (valor, tipo) => {
  if (!valor) return 'No definido'
  
  switch (tipo) {
    case 'BOOLEAN':
      return valor === 'true' ? '✅ Sí / Habilitado' : '❌ No / Deshabilitado'
    case 'DECIMAL':
      return `Q${parseFloat(valor).toFixed(2)}`
    case 'INTEGER':
      return valor.toString()
    case 'DATE':
      return new Date(valor).toLocaleDateString()
    default:
      return valor
  }
}

const formatFechaRelativa = (fecha) => {
  const ahora = new Date()
  const fechaObj = new Date(fecha)
  const diffMs = ahora - fechaObj
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24))
  
  if (diffDias === 0) return 'Hoy'
  if (diffDias === 1) return 'Ayer'
  if (diffDias < 7) return `Hace ${diffDias} días`
  if (diffDias < 30) return `Hace ${Math.floor(diffDias / 7)} semanas`
  
  return fechaObj.toLocaleDateString()
}

onMounted(() => {
  cargarConfiguraciones()
})
</script>

<style scoped>
.admin-ecommerce-config {
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.navigation-header {
  margin-bottom: 20px;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border: 1px solid #dee2e6;
  border-radius: 6px;
  text-decoration: none;
  color: #495057;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-back:hover {
  background: #e9ecef;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 16px;
}

.title-icon {
  padding: 12px;
  background: #007bff;
  color: white;
  border-radius: 8px;
}

.page-title h1 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.page-title p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.2s;
}

.btn-primary:hover:not(:disabled) {
  background: #0056b3;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-state .error-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.error-state h3 {
  margin: 0 0 8px 0;
  color: #dc3545;
}

.error-state p {
  margin: 0 0 20px 0;
  color: #666;
}

.btn-secondary {
  padding: 8px 16px;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-secondary:hover {
  background: #545b62;
}

.stats-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.stat-icon {
  font-size: 24px;
}

.stat-content h3 {
  margin: 0;
  font-size: 24px;
  color: #333;
}

.stat-content p {
  margin: 4px 0 0 0;
  color: #666;
  font-size: 14px;
}

.filters-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 30px;
}

.filters-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr;
  gap: 20px;
  align-items: end;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.filter-group label {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.filter-input, .filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.filter-input:focus, .filter-select:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.configuraciones-grid {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.categoria-section {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  overflow: hidden;
}

.categoria-header {
  padding: 20px;
  background: #f8f9fa;
  border-bottom: 1px solid #dee2e6;
  position: relative;
}

.categoria-header h2 {
  margin: 0 0 4px 0;
  font-size: 20px;
  color: #333;
}

.categoria-header p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.configuraciones-count {
  position: absolute;
  top: 20px;
  right: 20px;
  background: #007bff;
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.configuraciones-list {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.config-card {
  border: 1px solid #dee2e6;
  border-radius: 6px;
  padding: 16px;
  transition: all 0.2s;
}

.config-card:hover {
  border-color: #007bff;
  box-shadow: 0 2px 8px rgba(0,123,255,0.15);
}

.config-card.editing {
  border-color: #28a745;
  background: #f8fff9;
}

.config-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.config-info h3 {
  margin: 0 0 4px 0;
  font-size: 16px;
  color: #333;
  text-transform: capitalize;
}

.config-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}

.config-meta {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: flex-end;
}

.config-type, .config-category {
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  text-transform: uppercase;
  font-weight: 500;
}

.config-type {
  background: #e9ecef;
  color: #495057;
}

.config-category {
  background: #007bff;
  color: white;
}

.config-content {
  margin-bottom: 12px;
}

.config-edit-form {
  background: #f8fff9;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid #d4edda;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 4px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.form-input, .form-select, .form-textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-input:focus, .form-select:focus, .form-textarea:focus {
  outline: none;
  border-color: #28a745;
  box-shadow: 0 0 0 2px rgba(40,167,69,0.25);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 8px;
}

.btn-success {
  padding: 8px 16px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-success:hover:not(:disabled) {
  background: #218838;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.config-view {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.config-value {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.value-display {
  padding: 4px 8px;
  background: #f8f9fa;
  border-radius: 4px;
  font-family: monospace;
}

.config-actions {
  display: flex;
  gap: 8px;
}

.btn-edit {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
}

.btn-edit:hover {
  background: #0056b3;
}

.config-footer {
  font-size: 12px;
  color: #6c757d;
  border-top: 1px solid #f1f3f4;
  padding-top: 8px;
}

.notification {
  position: fixed;
  top: 20px;
  right: 20px;
  max-width: 400px;
  z-index: 1000;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.2);
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  background: #d4edda;
  border: 1px solid #c3e6cb;
  color: #155724;
}

.notification.error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.notification-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
}

.notification-close {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 0;
  margin-left: 12px;
  opacity: 0.7;
}

.notification-close:hover {
  opacity: 1;
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

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 16px;
    text-align: center;
  }
  
  .filters-row {
    grid-template-columns: 1fr;
  }
  
  .config-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
  
  .config-meta {
    align-items: flex-start;
    flex-direction: row;
    gap: 8px;
  }
  
  .config-view {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}
</style>