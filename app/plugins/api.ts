import { useAuth } from '~/composables/useAuth'

export default defineNuxtPlugin(() => {
  const { accessToken } = useAuth()
  const config = useRuntimeConfig()

  const api = $fetch.create({
    baseURL: config.public.apiBaseUrl,
    credentials: 'include',
    onRequest({ options }) {
      if (accessToken.value) {
        const headers = new Headers(options.headers)
        headers.set('Authorization', `Bearer ${accessToken.value}`)
        options.headers = headers
      }
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
