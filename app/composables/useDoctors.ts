import type { ApiResponse } from '~/types/auth'
import type {
  CreateDoctorRequest,
  CreateDoctorResponse,
  DoctorAppointment,
  DoctorDetail,
  DoctorListItem,
  DoctorMyAppointmentListItem,
  UpdateDoctorRequest,
  UpdateDoctorResponse,
} from '~/types/doctors'

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

  async function fetchDoctorAppointments(
    doctorId: string,
    date: string,
  ): Promise<DoctorAppointment[]> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<DoctorAppointment[]>>(
        `/api/doctors/${doctorId}/appointments?date=${date}`,
      )
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Error al obtener los turnos del doctor')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchMyDoctorAppointments(): Promise<DoctorMyAppointmentListItem[]> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<DoctorMyAppointmentListItem[]>>('/api/doctors/me/appointments')
      if (
        !response.success
        || !response.data
      ) {
        throw new Error(response.message ?? 'Error al obtener tus turnos')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function createDoctor(data: CreateDoctorRequest): Promise<CreateDoctorResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreateDoctorResponse>>('/api/doctors', {
        method: 'POST',
        body: data,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear el doctor')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function updateDoctor(
    doctorId: string,
    data: UpdateDoctorRequest,
  ): Promise<UpdateDoctorResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<UpdateDoctorResponse>>(`/api/doctors/${doctorId}`, {
        method: 'PUT',
        body: data,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al actualizar el doctor')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function deleteDoctor(doctorId: string): Promise<void> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<object>>(`/api/doctors/${doctorId}`, {
        method: 'DELETE',
      })

      if (!response.success) {
        throw new Error(response.message ?? 'Error al desactivar el doctor')
      }
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    fetchDoctors,
    fetchDoctorById,
    fetchDoctorAppointments,
    fetchMyDoctorAppointments,
    createDoctor,
    updateDoctor,
    deleteDoctor,
  }
}
