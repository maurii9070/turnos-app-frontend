export default defineNuxtPlugin(() => {
  if (window.location.hash.includes('access_token=')) {
    history.replaceState({}, '', window.location.pathname + window.location.search)
  }
})
