<script setup lang="ts">
import type { SetScheduleItem } from '~/types/doctors'

const props = defineProps<{
  doctorId: string
}>()

interface DayEntry {
  key: string
  label: string
  enabled: boolean
  startTime: string
  endTime: string
}

const DAYS = [
  { key: 'Monday', label: 'Lunes' },
  { key: 'Tuesday', label: 'Martes' },
  { key: 'Wednesday', label: 'Miércoles' },
  { key: 'Thursday', label: 'Jueves' },
  { key: 'Friday', label: 'Viernes' },
  { key: 'Saturday', label: 'Sábado' },
  { key: 'Sunday', label: 'Domingo' },
] as const

const { fetchSchedules, setSchedules, loading } = useDoctorSchedules()
const toast = useToast()

const items = ref<DayEntry[]>(
  DAYS.map(d => ({ key: d.key, label: d.label, enabled: false, startTime: '08:00', endTime: '17:00' })),
)
const saving = ref(false)
const loadError = ref<string | null>(null)

const existingSchedules = ref<Map<string, { startTime: string, endTime: string }>>(new Map())

function normalizeTime(value: string): string {
  return value.length > 5 ? value.substring(0, 5) : value
}

function hasChanged(item: DayEntry): boolean {
  const existing = existingSchedules.value.get(item.key)
  if (!item.enabled && !existing)
    return false
  if (!item.enabled && existing)
    return true
  if (item.enabled && !existing)
    return true
  if (existing && (item.startTime !== existing.startTime || item.endTime !== existing.endTime))
    return true
  return false
}

const schedulesPayload = computed<SetScheduleItem[]>(() =>
  items.value
    .filter(d => d.enabled)
    .map(d => ({
      dayOfWeek: d.key,
      startTime: d.startTime,
      endTime: d.endTime,
    })),
)

function toggleDay(item: DayEntry) {
  item.enabled = !item.enabled
}

async function loadSchedules() {
  loadError.value = null
  try {
    const schedules = await fetchSchedules(props.doctorId)
    for (const s of schedules) {
      const item = items.value.find(d => d.key === s.dayOfWeek)
      if (!item)
        continue
      item.enabled = true
      item.startTime = normalizeTime(s.startTime)
      item.endTime = normalizeTime(s.endTime)
      existingSchedules.value.set(s.dayOfWeek, { startTime: item.startTime, endTime: item.endTime })
    }
  }
  catch (err: unknown) {
    loadError.value = err instanceof Error ? err.message : 'Error al cargar horarios'
  }
}

function resetToDefaults() {
  existingSchedules.value.clear()
  for (const item of items.value) {
    item.enabled = false
    item.startTime = '08:00'
    item.endTime = '17:00'
  }
}

async function handleSave() {
  saving.value = true
  try {
    const result = await setSchedules(props.doctorId, { schedules: schedulesPayload.value })
    toast.add({
      title: 'Horarios guardados',
      description: 'Los horarios semanales fueron actualizados con éxito.',
      color: 'success',
    })
    existingSchedules.value.clear()
    for (const r of result) {
      existingSchedules.value.set(r.dayOfWeek, {
        startTime: normalizeTime(r.startTime),
        endTime: normalizeTime(r.endTime),
      })
    }
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al guardar los horarios',
      color: 'error',
    })
  }
  finally {
    saving.value = false
  }
}

onMounted(() => {
  if (props.doctorId) {
    loadSchedules()
  }
})

watch(() => props.doctorId, (id) => {
  if (id) {
    resetToDefaults()
    loadSchedules()
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
        <UButton label="Reintentar" size="sm" variant="outline" @click="loadSchedules" />
      </template>
    </UAlert>

    <div class="rounded-xl border border-default bg-default">
      <div class="px-4 py-3 border-b border-default">
        <p class="text-sm text-muted">
          Configurá los días y franjas horarias en los que el doctor atiende.
        </p>
      </div>

      <div v-if="loading" class="flex justify-center py-12">
        <UIcon name="i-lucide-loader-circle" class="size-8 animate-spin text-muted" />
      </div>

      <template v-else>
        <div class="divide-y divide-default">
          <div
            v-for="item in items"
            :key="item.key"
            class="flex flex-wrap items-center gap-3 px-4 py-3"
          >
            <div
              class="flex items-center gap-2 min-w-28 cursor-pointer select-none"
              @click="toggleDay(item)"
            >
              <USwitch :model-value="item.enabled" />
              <span class="text-sm font-medium">{{ item.label }}</span>
            </div>

            <div
              v-show="item.enabled"
              class="flex items-center gap-2"
            >
              <input
                v-model="item.startTime"
                type="time"
                class="h-9 rounded-md border border-default bg-default px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
              <span class="text-sm text-muted">a</span>
              <input
                v-model="item.endTime"
                type="time"
                class="h-9 rounded-md border border-default bg-default px-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
            </div>
            <UBadge
              v-if="hasChanged(item) && existingSchedules.has(item.key)"
              color="warning"
              variant="subtle"
              size="sm"
            >
              Modificado
            </UBadge>
          </div>
        </div>

        <div class="px-4 py-3 border-t border-default">
          <UButton
            label="Guardar horarios"
            icon="i-lucide-save"
            color="primary"
            :loading="saving"
            :disabled="loading"
            @click="handleSave"
          />
        </div>
      </template>
    </div>
  </div>
</template>
