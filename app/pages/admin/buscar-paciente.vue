<script setup lang="ts">
import type { PatientDetail } from '~/types/patients'

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Admin', 'SuperAdmin'],
  layout: 'dashboard',
})

useHead({
  title: 'Buscar Paciente',
})

const { fetchPatientByDni } = usePatients()

const dni = ref('')
const loading = ref(false)
const patient = ref<PatientDetail | null>(null)
const error = ref<string | null>(null)
const searched = ref(false)

async function search() {
  if (!dni.value.trim())
    return

  error.value = null
  patient.value = null
  searched.value = false
  loading.value = true

  try {
    patient.value = await fetchPatientByDni(dni.value.trim())
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al buscar el paciente'
    patient.value = null
  }
  finally {
    loading.value = false
    searched.value = true
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Buscar paciente
      </h1>
      <p class="mt-1 text-muted">
        Buscá un paciente por su DNI.
      </p>
    </div>

    <div class="flex max-w-md gap-2">
      <UInput
        v-model="dni"
        class="flex-1"
        icon="i-lucide-search"
        placeholder="Ingresá el DNI"
        :disabled="loading"
        @keyup.enter="search"
      />
      <UButton
        label="Buscar"
        icon="i-lucide-search"
        :loading="loading"
        @click="search"
      />
    </div>

    <div v-if="loading" class="flex justify-center py-8">
      <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
    </div>

    <div v-else-if="error" class="max-w-md">
      <UAlert
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="error"
      />
    </div>

    <div v-else-if="patient" class="max-w-lg">
      <div class="divide-y divide-default rounded-xl border border-default bg-default">
        <div class="flex items-center justify-between px-5 py-4">
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-user" class="size-4" />
            Nombre
          </span>
          <span class="text-sm font-medium text-default">
            {{ patient.firstName }} {{ patient.lastName }}
          </span>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-id-card" class="size-4" />
            DNI
          </span>
          <span class="text-sm font-medium text-default">{{ patient.dni }}</span>
        </div>

        <div v-if="patient.email" class="flex items-center justify-between px-5 py-4">
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-mail" class="size-4" />
            Email
          </span>
          <span class="text-sm font-medium text-default">{{ patient.email }}</span>
        </div>

        <div v-if="patient.phone" class="flex items-center justify-between px-5 py-4">
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-phone" class="size-4" />
            Teléfono
          </span>
          <span class="text-sm font-medium text-default">{{ patient.phone }}</span>
        </div>

        <div v-if="patient.dateOfBirth" class="flex items-center justify-between px-5 py-4">
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-cake" class="size-4" />
            Fecha de nacimiento
          </span>
          <span class="text-sm font-medium text-default">
            {{ formatIsoDate(patient.dateOfBirth) }}
          </span>
        </div>

        <div class="flex items-center justify-between px-5 py-4">
          <span class="flex items-center gap-2 text-sm text-muted">
            <UIcon name="i-lucide-calendar-check" class="size-4" />
            Total de turnos
          </span>
          <span class="text-sm font-medium text-default">{{ patient.totalAppointments }}</span>
        </div>

        <div class="flex items-center justify-between bg-primary/5 px-5 py-4">
          <span class="flex items-center gap-2 text-sm font-semibold text-default">
            <UIcon name="i-lucide-shield" class="size-4" />
            Estado
          </span>
          <UBadge :color="patient.isActive ? 'success' : 'error'" size="sm">
            {{ patient.isActive ? 'Activo' : 'Inactivo' }}
          </UBadge>
        </div>
      </div>
    </div>

    <div v-else-if="searched" class="max-w-md">
      <UAlert
        color="neutral"
        variant="subtle"
        icon="i-lucide-search-x"
        title="Paciente no encontrado"
        description="No se encontró ningún paciente con ese DNI."
      />
    </div>
  </div>
</template>
