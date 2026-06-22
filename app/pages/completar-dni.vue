<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import * as v from 'valibot'

const toast = useToast()
const { completeDni } = useAuth()
const { user, fetchProfile } = useUsers()

const loading = ref(false)

const dniSchema = v.object({
  dni: v.pipe(
    v.string(),
    v.nonEmpty('El DNI es obligatorio.'),
    v.maxLength(20, 'El DNI no puede tener más de 20 caracteres.'),
  ),
})

type DniOutput = v.InferOutput<typeof dniSchema>

const state = reactive({
  dni: '',
})

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

useSeoMeta({
  title: 'Completar DNI',
  description: 'Ingresá tu DNI para continuar',
})

onMounted(async () => {
  if (!user.value) {
    await fetchProfile()
  }

  if (user.value && !user.value.requiresDni) {
    const target = user.value.role ? selectRouteByRole(user.value.role) : '/'
    await navigateTo(target)
  }
})

async function onSubmit(event: FormSubmitEvent<DniOutput>) {
  loading.value = true
  try {
    await completeDni(event.data.dni)
    toast.add({
      title: 'DNI guardado',
      description: 'Ya podés usar tu cuenta.',
      color: 'success',
    })

    const target = user.value?.role ? selectRouteByRole(user.value.role) : '/'
    await navigateTo(target)
  }
  catch (error: any) {
    const message = error?.data?.message || error?.message || 'Ocurrió un error al guardar el DNI.'
    toast.add({
      title: 'Error',
      description: message,
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="max-w-md mx-auto">
    <div class="text-center mb-6">
      <h1 class="text-xl font-semibold text-default">
        Completá tu DNI
      </h1>
      <p class="mt-1 text-base text-muted">
        Necesitamos tu DNI para continuar con el registro.
      </p>
    </div>

    <UForm
      :schema="dniSchema"
      :state="state"
      class="space-y-4"
      @submit="onSubmit"
    >
      <UFormField name="dni" label="DNI" required>
        <UInput v-model="state.dni" class="w-full" placeholder="Ingresá tu DNI" />
      </UFormField>

      <UButton
        type="submit"
        label="Guardar y continuar"
        class="flex-1"
        :loading="loading"
        block
      />
    </UForm>

    <p class="text-center text-sm text-muted mt-4">
      ¿Ya tenés una cuenta con ese DNI?
      <ULink to="/login" class="font-medium">
        Iniciá sesión con DNI
      </ULink>
      y vinculá Google desde tu perfil.
    </p>
  </div>
</template>
