import { ref } from 'vue'

export const useAuditLogs = () => {
  // ===== ESTADO REACTIVO =====
  const loading = ref(false)
  const error = ref(null)

  // ===== COMPOSABLES INTERNOS =====
  const { api } = useApi()

  /**
   * Obtener logs de auditoría con filtros opcionales
   * @param {Object} filtros - Filtros de búsqueda
   * @param {Number} filtros.page - Página actual
   * @param {Number} filtros.limit - Registros por página
   * @param {String} filtros.search - Búsqueda por texto
   * @param {String} filtros.accion - Filtrar por acción
   * @param {String} filtros.entidad - Filtrar por entidad
   * @param {Number} filtros.usuarioId - Filtrar por usuario
   * @param {String} filtros.fechaDesde - Fecha desde
   * @param {String} filtros.fechaHasta - Fecha hasta
   * @returns {Promise<Object>} Lista de logs con total
   */
  const getLogs = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📋 Obteniendo logs de auditoría:', filtros)
      
      const params = new URLSearchParams()
      
      if (filtros.page) params.append('page', filtros.page)
      if (filtros.limit) params.append('limit', filtros.limit)
      if (filtros.search) params.append('search', filtros.search)
      if (filtros.accion) params.append('accion', filtros.accion)
      if (filtros.entidad) params.append('entidad', filtros.entidad)
      if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId)
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
      
      const url = `/audit-logs${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log('✅ Logs obtenidos:', response)
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo logs:', err)
      error.value = err.message || 'Error al obtener los logs de auditoría'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener detalles de un log específico
   * @param {Number} logId - ID del log
   * @returns {Promise<Object>} Detalles del log
   */
  const getLogDetails = async (logId) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📋 Obteniendo detalles del log:', logId)
      
      const response = await api(`/audit-logs/${logId}`, {
        method: 'GET'
      })
      
      console.log('✅ Detalles obtenidos:', response)
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo detalles del log:', err)
      error.value = err.message || 'Error al obtener detalles del log'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener estadísticas de los logs
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>} Estadísticas de logs
   */
  const getLogStats = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📊 Obteniendo estadísticas de logs:', filtros)
      
      const params = new URLSearchParams()
      
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
      
      const url = `/audit-logs/stats${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log('✅ Estadísticas obtenidas:', response)
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas:', err)
      error.value = err.message || 'Error al obtener estadísticas'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Exportar logs a CSV
   * @param {Object} filtros - Filtros para exportación
   * @returns {Promise<void>}
   */
  const exportLogsToCSV = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('💾 Exportando logs a CSV:', filtros)
      
      const params = new URLSearchParams()
      
      if (filtros.search) params.append('search', filtros.search)
      if (filtros.accion) params.append('accion', filtros.accion)
      if (filtros.entidad) params.append('entidad', filtros.entidad)
      if (filtros.usuarioId) params.append('usuarioId', filtros.usuarioId)
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
      
      const url = `/audit-logs/export${params.toString() ? '?' + params.toString() : ''}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      if (response.success && response.data) {
        // Crear un blob con el contenido CSV
        const blob = new Blob([response.data.csvContent], { type: 'text/csv' })
        const downloadUrl = window.URL.createObjectURL(blob)
        
        // Crear un link temporal para descargar el archivo
        const link = document.createElement('a')
        link.href = downloadUrl
        link.download = response.data.fileName || 'audit-logs.csv'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        // Liberar el objeto URL
        window.URL.revokeObjectURL(downloadUrl)
        
        console.log('✅ Logs exportados exitosamente')
      } else {
        throw new Error('Error al generar el archivo CSV')
      }
      
    } catch (err) {
      console.error('❌ Error exportando logs:', err)
      error.value = err.message || 'Error al exportar los logs'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener logs por usuario
   * @param {Number} usuarioId - ID del usuario
   * @param {Object} options - Opciones adicionales
   * @returns {Promise<Object>} Logs del usuario
   */
  const getLogsByUser = async (usuarioId, options = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('👤 Obteniendo logs del usuario:', usuarioId)
      
      const params = new URLSearchParams()
      params.append('usuarioId', usuarioId)
      
      if (options.limit) params.append('limit', options.limit)
      if (options.fechaDesde) params.append('fechaDesde', options.fechaDesde)
      if (options.fechaHasta) params.append('fechaHasta', options.fechaHasta)
      
      const url = `/audit-logs?${params.toString()}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log('✅ Logs del usuario obtenidos:', response)
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo logs del usuario:', err)
      error.value = err.message || 'Error al obtener logs del usuario'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener logs de seguridad
   * @param {Object} filtros - Filtros de búsqueda
   * @returns {Promise<Object>} Logs de seguridad
   */
  const getSecurityLogs = async (filtros = {}) => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔒 Obteniendo logs de seguridad:', filtros)
      
      const params = new URLSearchParams()
      params.append('entidad', 'security')
      
      if (filtros.page) params.append('page', filtros.page)
      if (filtros.limit) params.append('limit', filtros.limit)
      if (filtros.fechaDesde) params.append('fechaDesde', filtros.fechaDesde)
      if (filtros.fechaHasta) params.append('fechaHasta', filtros.fechaHasta)
      
      const url = `/audit-logs?${params.toString()}`
      
      const response = await api(url, {
        method: 'GET'
      })
      
      console.log('✅ Logs de seguridad obtenidos:', response)
      return response
      
    } catch (err) {
      console.error('❌ Error obteniendo logs de seguridad:', err)
      error.value = err.message || 'Error al obtener logs de seguridad'
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Limpiar error
   */
  const clearError = () => {
    error.value = null
  }

  return {
    // Estado
    loading,
    error,
    
    // Métodos principales
    getLogs,
    getLogDetails,
    getLogStats,
    exportLogsToCSV,
    
    // Métodos específicos
    getLogsByUser,
    getSecurityLogs,
    
    // Utilidades
    clearError
  }
}