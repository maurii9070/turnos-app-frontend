<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Doctor'],
  layout: 'dashboard',
})
</script>

<template>
  <div>
    <InitialGreeting />
  </div>
</template>
