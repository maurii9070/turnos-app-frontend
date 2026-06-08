import type { CreateAdminRequest, CreateAdminResponse } from '~/types/admins'
import type { ApiResponse } from '~/types/auth'

export function useAdmins() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('admins:loading', () => false)

  async function createAdmin(data: CreateAdminRequest): Promise<CreateAdminResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreateAdminResponse>>('/api/admins', {
        method: 'POST',
        body: data,
      })

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear el administrador')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    createAdmin,
  }
}
