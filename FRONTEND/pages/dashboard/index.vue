<template>
  <div class="dashboard">
    <!-- Header del dashboard -->
    <header class="dashboard-header">
      <div class="header-container">
        <div class="header-left">
          <NuxtLink to="/" class="logo">
            <!-- Opción 1: Si tienes el logo en public/ -->
            <img src="~/assets/images/logo.png" alt="Fredy Fasbear Logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <!-- Fallback con ícono SVG si no encuentra la imagen -->
            <div class="logo-fallback" style="display: none;">
              <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
                <circle cx="50" cy="50" r="45" fill="#D4AF37" stroke="#1A1A1A" stroke-width="3"/>
                <circle cx="35" cy="35" r="8" fill="#1A1A1A"/>
                <circle cx="65" cy="35" r="8" fill="#1A1A1A"/>
                <path d="M35 65 Q50 75 65 65" stroke="#1A1A1A" stroke-width="3" fill="none"/>
                <rect x="45" y="15" width="10" height="15" fill="#1A1A1A" rx="5"/>
              </svg>
            </div>
            <h1>Fredy Fasbear</h1>
          </NuxtLink>
        </div>
        
        <div class="header-right">
          <div class="user-info">
            <!-- Mostrar nombre completo del usuario logueado -->
            <span class="welcome-text">
              Bienvenido, {{ user?.nombre }} {{ user?.apellido || '' }}
            </span>
            <div class="user-avatar">
              <!-- Mostrar iniciales del usuario -->
              <span class="user-initials">
                {{ getUserInitials() }}
              </span>
            </div>
          </div>
          <button @click="handleLogout" class="logout-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M9 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" stroke-width="2"/>
              <polyline points="16,17 21,12 16,7" stroke="currentColor" stroke-width="2"/>
              <line x1="21" y1="12" x2="9" y2="12" stroke="currentColor" stroke-width="2"/>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido principal -->
    <main class="dashboard-main">
      <div class="container">
        <!-- Tarjetas de resumen -->
        <section class="summary-cards">
          <div class="card">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Préstamos Activos</h3>
              <p class="card-number">0</p>
              <span class="card-subtitle">En proceso</span>
            </div>
          </div>

          <div class="card">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Compras Realizadas</h3>
              <p class="card-number">0</p>
              <span class="card-subtitle">En la tienda</span>
            </div>
          </div>

          <div class="card">
            <div class="card-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" stroke-width="2"/>
                <line x1="7" y1="8" x2="17" y2="8" stroke="currentColor" stroke-width="2"/>
                <line x1="7" y1="12" x2="13" y2="12" stroke="currentColor" stroke-width="2"/>
              </svg>
            </div>
            <div class="card-content">
              <h3>Documentos</h3>
              <p class="card-number">1</p>
              <span class="card-subtitle">Perfil completo</span>
            </div>
          </div>
        </section>

        <!-- Acciones rápidas -->
        <section class="quick-actions">
          <h2>Acciones Rápidas</h2>
          <div class="actions-grid">
            <NuxtLink to="/empeno" class="action-card">
              <div class="action-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 17L12 22L22 17" stroke="currentColor" stroke-width="2"/>
                  <path d="M2 12L12 17L22 12" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3>Solicitar Préstamo</h3>
              <p>Empeña tus artículos y obtén dinero al instante</p>
            </NuxtLink>

            <NuxtLink to="/tienda" class="action-card">
              <div class="action-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M3 3H5L5.4 5M7 13H17L21 5H5.4M7 13L5.4 5M7 13L4.7 15.3C4.3 15.7 4.6 16.5 5.1 16.5H17M17 13V19C17 19.6 16.6 20 16 20H8C7.4 20 7 19.6 7 19V13" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3>Visitar Tienda</h3>
              <p>Encuentra artículos únicos a precios accesibles</p>
            </NuxtLink>

            <NuxtLink to="/profile" class="action-card">
              <div class="action-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                  <path d="M20 21V19C20 17.9 19.1 17 18 17H6C4.9 17 4 17.9 4 19V21" stroke="currentColor" stroke-width="2"/>
                  <circle cx="12" cy="7" r="4" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <h3>Mi Perfil</h3>
              <p>Actualiza tu información personal</p>
            </NuxtLink>
          </div>
        </section>

        <!-- Historial reciente -->
        <section class="recent-activity">
          <h2>Actividad Reciente</h2>
          <div class="activity-list">
            <div class="activity-item welcome-item">
              <div class="activity-icon">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M22 11.08V12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C13.6569 2 15.1569 2.5 16.3856 3.35814" stroke="currentColor" stroke-width="2"/>
                  <path d="M22 4L12 14.01L9 11.01" stroke="currentColor" stroke-width="2"/>
                </svg>
              </div>
              <div class="activity-content">
                <h4>¡Bienvenido a Fredy Fasbear Industries, {{ user?.nombre }}!</h4>
                <p>Tu cuenta ha sido creada exitosamente. Explora nuestros servicios.</p>
                <span class="activity-time">Hace unos momentos</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  </div>
</template>

<script setup>
// Proteger la ruta con middleware
definePageMeta({
  middleware: 'auth'
})

// Meta tags
useHead({
  title: 'Dashboard - Mi Cuenta',
  meta: [
    { name: 'description', content: 'Panel de control personal de Fredy Fasbear Industries' }
  ]
})

// Auth composable
const { user, logout } = useAuth()

// Methods
const handleLogout = () => {
  logout()
  navigateTo('/')
}

// Función para obtener las iniciales del usuario
const getUserInitials = () => {
  if (!user.value) return 'U'
  
  const nombre = user.value.nombre || ''
  const apellido = user.value.apellido || ''
  
  const inicialNombre = nombre.charAt(0).toUpperCase()
  const inicialApellido = apellido.charAt(0).toUpperCase()
  
  return `${inicialNombre}${inicialApellido}` || 'U'
}

// Verificar que el usuario esté cargado
onMounted(() => {
  if (!user.value) {
    navigateTo('/login')
  }
})
</script>

<style scoped>
.dashboard {
  min-height: 100vh;
  background: #f8f9fa;
}

/* Header del dashboard */
.dashboard-header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.header-left .logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  text-decoration: none;
  color: inherit;
}

.logo img {
  width: 40px;
  height: 40px;
  object-fit: contain;
}

.logo-fallback {
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo h1 {
  font-size: 1.5rem;
  font-weight: bold;
  color: #D4AF37;
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.welcome-text {
  font-weight: 500;
  color: #F5F5F5;
}

.user-avatar {
  width: 40px;
  height: 40px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  font-size: 0.9rem;
}

.user-initials {
  font-size: 0.9rem;
  font-weight: 600;
}

.logout-btn {
  background: none;
  border: 1px solid rgba(212, 175, 55, 0.5);
  color: #D4AF37;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: rgba(212, 175, 55, 0.1);
  border-color: #D4AF37;
}

/* Main content */
.dashboard-main {
  padding: 2rem 0;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Summary cards */
.summary-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.card {
  background: white;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease;
}

.card:hover {
  transform: translateY(-2px);
}

.card-icon {
  width: 60px;
  height: 60px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.card-content h3 {
  font-size: 0.9rem;
  color: #6c757d;
  margin: 0 0 0.25rem 0;
  font-weight: 500;
}

.card-number {
  font-size: 2rem;
  font-weight: bold;
  color: #2C3E50;
  margin: 0;
}

.card-subtitle {
  font-size: 0.8rem;
  color: #6c757d;
}

/* Quick actions */
.quick-actions {
  margin-bottom: 3rem;
}

.quick-actions h2 {
  color: #2C3E50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.action-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  text-decoration: none;
  color: inherit;
  transition: all 0.3s ease;
  text-align: center;
  border: 2px solid transparent;
}

.action-card:hover {
  transform: translateY(-5px);
  border-color: #D4AF37;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
}

.action-icon {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem auto;
  color: white;
}

.action-card h3 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.action-card p {
  color: #6c757d;
  line-height: 1.5;
}

/* Recent activity */
.recent-activity h2 {
  color: #2C3E50;
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
}

.activity-list {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.activity-item {
  padding: 1.5rem;
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  border-bottom: 1px solid #e9ecef;
}

.activity-item:last-child {
  border-bottom: none;
}

.welcome-item {
  background: linear-gradient(45deg, rgba(212, 175, 55, 0.1), rgba(244, 208, 63, 0.1));
}

.activity-icon {
  width: 48px;
  height: 48px;
  background: linear-gradient(45deg, #D4AF37, #F4D03F);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  flex-shrink: 0;
}

.activity-content h4 {
  color: #2C3E50;
  margin-bottom: 0.25rem;
  font-size: 1rem;
}

.activity-content p {
  color: #6c757d;
  margin-bottom: 0.5rem;
  line-height: 1.4;
}

.activity-time {
  font-size: 0.8rem;
  color: #D4AF37;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .header-container {
    padding: 0 1rem;
  }
  
  .header-right {
    gap: 1rem;
  }
  
  .welcome-text {
    display: none;
  }
  
  .container {
    padding: 0 1rem;
  }
  
  .summary-cards {
    grid-template-columns: 1fr;
  }
  
  .actions-grid {
    grid-template-columns: 1fr;
  }
  
  .action-card {
    padding: 1.5rem;
  }
  
  .action-icon {
    width: 60px;
    height: 60px;
  }
}

@media (max-width: 480px) {
  .dashboard-main {
    padding: 1rem 0;
  }
  
  .card {
    padding: 1rem;
  }
  
  .card-icon {
    width: 50px;
    height: 50px;
  }
  
  .activity-item {
    padding: 1rem;
  }
  
  .activity-icon {
    width: 40px;
    height: 40px;
  }
}
</style>