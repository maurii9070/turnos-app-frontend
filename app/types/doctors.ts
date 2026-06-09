import type { AppointmentStatus } from './appointments'

export interface SpecialtyInfo {
  id: string
  name: string
}

export interface DoctorSchedule {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface DoctorAvailability {
  id: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface DoctorListItem {
  doctorId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  specialtyId: string
  specialtyName: string
  licenseNumber: string
  consultationPrice: number
}

export interface DoctorAppointment {
  id: string
  date: string
  startTime: string
  status: string
}

export interface DoctorDetail {
  doctorId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialty: SpecialtyInfo
  licenseNumber: string
  consultationPrice: number
  schedules: DoctorSchedule[]
  availabilities: DoctorAvailability[]
}

export interface DoctorMyAppointmentListItem {
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
}

export interface CreateDoctorRequest {
  dni: string
  firstName: string
  lastName: string
  password: string
  specialtyId: string
  licenseNumber: string
  consultationPrice: number
  email?: string | null
  phone?: string | null
}

export interface CreateDoctorResponse {
  doctorId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  role: string
  mustChangePassword: boolean
  createdAt: string
}

export interface UpdateDoctorRequest {
  specialtyId: string
  licenseNumber: string
  consultationPrice: number
}

export interface UpdateDoctorResponse {
  doctorId: string
  userId: string
  dni: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
  specialty: SpecialtyInfo
  licenseNumber: string
  consultationPrice: number
}

export interface SetScheduleItem {
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface SetSchedulesRequest {
  schedules: SetScheduleItem[]
}

export interface SetSchedulesResponse {
  id: string
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface CreateAvailabilityRequest {
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface CreateAvailabilityResponse {
  id: string
  doctorId: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface UpdateAvailabilityRequest {
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}

export interface UpdateAvailabilityResponse {
  id: string
  doctorId: string
  date: string
  startTime: string
  endTime: string
  isAvailable: boolean
}
