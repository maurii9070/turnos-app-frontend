<script setup lang="ts">
interface TurnoData {
  doctor: string | null
  fecha: string | null
  hora: string | null
  pago: string | null
}

defineProps<{
  data: TurnoData
}>()

const emit = defineEmits<{
  back: []
  confirm: []
}>()

const doctorMap: Record<string, string> = {
  'dr-garcia': 'Dr. García',
  'dr-lopez': 'Dra. López',
  'dr-martinez': 'Dr. Martínez',
}

const fechaMap: Record<string, string> = {
  '2026-06-05': 'Viernes 5 de junio',
  '2026-06-06': 'Sábado 6 de junio',
  '2026-06-09': 'Martes 9 de junio',
}

const pagoMap: Record<string, string> = {
  'Cash': 'Efectivo',
  'Transfer': 'Transferencia',
  'MercadoPago': 'Mercado Pago',
}
</script>

<template>
  <div class="space-y-4 py-4">
    <h2 class="text-lg font-semibold text-default">
      Revisá los datos de tu turno
    </h2>

    <div class="rounded-lg border border-muted bg-elevated/50 p-4 space-y-3">
      <div class="flex justify-between">
        <span class="text-muted">Médico</span>
        <span class="font-medium text-default">{{ doctorMap[data.doctor ?? ''] ?? data.doctor ?? '-' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Fecha</span>
        <span class="font-medium text-default">{{ fechaMap[data.fecha ?? ''] ?? data.fecha ?? '-' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Horario</span>
        <span class="font-medium text-default">{{ data.hora ?? '-' }}</span>
      </div>
      <div class="flex justify-between">
        <span class="text-muted">Pago</span>
        <span class="font-medium text-default">{{ pagoMap[data.pago ?? ''] ?? data.pago ?? '-' }}</span>
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
        label="Confirmar turno"
        color="success"
        icon="i-lucide-check"
        @click="emit('confirm')"
      />
    </div>
  </div>
</template>
