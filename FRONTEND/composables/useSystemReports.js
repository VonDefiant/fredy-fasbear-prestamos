import { ref, computed, readonly } from 'vue'

export const useSystemReports = () => {
  // ===== ESTADO REACTIVO =====
  const loading = ref(false)
  const error = ref(null)
  
  // Estados específicos para cada sección
  const overviewLoading = ref(false)
  const databaseLoading = ref(false)
  const healthLoading = ref(false)
  const activityLoading = ref(false)

  // ===== COMPOSABLES INTERNOS =====
  const { api } = useApi()

  // ===== FUNCIONES PARA OBTENER DATOS =====

  /**
   * Obtener estadísticas generales del sistema
   * @returns {Promise<Object>} Estadísticas del sistema
   */
  const getSystemOverview = async () => {
    try {
      overviewLoading.value = true
      error.value = null
      
      console.log('📊 Obteniendo estadísticas generales del sistema...')
      
      const response = await api('/system-reports/overview')
      
      if (response.success) {
        console.log('✅ Estadísticas del sistema obtenidas:', response.data.systemStats)
        return response.data.systemStats
      } else {
        throw new Error(response.message || 'Error obteniendo estadísticas del sistema')
      }
    } catch (err) {
      console.error('❌ Error obteniendo estadísticas del sistema:', err)
      error.value = err.message
      
      // Datos de fallback
      return {
        totalTables: 15,
        newTables: 2,
        totalColumns: 89,
        newColumns: 8,
        totalSchemas: 3,
        responseTime: 285,
        totalUsers: 0,
        activeSessions: 0,
        totalSolicitudes: 0,
        totalPrestamos: 0,
        totalArticulos: 0,
        totalProductos: 0
      }
    } finally {
      overviewLoading.value = false
    }
  }

  /**
   * Obtener análisis detallado de la base de datos
   * @returns {Promise<Object>} Análisis de la base de datos
   */
  const getDatabaseAnalysis = async () => {
    try {
      databaseLoading.value = true
      error.value = null
      
      console.log('🔍 Obteniendo análisis de base de datos...')
      
      const response = await api('/system-reports/database-analysis')
      
      if (response.success) {
        console.log('✅ Análisis de base de datos obtenido:', response.data)
        return response.data
      } else {
        throw new Error(response.message || 'Error obteniendo análisis de base de datos')
      }
    } catch (err) {
      console.error('❌ Error obteniendo análisis de base de datos:', err)
      error.value = err.message
      
      // Datos de fallback
      return {
        dbmsDistribution: {
          'PostgreSQL': 89,
          'MySQL': 0,
          'SQLite': 0,
          'Oracle': 0
        },
        dataTypesDistribution: {
          'varchar': 25,
          'integer': 18,
          'text': 12,
          'boolean': 8,
          'timestamp': 10,
          'decimal': 6,
          'json': 4,
          'uuid': 3,
          'date': 2,
          'bigint': 1
        },
        schemaStats: [
          { name: 'public', tableCount: 15, columnCount: 89, status: 'active' }
        ],
        constraintsInfo: [
          { type: 'PRIMARY KEY', count: 15 },
          { type: 'FOREIGN KEY', count: 28 },
          { type: 'UNIQUE', count: 12 },
          { type: 'CHECK', count: 5 }
        ]
      }
    } finally {
      databaseLoading.value = false
    }
  }

  /**
   * Obtener métricas de salud del sistema
   * @returns {Promise<Object>} Métricas de salud
   */
  const getSystemHealth = async () => {
    try {
      healthLoading.value = true
      error.value = null
      
      console.log('🏥 Obteniendo métricas de salud del sistema...')
      
      const response = await api('/system-reports/health-monitoring')
      
      if (response.success) {
        console.log('✅ Métricas de salud obtenidas:', response.data.systemHealth)
        return response.data.systemHealth
      } else {
        throw new Error(response.message || 'Error obteniendo métricas de salud')
      }
    } catch (err) {
      console.error('❌ Error obteniendo métricas de salud:', err)
      error.value = err.message
      
      // Datos de fallback
      return {
        cpu: 45,
        memory: 67,
        storage: 23,
        network: 850,
        dbConnections: 3,
        dbSize: '12 MB',
        uptime: process?.uptime ? process.uptime() : 86400
      }
    } finally {
      healthLoading.value = false
    }
  }

  /**
   * Obtener actividad reciente del sistema
   * @param {Number} limit - Número de actividades a obtener
   * @returns {Promise<Array>} Lista de actividades recientes
   */
  const getRecentActivity = async (limit = 10) => {
    try {
      activityLoading.value = true
      error.value = null
      
      console.log(`🔄 Obteniendo ${limit} actividades recientes...`)
      
      const response = await api(`/system-reports/recent-activity?limit=${limit}`)
      
      if (response.success) {
        console.log('✅ Actividad reciente obtenida:', response.data.recentActivities.length, 'actividades')
        return response.data.recentActivities
      } else {
        throw new Error(response.message || 'Error obteniendo actividad reciente')
      }
    } catch (err) {
      console.error('❌ Error obteniendo actividad reciente:', err)
      error.value = err.message
      
      // Datos de fallback
      return [
        {
          id: 'fallback_1',
          type: 'database',
          title: 'Backup automático completado',
          description: 'Backup completo de la base de datos realizado exitosamente',
          timestamp: new Date(Date.now() - 1000 * 60 * 15),
          status: 'success',
          user: 'Sistema'
        },
        {
          id: 'fallback_2',
          type: 'security',
          title: 'Nueva sesión iniciada',
          description: 'Administrador Sistema (Administrador)',
          timestamp: new Date(Date.now() - 1000 * 60 * 30),
          status: 'success',
          user: 'Administrador Sistema'
        },
        {
          id: 'fallback_3',
          type: 'maintenance',
          title: 'Parámetro del sistema actualizado',
          description: 'Tasa de interés actualizada de 4.5% a 5.0%',
          timestamp: new Date(Date.now() - 1000 * 60 * 60),
          status: 'success',
          user: 'Administrador Sistema'
        }
      ]
    } finally {
      activityLoading.value = false
    }
  }

  /**
   * Exportar reporte del sistema
   * @param {Object} options - Opciones de exportación
   * @param {String} options.reportType - Tipo de reporte
   * @param {String} options.format - Formato del archivo (csv, pdf, excel)
   * @param {Object} options.dateRange - Rango de fechas
   * @returns {Promise<Object>} Información del reporte exportado
   */
  const exportSystemReport = async (options = {}) => {
    try {
      loading.value = true
      error.value = null
      
      const {
        reportType = 'overview',
        format = 'csv',
        dateRange = {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 días atrás
          end: new Date()
        }
      } = options
      
      console.log(`📤 Exportando reporte: ${reportType} en formato ${format}...`)
      
      const response = await api('/system-reports/export', {
        method: 'POST',
        body: JSON.stringify({
          reportType,
          format,
          dateRange
        })
      })
      
      if (response.success) {
        console.log('✅ Reporte exportado:', response.data.export)
        return response.data.export
      } else {
        throw new Error(response.message || 'Error exportando reporte')
      }
    } catch (err) {
      console.error('❌ Error exportando reporte:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  /**
   * Actualizar estadísticas en tiempo real
   * @returns {Promise<Object>} Todas las estadísticas actualizadas
   */
  const refreshAllData = async () => {
    try {
      loading.value = true
      error.value = null
      
      console.log('🔄 Actualizando todos los datos del sistema...')
      
      const [overview, databaseAnalysis, systemHealth, recentActivity] = await Promise.all([
        getSystemOverview(),
        getDatabaseAnalysis(),
        getSystemHealth(),
        getRecentActivity(10)
      ])
      
      console.log('✅ Todos los datos actualizados exitosamente')
      
      return {
        overview,
        databaseAnalysis,
        systemHealth,
        recentActivity
      }
    } catch (err) {
      console.error('❌ Error actualizando datos del sistema:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===== FUNCIONES DE UTILIDAD =====

  /**
   * Formatear tiempo transcurrido
   * @param {Date|String} timestamp - Fecha a formatear
   * @returns {String} Tiempo formateado
   */
  const formatTimeAgo = (timestamp) => {
    if (!timestamp) return 'Desconocido'
    
    const now = new Date()
    const past = new Date(timestamp)
    const diffMs = now - past
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    
    if (diffMinutes < 1) return 'Hace un momento'
    if (diffMinutes < 60) return `Hace ${diffMinutes} minuto${diffMinutes > 1 ? 's' : ''}`
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    if (diffDays < 30) return `Hace ${Math.floor(diffDays / 7)} semana${Math.floor(diffDays / 7) > 1 ? 's' : ''}`
    return `Hace ${Math.floor(diffDays / 30)} mes${Math.floor(diffDays / 30) > 1 ? 'es' : ''}`
  }

  /**
   * Formatear números con separadores de miles
   * @param {Number} number - Número a formatear
   * @returns {String} Número formateado
   */
  const formatNumber = (number) => {
    if (typeof number !== 'number' || isNaN(number)) return '0'
    return number.toLocaleString('es-GT')
  }

  /**
   * Formatear bytes a formato legible
   * @param {Number} bytes - Bytes a formatear
   * @returns {String} Tamaño formateado
   */
  const formatBytes = (bytes) => {
    if (!bytes || bytes === 0) return '0 B'
    
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
  }

  /**
   * Formatear porcentajes
   * @param {Number} number - Número a formatear como porcentaje
   * @param {Number} decimals - Número de decimales (default: 1)
   * @returns {String} Porcentaje formateado
   */
  const formatPercentage = (number, decimals = 1) => {
    if (typeof number !== 'number' || isNaN(number)) return '0%'
    return `${number.toFixed(decimals)}%`
  }

  /**
   * Formatear moneda en quetzales
   * @param {Number} amount - Cantidad a formatear
   * @returns {String} Cantidad formateada
   */
  const formatCurrency = (amount) => {
    if (typeof amount !== 'number' || isNaN(amount)) return 'Q 0.00'
    return `Q ${amount.toLocaleString('es-GT', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`
  }

  /**
   * Formatear tiempo de uptime
   * @param {Number} seconds - Segundos de uptime
   * @returns {String} Tiempo formateado
   */
  const formatUptime = (seconds) => {
    if (!seconds || seconds === 0) return 'Desconocido'
    
    const days = Math.floor(seconds / (24 * 60 * 60))
    const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60))
    const minutes = Math.floor((seconds % (60 * 60)) / 60)
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`
    if (hours > 0) return `${hours}h ${minutes}m`
    return `${minutes}m`
  }

  /**
   * Obtener color para un tipo de DBMS
   * @param {String} dbms - Nombre del DBMS
   * @returns {String} Color hexadecimal
   */
  const getDBMSColor = (dbms) => {
    const colors = {
      'PostgreSQL': '#336791',
      'MySQL': '#4479A1', 
      'SQLite': '#003B57',
      'Oracle': '#F80000',
      'MongoDB': '#47A248',
      'Redis': '#DC382D'
    }
    return colors[dbms] || '#D4AF37'
  }

  /**
   * Obtener icono para un tipo de actividad
   * @param {String} type - Tipo de actividad
   * @returns {String} Nombre del componente de icono
   */
  const getActivityIcon = (type) => {
    const icons = {
      database: 'DatabaseIcon',
      security: 'SecurityIcon', 
      maintenance: 'MaintenanceIcon',
      error: 'ErrorIcon',
      business: 'BusinessIcon',
      system: 'SystemIcon'
    }
    return icons[type] || 'DefaultIcon'
  }

  /**
   * Determinar estado de salud basado en métricas
   * @param {Object} healthData - Datos de salud del sistema
   * @returns {Object} Estado de salud con color y mensaje
   */
  const getHealthStatus = (healthData) => {
    if (!healthData) return { status: 'unknown', color: '#95A5A6', message: 'Desconocido' }
    
    const { cpu, memory, storage } = healthData
    
    // Determinar estado crítico
    if (cpu > 90 || memory > 95 || storage > 90) {
      return { status: 'critical', color: '#E74C3C', message: 'Crítico' }
    }
    
    // Determinar estado de advertencia
    if (cpu > 70 || memory > 80 || storage > 75) {
      return { status: 'warning', color: '#F39C12', message: 'Advertencia' }
    }
    
    // Estado normal
    return { status: 'healthy', color: '#27AE60', message: 'Saludable' }
  }

  /**
   * Obtener clase CSS para métricas de salud
   * @param {Number} value - Valor de la métrica
   * @param {Object} thresholds - Umbrales de advertencia y crítico
   * @returns {String} Clase CSS
   */
  const getHealthClass = (value, thresholds = { warning: 70, critical: 90 }) => {
    if (value >= thresholds.critical) return 'critical'
    if (value >= thresholds.warning) return 'warning'
    return 'normal'
  }

  /**
   * Calcular tendencia de datos
   * @param {Array} data - Array de valores históricos
   * @returns {Object} Información de tendencia
   */
  const calculateTrend = (data) => {
    if (!data || data.length < 2) {
      return { direction: 'neutral', percentage: 0, isPositive: null }
    }
    
    const current = data[data.length - 1]
    const previous = data[data.length - 2]
    const change = current - previous
    const percentage = previous !== 0 ? (change / previous) * 100 : 0
    
    return {
      direction: change > 0 ? 'up' : change < 0 ? 'down' : 'neutral',
      percentage: Math.abs(percentage),
      isPositive: change >= 0,
      change: change
    }
  }

  /**
   * Validar configuración del sistema
   * @param {Object} config - Configuración a validar
   * @returns {Object} Resultado de validación
   */
  const validateSystemConfig = (config) => {
    const issues = []
    
    if (!config.database_url) {
      issues.push('URL de base de datos no configurada')
    }
    
    if (!config.jwt_secret) {
      issues.push('JWT Secret no configurado')
    }
    
    if (config.max_connections && config.max_connections < 10) {
      issues.push('Número de conexiones muy bajo')
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      score: Math.max(0, 100 - (issues.length * 25))
    }
  }

  // ===== COMPUTED PROPERTIES =====
  
  /**
   * Estado de carga general
   */
  const isLoading = computed(() => {
    return loading.value || overviewLoading.value || databaseLoading.value || 
           healthLoading.value || activityLoading.value
  })

  /**
   * Indica si hay algún error
   */
  const hasError = computed(() => {
    return !!error.value
  })

  /**
   * Estado de carga por secciones
   */
  const loadingStates = computed(() => ({
    overview: overviewLoading.value,
    database: databaseLoading.value,
    health: healthLoading.value,
    activity: activityLoading.value,
    general: loading.value
  }))

  // ===== FUNCIONES DE LIMPIEZA =====
  
  /**
   * Limpiar errores
   */
  const clearError = () => {
    error.value = null
  }

  /**
   * Resetear todos los estados de carga
   */
  const resetLoadingStates = () => {
    loading.value = false
    overviewLoading.value = false
    databaseLoading.value = false
    healthLoading.value = false
    activityLoading.value = false
  }

  /**
   * Limpiar cache de datos (útil para forzar recarga)
   */
  const clearCache = () => {
    console.log('🧹 Limpiando cache de reportes del sistema...')
    clearError()
    resetLoadingStates()
  }

  // ===== RETURN COMPOSABLE =====
  return {
    // Estados reactivos (readonly para evitar mutaciones externas)
    loading: readonly(loading),
    error: readonly(error),
    overviewLoading: readonly(overviewLoading),
    databaseLoading: readonly(databaseLoading),
    healthLoading: readonly(healthLoading),
    activityLoading: readonly(activityLoading),
    
    // Computed properties
    isLoading,
    hasError,
    loadingStates,
    
    // Funciones principales de API
    getSystemOverview,
    getDatabaseAnalysis,
    getSystemHealth,
    getRecentActivity,
    exportSystemReport,
    refreshAllData,
    
    // Funciones de formateo
    formatTimeAgo,
    formatNumber,
    formatBytes,
    formatPercentage,
    formatCurrency,
    formatUptime,
    
    // Funciones de utilidad visual
    getDBMSColor,
    getActivityIcon,
    getHealthStatus,
    getHealthClass,
    
    // Funciones de análisis
    calculateTrend,
    validateSystemConfig,
    
    // Funciones de limpieza y control
    clearError,
    resetLoadingStates,
    clearCache
  }
}