import type { ApiResponse } from '~/types/auth'
import type {
  CreateAvailabilityRequest,
  CreateAvailabilityResponse,
  DoctorAvailability,
  UpdateAvailabilityRequest,
  UpdateAvailabilityResponse,
} from '~/types/doctors'

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

  async function createAvailability(
    doctorId: string,
    data: CreateAvailabilityRequest,
  ): Promise<CreateAvailabilityResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreateAvailabilityResponse>>(
        `/api/doctors/${doctorId}/availabilities`,
        {
          method: 'POST',
          body: data,
        },
      )

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear la excepción')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function updateAvailability(
    doctorId: string,
    availabilityId: string,
    data: UpdateAvailabilityRequest,
  ): Promise<UpdateAvailabilityResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<UpdateAvailabilityResponse>>(
        `/api/doctors/${doctorId}/availabilities/${availabilityId}`,
        {
          method: 'PUT',
          body: data,
        },
      )

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al actualizar la excepción')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function deleteAvailability(
    doctorId: string,
    availabilityId: string,
  ): Promise<void> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<object>>(
        `/api/doctors/${doctorId}/availabilities/${availabilityId}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.success) {
        throw new Error(response.message ?? 'Error al eliminar la excepción')
      }
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchAvailabilities,
    createAvailability,
    updateAvailability,
    deleteAvailability,
  }
}
