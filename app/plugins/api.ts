import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { accessToken, refreshToken } = useAuth()
  const config = useRuntimeConfig()

  let isRefreshing = false
  let refreshPromise: Promise<boolean> | null = null

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
    onRequest({ options }) {
      const headers = new Headers(options.headers)
      if (import.meta.server) {
        const cookieHeader = useRequestHeaders(['cookie']).cookie
        if (cookieHeader)
          headers.set('cookie', cookieHeader)
      }
      if (accessToken.value)
        headers.set('Authorization', `Bearer ${accessToken.value}`)
      options.headers = headers
    },
    async onResponseError({ response, request, options }) {
      if (response.status !== 401)
        return

      const route = useRoute()
      if (route.path === '/login')
        return

      if (!isRefreshing) {
        isRefreshing = true
        refreshPromise = refreshToken().finally(() => {
          isRefreshing = false
          refreshPromise = null
        })
      }

      if (refreshPromise) {
        const refreshed = await refreshPromise
        if (refreshed) {
          const headers = new Headers(options.headers)
          headers.set('Authorization', `Bearer ${accessToken.value}`)
          return $fetch(request, { ...options, headers } as any)
        }
      }

      await navigateTo('/login')
    },
  })

  return {
    provide: {
      api,
    },
  }
})
