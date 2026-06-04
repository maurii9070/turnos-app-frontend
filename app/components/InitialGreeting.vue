<script setup lang="ts">
const { user } = useUsers()

const greeting = computed(() => {
  if (!user.value)
    return 'Bienvenido'
  const hour = new Date().getHours()
  if (hour < 12)
    return 'Buenos días'
  if (hour < 18)
    return 'Buenas tardes'
  return 'Buenas noches'
})
</script>

<template>
  <div>
    <h1 class="text-2xl font-semibold">
      {{ greeting }}, {{ user?.firstName || 'Usuario' }}
    </h1>
    <p class="mt-1 text-muted">
      Este es tu panel de control.
    </p>
  </div>
</template>
