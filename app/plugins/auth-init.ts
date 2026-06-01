export default defineNuxtPlugin({
  name: 'auth-init',
  enforce: 'pre',
  async setup() {
    if (import.meta.client) {
      const { init } = useAuth()
      await init()
    }
  },
})
