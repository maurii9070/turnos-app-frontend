export interface UploadAppointmentFileRequest {
  fileName: string
  fileType: string
  filePathOrUrl: string
}

export interface UploadAppointmentFileResponse {
  id: string
  appointmentId: string
  fileName: string
  fileType: string
  filePathOrUrl: string
  uploadedAt: string
}
