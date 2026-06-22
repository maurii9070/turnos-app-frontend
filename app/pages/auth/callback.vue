<script setup lang="ts">
const { $supabase } = useNuxtApp()
const { loginWithGoogle, linkGoogle } = useAuth()
const toast = useToast()
const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)

definePageMeta({
  ssr: false,
  layout: 'auth',
})

onMounted(async () => {
  // Clean Supabase OAuth hash to avoid Vue Router treating the access_token as a CSS selector.
  if (window.location.hash) {
    history.replaceState({}, '', window.location.pathname + window.location.search)
  }

  try {
    const { data, error: sessionError } = await $supabase.auth.getSession()

    if (sessionError || !data.session) {
      throw new Error(sessionError?.message || 'No se pudo obtener la sesión de Google.')
    }

    const isLinkMode = localStorage.getItem('google-link-mode') === 'true'
    localStorage.removeItem('google-link-mode')

    if (isLinkMode) {
      await linkGoogle(data.session.access_token)
      toast.add({
        title: 'Google vinculado',
        description: 'Tu cuenta de Google se vinculó correctamente.',
        color: 'success',
      })
      await navigateTo('/perfil/editar')
      return
    }

    await loginWithGoogle(data.session.access_token)

    const { user } = useUsers()
    if (user.value?.requiresDni) {
      await navigateTo('/completar-dni')
      return
    }

    const target = user.value?.role ? selectRouteByRole(user.value.role) : '/'
    await navigateTo(target)
  }
  catch (error: any) {
    loading.value = false
    error.value = error?.data?.message || error?.message || 'Error al procesar la cuenta de Google.'
    toast.add({
      title: 'Error',
      description: error.value,
      color: 'error',
    })

    setTimeout(() => {
      router.replace('/login')
    }, 3000)
  }
})
</script>

<template>
  <div class="flex flex-col items-center justify-center min-h-[50vh] p-4 text-center">
    <UIcon name="i-lucide-loader-2" class="size-10 animate-spin text-primary mb-4" />
    <h1 class="text-lg font-semibold">
      Completando inicio de sesión...
    </h1>
    <p class="text-sm text-muted mt-2">
      Estamos verificando tu cuenta de Google.
    </p>
    <p v-if="error" class="text-sm text-error mt-4">
      {{ error }}
    </p>
  </div>
</template>
