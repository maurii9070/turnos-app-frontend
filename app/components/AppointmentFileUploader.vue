<script setup lang="ts">
const props = defineProps<{
  appointmentId: string
  role: 'patient' | 'doctor'
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'uploaded': []
}>()

const { uploadFile } = useAppointmentFiles()
const toast = useToast()

const isOpen = computed({
  get: () => props.modelValue,
  set: val => emit('update:modelValue', val),
})

const file = ref<File | null>(null)
const isUploading = ref(false)

const folder = computed<'patient-file' | 'doctor-file'>(
  () => props.role === 'patient' ? 'patient-file' : 'doctor-file',
)

const accept = 'image/png,image/jpeg,application/pdf'
const maxSize = 10 * 1024 * 1024

const modalTitle = computed(() =>
  props.role === 'patient' ? 'Subir comprobante' : 'Subir archivo',
)

const modalDescription = computed(() =>
  props.role === 'patient'
    ? 'Subí el comprobante de pago para confirmar tu turno.'
    : 'Subí un archivo relacionado con el turno médico.',
)

const actionLabel = computed(() =>
  props.role === 'patient' ? 'Subir comprobante' : 'Subir archivo',
)

watch(isOpen, (val) => {
  if (!val) {
    file.value = null
  }
})

async function handleUpload() {
  if (!file.value)
    return

  if (file.value.size > maxSize) {
    toast.add({
      title: 'Error',
      description: 'El archivo no debe superar los 10 MB.',
      color: 'error',
    })
    return
  }

  isUploading.value = true
  try {
    await uploadFile(props.appointmentId, file.value, folder.value)
    toast.add({
      title: 'Comprobante subido',
      description: 'El archivo fue subido con éxito.',
      color: 'success',
    })
    emit('uploaded')
    isOpen.value = false
  }
  catch (err: any) {
    toast.add({
      title: 'Error',
      description: err.message ?? 'Error al subir el archivo',
      color: 'error',
    })
  }
  finally {
    isUploading.value = false
  }
}
</script>

<template>
  <UModal
    v-model:open="isOpen"
    :title="modalTitle"
    :description="modalDescription"
    :ui="{ footer: 'justify-end' }"
  >
    <template #body>
      <div class="space-y-4">
        <UFileUpload
          v-model="file"
          :accept="accept"
        />

        <UAlert
          v-if="role === 'patient'"
          color="info"
          variant="subtle"
          icon="i-lucide-info"
          title="Importante"
          description="Una vez subido el comprobante, tu turno pasa a revisión. La secretaria se encargará de confirmarlo."
        />
      </div>
    </template>

    <template #footer="{ close }">
      <UButton
        label="Cancelar"
        color="neutral"
        variant="outline"
        @click="close"
      />
      <UButton
        :label="actionLabel"
        :loading="isUploading"
        :disabled="!file"
        @click="handleUpload"
      />
    </template>
  </UModal>
</template>
