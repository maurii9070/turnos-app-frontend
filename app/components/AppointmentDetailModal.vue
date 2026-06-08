<script setup lang="ts">
import type { AppointmentDetail, AppointmentStatus } from '~/types/appointments'

type StatusColor = 'warning' | 'info' | 'success' | 'error' | 'neutral'

const props = defineProps<{
  appointmentId: string
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { fetchAppointmentById } = useAppointments()
const { role } = useAuth()

const CATEGORY_LABEL_MAP: Record<'Medical' | 'Receipt', string> = {
  Medical: 'Archivo médico',
  Receipt: 'Comprobante',
}

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

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const detail = ref<AppointmentDetail | null>(null)
const isLoading = ref(false)
const error = ref<string | null>(null)

const filteredFiles = computed(() => {
  if (!detail.value)
    return []
  const files = detail.value.files
  if (role.value === 'Doctor')
    return files.filter(f => f.category === 'Medical')
  if (role.value === 'Admin' || role.value === 'SuperAdmin')
    return files.filter(f => f.category === 'Receipt')
  return files
})

watch(isOpen, async (val) => {
  if (val && props.appointmentId) {
    await loadDetail()
  }
}, { immediate: true })

async function loadDetail() {
  error.value = null
  isLoading.value = true
  try {
    detail.value = await fetchAppointmentById(props.appointmentId)
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar el turno'
  }
  finally {
    isLoading.value = false
  }
}

function isImage(fileType: string): boolean {
  return fileType.startsWith('image/')
}

function formatFileSizeName(fileName: string): string {
  if (fileName.length > 40) {
    return `${fileName.slice(0, 37)}...`
  }
  return fileName
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    title="Detalle del turno"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div v-if="isLoading" class="flex justify-center py-8">
        <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-muted" />
      </div>

      <UAlert
        v-else-if="error"
        color="error"
        variant="subtle"
        icon="i-lucide-alert-circle"
        :title="error"
      />

      <div v-else-if="detail" class="space-y-6">
        <div class="divide-y divide-default rounded-xl border border-default bg-default">
          <div class="flex items-center justify-between px-5 py-4">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-calendar" class="size-4" />
              Fecha
            </span>
            <span class="text-sm font-medium text-default">{{ formatIsoDate(detail.date) }}</span>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-clock" class="size-4" />
              Horario
            </span>
            <span class="text-sm font-medium text-default">{{ detail.startTime }} hs</span>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-user-round" class="size-4" />
              Médico
            </span>
            <span class="text-sm font-medium text-default">
              Dr/a. {{ detail.doctorFirstName }} {{ detail.doctorLastName }}
            </span>
          </div>
          <div v-if="detail.specialtyName" class="flex items-center justify-between px-5 py-4">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-stethoscope" class="size-4" />
              Especialidad
            </span>
            <span class="text-sm font-medium text-default">{{ detail.specialtyName }}</span>
          </div>
          <div class="flex items-center justify-between px-5 py-4">
            <span class="flex items-center gap-2 text-sm text-muted">
              <UIcon name="i-lucide-tag" class="size-4" />
              Estado
            </span>
            <UBadge :color="STATUS_COLOR_MAP[detail.status]" size="sm">
              {{ STATUS_LABEL_MAP[detail.status] }}
            </UBadge>
          </div>
          <div
            v-if="detail.consultationPrice"
            class="flex items-center justify-between bg-primary/5 px-5 py-4"
          >
            <span class="flex items-center gap-2 text-sm font-semibold text-default">
              <UIcon name="i-lucide-wallet" class="size-4" />
              Precio
            </span>
            <span class="font-semibold text-default">{{ formatCurrency(detail.consultationPrice) }}</span>
          </div>
        </div>

        <div v-if="filteredFiles.length > 0">
          <h3 class="mb-3 text-sm font-semibold text-default">
            Archivos adjuntos
          </h3>
          <div class="space-y-2">
            <a
              v-for="file in filteredFiles"
              :key="file.id"
              :href="file.filePathOrUrl"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center gap-3 rounded-xl border border-default bg-default p-3 transition-colors hover:bg-elevated"
            >
              <div
                class="flex size-10 shrink-0 items-center justify-center rounded-lg"
                :class="isImage(file.fileType) ? 'bg-primary/10 text-primary' : 'bg-elevated text-muted'"
              >
                <UIcon
                  :name="isImage(file.fileType) ? 'i-lucide-image' : 'i-lucide-file'"
                  class="size-5"
                />
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-default">
                  {{ formatFileSizeName(file.fileName) }}
                </p>
                <p class="text-xs text-muted">
                  {{ CATEGORY_LABEL_MAP[file.category] }}
                </p>
              </div>
              <UIcon name="i-lucide-external-link" class="size-4 text-muted" />
            </a>
          </div>
        </div>

        <div
          v-else
          class="rounded-xl border border-dashed border-default p-6 text-center"
        >
          <UIcon name="i-lucide-paperclip" class="mx-auto size-8 text-muted" />
          <p class="mt-2 text-sm text-muted">
            No hay archivos adjuntos en este turno.
          </p>
        </div>
      </div>
    </template>

    <template #footer="{ close }">
      <UButton label="Cerrar" color="neutral" variant="outline" @click="close" />
    </template>
  </UModal>
</template>
