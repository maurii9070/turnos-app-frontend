export default defineNuxtPlugin({
  name: 'auth-init',
  async setup() {
    if (import.meta.client) {
      const { init } = useAuth()
      await init()
    }
  },
})
