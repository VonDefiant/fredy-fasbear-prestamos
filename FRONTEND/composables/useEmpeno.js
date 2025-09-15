// ===============================================
// Archivo: FRONTEND/composables/useEmpeno.js
// Composable para conectar con las APIs de empéño
// ===============================================

export const useEmpeno = () => {
  const { $fetch } = useNuxtApp()
  const { data: user } = useAuth()
  
  // Base URL de la API
  const API_BASE = '/api'
  
  // Estado reactivo
  const loading = ref(false)
  const error = ref(null)
  
  // Headers de autenticación
  const getAuthHeaders = () => {
    const token = useCookie('auth-token')
    return {
      'Authorization': `Bearer ${token.value}`,
      'Content-Type': 'application/json'
    }
  }

  // Headers para FormData (sin Content-Type para que el browser lo maneje)
  const getAuthHeadersFormData = () => {
    const token = useCookie('auth-token')
    return {
      'Authorization': `Bearer ${token.value}`
    }
  }

  // ===== PRÉSTAMOS =====

  // Obtener mis préstamos
  const obtenerMisPrestamos = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `${API_BASE}/prestamos${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await $fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo préstamos'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener detalle de préstamo
  const obtenerDetallePrestamo = async (prestamoId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/prestamos/${prestamoId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo detalle del préstamo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Procesar pago de préstamo
  const procesarPagoPrestamo = async (prestamoId, datosPago) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/prestamos/${prestamoId}/pagar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(datosPago)
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error procesando el pago'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Renovar préstamo
  const renovarPrestamo = async (prestamoId, datosRenovacion) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/prestamos/${prestamoId}/renovar`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(datosRenovacion)
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error renovando el préstamo'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener estadísticas de préstamos
  const obtenerEstadisticasPrestamos = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/prestamos/estadisticas`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo estadísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Calcular simulación de préstamo
  const calcularSimulacion = async (parametros) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      params.append('valorArticulo', parametros.valorArticulo)
      if (parametros.porcentajePrestamo) params.append('porcentajePrestamo', parametros.porcentajePrestamo)
      if (parametros.plazoMeses) params.append('plazoMeses', parametros.plazoMeses)
      
      const response = await $fetch(`${API_BASE}/prestamos/simulacion?${params.toString()}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error calculando simulación'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de préstamos
  const obtenerHistorialPrestamos = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      if (filtros.fechaInicio) params.append('fechaInicio', filtros.fechaInicio)
      if (filtros.fechaFin) params.append('fechaFin', filtros.fechaFin)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `${API_BASE}/prestamos/historial${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await $fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo historial'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== SOLICITUDES =====

  // Obtener categorías de artículos
  const obtenerCategorias = async () => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/solicitudes/categorias`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo categorías'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Crear nueva solicitud de empéño
  const crearSolicitudEmpeno = async (datosSolicitud, archivos) => {
    try {
      loading.value = true
      error.value = null
      
      // Crear FormData para enviar archivos
      const formData = new FormData()
      
      // Agregar datos de la solicitud
      Object.keys(datosSolicitud).forEach(key => {
        if (datosSolicitud[key] !== null && datosSolicitud[key] !== undefined) {
          if (typeof datosSolicitud[key] === 'object') {
            formData.append(key, JSON.stringify(datosSolicitud[key]))
          } else {
            formData.append(key, datosSolicitud[key])
          }
        }
      })
      
      // Agregar fotos
      if (archivos.fotos && archivos.fotos.length > 0) {
        archivos.fotos.forEach((foto) => {
          formData.append('fotos', foto)
        })
      }
      
      // Agregar documento técnico si existe
      if (archivos.documentoTecnico) {
        formData.append('documentoTecnico', archivos.documentoTecnico)
      }
      
      const response = await $fetch(`${API_BASE}/solicitudes`, {
        method: 'POST',
        headers: getAuthHeadersFormData(),
        body: formData
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error creando solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener mis solicitudes
  const obtenerMisSolicitudes = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const params = new URLSearchParams()
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `${API_BASE}/solicitudes${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await $fetch(url, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo solicitudes'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener detalle de solicitud
  const obtenerDetalleSolicitud = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/solicitudes/${solicitudId}`, {
        method: 'GET',
        headers: getAuthHeaders()
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error obteniendo detalle de solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Cancelar solicitud
  const cancelarSolicitud = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/solicitudes/${solicitudId}/cancelar`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ motivo })
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error cancelando solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Aceptar oferta de préstamo
  const aceptarOferta = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      const response = await $fetch(`${API_BASE}/solicitudes/${solicitudId}/aceptar-oferta`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ aceptaCondiciones: true })
      })
      
      return response
    } catch (err) {
      error.value = err.data?.message || 'Error aceptando oferta'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== UTILIDADES =====

  // Formatear moneda
  const formatearMoneda = (cantidad) => {
    return new Intl.NumberFormat('es-GT', {
      style: 'currency',
      currency: 'GTQ',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(cantidad || 0)
  }

  // Formatear fecha
  const formatearFecha = (fecha, formato = 'completo') => {
    const date = new Date(fecha)
    
    if (formato === 'corto') {
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }
    
    if (formato === 'completo') {
      return date.toLocaleDateString('es-GT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
    
    return date.toLocaleDateString('es-GT')
  }

  // Calcular días restantes
  const calcularDiasRestantes = (fechaVencimiento) => {
    const hoy = new Date()
    const vencimiento = new Date(fechaVencimiento)
    const diferencia = vencimiento.getTime() - hoy.getTime()
    return Math.ceil(diferencia / (1000 * 60 * 60 * 24))
  }

  // Obtener color de estado
  const obtenerColorEstado = (estado) => {
    const colores = {
      'activo': 'text-green-600',
      'vencido': 'text-red-600',
      'completado': 'text-blue-600',
      'renovado': 'text-yellow-600',
      'cancelado': 'text-gray-600',
      'pendiente': 'text-yellow-500',
      'en_evaluacion': 'text-blue-500',
      'aprobada': 'text-green-500',
      'rechazada': 'text-red-500',
      'expirada': 'text-gray-500'
    }
    return colores[estado] || 'text-gray-600'
  }

  // Validar archivo antes de subir
  const validarArchivo = (archivo, tipo = 'imagen') => {
    const errores = []
    
    if (tipo === 'imagen') {
      // Validar tipo MIME
      const tiposPermitidos = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
      if (!tiposPermitidos.includes(archivo.type)) {
        errores.push('Tipo de archivo no permitido. Use JPG, PNG o WebP')
      }
      
      // Validar tamaño (5MB máximo)
      if (archivo.size > 5 * 1024 * 1024) {
        errores.push('El archivo es muy grande. Máximo 5MB')
      }
    }
    
    if (tipo === 'documento') {
      // Validar tipo MIME
      const tiposPermitidos = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
      ]
      if (!tiposPermitidos.includes(archivo.type)) {
        errores.push('Tipo de archivo no permitido. Use PDF o Word')
      }
      
      // Validar tamaño (10MB máximo)
      if (archivo.size > 10 * 1024 * 1024) {
        errores.push('El archivo es muy grande. Máximo 10MB')
      }
    }
    
    return {
      esValido: errores.length === 0,
      errores
    }
  }

  // Manejar errores de manera reactiva
  const manejarError = (err) => {
    console.error('Error en useEmpeno:', err)
    
    // Mostrar notificación de error si tienes un sistema de notificaciones
    if (process.client) {
      // Aquí puedes integrar con tu sistema de notificaciones
      // Por ejemplo, con un toast o modal
    }
    
    error.value = err.data?.message || err.message || 'Error desconocido'
  }

  // Limpiar errores
  const limpiarError = () => {
    error.value = null
  }

  return {
    // Estado
    loading: readonly(loading),
    error: readonly(error),
    
    // Métodos de préstamos
    obtenerMisPrestamos,
    obtenerDetallePrestamo,
    procesarPagoPrestamo,
    renovarPrestamo,
    obtenerEstadisticasPrestamos,
    calcularSimulacion,
    obtenerHistorialPrestamos,
    
    // Métodos de solicitudes
    obtenerCategorias,
    crearSolicitudEmpeno,
    obtenerMisSolicitudes,
    obtenerDetalleSolicitud,
    cancelarSolicitud,
    aceptarOferta,
    
    // Utilidades
    formatearMoneda,
    formatearFecha,
    calcularDiasRestantes,
    obtenerColorEstado,
    validarArchivo,
    manejarError,
    limpiarError
  }
}