<script setup lang="ts">
import type { UserRole } from '~/types/auth'

const props = defineProps<{
  role: UserRole
}>()

type RoleColors = 'neutral' | 'primary' | 'warning' | 'error'

const roleLabels: Record<UserRole, string> = {
  Patient: 'Paciente',
  Doctor: 'Doctor',
  Admin: 'Administrador',
  SuperAdmin: 'Super Admin',
}

const roleColors: Record<UserRole, RoleColors> = {
  Patient: 'neutral',
  Doctor: 'primary',
  Admin: 'warning',
  SuperAdmin: 'error',
}

const badgeColor = computed(() => roleColors[props.role])
const badgeLabel = computed(() => roleLabels[props.role])
</script>

<template>
  <UBadge :color="badgeColor" variant="subtle" size="md">
    {{ badgeLabel }}
  </UBadge>
</template>
