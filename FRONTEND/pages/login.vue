<template>
  <div class="login-page">
    <div class="login-container">
      <!-- Logo y encabezado -->
      <div class="login-header">
        <h1 class="logo-text">Freddy Fasbear</h1>
        <p class="subtitle">Sistema de Empeño</p>
      </div>

      <!-- Formulario de login -->
      <form @submit.prevent="handleLogin" class="login-form">
        <h2>Iniciar Sesión</h2>
        
        <!-- Alert de error -->
        <div v-if="error" class="alert alert-error">
          {{ error }}
        </div>

        <!-- Email -->
        <div class="form-group">
          <label for="email" class="form-label">Correo Electrónico</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            class="form-control"
            placeholder="tu@email.com"
            required
            :disabled="loading"
          />
        </div>

        <!-- Password -->
        <div class="form-group">
          <label for="password" class="form-label">Contraseña</label>
          <input
            id="password"
            v-model="form.password"
            type="password"
            class="form-control"
            placeholder="••••••••"
            required
            :disabled="loading"
          />
        </div>

        <!-- Remember me -->
        <div class="form-group">
          <label class="checkbox-label">
            <input
              v-model="form.remember"
              type="checkbox"
              :disabled="loading"
            />
            <span class="checkmark"></span>
            Recordarme
          </label>
        </div>

        <!-- Submit button -->
        <button
          type="submit"
          class="btn btn-primary btn-login"
          :disabled="loading"
        >
          <span v-if="loading" class="loading"></span>
          {{ loading ? 'Iniciando sesión...' : 'Iniciar Sesión' }}
        </button>

        <!-- Links adicionales -->
        <div class="login-links">
          <NuxtLink to="/forgot-password" class="forgot-link">
            ¿Olvidaste tu contraseña?
          </NuxtLink>
        </div>
      </form>

      <!-- Footer del login -->
      <div class="login-footer">
        <p>¿No tienes cuenta? <NuxtLink to="/register">Regístrate aquí</NuxtLink></p>
        <NuxtLink to="/" class="back-home">← Volver al inicio</NuxtLink>
      </div>
    </div>
  </div>
</template>

<script setup>
// Meta tags para la página
useHead({
  title: 'Iniciar Sesión',
  meta: [
    { name: 'description', content: 'Accede a tu cuenta en Freddy Fasbear Industries' }
  ]
})

// Datos reactivos
const form = ref({
  email: '',
  password: '',
  remember: false
})

const loading = ref(false)
const error = ref('')

// Acceso a plugins
const { $api } = useNuxtApp()

// Método para manejar el login
const handleLogin = async () => {
  error.value = ''
  loading.value = true

  try {
    // Validaciones básicas
    if (!form.value.email || !form.value.password) {
      throw new Error('Por favor completa todos los campos')
    }

    // Simular llamada a la API
    console.log('Intentando login con:', {
      email: form.value.email,
      remember: form.value.remember
    })

    // Aquí harías la llamada real a tu API
    /*
    const response = await $api.post('/auth/login', {
      email: form.value.email,
      password: form.value.password,
      remember: form.value.remember
    })
    
    // Guardar token y redirigir
    if (response.token) {
      // Guardar token en cookie/localStorage
      await navigateTo('/dashboard')
    }
    */

    // Simulación temporal
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Por ahora, simplemente mostrar éxito
    alert('Login exitoso! (simulado)')
    await navigateTo('/')

  } catch (err) {
    error.value = err.message || 'Error al iniciar sesión'
  } finally {
    loading.value = false
  }
}

// Limpiar error cuando el usuario empiece a escribir
watch([() => form.value.email, () => form.value.password], () => {
  if (error.value) {
    error.value = ''
  }
})
</script>

<style scoped>
.login-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #2C3E50 0%, #4A6741 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
}

.login-container {
  background: white;
  border-radius: 10px;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  width: 100%;
  max-width: 400px;
}

.login-header {
  background: linear-gradient(135deg, #2C3E50, #1A252F);
  color: white;
  text-align: center;
  padding: 2rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: bold;
  color: #D4AF37;
  margin-bottom: 0.5rem;
}

.subtitle {
  color: #ccc;
  margin: 0;
}

.login-form {
  padding: 2rem;
}

.login-form h2 {
  text-align: center;
  color: #2C3E50;
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-control {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e1e5e9;
  border-radius: 5px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-control:focus {
  outline: none;
  border-color: #D4AF37;
  box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
}

.form-control:disabled {
  background-color: #f8f9fa;
  cursor: not-allowed;
}

.checkbox-label {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.checkbox-label input[type="checkbox"] {
  margin-right: 0.5rem;
}

.btn-login {
  width: 100%;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 5px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.btn-login:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-links {
  text-align: center;
  margin-top: 1rem;
}

.forgot-link {
  color: #6c757d;
  font-size: 0.9rem;
  text-decoration: none;
}

.forgot-link:hover {
  color: #D4AF37;
  text-decoration: underline;
}

.login-footer {
  background: #f8f9fa;
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid #e9ecef;
}

.login-footer p {
  margin-bottom: 1rem;
  color: #6c757d;
}

.login-footer a {
  color: #D4AF37;
  text-decoration: none;
  font-weight: 500;
}

.login-footer a:hover {
  text-decoration: underline;
}

.back-home {
  display: inline-block;
  color: #6c757d !important;
  font-size: 0.9rem;
}

.back-home:hover {
  color: #2C3E50 !important;
}

.alert {
  padding: 0.75rem;
  border-radius: 5px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.alert-error {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.loading {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 1s ease-in-out infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 480px) {
  .login-page {
    padding: 1rem 0.5rem;
  }
  
  .login-container {
    margin: 0;
  }
  
  .login-header,
  .login-form {
    padding: 1.5rem;
  }
  
  .logo-text {
    font-size: 1.5rem;
  }
}
</style>