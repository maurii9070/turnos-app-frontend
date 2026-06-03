import type { ApiResponse } from '~/types/auth'
import type { DoctorSchedule } from '~/types/doctors'

export function useDoctorSchedules() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('doctor-schedules:loading', () => false)

  async function fetchSchedules(doctorId: string): Promise<DoctorSchedule[]> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<DoctorSchedule[]>>(`/api/doctors/${doctorId}/schedules`)
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Horarios no encontrados')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchSchedules,
  }
}
