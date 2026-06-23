<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

defineProps<{
  trigger?: 'avatar' | 'button'
}>()

const emit = defineEmits<{
  changePassword: []
  logout: []
}>()

const { user } = useUsers()
const { signInWithGoogle } = useGoogleAuth()

async function linkGoogle() {
  localStorage.setItem('google-link-mode', 'true')
  await signInWithGoogle()
  localStorage.removeItem('google-link-mode')
}

const roleItems = computed<DropdownMenuItem[]>(() => {
  if (!user.value)
    return []

  const items: DropdownMenuItem[] = []

  if (user.value.role === 'Patient') {
    items.push(
      {
        label: 'Mis Turnos',
        icon: 'i-lucide-calendar-check',
        to: '/pacientes',
      },
      {
        label: 'Nuevo Turno',
        icon: 'i-lucide-plus',
        to: '/pacientes/nuevo-turno',
      },
    )
  }

  if (user.value.role === 'Doctor') {
    items.push({
      label: 'Mis Turnos',
      icon: 'i-lucide-calendar-check',
      to: '/doctores',
    })
  }

  if (user.value.role === 'Admin' || user.value.role === 'SuperAdmin') {
    items.push({
      label: 'Panel de administración',
      icon: 'i-lucide-shield',
      to: '/admin',
    })
  }

  if (user.value.role === 'SuperAdmin') {
    items.push({
      label: 'Registrar administrador',
      icon: 'i-lucide-shield-plus',
      to: '/admin/nuevo-admin',
    })
  }

  return items
})

const userItems = computed<DropdownMenuItem[][]>(() => {
  if (!user.value)
    return []

  const groups: DropdownMenuItem[][] = [
    [
      {
        label: `${user.value.firstName} ${user.value.lastName}`,
        disabled: true,
      },
      {
        label: user.value.email || 'Sin email',
        disabled: true,
        icon: 'i-lucide-mail',
      },
    ],
  ]

  if (roleItems.value.length > 0) {
    groups.push(roleItems.value)
  }

  groups.push(
    [
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
    ],
    [
      {
        type: 'separator' as const,
      },
      ...(user.value.googleId
        ? []
        : [{
            label: 'Vincular con Google',
            icon: 'i-simple-icons-google',
            onClick: () => linkGoogle(),
          }]),
      {
        label: 'Cerrar sesión',
        icon: 'i-lucide-log-out',
        onClick: () => emit('logout'),
        color: 'error' as const,
      },
    ],
  )

  return groups
})

const fullName = computed(() => {
  if (!user.value)
    return 'Usuario'
  return `${user.value.firstName} ${user.value.lastName}`
})
</script>

<template>
  <UDropdownMenu
    :items="userItems"
    :content="{ align: 'end', collisionPadding: 12 }"
  >
    <UAvatar
      v-if="trigger === 'avatar'"
      :alt="fullName"
      :ui="{ fallback: 'text-foreground font-semibold' }"
      size="md"
      class="cursor-pointer"
    />
    <UButton
      v-else
      leading-icon="i-lucide-user"
      :label="fullName"
      :aria-label="fullName"
      trailing-icon="i-lucide-chevron-down"
      color="neutral"
      variant="ghost"
      class="data-[state=open]:bg-elevated overflow-hidden"
      :ui="{
        label: 'hidden md:inline-flex',
        leadingIcon: 'lg:hidden',
        trailingIcon: 'text-dimmed ms-auto',
      }"
    />
  </UDropdownMenu>
</template>
