import type { UserRole } from '~/types/auth'

export const { format: formatDate } = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export function selectRouteByRole(role: UserRole) {
  switch (role) {
    case 'Patient':
      return '/pacientes'
    case 'Doctor':
      return '/doctores'
    case 'Admin':
    case 'SuperAdmin':
      return '/admin'
    default:
      return '/'
  }
}
