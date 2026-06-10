import type { ApiResponse } from '~/types/auth'
import type {
  CreateSpecialtyRequest,
  CreateSpecialtyResponse,
  Specialty,
  UpdateSpecialtyRequest,
  UpdateSpecialtyResponse,
} from '~/types/specialties'

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

  async function createSpecialty(data: CreateSpecialtyRequest): Promise<CreateSpecialtyResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreateSpecialtyResponse>>('/api/specialties', {
        method: 'POST',
        body: data,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear la especialidad')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function updateSpecialty(
    id: string,
    data: UpdateSpecialtyRequest,
  ): Promise<UpdateSpecialtyResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<UpdateSpecialtyResponse>>(`/api/specialties/${id}`, {
        method: 'PUT',
        body: data,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al actualizar la especialidad')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function deleteSpecialty(id: string): Promise<void> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<object>>(`/api/specialties/${id}`, {
        method: 'DELETE',
      })

      if (!response.success) {
        throw new Error(response.message ?? 'Error al eliminar la especialidad')
      }
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchSpecialties,
    fetchSpecialtyById,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
  }
}
