<script setup lang="ts">
import type { CalendarDate, DateValue } from '@internationalized/date'
import type { DoctorAppointment, DoctorAvailability, DoctorSchedule } from '~/types/doctors'
import { getLocalTimeZone, today } from '@internationalized/date'

const props = defineProps<{
  fecha: string | null
  hora: string | null
  doctorId: string | null
}>()

const emit = defineEmits<{
  'update:fecha': [value: string | null]
  'update:hora': [value: string | null]
  'next': []
  'back': []
}>()

const { fetchSchedules, loading: schedulesLoading } = useDoctorSchedules()
const { fetchAvailabilities, loading: availabilitiesLoading } = useDoctorAvailabilities()
const { fetchDoctorAppointments } = useDoctors()

const schedules = ref<DoctorSchedule[]>([])
const availabilities = ref<DoctorAvailability[]>([])
const isLoading = ref(false)
const loadError = ref<string | null>(null)
const existingAppointments = ref<DoctorAppointment[]>([])
const appointmentsLoading = ref(false)

const selectedDate = ref<CalendarDate | null>(null)
const selectedTime = ref<string | null>(props.hora)

const now = today(getLocalTimeZone())
const twoMonthsLater = now.add({ months: 2 })

const weekDayMap: Record<string, number> = {
  Sunday: 0,
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
}

const availableWeekDays = computed(() => {
  return new Set(schedules.value.map(s => weekDayMap[s.dayOfWeek]).filter(d => d !== undefined))
})

async function loadData() {
  if (!props.doctorId) {
    schedules.value = []
    availabilities.value = []
    return
  }

  isLoading.value = true
  loadError.value = null

  try {
    const [scheds, avails] = await Promise.all([
      fetchSchedules(props.doctorId),
      fetchAvailabilities(props.doctorId, now.toString(), twoMonthsLater.toString()),
    ])
    schedules.value = scheds
    availabilities.value = avails
  }
  catch (err: any) {
    loadError.value = err.message ?? 'Error al cargar disponibilidades'
    schedules.value = []
    availabilities.value = []
  }
  finally {
    isLoading.value = false
  }
}

function getJsDayOfWeek(date: CalendarDate): number {
  const jsDate = date.toDate(getLocalTimeZone())
  return jsDate.getDay()
}

function isDateUnavailable(date: DateValue): boolean {
  const calDate = date as CalendarDate
  const dayOfWeek = getJsDayOfWeek(calDate)

  if (calDate.compare(now) < 0)
    return true

  if (calDate.compare(twoMonthsLater) > 0)
    return true

  if (dayOfWeek === 0 || dayOfWeek === 6)
    return true

  if (schedules.value.length > 0 && !availableWeekDays.value.has(dayOfWeek))
    return true

  const dateStr = normalizeDate(calDate.toString())
  const blockedAvailability = availabilities.value.some(
    a => normalizeDate(a.date) === dateStr && !a.isAvailable,
  )
  if (blockedAvailability)
    return true

  return false
}

function normalizeDate(dateStr: string | undefined): string {
  if (!dateStr)
    return ''
  return dateStr.split('T')[0]?.split(' ')[0] ?? ''
}

const occupiedTimes = computed(() =>
  new Set(existingAppointments.value.map(a => a.startTime)),
)

const jsDayToName: Record<number, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
}

const availableSlotsForSelectedDate = computed(() => {
  if (!selectedDate.value)
    return []

  const dateStr = normalizeDate(selectedDate.value.toString())
  const dayOfWeek = getJsDayOfWeek(selectedDate.value)

  const dayAvailabilities = availabilities.value.filter(
    a => normalizeDate(a.date) === dateStr,
  )

  const slots: { time: string, label: string, occupied: boolean }[] = []

  if (dayAvailabilities.length > 0) {
    for (const avail of dayAvailabilities) {
      if (!avail.isAvailable)
        continue

      const start = parseTime(avail.startTime)
      const end = parseTime(avail.endTime)

      if (!start || !end)
        continue

      let currentHour = start.hour
      let currentMinute = start.minute

      while (
        currentHour < end.hour
        || (currentHour === end.hour && currentMinute < end.minute)
      ) {
        const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
        slots.push({
          time: timeStr,
          label: `${timeStr} hs`,
          occupied: occupiedTimes.value.has(timeStr),
        })

        currentMinute += 30
        if (currentMinute >= 60) {
          currentMinute -= 60
          currentHour += 1
        }
      }
    }

    return slots.sort((a, b) => a.time.localeCompare(b.time))
  }

  const dayName = jsDayToName[dayOfWeek]
  const daySchedules = schedules.value.filter(s => s.dayOfWeek === dayName)

  for (const sched of daySchedules) {
    const start = parseTime(sched.startTime)
    const end = parseTime(sched.endTime)

    if (!start || !end)
      continue

    let currentHour = start.hour
    let currentMinute = start.minute

    while (
      currentHour < end.hour
      || (currentHour === end.hour && currentMinute < end.minute)
    ) {
      const timeStr = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`
      slots.push({
        time: timeStr,
        label: `${timeStr} hs`,
        occupied: occupiedTimes.value.has(timeStr),
      })

      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute -= 60
        currentHour += 1
      }
    }
  }

  return slots.sort((a, b) => a.time.localeCompare(b.time))
})

function parseTime(timeStr: string): { hour: number, minute: number } | null {
  const parts = timeStr.split(':')
  if (parts.length < 2)
    return null
  const hour = Number.parseInt(parts[0] ?? '0', 10)
  const minute = Number.parseInt(parts[1] ?? '0', 10)
  if (Number.isNaN(hour) || Number.isNaN(minute))
    return null
  return { hour, minute }
}

async function onDateSelect(date: CalendarDate) {
  selectedDate.value = date
  selectedTime.value = null
  emit('update:fecha', date.toString())
  emit('update:hora', null)

  if (props.doctorId) {
    appointmentsLoading.value = true
    try {
      existingAppointments.value = await fetchDoctorAppointments(props.doctorId, date.toString())
    }
    catch {
      existingAppointments.value = []
    }
    finally {
      appointmentsLoading.value = false
    }
  }
}

function selectTime(time: string) {
  selectedTime.value = time
  emit('update:hora', time)
}

function handleNext() {
  if (props.fecha && props.hora) {
    emit('next')
  }
}

watch(() => props.doctorId, () => {
  selectedDate.value = null
  selectedTime.value = null
  existingAppointments.value = []
  emit('update:fecha', null)
  emit('update:hora', null)
  loadData()
}, { immediate: true })
</script>

<template>
  <div class="space-y-6">
    <h2 class="text-lg font-semibold text-default">
      Seleccioná fecha y hora
    </h2>

    <UAlert
      v-if="loadError"
      color="error"
      icon="i-lucide-alert-triangle"
      :title="loadError"
      class="mb-4"
    />

    <div v-if="isLoading || schedulesLoading || availabilitiesLoading" class="flex items-center justify-center py-16">
      <div class="flex flex-col items-center gap-3">
        <USkeleton class="size-10 rounded-full" />
        <USkeleton class="h-4 w-40" />
      </div>
    </div>

    <div v-else class="flex flex-col gap-8 lg:flex-row">
      <!-- Calendario -->
      <div class="w-full lg:w-auto">
        <div class="rounded-xl border border-default bg-default p-4">
          <UCalendar
            v-model="selectedDate"
            :min-value="now"
            :max-value="twoMonthsLater"
            :is-date-unavailable="isDateUnavailable"
            @update:model-value="onDateSelect"
          />
        </div>
      </div>

      <!-- Horarios -->
      <div class="flex-1">
        <div
          v-if="!selectedDate"
          class="flex h-full min-h-48 items-center justify-center rounded-xl border-2 border-dashed border-muted/50 p-8"
        >
          <div class="text-center">
            <UIcon name="i-lucide-calendar" class="mx-auto size-10 text-muted/50" />
            <p class="mt-3 text-sm font-medium text-muted">
              Seleccioná una fecha
            </p>
            <p class="text-xs text-muted/60">
              Los horarios disponibles aparecerán acá.
            </p>
          </div>
        </div>

        <div
          v-else-if="availableSlotsForSelectedDate.length === 0"
          class="flex h-full min-h-48 items-center justify-center rounded-xl border-2 border-dashed border-muted/50 p-8"
        >
          <div class="text-center">
            <UIcon name="i-lucide-clock" class="mx-auto size-10 text-muted/50" />
            <p class="mt-3 text-sm font-medium text-muted">
              Sin horarios disponibles
            </p>
            <p class="text-xs text-muted/60">
              Probá con otra fecha.
            </p>
          </div>
        </div>

        <div v-else class="space-y-4">
          <h3 class="text-sm font-semibold text-default">
            Horarios disponibles
            <span class="font-normal text-muted">· {{ availableSlotsForSelectedDate.length }} turnos</span>
          </h3>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="slot in availableSlotsForSelectedDate"
              :key="slot.time"
              type="button"
              :disabled="slot.occupied"
              class="rounded-lg border px-4 py-2.5 text-sm font-medium transition-all duration-150"
              :class="slot.occupied
                ? 'cursor-not-allowed border-muted/30 bg-muted/10 text-muted/40 line-through'
                : selectedTime === slot.time
                  ? 'border-primary/50 bg-primary/5 text-primary ring-2 ring-primary/20'
                  : 'border-default bg-default text-default hover:border-primary/30 hover:text-primary active:scale-[0.97]'"
              @click="selectTime(slot.time)"
            >
              {{ slot.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-between border-t border-default pt-6">
      <UButton
        label="Volver"
        variant="ghost"
        color="neutral"
        icon="i-lucide-arrow-left"
        @click="emit('back')"
      />
      <UButton
        label="Continuar"
        color="primary"
        size="lg"
        trailing-icon="i-lucide-arrow-right"
        :disabled="!fecha || !hora"
        @click="handleNext"
      />
    </div>
  </div>
</template>
