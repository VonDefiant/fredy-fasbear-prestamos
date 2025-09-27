<!-- =============================================== -->
<!-- Archivo: FRONTEND/pages/admin/ecommerce-config.vue -->
<!-- Página de configuración del módulo E-commerce -->
<!-- =============================================== -->

<template>
  <div class="admin-ecommerce-config">
    <!-- Botón de regreso al panel de administración -->
    <div class="navigation-header">
      <NuxtLink to="/admin" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <polyline points="12,19 5,12 12,5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al Panel de Administración
      </NuxtLink>
    </div>

    <!-- Header Section -->
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

    <!-- Loading State -->
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando configuraciones de e-commerce...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-if="error && !loading" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar configuraciones</h3>
        <p>{{ error }}</p>
        <button @click="cargarConfiguraciones" class="btn-retry">
          Reintentar
        </button>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="!loading && !error" class="configuraciones-content">
      <!-- Estadísticas resumen -->
      <div class="stats-overview">
        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalConfiguraciones }}</h3>
            <p>Configuraciones E-commerce</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ ultimaModificacion }}</h3>
            <p>Última Modificación</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 7V5C3 3.89543 3.89543 3 5 3H19C20.1046 3 21 3.89543 21 5V7M3 7L21 7M3 7V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V7M9 11H15" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ totalCategorias }}</h3>
            <p>Categorías Configuradas</p>
          </div>
        </div>
      </div>

      <!-- Filtros de búsqueda -->
      <div class="filtros-section">
        <div class="search-bar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="filtros.busqueda" 
            type="text" 
            placeholder="Buscar configuraciones por nombre o descripción..."
          >
        </div>

        <div class="filter-controls">
          <select v-model="filtros.categoria" class="filter-select">
            <option value="">Todas las categorías</option>
            <option value="general">General</option>
            <option value="pagos">Métodos de Pago</option>
            <option value="envios">Envíos</option>
            <option value="promociones">Promociones</option>
            <option value="politicas">Políticas</option>
            <option value="apariencia">Apariencia</option>
          </select>
          
          <select v-model="filtros.tipoDato" class="filter-select">
            <option value="">Todos los tipos</option>
            <option value="STRING">Texto</option>
            <option value="INTEGER">Entero</option>
            <option value="DECIMAL">Decimal</option>
            <option value="BOOLEAN">Booleano</option>
            <option value="DATE">Fecha</option>
            <option value="TEXT">Texto Largo</option>
          </select>
        </div>
      </div>

      <!-- Lista de configuraciones agrupadas por categoría -->
      <div v-for="categoria in categoriasFiltradas" :key="categoria.nombre" class="categoria-wrapper">
        <!-- Header de categoría -->
        <div class="categoria-header">
          <div class="categoria-info">
            <div class="categoria-icon">
              <component :is="getCategoriaIcon(categoria.nombre)" />
            </div>
            <div class="categoria-text">
              <h2>{{ categoria.titulo }}</h2>
              <p>{{ categoria.descripcion }}</p>
            </div>
          </div>
          <div class="categoria-stats">
            <span class="config-count">{{ categoria.configuraciones.length }} configuraciones</span>
          </div>
        </div>

        <!-- Grid de configuraciones -->
        <div class="configuraciones-grid">
          <div 
            v-for="config in categoria.configuraciones" 
            :key="config.id" 
            class="config-card"
            :class="{ 'editando': configEditando?.id === config.id }"
          >
            <div class="config-header">
              <div class="config-info">
                <h3>{{ config.nombre }}</h3>
                <span class="tipo-badge" :class="config.tipo.toLowerCase()">
                  {{ formatTipoConfig(config.tipo) }}
                </span>
              </div>
              <div class="config-actions">
                <button 
                  v-if="configEditando?.id !== config.id"
                  @click="iniciarEdicion(config)" 
                  class="btn-edit"
                  title="Editar configuración"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M18.5 2.50001C18.8978 2.10218 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.10218 21.5 2.50001C21.8978 2.89784 22.1213 3.43739 22.1213 4.00001C22.1213 4.56262 21.8978 5.10218 21.5 5.50001L12 15L8 16L9 12L18.5 2.50001Z" stroke="currentColor" stroke-width="2"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="config-content">
              <div v-if="configEditando?.id !== config.id" class="config-display">
                <div class="valor-actual">
                  <label>Valor actual:</label>
                  <div class="valor-display" :class="config.tipo.toLowerCase()">
                    {{ formatValorConfig(config.valor, config.tipo) }}
                  </div>
                </div>
                
                <div v-if="config.descripcion" class="descripcion">
                  <label>Descripción:</label>
                  <p>{{ config.descripcion }}</p>
                </div>

                <div class="metadata">
                  <div class="metadata-item">
                    <span class="label">Modificado por:</span>
                    <span class="value">{{ formatUsuarioModifico(config.usuarioModifico) }}</span>
                  </div>
                  <div class="metadata-item">
                    <span class="label">Fecha:</span>
                    <span class="value">{{ formatFecha(config.fechaModificacion) }}</span>
                  </div>
                </div>
              </div>

              <!-- Formulario de edición -->
              <div v-else class="config-edit-form">
                <div class="form-group">
                  <label>Nuevo valor:</label>
                  <input 
                    v-if="config.tipo === 'STRING'"
                    v-model="configEditando.valor"
                    type="text"
                    class="form-input"
                    :placeholder="config.valor"
                  >
                  <input 
                    v-else-if="config.tipo === 'INTEGER'"
                    v-model.number="configEditando.valor"
                    type="number"
                    step="1"
                    class="form-input"
                    :placeholder="config.valor"
                  >
                  <input 
                    v-else-if="config.tipo === 'DECIMAL'"
                    v-model.number="configEditando.valor"
                    type="number"
                    step="0.01"
                    class="form-input"
                    :placeholder="config.valor"
                  >
                  <select 
                    v-else-if="config.tipo === 'BOOLEAN'"
                    v-model="configEditando.valor"
                    class="form-input"
                  >
                    <option value="true">Activado</option>
                    <option value="false">Desactivado</option>
                  </select>
                  <input 
                    v-else-if="config.tipo === 'DATE'"
                    v-model="configEditando.valor"
                    type="date"
                    class="form-input"
                  >
                  <textarea 
                    v-else-if="config.tipo === 'TEXT'"
                    v-model="configEditando.valor"
                    class="form-textarea"
                    rows="3"
                    :placeholder="config.valor"
                  ></textarea>
                </div>

                <div class="form-group">
                  <label>Descripción:</label>
                  <textarea 
                    v-model="configEditando.descripcion"
                    class="form-textarea"
                    rows="2"
                    :placeholder="config.descripcion || 'Descripción de la configuración...'"
                  ></textarea>
                </div>

                <div class="form-actions">
                  <button @click="guardarConfiguracion" class="btn-save" :disabled="guardando">
                    <svg v-if="!guardando" width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2"/>
                      <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
                      <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    <div v-else class="mini-spinner"></div>
                    {{ guardando ? 'Guardando...' : 'Guardar' }}
                  </button>
                  <button @click="cancelarEdicion" class="btn-cancel">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
                      <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
                    </svg>
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Estado vacío -->
      <div v-if="categoriasFiltradas.length === 0 && !loading" class="empty-state">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <path d="M8 12L12 16L16 12" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>No se encontraron configuraciones</h3>
        <p>No hay configuraciones que coincidan con los filtros aplicados.</p>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notificacion.mostrar" class="notification" :class="notificacion.tipo">
      <div class="notification-content">
        <svg v-if="notificacion.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
        </svg>
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <span>{{ notificacion.mensaje }}</span>
      </div>
      <button @click="cerrarNotificacion" class="notification-close">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
          <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup>
// Middleware de autenticación y autorización
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

// Título de la página
useHead({
  title: 'Configuración E-commerce - Freddy Fasbear Industries'
})

// Imports
import { ref, computed, onMounted } from 'vue'

// Estado reactivo
const loading = ref(true)
const error = ref(null)
const guardando = ref(false)
const configEditando = ref(null)

// Estado para configuraciones de e-commerce
const configuracionesEcommerce = ref([])

// Notificaciones
const notificacion = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})

// Filtros
const filtros = ref({
  busqueda: '',
  categoria: '',
  tipoDato: ''
})

// Computed properties
const categoriasFiltradas = computed(() => {
  const categorias = {
    general: {
      nombre: 'general',
      titulo: 'Configuraciones Generales',
      descripcion: 'Configuraciones básicas de la tienda en línea',
      configuraciones: []
    },
    pagos: {
      nombre: 'pagos',
      titulo: 'Métodos de Pago',
      descripcion: 'Configurar métodos de pago disponibles',
      configuraciones: []
    },
    envios: {
      nombre: 'envios',
      titulo: 'Configuraciones de Envío',
      descripcion: 'Costos y políticas de envío',
      configuraciones: []
    },
    promociones: {
      nombre: 'promociones',
      titulo: 'Promociones y Descuentos',
      descripcion: 'Configurar descuentos automáticos y promociones',
      configuraciones: []
    },
    politicas: {
      nombre: 'politicas',
      titulo: 'Políticas de la Tienda',
      descripcion: 'Políticas de devolución y garantías',
      configuraciones: []
    },
    apariencia: {
      nombre: 'apariencia',
      titulo: 'Apariencia de la Tienda',
      descripcion: 'Personalizar la apariencia visual',
      configuraciones: []
    }
  }

  // Filtrar configuraciones
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

  // Agrupar por categoría
  configsFiltradas.forEach(config => {
    if (categorias[config.categoria]) {
      categorias[config.categoria].configuraciones.push(config)
    }
  })

  // Retornar solo categorías que tienen configuraciones
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

// Métodos
const cargarConfiguraciones = async () => {
  try {
    loading.value = true
    error.value = null

    console.log('🔧 Cargando configuraciones de e-commerce desde la API...')

    // Obtener token desde sessionStorage (como lo hace tu sistema)
    const token = process.client ? sessionStorage.getItem('token') : null

    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    // Hacer petición a la API usando el método nativo de Nuxt
    const response = await $fetch('/api/admin/ecommerce-config', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })

    if (!response.success) {
      throw new Error(response.message || 'Error cargando configuraciones')
    }

    // Actualizar datos
    configuracionesEcommerce.value = response.data || []
    
    console.log(`✅ ${configuracionesEcommerce.value.length} configuraciones cargadas exitosamente`)
    
  } catch (err) {
    console.error('❌ Error cargando configuraciones:', err)
    error.value = err.message || 'Error cargando configuraciones de e-commerce'
    
    // En caso de error, mostrar datos de fallback para desarrollo
    if (process.client && window.location.hostname === 'localhost') {
      console.log('🔄 Cargando configuraciones de fallback para desarrollo...')
      configuracionesEcommerce.value = obtenerConfiguracionesFallback()
    }
  } finally {
    loading.value = false
  }
}

const iniciarEdicion = (config) => {
  configEditando.value = {
    id: config.id,
    valor: config.valor,
    descripcion: config.descripcion || ''
  }
}

const cancelarEdicion = () => {
  configEditando.value = null
}

const guardarConfiguracion = async () => {
  if (!configEditando.value) return

  try {
    guardando.value = true
    
    console.log(`💾 Guardando configuración ${configEditando.value.id}...`)

    // Obtener token desde sessionStorage (como lo hace tu sistema)
    const token = process.client ? sessionStorage.getItem('token') : null

    if (!token) {
      throw new Error('No se encontró token de autenticación')
    }

    // Hacer petición a la API usando el método nativo de Nuxt
    const response = await $fetch(`/api/admin/ecommerce-config/${configEditando.value.id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: {
        valor: configEditando.value.valor,
        descripcion: configEditando.value.descripcion
      }
    })

    if (!response.success) {
      throw new Error(response.message || 'Error actualizando configuración')
    }

    // Actualizar configuración en el array local
    const index = configuracionesEcommerce.value.findIndex(c => c.id === configEditando.value.id)
    if (index !== -1) {
      configuracionesEcommerce.value[index] = {
        ...configuracionesEcommerce.value[index],
        ...response.data
      }
    }

    mostrarNotificacion('success', 'Configuración actualizada correctamente')
    configEditando.value = null
    
    console.log('✅ Configuración guardada exitosamente')
    
  } catch (err) {
    console.error('❌ Error guardando configuración:', err)
    mostrarNotificacion('error', err.message || 'Error actualizando configuración')
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

// Métodos de formato
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
      return valor === 'true' ? 'Activado' : 'Desactivado'
    case 'DECIMAL':
      return `Q ${parseFloat(valor).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`
    case 'INTEGER':
      return parseInt(valor).toLocaleString('es-GT')
    case 'DATE':
      return new Date(valor).toLocaleDateString('es-GT')
    default:
      return valor
  }
}

const formatUsuarioModifico = (usuario) => {
  if (!usuario) return 'Sistema'
  if (usuario.includes('@')) return usuario
  return `${usuario.nombre} ${usuario.apellido}` || usuario
}

const formatFecha = (fecha) => {
  if (!fecha) return 'No disponible'
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatFechaRelativa = (fecha) => {
  const ahora = new Date()
  const diferencia = ahora - fecha
  const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24))
  
  if (dias === 0) return 'Hoy'
  if (dias === 1) return 'Ayer'
  if (dias < 7) return `Hace ${dias} días`
  if (dias < 30) return `Hace ${Math.floor(dias / 7)} semanas`
  return `Hace ${Math.floor(dias / 30)} meses`
}

const getCategoriaIcon = (categoria) => {
  const iconos = {
    general: () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { 'd': 'M12 8V12L16 14M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z', stroke: 'currentColor', 'stroke-width': '2' })
    ]),
    pagos: () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { 'd': 'M2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12Z', stroke: 'currentColor', 'stroke-width': '2' }),
      h('path', { 'd': 'M12 6V12L16 14', stroke: 'currentColor', 'stroke-width': '2' })
    ]),
    envios: () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { 'd': 'M16 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V8L16 3Z', stroke: 'currentColor', 'stroke-width': '2' }),
      h('polyline', { points: '16,3 16,8 21,8', stroke: 'currentColor', 'stroke-width': '2' })
    ]),
    promociones: () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' }, [
      h('polygon', { points: '12,2 15.09,8.26 22,9 17,14 18.18,21 12,17.77 5.82,21 7,14 2,9 8.91,8.26', stroke: 'currentColor', 'stroke-width': '2' })
    ]),
    politicas: () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' }, [
      h('path', { 'd': 'M12 1L3 5V11C3 16.55 6.84 21.74 12 23C17.16 21.74 21 16.55 21 11V5L12 1Z', stroke: 'currentColor', 'stroke-width': '2' })
    ]),
    apariencia: () => h('svg', { width: '24', height: '24', viewBox: '0 0 24 24', fill: 'none' }, [
      h('circle', { cx: '12', cy: '12', r: '3', stroke: 'currentColor', 'stroke-width': '2' }),
      h('path', { 'd': 'M12 1V3M12 21V23M4.22 4.22L5.64 5.64M18.36 18.36L19.78 19.78M1 12H3M21 12H23M4.22 19.78L5.64 18.36M18.36 5.64L19.78 4.22', stroke: 'currentColor', 'stroke-width': '2' })
    ])
  }
  return iconos[categoria] || iconos.general
}

// Configuraciones de fallback para desarrollo
const obtenerConfiguracionesFallback = () => {
  return [
    // Configuraciones Generales
    {
      id: 'ECOMMERCE_GENERAL_NOMBRE_TIENDA',
      nombre: 'Nombre de la Tienda',
      categoria: 'general',
      tipo: 'STRING',
      valor: 'Freddy Fasbear Store',
      descripcion: 'Nombre que aparece en la tienda en línea',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_GENERAL_MONEDA',
      nombre: 'Moneda Principal',
      categoria: 'general',
      tipo: 'STRING',
      valor: 'GTQ',
      descripcion: 'Código de moneda para mostrar precios',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_GENERAL_SIMBOLO_MONEDA',
      nombre: 'Símbolo de Moneda',
      categoria: 'general',
      tipo: 'STRING',
      valor: 'Q',
      descripcion: 'Símbolo que se muestra antes del precio',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_GENERAL_PRODUCTOS_POR_PAGINA',
      nombre: 'Productos por Página',
      categoria: 'general',
      tipo: 'INTEGER',
      valor: '12',
      descripcion: 'Número de productos que se muestran por página en el catálogo',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    
    // Métodos de Pago
    {
      id: 'ECOMMERCE_PAGOS_EFECTIVO',
      nombre: 'Pago en Efectivo',
      categoria: 'pagos',
      tipo: 'BOOLEAN',
      valor: 'true',
      descripcion: 'Permitir pagos en efectivo al recoger el producto',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_PAGOS_TRANSFERENCIA',
      nombre: 'Transferencia Bancaria',
      categoria: 'pagos',
      tipo: 'BOOLEAN',
      valor: 'true',
      descripcion: 'Permitir pagos por transferencia bancaria',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_PAGOS_TARJETA',
      nombre: 'Pago con Tarjeta',
      categoria: 'pagos',
      tipo: 'BOOLEAN',
      valor: 'false',
      descripcion: 'Permitir pagos con tarjeta de crédito/débito',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    
    // Configuraciones de Envío
    {
      id: 'ECOMMERCE_ENVIOS_COSTO_BASE',
      nombre: 'Costo Base de Envío',
      categoria: 'envios',
      tipo: 'DECIMAL',
      valor: '25.00',
      descripcion: 'Costo base para envíos dentro de la ciudad',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_ENVIOS_GRATIS_MONTO',
      nombre: 'Envío Gratis desde',
      categoria: 'envios',
      tipo: 'DECIMAL',
      valor: '500.00',
      descripcion: 'Monto mínimo de compra para envío gratuito',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_ENVIOS_TIEMPO_ENTREGA',
      nombre: 'Tiempo de Entrega',
      categoria: 'envios',
      tipo: 'STRING',
      valor: '2-5 días hábiles',
      descripcion: 'Tiempo estimado de entrega para mostrar al cliente',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    
    // Promociones y Descuentos
    {
      id: 'ECOMMERCE_PROMOCIONES_DESCUENTO_TIEMPO',
      nombre: 'Descuento por Tiempo en Inventario',
      categoria: 'promociones',
      tipo: 'BOOLEAN',
      valor: 'true',
      descripcion: 'Aplicar descuentos automáticos según tiempo en inventario',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_PROMOCIONES_DIAS_DESCUENTO',
      nombre: 'Días para Aplicar Descuento',
      categoria: 'promociones',
      tipo: 'INTEGER',
      valor: '30',
      descripcion: 'Días que debe estar un producto en inventario antes del descuento',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_PROMOCIONES_PORCENTAJE_DESCUENTO',
      nombre: 'Porcentaje de Descuento',
      categoria: 'promociones',
      tipo: 'DECIMAL',
      valor: '10.00',
      descripcion: 'Porcentaje de descuento a aplicar tras el tiempo configurado',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    
    // Políticas
    {
      id: 'ECOMMERCE_POLITICAS_DEVOLUCION',
      nombre: 'Días para Devolución',
      categoria: 'politicas',
      tipo: 'INTEGER',
      valor: '7',
      descripcion: 'Días que tiene el cliente para solicitar devolución',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_POLITICAS_GARANTIA',
      nombre: 'Días de Garantía',
      categoria: 'politicas',
      tipo: 'INTEGER',
      valor: '30',
      descripcion: 'Días de garantía para productos electrónicos',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    
    // Apariencia
    {
      id: 'ECOMMERCE_APARIENCIA_COLOR_PRIMARIO',
      nombre: 'Color Primario',
      categoria: 'apariencia',
      tipo: 'STRING',
      valor: '#D4AF37',
      descripcion: 'Color principal de la tienda en línea',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    },
    {
      id: 'ECOMMERCE_APARIENCIA_BANNER_TEXTO',
      nombre: 'Texto del Banner Principal',
      categoria: 'apariencia',
      tipo: 'TEXT',
      valor: 'Encuentra artículos únicos con precios increíbles',
      descripcion: 'Texto que aparece en el banner principal de la tienda',
      activo: true,
      usuarioModifico: 'admin@freddyfasbear.com',
      fechaModificacion: new Date().toISOString()
    }
  ]
}

// Lifecycle
onMounted(() => {
  cargarConfiguraciones()
})
</script>

<style scoped>
/* Usar exactamente los mismos estilos que parameters.vue */
.admin-ecommerce-config {
  min-height: 100vh;
  background: #f8f9fa;
  padding: 2rem;
}

.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  text-decoration: none;
  color: #4a5568;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-back:hover {
  background: #f7fafc;
  border-color: #d1d5db;
  color: #2d3748;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title h1 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0;
}

.page-title p {
  color: #4A4A4A;
  margin: 0.25rem 0 0;
}

.btn-primary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover:not(:disabled) {
  background: #B8941F;
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.loading-spinner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  text-align: center;
  max-width: 400px;
}

.error-content svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.error-content h3 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
}

.error-content p {
  color: #4A4A4A;
  margin-bottom: 2rem;
}

.btn-retry {
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-retry:hover {
  background: #B8941F;
}

.configuraciones-content {
  max-width: 1200px;
  margin: 0 auto;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-content h3 {
  font-size: 1.875rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0.25rem 0 0;
  font-weight: 500;
}

.filtros-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 300px;
  position: relative;
  display: flex;
  align-items: center;
}

.search-bar svg {
  position: absolute;
  left: 1rem;
  color: #9ca3af;
}

.search-bar input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 3rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.search-bar input:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: white;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 150px;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* Categorías */
.categoria-wrapper {
  margin-bottom: 3rem;
}

.categoria-header {
  background: white;
  padding: 1.5rem 2rem;
  border-radius: 12px 12px 0 0;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #f1f5f9;
}

.categoria-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.categoria-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.categoria-text h2 {
  font-size: 1.5rem;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 0.25rem;
}

.categoria-text p {
  color: #4A4A4A;
  margin: 0;
}

.categoria-stats {
  text-align: right;
}

.config-count {
  background: #D4AF37;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 600;
}

.configuraciones-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
  background: white;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.config-card {
  background: #f8fafc;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s ease;
}

.config-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
  border-color: #D4AF37;
}

.config-card.editando {
  border-color: #D4AF37;
  box-shadow: 0 8px 30px rgba(212, 175, 55, 0.2);
  background: white;
}

.config-header {
  padding: 1.5rem 1.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  border-bottom: 1px solid #f1f5f9;
}

.config-info h3 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #2C3E50;
  margin: 0 0 0.5rem;
}

.tipo-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
}

.tipo-badge.string { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
.tipo-badge.integer { background: rgba(16, 185, 129, 0.1); color: #10b981; }
.tipo-badge.decimal { background: rgba(245, 158, 11, 0.1); color: #f59e0b; }
.tipo-badge.boolean { background: rgba(139, 92, 246, 0.1); color: #8b5cf6; }
.tipo-badge.date { background: rgba(236, 72, 153, 0.1); color: #ec4899; }
.tipo-badge.text { background: rgba(168, 85, 247, 0.1); color: #a855f7; }

.btn-edit {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: none;
  padding: 0.5rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-edit:hover {
  background: rgba(212, 175, 55, 0.2);
}

.config-content {
  padding: 1rem 1.5rem 1.5rem;
}

.config-display .valor-actual {
  margin-bottom: 1rem;
}

.config-display label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.valor-display {
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-family: monospace;
  font-size: 0.875rem;
  color: #2d3748;
}

.valor-display.boolean { color: #8b5cf6; font-weight: 600; }
.valor-display.integer,
.valor-display.decimal { color: #10b981; font-weight: 600; }

.descripcion {
  margin-bottom: 1rem;
}

.descripcion p {
  padding: 0.75rem 1rem;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #4a5568;
  margin: 0.5rem 0 0;
  line-height: 1.5;
}

.metadata {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f1f5f9;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.metadata-item .label {
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
}

.metadata-item .value {
  font-size: 0.875rem;
  color: #374151;
}

.config-edit-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #4a5568;
}

.form-input,
.form-textarea {
  padding: 0.75rem 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: all 0.3s ease;
}

.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-textarea {
  resize: vertical;
  min-height: 60px;
}

.form-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-save {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #10b981;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.btn-save:hover:not(:disabled) {
  background: #059669;
}

.btn-save:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: #6b7280;
  color: white;
  border: none;
  padding: 0.75rem 1rem;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
  justify-content: center;
}

.btn-cancel:hover {
  background: #4b5563;
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 4rem 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state svg {
  color: #9ca3af;
  margin-bottom: 1rem;
}

.empty-state h3 {
  color: #374151;
  margin-bottom: 0.5rem;
}

.empty-state p {
  color: #6b7280;
  margin: 0;
}

.notification {
  position: fixed;
  top: 2rem;
  right: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  border-left: 4px solid;
  z-index: 1000;
  min-width: 300px;
  animation: slideIn 0.3s ease-out;
}

.notification.success {
  border-left-color: #10b981;
}

.notification.error {
  border-left-color: #ef4444;
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex: 1;
}

.notification.success .notification-content svg {
  color: #10b981;
}

.notification.error .notification-content svg {
  color: #ef4444;
}

.notification-close {
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.notification-close:hover {
  background: #f3f4f6;
  color: #374151;
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
  .admin-ecommerce-config {
    padding: 1rem;
  }

  .header-section {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }

  .filtros-section {
    flex-direction: column;
  }

  .search-bar {
    min-width: auto;
  }

  .configuraciones-grid {
    grid-template-columns: 1fr;
  }

  .metadata {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .categoria-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .notification {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    min-width: auto;
  }
}
</style>    