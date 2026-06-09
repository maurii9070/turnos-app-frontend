<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { AppointmentListItem, AppointmentStatus } from '~/types/appointments'

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
  allowedRoles: ['Admin', 'SuperAdmin'],
  layout: 'dashboard',
})

useHead({
  title: 'Turnos Pendientes',
})

const { fetchAppointments, confirmAppointment, cancelAppointment } = useAppointments()
const toast = useToast()

const appointments = ref<AppointmentListItem[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const showDetail = ref(false)
const detailAppointmentId = ref<string | null>(null)
const showConfirmModal = ref(false)
const selectedConfirmId = ref<string | null>(null)
const confirming = ref(false)
const showCancelModal = ref(false)
const selectedCancelId = ref<string | null>(null)
const cancelling = ref(false)

const globalFilter = ref('')

const columns: TableColumn<AppointmentListItem>[] = [
  {
    id: 'date',
    header: 'Fecha',
    accessorFn: row => formatIsoDate(row.date),
  },
  {
    accessorKey: 'startTime',
    header: 'Horario',
  },
  {
    id: 'patient',
    header: 'Paciente',
    accessorFn: row => `${row.patientFirstName} ${row.patientLastName}`,
  },
  {
    id: 'doctor',
    header: 'Doctor',
    accessorFn: row => `Dr/a. ${row.doctorFirstName} ${row.doctorLastName}`,
  },
  {
    id: 'specialty',
    header: 'Especialidad',
    accessorFn: row => row.specialtyName ?? '-',
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

function openDetail(id: string) {
  detailAppointmentId.value = id
  showDetail.value = true
}

function confirmAction(id: string) {
  selectedConfirmId.value = id
  showConfirmModal.value = true
}

function cancelAction(id: string) {
  selectedCancelId.value = id
  showCancelModal.value = true
}

async function loadAppointments() {
  error.value = null
  loading.value = true
  try {
    const [pendingPayment, pendingReview] = await Promise.all([
      fetchAppointments('PendingPayment'),
      fetchAppointments('PendingReview'),
    ])
    appointments.value = [...pendingPayment, ...pendingReview]
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los turnos'
    appointments.value = []
  }
  finally {
    loading.value = false
  }
}

async function handleConfirm() {
  if (!selectedConfirmId.value || confirming.value)
    return

  confirming.value = true
  try {
    await confirmAppointment(selectedConfirmId.value)
    toast.add({
      title: 'Turno confirmado',
      description: 'El turno fue confirmado con éxito.',
      color: 'success',
    })
    await loadAppointments()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al confirmar el turno',
      color: 'error',
    })
  }
  finally {
    confirming.value = false
    showConfirmModal.value = false
    selectedConfirmId.value = null
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
    showCancelModal.value = false
    selectedCancelId.value = null
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
        Turnos pendientes
      </h1>
      <p class="mt-1 text-muted">
        Revisá y confirmá los turnos que esperan aprobación.
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

      <template #patient-cell="{ row }">
        {{ row.original.patientFirstName }} {{ row.original.patientLastName }}
      </template>

      <template #doctor-cell="{ row }">
        Dr/a. {{ row.original.doctorFirstName }} {{ row.original.doctorLastName }}
      </template>

      <template #specialty-cell="{ row }">
        {{ row.original.specialtyName ?? '-' }}
      </template>

      <template #status-cell="{ row }">
        <UBadge :color="STATUS_COLOR_MAP[row.original.status]">
          {{ STATUS_LABEL_MAP[row.original.status] }}
        </UBadge>
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-eye"
            label="Ver"
            color="primary"
            size="sm"
            variant="ghost"
            @click="openDetail(row.original.id)"
          />
          <UButton
            v-if="row.original.status === 'PendingReview'"
            icon="i-lucide-check"
            label="Confirmar"
            size="sm"
            color="success"
            variant="ghost"
            @click="confirmAction(row.original.id)"
          />
          <UButton
            icon="i-lucide-x"
            label="Cancelar"
            size="sm"
            color="error"
            variant="ghost"
            @click="cancelAction(row.original.id)"
          />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center py-8">
          <UIcon name="i-lucide-check-circle" class="size-12 text-muted" />
          <p class="mt-2 font-medium">
            No hay turnos pendientes
          </p>
          <p class="text-sm text-muted">
            Todos los turnos fueron revisados.
          </p>
        </div>
      </template>
    </UTable>

    <AppointmentDetailModal
      v-if="detailAppointmentId"
      v-model="showDetail"
      :appointment-id="detailAppointmentId"
    />

    <UModal
      v-model:open="showConfirmModal"
      title="Confirmar turno"
      description="¿Estás seguro de que querés confirmar este turno?"
      :ui="{ footer: 'justify-end' }"
    >
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton
          label="Sí, confirmar"
          color="success"
          :loading="confirming"
          @click="handleConfirm"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="showCancelModal"
      title="Cancelar turno"
      description="¿Estás seguro de que querés cancelar este turno?"
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
  </div>
</template>
