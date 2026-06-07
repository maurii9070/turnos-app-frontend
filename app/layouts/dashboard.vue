<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'
import { useUsers } from '~/composables/useUsers'

const { user, isProfileLoaded, fetchProfile } = useUsers()
const { logout } = useAuth()
const router = useRouter()

const open = ref(true)

const items = computed<NavigationMenuItem[]>(() => {
  const navItems: NavigationMenuItem[] = [
    {
      label: 'Inicio',
      icon: 'i-lucide-house',
      to: '/',
    },
  ]

  if (user.value?.role === 'Patient') {
    navItems.push({
      label: 'Mis Turnos',
      icon: 'i-lucide-calendar-check',
      to: '/pacientes',
    })
    navItems.push({
      label: 'Nuevo Turno',
      icon: 'i-lucide-plus',
      to: '/pacientes/nuevo-turno',
    })
  }

  navItems.push(
    {
      label: 'Editar perfil',
      icon: 'i-lucide-user-pen',
      to: '/perfil/editar',
    },
    {
      label: 'Cambiar contraseña',
      icon: 'i-lucide-key',
      to: '/perfil/cambiar-password',
    },
  )

  return navItems
})

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
  <div class="flex flex-1 min-h-dvh">
    <USidebar
      v-model:open="open"
      close
      variant="floating"
      collapsible="icon"
      :ui="{
        container: 'h-full',
        inner: 'bg-elevated/25 divide-transparent',
        body: 'py-0',
      }"
    >
      <template #header="{ close }">
        <div class="flex items-center justify-between w-full">
          <div class="flex items-center gap-2 overflow-hidden text-center">
            <UIcon name="i-lucide-stethoscope" class="size-8" />
            <span class="font-semibold text-md truncate group-data-[state=collapsed]/sidebar:hidden">
              Sistema de Turnos
            </span>
          </div>
          <UButton
            icon="i-lucide-x"
            color="neutral"
            variant="ghost"
            class="lg:hidden"
            aria-label="Cerrar menú"
            @click="close"
          />
        </div>
      </template>

      <template #default="{ state }">
        <div class="flex flex-col items-center text-center px-4 py-2 overflow-hidden">
          <UAvatar
            :alt="user ? `${user.firstName} ${user.lastName}` : 'Usuario'"
            :size="state === 'collapsed' ? 'md' : 'xl'"
            :ui="{ fallback: 'text-foreground font-semibold' }"
            class="mb-2"
          />
          <template v-if="state === 'expanded' && user">
            <p class="font-semibold text-foreground truncate w-full">
              {{ user.firstName }} {{ user.lastName }}
            </p>
            <p class="mt-0.5 text-sm text-muted truncate w-full">
              {{ user.email || 'Sin email' }}
            </p>
            <p class="mt-0.5 text-sm text-muted truncate w-full">
              {{ user.phone || 'Sin teléfono' }}
            </p>
            <p v-if="user.role === 'Patient' && user.dateOfBirth" class="mt-0.5 text-sm text-muted truncate w-full">
              {{ formatIsoDate(user.dateOfBirth) }}
            </p>
            <RoleBadge :role="user.role" class="mt-2" />
          </template>
        </div>

        <UNavigationMenu
          :key="state"
          :items="items"
          orientation="vertical"
          :ui="{ link: 'p-1.5 overflow-hidden' }"
        />
      </template>

      <template #footer>
        <UButton
          icon="i-lucide-log-out"
          label="Cerrar Sesion"
          color="error"
          variant="ghost"
          block
          @click="handleLogout"
        />
      </template>
    </USidebar>

    <div class="flex-1 flex flex-col overflow-hidden lg:peer-data-[variant=floating]:my-4 bg-default">
      <div class="h-(--ui-header-height) shrink-0 flex items-center px-4 border-b border-default">
        <UButton
          icon="i-lucide-panel-left"
          color="neutral"
          variant="ghost"
          aria-label="Toggle sidebar"
          @click="open = !open"
        />
      </div>

      <div class="flex-1 p-4 overflow-auto">
        <slot />
      </div>
    </div>
  </div>
</template>
