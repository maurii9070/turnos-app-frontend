import type { GoogleLoginRequest, LoginResponse, RegisterPatientRequest, UserRole } from '~/types/auth'

interface StoredAuth {
  token: string
  role: UserRole
}

const REFRESH_TOKEN_KEY = 'auth:refresh-token'

function getRefreshToken(): string | null {
  if (import.meta.server)
    return null
  return localStorage.getItem(REFRESH_TOKEN_KEY)
}

function setRefreshToken(token: string | null) {
  if (import.meta.server)
    return
  if (token) {
    localStorage.setItem(REFRESH_TOKEN_KEY, token)
  }
  else {
    localStorage.removeItem(REFRESH_TOKEN_KEY)
  }
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

  function setAuth(data: LoginResponse) {
    accessToken.value = data.accessToken
    role.value = data.role
    authCookie.value = { token: data.accessToken, role: data.role }
    setRefreshToken(data.refreshToken)
  }

  function clearAuth() {
    accessToken.value = null
    role.value = null
    useState<unknown>('auth:user').value = null
    authCookie.value = null
    setRefreshToken(null)
  }

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

    setAuth(response.data)
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

    setAuth(response.data)
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
      const refreshToken = getRefreshToken()
      await $api('/api/auth/logout', {
        method: 'POST',
        headers: refreshToken ? { 'X-Refresh-Token': refreshToken } : {},
      })
    }
    catch {
      // Backend might error but we still clear local state
    }
    clearAuth()
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

    // No stored token — try to refresh
    await refreshToken()
  }

  async function refreshToken(): Promise<boolean> {
    accessToken.value = null
    role.value = null
    const config = useRuntimeConfig()
    const refreshToken = getRefreshToken()

    if (!refreshToken) {
      return false
    }

    try {
      const response = await $fetch<{
        success: boolean
        message: string
        data: { accessToken: string, refreshToken: string, role: UserRole }
      }>('/api/auth/refresh', {
        baseURL: config.public.apiBaseUrl,
        method: 'POST',
        headers: {
          'X-Refresh-Token': refreshToken,
        },
      })
      if (response.success && response.data) {
        accessToken.value = response.data.accessToken
        role.value = response.data.role
        authCookie.value = { token: response.data.accessToken, role: response.data.role }
        setRefreshToken(response.data.refreshToken)
        await fetchProfile()
        return true
      }
      return false
    }
    catch {
      clearAuth()
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
