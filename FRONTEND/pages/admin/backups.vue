<template>
  <div class="backups-page">
    <div class="backups-container">
      <!-- Botón de regreso -->
      <div class="navigation-header">
        <NuxtLink to="/admin" class="btn-back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Volver al Panel
        </NuxtLink>
      </div>

      <!-- Header -->
      <div class="backups-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Gestión de Respaldos
            </h1>
            <p>Administra los respaldos de tu sistema y base de datos</p>
          </div>
          <div class="header-actions">
            <button @click="crearRespaldo" :disabled="loading" class="btn-primary">
              <svg v-if="!loading" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
              </svg>
              {{ loading ? 'Creando...' : 'Crear Respaldo' }}
            </button>
          </div>
        </div>

        <!-- Estadísticas rápidas -->
        <div class="stats-row">
          <div class="stat-box">
            <div class="stat-icon" style="background: rgba(212, 175, 55, 0.1); color: #D4AF37;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.total }}</h3>
              <p>Respaldos Totales</p>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon" style="background: rgba(39, 174, 96, 0.1); color: #27AE60;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.ultimo }}</h3>
              <p>Último Respaldo</p>
            </div>
          </div>
          <div class="stat-box">
            <div class="stat-icon" style="background: rgba(52, 152, 219, 0.1); color: #3498DB;">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
            </div>
            <div class="stat-info">
              <h3>{{ estadisticas.tamanoTotal }}</h3>
              <p>Espacio Utilizado</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Alertas -->
      <transition name="fade">
        <div v-if="alerta.mostrar" :class="['alerta', alerta.tipo]">
          <svg v-if="alerta.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{{ alerta.mensaje }}</span>
          <button @click="cerrarAlerta" class="btn-close-alert">×</button>
        </div>
      </transition>

      <!-- Tabla de respaldos -->
      <div class="backups-table-container">
        <div class="table-header">
          <h2>Historial de Respaldos</h2>
          <div class="filtros-grupo">
            <select v-model="filtroTipo" class="filter-select">
              <option value="todos">Todos los tipos</option>
              <option value="database">Base de Datos</option>
              <option value="files">Archivos</option>
              <option value="full">Completo</option>
            </select>
            <button @click="cargarRespaldos" class="btn-refresh">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Actualizar
            </button>
          </div>
        </div>

        <div v-if="cargando" class="loading-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 12a9 9 0 1 1-6.219-8.56"/>
          </svg>
          <p>Cargando respaldos...</p>
        </div>

        <div v-else-if="respaldosFiltrados.length === 0" class="empty-state">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <h3>No hay respaldos disponibles</h3>
          <p>Crea tu primer respaldo del sistema</p>
        </div>

        <table v-else class="backups-tabla">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tipo</th>
              <th>Fecha de Creación</th>
              <th>Tamaño</th>
              <th>Estado</th>
              <th>Creado Por</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="backup in respaldosFiltrados" :key="backup.id" class="backup-row">
              <td>
                <span class="backup-id">#{{ backup.id }}</span>
              </td>
              <td>
                <span :class="['badge-tipo', backup.tipo]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path v-if="backup.tipo === 'database'" d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    <path v-else-if="backup.tipo === 'files'" d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
                    <polyline v-else points="22 12 18 12 15 21 9 3 6 12 2 12"/>
                  </svg>
                  {{ backup.tipoLabel }}
                </span>
              </td>
              <td>
                <div class="fecha-info">
                  <strong>{{ formatearFecha(backup.fecha) }}</strong>
                  <small>{{ formatearHora(backup.fecha) }}</small>
                </div>
              </td>
              <td>
                <span class="tamano-info">{{ backup.tamano }}</span>
              </td>
              <td>
                <span :class="['badge-estado', backup.estado]">{{ backup.estadoLabel }}</span>
              </td>
              <td>
                <div class="usuario-info">
                  <div class="usuario-avatar">{{ obtenerIniciales(backup.usuario) }}</div>
                  <span>{{ backup.usuario }}</span>
                </div>
              </td>
              <td>
                <div class="acciones-grupo">
                  <button @click="descargarRespaldo(backup.id)" class="btn-accion descargar" title="Descargar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="7 10 12 15 17 10"/>
                      <line x1="12" y1="15" x2="12" y2="3"/>
                    </svg>
                  </button>
                  <button @click="verDetalles(backup.id)" class="btn-accion ver" title="Ver detalles">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  </button>
                  <button @click="confirmarEliminar(backup.id)" class="btn-accion eliminar" title="Eliminar">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal de confirmación de eliminación -->
      <transition name="modal">
        <div v-if="modalEliminar.mostrar" class="modal-overlay" @click="cerrarModal">
          <div class="modal-content" @click.stop>
            <div class="modal-header">
              <h3>Confirmar Eliminación</h3>
              <button @click="cerrarModal" class="btn-close">×</button>
            </div>
            <div class="modal-body">
              <div class="warning-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
                  <line x1="12" y1="9" x2="12" y2="13"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <p>¿Estás seguro de que deseas eliminar este respaldo?</p>
              <p class="warning-text">Esta acción no se puede deshacer.</p>
            </div>
            <div class="modal-footer">
              <button @click="cerrarModal" class="btn-secondary">Cancelar</button>
              <button @click="eliminarRespaldo" class="btn-danger">Eliminar Respaldo</button>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

// Estado
const respaldos = ref([])
const cargando = ref(false)
const loading = ref(false)
const filtroTipo = ref('todos')
const alerta = ref({
  mostrar: false,
  tipo: 'success',
  mensaje: ''
})
const modalEliminar = ref({
  mostrar: false,
  backupId: null
})

// Estadísticas
const estadisticas = computed(() => {
  const total = respaldos.value.length
  const ultimo = total > 0 ? 'Hace 2 horas' : 'N/A'
  const tamano = total > 0 ? calcularTamanoTotal() : '0 MB'
  
  return {
    total,
    ultimo,
    tamanoTotal: tamano
  }
})

// Respaldos filtrados
const respaldosFiltrados = computed(() => {
  if (filtroTipo.value === 'todos') {
    return respaldos.value
  }
  return respaldos.value.filter(b => b.tipo === filtroTipo.value)
})

// Funciones
const cargarRespaldos = async () => {
  cargando.value = true
  try {
    // Aquí harías la llamada al backend
    // const response = await $fetch('/api/admin/backups')
    
    // Datos de ejemplo
    respaldos.value = [
      {
        id: 1,
        tipo: 'full',
        tipoLabel: 'Completo',
        fecha: new Date().toISOString(),
        tamano: '245 MB',
        estado: 'completado',
        estadoLabel: 'Completado',
        usuario: 'Admin Principal'
      },
      {
        id: 2,
        tipo: 'database',
        tipoLabel: 'Base de Datos',
        fecha: new Date(Date.now() - 86400000).toISOString(),
        tamano: '180 MB',
        estado: 'completado',
        estadoLabel: 'Completado',
        usuario: 'Admin Principal'
      },
      {
        id: 3,
        tipo: 'files',
        tipoLabel: 'Archivos',
        fecha: new Date(Date.now() - 172800000).toISOString(),
        tamano: '65 MB',
        estado: 'completado',
        estadoLabel: 'Completado',
        usuario: 'Admin Secundario'
      }
    ]
  } catch (error) {
    mostrarAlerta('error', 'Error al cargar los respaldos')
  } finally {
    cargando.value = false
  }
}

const crearRespaldo = async () => {
  loading.value = true
  try {
    // Aquí harías la llamada al backend
    // const response = await $fetch('/api/admin/backups', { method: 'POST' })
    
    await new Promise(resolve => setTimeout(resolve, 2000))
    
    mostrarAlerta('success', 'Respaldo creado exitosamente')
    await cargarRespaldos()
  } catch (error) {
    mostrarAlerta('error', 'Error al crear el respaldo')
  } finally {
    loading.value = false
  }
}

const descargarRespaldo = (id) => {
  mostrarAlerta('success', `Descargando respaldo #${id}...`)
  // Aquí implementarías la descarga real
}

const verDetalles = (id) => {
  mostrarAlerta('success', `Ver detalles del respaldo #${id}`)
  // Aquí mostrarías un modal con los detalles
}

const confirmarEliminar = (id) => {
  modalEliminar.value = {
    mostrar: true,
    backupId: id
  }
}

const eliminarRespaldo = async () => {
  try {
    const id = modalEliminar.value.backupId
    // Aquí harías la llamada al backend
    // await $fetch(`/api/admin/backups/${id}`, { method: 'DELETE' })
    
    respaldos.value = respaldos.value.filter(b => b.id !== id)
    mostrarAlerta('success', 'Respaldo eliminado exitosamente')
    cerrarModal()
  } catch (error) {
    mostrarAlerta('error', 'Error al eliminar el respaldo')
  }
}

const cerrarModal = () => {
  modalEliminar.value = {
    mostrar: false,
    backupId: null
  }
}

const mostrarAlerta = (tipo, mensaje) => {
  alerta.value = {
    mostrar: true,
    tipo,
    mensaje
  }
  setTimeout(() => {
    alerta.value.mostrar = false
  }, 5000)
}

const cerrarAlerta = () => {
  alerta.value.mostrar = false
}

// Utilidades
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-GT', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

const formatearHora = (fecha) => {
  return new Date(fecha).toLocaleTimeString('es-GT', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const obtenerIniciales = (nombre) => {
  return nombre
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

const calcularTamanoTotal = () => {
  const totalMB = respaldos.value.reduce((acc, b) => {
    const mb = parseFloat(b.tamano.replace(' MB', ''))
    return acc + mb
  }, 0)
  
  if (totalMB >= 1024) {
    return `${(totalMB / 1024).toFixed(2)} GB`
  }
  return `${totalMB.toFixed(0)} MB`
}

// Lifecycle
onMounted(() => {
  cargarRespaldos()
})
</script>

<style scoped>
/* Paleta de colores EXACTA del sistema */
.backups-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  padding: 2rem 0;
}

.backups-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Botón de regreso */
.navigation-header {
  margin-bottom: 2rem;
}

.btn-back {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: none;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #D4AF37;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
}

/* Header */
.backups-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem;
  border-bottom: 1px solid #e9ecef;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2C3E50;
}

.header-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.95rem;
}

/* Botón primario */
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
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.4);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary svg {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Estadísticas */
.stats-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  padding: 1.5rem 2rem;
  background: #f8f9fa;
}

.stat-box {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.stat-icon {
  padding: 0.75rem;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-info h3 {
  margin: 0 0 0.25rem 0;
  font-size: 1.5rem;
  font-weight: bold;
  color: #2C3E50;
}

.stat-info p {
  margin: 0;
  color: #6c757d;
  font-size: 0.85rem;
}

/* Alertas */
.alerta {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  margin-bottom: 1.5rem;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.alerta.success {
  border-left: 4px solid #27AE60;
  color: #27AE60;
}

.alerta.error {
  border-left: 4px solid #E74C3C;
  color: #E74C3C;
}

.btn-close-alert {
  margin-left: auto;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: inherit;
  opacity: 0.7;
  transition: opacity 0.3s;
}

.btn-close-alert:hover {
  opacity: 1;
}

/* Tabla de respaldos */
.backups-table-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 2rem;
  border-bottom: 1px solid #e9ecef;
}

.table-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #2C3E50;
}

.filtros-grupo {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.filter-select {
  padding: 0.5rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: white;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #D4AF37;
}

.btn-refresh {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
  border: 1px solid rgba(212, 175, 55, 0.3);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-refresh:hover {
  background: rgba(212, 175, 55, 0.2);
}

/* Estados de carga */
.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 2rem;
  color: #6c757d;
}

.loading-state svg {
  animation: spin 1s linear infinite;
  color: #D4AF37;
  margin-bottom: 1rem;
}

.empty-state svg {
  color: #D4AF37;
  margin-bottom: 1rem;
}

.empty-state h3 {
  margin: 1rem 0 0.5rem 0;
  color: #2C3E50;
}

/* Tabla */
.backups-tabla {
  width: 100%;
  border-collapse: collapse;
}

.backups-tabla thead th {
  background: #f8f9fa;
  padding: 1rem;
  text-align: left;
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  border-bottom: 2px solid #e9ecef;
}

.backups-tabla td {
  padding: 1rem;
  border-bottom: 1px solid #f1f3f4;
  vertical-align: middle;
}

.backup-row:hover {
  background: rgba(212, 175, 55, 0.05);
}

.backup-id {
  font-weight: 600;
  color: #D4AF37;
}

/* Badges */
.badge-tipo,
.badge-estado {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.35rem 0.75rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-tipo.database {
  background: rgba(212, 175, 55, 0.15);
  color: #D4AF37;
}

.badge-tipo.files {
  background: rgba(155, 89, 182, 0.15);
  color: #9B59B6;
}

.badge-tipo.full {
  background: rgba(52, 152, 219, 0.15);
  color: #3498DB;
}

.badge-estado.completado {
  background: rgba(39, 174, 96, 0.15);
  color: #27AE60;
}

.fecha-info strong {
  display: block;
  color: #2C3E50;
  font-weight: 600;
  font-size: 0.9rem;
}

.fecha-info small {
  color: #6c757d;
  font-size: 0.8rem;
}

.tamano-info {
  font-weight: 600;
  color: #2C3E50;
}

.usuario-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.usuario-avatar {
  width: 32px;
  height: 32px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.7rem;
}

/* Botones de acción */
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
  transition: all 0.3s ease;
}

.btn-accion.descargar {
  background: rgba(212, 175, 55, 0.1);
  color: #D4AF37;
}

.btn-accion.descargar:hover {
  background: #D4AF37;
  color: white;
  transform: scale(1.1);
}

.btn-accion.ver {
  background: rgba(39, 174, 96, 0.1);
  color: #27AE60;
}

.btn-accion.ver:hover {
  background: #27AE60;
  color: white;
  transform: scale(1.1);
}

.btn-accion.eliminar {
  background: rgba(231, 76, 60, 0.1);
  color: #E74C3C;
}

.btn-accion.eliminar:hover {
  background: #E74C3C;
  color: white;
  transform: scale(1.1);
}

/* Modal */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  border-radius: 12px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e9ecef;
}

.modal-header h3 {
  margin: 0;
  color: #2C3E50;
  font-size: 1.25rem;
}

.btn-close {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #6c757d;
  transition: color 0.3s;
}

.btn-close:hover {
  color: #2C3E50;
}

.modal-body {
  padding: 2rem;
  text-align: center;
}

.warning-icon {
  margin-bottom: 1rem;
}

.warning-icon svg {
  color: #E74C3C;
}

.modal-body p {
  margin: 0.5rem 0;
  color: #2C3E50;
}

.warning-text {
  color: #E74C3C !important;
  font-weight: 600;
}

.modal-footer {
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
  justify-content: flex-end;
}

.btn-secondary {
  padding: 0.75rem 1.5rem;
  border: 1px solid #e9ecef;
  background: white;
  color: #2C3E50;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-secondary:hover {
  background: #f8f9fa;
}

.btn-danger {
  padding: 0.75rem 1.5rem;
  border: none;
  background: #E74C3C;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-danger:hover {
  background: #C0392B;
}

/* Transiciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}

.modal-enter-active .modal-content,
.modal-leave-active .modal-content {
  transition: transform 0.3s ease;
}

.modal-enter-from .modal-content,
.modal-leave-to .modal-content {
  transform: scale(0.9);
}
</style>