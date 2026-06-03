<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'
import { useUsers } from '~/composables/useUsers'

const { user } = useUsers()

const userItems = computed<DropdownMenuItem[][]>(() => [
  [
    {
      label: 'Mi Perfil',
      icon: 'i-lucide-user',
    },
    {
      label: 'Agendar Turno',
      icon: 'i-lucide-calendar',
    },
  ],
  [
    {
      label: 'Log out',
      icon: 'i-lucide-log-out',
    },
  ],
])

const fullName = computed(() => {
  if (!user.value)
    return 'Usuario'
  return `${user.value.firstName} ${user.value.lastName}`
})
</script>

<template>
  <UDropdownMenu
    :items="userItems"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
  >
    <UButton
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
