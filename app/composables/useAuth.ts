import type { AuthUser, LoginResponse, RegisterPatientRequest } from '~/types/auth'

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

  function logout() {
    accessToken.value = null
    user.value = null
  }

  return {
    accessToken,
    user,
    isAuthenticated,
    login,
    register,
    logout,
  }
}
