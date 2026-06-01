export type UserRole = 'Patient' | 'Doctor' | 'Admin' | 'SuperAdmin'

export interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T | null
}

export interface LoginRequest {
  dni: string
  password: string
}

export interface LoginResponse {
  accessToken: string
  role: UserRole
}

export interface RegisterPatientRequest {
  dni: string
  firstName: string
  lastName: string
  password: string
  dateOfBirth: string
}

export interface RegisterPatientResponse {
  id: string
  dni: string
  firstName: string
  lastName: string
  role: string
  createdAt: string
}

export interface AuthUser {
  id: string
  dni: string
  firstName: string
  lastName: string
  role: UserRole
}
