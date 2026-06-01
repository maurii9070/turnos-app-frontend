<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Admin', 'SuperAdmin'],
  layout: 'dashboard',
})
</script>

<template>
  <div>
    <h1 class="text-xl font-semibold">
      Administración
    </h1>
    <p class="mt-2 text-muted">
      Página protegida para administradores — el control de roles funciona correctamente.
    </p>
  </div>
</template>
