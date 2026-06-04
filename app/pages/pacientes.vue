<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})

const toast = useToast()
const currentStep = ref(0)

// Estado compartido entre pasos
const turnoData = ref({
  doctor: null as string | null,
  fecha: null as string | null,
  hora: null as string | null,
  pago: null as string | null,
})

const items = ref<StepperItem[]>([
  {
    title: 'Doctor',
    description: 'Seleccioná tu médico',
    icon: 'i-lucide-user-round',
    slot: 'doctor',
  },
  {
    title: 'Fecha y Hora',
    description: 'Elegí cuándo ir',
    icon: 'i-lucide-calendar',
    slot: 'fecha',
  },
  {
    title: 'Pago',
    description: 'Método de pago',
    icon: 'i-lucide-credit-card',
    slot: 'pago',
  },
  {
    title: 'Confirmación',
    description: 'Revisá y confirmá',
    icon: 'i-lucide-check-circle',
    slot: 'confirmacion',
  },
])

function canAdvance(stepIndex: number): boolean {
  switch (stepIndex) {
    case 0:
      return turnoData.value.doctor !== null
    case 1:
      return turnoData.value.fecha !== null && turnoData.value.hora !== null
    case 2:
      return turnoData.value.pago !== null
    default:
      return true
  }
}

function nextStep() {
  if (!canAdvance(currentStep.value)) {
    toast.add({
      title: 'Faltan datos',
      description: 'Completá este paso antes de continuar.',
      color: 'warning',
    })
    return
  }
  if (currentStep.value < items.value.length - 1)
    currentStep.value++
}

function prevStep() {
  if (currentStep.value > 0)
    currentStep.value--
}

function confirmarTurno() {
  toast.add({
    title: 'Turno confirmado',
    description: 'Tu turno fue reservado con éxito.',
    color: 'success',
  })
  // Resetear el wizard
  currentStep.value = 0
  turnoData.value = {
    doctor: null,
    fecha: null,
    hora: null,
    pago: null,
  }
}
</script>

<template>
  <div class="space-y-6">
    <InitialGreeting />

    <UStepper
      v-model="currentStep"
      :items="items"
      orientation="horizontal"
      class="w-full"
    >
      <template #doctor>
        <StepSelectDoctor v-model="turnoData.doctor" @next="nextStep" />
      </template>

      <template #fecha>
        <StepSelectDate v-model:fecha="turnoData.fecha" v-model:hora="turnoData.hora" @next="nextStep" @back="prevStep" />
      </template>

      <template #pago>
        <StepSelectPayment v-model="turnoData.pago" @next="nextStep" @back="prevStep" />
      </template>

      <template #confirmacion>
        <StepConfirmation :data="turnoData" @back="prevStep" @confirm="confirmarTurno" />
      </template>
    </UStepper>
  </div>
</template>
