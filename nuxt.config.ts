// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxt/ui'],
  css: ['~/assets/css/main.css'],
  runtimeConfig: {
    public: {
      apiBaseUrl: 'http://localhost:5092',
    },
  },
  routeRules: {
    '/registro': { ssr: false },
    '/login': { ssr: false },
    '/pacientes/**': { ssr: false },
    '/doctores/**': { ssr: false },
    '/admin/**': { ssr: false },
  },
})
