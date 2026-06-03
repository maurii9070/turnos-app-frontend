import type { UserRole } from '~/types/auth'

export default defineNuxtRouteMiddleware((to) => {
  const { role } = useAuth()
  const allowedRoles = to.meta.allowedRoles as UserRole[] | undefined

  if (!allowedRoles || allowedRoles.length === 0)
    return
  if (!role.value)
    return

  if (!allowedRoles.includes(role.value)) {
    throw createError({
      statusCode: 403,
      statusMessage: 'Acceso denegado',
    })
  }
})
