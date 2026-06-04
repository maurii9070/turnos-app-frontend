<script setup lang="ts">
const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'next': []
}>()

const doctors = [
  { id: 'dr-garcia', name: 'Dr. García', specialty: 'Cardiología' },
  { id: 'dr-lopez', name: 'Dra. López', specialty: 'Dermatología' },
  { id: 'dr-martinez', name: 'Dr. Martínez', specialty: 'Clínica Médica' },
]

function selectDoctor(doctorId: string) {
  emit('update:modelValue', doctorId)
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
      Seleccioná un médico
    </h2>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="doctor in doctors"
        :key="doctor.id"
        type="button"
        class="relative flex flex-col items-start rounded-lg border p-4 text-left transition-colors"
        :class="modelValue === doctor.id
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-muted bg-default hover:bg-elevated'"
        @click="selectDoctor(doctor.id)"
      >
        <span class="font-medium">{{ doctor.name }}</span>
        <span class="text-sm text-muted">{{ doctor.specialty }}</span>
        <UIcon
          v-if="modelValue === doctor.id"
          name="i-lucide-check"
          class="absolute right-3 top-3 size-4"
        />
      </button>
    </div>

    <div class="flex justify-end pt-4">
      <UButton
        label="Continuar"
        color="primary"
        :disabled="!modelValue"
        @click="handleNext"
      />
    </div>
  </div>
</template>
