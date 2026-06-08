export type AppointmentFileCategory = 'Medical' | 'Receipt'

export interface UploadAppointmentFileRequest {
  fileName: string
  fileType: string
  filePathOrUrl: string
  category: AppointmentFileCategory
}

export interface UploadAppointmentFileResponse {
  id: string
  appointmentId: string
  fileName: string
  fileType: string
  filePathOrUrl: string
  category: AppointmentFileCategory
  uploadedAt: string
}
