<template>
  <div class="homepage">
    <!-- Header -->
    <header class="header">
      <nav class="nav-container">
        <div class="logo">
          <h2>Freddy Fasbear</h2>
        </div>
        
        <ul class="nav-menu" v-if="!isMobile">
          <li><NuxtLink to="/">Inicio</NuxtLink></li>
          <li><NuxtLink to="/servicios">Servicios</NuxtLink></li>
          <li><NuxtLink to="/nosotros">Nosotros</NuxtLink></li>
          <li><NuxtLink to="/contacto">Contacto</NuxtLink></li>
          <li><NuxtLink to="/login" class="btn-login">Iniciar Sesión</NuxtLink></li>
        </ul>
        
        <button v-if="isMobile" class="mobile-menu-btn" @click="toggleMobileMenu">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>
      
      <div class="mobile-menu" v-if="isMobile && mobileMenuOpen">
        <NuxtLink to="/" @click="closeMobileMenu">Inicio</NuxtLink>
        <NuxtLink to="/servicios" @click="closeMobileMenu">Servicios</NuxtLink>
        <NuxtLink to="/nosotros" @click="closeMobileMenu">Nosotros</NuxtLink>
        <NuxtLink to="/contacto" @click="closeMobileMenu">Contacto</NuxtLink>
        <NuxtLink to="/login" @click="closeMobileMenu">Iniciar Sesión</NuxtLink>
      </div>
    </header>

    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          Empeña y Compra con <span class="highlight">Confianza</span>
        </h1>
        <p class="hero-subtitle">
          Más de 10 años ofreciendo servicios de empeño transparentes y justos. 
          Tu patrimonio en las mejores manos.
        </p>
        <div class="hero-buttons">
          <NuxtLink to="/servicios" class="btn btn-primary">Ver Servicios</NuxtLink>
          <NuxtLink to="/contacto" class="btn btn-secondary">Contactanos</NuxtLink>
        </div>
      </div>
      
      <div class="hero-image">
        <div class="hero-placeholder">
          <h3>🏪</h3>
          <p>Tu casa de empeño de confianza</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="features">
      <div class="container">
        <h2 class="section-title">¿Por qué elegir Freddy Fasbear?</h2>
        <div class="features-grid">
          <div class="feature-card" v-for="feature in features" :key="feature.id">
            <div class="feature-icon">{{ feature.icon }}</div>
            <h3>{{ feature.title }}</h3>
            <p>{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Services Preview -->
    <section class="services-preview">
      <div class="container">
        <h2 class="section-title">Nuestros Servicios</h2>
        <div class="services-grid">
          <div class="service-card">
            <h3>💰 Empeño de Joyas</h3>
            <p>Evaluación profesional de oro, plata y piedras preciosas</p>
          </div>
          <div class="service-card">
            <h3>📱 Empeño de Electrónicos</h3>
            <p>Celulares, laptops, tablets y más tecnología</p>
          </div>
          <div class="service-card">
            <h3>🚗 Empeño de Vehículos</h3>
            <p>Autos, motos y vehículos comerciales</p>
          </div>
          <div class="service-card">
            <h3>🛍️ Compra y Venta</h3>
            <p>Artículos usados en excelente estado</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <div class="container">
        <div class="footer-content">
          <div class="footer-section">
            <h3>Freddy Fasbear Industries</h3>
            <p>Tu casa de empeño de confianza desde 2014</p>
          </div>
          <div class="footer-section">
            <h4>Contacto</h4>
            <p>📞 +502 1234-5678</p>
            <p>📧 info@freddyfasbear.com</p>
            <p>📍 Guatemala City, Guatemala</p>
          </div>
          <div class="footer-section">
            <h4>Horarios</h4>
            <p>Lun - Vie: 8:00 AM - 6:00 PM</p>
            <p>Sábados: 8:00 AM - 4:00 PM</p>
            <p>Domingos: Cerrado</p>
          </div>
        </div>
        <div class="footer-bottom">
          <p>&copy; 2024 Freddy Fasbear Industries. Todos los derechos reservados.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup>
useHead({
  title: 'Inicio',
  meta: [
    { name: 'description', content: 'Casa de empeño profesional en Guatemala' }
  ]
})

const isMobile = ref(false)
const mobileMenuOpen = ref(false)

const features = ref([
  {
    id: 1,
    icon: '💎',
    title: 'Evaluación Profesional',
    description: 'Expertos certificados evalúan tus artículos con total transparencia.'
  },
  {
    id: 2,
    icon: '🔒',
    title: 'Máxima Seguridad',
    description: 'Instalaciones con sistemas de seguridad de última generación.'
  },
  {
    id: 3,
    icon: '⚡',
    title: 'Proceso Rápido',
    description: 'Evaluación y aprobación en minutos. Obtén tu dinero al instante.'
  },
  {
    id: 4,
    icon: '💰',
    title: 'Mejores Precios',
    description: 'Ofrecemos las tasas más competitivas del mercado guatemalteco.'
  },
  {
    id: 5,
    icon: '📋',
    title: 'Sin Buró de Crédito',
    description: 'No verificamos tu historial crediticio. Solo necesitas tu artículo.'
  },
  {
    id: 6,
    icon: '👥',
    title: 'Confianza Total',
    description: 'Más de una década brindando servicios con transparencia.'
  }
])

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}

const closeMobileMenu = () => {
  mobileMenuOpen.value = false
}

const checkMobile = () => {
  if (process.client) {
    isMobile.value = window.innerWidth <= 768
  }
}

onMounted(() => {
  checkMobile()
  if (process.client) {
    window.addEventListener('resize', checkMobile)
  }
})

onUnmounted(() => {
  if (process.client) {
    window.removeEventListener('resize', checkMobile)
  }
})
</script>

<style scoped>
.homepage {
  overflow-x: hidden;
}

/* Header */
.header {
  background: linear-gradient(135deg, #2C3E50 0%, #1A1A1A 100%);
  padding: 1rem 0;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 1000;
  border-bottom: 1px solid rgba(212, 175, 55, 0.3);
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
}

.logo h2 {
  color: #D4AF37;
  font-weight: bold;
  font-size: 1.8rem;
}

.nav-menu {
  display: flex;
  list-style: none;
  gap: 2rem;
  align-items: center;
}

.nav-menu a {
  color: #F5F5F5;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.nav-menu a:hover {
  color: #D4AF37;
}

.btn-login {
  background: #D4AF37 !important;
  padding: 0.5rem 1rem !important;
  border-radius: 5px !important;
  color: white !important;
}

.btn-login:hover {
  background: #B8941F !important;
}

/* Mobile Menu */
.mobile-menu-btn {
  display: flex;
  flex-direction: column;
  background: none;
  border: none;
  cursor: pointer;
  padding: 5px;
}

.mobile-menu-btn span {
  width: 25px;
  height: 3px;
  background: #F5F5F5;
  margin: 3px 0;
  transition: 0.3s;
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #2C3E50;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.mobile-menu a {
  color: #F5F5F5;
  text-decoration: none;
  padding: 0.5rem;
  border-bottom: 1px solid rgba(245, 245, 245, 0.1);
}

/* Hero Section */
.hero {
  background: linear-gradient(135deg, #2C3E50 0%, #4A6741 100%);
  color: white;
  padding: 120px 2rem 80px;
  display: flex;
  align-items: center;
  min-height: 100vh;
  max-width: 1200px;
  margin: 0 auto;
  gap: 2rem;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: 3.5rem;
  font-weight: bold;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.highlight {
  color: #D4AF37;
}

.hero-subtitle {
  font-size: 1.2rem;
  margin-bottom: 2rem;
  opacity: 0.9;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #D4AF37;
  color: white;
}

.btn-primary:hover {
  background-color: #B8941F;
  transform: translateY(-2px);
}

.btn-secondary {
  background-color: transparent;
  color: white;
  border: 2px solid #D4AF37;
}

.btn-secondary:hover {
  background-color: #D4AF37;
  color: #1A1A1A;
}

.hero-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-placeholder {
  background: rgba(255, 255, 255, 0.1);
  padding: 3rem;
  border-radius: 15px;
  text-align: center;
  backdrop-filter: blur(10px);
}

.hero-placeholder h3 {
  font-size: 4rem;
  margin-bottom: 1rem;
}

/* Features Section */
.features {
  padding: 80px 2rem;
  background: #F5F5F5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1rem;
}

.section-title {
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 3rem;
  color: #2C3E50;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.feature-card:hover {
  transform: translateY(-5px);
}

.feature-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
}

.feature-card h3 {
  color: #2C3E50;
  margin-bottom: 1rem;
}

/* Services Preview */
.services-preview {
  padding: 80px 2rem;
  background: white;
}

.services-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.service-card {
  background: #F8F9FA;
  padding: 1.5rem;
  border-radius: 10px;
  border-left: 4px solid #D4AF37;
}

.service-card h3 {
  color: #2C3E50;
  margin-bottom: 0.5rem;
}

/* Footer */
.footer {
  background: #2C3E50;
  color: white;
  padding: 40px 2rem 20px;
}

.footer-content {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.footer-section h3,
.footer-section h4 {
  color: #D4AF37;
  margin-bottom: 1rem;
}

.footer-bottom {
  text-align: center;
  padding-top: 2rem;
  border-top: 1px solid rgba(245, 245, 245, 0.1);
}

/* Responsive */
@media (max-width: 768px) {
  .hero {
    flex-direction: column;
    text-align: center;
    padding: 100px 1rem 60px;
  }
  
  .hero-title {
    font-size: 2.5rem;
  }
  
  .features-grid,
  .services-grid {
    grid-template-columns: 1fr;
  }
  
  .hero-buttons {
    justify-content: center;
  }
}
</style>