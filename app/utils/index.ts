import type { UserRole } from '~/types/auth'

export const { format: formatDate } = new Intl.DateTimeFormat('es-AR', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

export const { format: formatCurrency } = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  minimumFractionDigits: 0,
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
