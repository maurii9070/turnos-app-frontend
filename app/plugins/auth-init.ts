export default defineNuxtPlugin({
  name: 'auth-init',
  async setup() {
    const { init } = useAuth()
    await init()
  },
})
