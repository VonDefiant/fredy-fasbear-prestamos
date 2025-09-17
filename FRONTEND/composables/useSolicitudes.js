// ===============================================
// Archivo: FRONTEND/composables/useSolicitudes.js
// Composable para gestionar solicitudes de empéño
// ===============================================

export const useSolicitudes = () => {
  const { api } = useApi()
  
  // Estado reactivo
  const loading = ref(false)
  const error = ref(null)
  
  /**
   * Obtener mis solicitudes de empéño
   * @param {Object} filtros - Filtros de búsqueda
   * @param {String} filtros.estado - Filtrar por estado (Pendiente, Aprobada, Rechazada)
   * @param {Number} filtros.limite - Número máximo de resultados
   * @param {Number} filtros.pagina - Página actual
   * @returns {Promise<Object>} Lista de solicitudes
   */
  const obtenerMisSolicitudes = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📝 Obteniendo mis solicitudes:', filtros)
      
      const params = new URLSearchParams()
      if (filtros.estado) params.append('estado', filtros.estado)
      if (filtros.limite) params.append('limite', filtros.limite)
      if (filtros.pagina) params.append('pagina', filtros.pagina)
      
      const url = `/solicitudes${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log('✅ Solicitudes obtenidas:', response)
      return response
    } catch (err) {
      console.error('❌ Error obteniendo solicitudes:', err)
      error.value = err.message || 'Error obteniendo solicitudes'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener categorías/tipos de artículos disponibles
   * @returns {Promise<Object>} Lista de categorías de artículos
   */
  const obtenerCategoriasArticulos = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📦 Obteniendo categorías de artículos...')
      
      const response = await api('/solicitudes/categorias', {
        method: 'GET'
      })
      
      console.log('✅ Categorías obtenidas:', response)
      return response
    } catch (err) {
      console.error('❌ Error obteniendo categorías:', err)
      error.value = err.message || 'Error obteniendo categorías'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear nueva solicitud de empéño
   * @param {Object} datosSolicitud - Datos de la solicitud
   * @returns {Promise<Object>} Solicitud creada
   */
  const crearSolicitudEmpeno = async (datosSolicitud) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📤 Creando solicitud de empéño:', datosSolicitud)
      
      // Preparar FormData para envío de archivos
      const formData = new FormData()
      
      // Agregar datos básicos
      for (const [key, value] of Object.entries(datosSolicitud)) {
        if (key === 'fotos' || key === 'documentoTecnico') {
          continue // Los archivos se manejan por separado
        }
        
        if (typeof value === 'object' && value !== null) {
          formData.append(key, JSON.stringify(value))
        } else {
          formData.append(key, value)
        }
      }
      
      // Agregar fotos
      if (datosSolicitud.fotos && Array.isArray(datosSolicitud.fotos)) {
        datosSolicitud.fotos.forEach((foto, index) => {
          formData.append(`fotos`, foto)
        })
      }
      
      // Agregar documento técnico
      if (datosSolicitud.documentoTecnico) {
        formData.append('documentoTecnico', datosSolicitud.documentoTecnico)
      }
      
      const response = await api('/solicitudes', {
        method: 'POST',
        body: formData,
        headers: {
          // No incluir Content-Type, el browser lo manejará automáticamente para FormData
          'Authorization': `Bearer ${useAuth().getToken()}`
        }
      })
      
      console.log('✅ Solicitud creada:', response)
      return response
    } catch (err) {
      console.error('❌ Error creando solicitud:', err)
      error.value = err.message || 'Error creando solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalle de una solicitud específica
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Promise<Object>} Detalle de la solicitud
   */
  const obtenerDetalleSolicitud = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔍 Obteniendo detalle de solicitud:', solicitudId)
      
      const response = await api(`/solicitudes/${solicitudId}`, {
        method: 'GET'
      })
      
      console.log('✅ Detalle de solicitud obtenido:', response)
      return response
    } catch (err) {
      console.error('❌ Error obteniendo detalle de solicitud:', err)
      error.value = err.message || 'Error obteniendo detalle de solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar una solicitud pendiente
   * @param {Number} solicitudId - ID de la solicitud
   * @param {String} motivo - Motivo de cancelación (opcional)
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  const cancelarSolicitud = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null
      
      console.log('❌ Cancelando solicitud:', solicitudId, motivo)
      
      const response = await api(`/solicitudes/${solicitudId}/cancelar`, {
        method: 'PUT',
        body: { motivo }
      })
      
      console.log('✅ Solicitud cancelada:', response)
      return response
    } catch (err) {
      console.error('❌ Error cancelando solicitud:', err)
      error.value = err.message || 'Error cancelando solicitud'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Aceptar oferta de una solicitud aprobada
   * @param {Number} solicitudId - ID de la solicitud
   * @param {Object} datosAceptacion - Datos de aceptación
   * @returns {Promise<Object>} Resultado de la aceptación
   */
  const aceptarOferta = async (solicitudId, datosAceptacion = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('✅ Aceptando oferta de solicitud:', solicitudId, datosAceptacion)
      
      const response = await api(`/solicitudes/${solicitudId}/aceptar-oferta`, {
        method: 'POST',
        body: datosAceptacion
      })
      
      console.log('✅ Oferta aceptada:', response)
      return response
    } catch (err) {
      console.error('❌ Error aceptando oferta:', err)
      error.value = err.message || 'Error aceptando oferta'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Formatear estado de solicitud
   * @param {String} estado - Estado de la solicitud
   * @returns {String} Estado formateado
   */
  const formatearEstado = (estado) => {
    const estados = {
      'Pendiente': 'Pendiente de evaluación',
      'Evaluando': 'En proceso de evaluación',
      'Aprobada': 'Aprobada - Pendiente de firma',
      'Rechazada': 'Rechazada',
      'Completada': 'Completada'
    }
    return estados[estado] || estado
  }

  /**
   * Obtener color del estado
   * @param {String} estado - Estado de la solicitud
   * @returns {String} Clase CSS para el color
   */
  const getColorEstado = (estado) => {
    const colores = {
      'Pendiente': 'warning',
      'Evaluando': 'info',
      'Aprobada': 'success',
      'Rechazada': 'error',
      'Completada': 'success'
    }
    return colores[estado] || 'default'
  }

  /**
   * Validar si una solicitud se puede cancelar
   * @param {Object} solicitud - Objeto de solicitud
   * @returns {Boolean} True si se puede cancelar
   */
  const puedeCanselar = (solicitud) => {
    return solicitud && ['Pendiente', 'Evaluando'].includes(solicitud.estado)
  }

  /**
   * Validar si una solicitud se puede aceptar
   * @param {Object} solicitud - Objeto de solicitud
   * @returns {Boolean} True si se puede aceptar la oferta
   */
  const puedeAceptarOferta = (solicitud) => {
    return solicitud && solicitud.estado === 'Aprobada'
  }

  return {
    // Estado
    loading: readonly(loading),
    error: readonly(error),
    
    // Métodos principales
    obtenerMisSolicitudes,
    obtenerCategoriasArticulos,
    crearSolicitudEmpeno,
    obtenerDetalleSolicitud,
    cancelarSolicitud,
    aceptarOferta,
    
    // Utilidades
    formatearEstado,
    getColorEstado,
    puedeCanselar,
    puedeAceptarOferta
  }
}