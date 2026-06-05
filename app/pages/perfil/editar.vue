<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { UpdateProfileOutput } from '~/utils/schemas/users'
import { updateProfileSchema } from '~/utils/schemas/users'

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

useSeoMeta({
  title: 'Editar perfil',
  description: 'Actualizá tu información personal',
})

const toast = useToast()
const { user, loading, updateProfile, fetchProfile } = useUsers()

const form = useTemplateRef('form')

const state = reactive<Partial<UpdateProfileOutput>>({
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  dateOfBirth: '',
})

onMounted(async () => {
  if (!user.value) {
    await fetchProfile()
  }
  if (user.value) {
    state.firstName = user.value.firstName
    state.lastName = user.value.lastName
    state.email = user.value.email || ''
    state.phone = user.value.phone || ''
    state.dateOfBirth = user.value.dateOfBirth || ''
  }
})

async function onSubmit(event: FormSubmitEvent<UpdateProfileOutput>) {
  try {
    await updateProfile({
      firstName: event.data.firstName,
      lastName: event.data.lastName,
      email: event.data.email || null,
      phone: event.data.phone || null,
      dateOfBirth: event.data.dateOfBirth || null,
    })
    toast.add({
      title: 'Perfil actualizado',
      description: 'Los cambios se guardaron correctamente.',
      color: 'success',
    })
    await navigateTo(selectRouteByRole(user.value!.role))
  }
  catch (error: any) {
    const message = error?.data?.message || error?.message || 'Ocurrió un error al actualizar tu perfil.'
    form.value?.setErrors([{ message }])
  }
}
</script>

<template>
  <div class="max-w-lg mx-auto">
    <div class="text-center mb-6">
      <h1 class="text-xl font-semibold text-default">
        Editar perfil
      </h1>
      <p class="mt-1 text-base text-muted">
        Actualizá tu información personal
      </p>
    </div>

    <UForm
      ref="form"
      :schema="updateProfileSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFieldGroup class="space-x-2">
        <UFormField name="firstName" label="Nombre" required>
          <UInput v-model="state.firstName" class="w-full" placeholder="Juan" />
        </UFormField>

        <UFormField name="lastName" label="Apellido" required>
          <UInput v-model="state.lastName" class="w-full" placeholder="Pérez" />
        </UFormField>
      </UFieldGroup>

      <UFormField name="email" label="Email" required>
        <UInput v-model="state.email" class="w-full" type="email" placeholder="juan@ejemplo.com" />
      </UFormField>

      <UFormField name="phone" label="Teléfono">
        <UInput v-model="state.phone" class="w-full" type="tel" placeholder="+54 9 11 1234-5678" />
      </UFormField>

      <UFormField name="dateOfBirth" label="Fecha de nacimiento">
        <UInput v-model="state.dateOfBirth" class="w-full" type="date" />
      </UFormField>

      <UButton
        type="submit"
        label="Guardar cambios"
        class="flex-1"
        :loading="loading"
        block
      />

      <p v-if="user" class="text-center text-sm text-muted">
        <ULink :to="selectRouteByRole(user.role)" class="font-medium">
          Volver al Panel de Control
        </ULink>
      </p>
    </UForm>
  </div>
</template>
