export function useGoogleAuth() {
  const { $supabase } = useNuxtApp()
  const toast = useToast()

  async function signInWithGoogle() {
    try {
      const redirectTo = `${window.location.origin}/auth/callback`
      const { error } = await $supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      })

      if (error) {
        throw error
      }
    }
    catch (error: any) {
      toast.add({
        title: 'Error',
        description: error?.message || 'No se pudo iniciar sesión con Google.',
        color: 'error',
      })
    }
  }

  return {
    signInWithGoogle,
  }
}
