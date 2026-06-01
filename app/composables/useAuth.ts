import type { AuthUser, LoginResponse, RegisterPatientRequest, UserRole } from '~/types/auth'

export function useAuth() {
  const accessToken = useState<string | null>('auth:token', () => null)
  const user = useState<AuthUser | null>('auth:user', () => null)
  const isAuthenticated = computed(() => !!accessToken.value)

  async function login(dni: string, password: string) {
    const nuxtApp = useNuxtApp()
    const response = await nuxtApp.$api<{
      success: boolean
      message: string
      data: LoginResponse
    }>('/api/auth/login', {
      method: 'POST',
      body: { dni, password },
    })

    accessToken.value = response.data.accessToken
    user.value = {
      id: '',
      dni,
      firstName: '',
      lastName: '',
      role: response.data.role,
    }
  }

  async function register(data: RegisterPatientRequest) {
    const nuxtApp = useNuxtApp()
    const response = await nuxtApp.$api<{
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
    const nuxtApp = useNuxtApp()
    try {
      await nuxtApp.$api('/api/auth/logout', { method: 'POST' })
    }
    catch {
      // Backend might error but we still clear local state
    }
    accessToken.value = null
    user.value = null
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
        user.value = {
          id: '',
          dni: '',
          firstName: '',
          lastName: '',
          role: response.data.role,
        }
      }
    }
    catch {
      // No valid session to restore
    }
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    login,
    register,
    logout,
    init,
  }
}
