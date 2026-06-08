export interface CreatePatientRequest {
  dni: string
  firstName: string
  lastName: string
  password: string
  dateOfBirth: string
  phone?: string | null
  email?: string | null
}

export interface CreatePatientResponse {
  patientId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  role: string
  mustChangePassword: boolean
  createdAt: string
}

export interface PatientListItem {
  patientId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  phone: string | null
  dateOfBirth: string | null
  isActive: boolean
  totalAppointments: number
  createdAt: string
}

export interface PatientDetail {
  patientId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  dateOfBirth: string | null
  isActive: boolean
  totalAppointments: number
  createdAt: string
}
