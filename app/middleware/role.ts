import type { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware((to) => {
  const { user } = useAuth()
  const allowedRoles = to.meta.allowedRoles as UserRole[] | undefined

  if (!allowedRoles || allowedRoles.length === 0)
    return
  if (!user.value)
    return

  if (!allowedRoles.includes(user.value.role)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado',
    })
  }
})
