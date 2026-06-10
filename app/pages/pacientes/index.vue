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
const { syncMercadoPagoPayment, createMercadoPagoPreference } = useMercadoPago()
const { user } = useUsers()
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

function isMercadoPagoPending(row: MyAppointmentListItem): boolean {
  return row.status === 'PendingPayment' && row.paymentMethod === 'MercadoPago' && !!row.paymentId
}

const syncingPaymentIds = ref<Set<string>>(new Set())
const retryingAppointmentIds = ref<Set<string>>(new Set())

async function handleVerifyPayment(row: MyAppointmentListItem) {
  if (!row.paymentId || syncingPaymentIds.value.has(row.paymentId))
    return
  syncingPaymentIds.value.add(row.paymentId)
  try {
    const result = await syncMercadoPagoPayment(row.paymentId)
    if (result.appointmentConfirmed) {
      toast.add({
        title: 'Pago confirmado',
        description: 'Tu turno fue reservado con éxito.',
        color: 'success',
      })
      localStorage.removeItem('mercadopago:initPoint')
      await loadAppointments()
    }
    else if (result.currentStatus === 'Rejected') {
      toast.add({
        title: 'Pago rechazado',
        description: 'El pago no pudo completarse. Podés reintentarlo.',
        color: 'error',
      })
    }
    else {
      toast.add({
        title: 'Pago pendiente',
        description: 'Tu pago aún está siendo procesado.',
        color: 'warning',
      })
    }
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al verificar el pago',
      color: 'error',
    })
  }
  finally {
    if (row.paymentId) {
      syncingPaymentIds.value.delete(row.paymentId)
    }
  }
}

async function handleRetryPayment(row: MyAppointmentListItem) {
  if (retryingAppointmentIds.value.has(row.id))
    return
  retryingAppointmentIds.value.add(row.id)

  const savedInitPoint = localStorage.getItem('mercadopago:initPoint')

  if (savedInitPoint) {
    localStorage.setItem('mercadopago:paymentId', row.paymentId ?? '')
    localStorage.setItem('mercadopago:appointmentId', row.id)
    toast.add({
      title: 'Reintentar pago',
      description: 'Serás redirigido a Mercado Pago.',
      color: 'info',
    })
    if (import.meta.client) {
      window.location.href = savedInitPoint
    }
    retryingAppointmentIds.value.delete(row.id)
    return
  }

  try {
    const result = await createMercadoPagoPreference(row.id, {
      payerEmail: user.value?.email ?? null,
      payerFirstName: user.value?.firstName ?? null,
      payerLastName: user.value?.lastName ?? null,
    })

    localStorage.setItem('mercadopago:paymentId', result.paymentId)
    localStorage.setItem('mercadopago:appointmentId', result.appointmentId)
    localStorage.setItem('mercadopago:initPoint', result.initPoint)

    toast.add({
      title: 'Nuevo intento de pago',
      description: 'Serás redirigido a Mercado Pago.',
      color: 'info',
    })

    if (import.meta.client) {
      window.location.href = result.initPoint
    }
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al reintentar el pago',
      color: 'error',
    })
  }
  finally {
    retryingAppointmentIds.value.delete(row.id)
  }
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
            v-if="isMercadoPagoPending(row.original)"
            icon="i-lucide-refresh-cw"
            label="Verificar pago"
            size="sm"
            variant="ghost"
            color="warning"
            :loading="row.original.paymentId ? syncingPaymentIds.has(row.original.paymentId) : false"
            @click="handleVerifyPayment(row.original)"
          />
          <UButton
            v-if="isMercadoPagoPending(row.original)"
            icon="i-lucide-wallet"
            label="Reintentar pago"
            size="sm"
            variant="ghost"
            color="info"
            :loading="retryingAppointmentIds.has(row.original.id)"
            @click="handleRetryPayment(row.original)"
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
