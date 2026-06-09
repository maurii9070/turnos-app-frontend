import type { ApiResponse } from '~/types/auth'
import type {
  CreateAppointmentWithMercadoPagoRequest,
  CreateAppointmentWithMercadoPagoResponse,
  CreateMercadoPagoPreferenceRequest,
  CreateMercadoPagoPreferenceResponse,
  GetMercadoPagoPaymentStatusResponse,
  SyncMercadoPagoPaymentResponse,
} from '~/types/mercadopago'

export function useMercadoPago() {
  const { $api } = useNuxtApp()
  const loading = useState<boolean>('mercadopago:loading', () => false)

  async function createAppointmentWithMercadoPago(
    data: CreateAppointmentWithMercadoPagoRequest,
  ): Promise<CreateAppointmentWithMercadoPagoResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<CreateAppointmentWithMercadoPagoResponse>>(
        '/api/appointments/mercadopago',
        { method: 'POST', body: data },
      )
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear el turno con Mercado Pago')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function createMercadoPagoPreference(
    appointmentId: string,
    data?: CreateMercadoPagoPreferenceRequest,
  ): Promise<CreateMercadoPagoPreferenceResponse> {
    loading.value = true
    try {
      const body = data ?? {}
      const response = await $api<ApiResponse<CreateMercadoPagoPreferenceResponse>>(
        `/api/appointments/${appointmentId}/mercadopago/preference`,
        { method: 'POST', body },
      )
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al crear la preferencia de Mercado Pago')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function getMercadoPagoPaymentStatus(
    paymentId: string,
  ): Promise<GetMercadoPagoPaymentStatusResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<GetMercadoPagoPaymentStatusResponse>>(
        `/api/payments/mercadopago/${paymentId}/status`,
        { method: 'GET' },
      )
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al obtener el estado del pago')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  async function syncMercadoPagoPayment(
    paymentId: string,
  ): Promise<SyncMercadoPagoPaymentResponse> {
    loading.value = true
    try {
      const response = await $api<ApiResponse<SyncMercadoPagoPaymentResponse>>(
        `/api/payments/mercadopago/${paymentId}/sync`,
        { method: 'POST' },
      )
      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al sincronizar el pago con Mercado Pago')
      }
      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    createAppointmentWithMercadoPago,
    createMercadoPagoPreference,
    getMercadoPagoPaymentStatus,
    syncMercadoPagoPayment,
  }
}
