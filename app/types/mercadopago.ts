export interface CreateAppointmentWithMercadoPagoRequest {
  doctorId: string
  date: string
  startTime: string
  notes?: string | null
  payerEmail?: string | null
  payerFirstName?: string | null
  payerLastName?: string | null
}

export interface CreateAppointmentWithMercadoPagoResponse {
  appointmentId: string
  paymentId: string
  amount: number
  initPoint: string
  preferenceId: string
}

export interface CreateMercadoPagoPreferenceRequest {
  payerEmail?: string | null
  payerFirstName?: string | null
  payerLastName?: string | null
}

export interface CreateMercadoPagoPreferenceResponse {
  paymentId: string
  appointmentId: string
  amount: number
  status: string
  preferenceId: string
  initPoint: string
}

export interface GetMercadoPagoPaymentStatusResponse {
  paymentId: string
  appointmentId: string
  amount: number
  status: string
  preferenceId: string | null
  mercadoPagoPaymentId: string | null
  createdAt: string
  updatedAt: string
}

export interface SyncMercadoPagoPaymentResponse {
  paymentId: string
  appointmentId: string
  previousStatus: string
  currentStatus: string
  appointmentConfirmed: boolean
}
