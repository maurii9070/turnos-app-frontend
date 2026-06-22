import type { RouterConfig } from '@nuxt/schema'

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    if (to.hash && to.hash.includes('access_token=')) {
      return { top: 0 }
    }

    if (savedPosition) {
      return savedPosition
    }

    if (to.hash) {
      return { el: to.hash, top: 80 }
    }

    return { top: 0 }
  },
}
