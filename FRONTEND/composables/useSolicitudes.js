// FRONTEND/composables/useSolicitudes.js
export const useSolicitudes = () => {
  const { api } = useApi()
  const { user } = useAuth()

  // Estado reactivo para solicitudes
  const solicitudesState = ref({
    loading: false,
    error: null,
    solicitudes: [],
    solicitudActual: null,
    pagination: null,
    estadisticas: null
  })

  // Estado para tipos de artículo
  const tiposArticuloState = ref({
    loading: false,
    tipos: []
  })

  // Estado para carga de archivos
  const uploadState = ref({
    loading: false,
    progress: 0,
    uploadedFiles: {
      fotosPrenda: [],
      documentosTecnicos: []
    }
  })

  // ===== FUNCIONES PRINCIPALES =====

  // Obtener solicitudes del usuario
  const getSolicitudesUsuario = async (filtros = {}) => {
    try {
      console.log('🔄 Cargando solicitudes del usuario...')
      solicitudesState.value.loading = true
      solicitudesState.value.error = null

      const params = new URLSearchParams()
      if (filtros.page) params.append('page', filtros.page)
      if (filtros.limit) params.append('limit', filtros.limit)
      if (filtros.estado && filtros.estado !== 'todas') params.append('estado', filtros.estado)

      const queryString = params.toString()
      const url = `/solicitudes${queryString ? '?' + queryString : ''}`

      const response = await api(url)

      if (response.success) {
        solicitudesState.value.solicitudes = response.data.solicitudes
        solicitudesState.value.pagination = response.data.pagination
        
        console.log('✅ Solicitudes cargadas:', response.data.solicitudes.length)
        return response.data
      } else {
        throw new Error(response.message || 'Error cargando solicitudes')
      }

    } catch (error) {
      console.error('❌ Error cargando solicitudes:', error)
      solicitudesState.value.error = error.message
      throw error
    } finally {
      solicitudesState.value.loading = false
    }
  }

  // Obtener detalle de una solicitud específica
  const getSolicitudDetalle = async (id) => {
    try {
      console.log('🔄 Cargando detalle de solicitud:', id)
      solicitudesState.value.loading = true
      solicitudesState.value.error = null

      const response = await api(`/solicitudes/${id}`)

      if (response.success) {
        solicitudesState.value.solicitudActual = response.data.solicitud
        console.log('✅ Detalle de solicitud cargado')
        return response.data.solicitud
      } else {
        throw new Error(response.message || 'Error cargando solicitud')
      }

    } catch (error) {
      console.error('❌ Error cargando detalle:', error)
      solicitudesState.value.error = error.message
      throw error
    } finally {
      solicitudesState.value.loading = false
    }
  }

  // Crear nueva solicitud
  const crearSolicitud = async (solicitudData) => {
    try {
      console.log('🔄 Creando nueva solicitud...')
      solicitudesState.value.loading = true
      solicitudesState.value.error = null

      if (!solicitudData.articulos || solicitudData.articulos.length === 0) {
        throw new Error('Debe incluir al menos un artículo')
      }

      const response = await api('/solicitudes', {
        method: 'POST',
        body: solicitudData
      })

      if (response.success) {
        console.log('✅ Solicitud creada exitosamente:', response.data.solicitud.id)
        
        if (solicitudesState.value.solicitudes.length > 0) {
          solicitudesState.value.solicitudes.unshift(response.data.solicitud)
        }

        return response.data.solicitud
      } else {
        throw new Error(response.message || 'Error creando solicitud')
      }

    } catch (error) {
      console.error('❌ Error creando solicitud:', error)
      solicitudesState.value.error = error.message
      
      if (error.data?.errors) {
        throw new Error(error.data.errors[0])
      }
      
      throw error
    } finally {
      solicitudesState.value.loading = false
    }
  }

  // Obtener tipos de artículo disponibles
  const getTiposArticulo = async () => {
    try {
      if (tiposArticuloState.value.tipos.length > 0) {
        console.log('🔄 Usando tipos de artículo en caché')
        return tiposArticuloState.value.tipos
      }

      console.log('🔄 Cargando tipos de artículo...')
      tiposArticuloState.value.loading = true

      const response = await api('/solicitudes/tipos-articulo')

      if (response.success) {
        tiposArticuloState.value.tipos = response.data.tiposArticulo
        console.log('✅ Tipos de artículo cargados:', response.data.tiposArticulo.length)
        return response.data.tiposArticulo
      } else {
        throw new Error(response.message || 'Error cargando tipos de artículo')
      }

    } catch (error) {
      console.error('❌ Error cargando tipos de artículo:', error)
      throw error
    } finally {
      tiposArticuloState.value.loading = false
    }
  }

  // Subir archivos (fotos y documentos)
  const uploadFiles = async (files) => {
    try {
      console.log('🔄 Subiendo archivos...', {
        fotosPrenda: files.fotosPrenda?.length || 0,
        documentosTecnicos: files.documentosTecnicos?.length || 0
      })

      uploadState.value.loading = true
      uploadState.value.progress = 0

      const formData = new FormData()

      if (files.fotosPrenda) {
        files.fotosPrenda.forEach(file => {
          formData.append('fotosPrenda', file)
        })
      }

      if (files.documentosTecnicos) {
        files.documentosTecnicos.forEach(file => {
          formData.append('documentosTecnicos', file)
        })
      }

      // Simular progreso de carga
      const progressInterval = setInterval(() => {
        if (uploadState.value.progress < 90) {
          uploadState.value.progress += 10
        }
      }, 200)

      const response = await api('/solicitudes/upload', {
        method: 'POST',
        body: formData
      })

      clearInterval(progressInterval)
      uploadState.value.progress = 100

      if (response.success) {
        uploadState.value.uploadedFiles = response.data
        console.log('✅ Archivos subidos exitosamente')
        return response.data
      } else {
        throw new Error(response.message || 'Error subiendo archivos')
      }

    } catch (error) {
      console.error('❌ Error subiendo archivos:', error)
      throw error
    } finally {
      uploadState.value.loading = false
      setTimeout(() => {
        uploadState.value.progress = 0
      }, 1000)
    }
  }

  // Obtener estadísticas de solicitudes
  const getEstadisticas = async () => {
    try {
      console.log('🔄 Cargando estadísticas de solicitudes...')

      const response = await api('/solicitudes/estadisticas')

      if (response.success) {
        solicitudesState.value.estadisticas = response.data.estadisticas
        console.log('✅ Estadísticas cargadas')
        return response.data.estadisticas
      } else {
        throw new Error(response.message || 'Error cargando estadísticas')
      }

    } catch (error) {
      console.error('❌ Error cargando estadísticas:', error)
      throw error
    }
  }

  // ===== FUNCIONES DE VALIDACIÓN =====

  // Validar datos de artículo
  const validarArticulo = (articulo) => {
    const errores = []

    if (!articulo.tipoArticuloId) {
      errores.push('Debe seleccionar un tipo de artículo')
    }

    if (!articulo.descripcion || articulo.descripcion.trim().length < 10) {
      errores.push('La descripción debe tener al menos 10 caracteres')
    }

    if (!articulo.estadoFisico) {
      errores.push('Debe seleccionar el estado físico del artículo')
    }

    if (articulo.valorEstimadoCliente && articulo.valorEstimadoCliente <= 0) {
      errores.push('El valor estimado debe ser mayor a 0')
    }

    const tipoArticulo = tiposArticuloState.value.tipos.find(
      t => t.id === parseInt(articulo.tipoArticuloId)
    )

    if (tipoArticulo?.requiereElectronico && !articulo.especificacionesTecnicas) {
      errores.push(`Los ${tipoArticulo.nombre} requieren especificaciones técnicas`)
    }

    return errores
  }

  // ===== FUNCIONES DE UTILIDAD =====

  // Formatear estado de solicitud
  const formatearEstado = (estado) => {
    const estados = {
      'Pendiente': { texto: 'Pendiente', color: 'warning', icono: '⏳' },
      'Aprobada': { texto: 'Aprobada', color: 'success', icono: '✅' },
      'Rechazada': { texto: 'Rechazada', color: 'error', icono: '❌' }
    }
    return estados[estado] || { texto: estado, color: 'default', icono: '❓' }
  }

  // Formatear estado físico
  const formatearEstadoFisico = (estado) => {
    const estados = {
      'Excelente': { texto: 'Excelente', color: 'success' },
      'Bueno': { texto: 'Bueno', color: 'success' },
      'Regular': { texto: 'Regular', color: 'warning' },
      'Malo': { texto: 'Malo', color: 'error' }
    }
    return estados[estado] || { texto: estado, color: 'default' }
  }

  // Obtener porcentaje estimado de avalúo
  const calcularAvaluoEstimado = (tipoArticuloId, valorEstimado) => {
    const tipo = tiposArticuloState.value.tipos.find(
      t => t.id === parseInt(tipoArticuloId)
    )
    
    if (!tipo || !valorEstimado) return null

    const porcentajePromedio = (tipo.porcentajeMinAvaluo + tipo.porcentajeMaxAvaluo) / 2
    const montoEstimado = (valorEstimado * porcentajePromedio) / 100

    return {
      porcentajeMin: tipo.porcentajeMinAvaluo,
      porcentajeMax: tipo.porcentajeMaxAvaluo,
      porcentajePromedio: porcentajePromedio,
      montoEstimado: montoEstimado
    }
  }

  // ===== COMPUTED PROPERTIES =====

  const haySolicitudes = computed(() => {
    return solicitudesState.value.solicitudes.length > 0
  })

  const solicitudesPendientes = computed(() => {
    return solicitudesState.value.solicitudes.filter(s => s.estado === 'Pendiente')
  })

  const solicitudesAprobadas = computed(() => {
    return solicitudesState.value.solicitudes.filter(s => s.estado === 'Aprobada')
  })

  const tiposArticuloDisponibles = computed(() => {
    return tiposArticuloState.value.tipos.filter(t => t.estado === 'Activo')
  })

  return {
    // Estados
    solicitudesState: readonly(solicitudesState),
    tiposArticuloState: readonly(tiposArticuloState),
    uploadState: readonly(uploadState),
    
    // Funciones principales
    getSolicitudesUsuario,
    getSolicitudDetalle,
    crearSolicitud,
    getTiposArticulo,
    uploadFiles,
    getEstadisticas,
    
    // Validaciones
    validarArticulo,
    
    // Utilidades
    formatearEstado,
    formatearEstadoFisico,
    calcularAvaluoEstimado,
    
    // Computed
    haySolicitudes,
    solicitudesPendientes,
    solicitudesAprobadas,
    tiposArticuloDisponibles
  }
}