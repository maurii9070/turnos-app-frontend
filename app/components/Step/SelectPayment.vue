<script setup lang="ts">
import type { PaymentMethod } from '~/types/appointments'

const props = defineProps<{
  modelValue: PaymentMethod | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: PaymentMethod | null]
  'next': []
  'back': []
}>()

interface PaymentOption {
  id: PaymentMethod
  label: string
  icon: string
  disabled: boolean
  description: string
}

const methods: PaymentOption[] = [
  {
    id: 'Cash',
    label: 'Efectivo',
    icon: 'i-lucide-banknote',
    disabled: false,
    description: 'Aboná en efectivo al asistir a tu turno.',
  },
  {
    id: 'Transfer',
    label: 'Transferencia',
    icon: 'i-lucide-building',
    disabled: false,
    description: 'Transferí el monto del turno y subí el comprobante.',
  },
  {
    id: 'MercadoPago',
    label: 'Mercado Pago',
    icon: 'i-lucide-wallet',
    disabled: true,
    description: 'Próximamente disponible.',
  },
]

function selectMethod(methodId: PaymentMethod) {
  if (methodId === 'MercadoPago') {
    return
  }
  emit('update:modelValue', methodId)
}

function handleNext() {
  if (props.modelValue) {
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-4 py-4">
    <h2 class="text-lg font-semibold text-default">
      Seleccioná un método de pago
    </h2>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="method in methods"
        :key="method.id"
        type="button"
        class="relative flex flex-col items-start gap-1 rounded-lg border p-4 text-left transition-colors"
        :class="[
          method.disabled
            ? 'cursor-not-allowed opacity-50'
            : modelValue === method.id
              ? 'border-primary bg-primary/5 text-primary'
              : 'border-muted bg-default hover:bg-elevated',
        ]"
        :disabled="method.disabled"
        @click="selectMethod(method.id)"
      >
        <div class="flex items-center gap-3">
          <UIcon :name="method.icon" class="size-5 shrink-0" />
          <span class="text-sm font-medium">{{ method.label }}</span>
        </div>
        <span class="mt-1 text-xs text-muted">
          {{ method.description }}
        </span>
        <UBadge
          v-if="method.disabled"
          color="neutral"
          variant="outline"
          size="xs"
          class="absolute right-3 top-3"
        >
          Próximamente
        </UBadge>
        <UIcon
          v-if="!method.disabled && modelValue === method.id"
          name="i-lucide-check"
          class="absolute right-3 top-3 size-4"
        />
      </button>
    </div>

    <!-- Info panel: Efectivo -->
    <div
      v-if="modelValue === 'Cash'"
      class="rounded-lg border border-muted bg-elevated/50 p-4 space-y-2"
    >
      <div class="flex items-center gap-2 text-sm font-semibold text-default">
        <UIcon name="i-lucide-info" class="size-4" />
        <span>¿Cómo pagar en efectivo?</span>
      </div>
      <p class="text-sm text-muted">
        Una vez confirmado el turno, deberás acercarte a la clínica para abonar
        en efectivo antes de la fecha del turno. El turno quedará pendiente
        hasta que realices el pago.
      </p>
    </div>

    <!-- Info panel: Transferencia -->
    <div
      v-if="modelValue === 'Transfer'"
      class="rounded-lg border border-muted bg-elevated/50 p-4 space-y-3"
    >
      <div class="flex items-center gap-2 text-sm font-semibold text-default">
        <UIcon name="i-lucide-info" class="size-4" />
        <span>Datos para la transferencia</span>
      </div>
      <div class="space-y-1 text-sm text-muted">
        <p><span class="font-medium text-default">CBU:</span> 0170001234567890123456</p>
        <p><span class="font-medium text-default">Alias:</span> CLINICA.TURNOS.MEDICOS</p>
        <p><span class="font-medium text-default">Titular:</span> Clínica Salud Total S.A.</p>

        <UAlert
          color="warning"
          icon="i-lucide-alert-triangle"
          class="mt-3"
        >
          <template #title>
            Importante
          </template>
          <template #description>
            Una vez realizada la transferencia, deberás subir el comprobante
            para que la secretaria verifique el pago. El turno se confirmará
            cuando el pago sea aprobado.
          </template>
        </UAlert>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <UButton
        label="Volver"
        variant="ghost"
        color="neutral"
        @click="emit('back')"
      />
      <UButton
        label="Continuar"
        color="primary"
        :disabled="!modelValue"
        @click="handleNext"
      />
    </div>
  </div>
</template>
