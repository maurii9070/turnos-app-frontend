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
    description: 'Transferí el monto y subí el comprobante desde tu listado de turnos.',
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
  <div class="space-y-6">
    <h2 class="text-lg font-semibold text-default">
      Seleccioná un método de pago
    </h2>

    <div class="grid gap-4 md:grid-cols-3">
      <button
        v-for="method in methods"
        :key="method.id"
        type="button"
        class="group relative flex flex-col gap-3 rounded-xl border p-5 text-left transition-all duration-200"
        :class="[
          method.disabled
            ? 'cursor-not-allowed border-default/50 bg-muted/5 opacity-60'
            : modelValue === method.id
              ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
              : 'border-default bg-default hover:border-muted hover:shadow-sm active:scale-[0.99]',
        ]"
        :disabled="method.disabled"
        @click="selectMethod(method.id)"
      >
        <div class="flex items-center gap-3">
          <div
            class="flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors"
            :class="modelValue === method.id && !method.disabled
              ? 'bg-primary/10 text-primary'
              : 'bg-elevated text-muted'"
          >
            <UIcon :name="method.icon" class="size-5" />
          </div>
          <div class="min-w-0 flex-1">
            <p class="truncate font-medium text-default">
              {{ method.label }}
            </p>
          </div>
          <UIcon
            v-if="!method.disabled && modelValue === method.id"
            name="i-lucide-check-circle"
            class="size-5 shrink-0 text-primary"
          />
        </div>
        <p class="text-sm leading-relaxed text-muted">
          {{ method.description }}
        </p>
        <UBadge
          v-if="method.disabled"
          color="neutral"
          variant="outline"
          size="xs"
          class="absolute right-3 top-3"
        >
          Próximamente
        </UBadge>
      </button>
    </div>

    <div
      v-if="modelValue === 'Cash'"
      class="rounded-xl border border-muted/50 bg-warning/5 p-5 space-y-2"
    >
      <div class="flex items-center gap-2 text-sm font-semibold text-default">
        <UIcon name="i-lucide-info" class="size-4 text-warning" />
        <span>¿Cómo pagar en efectivo?</span>
      </div>
      <p class="text-sm leading-relaxed text-muted">
        Una vez confirmado el turno, deberás acercarte a la clínica para abonar
        en efectivo antes de la fecha del turno. El turno quedará pendiente
        hasta que realices el pago.
      </p>
    </div>

    <div
      v-if="modelValue === 'Transfer'"
      class="rounded-xl border border-muted/50 bg-info/5 p-5"
    >
      <UAlert
        color="warning"
        icon="i-lucide-alert-triangle"
      >
        <template #title>
          <span class="text-xs font-medium">Importante</span>
        </template>
        <template #description>
          Una vez realizada la transferencia, deberás subir el comprobante
          para que la secretaria verifique el pago. El turno se confirmará
          cuando el pago sea aprobado.
        </template>
      </UAlert>
    </div>

    <div class="flex justify-between border-t border-default pt-6">
      <UButton
        label="Volver"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        @click="emit('back')"
      />
      <UButton
        label="Continuar"
        color="primary"
        size="lg"
        trailing-icon="i-lucide-arrow-right"
        :disabled="!modelValue"
        @click="handleNext"
      />
    </div>
  </div>
</template>
