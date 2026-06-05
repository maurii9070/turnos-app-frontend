<script setup lang="ts">
import type { DoctorListItem } from '~/types/doctors'
import type { Specialty } from '~/types/specialties'

const props = defineProps<{
  modelValue: string | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string | null]
  'next': []
  'select': [doctor: DoctorListItem]
}>()

const { fetchSpecialties } = useSpecialties()
const { fetchDoctors, loading: doctorsLoading } = useDoctors()

const specialties = ref<Specialty[]>([])
const selectedSpecialty = ref<string | null>(null)
const doctors = ref<DoctorListItem[]>([])
const isLoading = ref(false)

async function loadSpecialties() {
  try {
    specialties.value = await fetchSpecialties()
  }
  catch {
    // silently fail or handle if needed
  }
}

async function loadDoctors(specialtyId?: string | null) {
  isLoading.value = true
  try {
    doctors.value = await fetchDoctors(specialtyId ?? undefined)
  }
  catch {
    doctors.value = []
  }
  finally {
    isLoading.value = false
  }
}

function selectDoctor(doctorId: string) {
  emit('update:modelValue', doctorId)
  const doctor = doctors.value.find(d => d.doctorId === doctorId)
  if (doctor) {
    emit('select', doctor)
  }
}

function handleNext() {
  if (props.modelValue) {
    emit('next')
  }
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 0,
  }).format(price)
}

const specialtyOptions = computed(() => [
  { label: 'Todas las especialidades', value: null },
  ...specialties.value.map(s => ({ label: s.name, value: s.id })),
])

watch(selectedSpecialty, (newVal) => {
  loadDoctors(newVal)
})

onMounted(() => {
  loadSpecialties()
  loadDoctors()
})
</script>

<template>
  <div class="space-y-4 py-4">
    <h2 class="text-lg font-semibold text-default">
      Seleccioná un médico
    </h2>

    <USelect
      v-model="selectedSpecialty"
      :items="specialtyOptions"
      placeholder="Filtrar por especialidad"
      class="w-full sm:w-72"
    />

    <div v-if="isLoading || doctorsLoading" class="flex items-center justify-center py-12">
      <USkeleton class="size-8" />
    </div>

    <div v-else-if="doctors.length === 0" class="py-12 text-center">
      <UIcon name="i-lucide-users" class="mx-auto size-10 text-muted" />
      <p class="mt-2 text-muted">
        No se encontraron médicos
      </p>
    </div>

    <div v-else class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="doctor in doctors"
        :key="doctor.doctorId"
        type="button"
        class="relative flex flex-col items-start rounded-lg border p-4 text-left transition-colors"
        :class="modelValue === doctor.doctorId
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-muted bg-default hover:bg-elevated'"
        @click="selectDoctor(doctor.doctorId)"
      >
        <span class="font-medium">
          {{ doctor.firstName }} {{ doctor.lastName }}
        </span>
        <span class="text-sm text-muted">
          {{ doctor.specialtyName }}
        </span>
        <span class="mt-1 text-sm font-semibold">
          {{ formatPrice(doctor.consultationPrice) }}
        </span>
        <UIcon
          v-if="modelValue === doctor.doctorId"
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
