import type { ApiResponse } from '~/types/auth'
import type { CreatePatientRequest, CreatePatientResponse, PatientDetail, PatientListItem } from '~/types/patients'

export function usePatients() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('patients:loading', () => false)

  async function createPatient(data: CreatePatientRequest): Promise<CreatePatientResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreatePatientResponse>>('/api/patients', {
        method: 'POST',
        body: data,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear el paciente')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPatientByDni(dni: string): Promise<PatientDetail> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<PatientDetail>>(`/api/patients/by-dni/${dni}`)

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Paciente no encontrado')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function fetchPatients(includeInactive: boolean = false): Promise<PatientListItem[]> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<PatientListItem[]>>(
        `/api/patients?includeInactive=${includeInactive}`,
      )

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al obtener los pacientes')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    createPatient,
    fetchPatientByDni,
    fetchPatients,
  }
}
