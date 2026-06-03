<script setup lang="ts">
import { useUsers } from '~/composables/useUsers'

const { user, isProfileLoaded, fetchProfile } = useUsers()
const { logout } = useAuth()
const router = useRouter()

onMounted(async () => {
  if (!isProfileLoaded.value) {
    await fetchProfile()
  }
})

watch([isProfileLoaded, user], ([loaded, u]) => {
  if (loaded && u?.mustChangePassword && router.currentRoute.value.path !== '/perfil/cambiar-password') {
    router.replace('/perfil/cambiar-password')
  }
}, { immediate: true })

async function handleLogout() {
  await logout()
  await navigateTo('/login')
}
</script>

<template>
  <div class="min-h-dvh flex flex-col">
    <header class="sticky top-0 z-50 border-b border-muted bg-elevated/80 backdrop-blur md:hidden">
      <div class="flex h-16 items-center justify-between px-4">
        <NuxtLink to="/">
          <AppLogo class="w-auto h-5" />
        </NuxtLink>

        <UserMenuDropdown
          v-if="isProfileLoaded && user"
          trigger="avatar"
          @logout="handleLogout"
        />
      </div>
    </header>

    <div class="flex flex-1">
      <aside class="hidden md:flex w-64 flex-col border-r border-muted bg-elevated/50">
        <div class="flex flex-col items-center p-6 text-center">
          <UAvatar
            :alt="user ? `${user.firstName} ${user.lastName}` : 'Usuario'"
            size="xl"
            :ui="{ fallback: 'text-foreground font-semibold bg-primary/10' }"
            class="mb-3"
          />

          <template v-if="user">
            <p class="font-semibold text-foreground">
              {{ user.firstName }} {{ user.lastName }}
            </p>
            <p class="mt-0.5 text-sm text-muted">
              {{ user.email || 'Sin email' }}
            </p>
            <RoleBadge :role="user.role" class="mt-2" />
          </template>
        </div>

        <nav class="flex-1 space-y-1 px-3 pb-6">
          <UButton
            icon="i-lucide-user-pen"
            label="Editar perfil"
            color="neutral"
            variant="ghost"
            block
            class="justify-start"
            to="/perfil/editar"
          />

          <UButton
            icon="i-lucide-key"
            label="Cambiar contraseña"
            color="neutral"
            variant="ghost"
            block
            class="justify-start"
            to="/perfil/cambiar-password"
          />

          <div class="pt-4">
            <USeparator />
          </div>

          <UButton
            icon="i-lucide-log-out"
            label="Cerrar sesión"
            color="error"
            variant="ghost"
            block
            class="justify-start"
            @click="handleLogout"
          />
        </nav>
      </aside>

      <main class="flex-1 bg-muted/30">
        <div class="p-6">
          <slot />
        </div>
      </main>
    </div>
  </div>
</template>
