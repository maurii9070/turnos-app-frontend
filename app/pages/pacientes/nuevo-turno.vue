<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import type { PaymentMethod } from '~/types/appointments'
import type { DoctorListItem } from '~/types/doctors'

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})

const toast = useToast()
const currentStep = ref(0)

const { createAppointment } = useAppointments()
const { createPayment } = usePayments()

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const selectedDoctorInfo = ref<DoctorListItem | null>(null)

// Estado compartido entre pasos
const turnoData = ref({
  doctor: null as string | null,
  fecha: null as string | null,
  hora: null as string | null,
  pago: null as PaymentMethod | null,
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

function onSelectDoctor(doctor: DoctorListItem) {
  selectedDoctorInfo.value = doctor
}

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

async function confirmarTurno() {
  if (!turnoData.value.doctor || !turnoData.value.fecha || !turnoData.value.hora || !turnoData.value.pago) {
    return
  }

  submitError.value = null
  isSubmitting.value = true

  try {
    const appointment = await createAppointment({
      doctorId: turnoData.value.doctor,
      date: turnoData.value.fecha,
      startTime: turnoData.value.hora,
    })

    await createPayment(appointment.id, {
      method: turnoData.value.pago,
    })

    toast.add({
      title: 'Turno confirmado',
      description: 'Tu turno fue reservado con éxito.',
      color: 'success',
    })

    await navigateTo('/pacientes')
  }
  catch (err: any) {
    const message = err.message ?? 'Error al confirmar el turno'
    submitError.value = message
    toast.add({
      title: 'Error',
      description: message,
      color: 'error',
    })
  }
  finally {
    isSubmitting.value = false
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
        <StepSelectDoctor v-model="turnoData.doctor" @next="nextStep" @select="onSelectDoctor" />
      </template>

      <template #fecha>
        <StepSelectDate v-model:fecha="turnoData.fecha" v-model:hora="turnoData.hora" :doctor-id="turnoData.doctor" @next="nextStep" @back="prevStep" />
      </template>

      <template #pago>
        <StepSelectPayment v-model="turnoData.pago" @next="nextStep" @back="prevStep" />
      </template>

      <template #confirmacion>
        <StepConfirmation
          :data="turnoData"
          :doctor-info="selectedDoctorInfo"
          :is-submitting="isSubmitting"
          :submit-error="submitError"
          @back="prevStep"
          @confirm="confirmarTurno"
        />
      </template>
    </UStepper>
  </div>
</template>
