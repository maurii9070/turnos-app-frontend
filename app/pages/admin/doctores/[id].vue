<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { DoctorDetail } from '~/types/doctors'
import type { Specialty } from '~/types/specialties'
import * as v from 'valibot'

const updateSchema = v.object({
  specialtyId: v.pipe(
    v.string('La especialidad es obligatoria.'),
    v.nonEmpty('La especialidad es obligatoria.'),
  ),
  licenseNumber: v.pipe(
    v.string('La matrícula es obligatoria.'),
    v.nonEmpty('La matrícula es obligatoria.'),
    v.maxLength(50, 'La matrícula no puede superar los 50 caracteres.'),
  ),
  consultationPrice: v.pipe(
    v.number('El precio de consulta es obligatorio.', v.number()),
    v.minValue(0, 'El precio no puede ser negativo.'),
  ),
})

type UpdateOutput = v.InferOutput<typeof updateSchema>

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['SuperAdmin'],
  layout: 'dashboard',
})

const route = useRoute()
const doctorId = route.params.id as string

const { fetchDoctorById, updateDoctor, loading } = useDoctors()
const { fetchSpecialties } = useSpecialties()
const toast = useToast()
const form = useTemplateRef('form')

const doctor = ref<DoctorDetail | null>(null)
const specialties = ref<Specialty[]>([])
const error = ref<string | null>(null)
const saving = ref(false)

const infoState = reactive<Partial<UpdateOutput>>({
  specialtyId: '',
  licenseNumber: '',
  consultationPrice: 0,
})

const tabs = [
  { key: 'info', label: 'Información', icon: 'i-lucide-user' },
  { key: 'schedules', label: 'Horarios', icon: 'i-lucide-clock' },
  { key: 'availabilities', label: 'Excepciones', icon: 'i-lucide-calendar-x' },
] as const

const activeTab = ref<string>('info')

async function loadData() {
  error.value = null
  try {
    const [doc, specs] = await Promise.all([
      fetchDoctorById(doctorId),
      fetchSpecialties(),
    ])
    doctor.value = doc
    specialties.value = specs
    infoState.specialtyId = doc.specialty?.id ?? ''
    infoState.licenseNumber = doc.licenseNumber
    infoState.consultationPrice = doc.consultationPrice
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar los datos del doctor'
  }
}

async function onUpdateInfo(event: FormSubmitEvent<UpdateOutput>) {
  saving.value = true
  try {
    const result = await updateDoctor(doctorId, {
      specialtyId: event.data.specialtyId,
      licenseNumber: event.data.licenseNumber,
      consultationPrice: event.data.consultationPrice,
    })

    if (doctor.value) {
      doctor.value.specialty = result.specialty
      doctor.value.licenseNumber = result.licenseNumber
      doctor.value.consultationPrice = result.consultationPrice
    }

    toast.add({
      title: 'Doctor actualizado',
      description: 'La información del doctor fue actualizada con éxito.',
      color: 'success',
    })
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al actualizar el doctor',
      color: 'error',
    })
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  loadData()
})

useHead({
  title: doctor.value
    ? `Doctor: ${doctor.value.firstName} ${doctor.value.lastName}`
    : 'Editar doctor',
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <UButton
        icon="i-lucide-arrow-left"
        label="Volver"
        color="neutral"
        variant="ghost"
        size="sm"
        to="/admin/doctores"
        class="mb-2"
      />
      <h1 class="text-2xl font-semibold">
        {{ doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Editar doctor' }}
      </h1>
      <p class="mt-1 text-muted">
        {{ doctor ? `DNI: ${doctor.dni}` : 'Cargando...' }}
      </p>
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Error"
      icon="i-lucide-alert-circle"
      :description="error"
    >
      <template #footer>
        <UButton label="Reintentar" size="sm" variant="outline" @click="loadData" />
      </template>
    </UAlert>

    <div v-if="loading && !doctor" class="flex justify-center py-12">
      <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
    </div>

    <template v-if="doctor">
      <div class="flex border-b border-default">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors"
          :class="activeTab === tab.key
            ? 'border-primary text-primary'
            : 'border-transparent text-muted hover:text-default'"
          @click="activeTab = tab.key"
        >
          <UIcon :name="tab.icon" class="size-4" />
          {{ tab.label }}
        </button>
      </div>

      <div v-if="activeTab === 'info'" class="flex justify-center">
        <UForm
          ref="form"
          :schema="updateSchema"
          :state="infoState"
          class="w-full max-w-lg space-y-4 rounded-xl border border-default bg-default p-6"
          @submit="onUpdateInfo"
        >
          <UFormField name="specialtyId" label="Especialidad" required>
            <USelect
              v-model="infoState.specialtyId"
              :items="specialties"
              value-key="id"
              label-key="name"
              placeholder="Seleccioná una especialidad"
              :disabled="saving"
            />
          </UFormField>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <UFormField name="licenseNumber" label="Matrícula" required>
              <UInput
                v-model="infoState.licenseNumber"
                class="w-full"
                placeholder="MN-12345"
                :disabled="saving"
              />
            </UFormField>

            <UFormField name="consultationPrice" label="Precio de consulta" required>
              <UInput
                v-model.number="infoState.consultationPrice"
                type="number"
                class="w-full"
                placeholder="5000"
                :disabled="saving"
              />
            </UFormField>
          </div>

          <UButton
            type="submit"
            label="Guardar cambios"
            icon="i-lucide-save"
            color="primary"
            block
            :loading="saving"
          />
        </UForm>
      </div>

      <div v-if="activeTab === 'schedules'">
        <DoctorScheduleEditor :doctor-id="doctorId" />
      </div>

      <div v-if="activeTab === 'availabilities'">
        <DoctorAvailabilityManager :doctor-id="doctorId" />
      </div>
    </template>
  </div>
</template>
