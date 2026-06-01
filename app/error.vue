<script setup lang="ts">
defineProps({
  error: {
    type: Object as () => { statusCode: number, statusMessage?: string, message?: string },
    required: true,
  },
})

const handleError = () => clearError({ redirect: '/' })
</script>

<template>
  <div class="flex min-h-dvh items-center justify-center p-4">
    <div class="text-center">
      <p class="text-6xl font-bold text-default">
        {{ error.statusCode }}
      </p>
      <p class="mt-2 text-lg text-muted">
        {{ error.statusMessage || 'Página no encontrada' }}
      </p>
      <UButton class="mt-6" @click="handleError">
        Volver al inicio
      </UButton>
    </div>
  </div>
</template>
