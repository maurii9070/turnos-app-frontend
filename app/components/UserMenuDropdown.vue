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

const userItems = computed<DropdownMenuItem[][]>(() => {
  if (!user.value)
    return []

  return [
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
      {
        label: 'Cerrar sesión',
        icon: 'i-lucide-log-out',
        onClick: () => emit('logout'),
        color: 'error' as const,
      },
    ],
  ]
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
