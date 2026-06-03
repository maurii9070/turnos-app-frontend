<script setup lang="ts">
import type { FormSubmitEvent } from '@nuxt/ui'
import type { ChangePasswordOutput } from '~/utils/schemas/users'
import { changePasswordSchema } from '~/utils/schemas/users'

definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

useSeoMeta({
  title: 'Cambiar contraseña',
  description: 'Actualizá tu contraseña de acceso',
})

const toast = useToast()
const { user, changePassword, loading, fetchProfile } = useUsers()
const form = useTemplateRef('form')

const state = reactive<Partial<ChangePasswordOutput>>({
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
})

onMounted(async () => {
  if (!user.value) {
    await fetchProfile()
  }
})

async function onSubmit(event: FormSubmitEvent<ChangePasswordOutput>) {
  try {
    await changePassword({
      currentPassword: event.data.currentPassword,
      newPassword: event.data.newPassword,
    })
    toast.add({
      title: 'Contraseña actualizada',
      description: 'Tu contraseña fue cambiada exitosamente.',
      color: 'success',
    })
    await navigateTo('/dashboard')
  }
  catch (error: any) {
    const message = error?.data?.message || error?.message || 'No se pudo cambiar la contraseña.'
    form.value?.setErrors([{ message }])
  }
}
</script>

<template>
  <div class="text-center">
    <h1 class="text-xl font-semibold text-default">
      Cambiar contraseña
    </h1>
    <p class="mt-1 text-base text-muted">
      Actualizá tu contraseña de acceso
    </p>
  </div>

  <UAlert
    v-if="user?.mustChangePassword"
    title="Debes cambiar tu contraseña"
    description="Por seguridad, necesitás cambiar tu contraseña antes de continuar."
    color="warning"
    variant="subtle"
    class="mt-4"
  />

  <UForm
    ref="form"
    :schema="changePasswordSchema"
    :state="state"
    class="space-y-4 mt-6"
    @submit="onSubmit"
  >
    <UFormField name="currentPassword" label="Contraseña actual" required>
      <UInput
        v-model="state.currentPassword"
        class="w-full"
        type="password"
        placeholder="Ingresá tu contraseña actual"
      />
    </UFormField>

    <UFormField name="newPassword" label="Nueva contraseña" required>
      <UInput
        v-model="state.newPassword"
        class="w-full"
        type="password"
        placeholder="Mínimo 6 caracteres"
      />
    </UFormField>

    <UFormField name="confirmPassword" label="Confirmar nueva contraseña" required>
      <UInput
        v-model="state.confirmPassword"
        class="w-full"
        type="password"
        placeholder="Repetí tu nueva contraseña"
      />
    </UFormField>

    <UButton type="submit" label="Guardar contraseña" block :loading="loading" />
  </UForm>

  <p class="text-center text-sm text-muted">
    <ULink to="/dashboard" class="text-primary font-medium">
      Volver al dashboard
    </ULink>
  </p>
</template>
