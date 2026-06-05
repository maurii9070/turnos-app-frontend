<script setup lang="ts">
import type { PaymentMethod } from '~/types/appointments'
import type { DoctorListItem } from '~/types/doctors'

interface TurnoData {
  doctor: string | null
  fecha: string | null
  hora: string | null
  pago: PaymentMethod | null
}

defineProps<{
  data: TurnoData
  doctorInfo?: DoctorListItem | null
  isSubmitting?: boolean
  submitError?: string | null
}>()

const emit = defineEmits<{
  back: []
  confirm: []
}>()

const pagoMap: Record<string, string> = {
  Cash: 'Efectivo',
  Transfer: 'Transferencia',
  MercadoPago: 'Mercado Pago',
}

function formatDate(dateStr: string | null): string {
  if (!dateStr)
    return '-'
  try {
    const [y, m, d] = dateStr.split('-')
    const date = new Date(Number(y), Number(m) - 1, Number(d))
    return new Intl.DateTimeFormat('es-AR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(date)
  }
  catch {
    return dateStr
  }
}

function formatPrice(price: number | undefined): string {
  if (!price && price !== 0)
    return ''
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price)
}
</script>

<template>
  <div class="space-y-4 py-4">
    <h2 class="text-lg font-semibold text-default">
      Revisá los datos de tu turno
    </h2>

    <UAlert
      v-if="submitError"
      color="error"
      icon="i-lucide-alert-circle"
      :title="submitError"
    />

    <div class="rounded-lg border border-muted bg-elevated/50 p-4 space-y-3">
      <div class="flex justify-between">
        <span class="text-muted">Médico</span>
        <span class="font-medium text-default text-right">
          {{ doctorInfo
            ? `${doctorInfo.firstName} ${doctorInfo.lastName}`
            : data.doctor ?? '-' }}
        </span>
      </div>
      <div v-if="doctorInfo?.specialtyName" class="flex justify-between">
        <span class="text-muted">Especialidad</span>
        <span class="font-medium text-default">{{ doctorInfo.specialtyName }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Fecha</span>
        <span class="font-medium text-default text-right capitalize">
          {{ formatDate(data.fecha) }}
        </span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Horario</span>
        <span class="font-medium text-default">{{ data.hora ? `${data.hora} hs` : '-' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Pago</span>
        <span class="font-medium text-default">{{ pagoMap[data.pago ?? ''] ?? data.pago ?? '-' }}</span>
      </div>
      <div
        v-if="doctorInfo?.consultationPrice"
        class="flex justify-between border-t border-muted pt-3"
      >
        <span class="text-muted">Total</span>
        <span class="font-semibold text-default">{{ formatPrice(doctorInfo.consultationPrice) }}</span>
      </div>
    </div>

    <div v-if="data.pago === 'Cash'" class="rounded-lg border border-muted bg-elevated/50 p-3 text-sm text-muted">
      <p>Recordá acercarte a la clínica para abonar en efectivo antes de la fecha del turno.</p>
    </div>

    <div v-if="data.pago === 'Transfer'" class="rounded-lg border border-muted bg-elevated/50 p-3 text-sm text-muted">
      <p>Realizá la transferencia a los datos indicados. La secretaria verificará el pago y confirmará tu turno.</p>
    </div>

    <div class="flex justify-between pt-4">
      <UButton
        label="Volver"
        variant="ghost"
        color="neutral"
        :disabled="isSubmitting"
        @click="emit('back')"
      />
      <UButton
        label="Confirmar turno"
        color="success"
        icon="i-lucide-check"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="emit('confirm')"
      />
    </div>
  </div>
</template>
