import type { LoginResponse, RegisterPatientRequest, UserRole } from '~/types/auth'

export function useAuth() {
  const { $api } = useNuxtApp()
  const accessToken = useState<string | null>('auth:token', () => null)
  const role = useState<UserRole | null>('auth:role', () => null)
  const isAuthenticated = computed(() => !!accessToken.value)

  const { fetchProfile } = useUsers()

  async function login(dni: string, password: string) {
    const response = await $api<{
      success: boolean
      message: string
      data: LoginResponse
    }>('/api/auth/login', {
      method: 'POST',
      body: { dni, password },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al iniciar sesión')
    }

    accessToken.value = response.data.accessToken
    role.value = response.data.role
    await fetchProfile()
  }

  async function register(data: RegisterPatientRequest) {
    const response = await $api<{
      success: boolean
      message: string
      data: unknown
    }>('/api/auth/register-patient', {
      method: 'POST',
      body: data,
    })

    return response
  }

  async function logout() {
    try {
      await $api('/api/auth/logout', { method: 'POST' })
    }
    catch {
      // Backend might error but we still clear local state
    }
    accessToken.value = null
    role.value = null
    useState<unknown>('auth:user').value = null
  }

  async function init() {
    if (accessToken.value)
      return
    const config = useRuntimeConfig()
    try {
      const response = await $fetch<{
        success: boolean
        message: string
        data: { accessToken: string, role: UserRole }
      }>('/api/auth/refresh', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include',
      })
      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        role.value = response.data.role
        await fetchProfile()
      }
    }
    catch {
      // No valid session to restore
    }
  }

  return {
    accessToken,
    role,
    isAuthenticated,
    login,
    register,
    logout,
    init,
  }
}
