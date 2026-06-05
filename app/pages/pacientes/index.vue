<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { MyAppointmentListItem } from '~/types/appointments'

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})

const { fetchMyAppointments, cancelAppointment, loading } = useAppointments()
const toast = useToast()

const appointments = ref<MyAppointmentListItem[]>([])
const error = ref<string | null>(null)

const columns: TableColumn<MyAppointmentListItem>[] = [
  {
    accessorKey: 'date',
    header: 'Fecha',
  },
  {
    accessorKey: 'startTime',
    header: 'Horario',
  },
  {
    id: 'doctor',
    header: 'Doctor',
  },
  {
    accessorKey: 'specialtyName',
    header: 'Especialidad',
  },
  {
    accessorKey: 'status',
    header: 'Estado',
  },
  {
    id: 'actions',
    header: '',
  },
]

function getStatusColor(status: string): 'warning' | 'info' | 'success' | 'error' | 'neutral' {
  const map: Record<string, 'warning' | 'info' | 'success' | 'error' | 'neutral'> = {
    PendingPayment: 'warning',
    PendingReview: 'info',
    Confirmed: 'success',
    Cancelled: 'error',
    Completed: 'neutral',
  }
  return map[status] ?? 'neutral'
}

function getStatusLabel(status: string): string {
  const map: Record<string, string> = {
    PendingPayment: 'Pendiente de pago',
    PendingReview: 'Pendiente de revisión',
    Confirmed: 'Confirmado',
    Cancelled: 'Cancelado',
    Completed: 'Completado',
  }
  return map[status] ?? status
}

function canCancel(status: string): boolean {
  return status === 'PendingPayment' || status === 'PendingReview'
}

async function loadAppointments() {
  error.value = null
  try {
    appointments.value = await fetchMyAppointments()
  }
  catch (err: any) {
    error.value = err.message ?? 'Error al cargar los turnos'
    appointments.value = []
  }
}

async function handleCancel(id: string) {
  try {
    await cancelAppointment(id)
    toast.add({
      title: 'Turno cancelado',
      description: 'El turno fue cancelado con éxito.',
      color: 'success',
    })
    await loadAppointments()
  }
  catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message ?? 'Error al cancelar el turno',
      color: 'error',
    })
  }
}

onMounted(() => {
  loadAppointments()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">
          Mis Turnos
        </h1>
        <p class="mt-1 text-muted">
          Gestioná tus turnos médicos.
        </p>
      </div>
      <UButton
        icon="i-lucide-plus"
        to="/pacientes/nuevo-turno"
      >
        Nuevo Turno
      </UButton>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Error"
      icon="i-lucide-alert-circle"
      :description="error"
    />

    <UTable
      :columns="columns"
      :data="appointments"
      :loading="loading"
    >
      <template #date-cell="{ row }">
        {{ formatDate(new Date(`${row.original.date}T12:00:00`)) }}
      </template>

      <template #doctor-cell="{ row }">
        Dr/a. {{ row.original.doctorFirstName }} {{ row.original.doctorLastName }}
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="getStatusColor(row.original.status)">
          {{ getStatusLabel(row.original.status) }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <UButton
          v-if="canCancel(row.original.status)"
          icon="i-lucide-x"
          size="sm"
          color="error"
          variant="ghost"
          title="Cancelar turno"
          @click="handleCancel(row.original.id)"
        />
      </template>

      <template #empty>
        <div class="flex flex-col items-center py-8">
          <UIcon name="i-lucide-calendar-x" class="size-12 text-muted" />
          <p class="mt-2 font-medium">
            No tenés turnos
          </p>
          <p class="text-sm text-muted">
            Todavía no reservaste ningún turno médico.
          </p>
          <UButton class="mt-4" to="/pacientes/nuevo-turno">
            Sacar turno
          </UButton>
        </div>
      </template>
    </UTable>
  </div>
</template>
