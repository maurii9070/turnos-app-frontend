import type { GoogleLoginRequest, LoginResponse, RegisterPatientRequest, UserRole } from '~/types/auth'

interface StoredAuth {
  token: string
  role: UserRole
}

export function useAuth() {
  const { $api } = useNuxtApp()

  const accessToken = useState<string | null>('auth:token', () => null)
  const role = useState<UserRole | null>('auth:role', () => null)
  const isAuthenticated = computed(() => !!accessToken.value)

  const authCookie = useCookie<StoredAuth | null>('auth-session', {
    default: () => null,
    maxAge: 60 * 60 * 24 * 7,
    sameSite: 'lax',
    secure: true,
    path: '/',
  })

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
    authCookie.value = { token: response.data.accessToken, role: response.data.role }
    await fetchProfile()
  }

  async function loginWithGoogle(supabaseToken: string) {
    const response = await $api<{
      success: boolean
      message: string
      data: LoginResponse
    }>('/api/auth/google', {
      method: 'POST',
      body: { supabaseToken } satisfies GoogleLoginRequest,
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al iniciar sesión con Google')
    }

    accessToken.value = response.data.accessToken
    role.value = response.data.role
    authCookie.value = { token: response.data.accessToken, role: response.data.role }
    await fetchProfile()
  }

  async function completeDni(dni: string) {
    const response = await $api<{
      success: boolean
      message: string
      data: { userId: string, dni: string }
    }>('/api/auth/complete-dni', {
      method: 'POST',
      body: { dni },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al guardar el DNI')
    }

    await fetchProfile()
    return response.data
  }

  async function linkGoogle(supabaseToken: string) {
    const response = await $api<{
      success: boolean
      message: string
      data: { userId: string, googleId: string | null }
    }>('/api/users/link-google', {
      method: 'POST',
      body: { supabaseToken },
    })

    if (!response.success || !response.data) {
      throw new Error(response.message || 'Error al vincular la cuenta de Google')
    }

    await fetchProfile()
    return response.data
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
    authCookie.value = null
  }

  async function init() {
    if (accessToken.value)
      return

    // Restore from cookie (works on both client and server)
    const stored = authCookie.value
    if (stored) {
      accessToken.value = stored.token
      role.value = stored.role
      return
    }

    // No stored token — try the backend refresh cookie
    const config = useRuntimeConfig()
    const headers: Record<string, string> = {}
    if (import.meta.server) {
      const cookieHeader = useRequestHeaders(['cookie']).cookie
      if (cookieHeader)
        headers.cookie = cookieHeader
    }
    try {
      const response = await $fetch<{
        success: boolean
        message: string
        data: { accessToken: string, role: UserRole }
      }>('/api/auth/refresh', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include',
        headers,
      })
      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        role.value = response.data.role
        authCookie.value = { token: response.data.accessToken, role: response.data.role }
        await fetchProfile()
      }
    }
    catch {
      // No valid session to restore
    }
  }

  async function refreshToken(): Promise<boolean> {
    accessToken.value = null
    role.value = null
    const config = useRuntimeConfig()
    const headers: Record<string, string> = {}
    if (import.meta.server) {
      const cookieHeader = useRequestHeaders(['cookie']).cookie
      if (cookieHeader)
        headers.cookie = cookieHeader
    }
    try {
      const response = await $fetch<{
        success: boolean
        message: string
        data: { accessToken: string, role: UserRole }
      }>('/api/auth/refresh', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        credentials: 'include',
        headers,
      })
      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        role.value = response.data.role
        authCookie.value = { token: response.data.accessToken, role: response.data.role }
        await fetchProfile()
        return true
      }
      return false
    }
    catch {
      return false
    }
  }

  return {
    accessToken,
    role,
    isAuthenticated,
    login,
    loginWithGoogle,
    completeDni,
    linkGoogle,
    register,
    logout,
    init,
    refreshToken,
  }
}
