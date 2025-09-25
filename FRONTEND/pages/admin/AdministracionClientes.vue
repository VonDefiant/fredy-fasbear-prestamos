<template>
  <div class="admin-clientes">
    <div class="header-section">
      <div class="page-title">
        <div class="title-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M20 21V19C20 17.9391 19.5786 16.9217 18.8284 16.1716C18.0783 15.4214 17.0609 15 16 15H8C6.93913 15 5.92172 15.4214 5.17157 16.1716C4.42143 16.9217 4 17.9391 4 19V21" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <div>
          <h1>Gestión de Clientes</h1>
          <p>Administra los usuarios clientes de la plataforma</p>
        </div>
      </div>
      
      <button @click="mostrarModalCrear = true" class="btn-primary">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M12 5V19M5 12H19" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Nuevo Cliente
      </button>
    </div>

    <div v-if="loading" class="loading-state">
      <div class="loading-spinner">
        <div class="spinner"></div>
        <p>Cargando clientes...</p>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <div class="error-content">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
          <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
          <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
        </svg>
        <h3>Error al cargar clientes</h3>
        <p>{{ error }}</p>
        <button @click="cargarClientes" class="btn-retry">Reintentar</button>
      </div>
    </div>

    <div v-else>
      <div class="stats-cards">
        <div class="stat-card">
          <div class="stat-icon clients">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M17 21V19C17 17.9391 16.5786 16.9217 15.8284 16.1716C15.0783 15.4214 14.0609 15 13 15H5C3.93913 15 2.92172 15.4214 2.17157 16.1716C1.42143 16.9217 1 17.9391 1 19V21" stroke="currentColor" stroke-width="2"/>
              <circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
              <path d="M23 21V19C23 18.1645 22.7155 17.3541 22.2094 16.7071C21.7033 16.0601 20.9641 15.6148 20.1323 15.4386" stroke="currentColor" stroke-width="2"/>
              <path d="M16 3.13C16.8604 3.35031 17.623 3.81378 18.1676 4.48086C18.7122 5.14794 19.0078 5.9703 19.0078 6.82C19.0078 7.6697 18.7122 8.49206 18.1676 9.15914C17.623 9.82622 16.8604 10.2897 16 10.51" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats?.totalClients || 0 }}</h3>
            <p>Total Clientes</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon active">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 12H18L15 21L9 3L6 12H2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats?.activeClients || 0 }}</h3>
            <p>Clientes Activos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon loans">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
              <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
              <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats?.clientsWithLoans || 0 }}</h3>
            <p>Con Préstamos</p>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon new">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M8 2V5M16 2V5M3.5 9.09H20.5M21 8.5V17C21 17.5304 20.7893 18.0391 20.4142 18.4142C20.0391 18.7893 19.5304 19 19 19H5C4.46957 19 3.96086 18.7893 3.58579 18.4142C3.21071 18.0391 3 17.5304 3 17V8.5C3 7.96957 3.21071 7.46086 3.58579 7.08579C3.96086 6.71071 4.46957 6.5 5 6.5H19C19.5304 6.5 20.0391 6.71071 20.4142 7.08579C20.7893 7.46086 21 7.96957 21 8.5Z" stroke="currentColor" stroke-width="2"/>
            </svg>
          </div>
          <div class="stat-content">
            <h3>{{ stats?.newThisMonth || 0 }}</h3>
            <p>Nuevos Este Mes</p>
          </div>
        </div>
      </div>

      <div class="filters-section">
        <div class="search-box">
          <svg class="search-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
            <path d="M21 21L16.65 16.65" stroke="currentColor" stroke-width="2"/>
          </svg>
          <input 
            v-model="filtros.busqueda" 
            @input="debouncedBuscar"
            placeholder="Buscar por nombre, email, cédula..."
            class="search-input"
          />
        </div>

        <div class="filter-controls">
          <select v-model="filtros.estado" @change="aplicarFiltros" class="filter-select">
            <option value="">Todos los estados</option>
            <option value="Activo">Activos</option>
            <option value="Inactivo">Inactivos</option>
          </select>

          <select v-model="filtros.sortBy" @change="aplicarFiltros" class="filter-select">
            <option value="fechaRegistro">Fecha de Registro</option>
            <option value="nombre">Nombre</option>
            <option value="email">Email</option>
          </select>

          <select v-model="filtros.sortOrder" @change="aplicarFiltros" class="filter-select">
            <option value="desc">Descendente</option>
            <option value="asc">Ascendente</option>
          </select>
        </div>
      </div>

      <div class="clientes-table">
        <div class="table-container">
          <table class="data-table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Solicitudes</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="cliente in clientes" :key="cliente.id">
                <td>
                  <div class="client-info">
                    <div class="client-avatar">
                      {{ getInitials(cliente.nombre, cliente.apellido) }}
                    </div>
                    <div>
                      <div class="client-name">{{ cliente.nombre }} {{ cliente.apellido }}</div>
                      <div class="client-id">ID: {{ cliente.cedula }}</div>
                    </div>
                  </div>
                </td>
                <td>
                  <div class="contact-info">
                    <div>{{ cliente.email }}</div>
                    <div class="phone">{{ cliente.telefono }}</div>
                  </div>
                </td>
                <td>
                  <span :class="['status-badge', cliente.estado.toLowerCase()]">
                    {{ cliente.estado }}
                  </span>
                </td>
                <td>{{ formatDate(cliente.fechaRegistro) }}</td>
                <td>
                  <span class="requests-count">
                    {{ cliente._count?.solicitudes || 0 }}
                  </span>
                </td>
                <td>
                  <div class="action-buttons">
                    <button 
                      @click="verCliente(cliente)" 
                      class="btn-action view"
                      title="Ver detalles"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M1 12S5 4 12 4S23 12 23 12S19 20 12 20S1 12 1 12Z" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <button 
                      @click="editarCliente(cliente)" 
                      class="btn-action edit"
                      title="Editar"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M11 4H4C3.46957 4 2.96086 4.21071 2.58579 4.58579C2.21071 4.96086 2 5.46957 2 6V20C2 20.5304 2.21071 21.0391 2.58579 21.4142C2.96086 21.7893 3.46957 22 4 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V13" stroke="currentColor" stroke-width="2"/>
                        <path d="M18.5 2.50023C18.8978 2.1024 19.4374 1.87868 20 1.87868C20.5626 1.87868 21.1022 2.1024 21.5 2.50023C21.8978 2.89805 22.1215 3.43762 22.1215 4.00023C22.1215 4.56284 21.8978 5.1024 21.5 5.50023L12 15.0002L8 16.0002L9 12.0002L18.5 2.50023Z" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                    <button 
                      @click="toggleEstadoCliente(cliente)" 
                      :class="['btn-action', cliente.estado === 'Activo' ? 'deactivate' : 'activate']"
                      :title="cliente.estado === 'Activo' ? 'Desactivar' : 'Activar'"
                    >
                      <svg v-if="cliente.estado === 'Activo'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M16 12V8C16 6.93913 15.5786 5.92172 14.8284 5.17157C14.0783 4.42143 13.0609 4 12 4C10.9391 4 9.92172 4.42143 9.17157 5.17157C8.42143 5.92172 8 6.93913 8 8V12" stroke="currentColor" stroke-width="2"/>
                        <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                      </svg>
                      <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="11" width="18" height="10" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                        <circle cx="12" cy="16" r="1" stroke="currentColor" stroke-width="2"/>
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-if="pagination" class="pagination-controls">
          <button 
            @click="cambiarPagina(pagination.page - 1)"
            :disabled="pagination.page <= 1"
            class="btn-pagination"
          >
            Anterior
          </button>
          
          <span class="pagination-info">
            Página {{ pagination.page }} de {{ pagination.pages }} 
            ({{ pagination.total }} clientes)
          </span>
          
          <button 
            @click="cambiarPagina(pagination.page + 1)"
            :disabled="pagination.page >= pagination.pages"
            class="btn-pagination"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>

    <!-- Modal Crear Cliente -->
    <div v-if="mostrarModalCrear" class="modal-overlay" @click="cerrarModalCrear">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Crear Nuevo Cliente</h2>
          <button @click="cerrarModalCrear" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="crearCliente" class="client-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formCliente.nombre" 
                type="text" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Apellido *</label>
              <input 
                v-model="formCliente.apellido" 
                type="text" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="formCliente.email" 
                type="email" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Teléfono *</label>
              <input 
                v-model="formCliente.telefono" 
                type="tel" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Cédula *</label>
              <input 
                v-model="formCliente.cedula" 
                type="text" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Contraseña *</label>
              <input 
                v-model="formCliente.password" 
                type="password" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input 
                v-model="formCliente.fechaNacimiento" 
                type="date" 
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Estado</label>
              <select v-model="formCliente.estado" class="form-select">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label>Dirección *</label>
            <textarea 
              v-model="formCliente.direccion" 
              required
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cerrarModalCrear" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="guardandoCliente" class="btn-primary">
              <span v-if="guardandoCliente">Guardando...</span>
              <span v-else>Crear Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editar Cliente -->
    <div v-if="mostrarModalEditar" class="modal-overlay" @click="cerrarModalEditar">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>Editar Cliente</h2>
          <button @click="cerrarModalEditar" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <form @submit.prevent="actualizarCliente" class="client-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="formCliente.nombre" 
                type="text" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Apellido *</label>
              <input 
                v-model="formCliente.apellido" 
                type="text" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="formCliente.email" 
                type="email" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Teléfono *</label>
              <input 
                v-model="formCliente.telefono" 
                type="tel" 
                required
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Cédula</label>
              <input 
                v-model="formCliente.cedula" 
                type="text" 
                readonly
                class="form-input readonly"
              />
            </div>
            
            <div class="form-group">
              <label>Fecha de Nacimiento</label>
              <input 
                v-model="formCliente.fechaNacimiento" 
                type="date" 
                class="form-input"
              />
            </div>
            
            <div class="form-group">
              <label>Estado</label>
              <select v-model="formCliente.estado" class="form-select">
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="form-group full-width">
            <label>Dirección *</label>
            <textarea 
              v-model="formCliente.direccion" 
              required
              class="form-textarea"
              rows="3"
            ></textarea>
          </div>
          
          <div class="form-actions">
            <button type="button" @click="cerrarModalEditar" class="btn-secondary">
              Cancelar
            </button>
            <button type="submit" :disabled="guardandoCliente" class="btn-primary">
              <span v-if="guardandoCliente">Actualizando...</span>
              <span v-else>Actualizar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Ver Cliente -->
    <div v-if="mostrarModalVer && clienteSeleccionado" class="modal-overlay" @click="cerrarModalVer">
      <div class="modal-content large" @click.stop>
        <div class="modal-header">
          <h2>Detalles del Cliente</h2>
          <button @click="cerrarModalVer" class="btn-close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <line x1="18" y1="6" x2="6" y2="18" stroke="currentColor" stroke-width="2"/>
              <line x1="6" y1="6" x2="18" y2="18" stroke="currentColor" stroke-width="2"/>
            </svg>
          </button>
        </div>
        
        <div class="client-details">
          <div class="details-grid">
            <div class="detail-section">
              <h3>Información Personal</h3>
              <div class="detail-item">
                <label>Nombre Completo</label>
                <span>{{ clienteSeleccionado.nombre }} {{ clienteSeleccionado.apellido }}</span>
              </div>
              <div class="detail-item">
                <label>Cédula</label>
                <span>{{ clienteSeleccionado.cedula }}</span>
              </div>
              <div class="detail-item">
                <label>Fecha de Nacimiento</label>
                <span>{{ formatDate(clienteSeleccionado.fechaNacimiento) || 'No especificada' }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Información de Contacto</h3>
              <div class="detail-item">
                <label>Email</label>
                <span>{{ clienteSeleccionado.email }}</span>
              </div>
              <div class="detail-item">
                <label>Teléfono</label>
                <span>{{ clienteSeleccionado.telefono }}</span>
              </div>
              <div class="detail-item">
                <label>Dirección</label>
                <span>{{ clienteSeleccionado.direccion }}</span>
              </div>
            </div>
            
            <div class="detail-section">
              <h3>Estado y Registro</h3>
              <div class="detail-item">
                <label>Estado</label>
                <span :class="['status-badge', clienteSeleccionado.estado.toLowerCase()]">
                  {{ clienteSeleccionado.estado }}
                </span>
              </div>
              <div class="detail-item">
                <label>Fecha de Registro</label>
                <span>{{ formatDate(clienteSeleccionado.fechaRegistro) }}</span>
              </div>
            </div>
          </div>
          
          <div v-if="clienteSeleccionado.solicitudes && clienteSeleccionado.solicitudes.length > 0" class="solicitudes-section">
            <h3>Solicitudes Recientes</h3>
            <div class="solicitudes-list">
              <div v-for="solicitud in clienteSeleccionado.solicitudes" :key="solicitud.id" class="solicitud-item">
                <div class="solicitud-info">
                  <div class="solicitud-id">Solicitud #{{ solicitud.id }}</div>
                  <div class="solicitud-fecha">{{ formatDate(solicitud.fechaSolicitud) }}</div>
                </div>
                <div class="solicitud-details">
                  <span :class="['status-badge', solicitud.estado.toLowerCase()]">
                    {{ solicitud.estado }}
                  </span>
                  <span class="monto">
                    Q{{ formatNumber(solicitud.montoSolicitado) }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'

const loading = ref(true)
const error = ref(null)
const stats = ref(null)
const clientes = ref([])
const pagination = ref(null)

const mostrarModalCrear = ref(false)
const mostrarModalEditar = ref(false)
const mostrarModalVer = ref(false)
const clienteSeleccionado = ref(null)
const guardandoCliente = ref(false)

const filtros = ref({
  busqueda: '',
  estado: '',
  sortBy: 'fechaRegistro',
  sortOrder: 'desc',
  page: 1,
  limit: 50
})

const formCliente = ref({
  nombre: '',
  apellido: '',
  email: '',
  telefono: '',
  direccion: '',
  cedula: '',
  password: '',
  estado: 'Activo',
  fechaNacimiento: ''
})

const { $api } = useNuxtApp()

const cargarEstadisticas = async () => {
  try {
    const response = await $api('/api/clients/stats')
    if (response.success) {
      stats.value = response.data.stats
    }
  } catch (err) {
    console.error('Error cargando estadísticas:', err)
  }
}

const cargarClientes = async () => {
  try {
    loading.value = true
    error.value = null
    
    const params = new URLSearchParams()
    if (filtros.value.busqueda) params.append('busqueda', filtros.value.busqueda)
    if (filtros.value.estado) params.append('estado', filtros.value.estado)
    params.append('sortBy', filtros.value.sortBy)
    params.append('sortOrder', filtros.value.sortOrder)
    params.append('page', filtros.value.page.toString())
    params.append('limit', filtros.value.limit.toString())
    
    const response = await $api(`/api/clients?${params.toString()}`)
    
    if (response.success) {
      clientes.value = response.data.clients
      pagination.value = response.data.pagination
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.message || 'Error cargando clientes'
  } finally {
    loading.value = false
  }
}

const aplicarFiltros = () => {
  filtros.value.page = 1
  cargarClientes()
}

let timeoutBusqueda = null
const debouncedBuscar = () => {
  clearTimeout(timeoutBusqueda)
  timeoutBusqueda = setTimeout(() => {
    aplicarFiltros()
  }, 500)
}

const cambiarPagina = (nuevaPagina) => {
  if (nuevaPagina >= 1 && nuevaPagina <= pagination.value.pages) {
    filtros.value.page = nuevaPagina
    cargarClientes()
  }
}

const crearCliente = async () => {
  try {
    guardandoCliente.value = true
    
    const response = await $api('/api/clients', {
      method: 'POST',
      body: JSON.stringify(formCliente.value)
    })
    
    if (response.success) {
      cerrarModalCrear()
      cargarClientes()
      cargarEstadisticas()
      mostrarNotificacion('Cliente creado exitosamente', 'success')
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error creando cliente', 'error')
  } finally {
    guardandoCliente.value = false
  }
}

const actualizarCliente = async () => {
  try {
    guardandoCliente.value = true
    
    const response = await $api(`/api/clients/${formCliente.value.id}`, {
      method: 'PUT',
      body: JSON.stringify({
        nombre: formCliente.value.nombre,
        apellido: formCliente.value.apellido,
        email: formCliente.value.email,
        telefono: formCliente.value.telefono,
        direccion: formCliente.value.direccion,
        estado: formCliente.value.estado,
        fechaNacimiento: formCliente.value.fechaNacimiento
      })
    })
    
    if (response.success) {
      cerrarModalEditar()
      cargarClientes()
      cargarEstadisticas()
      mostrarNotificacion('Cliente actualizado exitosamente', 'success')
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error actualizando cliente', 'error')
  } finally {
    guardandoCliente.value = false
  }
}

const toggleEstadoCliente = async (cliente) => {
  try {
    const nuevoEstado = cliente.estado === 'Activo' ? 'Inactivo' : 'Activo'
    const confirmMessage = `¿Estás seguro que deseas ${nuevoEstado.toLowerCase()} este cliente?`
    
    if (confirm(confirmMessage)) {
      const response = await $api(`/api/clients/${cliente.id}/toggle-status`, {
        method: 'PUT'
      })
      
      if (response.success) {
        cargarClientes()
        cargarEstadisticas()
        mostrarNotificacion(`Cliente ${nuevoEstado.toLowerCase()} exitosamente`, 'success')
      } else {
        throw new Error(response.message)
      }
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error cambiando estado del cliente', 'error')
  }
}

const verCliente = async (cliente) => {
  try {
    const response = await $api(`/api/clients/${cliente.id}`)
    if (response.success) {
      clienteSeleccionado.value = response.data.cliente
      mostrarModalVer.value = true
    }
  } catch (err) {
    mostrarNotificacion('Error cargando detalles del cliente', 'error')
  }
}

const editarCliente = (cliente) => {
  formCliente.value = {
    id: cliente.id,
    nombre: cliente.nombre,
    apellido: cliente.apellido,
    email: cliente.email,
    telefono: cliente.telefono,
    direccion: cliente.direccion,
    cedula: cliente.cedula,
    estado: cliente.estado,
    fechaNacimiento: cliente.fechaNacimiento ? cliente.fechaNacimiento.split('T')[0] : ''
  }
  mostrarModalEditar.value = true
}

const cerrarModalCrear = () => {
  mostrarModalCrear.value = false
  formCliente.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    password: '',
    estado: 'Activo',
    fechaNacimiento: ''
  }
}

const cerrarModalEditar = () => {
  mostrarModalEditar.value = false
  formCliente.value = {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    direccion: '',
    cedula: '',
    password: '',
    estado: 'Activo',
    fechaNacimiento: ''
  }
}

const cerrarModalVer = () => {
  mostrarModalVer.value = false
  clienteSeleccionado.value = null
}

const getInitials = (nombre, apellido) => {
  return `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase()
}

const formatDate = (date) => {
  if (!date) return ''
  return new Date(date).toLocaleDateString('es-GT')
}

const formatNumber = (number) => {
  if (!number) return '0.00'
  return new Intl.NumberFormat('es-GT', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(number)
}

const mostrarNotificacion = (mensaje, tipo = 'info') => {
  if (tipo === 'success') {
    console.log('✅', mensaje)
  } else if (tipo === 'error') {
    console.error('❌', mensaje)
  }
}

onMounted(() => {
  cargarEstadisticas()
  cargarClientes()
})
</script>

<style scoped>
.admin-clientes {
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  gap: 1rem;
}

.page-title {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.title-icon {
  padding: 1rem;
  background: rgba(212, 175, 55, 0.1);
  border-radius: 12px;
  color: #D4AF37;
  display: flex;
  align-items: center;
  justify-content: center;
}

.page-title h1 {
  font-size: 1.8rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: #2C3E50;
}

.page-title p {
  margin: 0;
  color: #4A4A4A;
}

.btn-primary {
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.btn-primary:hover {
  background: #B8941F;
  transform: translateY(-2px);
}

.loading-state, .error-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 300px;
}

.loading-spinner {
  text-align: center;
}

.spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #D4AF37;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.error-content {
  text-align: center;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.error-content svg {
  color: #e74c3c;
  margin-bottom: 1rem;
}

.btn-retry {
  background: #D4AF37;
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 1rem;
}

.stats-cards {
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
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-icon.clients {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.stat-icon.active {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.stat-icon.loans {
  background: rgba(155, 89, 182, 0.1);
  color: #9B59B6;
}

.stat-icon.new {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.stat-content h3 {
  font-size: 1.75rem;
  font-weight: bold;
  margin: 0 0 0.25rem;
  color: #2C3E50;
}

.stat-content p {
  color: #4A4A4A;
  margin: 0;
  font-weight: 500;
}

.filters-section {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  margin-bottom: 1.5rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: center;
}

.search-box {
  position: relative;
  flex: 1;
  min-width: 300px;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #4A4A4A;
}

.search-input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 3rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  min-width: 150px;
}

.clientes-table {
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}

.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2C3E50;
  border-bottom: 1px solid #eee;
}

.data-table td {
  padding: 1rem;
  border-bottom: 1px solid #f1f1f1;
}

.client-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.client-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.client-name {
  font-weight: 600;
  color: #2C3E50;
}

.client-id {
  font-size: 0.9rem;
  color: #4A4A4A;
}

.contact-info div {
  margin-bottom: 0.25rem;
}

.phone {
  color: #4A4A4A;
  font-size: 0.9rem;
}

.status-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
}

.status-badge.activo {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.status-badge.inactivo {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.requests-count {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.9rem;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.btn-action {
  padding: 0.5rem;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-action.view {
  background: rgba(52, 152, 219, 0.1);
  color: #3498DB;
}

.btn-action.edit {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.btn-action.activate {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.btn-action.deactivate {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.btn-action:hover {
  transform: translateY(-2px);
  opacity: 0.8;
}

.pagination-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-top: 1px solid #eee;
}

.btn-pagination {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-pagination:hover:not(:disabled) {
  background: #f8f9fa;
}

.btn-pagination:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  color: #4A4A4A;
  font-weight: 500;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
}

.modal-content.large {
  max-width: 800px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.modal-header h2 {
  margin: 0;
  color: #2C3E50;
}

.btn-close {
  background: none;
  border: none;
  color: #4A4A4A;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  transition: all 0.3s ease;
}

.btn-close:hover {
  background: rgba(0, 0, 0, 0.1);
}

.client-form {
  padding: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #2C3E50;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  outline: none;
  border-color: #D4AF37;
}

.form-input.readonly {
  background: #f8f9fa;
  color: #6c757d;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #4A4A4A;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.client-details {
  padding: 1.5rem;
}

.details-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.detail-section h3 {
  color: #2C3E50;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 600;
}

.detail-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 1rem;
}

.detail-item label {
  font-size: 0.9rem;
  color: #4A4A4A;
  margin-bottom: 0.25rem;
  font-weight: 500;
}

.detail-item span {
  color: #2C3E50;
  font-weight: 500;
}

.solicitudes-section {
  border-top: 1px solid #eee;
  padding-top: 1.5rem;
}

.solicitudes-section h3 {
  color: #2C3E50;
  margin-bottom: 1rem;
}

.solicitudes-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.solicitud-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.solicitud-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.solicitud-id {
  font-weight: 600;
  color: #2C3E50;
}

.solicitud-fecha {
  font-size: 0.9rem;
  color: #4A4A4A;
}

.solicitud-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.monto {
  font-weight: 600;
  color: #27AE60;
}

.status-badge.pendiente {
  background: rgba(243, 156, 18, 0.1);
  color: #F39C12;
}

.status-badge.aprobada {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.status-badge.rechazada {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .filters-section {
    flex-direction: column;
  }
  
  .search-box {
    min-width: 100%;
  }
  
  .filter-controls {
    justify-content: stretch;
  }
  
  .filter-select {
    flex: 1;
    min-width: unset;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .details-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    width: 95%;
    margin: 1rem;
  }
}
</style>