export type AppointmentStatus = 'PendingPayment' | 'PendingReview' | 'Confirmed' | 'Cancelled' | 'Completed'

export interface CreateAppointmentRequest {
  doctorId: string
  date: string
  startTime: string
  notes?: string | null
}

export interface CreateAppointmentResponse {
  id: string
  patientId: string
  doctorId: string
  date: string
  startTime: string
  status: AppointmentStatus
  notes: string | null
}

export interface AppointmentActionResponse {
  id: string
  status: AppointmentStatus
}

export interface AppointmentFileResponse {
  id: string
  appointmentId: string
  filePathOrUrl: string
  fileName: string
  fileType: string
  category: 'Medical' | 'Receipt'
  uploadedAt: string
}

export interface AppointmentDetail {
  id: string
  patientId: string
  patientFirstName: string
  patientLastName: string
  patientDni: string
  doctorId: string
  doctorFirstName: string
  doctorLastName: string
  doctorEmail: string | null
  doctorLicenseNumber: string
  specialtyName: string | null
  consultationPrice: number
  date: string
  startTime: string
  status: AppointmentStatus
  notes: string | null
  files: AppointmentFileResponse[]
  createdAt: string
  updatedAt: string
}

export interface AppointmentListItem {
  id: string
  patientId: string
  patientFirstName: string
  patientLastName: string
  patientDni: string
  doctorId: string
  doctorFirstName: string
  doctorLastName: string
  specialtyName: string | null
  date: string
  startTime: string
  status: AppointmentStatus
  notes: string | null
  createdAt: string
}

export interface MyAppointmentListItem {
  id: string
  doctorId: string
  doctorFirstName: string
  doctorLastName: string
  specialtyName: string | null
  patientId: string
  patientFirstName: string
  patientLastName: string
  date: string
  startTime: string
  status: AppointmentStatus
  notes: string | null
  paymentMethod?: PaymentMethod | null
  paymentId?: string | null
}

export type PaymentMethod = 'MercadoPago' | 'Transfer' | 'Cash'

export type PaymentStatus = 'Pending' | 'Approved' | 'Rejected'

export interface CreatePaymentRequest {
  method: PaymentMethod
  receiptUrl?: string | null
}

export interface CreatePaymentResponse {
  id: string
  appointmentId: string
  amount: number
  method: string
  status: string
  receiptUrl: string | null
  createdAt: string
}

export interface UpdatePaymentStatusRequest {
  status: PaymentStatus
}

export interface UpdatePaymentStatusResponse {
  id: string
  appointmentId: string
  amount: number
  method: string
  status: string
  receiptUrl: string | null
  paidAt: string | null
  updatedAt: string
}
