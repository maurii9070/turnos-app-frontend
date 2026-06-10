export interface Specialty {
  id: string
  name: string
  description: string | null
}

export interface CreateSpecialtyRequest {
  name: string
  description?: string | null
}

export interface CreateSpecialtyResponse extends CreateSpecialtyRequest {
  id: string
}

export interface UpdateSpecialtyRequest {
  name: string
  description?: string | null
}

export interface UpdateSpecialtyResponse extends UpdateSpecialtyRequest {
  id: string
}
