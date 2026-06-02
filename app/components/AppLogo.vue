<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})
</script>

<template>
  <NuxtLink
    to="/"
    class="flex items-center gap-2 text-foreground hover:opacity-80 transition-opacity"
  >
    <UIcon
      name="i-lucide-stethoscope"
      class="w-6 h-6"
    />
    <span class="font-semibold text-sm sm:text-base">
      Sistema de Turnos
    </span>
  </NuxtLink>
</template>
