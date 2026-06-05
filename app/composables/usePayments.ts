import type {
  CreatePaymentRequest,
  CreatePaymentResponse,
  UpdatePaymentStatusRequest,
  UpdatePaymentStatusResponse,
} from '~/types/appointments'
import type { ApiResponse } from '~/types/auth'

export function usePayments() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('payments:loading', () => false)

  async function createPayment(
    appointmentId: string,
    data: CreatePaymentRequest,
  ): Promise<CreatePaymentResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreatePaymentResponse>>(
        `/api/appointments/${appointmentId}/payment`,
        { method: 'POST', body: data },
      )
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al registrar el pago')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function updatePaymentStatus(
    paymentId: string,
    data: UpdatePaymentStatusRequest,
  ): Promise<UpdatePaymentStatusResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<UpdatePaymentStatusResponse>>(
        `/api/payments/${paymentId}`,
        { method: 'PUT', body: data },
      )
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al actualizar el pago')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    createPayment,
    updatePaymentStatus,
  }
}
