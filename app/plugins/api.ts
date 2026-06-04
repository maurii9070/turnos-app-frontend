import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { accessToken } = useAuth()
  const config = useRuntimeConfig()

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
    async onResponseError({ response }) {
      if (response.status === 401) {
        const route = useRoute()
        if (route.path !== '/login') {
          await navigateTo('/login')
        }
      }
    },
  })

  return {
    provide: {
      api,
    },
  }
})
