import type { ChangePasswordRequest, ChangePasswordResponse, UpdateProfileRequest, UserProfile } from '~/types/users'

export function useUsers() {
  const { $api } = useNuxtApp()
  const user = useState<UserProfile | null>('auth:user', () => null)
  const loading = useState<boolean>('users:loading', () => false)
  const isProfileLoaded = computed(() => user.value !== null)

  async function fetchProfile() {
    loading.value = true
    try {
      const response = await $api<{
        success: boolean
        message: string | null
        data: UserProfile
      }>('/api/users/me')

      if (response.success && response.data) {
        user.value = response.data
      }
      else {
        throw new Error(response.message ?? 'Error al obtener el perfil')
      }
    }
    finally {
      loading.value = false
    }
  }

  async function updateProfile(data: UpdateProfileRequest) {
    loading.value = true
    try {
      const response = await $api<{
        success: boolean
        message: string | null
        data: UserProfile
      }>('/api/users/me', {
        method: 'PUT',
        body: data,
      })

      if (response.success && response.data) {
        user.value = response.data
      }
      else {
        throw new Error(response.message ?? 'Error al actualizar el perfil')
      }
    }
    finally {
      loading.value = false
    }
  }

  async function changePassword(data: ChangePasswordRequest) {
    const response = await $api<{
      success: boolean
      message: string | null
      data: ChangePasswordResponse
    }>('/api/users/me/password', {
      method: 'PUT',
      body: data,
    })

    if (!response.success) {
      throw new Error(response.message ?? 'Error al cambiar la contraseña')
    }

    const currentUser = user.value
    if (currentUser) {
      currentUser.mustChangePassword = false
    }
  }

  function clearProfile() {
    user.value = null
  }

  return {
    user,
    loading,
    isProfileLoaded,
    fetchProfile,
    updateProfile,
    changePassword,
    clearProfile,
  }
}
