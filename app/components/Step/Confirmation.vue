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
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold text-default">
      Revisá los datos de tu turno
    </h2>

    <UAlert
      v-if="submitError"
      color="error"
      icon="i-lucide-alert-circle"
      :title="submitError"
    />

    <div class="divide-y divide-default rounded-xl border border-default bg-default">
      <div class="flex items-center justify-between px-5 py-4">
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-user-round" class="size-4" />
          Médico
        </span>
        <span class="text-right text-sm font-medium text-default">
          {{ doctorInfo
            ? `${doctorInfo.firstName} ${doctorInfo.lastName}`
            : data.doctor ?? '-' }}
        </span>
      </div>
      <div v-if="doctorInfo?.specialtyName" class="flex items-center justify-between px-5 py-4">
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-stethoscope" class="size-4" />
          Especialidad
        </span>
        <span class="text-sm font-medium text-default">{{ doctorInfo.specialtyName }}</span>
      </div>
      <div class="flex items-center justify-between px-5 py-4">
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-calendar" class="size-4" />
          Fecha
        </span>
        <span class="text-right text-sm font-medium capitalize text-default">
          {{ formatIsoDate(data.fecha) }}
        </span>
      </div>
      <div class="flex items-center justify-between px-5 py-4">
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-clock" class="size-4" />
          Horario
        </span>
        <span class="text-sm font-medium text-default">{{ data.hora ? `${data.hora} hs` : '-' }}</span>
      </div>
      <div class="flex items-center justify-between px-5 py-4">
        <span class="flex items-center gap-2 text-sm text-muted">
          <UIcon name="i-lucide-credit-card" class="size-4" />
          Pago
        </span>
        <span class="text-sm font-medium text-default">{{ pagoMap[data.pago ?? ''] ?? data.pago ?? '-' }}</span>
      </div>
      <div
        v-if="doctorInfo?.consultationPrice"
        class="flex items-center justify-between bg-primary/5 px-5 py-4"
      >
        <span class="flex items-center gap-2 text-sm font-semibold text-default">
          <UIcon name="i-lucide-wallet" class="size-4" />
          Total
        </span>
        <span class="font-semibold text-default">{{ formatCurrency(doctorInfo.consultationPrice) }}</span>
      </div>
    </div>

    <div
      v-if="data.pago === 'Cash'"
      class="flex items-start gap-3 rounded-xl border border-muted/50 bg-warning/5 p-4 text-sm text-muted"
    >
      <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-warning" />
      <p>Recordá acercarte a la clínica para abonar en efectivo antes de la fecha del turno.</p>
    </div>

    <div
      v-if="data.pago === 'Transfer'"
      class="flex items-start gap-3 rounded-xl border border-muted/50 bg-info/5 p-4 text-sm text-muted"
    >
      <UIcon name="i-lucide-info" class="mt-0.5 size-4 shrink-0 text-info" />
      <p>Una vez creado el turno, realizá la transferencia y subí el comprobante desde tu listado de turnos. La secretaria verificará el pago y confirmará tu turno.</p>
    </div>

    <div
      v-if="data.pago === 'MercadoPago'"
      class="flex items-start gap-3 rounded-xl border border-muted/50 bg-primary/5 p-4 text-sm text-muted"
    >
      <UIcon name="i-lucide-wallet" class="mt-0.5 size-4 shrink-0 text-primary" />
      <p>Al confirmar, serás redirigido a Mercado Pago para completar el pago. Tu turno se confirmará automáticamente una vez que el pago sea aprobado.</p>
    </div>

    <div class="flex justify-between border-t border-default pt-6">
      <UButton
        label="Volver"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        :disabled="isSubmitting"
        @click="emit('back')"
      />
      <UButton
        label="Confirmar turno"
        color="success"
        size="lg"
        icon="i-lucide-check"
        :loading="isSubmitting"
        :disabled="isSubmitting"
        @click="emit('confirm')"
      />
    </div>
  </div>
</template>
