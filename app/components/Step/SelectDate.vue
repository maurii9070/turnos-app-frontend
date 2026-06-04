<script setup lang="ts">
const props = defineProps<{
  fecha: string | null
  hora: string | null
}>()

const emit = defineEmits<{
  'update:fecha': [value: string | null]
  'update:hora': [value: string | null]
  'next': []
  'back': []
}>()

const fechas = [
  { id: '2026-06-05', label: 'Viernes 5 de junio' },
  { id: '2026-06-06', label: 'Sábado 6 de junio' },
  { id: '2026-06-09', label: 'Martes 9 de junio' },
]

const horarios = [
  { id: '09:00', label: '09:00 hs' },
  { id: '10:30', label: '10:30 hs' },
  { id: '14:00', label: '14:00 hs' },
  { id: '16:30', label: '16:30 hs' },
]

function selectFecha(fechaId: string) {
  emit('update:fecha', fechaId)
}

function selectHora(horaId: string) {
  emit('update:hora', horaId)
}

function handleNext() {
  if (props.fecha && props.hora) {
    emit('next')
  }
}
</script>

<template>
  <div class="space-y-6 py-4">
    <div class="space-y-3">
      <h2 class="text-lg font-semibold text-default">
        Seleccioná una fecha
      </h2>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="f in fechas"
          :key="f.id"
          type="button"
          class="rounded-lg border px-4 py-2 text-sm transition-colors"
          :class="fecha === f.id
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-muted bg-default hover:bg-elevated'"
          @click="selectFecha(f.id)"
        >
          {{ f.label }}
        </button>
      </div>
    </div>

    <div class="space-y-3">
      <h3 class="text-base font-semibold text-default">
        Seleccioná un horario
      </h3>
      <div class="flex flex-wrap gap-3">
        <button
          v-for="h in horarios"
          :key="h.id"
          type="button"
          class="rounded-lg border px-4 py-2 text-sm transition-colors"
          :class="hora === h.id
            ? 'border-primary bg-primary/5 text-primary'
            : 'border-muted bg-default hover:bg-elevated'"
          @click="selectHora(h.id)"
        >
          {{ h.label }}
        </button>
      </div>
    </div>

    <div class="flex justify-between pt-4">
      <UButton
        label="Volver"
        variant="ghost"
        color="neutral"
        @click="emit('back')"
      />
      <UButton
        label="Continuar"
        color="primary"
        :disabled="!fecha || !hora"
        @click="handleNext"
      />
    </div>
  </div>
</template>
