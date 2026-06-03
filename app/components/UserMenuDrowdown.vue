<script setup lang="ts">
import type { DropdownMenuItem } from '@nuxt/ui'

const { user } = useAuth()

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
</script>

<template>
  <UDropdownMenu
    :items="userItems"
    :content="{ align: 'center', collisionPadding: 12 }"
    :ui="{ content: 'w-(--reka-dropdown-menu-trigger-width) min-w-48' }"
  >
    <UButton
      v-bind="user"
      :label="`${user?.firstName} ${user?.lastName}`"
      trailing-icon="i-lucide-chevrons-up-down"
      color="neutral"
      variant="ghost"
      square
      class="w-full data-[state=open]:bg-elevated overflow-hidden"
      :ui="{
        trailingIcon: 'text-dimmed ms-auto',
      }"
    />
  </UDropdownMenu>
</template>
