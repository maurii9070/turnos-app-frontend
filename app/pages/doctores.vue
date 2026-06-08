<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AppointmentStatus } from '~/types/appointments'
import type { DoctorMyAppointmentListItem } from '~/types/doctors'

type StatusColor = 'success' | 'neutral'

const STATUS_COLOR_MAP: Record<'Confirmed' | 'Completed', StatusColor> = {
  Confirmed: 'success',
  Completed: 'neutral',
}

const STATUS_LABEL_MAP: Record<'Confirmed' | 'Completed', string> = {
  Confirmed: 'Confirmado',
  Completed: 'Completado',
}

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Doctor'],
  layout: 'dashboard',
})

const { fetchMyDoctorAppointments, loading } = useDoctors()
const { completeAppointment } = useAppointments()
const toast = useToast()

const appointments = ref<DoctorMyAppointmentListItem[]>([])
const error = ref<string | null>(null)
const showDetail = ref(false)
const detailAppointmentId = ref<string | null>(null)
const showUploader = ref(false)
const selectedAppointmentId = ref<string | null>(null)
const showCompleteConfirm = ref(false)
const selectedCompleteId = ref<string | null>(null)
const completing = ref(false)

const columns: TableColumn<DoctorMyAppointmentListItem>[] = [
  {
    accessorKey: 'date',
    header: 'Fecha',
  },
  {
    accessorKey: 'startTime',
    header: 'Horario',
  },
  {
    id: 'patient',
    header: 'Paciente',
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

function getStatusColor(status: AppointmentStatus): StatusColor | undefined {
  if (status === 'Confirmed' || status === 'Completed') {
    return STATUS_COLOR_MAP[status]
  }
  return undefined
}

function getStatusLabel(status: AppointmentStatus): string {
  if (status === 'Confirmed' || status === 'Completed') {
    return STATUS_LABEL_MAP[status]
  }
  return status
}

function canComplete(status: AppointmentStatus): boolean {
  return status === 'Confirmed'
}

function openDetail(id: string) {
  detailAppointmentId.value = id
  showDetail.value = true
}

function openUploader(id: string) {
  selectedAppointmentId.value = id
  showUploader.value = true
}

function confirmComplete(id: string) {
  selectedCompleteId.value = id
  showCompleteConfirm.value = true
}

async function loadAppointments() {
  error.value = null
  try {
    appointments.value = await fetchMyDoctorAppointments()
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los turnos'
    appointments.value = []
  }
}

async function handleComplete() {
  if (!selectedCompleteId.value || completing.value)
    return

  completing.value = true
  try {
    await completeAppointment(selectedCompleteId.value)
    toast.add({
      title: 'Turno completado',
      description: 'El turno fue marcado como completado con éxito.',
      color: 'success',
    })
    await loadAppointments()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al completar el turno',
      color: 'error',
    })
  }
  finally {
    completing.value = false
    showCompleteConfirm.value = false
    selectedCompleteId.value = null
  }
}

onMounted(() => {
  loadAppointments()
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Mis Turnos
      </h1>
      <p class="mt-1 text-muted">
        Gestioná tus turnos médicos asignados.
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Error"
      icon="i-lucide-alert-circle"
      :description="error"
    >
      <template #footer>
        <UButton
          label="Reintentar"
          size="sm"
          variant="outline"
          @click="loadAppointments"
        />
      </template>
    </UAlert>

    <UTable
      :columns="columns"
      :data="appointments"
      :loading="loading"
    >
      <template #date-cell="{ row }">
        {{ formatIsoDate(row.original.date) }}
      </template>

      <template #patient-cell="{ row }">
        {{ row.original.patientFirstName }} {{ row.original.patientLastName }}
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="getStatusColor(row.original.status)">
          {{ getStatusLabel(row.original.status) }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-eye"
            label="Ver"
            size="sm"
            variant="ghost"
            @click="openDetail(row.original.id)"
          />
          <UButton
            icon="i-lucide-upload"
            label="Subir archivo"
            size="sm"
            variant="ghost"
            @click="openUploader(row.original.id)"
          />
          <UButton
            v-if="canComplete(row.original.status)"
            icon="i-lucide-check"
            label="Completar"
            size="sm"
            color="success"
            variant="ghost"
            @click="confirmComplete(row.original.id)"
          />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center py-8">
          <UIcon name="i-lucide-calendar-x" class="size-12 text-muted" />
          <p class="mt-2 font-medium">
            No tenés turnos
          </p>
          <p class="text-sm text-muted">
            Todavía no tenés turnos médicos asignados.
          </p>
        </div>
      </template>
    </UTable>

    <AppointmentDetailModal
      v-if="detailAppointmentId"
      v-model="showDetail"
      :appointment-id="detailAppointmentId"
    />

    <AppointmentFileUploader
      v-model="showUploader"
      :appointment-id="selectedAppointmentId ?? ''"
      role="doctor"
      @uploaded="loadAppointments()"
    />

    <UModal
      v-model:open="showCompleteConfirm"
      title="Completar turno"
      description="¿Estás seguro de que querés marcar este turno como completado?"
      :ui="{ footer: 'justify-end' }"
    >
      <template #footer="{ close }">
        <UButton
          label="No, mantener"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton
          label="Sí, completar"
          color="success"
          :loading="completing"
          @click="handleComplete"
        />
      </template>
    </UModal>
  </div>
</template>
