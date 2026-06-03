import type { UserRole } from './auth'

export interface UserProfile {
  userId: string
  dni: string
  email: string | null
  firstName: string
  lastName: string
  phone: string | null
  role: UserRole
  mustChangePassword: boolean
  patientId: string | null
  dateOfBirth: string | null
  doctorId: string | null
}

export interface UpdateProfileRequest {
  firstName: string
  lastName: string
  email?: string | null
  phone?: string | null
  dateOfBirth?: string | null
}

export interface ChangePasswordRequest {
  currentPassword: string
  newPassword: string
}

export interface ChangePasswordResponse {
  userId: string
}
