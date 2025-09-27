import { ref } from 'vue'

export const useAdminDashboard = () => {
  // ===== ESTADO REACTIVO =====
  const loading = ref(false)
  const error = ref(null)

  // ===== COMPOSABLES INTERNOS =====
  const { api } = useApi()

  // ===== FUNCIONES PARA ESTADÍSTICAS Y DASHBOARD =====

  /**
   * Obtener estadísticas del dashboard de administración
   * @returns {Promise<Object>} Estadísticas del sistema
   */
  const getAdminStats = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📊 Obteniendo estadísticas de admin...')
      
      const response = await api('/admin/stats')
      
      if (response.success) {
        console.log('✅ Estadísticas obtenidas:', response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas')
      }
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Obtener actividad reciente del sistema
   * @param {Number} limit - Número máximo de registros a obtener
   * @returns {Promise<Object>} Actividad reciente
   */
  const getRecentActivity = async (limit = 10) => {
    try {
      console.log('🔄 Obteniendo actividad reciente...')
      
      const response = await api(`/admin/recent-activity?limit=${limit}`)
      
      if (response.success) {
        console.log('✅ Actividad reciente obtenida:', response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Error obteniendo actividad reciente')
      }
    } catch (err) {
      console.error('❌ Error obteniendo actividad reciente:', err)
      
      // Fallback: respuesta vacía
      return {
        recentSessions: [],
        recentRequests: [],
        recentPayments: []
      }
    }
  }

  // ===== FUNCIONES PARA PARÁMETROS DEL SISTEMA =====

  /**
   * Obtener parámetros del sistema
   * @returns {Promise<Array>} Lista de parámetros del sistema
   */
  const getSystemParameters = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('⚙️ Obteniendo parámetros del sistema...')
      
      const response = await api('/admin/system-parameters')
      
      if (response.success) {
        console.log('✅ Parámetros obtenidos:', response.data.parameters.length, 'parámetros')
        return response.data.parameters
      } else {
        throw new Error(response.message || 'Error obteniendo parámetros')
      }
    } catch (err) {
      console.error('❌ Error obteniendo parámetros:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar un parámetro del sistema
   * @param {Number} id - ID del parámetro
   * @param {String} valorParametro - Nuevo valor
   * @param {String} descripcion - Nueva descripción (opcional)
   * @returns {Promise<Object>} Parámetro actualizado
   */
  const updateSystemParameter = async (id, valorParametro, descripcion = null) => {
    try {
      console.log(`⚙️ Actualizando parámetro ${id}:`, { valorParametro, descripcion })
      
      const payload = { valorParametro }
      if (descripcion !== null && descripcion !== undefined) {
        payload.descripcion = descripcion
      }
      
      const response = await api(`/admin/system-parameters/${id}`, {
        method: 'PUT',
        body: payload
      })
      
      if (response.success) {
        console.log('✅ Parámetro actualizado:', response.data.parameter)
        return response.data.parameter
      } else {
        throw new Error(response.message || 'Error actualizando parámetro')
      }
    } catch (err) {
      console.error('❌ Error actualizando parámetro:', err)
      throw err
    }
  }

  /**
   * Crear un nuevo parámetro del sistema
   * @param {Object} parametroData - Datos del parámetro
   * @param {String} parametroData.nombreParametro - Nombre del parámetro
   * @param {String} parametroData.valorParametro - Valor del parámetro
   * @param {String} parametroData.tipoDato - Tipo de dato (STRING, INTEGER, DECIMAL, BOOLEAN, DATE)
   * @param {String} parametroData.descripcion - Descripción (opcional)
   * @returns {Promise<Object>} Parámetro creado
   */
  const createSystemParameter = async (parametroData) => {
    try {
      console.log('⚙️ Creando nuevo parámetro:', parametroData)
      
      const response = await api('/admin/system-parameters', {
        method: 'POST',
        body: parametroData
      })
      
      if (response.success) {
        console.log('✅ Parámetro creado:', response.data.parameter)
        return response.data.parameter
      } else {
        throw new Error(response.message || 'Error creando parámetro')
      }
    } catch (err) {
      console.error('❌ Error creando parámetro:', err)
      throw err
    }
  }

  /**
   * Eliminar un parámetro del sistema
   * @param {Number} id - ID del parámetro
   * @returns {Promise<Boolean>} Éxito de la operación
   */
  const deleteSystemParameter = async (id) => {
    try {
      console.log(`⚙️ Eliminando parámetro ${id}...`)
      
      const response = await api(`/admin/system-parameters/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        console.log('✅ Parámetro eliminado')
        return true
      } else {
        throw new Error(response.message || 'Error eliminando parámetro')
      }
    } catch (err) {
      console.error('❌ Error eliminando parámetro:', err)
      throw err
    }
  }

  // ===== FUNCIONES PARA TIPOS DE ARTÍCULOS =====

  /**
   * Obtener todos los tipos de artículos
   * @returns {Promise<Array>} Lista de tipos de artículos
   */
  const getArticleTypes = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('📦 Obteniendo tipos de artículos...')
      
      const response = await api('/admin/article-types')
      
      if (response.success) {
        console.log('✅ Tipos de artículos obtenidos:', response.data.articleTypes.length, 'tipos')
        return response.data.articleTypes
      } else {
        throw new Error(response.message || 'Error obteniendo tipos de artículos')
      }
    } catch (err) {
      console.error('❌ Error obteniendo tipos de artículos:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Crear un nuevo tipo de artículo
   * @param {Object} articleTypeData - Datos del tipo de artículo
   * @param {String} articleTypeData.nombre - Nombre del tipo
   * @param {Number} articleTypeData.porcentajeMinAvaluo - Porcentaje mínimo de avalúo
   * @param {Number} articleTypeData.porcentajeMaxAvaluo - Porcentaje máximo de avalúo
   * @param {Boolean} articleTypeData.requiereElectronico - Si requiere información electrónica
   * @returns {Promise<Object>} Tipo de artículo creado
   */
  const createArticleType = async (articleTypeData) => {
    try {
      console.log('📦 Creando nuevo tipo de artículo:', articleTypeData)
      
      const response = await api('/admin/article-types', {
        method: 'POST',
        body: articleTypeData
      })
      
      if (response.success) {
        console.log('✅ Tipo de artículo creado:', response.data.articleType)
        return response.data.articleType
      } else {
        throw new Error(response.message || 'Error creando tipo de artículo')
      }
    } catch (err) {
      console.error('❌ Error creando tipo de artículo:', err)
      throw err
    }
  }

  /**
   * Actualizar un tipo de artículo existente
   * @param {Number} id - ID del tipo de artículo
   * @param {Object} articleTypeData - Datos actualizados del tipo
   * @returns {Promise<Object>} Tipo de artículo actualizado
   */
  const updateArticleType = async (id, articleTypeData) => {
    try {
      console.log(`📦 Actualizando tipo de artículo ${id}:`, articleTypeData)
      
      const response = await api(`/admin/article-types/${id}`, {
        method: 'PUT',
        body: articleTypeData
      })
      
      if (response.success) {
        console.log('✅ Tipo de artículo actualizado:', response.data.articleType)
        return response.data.articleType
      } else {
        throw new Error(response.message || 'Error actualizando tipo de artículo')
      }
    } catch (err) {
      console.error('❌ Error actualizando tipo de artículo:', err)
      throw err
    }
  }

  /**
   * Cambiar el estado (Activo/Inactivo) de un tipo de artículo
   * @param {Number} id - ID del tipo de artículo
   * @returns {Promise<Object>} Tipo de artículo con estado actualizado
   */
  const toggleArticleTypeStatus = async (id) => {
    try {
      console.log(`📦 Cambiando estado del tipo de artículo ${id}...`)
      
      const response = await api(`/admin/article-types/${id}/toggle-status`, {
        method: 'PUT'
      })
      
      if (response.success) {
        console.log('✅ Estado del tipo de artículo cambiado:', response.data.articleType)
        return response.data.articleType
      } else {
        throw new Error(response.message || 'Error cambiando estado del tipo')
      }
    } catch (err) {
      console.error('❌ Error cambiando estado del tipo de artículo:', err)
      throw err
    }
  }

  /**
   * Eliminar un tipo de artículo
   * @param {Number} id - ID del tipo de artículo
   * @returns {Promise<Boolean>} Éxito de la operación
   */
  const deleteArticleType = async (id) => {
    try {
      console.log(`📦 Eliminando tipo de artículo ${id}...`)
      
      const response = await api(`/admin/article-types/${id}`, {
        method: 'DELETE'
      })
      
      if (response.success) {
        console.log('✅ Tipo de artículo eliminado')
        return true
      } else {
        throw new Error(response.message || 'Error eliminando tipo de artículo')
      }
    } catch (err) {
      console.error('❌ Error eliminando tipo de artículo:', err)
      throw err
    }
  }

  /**
   * Obtener artículos asociados a un tipo específico
   * @param {Number} id - ID del tipo de artículo
   * @param {Object} options - Opciones de paginación
   * @param {Number} options.page - Página actual (default: 1)
   * @param {Number} options.limit - Elementos por página (default: 10)
   * @returns {Promise<Object>} Artículos y información de paginación
   */
  const getArticlesByType = async (id, options = {}) => {
    try {
      const { page = 1, limit = 10 } = options
      console.log(`📦 Obteniendo artículos del tipo ${id}...`)
      
      const response = await api(`/admin/article-types/${id}/articles?page=${page}&limit=${limit}`)
      
      if (response.success) {
        console.log('✅ Artículos obtenidos:', response.data.articles.length, 'artículos')
        return response.data
      } else {
        throw new Error(response.message || 'Error obteniendo artículos del tipo')
      }
    } catch (err) {
      console.error('❌ Error obteniendo artículos del tipo:', err)
      throw err
    }
  }

  // ===== FUNCIONES DEL SISTEMA =====

  /**
   * Crear respaldo de la base de datos
   * @returns {Promise<Object>} Información del respaldo
   */
  const createDatabaseBackup = async () => {
    try {
      console.log('💾 Creando respaldo de la base de datos...')
      
      const response = await api('/admin/backup-database', {
        method: 'POST'
      })
      
      if (response.success) {
        console.log('✅ Respaldo creado:', response.data.backup)
        return response.data.backup
      } else {
        throw new Error(response.message || 'Error creando respaldo')
      }
    } catch (err) {
      console.error('❌ Error creando respaldo:', err)
      throw err
    }
  }

  /**
   * Verificar estado del sistema
   * @returns {Promise<Object>} Estado del sistema
   */
  const getSystemHealth = async () => {
    try {
      console.log('🏥 Verificando estado del sistema...')
      
      const response = await api('/admin/system-health')
      
      if (response.success) {
        console.log('✅ Estado del sistema obtenido:', response.data.health)
        return response.data.health
      } else {
        console.warn('⚠️ Sistema en estado degradado:', response.data?.health)
        return response.data?.health || { systemStatus: 'unknown' }
      }
    } catch (err) {
      console.error('❌ Error verificando estado del sistema:', err)
      return { 
        systemStatus: 'error', 
        database: 'error',
        timestamp: new Date().toISOString() 
      }
    }
  }

  // ===== FUNCIONES DE UTILIDAD GENERALES =====

  /**
   * Formatear números con separadores de miles
   * @param {Number} number - Número a formatear
   * @returns {String} Número formateado
   */
  const formatNumber = (number) => {
    if (typeof number !== 'number') return '0'
    return number.toLocaleString('es-GT')
  }

  /**
   * Formatear porcentajes
   * @param {Number} number - Número a formatear como porcentaje
   * @param {Number} decimals - Número de decimales (default: 1)
   * @returns {String} Porcentaje formateado
   */
  const formatPercentage = (number, decimals = 1) => {
    if (typeof number !== 'number') return '0%'
    return `${number.toFixed(decimals)}%`
  }

  /**
   * Formatear moneda en quetzales
   * @param {Number} amount - Cantidad a formatear
   * @returns {String} Cantidad formateada
   */
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number') return 'Q 0.00'
    return `Q ${amount.toLocaleString('es-GT', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  /**
   * Formatear fecha relativa (hace X tiempo)
   * @param {Date|String} date - Fecha a formatear
   * @returns {String} Fecha formateada
   */
  const formatTimeAgo = (date) => {
    if (!date) return 'Desconocido'
    
    const now = new Date()
    const past = new Date(date)
    const diffMs = now - past
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Hace un momento'
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    
    return past.toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Formatear fecha completa
   * @param {Date|String} date - Fecha a formatear
   * @returns {String} Fecha formateada
   */
  const formatDate = (date) => {
    if (!date) return 'No definida'
    
    return new Date(date).toLocaleDateString('es-GT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  /**
   * Formatear fecha y hora
   * @param {Date|String} date - Fecha a formatear
   * @returns {String} Fecha y hora formateadas
   */
  const formatDateTime = (date) => {
    if (!date) return 'No definida'
    
    return new Date(date).toLocaleString('es-GT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    })
  }

  // ===== FUNCIONES DE VALIDACIÓN =====

  /**
   * Validar valor de parámetro según su tipo
   * @param {String} valor - Valor a validar
   * @param {String} tipoDato - Tipo de dato (STRING, INTEGER, DECIMAL, BOOLEAN, DATE)
   * @returns {Object} Resultado de validación { isValid: boolean, error?: string }
   */
  const validateParameterValue = (valor, tipoDato) => {
    if (!valor && valor !== 0 && valor !== false) {
      return { isValid: false, error: 'El valor es obligatorio' }
    }

    switch (tipoDato) {
      case 'INTEGER':
        if (!/^-?\d+$/.test(valor.toString())) {
          return { isValid: false, error: 'Debe ser un número entero' }
        }
        break

      case 'DECIMAL':
        if (!/^-?\d+(\.\d+)?$/.test(valor.toString())) {
          return { isValid: false, error: 'Debe ser un número decimal válido' }
        }
        break

      case 'BOOLEAN':
        if (!['true', 'false', true, false].includes(valor)) {
          return { isValid: false, error: 'Debe ser verdadero o falso' }
        }
        break

      case 'DATE':
        if (isNaN(Date.parse(valor))) {
          return { isValid: false, error: 'Debe ser una fecha válida' }
        }
        break

      case 'STRING':
        if (typeof valor !== 'string' || valor.length === 0) {
          return { isValid: false, error: 'Debe ser un texto válido' }
        }
        break

      default:
        return { isValid: false, error: 'Tipo de dato no válido' }
    }

    return { isValid: true }
  }

  /**
   * Validar datos de tipo de artículo
   * @param {Object} articleTypeData - Datos a validar
   * @returns {Object} Resultado de validación { isValid: boolean, errors: array }
   */
  const validateArticleTypeData = (articleTypeData) => {
    const errors = []

    // Validar nombre
    if (!articleTypeData.nombre?.trim()) {
      errors.push('El nombre del tipo es obligatorio')
    } else if (articleTypeData.nombre.trim().length < 2) {
      errors.push('El nombre debe tener al menos 2 caracteres')
    } else if (articleTypeData.nombre.trim().length > 100) {
      errors.push('El nombre no puede exceder 100 caracteres')
    }

    // Validar porcentaje mínimo
    if (articleTypeData.porcentajeMinAvaluo === undefined || articleTypeData.porcentajeMinAvaluo === null) {
      errors.push('El porcentaje mínimo de avalúo es obligatorio')
    } else if (articleTypeData.porcentajeMinAvaluo < 0 || articleTypeData.porcentajeMinAvaluo > 100) {
      errors.push('El porcentaje mínimo debe estar entre 0 y 100')
    }

    // Validar porcentaje máximo
    if (articleTypeData.porcentajeMaxAvaluo === undefined || articleTypeData.porcentajeMaxAvaluo === null) {
      errors.push('El porcentaje máximo de avalúo es obligatorio')
    } else if (articleTypeData.porcentajeMaxAvaluo < 0 || articleTypeData.porcentajeMaxAvaluo > 100) {
      errors.push('El porcentaje máximo debe estar entre 0 y 100')
    }

    // Validar que el mínimo sea menor al máximo
    if (articleTypeData.porcentajeMinAvaluo !== undefined && 
        articleTypeData.porcentajeMaxAvaluo !== undefined &&
        articleTypeData.porcentajeMinAvaluo >= articleTypeData.porcentajeMaxAvaluo) {
      errors.push('El porcentaje mínimo debe ser menor al máximo')
    }

    return {
      isValid: errors.length === 0,
      errors
    }
  }

  // ===== FUNCIONES DE UTILIDAD ESPECÍFICAS =====

  /**
   * Formatear porcentaje para mostrar
   * @param {Number} percentage - Porcentaje a formatear
   * @returns {String} Porcentaje formateado
   */
  const formatPercentageDisplay = (percentage) => {
    if (typeof percentage !== 'number') return '0%'
    return `${percentage.toFixed(1)}%`
  }

  /**
   * Obtener clase CSS para estado
   * @param {String} status - Estado a evaluar
   * @returns {String} Clase CSS correspondiente
   */
  const getStatusClass = (status) => {
    const statusMap = {
      'Activo': 'status-active',
      'Inactivo': 'status-inactive',
      'Pendiente': 'status-pending',
      'Aprobado': 'status-approved',
      'Rechazado': 'status-rejected',
      'Completado': 'status-completed',
      'En Proceso': 'status-processing',
      'Error': 'status-error',
      'Exitoso': 'status-success',
      'healthy': 'status-success',
      'degraded': 'status-warning',
      'error': 'status-error'
    }
    
    return statusMap[status] || 'status-unknown'
  }

  /**
   * Obtener clase CSS para estado de tipo de artículo
   * @param {String} estado - Estado del tipo (Activo/Inactivo)
   * @returns {String} Clase CSS correspondiente
   */
  const getArticleTypeStatusClass = (estado) => {
    const statusMap = {
      'Activo': 'status-active',
      'Inactivo': 'status-inactive'
    }
    
    return statusMap[estado] || 'status-unknown'
  }

  /**
   * Generar resumen de configuración de un tipo de artículo
   * @param {Object} articleType - Tipo de artículo
   * @returns {String} Resumen legible
   */
  const getArticleTypeSummary = (articleType) => {
    if (!articleType) return 'Tipo no válido'
    
    const rangoAvaluo = `${articleType.porcentajeMinAvaluo}% - ${articleType.porcentajeMaxAvaluo}%`
    const requiereInfo = articleType.requiereElectronico ? 'con información electrónica' : 'sin información electrónica'
    
    return `Avalúo: ${rangoAvaluo}, ${requiereInfo}`
  }

  /**
   * Verificar si un tipo de artículo puede ser eliminado
   * @param {Object} articleType - Tipo de artículo a verificar
   * @returns {Object} Resultado { canDelete: boolean, reason?: string }
   */
  const canDeleteArticleType = (articleType) => {
    if (!articleType) {
      return { canDelete: false, reason: 'Tipo de artículo no válido' }
    }

    // Por ahora, permitimos eliminar solo si está inactivo
    // En producción, deberías verificar si tiene artículos asociados
    if (articleType.estado === 'Activo') {
      return { 
        canDelete: false, 
        reason: 'No se puede eliminar un tipo activo. Desactívalo primero.' 
      }
    }

    return { canDelete: true }
  }

  // ===== RETORNO DEL COMPOSABLE =====
  return {
    // Estado
    loading: readonly(loading),
    error: readonly(error),
    
    // Métodos principales - Dashboard y estadísticas
    getAdminStats,
    getRecentActivity,
    
    // Métodos de parámetros del sistema
    getSystemParameters,
    updateSystemParameter,
    createSystemParameter,
    deleteSystemParameter,
    
    // Métodos de tipos de artículos
    getArticleTypes,
    createArticleType,
    updateArticleType,
    toggleArticleTypeStatus,
    deleteArticleType,
    getArticlesByType,
    
    // Métodos del sistema
    createDatabaseBackup,
    getSystemHealth,
    
    // Utilidades de formateo generales
    formatNumber,
    formatPercentage,
    formatCurrency,
    formatTimeAgo,
    formatDate,
    formatDateTime,
    
    // Utilidades de validación
    validateParameterValue,
    validateArticleTypeData,
    
    // Utilidades específicas
    formatPercentageDisplay,
    getStatusClass,
    getArticleTypeStatusClass,
    getArticleTypeSummary,
    canDeleteArticleType
  }
}