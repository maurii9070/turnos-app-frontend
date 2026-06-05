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
  <div class="space-y-6">
    <h2 class="text-lg font-semibold text-default">
      Seleccioná un médico
    </h2>

    <USelect
      v-model="selectedSpecialty"
      :items="specialtyOptions"
      placeholder="Filtrar por especialidad"
      class="w-full sm:w-72"
    />

    <div v-if="isLoading || doctorsLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <USkeleton class="size-10 rounded-full" />
        <USkeleton class="h-4 w-32" />
        <USkeleton class="h-3 w-24" />
      </div>
    </div>

    <div v-else-if="doctors.length === 0" class="py-16 text-center">
      <UIcon name="i-lucide-users" class="mx-auto size-12 text-muted" />
      <p class="mt-3 font-medium text-default">
        No se encontraron médicos
      </p>
      <p class="text-sm text-muted">
        Probá con otra especialidad.
      </p>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <button
        v-for="doctor in doctors"
        :key="doctor.doctorId"
        type="button"
        class="group relative flex items-start gap-4 rounded-xl border p-5 text-left transition-all duration-200"
        :class="modelValue === doctor.doctorId
          ? 'border-primary/50 bg-primary/5 ring-2 ring-primary/20'
          : 'border-default bg-default hover:border-muted hover:shadow-sm active:scale-[0.99]'"
        @click="selectDoctor(doctor.doctorId)"
      >
        <UAvatar
          :alt="`${doctor.firstName} ${doctor.lastName}`"
          size="md"
          :ui="{ fallback: 'text-sm font-semibold' }"
          class="mt-0.5 shrink-0"
        />

        <div class="min-w-0 flex-1">
          <div class="flex items-center gap-2">
            <span class="truncate font-medium text-default transition-colors group-hover:text-primary">
              {{ doctor.firstName }} {{ doctor.lastName }}
            </span>
            <UIcon
              v-if="modelValue === doctor.doctorId"
              name="i-lucide-check-circle"
              class="size-4 shrink-0 text-primary"
            />
          </div>
          <p class="truncate text-sm text-muted">
            {{ doctor.specialtyName }}
          </p>
          <p class="mt-1 text-sm font-semibold text-default">
            {{ formatCurrency(doctor.consultationPrice) }}
          </p>
        </div>
      </button>
    </div>

    <div class="flex justify-end border-t border-default pt-6">
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
