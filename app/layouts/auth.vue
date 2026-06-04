<script setup lang="ts">
const route = useRoute()

const profileRoutesPaths = ['/perfil/editar', '/perfil/cambiar-password']

const shouldShowBackButton = computed(() => !profileRoutesPaths.includes(route.path))
</script>

<template>
  <div class="h-screen flex items-center justify-center px-4">
    <UButton
      v-if="shouldShowBackButton"
      icon="i-lucide-chevron-left"
      to="/"
      size="xl"
      color="neutral"
      variant="subtle"
      class="absolute left-8 top-8 rounded-full z-10"
    />

    <UPageCard
      variant="subtle"
      class="max-w-sm w-full"
    >
      <slot />
    </UPageCard>
  </div>
</template>
