<script setup lang="ts">
const { logout } = useAuth()

async function handleLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-dvh">
    <header class="flex items-center justify-between border-b border-muted p-4">
      <span class="font-semibold">Sistema de Turnos</span>
      <UButton
        label="Cerrar sesión"
        color="neutral"
        variant="ghost"
        size="sm"
        @click="handleLogout"
      />
    </header>
    <main class="p-4">
      <slot />
    </main>
  </div>
</template>
