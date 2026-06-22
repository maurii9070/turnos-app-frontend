<script setup lang="ts">
import type { AuthFormField, FormSubmitEvent } from '@nuxt/ui'
import type { UserRole } from '~/types/auth'
import type { LoginOutput } from '~/utils/schemas/auth'
import { loginSchema } from '~/utils/schemas/auth'

const toast = useToast()
const { login, role, isAuthenticated } = useAuth()

const loading = ref(false)

definePageMeta({
  layout: 'auth',
})

useSeoMeta({
  title: 'Iniciar sesión',
  description: 'Ingresá a tu cuenta para continuar',
})

onMounted(() => {
  if (isAuthenticated.value) {
    navigateTo(selectRouteByRole(role.value!))
  }
})

const fields: AuthFormField[] = [
  {
    name: 'dni',
    type: 'text' as const,
    label: 'DNI',
    placeholder: 'Ingresá tu DNI',
    required: true,
  },
  {
    name: 'password',
    type: 'password' as const,
    label: 'Contraseña',
    placeholder: 'Ingresá tu contraseña',
    required: true,
  },
]

const { $supabase } = useNuxtApp()

const providers = [
  {
    label: 'Google',
    icon: 'i-simple-icons-google',
    onClick: async () => {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await $supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        toast.add({
          title: 'Error',
          description: error.message || 'No se pudo iniciar sesión con Google.',
          color: 'error',
        })
      }
    },
  },
]

const roleRedirects: Record<UserRole, string> = {
  Patient: '/pacientes',
  Doctor: '/doctores',
  Admin: '/admin',
  SuperAdmin: '/admin',
}

async function onSubmit(payload: FormSubmitEvent<LoginOutput>) {
  loading.value = true
  try {
    await login(payload.data.dni, payload.data.password)
    const target = role.value ? roleRedirects[role.value] : '/'
    toast.add({ title: 'Bienvenido', description: 'Inicio de sesión exitoso.', color: 'success' })
    await navigateTo(target)
  }
  catch (error: any) {
    toast.add({
      title: 'Error',
      description: error?.data?.message || 'Credenciales inválidas.',
      color: 'error',
    })
  }
  finally {
    loading.value = false
  }
}
</script>

<template>
  <UAuthForm
    :fields="fields"
    :schema="loginSchema"
    title="Iniciar sesión"
    icon="i-lucide-lock"
    :providers="providers"
    :submit="{
      label: 'Iniciar Sesión',
      loading,
    }"
    @submit="onSubmit"
  >
    <template #separator>
      <div class="w-full">
        <USeparator label="o" />
      </div>
    </template>

    <template #description>
      ¿No tenés cuenta?
      <ULink to="/registro" class="text-primary font-medium">
        Registrate
      </ULink>.
    </template>
  </UAuthForm>
</template>
