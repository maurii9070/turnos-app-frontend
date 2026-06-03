<script setup lang="ts">
import { useUsers } from '~/composables/useUsers'

const { isProfileLoaded } = useUsers()

const route = useRoute()

const items = computed(() => [
  {
    label: 'Especialidades',
    to: '/especialidades',
    active: route.path.startsWith('/especialidades'),
  },
  {
    label: 'Doctores',
    to: '/especialistas',
    active: route.path.startsWith('/especialistas'),
  },
])
</script>

<template>
  <ClientOnly>
    <UHeader>
      <template #left>
        <NuxtLink to="/">
          <AppLogo class="w-auto h-6 shrink-0" />
        </NuxtLink>
      </template>

      <UNavigationMenu
        :items="items"
        variant="link"
      />

      <template #right>
        <UColorModeButton />

        <UserMenuDrowdown v-if="isProfileLoaded" />

        <div v-else class="space-x-2">
          <UButton
            icon="i-lucide-log-in"
            color="neutral"
            variant="ghost"
            to="/login"
            class="lg:hidden"
          />

          <UButton
            label="Iniciar sesión"
            color="neutral"
            variant="outline"
            to="/login"
            class="hidden lg:inline-flex"
          />

          <UButton
            label="Registrarse"
            color="neutral"
            trailing-icon="i-lucide-arrow-right"
            class="hidden lg:inline-flex"
            to="/registro"
          />
        </div>
      </template>

      <template #body>
        <UNavigationMenu
          :items="items"
          orientation="vertical"
          class="-mx-2.5"
        />

        <USeparator class="my-6" />

        <UButton
          v-if="!isProfileLoaded"
          label="Iniciar sesión"
          color="neutral"
          variant="subtle"
          to="/login"
          block
          class="mb-3"
        />
        <UButton
          v-if="!isProfileLoaded"
          label="Registrarse"
          color="neutral"
          to="/registro"
          block
        />
      </template>
    </UHeader>
  </ClientOnly>
</template>
