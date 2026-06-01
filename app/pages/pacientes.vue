<script setup lang="ts">
definePageMeta({
  middleware: 'auth',
  layout: 'dashboard',
})
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold">
      Pacientes
    </h1>
    <p class="mt-2 text-muted">
      Página protegida — el flujo de autenticación funciona correctamente.
    </p>
  </div>
</template>
