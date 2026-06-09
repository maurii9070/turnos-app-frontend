<script setup lang="ts">
import type { StepperItem } from '@nuxt/ui'
import type { PaymentMethod } from '~/types/appointments'
import type { DoctorListItem } from '~/types/doctors'

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})

useHead({
  title: 'Nuevo Turno',
})

const toast = useToast()
const currentStep = ref(0)

const { createAppointment } = useAppointments()
const { createPayment } = usePayments()

const isSubmitting = ref(false)
const submitError = ref<string | null>(null)

const selectedDoctorInfo = ref<DoctorListItem | null>(null)

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

    if (turnoData.value.pago === 'Transfer') {
      toast.add({
        title: 'Turno creado',
        description: 'Subí el comprobante de transferencia desde tu listado de turnos para que sea revisado.',
        color: 'success',
      })
    }
    else {
      toast.add({
        title: 'Turno creado',
        description: 'Tu turno fue reservado con éxito.',
        color: 'success',
      })
    }

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
  <div class="mx-auto max-w-4xl space-y-8">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Nuevo turno
      </h1>
      <p class="text-muted">
        Completá los pasos para reservar tu turno médico.
      </p>
    </div>

    <div class="rounded-xl border border-default bg-elevated/25 p-6 md:p-8">
      <UStepper
        v-model="currentStep"
        :items="items"
        orientation="horizontal"
        :ui="{
          wrapper: 'mt-2.5 max-sm:hidden',
          description: 'max-md:hidden',
          title: 'text-sm max-sm:text-xs',
        }"
      >
        <template #doctor>
          <Transition name="step" mode="out-in">
            <StepSelectDoctor
              key="doctor"
              v-model="turnoData.doctor"
              @next="nextStep"
              @select="onSelectDoctor"
            />
          </Transition>
        </template>

        <template #fecha>
          <Transition name="step" mode="out-in">
            <StepSelectDate
              key="fecha"
              v-model:fecha="turnoData.fecha"
              v-model:hora="turnoData.hora"
              :doctor-id="turnoData.doctor"
              @next="nextStep"
              @back="prevStep"
            />
          </Transition>
        </template>

        <template #pago>
          <Transition name="step" mode="out-in">
            <StepSelectPayment
              key="pago"
              v-model="turnoData.pago"
              @next="nextStep"
              @back="prevStep"
            />
          </Transition>
        </template>

        <template #confirmacion>
          <Transition name="step" mode="out-in">
            <StepConfirmation
              key="confirmacion"
              :data="turnoData"
              :doctor-info="selectedDoctorInfo"
              :is-submitting="isSubmitting"
              :submit-error="submitError"
              @back="prevStep"
              @confirm="confirmarTurno"
            />
          </Transition>
        </template>
      </UStepper>
    </div>
  </div>
</template>

<style scoped>
.step-enter-active,
.step-leave-active {
  transition: all 0.25s ease;
}
.step-enter-from {
  opacity: 0;
  transform: translateX(16px);
}
.step-leave-to {
  opacity: 0;
  transform: translateX(-16px);
}
</style>
