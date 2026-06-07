import type { UserRole } from '~/types/auth'

export function formatIsoDate(dateStr: string | null) {
  if (!dateStr)
    return '-'

  const [year, month, day] = dateStr.split('-').map(Number)
  if (!year || !month || !day)
    return dateStr

  return new Intl.DateTimeFormat('es-AR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date(year, month - 1, day))
}

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
