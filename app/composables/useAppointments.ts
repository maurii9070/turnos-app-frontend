import type { ApiResponse } from '~/types/auth'
import type {
  AppointmentActionResponse,
  AppointmentDetail,
  AppointmentListItem,
  AppointmentStatus,
  CreateAppointmentRequest,
  CreateAppointmentResponse,
  MyAppointmentListItem,
} from '~/types/appointments'

export function useAppointments() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('appointments:loading', () => false)

  async function createAppointment(data: CreateAppointmentRequest): Promise<CreateAppointmentResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreateAppointmentResponse>>('/api/appointments', {
        method: 'POST',
        body: data,
      })
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear el turno')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchAppointmentById(id: string): Promise<AppointmentDetail> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<AppointmentDetail>>(`/api/appointments/${id}`)
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Turno no encontrado')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchAppointments(status?: AppointmentStatus): Promise<AppointmentListItem[]> {
    loading.value = true
    try {
      const url = status ? `/api/appointments?status=${status}` : '/api/appointments'
      const response = await $api<ApiResponse<AppointmentListItem[]>>(url)
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al obtener turnos')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchMyAppointments(): Promise<MyAppointmentListItem[]> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<MyAppointmentListItem[]>>('/api/appointments/me')
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al obtener mis turnos')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function confirmAppointment(id: string): Promise<AppointmentActionResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<AppointmentActionResponse>>(`/api/appointments/${id}/confirm`, {
        method: 'PUT',
      })
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al confirmar el turno')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function completeAppointment(id: string): Promise<AppointmentActionResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<AppointmentActionResponse>>(`/api/appointments/${id}/complete`, {
        method: 'PUT',
      })
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al completar el turno')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function cancelAppointment(id: string): Promise<AppointmentActionResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<AppointmentActionResponse>>(`/api/appointments/${id}/cancel`, {
        method: 'PUT',
      })
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al cancelar el turno')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    createAppointment,
    fetchAppointmentById,
    fetchAppointments,
    fetchMyAppointments,
    confirmAppointment,
    completeAppointment,
    cancelAppointment,
  }
}
