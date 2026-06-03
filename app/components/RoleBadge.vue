<script setup lang="ts">
import type { UserRole } from '~/types/auth'

defineProps<{
  role: UserRole
}>()

const roleLabels: Record<UserRole, string> = {
  Patient: 'Paciente',
  Doctor: 'Doctor',
  Admin: 'Administrador',
  SuperAdmin: 'Super Admin',
}

const roleColors: Record<UserRole, string> = {
  Patient: 'neutral',
  Doctor: 'primary',
  Admin: 'warning',
  SuperAdmin: 'error',
}
</script>

<template>
  <UBadge :color="roleColors[role]" variant="subtle" size="lg">
    {{ roleLabels[role] }}
  </UBadge>
</template>
