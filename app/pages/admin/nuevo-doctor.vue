<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { Specialty } from '~/types/specialties'
import * as v from 'valibot'

const doctorCreateSchema = v.pipe(
  v.object({
    dni: v.pipe(
      v.string('El DNI es obligatorio.'),
      v.nonEmpty('El DNI es obligatorio.'),
      v.regex(/^\d+$/, 'El DNI debe contener solo números.'),
    ),
    firstName: v.pipe(
      v.string('El nombre es obligatorio.'),
      v.nonEmpty('El nombre es obligatorio.'),
      v.maxLength(100, 'El nombre no puede superar los 100 caracteres.'),
    ),
    lastName: v.pipe(
      v.string('El apellido es obligatorio.'),
      v.nonEmpty('El apellido es obligatorio.'),
      v.maxLength(100, 'El apellido no puede superar los 100 caracteres.'),
    ),
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
    phone: v.optional(
      v.pipe(
        v.string(),
        v.check(
          s => s === '' || s.length <= 30,
          'El teléfono no puede superar los 30 caracteres.',
        ),
      ),
    ),
    email: v.optional(
      v.pipe(
        v.string(),
        v.check(
          s => s === '' || /^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(s),
          'El email no es válido.',
        ),
      ),
    ),
    password: v.pipe(
      v.string('La contraseña es obligatoria.'),
      v.nonEmpty('La contraseña es obligatoria.'),
      v.minLength(6, 'La contraseña debe tener al menos 6 caracteres.'),
    ),
    confirmPassword: v.pipe(
      v.string('Debés confirmar la contraseña.'),
      v.nonEmpty('Debés confirmar la contraseña.'),
    ),
  }),
  v.forward(
    v.partialCheck(
      [['password'], ['confirmPassword']],
      input => input.password === input.confirmPassword,
      'Las contraseñas no coinciden.',
    ),
    ['confirmPassword'],
  ),
)

type DoctorCreateOutput = v.InferOutput<typeof doctorCreateSchema>

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['SuperAdmin'],
  layout: 'dashboard',
})

useHead({
  title: 'Registrar Doctor',
})

const { createDoctor } = useDoctors()
const { fetchSpecialties } = useSpecialties()
const toast = useToast()
const form = useTemplateRef('form')
const loading = ref(false)
const specialties = ref<Specialty[]>([])

const state = reactive<Partial<DoctorCreateOutput>>({
  dni: '',
  firstName: '',
  lastName: '',
  specialtyId: '',
  licenseNumber: '',
  consultationPrice: 0,
  phone: '',
  email: '',
  password: '',
  confirmPassword: '',
})

onMounted(async () => {
  try {
    specialties.value = await fetchSpecialties()
  }
  catch {
    toast.add({
      title: 'Error',
      description: 'No se pudieron cargar las especialidades.',
      color: 'error',
    })
  }
})

async function onSubmit(event: FormSubmitEvent<DoctorCreateOutput>) {
  loading.value = true
  try {
    const result = await createDoctor({
      dni: event.data.dni,
      firstName: event.data.firstName,
      lastName: event.data.lastName,
      password: event.data.password,
      specialtyId: event.data.specialtyId,
      licenseNumber: event.data.licenseNumber,
      consultationPrice: event.data.consultationPrice,
      phone: event.data.phone || null,
      email: event.data.email || null,
    })

    toast.add({
      title: 'Doctor registrado',
      description: `${result.firstName} ${result.lastName} fue registrado con éxito. Ahora configurá sus horarios.`,
      color: 'success',
    })

    await navigateTo(`/admin/doctores/${result.doctorId}`)
  }
  catch (error: any) {
    const message = error?.data?.message || error?.message || 'Error al registrar el doctor'
    form.value?.setErrors([{ message }])
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-semibold">
        Registrar doctor
      </h1>
      <p class="mt-1 text-muted">
        Creá una cuenta para un nuevo doctor. Luego podrás configurar sus horarios.
      </p>
    </div>

    <div class="flex justify-center">
      <UForm
        ref="form"
        :schema="doctorCreateSchema"
        :state="state"
        class="w-full max-w-lg space-y-4 rounded-xl border border-default bg-default p-6"
        @submit="onSubmit"
      >
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField name="firstName" label="Nombre" required>
            <UInput
              v-model="state.firstName"
              class="w-full"
              placeholder="Juan"
              :disabled="loading"
            />
          </UFormField>

          <UFormField name="lastName" label="Apellido" required>
            <UInput
              v-model="state.lastName"
              class="w-full"
              placeholder="Pérez"
              :disabled="loading"
            />
          </UFormField>
        </div>

        <UFormField name="dni" label="DNI" required>
          <UInput
            v-model="state.dni"
            class="w-full"
            placeholder="12345678"
            :disabled="loading"
          />
        </UFormField>

        <UFormField name="specialtyId" label="Especialidad" required>
          <USelect
            v-model="state.specialtyId"
            :items="specialties"
            value-key="id"
            label-key="name"
            placeholder="Seleccioná una especialidad"
            :disabled="loading"
          />
        </UFormField>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField name="licenseNumber" label="Matrícula" required>
            <UInput
              v-model="state.licenseNumber"
              class="w-full"
              placeholder="MN-12345"
              :disabled="loading"
            />
          </UFormField>

          <UFormField name="consultationPrice" label="Precio de consulta" required>
            <UInput
              v-model.number="state.consultationPrice"
              type="number"
              class="w-full"
              placeholder="5000"
              :disabled="loading"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField name="phone" label="Teléfono">
            <UInput
              v-model="state.phone"
              class="w-full"
              placeholder="+54 11 1234-5678"
              :disabled="loading"
            />
          </UFormField>

          <UFormField name="email" label="Email">
            <UInput
              v-model="state.email"
              type="email"
              class="w-full"
              placeholder="juan@ejemplo.com"
              :disabled="loading"
            />
          </UFormField>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <UFormField name="password" label="Contraseña" required>
            <UInput
              v-model="state.password"
              type="password"
              class="w-full"
              placeholder="Mínimo 6 caracteres"
              :disabled="loading"
            />
          </UFormField>

          <UFormField name="confirmPassword" label="Confirmar contraseña" required>
            <UInput
              v-model="state.confirmPassword"
              type="password"
              class="w-full"
              placeholder="Repetí la contraseña"
              :disabled="loading"
            />
          </UFormField>
        </div>

        <UButton
          type="submit"
          label="Registrar doctor"
          icon="i-lucide-stethoscope"
          block
          :loading="loading"
        />
      </UForm>
    </div>
  </div>
</template>
