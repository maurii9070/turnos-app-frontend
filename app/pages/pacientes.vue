<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})
</script>

<template>
  <div>
    <InitialGreeting />
  </div>
</template>
