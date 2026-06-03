import type { ApiResponse } from '~/types/auth'
import type { DoctorAvailability } from '~/types/doctors'

export function useDoctorAvailabilities() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('doctor-availabilities:loading', () => false)

  async function fetchAvailabilities(
    doctorId: string,
    from?: string,
    to?: string,
  ): Promise<DoctorAvailability[]> {
    loading.value = true
    try {
      const params = new URLSearchParams()
      if (from) {
        params.set('from', from)
      }
      if (to) {
        params.set('to', to)
      }
      const query = params.toString() ? `?${params.toString()}` : ''
      const response = await $api<ApiResponse<DoctorAvailability[]>>(
        `/api/doctors/${doctorId}/availabilities${query}`,
      )
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Disponibilidades no encontradas')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchAvailabilities,
  }
}
