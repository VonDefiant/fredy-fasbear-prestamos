// ===============================================
// Archivo: FRONTEND/composables/useSolicitudes.js
// Composable para manejo de solicitudes de empéño - ACTUALIZADO
// ===============================================

import { ref } from 'vue'

export const useSolicitudes = () => {
  // ===== ESTADO REACTIVO =====
  const loading = ref(false)
  const error = ref(null)

  // ===== COMPOSABLES INTERNOS =====
  const { api } = useApi()

  /**
   * Obtener solicitudes de empéño con filtros opcionales
   * @param {Object} filtros - Filtros de búsqueda
   * @param {String} filtros.estado - Filtrar por estado (Pendiente, Aprobada, Rechazada)
   * @param {Number} filtros.limite - Número máximo de resultados
   * @param {Number} filtros.pagina - Página actual
   * @returns {Promise<Object>} Lista de solicitudes
   */
  const obtenerSolicitudes = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📝 Obteniendo solicitudes:', filtros)
      
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
   * NUEVA: Obtener archivos adjuntos de una solicitud específica
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Promise<Object>} Archivos adjuntos agrupados por tipo
   */
  const obtenerArchivosAdjuntos = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📎 Obteniendo archivos adjuntos de solicitud:', solicitudId)
      
      if (!solicitudId || isNaN(solicitudId)) {
        throw new Error('ID de solicitud inválido')
      }
      
      const response = await api(`/solicitudes/${solicitudId}/archivos`, {
        method: 'GET'
      })
      
      console.log('✅ Archivos adjuntos obtenidos:', response)
      return response
    } catch (err) {
      console.error('❌ Error obteniendo archivos adjuntos:', err)
      error.value = err.message || 'Error obteniendo archivos adjuntos'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * NUEVA: Descargar un archivo adjunto específico
   * @param {Number} solicitudId - ID de la solicitud
   * @param {Number} archivoId - ID del archivo
   * @returns {Promise<Blob>} Archivo descargado
   */
  const descargarArchivo = async (solicitudId, archivoId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('⬇️ Descargando archivo:', { solicitudId, archivoId })
      
      const response = await api(`/solicitudes/${solicitudId}/archivo/${archivoId}`, {
        method: 'GET',
        responseType: 'blob' // Importante para archivos
      })
      
      console.log('✅ Archivo descargado exitosamente')
      return response
    } catch (err) {
      console.error('❌ Error descargando archivo:', err)
      error.value = err.message || 'Error descargando archivo'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Cancelar una solicitud de empéño
   * @param {Number} solicitudId - ID de la solicitud
   * @param {String} motivo - Motivo de cancelación
   * @returns {Promise<Object>} Resultado de la cancelación
   */
  const cancelarSolicitud = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null
      
      console.log('❌ Cancelando solicitud:', { solicitudId, motivo })
      
      const response = await api(`/solicitudes/${solicitudId}/cancelar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivo: motivo || 'Cancelada por el usuario'
        })
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
   * @param {Object} datosAceptacion - Datos adicionales para la aceptación
   * @returns {Promise<Object>} Resultado de la aceptación
   */
  const aceptarOferta = async (solicitudId, datosAceptacion = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('✅ Aceptando oferta:', { solicitudId, datosAceptacion })
      
      const response = await api(`/solicitudes/${solicitudId}/aceptar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(datosAceptacion)
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
   * Rechazar oferta de una solicitud aprobada
   * @param {Number} solicitudId - ID de la solicitud
   * @param {String} motivo - Motivo del rechazo
   * @returns {Promise<Object>} Resultado del rechazo
   */
  const rechazarOferta = async (solicitudId, motivo = '') => {
    try {
      loading.value = true
      error.value = null
      
      console.log('❌ Rechazando oferta:', { solicitudId, motivo })
      
      const response = await api(`/solicitudes/${solicitudId}/rechazar`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          motivo: motivo || 'Oferta rechazada por el usuario'
        })
      })
      
      console.log('✅ Oferta rechazada:', response)
      return response
    } catch (err) {
      console.error('❌ Error rechazando oferta:', err)
      error.value = err.message || 'Error rechazando oferta'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de solicitudes del usuario
   * @returns {Promise<Object>} Estadísticas de solicitudes
   */
  const obtenerEstadisticasSolicitudes = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📊 Obteniendo estadísticas de solicitudes...')
      
      const response = await api('/solicitudes/estadisticas', {
        method: 'GET'
      })
      
      console.log('✅ Estadísticas obtenidas:', response)
      return response
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas:', err)
      error.value = err.message || 'Error obteniendo estadísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener historial de estados de una solicitud
   * @param {Number} solicitudId - ID de la solicitud
   * @returns {Promise<Object>} Historial de estados
   */
  const obtenerHistorialEstados = async (solicitudId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📋 Obteniendo historial de estados:', solicitudId)
      
      const response = await api(`/solicitudes/${solicitudId}/historial`, {
        method: 'GET'
      })
      
      console.log('✅ Historial obtenido:', response)
      return response
    } catch (err) {
      console.error('❌ Error obteniendo historial:', err)
      error.value = err.message || 'Error obteniendo historial'
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== FUNCIONES UTILITARIAS =====

  /**
   * Validar datos de solicitud antes del envío
   * @param {Object} datos - Datos de la solicitud
   * @returns {Object} { esValido: boolean, errores: string[] }
   */
  const validarDatosSolicitud = (datos) => {
    const errores = []

    // Validaciones básicas
    if (!datos.tipoArticulo) {
      errores.push('Debe seleccionar un tipo de artículo')
    }

    if (!datos.descripcion || datos.descripcion.length < 10) {
      errores.push('La descripción debe tener al menos 10 caracteres')
    }

    if (!datos.estadoFisico) {
      errores.push('Debe especificar el estado físico del artículo')
    }

    if (!datos.valorEstimado || datos.valorEstimado <= 0) {
      errores.push('Debe especificar un valor estimado válido')
    }

    if (!datos.montoSolicitado || datos.montoSolicitado <= 0) {
      errores.push('Debe especificar un monto solicitado válido')
    }

    if (!datos.plazoMeses || datos.plazoMeses < 1 || datos.plazoMeses > 24) {
      errores.push('El plazo debe estar entre 1 y 24 meses')
    }

    if (!datos.modalidadPago) {
      errores.push('Debe seleccionar una modalidad de pago')
    }

    if (!datos.fotos || datos.fotos.length === 0) {
      errores.push('Debe subir al menos una foto del artículo')
    }

    if (!datos.aceptaTerminos) {
      errores.push('Debe aceptar los términos y condiciones')
    }

    return {
      esValido: errores.length === 0,
      errores
    }
  }

  /**
   * Formatear estado de solicitud para mostrar al usuario
   * @param {String} estado - Estado de la solicitud
   * @returns {String} Estado formateado
   */
  const formatearEstado = (estado) => {
    const estados = {
      'Pendiente': 'Pendiente de Revisión',
      'En_Revision': 'En Revisión',
      'Evaluando': 'En Evaluación',
      'Aprobada': 'Aprobada',
      'Rechazada': 'Rechazada',
      'Completada': 'Completada',
      'Cancelada': 'Cancelada'
    }
    return estados[estado] || estado
  }

  /**
   * Obtener color del estado para UI
   * @param {String} estado - Estado de la solicitud
   * @returns {String} Clase CSS o color
   */
  const obtenerColorEstado = (estado) => {
    const colores = {
      'Pendiente': 'warning',
      'En_Revision': 'info',
      'Evaluando': 'info',
      'Aprobada': 'success',
      'Rechazada': 'danger',
      'Completada': 'success',
      'Cancelada': 'secondary'
    }
    return colores[estado] || 'secondary'
  }

  // ===== RETURN DEL COMPOSABLE =====
  return {
    // Estados reactivos
    loading,
    error,

    // Funciones principales
    obtenerSolicitudes,
    obtenerCategoriasArticulos,
    crearSolicitudEmpeno,
    obtenerDetalleSolicitud,
    cancelarSolicitud,
    aceptarOferta,
    rechazarOferta,

    // NUEVAS: Funciones para archivos adjuntos
    obtenerArchivosAdjuntos,
    descargarArchivo,

    // Funciones adicionales
    obtenerEstadisticasSolicitudes,
    obtenerHistorialEstados,

    // Funciones utilitarias
    validarDatosSolicitud,
    formatearEstado,
    obtenerColorEstado
  }
}