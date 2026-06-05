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
