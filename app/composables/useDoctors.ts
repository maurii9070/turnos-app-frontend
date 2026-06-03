import type { ApiResponse } from '~/types/auth'
import type { DoctorDetail, DoctorListItem } from '~/types/doctors'

export function useDoctors() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('doctors:loading', () => false)

  async function fetchDoctors(specialtyId?: string): Promise<DoctorListItem[]> {
    loading.value = true
    try {
      const url = specialtyId ? `/api/doctors?specialtyId=${specialtyId}` : '/api/doctors'
      const response = await $api<ApiResponse<DoctorListItem[]>>(url)
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Error al obtener doctores')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchDoctorById(id: string): Promise<DoctorDetail> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<DoctorDetail>>(`/api/doctors/${id}`)
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Doctor no encontrado')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchDoctors,
    fetchDoctorById,
  }
}
