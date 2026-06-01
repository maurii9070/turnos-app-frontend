<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { RegisterOutput } from '~/utils/schemas/auth'
import { registerSchema } from '~/utils/schemas/auth'

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Crear cuenta',
  description: 'Registrate como paciente',
})

const toast = useToast()
const { register } = useAuth()

const form = useTemplateRef('form')
const loading = ref(false)

const state = reactive<Partial<RegisterOutput>>({
  dni: '',
  firstName: '',
  lastName: '',
  password: '',
  confirmPassword: '',
  dateOfBirth: '',
})

async function onSubmit(event: FormSubmitEvent<RegisterOutput>) {
  loading.value = true
  try {
    const { confirmPassword: _, ...payload } = event.data
    await register(payload)
    toast.add({ title: 'Registro exitoso', description: 'Ya podés iniciar sesión.', color: 'success' })
    await navigateTo('/login')
  }
  catch (error: any) {
    const message = error?.data?.message || 'Ocurrió un error al registrarte.'
    form.value?.setErrors([{ message }])
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="text-center">
    <h1 class="text-xl font-semibold text-default">
      Crear cuenta
    </h1>
    <p class="mt-1 text-base text-muted">
      Registrate como paciente
    </p>
  </div>

  <div class="space-y-4">
    <UButton
      label="Google"
      icon="i-simple-icons-google"
      color="neutral"
      variant="outline"
      block
      @click="toast.add({ title: 'Google', description: 'Registro con Google próximamente.' })"
    />
    <USeparator label="o" />
  </div>

  <UForm ref="form" :schema="registerSchema" :state="state" class="space-y-4" @submit="onSubmit">
    <UFormField name="dni" label="DNI" required>
      <UInput v-model="state.dni" class="w-full" placeholder="Ingresá tu DNI" />
    </UFormField>

    <UFieldGroup class="space-x-2">
      <UFormField name="firstName" label="Nombre" required>
        <UInput v-model="state.firstName" class="w-full" placeholder="Juan" />
      </UFormField>

      <UFormField name="lastName" label="Apellido" required>
        <UInput v-model="state.lastName" class="w-full" placeholder="Pérez" />
      </UFormField>
    </UFieldGroup>

    <UFormField name="password" label="Contraseña" required>
      <UInput v-model="state.password" class="w-full" type="password" placeholder="Mínimo 6 caracteres" />
    </UFormField>

    <UFormField name="confirmPassword" label="Repetir contraseña" required>
      <UInput v-model="state.confirmPassword" class="w-full" type="password" placeholder="Repetí tu contraseña" />
    </UFormField>

    <UFormField name="dateOfBirth" label="Fecha de nacimiento" required>
      <UInput v-model="state.dateOfBirth" class="w-full" type="date" />
    </UFormField>

    <UButton type="submit" label="Registrarse" block :loading="loading" />
  </UForm>

  <p class="text-center text-sm text-muted">
    ¿Ya tenés cuenta?
    <ULink to="/login" class="text-primary font-medium">
      Iniciá sesión
    </ULink>.
  </p>
</template>
