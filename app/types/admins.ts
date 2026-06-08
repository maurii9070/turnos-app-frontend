export interface CreateAdminRequest {
  dni: string
  firstName: string
  lastName: string
  password: string
  email?: string | null
  phone?: string | null
}

export interface CreateAdminResponse {
  userId: string
  dni: string
  firstName: string
  lastName: string
  role: string
  mustChangePassword: boolean
  createdAt: string
}
