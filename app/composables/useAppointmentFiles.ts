import type { AppointmentFileCategory, UploadAppointmentFileResponse } from '~/types/appointment-files'
import type { ApiResponse } from '~/types/auth'

export function useAppointmentFiles() {
  const { $api, $supabase } = useNuxtApp()
  const loading = useState<boolean>('appointmentFiles:loading', () => false)

  async function uploadFile(
    appointmentId: string,
    file: File,
    folder: 'patient-file' | 'doctor-file',
  ): Promise<UploadAppointmentFileResponse> {
    loading.value = true
    try {
      const path = `${folder}/${appointmentId}/${Date.now()}-${file.name}`

      const bucket = 'appointment-files'

      const { error: uploadError } = await $supabase.storage
        .from(bucket)
        .upload(path, file)

      if (uploadError) {
        throw new Error(uploadError.message)
      }

      const { data: urlData } = $supabase.storage
        .from(bucket)
        .getPublicUrl(path)

      const category: AppointmentFileCategory = folder === 'patient-file' ? 'Receipt' : 'Medical'

      const response = await $api<ApiResponse<UploadAppointmentFileResponse>>(
        `/api/appointments/${appointmentId}/files`,
        {
          method: 'POST',
          body: {
            fileName: file.name,
            fileType: file.type,
            filePathOrUrl: urlData.publicUrl,
            category,
          },
        },
      )

      if (!response.success || !response.data) {
        throw new Error(response.message ?? 'Error al subir el archivo')
      }

      return response.data
    }
    finally {
      loading.value = false
    }
  }

  return {
    loading,
    uploadFile,
  }
}
