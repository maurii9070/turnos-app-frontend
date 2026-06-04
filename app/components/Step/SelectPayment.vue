<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'next': []
  'back': []
}>()

const methods = [
  { id: 'efectivo', label: 'Efectivo', icon: 'i-lucide-banknote' },
  { id: 'tarjeta', label: 'Tarjeta de crédito/débito', icon: 'i-lucide-credit-card' },
  { id: 'mercado-pago', label: 'Mercado Pago', icon: 'i-lucide-wallet' },
]

function selectMethod(methodId: string) {
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
        class="relative flex items-center gap-3 rounded-lg border p-4 text-left transition-colors"
        :class="modelValue === method.id
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-muted bg-default hover:bg-elevated'"
        @click="selectMethod(method.id)"
      >
        <UIcon :name="method.icon" class="size-5 shrink-0" />
        <span class="text-sm font-medium">{{ method.label }}</span>
        <UIcon
          v-if="modelValue === method.id"
          name="i-lucide-check"
          class="absolute right-3 top-3 size-4"
        />
      </button>
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
