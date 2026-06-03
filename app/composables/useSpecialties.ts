import type { ApiResponse } from '~/types/auth'
import type { Specialty } from '~/types/specialties'

export function useSpecialties() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('specialties:loading', () => false)

  async function fetchSpecialties(): Promise<Specialty[]> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<Specialty[]>>('/api/specialties')
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Error al obtener especialidades')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchSpecialtyById(id: string): Promise<Specialty> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<Specialty>>(`/api/specialties/${id}`)
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Especialidad no encontrada')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchSpecialties,
    fetchSpecialtyById,
  }
}
