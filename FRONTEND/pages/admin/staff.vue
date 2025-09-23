<template>
  <div>
    <!-- Componente de administración de personal -->
    <AdministracionPersonal />
  </div>
</template>

<script setup>
// Middleware de autenticación y autorización
definePageMeta({
  middleware: ['auth', 'admin'],
  layout: 'admin'
})

// Título de la página
useHead({
  title: 'Personal Interno - Freddy Fasbear Industries'
})

// Importar el componente
import AdministracionPersonal from '~/components/admin/AdministracionPersonal.vue'
</script>