<template>
  <div class="admin-personal-page">
    <div class="admin-container">
      <div class="admin-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <IconPersonal />
              Administración de Personal
            </h1>
            <p>Gestión de empleados internos del sistema</p>
          </div>
          <div class="header-actions">
            <button @click="abrirModalCrear" class="btn btn-primary">
              <IconPlus />
              Nuevo Empleado
            </button>
          </div>
        </div>
        
        <div class="filtros-container">
          <div class="filtros-group">
            <div class="search-box">
              <IconBuscar />
              <input 
                v-model="filtros.busqueda"
                type="text" 
                placeholder="Buscar por nombre, email o cédula..."
                @input="filtrarPersonal"
              >
            </div>
            <select v-model="filtros.tipoUsuario" @change="filtrarPersonal" class="filter-select">
              <option value="">Todos los tipos</option>
              <option value="Administrador">Administradores</option>
              <option value="Evaluador">Evaluadores</option>
              <option value="Cobrador">Cobradores</option>
            </select>
            <select v-model="filtros.estado" @change="filtrarPersonal" class="filter-select">
              <option value="">Todos los estados</option>
              <option value="Activo">Activos</option>
              <option value="Inactivo">Inactivos</option>
            </select>
          </div>
        </div>
      </div>

      <div v-if="loading" class="loading-container">
        <div class="loading-spinner">
          <IconCargando />
        </div>
        <p>Cargando personal...</p>
      </div>

      <div v-else-if="error" class="error-container">
        <IconError />
        <h3>Error al cargar el personal</h3>
        <p>{{ error }}</p>
        <button @click="cargarPersonal" class="btn btn-secondary">
          <IconRecargar />
          Reintentar
        </button>
      </div>

      <div v-else class="personal-content">
        <div class="estadisticas-grid">
          <div class="stat-card administradores">
            <div class="stat-icon">
              <IconAdmin />
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.administradores }}</h3>
              <p>Administradores</p>
            </div>
          </div>
          <div class="stat-card evaluadores">
            <div class="stat-icon">
              <IconEvaluador />
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.evaluadores }}</h3>
              <p>Evaluadores</p>
            </div>
          </div>
          <div class="stat-card cobradores">
            <div class="stat-icon">
              <IconCobrador />
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.cobradores }}</h3>
              <p>Cobradores</p>
            </div>
          </div>
          <div class="stat-card activos">
            <div class="stat-icon">
              <IconActivo />
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.activos }}</h3>
              <p>Personal Activo</p>
            </div>
          </div>
        </div>

        <div class="personal-tabla-container">
          <div class="tabla-header">
            <h2>Personal del Sistema ({{ personalFiltrado.length }})</h2>
            <div class="vista-controles">
              <button 
                @click="vistaActual = 'tabla'" 
                :class="['btn-vista', { active: vistaActual === 'tabla' }]"
              >
                <IconTabla />
              </button>
              <button 
                @click="vistaActual = 'tarjetas'" 
                :class="['btn-vista', { active: vistaActual === 'tarjetas' }]"
              >
                <IconTarjetas />
              </button>
            </div>
          </div>

          <div v-if="vistaActual === 'tabla'" class="tabla-wrapper">
            <table class="personal-tabla">
              <thead>
                <tr>
                  <th>Empleado</th>
                  <th>Contacto</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th>Registro</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="empleado in personalFiltrado" :key="empleado.id" class="empleado-row">
                  <td>
                    <div class="empleado-info">
                      <div class="empleado-avatar">
                        <span>{{ obtenerIniciales(empleado.nombre, empleado.apellido) }}</span>
                      </div>
                      <div class="empleado-datos">
                        <strong>{{ empleado.nombre }} {{ empleado.apellido }}</strong>
                        <small>{{ empleado.cedula }}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div class="contacto-info">
                      <div>{{ empleado.email }}</div>
                      <div>{{ empleado.telefono }}</div>
                    </div>
                  </td>
                  <td>
                    <span :class="['badge-tipo', empleado.tipoUsuario.toLowerCase()]">
                      {{ empleado.tipoUsuario }}
                    </span>
                  </td>
                  <td>
                    <span :class="['badge-estado', empleado.estado.toLowerCase()]">
                      {{ empleado.estado }}
                    </span>
                  </td>
                  <td>
                    <div class="fecha-info">
                      {{ formatearFecha(empleado.fechaRegistro) }}
                    </div>
                  </td>
                  <td>
                    <div class="acciones-grupo">
                      <button @click="editarEmpleado(empleado)" class="btn-accion editar">
                        <IconEditar />
                      </button>
                      <button @click="cambiarEstadoEmpleado(empleado)" class="btn-accion estado">
                        <IconCambiarEstado />
                      </button>
                      <button @click="verDetalleEmpleado(empleado)" class="btn-accion ver">
                        <IconVer />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div v-else class="tarjetas-grid">
            <div v-for="empleado in personalFiltrado" :key="empleado.id" class="empleado-card">
              <div class="card-header">
                <div class="empleado-avatar-large">
                  <span>{{ obtenerIniciales(empleado.nombre, empleado.apellido) }}</span>
                </div>
                <div class="empleado-status">
                  <span :class="['badge-estado', empleado.estado.toLowerCase()]">
                    {{ empleado.estado }}
                  </span>
                </div>
              </div>
              <div class="card-body">
                <h3>{{ empleado.nombre }} {{ empleado.apellido }}</h3>
                <p class="empleado-cedula">{{ empleado.cedula }}</p>
                <div class="empleado-tipo">
                  <span :class="['badge-tipo', empleado.tipoUsuario.toLowerCase()]">
                    {{ empleado.tipoUsuario }}
                  </span>
                </div>
                <div class="contacto-card">
                  <div class="contacto-item">
                    <IconEmail />
                    <span>{{ empleado.email }}</span>
                  </div>
                  <div class="contacto-item">
                    <IconTelefono />
                    <span>{{ empleado.telefono }}</span>
                  </div>
                </div>
                <div class="fecha-registro">
                  Registrado: {{ formatearFecha(empleado.fechaRegistro) }}
                </div>
              </div>
              <div class="card-actions">
                <button @click="editarEmpleado(empleado)" class="btn btn-secondary">
                  <IconEditar />
                  Editar
                </button>
                <button @click="verDetalleEmpleado(empleado)" class="btn btn-primary">
                  <IconVer />
                  Ver Detalles
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal Crear/Editar Empleado -->
    <div v-if="modalEmpleado.visible" class="modal-overlay" @click="cerrarModal">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>
            <IconPersonal />
            {{ modalEmpleado.editando ? 'Editar Empleado' : 'Nuevo Empleado' }}
          </h2>
          <button @click="cerrarModal" class="btn-cerrar">
            <IconCerrar />
          </button>
        </div>
        
        <form @submit.prevent="guardarEmpleado" class="modal-form">
          <div class="form-grid">
            <div class="form-group">
              <label>Nombre *</label>
              <input 
                v-model="modalEmpleado.datos.nombre" 
                type="text" 
                required 
                :disabled="modalEmpleado.guardando"
              >
            </div>
            <div class="form-group">
              <label>Apellido *</label>
              <input 
                v-model="modalEmpleado.datos.apellido" 
                type="text" 
                required 
                :disabled="modalEmpleado.guardando"
              >
            </div>
            <div class="form-group">
              <label>Cédula *</label>
              <input 
                v-model="modalEmpleado.datos.cedula" 
                type="text" 
                required 
                :disabled="modalEmpleado.guardando"
              >
            </div>
            <div class="form-group">
              <label>Email *</label>
              <input 
                v-model="modalEmpleado.datos.email" 
                type="email" 
                required 
                :disabled="modalEmpleado.guardando"
              >
            </div>
            <div class="form-group">
              <label>Teléfono *</label>
              <input 
                v-model="modalEmpleado.datos.telefono" 
                type="tel" 
                required 
                :disabled="modalEmpleado.guardando"
              >
            </div>
            <div class="form-group">
              <label>Tipo de Usuario *</label>
              <select 
                v-model="modalEmpleado.datos.tipoUsuario" 
                required 
                :disabled="modalEmpleado.guardando"
              >
                <option value="">Seleccionar tipo</option>
                <option value="Administrador">Administrador</option>
                <option value="Evaluador">Evaluador</option>
                <option value="Cobrador">Cobrador</option>
              </select>
            </div>
            <div class="form-group full-width">
              <label>Dirección *</label>
              <textarea 
                v-model="modalEmpleado.datos.direccion" 
                required 
                :disabled="modalEmpleado.guardando"
                rows="3"
              ></textarea>
            </div>
            <div v-if="!modalEmpleado.editando" class="form-group">
              <label>Contraseña *</label>
              <input 
                v-model="modalEmpleado.datos.password" 
                type="password" 
                required 
                :disabled="modalEmpleado.guardando"
              >
            </div>
            <div class="form-group">
              <label>Estado</label>
              <select 
                v-model="modalEmpleado.datos.estado" 
                :disabled="modalEmpleado.guardando"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>
          
          <div class="modal-actions">
            <button type="button" @click="cerrarModal" class="btn btn-secondary">
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary" :disabled="modalEmpleado.guardando">
              <IconCargando v-if="modalEmpleado.guardando" />
              <IconGuardar v-else />
              {{ modalEmpleado.guardando ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Detalle Empleado -->
    <div v-if="modalDetalle.visible" class="modal-overlay" @click="cerrarModalDetalle">
      <div class="modal-container" @click.stop>
        <div class="modal-header">
          <h2>
            <IconPersonal />
            Detalles del Empleado
          </h2>
          <button @click="cerrarModalDetalle" class="btn-cerrar">
            <IconCerrar />
          </button>
        </div>
        
        <div class="detalle-content">
          <div class="empleado-perfil">
            <div class="perfil-avatar">
              <span>{{ obtenerIniciales(modalDetalle.empleado.nombre, modalDetalle.empleado.apellido) }}</span>
            </div>
            <div class="perfil-info">
              <h3>{{ modalDetalle.empleado.nombre }} {{ modalDetalle.empleado.apellido }}</h3>
              <p>{{ modalDetalle.empleado.tipoUsuario }}</p>
              <span :class="['badge-estado', modalDetalle.empleado.estado.toLowerCase()]">
                {{ modalDetalle.empleado.estado }}
              </span>
            </div>
          </div>
          
          <div class="detalle-grid">
            <div class="detalle-item">
              <label>Cédula:</label>
              <span>{{ modalDetalle.empleado.cedula }}</span>
            </div>
            <div class="detalle-item">
              <label>Email:</label>
              <span>{{ modalDetalle.empleado.email }}</span>
            </div>
            <div class="detalle-item">
              <label>Teléfono:</label>
              <span>{{ modalDetalle.empleado.telefono }}</span>
            </div>
            <div class="detalle-item">
              <label>Fecha de Registro:</label>
              <span>{{ formatearFecha(modalDetalle.empleado.fechaRegistro) }}</span>
            </div>
            <div class="detalle-item full-width">
              <label>Dirección:</label>
              <span>{{ modalDetalle.empleado.direccion }}</span>
            </div>
          </div>
        </div>
        
        <div class="modal-actions">
          <button @click="editarEmpleado(modalDetalle.empleado)" class="btn btn-primary">
            <IconEditar />
            Editar Empleado
          </button>
        </div>
      </div>
    </div>

    <!-- Notificación -->
    <div v-if="notificacion.visible" :class="['notificacion', notificacion.tipo]">
      <div class="notificacion-content">
        <IconExito v-if="notificacion.tipo === 'exito'" />
        <IconError v-else />
        <span>{{ notificacion.mensaje }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
const config = useRuntimeConfig()

// Composables
const { $api } = useNuxtApp()

// Estado reactivo
const loading = ref(false)
const error = ref(null)
const personal = ref([])
const vistaActual = ref('tabla')

const filtros = reactive({
  busqueda: '',
  tipoUsuario: '',
  estado: ''
})

const modalEmpleado = reactive({
  visible: false,
  editando: false,
  guardando: false,
  datos: {
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoUsuario: '',
    estado: 'Activo',
    password: ''
  }
})

const modalDetalle = reactive({
  visible: false,
  empleado: {}
})

const notificacion = reactive({
  visible: false,
  tipo: 'exito',
  mensaje: ''
})

// Computadas
const estadisticas = computed(() => {
  return {
    administradores: personal.value.filter(p => p.tipoUsuario === 'Administrador').length,
    evaluadores: personal.value.filter(p => p.tipoUsuario === 'Evaluador').length,
    cobradores: personal.value.filter(p => p.tipoUsuario === 'Cobrador').length,
    activos: personal.value.filter(p => p.estado === 'Activo').length
  }
})

const personalFiltrado = computed(() => {
  let resultado = personal.value.filter(empleado => 
    ['Administrador', 'Evaluador', 'Cobrador'].includes(empleado.tipoUsuario)
  )

  if (filtros.busqueda) {
    const busqueda = filtros.busqueda.toLowerCase()
    resultado = resultado.filter(empleado =>
      empleado.nombre.toLowerCase().includes(busqueda) ||
      empleado.apellido.toLowerCase().includes(busqueda) ||
      empleado.email.toLowerCase().includes(busqueda) ||
      empleado.cedula.includes(busqueda)
    )
  }

  if (filtros.tipoUsuario) {
    resultado = resultado.filter(empleado => empleado.tipoUsuario === filtros.tipoUsuario)
  }

  if (filtros.estado) {
    resultado = resultado.filter(empleado => empleado.estado === filtros.estado)
  }

  return resultado.sort((a, b) => new Date(b.fechaRegistro) - new Date(a.fechaRegistro))
})

// Métodos
const cargarPersonal = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await $api('/auth/users', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    })

    if (response.success) {
      personal.value = response.data.users || []
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    error.value = err.message || 'Error al cargar el personal'
    console.error('Error cargando personal:', err)
  } finally {
    loading.value = false
  }
}

const filtrarPersonal = () => {
  // La filtración se realiza automáticamente por la computed personalFiltrado
}

const abrirModalCrear = () => {
  modalEmpleado.editando = false
  modalEmpleado.datos = {
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    direccion: '',
    tipoUsuario: '',
    estado: 'Activo',
    password: ''
  }
  modalEmpleado.visible = true
}

const editarEmpleado = (empleado) => {
  modalEmpleado.editando = true
  modalEmpleado.datos = {
    id: empleado.id,
    nombre: empleado.nombre,
    apellido: empleado.apellido,
    cedula: empleado.cedula,
    email: empleado.email,
    telefono: empleado.telefono,
    direccion: empleado.direccion,
    tipoUsuario: empleado.tipoUsuario,
    estado: empleado.estado
  }
  modalEmpleado.visible = true
  modalDetalle.visible = false
}

const guardarEmpleado = async () => {
  try {
    modalEmpleado.guardando = true
    
    const endpoint = modalEmpleado.editando 
      ? `/auth/users/${modalEmpleado.datos.id}`
      : '/auth/register'
    
    const method = modalEmpleado.editando ? 'PUT' : 'POST'
    
    const response = await $api(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(modalEmpleado.datos)
    })

    if (response.success) {
      mostrarNotificacion(
        modalEmpleado.editando ? 'Empleado actualizado correctamente' : 'Empleado creado correctamente',
        'exito'
      )
      cerrarModal()
      await cargarPersonal()
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error al guardar empleado', 'error')
  } finally {
    modalEmpleado.guardando = false
  }
}

const cambiarEstadoEmpleado = async (empleado) => {
  try {
    const nuevoEstado = empleado.estado === 'Activo' ? 'Inactivo' : 'Activo'
    
    const response = await $api(`/auth/users/${empleado.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        ...empleado,
        estado: nuevoEstado
      })
    })

    if (response.success) {
      mostrarNotificacion(`Estado cambiado a ${nuevoEstado}`, 'exito')
      await cargarPersonal()
    } else {
      throw new Error(response.message)
    }
  } catch (err) {
    mostrarNotificacion(err.message || 'Error al cambiar estado', 'error')
  }
}

const verDetalleEmpleado = (empleado) => {
  modalDetalle.empleado = { ...empleado }
  modalDetalle.visible = true
}

const cerrarModal = () => {
  modalEmpleado.visible = false
  modalEmpleado.guardando = false
}

const cerrarModalDetalle = () => {
  modalDetalle.visible = false
}

const obtenerIniciales = (nombre, apellido) => {
  return `${nombre?.charAt(0) || ''}${apellido?.charAt(0) || ''}`.toUpperCase()
}

const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}

const mostrarNotificacion = (mensaje, tipo = 'exito') => {
  notificacion.mensaje = mensaje
  notificacion.tipo = tipo
  notificacion.visible = true
  
  setTimeout(() => {
    notificacion.visible = false
  }, 5000)
}

// Ciclo de vida
onMounted(() => {
  cargarPersonal()
})

// Componentes de iconos
const IconPersonal = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  `
}

const IconPlus = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  `
}

const IconBuscar = {
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  `
}

const IconCargando = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
      <path d="M21 12a9 9 0 11-6.219-8.56"/>
    </svg>
  `
}

const IconError = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>
  `
}

const IconRecargar = {
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <polyline points="23 4 23 10 17 10"/>
      <polyline points="1 20 1 14 7 14"/>
      <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"/>
    </svg>
  `
}

const IconAdmin = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
      <path d="M2 17l10 5 10-5"/>
      <path d="M2 12l10 5 10-5"/>
    </svg>
  `
}

const IconEvaluador = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M9 11H3v9h6v-9zM21 11h-6v9h6v-9zM15 4h-6v7h6V4z"/>
    </svg>
  `
}

const IconCobrador = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="12" y1="1" x2="12" y2="23"/>
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
    </svg>
  `
}

const IconActivo = {
  template: `
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  `
}

const IconTabla = {
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M3 6h18v12H3z"/>
      <path d="M3 10h18M8 6v12"/>
    </svg>
  `
}

const IconTarjetas = {
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <rect x="3" y="3" width="7" height="7"/>
      <rect x="14" y="3" width="7" height="7"/>
      <rect x="14" y="14" width="7" height="7"/>
      <rect x="3" y="14" width="7" height="7"/>
    </svg>
  `
}

const IconEditar = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  `
}

const IconCambiarEstado = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
    </svg>
  `
}

const IconVer = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  `
}

const IconEmail = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
      <polyline points="22,6 12,13 2,6"/>
    </svg>
  `
}

const IconTelefono = {
  template: `
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
    </svg>
  `
}

const IconCerrar = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  `
}

const IconGuardar = {
  template: `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17,21 17,13 7,13 7,21"/>
      <polyline points="7,3 7,8 15,8"/>
    </svg>
  `
}

const IconExito = {
  template: `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>
  `
}
</script>

<style scoped>
/* Variables CSS con paleta corporativa */
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

.admin-personal-page {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-azul-marino) 0%, var(--color-gris-acero) 50%, var(--color-negro-carbon) 100%);
  padding: 2rem 0;
}

.admin-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Header */
.admin-header {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  margin-bottom: 2rem;
  overflow: hidden;
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
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.header-info p {
  margin: 0;
  color: var(--color-gris-acero);
  font-size: 1.1rem;
}

.header-actions {
  display: flex;
  gap: 1rem;
}

.filtros-container {
  padding: 1.5rem 2rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
}

.filtros-group {
  display: flex;
  gap: 1rem;
  align-items: center;
  flex-wrap: wrap;
}

.search-box {
  position: relative;
  flex: 2;
  min-width: 300px;
}

.search-box svg {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-gris-acero);
}

.search-box input {
  width: 100%;
  padding: 0.75rem 0.75rem 0.75rem 2.5rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  transition: var(--transition);
}

.search-box input:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.filter-select {
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  background: white;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
}

.filter-select:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

/* Estados de carga */
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

.loading-spinner,
.error-container svg {
  margin-bottom: 1.5rem;
  color: var(--color-dorado-vintage);
}

/* Estadísticas */
.estadisticas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.stat-card {
  background: linear-gradient(135deg, var(--color-blanco-perla), white);
  border-radius: var(--border-radius);
  padding: 1.5rem;
  box-shadow: var(--shadow-card);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: var(--transition);
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(26, 26, 26, 0.3);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.administradores .stat-icon {
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
}

.evaluadores .stat-icon {
  background: linear-gradient(135deg, var(--color-azul-marino), #3498db);
}

.cobradores .stat-icon {
  background: linear-gradient(135deg, var(--color-verde-bosque), #27ae60);
}

.activos .stat-icon {
  background: linear-gradient(135deg, var(--color-rojo-granate), #e74c3c);
}

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 2rem;
  font-weight: 700;
  color: var(--color-negro-carbon);
}

.stat-info p {
  margin: 0;
  color: var(--color-gris-acero);
  font-weight: 500;
}

/* Contenido principal */
.personal-content {
  background: var(--color-blanco-perla);
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  overflow: hidden;
}

.personal-tabla-container {
  padding: 2rem;
}

.tabla-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.tabla-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.vista-controles {
  display: flex;
  gap: 0.5rem;
}

.btn-vista {
  padding: 0.5rem;
  border: 2px solid #e9ecef;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: var(--transition);
}

.btn-vista.active,
.btn-vista:hover {
  border-color: var(--color-dorado-vintage);
  background: var(--color-dorado-vintage);
  color: white;
}

/* Tabla */
.tabla-wrapper {
  overflow-x: auto;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.1);
}

.personal-tabla {
  width: 100%;
  border-collapse: collapse;
  background: white;
}

.personal-tabla th {
  background: linear-gradient(135deg, var(--color-negro-carbon), var(--color-gris-acero));
  color: white;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.personal-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #f1f5f9;
  vertical-align: middle;
}

.empleado-row:hover {
  background: rgba(212, 175, 55, 0.05);
}

.empleado-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.empleado-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 0.875rem;
}

.empleado-datos strong {
  display: block;
  color: var(--color-negro-carbon);
  font-weight: 600;
}

.empleado-datos small {
  color: var(--color-gris-acero);
  font-size: 0.8rem;
}

.contacto-info div {
  margin-bottom: 0.25rem;
}

.contacto-info div:first-child {
  font-weight: 500;
  color: var(--color-negro-carbon);
}

.contacto-info div:last-child {
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.badge-tipo,
.badge-estado {
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo.administrador {
  background: rgba(212, 175, 55, 0.2);
  color: var(--color-dorado-vintage);
}

.badge-tipo.evaluador {
  background: rgba(44, 62, 80, 0.2);
  color: var(--color-azul-marino);
}

.badge-tipo.cobrador {
  background: rgba(27, 67, 50, 0.2);
  color: var(--color-verde-bosque);
}

.badge-estado.activo {
  background: rgba(27, 67, 50, 0.2);
  color: var(--color-verde-bosque);
}

.badge-estado.inactivo {
  background: rgba(139, 0, 0, 0.2);
  color: var(--color-rojo-granate);
}

.fecha-info {
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.acciones-grupo {
  display: flex;
  gap: 0.5rem;
}

.btn-accion {
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.btn-accion.editar {
  background: rgba(212, 175, 55, 0.1);
  color: var(--color-dorado-vintage);
}

.btn-accion.editar:hover {
  background: var(--color-dorado-vintage);
  color: white;
}

.btn-accion.estado {
  background: rgba(44, 62, 80, 0.1);
  color: var(--color-azul-marino);
}

.btn-accion.estado:hover {
  background: var(--color-azul-marino);
  color: white;
}

.btn-accion.ver {
  background: rgba(27, 67, 50, 0.1);
  color: var(--color-verde-bosque);
}

.btn-accion.ver:hover {
  background: var(--color-verde-bosque);
  color: white;
}

/* Vista de tarjetas */
.tarjetas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
}

.empleado-card {
  background: white;
  border-radius: var(--border-radius);
  box-shadow: 0 8px 25px rgba(26, 26, 26, 0.1);
  overflow: hidden;
  transition: var(--transition);
}

.empleado-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 40px rgba(26, 26, 26, 0.3);
}

.card-header {
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-negro-carbon), var(--color-gris-acero));
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.empleado-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.25rem;
}

.card-body {
  padding: 1.5rem;
}

.card-body h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.empleado-cedula {
  margin: 0 0 1rem 0;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.empleado-tipo {
  margin-bottom: 1.5rem;
}

.contacto-card {
  margin-bottom: 1.5rem;
}

.contacto-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  color: var(--color-gris-acero);
  font-size: 0.875rem;
}

.contacto-item svg {
  color: var(--color-dorado-vintage);
}

.fecha-registro {
  color: var(--color-gris-acero);
  font-size: 0.8rem;
}

.card-actions {
  padding: 1rem 1.5rem;
  background: #f8fafc;
  display: flex;
  gap: 1rem;
}

/* Botones */
.btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  color: var(--color-negro-carbon);
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.4);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.6);
}

.btn-secondary {
  background: rgba(74, 74, 74, 0.1);
  color: var(--color-gris-acero);
  border: 2px solid rgba(74, 74, 74, 0.2);
}

.btn-secondary:hover {
  background: var(--color-gris-acero);
  color: white;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

/* Modales */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(26, 26, 26, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 2rem;
}

.modal-container {
  background: white;
  border-radius: 20px;
  box-shadow: var(--shadow-card);
  max-width: 600px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
}

.modal-header {
  padding: 2rem 2rem 1rem 2rem;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.btn-cerrar {
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(139, 0, 0, 0.1);
  color: var(--color-rojo-granate);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.btn-cerrar:hover {
  background: var(--color-rojo-granate);
  color: white;
}

.modal-form {
  padding: 2rem;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-group label {
  margin-bottom: 0.5rem;
  color: var(--color-negro-carbon);
  font-weight: 500;
  font-size: 0.875rem;
}

.form-group input,
.form-group select,
.form-group textarea {
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: var(--transition);
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: var(--color-dorado-vintage);
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-group input:disabled,
.form-group select:disabled,
.form-group textarea:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
  opacity: 0.7;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Modal detalle */
.detalle-content {
  padding: 2rem;
}

.empleado-perfil {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 2rem;
  padding: 1.5rem;
  background: linear-gradient(135deg, var(--color-blanco-perla), #f8fafc);
  border-radius: var(--border-radius);
}

.perfil-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, var(--color-dorado-vintage), var(--color-dorado-claro));
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 700;
  font-size: 1.5rem;
}

.perfil-info h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--color-negro-carbon);
}

.perfil-info p {
  margin: 0 0 0.75rem 0;
  color: var(--color-gris-acero);
  font-weight: 500;
}

.detalle-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.detalle-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.detalle-item.full-width {
  grid-column: 1 / -1;
}

.detalle-item label {
  font-weight: 600;
  color: var(--color-negro-carbon);
  font-size: 0.875rem;
}

.detalle-item span {
  color: var(--color-gris-acero);
  padding: 0.5rem 0;
}

/* Notificaciones */
.notificacion {
  position: fixed;
  top: 2rem;
  right: 2rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  box-shadow: var(--shadow-card);
  z-index: 1001;
  transform: translateX(100%);
  animation: slideIn 0.3s ease forwards;
}

.notificacion.exito {
  background: linear-gradient(135deg, var(--color-verde-bosque), #27ae60);
  color: white;
}

.notificacion.error {
  background: linear-gradient(135deg, var(--color-rojo-granate), #e74c3c);
  color: white;
}

.notificacion-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-weight: 500;
}

@keyframes slideIn {
  to {
    transform: translateX(0);
  }
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .admin-container {
    padding: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .filtros-group {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-box {
    min-width: auto;
  }
  
  .estadisticas-grid {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  }
  
  .tabla-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }
  
  .tarjetas-grid {
    grid-template-columns: 1fr;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-actions {
    flex-direction: column;
  }
  
  .empleado-perfil {
    flex-direction: column;
    text-align: center;
  }
  
  .detalle-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .admin-personal-page {
    padding: 1rem 0;
  }
  
  .modal-overlay {
    padding: 1rem;
  }
  
  .modal-header,
  .modal-form,
  .detalle-content {
    padding: 1.5rem;
  }
  
  .notificacion {
    left: 1rem;
    right: 1rem;
    top: 1rem;
  }
}
</style>