<script setup lang="ts">
import type { DoctorAvailability } from '~/types/doctors'

const props = defineProps<{
  doctorId: string
}>()

const { fetchAvailabilities, createAvailability, updateAvailability, deleteAvailability, loading } = useDoctorAvailabilities()
const toast = useToast()

function normalizeTime(value: string): string {
  return value.length > 5 ? value.substring(0, 5) : value
}

const availabilities = ref<DoctorAvailability[]>([])
const loadError = ref<string | null>(null)

const showForm = ref(false)
const editingId = ref<string | null>(null)
const formDate = ref('')
const formIsAvailable = ref(false)
const formStartTime = ref('08:00')
const formEndTime = ref('17:00')
const formMode = ref<'exception' | 'override'>('exception')
const saving = ref(false)

const deleteConfirmOpen = ref(false)
const deleteTargetId = ref<string | null>(null)
const deleting = ref(false)

const sortedAvailabilities = computed(() =>
  [...availabilities.value].sort((a, b) => a.date.localeCompare(b.date)),
)

async function loadAvailabilities() {
  loadError.value = null
  try {
    const raw = await fetchAvailabilities(props.doctorId)
    availabilities.value = raw.map(a => ({
      ...a,
      startTime: normalizeTime(a.startTime),
      endTime: normalizeTime(a.endTime),
    }))
  }
  catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar excepciones'
  }
}

function openCreate() {
  editingId.value = null
  formDate.value = ''
  formMode.value = 'exception'
  formIsAvailable.value = false
  formStartTime.value = '08:00'
  formEndTime.value = '17:00'
  showForm.value = true
}

function openEdit(av: DoctorAvailability) {
  editingId.value = av.id
  formDate.value = av.date
  formIsAvailable.value = av.isAvailable
  formMode.value = av.isAvailable ? 'override' : 'exception'
  formStartTime.value = av.startTime
  formEndTime.value = av.endTime
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
}

async function handleSave() {
  if (!formDate.value)
    return

  saving.value = true
  try {
    const data = {
      date: formDate.value,
      startTime: formStartTime.value,
      endTime: formEndTime.value,
      isAvailable: formIsAvailable.value,
    }

    if (editingId.value) {
      await updateAvailability(props.doctorId, editingId.value, data)
      toast.add({
        title: 'Excepción actualizada',
        description: 'La excepción fue actualizada con éxito.',
        color: 'success',
      })
    }
    else {
      await createAvailability(props.doctorId, data)
      toast.add({
        title: 'Excepción creada',
        description: 'La excepción fue registrada con éxito.',
        color: 'success',
      })
    }

    closeForm()
    await loadAvailabilities()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al guardar la excepción',
      color: 'error',
    })
  }
  finally {
    saving.value = false
  }
}

function confirmDelete(id: string) {
  deleteTargetId.value = id
  deleteConfirmOpen.value = true
}

async function handleDelete() {
  if (!deleteTargetId.value || deleting.value)
    return

  deleting.value = true
  try {
    await deleteAvailability(props.doctorId, deleteTargetId.value)
    toast.add({
      title: 'Excepción eliminada',
      description: 'La excepción fue eliminada con éxito.',
      color: 'success',
    })
    await loadAvailabilities()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al eliminar la excepción',
      color: 'error',
    })
  }
  finally {
    deleting.value = false
    deleteConfirmOpen.value = false
    deleteTargetId.value = null
  }
}

onMounted(() => {
  if (props.doctorId) {
    loadAvailabilities()
  }
})

watch(() => props.doctorId, (id) => {
  if (id) {
    loadAvailabilities()
  }
})
</script>

<template>
  <div class="space-y-4">
    <UAlert
      v-if="loadError"
      color="error"
      variant="subtle"
      title="Error"
      :description="loadError"
      icon="i-lucide-alert-circle"
    >
      <template #footer>
        <UButton label="Reintentar" size="sm" variant="outline" @click="loadAvailabilities" />
      </template>
    </UAlert>

    <div class="rounded-xl border border-default bg-default">
      <div class="flex items-center justify-between px-4 py-3 border-b border-default">
        <p class="text-sm text-muted">
          Días en los que el doctor no atiende o tiene un horario diferente.
        </p>
        <UButton
          label="Agregar excepción"
          icon="i-lucide-plus"
          color="primary"
          size="sm"
          @click="openCreate"
        />
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
      </div>

      <template v-else>
        <div v-if="sortedAvailabilities.length === 0" class="flex flex-col items-center py-12 text-center">
          <UIcon name="i-lucide-calendar-heart" class="size-12 text-muted" />
          <p class="mt-2 font-medium">
            Sin excepciones
          </p>
          <p class="text-sm text-muted">
            No hay días de excepción registrados.
          </p>
        </div>

        <div v-else class="divide-y divide-default">
          <div
            v-for="av in sortedAvailabilities"
            :key="av.id"
            class="flex items-center justify-between px-4 py-3"
          >
            <div class="flex items-center gap-3">
              <UBadge
                :color="av.isAvailable ? 'success' : 'error'"
                variant="subtle"
              >
                {{ av.isAvailable ? 'Horario especial' : 'No atiende' }}
              </UBadge>
              <span class="text-sm font-medium">{{ formatIsoDate(av.date) }}</span>
              <span v-if="av.isAvailable" class="text-sm text-muted">
                {{ av.startTime }} – {{ av.endTime }}
              </span>
            </div>
            <div class="flex items-center gap-1">
              <UButton
                icon="i-lucide-pencil"
                size="sm"
                color="neutral"
                variant="ghost"
                @click="openEdit(av)"
              />
              <UButton
                icon="i-lucide-trash-2"
                size="sm"
                color="error"
                variant="ghost"
                @click="confirmDelete(av.id)"
              />
            </div>
          </div>
        </div>
      </template>
    </div>

    <UModal
      v-model:open="showForm"
      :title="editingId ? 'Editar excepción' : 'Agregar excepción'"
      :ui="{ footer: 'justify-between' }"
    >
      <template #body>
        <div class="space-y-4">
          <UFormField label="Fecha" required>
            <input
              v-model="formDate"
              type="date"
              class="w-full h-9 rounded-md border border-default bg-default px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
          </UFormField>

          <UFormField label="Tipo">
            <div class="flex gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formMode"
                  type="radio"
                  value="exception"
                  class="size-4 accent-primary"
                  @change="formIsAvailable = false"
                >
                <span class="text-sm">No atiende</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="formMode"
                  type="radio"
                  value="override"
                  class="size-4 accent-primary"
                  @change="formIsAvailable = true"
                >
                <span class="text-sm">Horario especial</span>
              </label>
            </div>
          </UFormField>

          <template v-if="formMode === 'override'">
            <div class="flex items-center gap-3">
              <UFormField label="Desde" required>
                <input
                  v-model="formStartTime"
                  type="time"
                  class="w-full h-9 rounded-md border border-default bg-default px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </UFormField>
              <UFormField label="Hasta" required>
                <input
                  v-model="formEndTime"
                  type="time"
                  class="w-full h-9 rounded-md border border-default bg-default px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                >
              </UFormField>
            </div>
          </template>
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
          label="Guardar"
          icon="i-lucide-save"
          color="primary"
          :loading="saving"
          :disabled="!formDate"
          @click="handleSave"
        />
      </template>
    </UModal>

    <UModal
      v-model:open="deleteConfirmOpen"
      title="Eliminar excepción"
      description="¿Estás seguro de que querés eliminar esta excepción?"
      :ui="{ footer: 'justify-end' }"
    >
      <template #footer="{ close }">
        <UButton
          label="Cancelar"
          color="neutral"
          variant="outline"
          @click="close"
        />
        <UButton
          label="Eliminar"
          color="error"
          :loading="deleting"
          @click="handleDelete"
        />
      </template>
    </UModal>
  </div>
</template>
