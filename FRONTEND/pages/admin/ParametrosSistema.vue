<template>
  <div class="parametros-sistema-page">
    <!-- Header de navegación -->
    <div class="navigation-header">
      <nuxt-link to="/admin" class="btn-back">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        Volver al Panel
      </nuxt-link>
    </div>

    <div class="parametros-container">
      <!-- Header principal -->
      <div class="parametros-header">
        <div class="header-content">
          <div class="header-info">
            <h1>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
                <path d="M19.4 15C19.2669 15.3016 19.2272 15.6362 19.286 15.9606C19.3448 16.285 19.4995 16.5843 19.73 16.82L19.79 16.88C19.976 17.0657 20.1235 17.2863 20.2241 17.5291C20.3248 17.7719 20.3766 18.0322 20.3766 18.295C20.3766 18.5578 20.3248 18.8181 20.2241 19.0609C20.1235 19.3037 19.976 19.5243 19.79 19.71C19.6043 19.896 19.3837 20.0435 19.1409 20.1441C18.8981 20.2448 18.6378 20.2966 18.375 20.2966C18.1122 20.2966 17.8519 20.2448 17.6091 20.1441C17.3663 20.0435 17.1457 19.896 16.96 19.71L16.9 19.65C16.6643 19.4195 16.365 19.2648 16.0406 19.206C15.7162 19.1472 15.3816 19.1869 15.07 19.32C14.7642 19.4468 14.5118 19.6572 14.3341 19.9255C14.1564 20.1938 14.061 20.5082 14.06 20.83V21C14.06 21.5304 13.8493 22.0391 13.4742 22.4142C13.0991 22.7893 12.5904 23 12.06 23C11.5296 23 11.0209 22.7893 10.6458 22.4142C10.2707 22.0391 10.06 21.5304 10.06 21V20.91C10.0552 20.5798 9.94717 20.2588 9.7544 19.9898C9.56163 19.7208 9.29052 19.5161 8.98 19.4C8.66838 19.2669 8.33381 19.2272 8.00941 19.286C7.68502 19.3448 7.38568 19.4995 7.15 19.73L7.09 19.79C6.90425 19.976 6.68368 20.1235 6.44088 20.2241C6.19808 20.3248 5.93783 20.3766 5.675 20.3766C5.41217 20.3766 5.15192 20.3248 4.90912 20.2241C4.66632 20.1235 4.44575 19.976 4.26 19.79C4.07405 19.6043 3.92653 19.3837 3.82588 19.1409C3.72523 18.8981 3.67343 18.6378 3.67343 18.375C3.67343 18.1122 3.72523 17.8519 3.82588 17.6091C3.92653 17.3663 4.07405 17.1457 4.26 16.96L4.32 16.9C4.55054 16.6643 4.70519 16.365 4.764 16.0406C4.82282 15.7162 4.78312 15.3816 4.65 15.07C4.52324 14.7642 4.31276 14.5118 4.04447 14.3341C3.77618 14.1564 3.46179 14.061 3.14 14.06H3C2.46957 14.06 1.96086 13.8493 1.58579 13.4742C1.21071 13.0991 1 12.5904 1 12.06C1 11.5296 1.21071 11.0209 1.58579 10.6458C1.96086 10.2707 2.46957 10.06 3 10.06H3.09C3.42018 10.0552 3.74118 9.94717 4.01022 9.7544C4.27925 9.56163 4.48394 9.29052 4.6 8.98C4.73312 8.66838 4.77282 8.33381 4.714 8.00941C4.65519 7.68502 4.50054 7.38568 4.27 7.15L4.21 7.09C4.02405 6.90425 3.87653 6.68368 3.77588 6.44088C3.67523 6.19808 3.62343 5.93783 3.62343 5.675C3.62343 5.41217 3.67523 5.15192 3.77588 4.90912C3.87653 4.66632 4.02405 4.44575 4.21 4.26C4.39575 4.07405 4.61632 3.92653 4.85912 3.82588C5.10192 3.72523 5.36217 3.67343 5.625 3.67343C5.88783 3.67343 6.14808 3.72523 6.39088 3.82588C6.63368 3.87653 6.85425 4.02405 7.04 4.21L7.1 4.27C7.33568 4.50054 7.63502 4.65519 7.95941 4.714C8.28381 4.77282 8.61838 4.73312 8.93 4.6H9C9.30577 4.47324 9.55802 4.26276 9.73569 3.99447C9.91337 3.72618 10.0087 3.41179 10.01 3.09V3C10.01 2.46957 10.2207 1.96086 10.5958 1.58579C10.9709 1.21071 11.4796 1 12.01 1C12.5404 1 13.0491 1.21071 13.4242 1.58579C13.7993 1.96086 14.01 2.46957 14.01 3V3.09C14.0113 3.41179 14.1066 3.72618 14.2843 3.99447C14.462 4.26276 14.7142 4.47324 15.02 4.6C15.3316 4.73312 15.6662 4.77282 15.9906 4.714C16.315 4.65519 16.6143 4.50054 16.85 4.27L16.91 4.21C17.0957 4.02405 17.3163 3.87653 17.5591 3.77588C17.8019 3.67523 18.0622 3.62343 18.325 3.62343C18.5878 3.62343 18.8481 3.67523 19.0909 3.77588C19.3337 3.87653 19.5543 4.02405 19.74 4.21C19.926 4.39575 20.0735 4.61632 20.1741 4.85912C20.2748 5.10192 20.3266 5.36217 20.3266 5.625C20.3266 5.88783 20.2748 6.14808 20.1741 6.39088C20.0735 6.63368 19.926 6.85425 19.74 7.04L19.68 7.1C19.4495 7.33568 19.2948 7.63502 19.236 7.95941C19.1772 8.28381 19.2169 8.61838 19.35 8.93V9C19.4768 9.30577 19.6872 9.55802 19.9555 9.73569C20.2238 9.91337 20.5382 10.0087 20.86 10.01H21C21.5304 10.01 22.0391 10.2207 22.4142 10.5958C22.7893 10.9709 23 11.4796 23 12.01C23 12.5404 22.7893 13.0491 22.4142 13.4242C22.0391 13.7993 21.5304 14.01 21 14.01H20.91C20.5882 14.0113 20.2738 14.1066 20.0055 14.2843C19.7372 14.462 19.5268 14.7142 19.4 15.02Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              Parámetros del Sistema
            </h1>
            <p>Configuración de tasas, porcentajes, plazos y reglas de negocio</p>
          </div>
          <div class="header-actions">
            <button class="btn-guardar" @click="guardarTodosParametros" :disabled="guardando">
              <svg v-if="guardando" width="20" height="20" viewBox="0 0 24 24" fill="none" class="animate-spin">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H16L21 8V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21Z" stroke="currentColor" stroke-width="2"/>
                <polyline points="17,21 17,13 7,13 7,21" stroke="currentColor" stroke-width="2"/>
                <polyline points="7,3 7,8 15,8" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ guardando ? 'Guardando...' : 'Guardar Todos' }}
            </button>
          </div>
        </div>
      </div>

      <!-- Contenido principal -->
      <div class="parametros-content">
        <!-- Secciones de parámetros -->
        <div class="parametros-sections">
          
          <!-- 1. Parámetros de Avalúo y Préstamo -->
          <div class="parametros-section">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                </svg>
                Parámetros de Avalúo y Préstamo
              </h2>
              <p>Configuración de montos, porcentajes y límites de préstamo</p>
            </div>
            
            <div class="params-grid">
              <div class="param-card">
                <label>Monto Mínimo de Préstamo</label>
                <div class="input-group">
                  <span class="input-prefix">Q</span>
                  <input 
                    type="number" 
                    v-model.number="parametros.MONTO_MINIMO_PRESTAMO" 
                    min="0" 
                    step="100"
                    class="param-input"
                    @change="marcarCambio('MONTO_MINIMO_PRESTAMO')"
                  >
                </div>
                <small>Monto mínimo permitido para solicitar un préstamo</small>
              </div>

              <div class="param-card">
                <label>Monto Máximo de Préstamo</label>
                <div class="input-group">
                  <span class="input-prefix">Q</span>
                  <input 
                    type="number" 
                    v-model.number="parametros.MONTO_MAXIMO_PRESTAMO" 
                    min="0" 
                    step="500"
                    class="param-input"
                    @change="marcarCambio('MONTO_MAXIMO_PRESTAMO')"
                  >
                </div>
                <small>Monto máximo permitido para cualquier préstamo</small>
              </div>

              <div class="param-card">
                <label>Porcentaje Mínimo de Avalúo</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.PORCENTAJE_MINIMO_AVALUO" 
                    min="0" 
                    max="100" 
                    step="0.5"
                    class="param-input"
                    @change="marcarCambio('PORCENTAJE_MINIMO_AVALUO')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Porcentaje mínimo del valor del artículo que se puede prestar</small>
              </div>

              <div class="param-card">
                <label>Porcentaje Máximo de Avalúo</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.PORCENTAJE_MAXIMO_AVALUO" 
                    min="0" 
                    max="100" 
                    step="0.5"
                    class="param-input"
                    @change="marcarCambio('PORCENTAJE_MAXIMO_AVALUO')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Porcentaje máximo del valor del artículo que se puede prestar</small>
              </div>

              <div class="param-card">
                <label>Porcentaje Recomendado de Avalúo</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.PORCENTAJE_RECOMENDADO_AVALUO" 
                    min="0" 
                    max="100" 
                    step="0.5"
                    class="param-input"
                    @change="marcarCambio('PORCENTAJE_RECOMENDADO_AVALUO')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Porcentaje sugerido por defecto en el sistema</small>
              </div>
            </div>
          </div>

          <!-- 2. Parámetros de Plazos -->
          <div class="parametros-section">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
                  <polyline points="12,6 12,12 16,14" stroke="currentColor" stroke-width="2"/>
                </svg>
                Parámetros de Plazos
              </h2>
              <p>Configuración de plazos mínimos y máximos para préstamos</p>
            </div>

            <div class="params-grid">
              <div class="param-card">
                <label>Plazo Mínimo</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.PLAZO_MINIMO_MESES" 
                    min="1" 
                    max="12"
                    class="param-input"
                    @change="marcarCambio('PLAZO_MINIMO_MESES')"
                  >
                  <span class="input-suffix">meses</span>
                </div>
                <small>Tiempo mínimo para pagar un préstamo</small>
              </div>

              <div class="param-card">
                <label>Plazo Máximo</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.PLAZO_MAXIMO_MESES" 
                    min="1" 
                    max="36"
                    class="param-input"
                    @change="marcarCambio('PLAZO_MAXIMO_MESES')"
                  >
                  <span class="input-suffix">meses</span>
                </div>
                <small>Tiempo máximo para pagar un préstamo</small>
              </div>
            </div>
          </div>

          <!-- 3. Parámetros de Tasas de Interés -->
          <div class="parametros-section">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <line x1="12" y1="2" x2="12" y2="22" stroke="currentColor" stroke-width="2"/>
                  <path d="M17 5H9.5C8.11929 5 7 6.11929 7 7.5C7 8.88071 8.11929 10 9.5 10H14.5C15.8807 10 17 11.1193 17 12.5C17 13.8807 15.8807 15 14.5 15H7" stroke="currentColor" stroke-width="2"/>
                  <line x1="9" y1="2" x2="9" y2="6" stroke="currentColor" stroke-width="2"/>
                  <line x1="15" y1="18" x2="15" y2="22" stroke="currentColor" stroke-width="2"/>
                </svg>
                Tasas de Interés
              </h2>
              <p>Configuración de tasas por modalidad de pago</p>
            </div>

            <div class="params-grid">
              <div class="param-card">
                <label>Tasa de Interés Mensual</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.TASA_INTERES_MENSUAL" 
                    min="0" 
                    max="30" 
                    step="0.1"
                    class="param-input"
                    @change="marcarCambio('TASA_INTERES_MENSUAL')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Tasa aplicada a pagos mensuales</small>
              </div>

              <div class="param-card">
                <label>Tasa de Interés Quincenal</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.TASA_INTERES_QUINCENAL" 
                    min="0" 
                    max="20" 
                    step="0.1"
                    class="param-input"
                    @change="marcarCambio('TASA_INTERES_QUINCENAL')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Tasa aplicada a pagos quincenales</small>
              </div>

              <div class="param-card">
                <label>Tasa de Interés Semanal</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.TASA_INTERES_SEMANAL" 
                    min="0" 
                    max="15" 
                    step="0.1"
                    class="param-input"
                    @change="marcarCambio('TASA_INTERES_SEMANAL')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Tasa aplicada a pagos semanales</small>
              </div>
            </div>
          </div>

          <!-- 4. Parámetros de Comisiones -->
          <div class="parametros-section">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" stroke="currentColor" stroke-width="2"/>
                  <line x1="8" y1="21" x2="16" y2="21" stroke="currentColor" stroke-width="2"/>
                  <line x1="12" y1="17" x2="12" y2="21" stroke="currentColor" stroke-width="2"/>
                </svg>
                Comisiones y Cargos
              </h2>
              <p>Configuración de comisiones y cargos adicionales</p>
            </div>

            <div class="params-grid">
              <div class="param-card">
                <label>Comisión de Apertura</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.COMISION_APERTURA" 
                    min="0" 
                    max="10" 
                    step="0.1"
                    class="param-input"
                    @change="marcarCambio('COMISION_APERTURA')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Comisión cobrada al abrir un nuevo préstamo</small>
              </div>

              <div class="param-card">
                <label>Comisión de Renovación</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.COMISION_RENOVACION" 
                    min="0" 
                    max="10" 
                    step="0.1"
                    class="param-input"
                    @change="marcarCambio('COMISION_RENOVACION')"
                  >
                  <span class="input-suffix">%</span>
                </div>
                <small>Comisión cobrada al renovar un préstamo existente</small>
              </div>
            </div>
          </div>

          <!-- 5. Límites del Sistema -->
          <div class="parametros-section">
            <div class="section-header">
              <h2>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M9 12L11 14L15 10" stroke="currentColor" stroke-width="2"/>
                  <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
                Límites del Sistema
              </h2>
              <p>Configuración de límites operacionales</p>
            </div>

            <div class="params-grid">
              <div class="param-card">
                <label>Límite de Préstamos Activos por Cliente</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.LIMITE_PRESTAMOS_ACTIVOS" 
                    min="1" 
                    max="20"
                    class="param-input"
                    @change="marcarCambio('LIMITE_PRESTAMOS_ACTIVOS')"
                  >
                  <span class="input-suffix">préstamos</span>
                </div>
                <small>Cantidad máxima de préstamos activos por cliente</small>
              </div>

              <div class="param-card">
                <label>Límite de Solicitudes Pendientes por Cliente</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.LIMITE_SOLICITUDES_PENDIENTES" 
                    min="1" 
                    max="10"
                    class="param-input"
                    @change="marcarCambio('LIMITE_SOLICITUDES_PENDIENTES')"
                  >
                  <span class="input-suffix">solicitudes</span>
                </div>
                <small>Cantidad máxima de solicitudes pendientes por cliente</small>
              </div>

              <div class="param-card">
                <label>Días de Gracia para Mora</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.DIAS_GRACIA_MORA" 
                    min="0" 
                    max="30"
                    class="param-input"
                    @change="marcarCambio('DIAS_GRACIA_MORA')"
                  >
                  <span class="input-suffix">días</span>
                </div>
                <small>Días adicionales antes de considerar un pago como moroso</small>
              </div>

              <div class="param-card">
                <label>Días para Transferir a E-commerce</label>
                <div class="input-group">
                  <input 
                    type="number" 
                    v-model.number="parametros.DIAS_TRANSFER_ECOMMERCE" 
                    min="1" 
                    max="365"
                    class="param-input"
                    @change="marcarCambio('DIAS_TRANSFER_ECOMMERCE')"
                  >
                  <span class="input-suffix">días</span>
                </div>
                <small>Días después del vencimiento para transferir artículos al e-commerce</small>
              </div>
            </div>
          </div>
        </div>

        <!-- Panel de cambios -->
        <div v-if="parametrosCambiados.size > 0" class="cambios-panel">
          <div class="cambios-header">
            <h3>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
              </svg>
              Cambios Pendientes
            </h3>
            <span class="cambios-count">{{ parametrosCambiados.size }} parámetros modificados</span>
          </div>
          
          <div class="cambios-lista">
            <div v-for="param in Array.from(parametrosCambiados)" :key="param" class="cambio-item">
              <span class="cambio-nombre">{{ obtenerNombreParametro(param) }}</span>
              <span class="cambio-valor">{{ formatearValor(param, parametros[param]) }}</span>
              <button @click="revertirCambio(param)" class="btn-revertir">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12C21 16.9706 16.9706 21 12 21" stroke="currentColor" stroke-width="2"/>
                  <path d="M3 12L7 8L3 12L7 16L3 12Z" stroke="currentColor" stroke-width="2"/>
                </svg>
              </button>
            </div>
          </div>

          <div class="cambios-acciones">
            <button @click="revertirTodosCambios" class="btn-secondary">
              Revertir Todos
            </button>
            <button @click="guardarTodosParametros" class="btn-primary" :disabled="guardando">
              <svg v-if="guardando" width="16" height="16" viewBox="0 0 24 24" fill="none" class="animate-spin">
                <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="currentColor" stroke-width="2"/>
              </svg>
              {{ guardando ? 'Guardando...' : 'Guardar Cambios' }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast de notificaciones -->
    <div v-if="notificacion.mostrar" class="notification-toast" :class="notificacion.tipo">
      <svg v-if="notificacion.tipo === 'success'" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M22 11.08V12C22 17.52 17.52 22 12 22C6.48 22 2 17.52 2 12C2 6.48 6.48 2 12 2C13.18 2 14.29 2.25 15.31 2.69" stroke="currentColor" stroke-width="2"/>
        <polyline points="22,4 12,14.01 9,11.01" stroke="currentColor" stroke-width="2"/>
      </svg>
      <svg v-else-if="notificacion.tipo === 'error'" width="20" height="20" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <line x1="15" y1="9" x2="9" y2="15" stroke="currentColor" stroke-width="2"/>
        <line x1="9" y1="9" x2="15" y2="15" stroke="currentColor" stroke-width="2"/>
      </svg>
      <span>{{ notificacion.mensaje }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'

// Meta tags y protección de ruta
definePageMeta({
  middleware: 'auth-admin'
})

useHead({
  title: 'Parámetros del Sistema - Admin',
  meta: [
    { name: 'description', content: 'Configuración de parámetros del sistema de empeños' }
  ]
})

// Estado reactivo
const guardando = ref(false)
const parametrosCambiados = ref(new Set())
const parametrosOriginales = ref({})

// Parámetros del sistema con valores por defecto
const parametros = reactive({
  // Avalúo y Préstamo
  MONTO_MINIMO_PRESTAMO: 500,
  MONTO_MAXIMO_PRESTAMO: 50000,
  PORCENTAJE_MINIMO_AVALUO: 25,
  PORCENTAJE_MAXIMO_AVALUO: 85,
  PORCENTAJE_RECOMENDADO_AVALUO: 60,
  
  // Plazos
  PLAZO_MINIMO_MESES: 1,
  PLAZO_MAXIMO_MESES: 6,
  
  // Tasas de Interés
  TASA_INTERES_MENSUAL: 8.0,
  TASA_INTERES_QUINCENAL: 4.5,
  TASA_INTERES_SEMANAL: 2.5,
  
  // Comisiones
  COMISION_APERTURA: 2.0,
  COMISION_RENOVACION: 1.5,
  
  // Límites
  LIMITE_PRESTAMOS_ACTIVOS: 5,
  LIMITE_SOLICITUDES_PENDIENTES: 3,
  DIAS_GRACIA_MORA: 5,
  DIAS_TRANSFER_ECOMMERCE: 90
})

// Notificaciones
const notificacion = reactive({
  mostrar: false,
  tipo: 'success', // 'success', 'error', 'warning'
  mensaje: ''
})

// Funciones
const cargarParametros = async () => {
  try {
    // Aquí harías la llamada a tu API
    const response = await $fetch('/api/admin/parametros')
    
    // Guardar valores originales
    parametrosOriginales.value = { ...response.data }
    
    // Actualizar valores reactivos
    Object.assign(parametros, response.data)
    
    // Limpiar cambios pendientes
    parametrosCambiados.value.clear()
    
  } catch (error) {
    mostrarNotificacion('error', 'Error al cargar los parámetros del sistema')
    console.error('Error cargando parámetros:', error)
  }
}

const marcarCambio = (nombreParametro) => {
  parametrosCambiados.value.add(nombreParametro)
}

const revertirCambio = (nombreParametro) => {
  parametros[nombreParametro] = parametrosOriginales.value[nombreParametro]
  parametrosCambiados.value.delete(nombreParametro)
}

const revertirTodosCambios = () => {
  parametrosCambiados.value.forEach(param => {
    parametros[param] = parametrosOriginales.value[param]
  })
  parametrosCambiados.value.clear()
  mostrarNotificacion('success', 'Todos los cambios han sido revertidos')
}

const guardarTodosParametros = async () => {
  if (parametrosCambiados.value.size === 0) {
    mostrarNotificacion('warning', 'No hay cambios pendientes para guardar')
    return
  }

  guardando.value = true
  
  try {
    // Validar parámetros antes de guardar
    if (!validarParametros()) {
      return
    }

    // Aquí harías la llamada a tu API
    const cambios = {}
    parametrosCambiados.value.forEach(param => {
      cambios[param] = parametros[param]
    })

    const response = await $fetch('/api/admin/parametros', {
      method: 'PUT',
      body: cambios
    })

    // Actualizar valores originales
    parametrosOriginales.value = { ...parametros }
    parametrosCambiados.value.clear()

    mostrarNotificacion('success', `${Object.keys(cambios).length} parámetros guardados correctamente`)

  } catch (error) {
    mostrarNotificacion('error', 'Error al guardar los parámetros')
    console.error('Error guardando parámetros:', error)
  } finally {
    guardando.value = false
  }
}

const validarParametros = () => {
  // Validaciones básicas
  if (parametros.MONTO_MINIMO_PRESTAMO >= parametros.MONTO_MAXIMO_PRESTAMO) {
    mostrarNotificacion('error', 'El monto mínimo debe ser menor al monto máximo')
    return false
  }

  if (parametros.PORCENTAJE_MINIMO_AVALUO >= parametros.PORCENTAJE_MAXIMO_AVALUO) {
    mostrarNotificacion('error', 'El porcentaje mínimo debe ser menor al máximo')
    return false
  }

  if (parametros.PLAZO_MINIMO_MESES >= parametros.PLAZO_MAXIMO_MESES) {
    mostrarNotificacion('error', 'El plazo mínimo debe ser menor al máximo')
    return false
  }

  const recomendado = parametros.PORCENTAJE_RECOMENDADO_AVALUO
  const minimo = parametros.PORCENTAJE_MINIMO_AVALUO
  const maximo = parametros.PORCENTAJE_MAXIMO_AVALUO

  if (recomendado < minimo || recomendado > maximo) {
    mostrarNotificacion('error', 'El porcentaje recomendado debe estar entre el mínimo y máximo')
    return false
  }

  return true
}

const obtenerNombreParametro = (param) => {
  const nombres = {
    'MONTO_MINIMO_PRESTAMO': 'Monto Mínimo de Préstamo',
    'MONTO_MAXIMO_PRESTAMO': 'Monto Máximo de Préstamo',
    'PORCENTAJE_MINIMO_AVALUO': 'Porcentaje Mínimo de Avalúo',
    'PORCENTAJE_MAXIMO_AVALUO': 'Porcentaje Máximo de Avalúo',
    'PORCENTAJE_RECOMENDADO_AVALUO': 'Porcentaje Recomendado de Avalúo',
    'PLAZO_MINIMO_MESES': 'Plazo Mínimo',
    'PLAZO_MAXIMO_MESES': 'Plazo Máximo',
    'TASA_INTERES_MENSUAL': 'Tasa de Interés Mensual',
    'TASA_INTERES_QUINCENAL': 'Tasa de Interés Quincenal',
    'TASA_INTERES_SEMANAL': 'Tasa de Interés Semanal',
    'COMISION_APERTURA': 'Comisión de Apertura',
    'COMISION_RENOVACION': 'Comisión de Renovación',
    'LIMITE_PRESTAMOS_ACTIVOS': 'Límite de Préstamos Activos',
    'LIMITE_SOLICITUDES_PENDIENTES': 'Límite de Solicitudes Pendientes',
    'DIAS_GRACIA_MORA': 'Días de Gracia para Mora',
    'DIAS_TRANSFER_ECOMMERCE': 'Días para Transferir a E-commerce'
  }
  return nombres[param] || param
}

const formatearValor = (param, valor) => {
  if (param.includes('MONTO')) {
    return `Q${valor.toLocaleString()}`
  } else if (param.includes('PORCENTAJE') || param.includes('TASA') || param.includes('COMISION')) {
    return `${valor}%`
  } else if (param.includes('DIAS') || param.includes('MESES')) {
    return `${valor} ${param.includes('MESES') ? 'meses' : 'días'}`
  } else if (param.includes('LIMITE')) {
    return `${valor} ${param.includes('PRESTAMOS') ? 'préstamos' : 'solicitudes'}`
  }
  return valor
}

const mostrarNotificacion = (tipo, mensaje) => {
  notificacion.mostrar = true
  notificacion.tipo = tipo
  notificacion.mensaje = mensaje
  
  setTimeout(() => {
    notificacion.mostrar = false
  }, 5000)
}

// Lifecycle
onMounted(() => {
  cargarParametros()
})
</script>

<style scoped>
/* Paleta de colores exacta del proyecto */
.parametros-sistema-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A4A4A 50%, #1A1A1A 100%);
  padding: 2rem 0;
}

.parametros-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Navegación */
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
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
  text-decoration: none;
}

.btn-back:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
  transform: translateY(-2px);
}

/* Header */
.parametros-header {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-bottom: 3rem;
  overflow: hidden;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.5rem;
}

.header-info h1 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.75rem;
  font-weight: bold;
  color: #2C3E50;
}

.header-info p {
  margin: 0;
  color: #6c757d;
  font-size: 1rem;
}

.header-actions .btn-guardar {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: #1A1A1A;
  border: none;
  padding: 0.875rem 1.75rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 8px 25px rgba(212, 175, 55, 0.3);
}

.btn-guardar:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 12px 35px rgba(212, 175, 55, 0.5);
}

.btn-guardar:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* Contenido principal */
.parametros-content {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: 2rem;
  align-items: start;
}

.parametros-sections {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.parametros-section {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.section-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 2rem;
}

.section-header h2 {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.section-header p {
  margin: 0;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
}

.params-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
}

.param-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.param-card label {
  font-weight: 600;
  color: #2C3E50;
  font-size: 0.9rem;
}

.input-group {
  position: relative;
  display: flex;
  align-items: center;
}

.input-prefix,
.input-suffix {
  position: absolute;
  background: #f8f9fa;
  color: #6c757d;
  padding: 0 0.75rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 2px solid #e9ecef;
  z-index: 2;
}

.input-prefix {
  left: 0;
  border-radius: 10px 0 0 10px;
  border-right: none;
}

.input-suffix {
  right: 0;
  border-radius: 0 10px 10px 0;
  border-left: none;
}

.param-input {
  width: 100%;
  padding: 0.875rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 500;
  transition: all 0.3s ease;
  background: #fafbfc;
}

.input-group .param-input {
  padding-left: 3rem;
  padding-right: 3rem;
}

.param-input:focus {
  outline: none;
  border-color: #D4AF37;
  background: white;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.input-group:has(.param-input:focus) .input-prefix,
.input-group:has(.param-input:focus) .input-suffix {
  border-color: #D4AF37;
  background: #D4AF37;
  color: white;
}

.param-card small {
  color: #6c757d;
  font-size: 0.8rem;
  line-height: 1.4;
}

/* Panel de cambios */
.cambios-panel {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 2rem;
  max-height: 80vh;
  overflow-y: auto;
}

.cambios-header {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: #1A1A1A;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cambios-header h3 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin: 0;
  font-size: 1rem;
  font-weight: 600;
}

.cambios-count {
  background: rgba(26, 26, 26, 0.2);
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 500;
}

.cambios-lista {
  max-height: 400px;
  overflow-y: auto;
}

.cambio-item {
  display: flex;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #f1f3f4;
  gap: 1rem;
}

.cambio-item:last-child {
  border-bottom: none;
}

.cambio-nombre {
  flex: 1;
  font-size: 0.85rem;
  color: #2C3E50;
  font-weight: 500;
}

.cambio-valor {
  color: #D4AF37;
  font-weight: 600;
  font-size: 0.85rem;
}

.btn-revertir {
  background: none;
  border: 1px solid #e9ecef;
  color: #6c757d;
  padding: 0.375rem;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-revertir:hover {
  background: #f8f9fa;
  border-color: #dee2e6;
  color: #495057;
}

.cambios-acciones {
  padding: 1.5rem;
  display: flex;
  gap: 1rem;
  border-top: 1px solid #f1f3f4;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  border: none;
}

.btn-primary {
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  color: #1A1A1A;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
}

.btn-secondary {
  background: #f8f9fa;
  color: #6c757d;
  border: 1px solid #e9ecef;
}

.btn-secondary:hover {
  background: #e9ecef;
  color: #495057;
}

.btn-primary:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none !important;
}

/* Animaciones */
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Notificaciones Toast */
.notification-toast {
  position: fixed;
  top: 2rem;
  right: 2rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  border-radius: 10px;
  color: white;
  font-weight: 500;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.2);
  z-index: 1000;
  animation: slideIn 0.3s ease-out;
}

.notification-toast.success {
  background: linear-gradient(45deg, #28a745, #20c997);
}

.notification-toast.error {
  background: linear-gradient(45deg, #dc3545, #e74c3c);
}

.notification-toast.warning {
  background: linear-gradient(45deg, #ffc107, #f39c12);
  color: #1A1A1A;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Responsive */
@media (max-width: 1200px) {
  .parametros-content {
    grid-template-columns: 1fr;
  }
  
  .cambios-panel {
    position: relative;
    top: 0;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .parametros-container {
    padding: 0 1rem;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1.5rem;
    text-align: center;
    padding: 2rem;
  }
  
  .params-grid {
    grid-template-columns: 1fr;
    padding: 1.5rem;
  }
  
  .section-header {
    padding: 1.5rem;
  }
  
  .notification-toast {
    top: 1rem;
    right: 1rem;
    left: 1rem;
    margin: 0;
  }
}

@media (max-width: 480px) {
  .cambios-acciones {
    flex-direction: column;
  }
  
  .header-info h1 {
    font-size: 1.5rem;
  }
}
</style>