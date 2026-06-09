<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AppointmentStatus, MyAppointmentListItem } from '~/types/appointments'

type StatusColor = 'warning' | 'info' | 'success' | 'error' | 'neutral'

const STATUS_COLOR_MAP: Record<AppointmentStatus, StatusColor> = {
  PendingPayment: 'warning',
  PendingReview: 'info',
  Confirmed: 'success',
  Cancelled: 'error',
  Completed: 'neutral',
}

const STATUS_LABEL_MAP: Record<AppointmentStatus, string> = {
  PendingPayment: 'Pendiente de pago',
  PendingReview: 'Pendiente de revisión',
  Confirmed: 'Confirmado',
  Cancelled: 'Cancelado',
  Completed: 'Completado',
}

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})

useHead({
  title: 'Mis Turnos',
})

const { fetchMyAppointments, cancelAppointment, loading } = useAppointments()
const toast = useToast()

const appointments = ref<MyAppointmentListItem[]>([])
const error = ref<string | null>(null)
const selectedAppointmentId = ref<string | null>(null)
const showUploader = ref(false)
const showCancelConfirm = ref(false)
const selectedCancelId = ref<string | null>(null)
const cancelling = ref(false)
const showDetail = ref(false)
const detailAppointmentId = ref<string | null>(null)

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
    accessorFn: row => `${row.doctorFirstName} ${row.doctorLastName}`,
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

function getStatusColor(status: AppointmentStatus): StatusColor {
  return STATUS_COLOR_MAP[status]
}

function getStatusLabel(status: AppointmentStatus): string {
  return STATUS_LABEL_MAP[status]
}

function canUpload(row: MyAppointmentListItem): boolean {
  return row.status === 'PendingPayment' && row.paymentMethod === 'Transfer'
}

function canCancel(status: AppointmentStatus): boolean {
  return status === 'PendingPayment'
}

function openDetail(id: string) {
  detailAppointmentId.value = id
  showDetail.value = true
}

function openUploader(id: string) {
  selectedAppointmentId.value = id
  showUploader.value = true
}

function confirmCancel(id: string) {
  selectedCancelId.value = id
  showCancelConfirm.value = true
}

async function loadAppointments() {
  error.value = null
  try {
    appointments.value = await fetchMyAppointments()
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar mis turnos'
    appointments.value = []
  }
}

async function handleCancel() {
  if (!selectedCancelId.value || cancelling.value)
    return

  cancelling.value = true
  try {
    await cancelAppointment(selectedCancelId.value)
    toast.add({
      title: 'Turno cancelado',
      description: 'El turno fue cancelado con éxito.',
      color: 'success',
    })
    await loadAppointments()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al cancelar el turno',
      color: 'error',
    })
  }
  finally {
    cancelling.value = false
    showCancelConfirm.value = false
    selectedCancelId.value = null
  }
}

const globalFilter = ref('')

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

    <div class="flex px-4 py-3.5 border-b border-accented">
      <UInput v-model="globalFilter" class="max-w-sm" icon="i-lucide-search" placeholder="Buscar..." />
    </div>

    <UTable
      v-model:global-filter="globalFilter"
      :columns="columns"
      :data="appointments"
      :loading="loading"
    >
      <template #date-cell="{ row }">
        {{ formatIsoDate(row.original.date) }}
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
        <div class="flex items-center gap-1">
          <UButton
            v-if="canUpload(row.original)"
            icon="i-lucide-upload"
            label="Subir comprobante"
            size="sm"
            variant="ghost"
            color="warning"
            @click="openUploader(row.original.id)"
          />
          <UButton
            icon="i-lucide-eye"
            label="Ver"
            size="sm"
            variant="ghost"
            @click="openDetail(row.original.id)"
          />
          <UButton
            v-if="canCancel(row.original.status)"
            icon="i-lucide-x"
            label="Cancelar"
            size="sm"
            color="error"
            variant="ghost"
            @click="confirmCancel(row.original.id)"
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
            Todavía no reservaste ningún turno médico.
          </p>
          <UButton class="mt-4" to="/pacientes/nuevo-turno">
            Sacar turno
          </UButton>
        </div>
      </template>
    </UTable>

    <AppointmentFileUploader
      v-model="showUploader"
      :appointment-id="selectedAppointmentId ?? ''"
      role="patient"
      @uploaded="loadAppointments()"
    />

    <UModal
      v-model:open="showCancelConfirm"
      title="Cancelar turno"
      description="¿Estás seguro de que querés cancelar este turno? Esta acción no se puede deshacer."
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
          label="Sí, cancelar"
          color="error"
          :loading="cancelling"
          @click="handleCancel"
        />
      </template>
    </UModal>

    <AppointmentDetailModal
      v-if="detailAppointmentId"
      v-model="showDetail"
      :appointment-id="detailAppointmentId"
    />
  </div>
</template>
