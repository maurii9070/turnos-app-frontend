<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Doctor'],
  layout: 'dashboard',
})
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold">
      Doctores
    </h1>
    <p class="mt-2 text-muted">
      Página protegida para doctores — el control de roles funciona correctamente.
    </p>
  </div>
</template>
