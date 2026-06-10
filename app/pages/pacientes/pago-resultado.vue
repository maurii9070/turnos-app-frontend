<script setup lang="ts">
definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['Patient'],
  layout: 'dashboard',
})

useHead({
  title: 'Resultado del pago',
})

const router = useRouter()
const toast = useToast()
const { syncMercadoPagoPayment, createMercadoPagoPreference } = useMercadoPago()
const { user } = useUsers()

type Phase = 'loading' | 'error' | 'success' | 'failure' | 'pending'

const phase = ref<Phase>('loading')
const errorMsg = ref<string | null>(null)
const syncing = ref(false)
const retrying = ref(false)

let paymentId: string | null = null
let appointmentId: string | null = null

function cleanUrl() {
  router.replace({ query: {} })
}

function cleanStorage() {
  localStorage.removeItem('mercadopago:paymentId')
  localStorage.removeItem('mercadopago:appointmentId')
  localStorage.removeItem('mercadopago:initPoint')
}

async function doSync() {
  if (!paymentId)
    return
  syncing.value = true
  try {
    const result = await syncMercadoPagoPayment(paymentId)
    appointmentId = result.appointmentId

    if (result.currentStatus === 'Approved') {
      phase.value = 'success'
      cleanStorage()
      cleanUrl()
    }
    else if (result.currentStatus === 'Rejected') {
      phase.value = 'failure'
      cleanUrl()
    }
    else {
      phase.value = 'pending'
    }
  }
  catch (err: unknown) {
    errorMsg.value = err instanceof Error ? err.message : 'Error al verificar el pago'
    phase.value = 'error'
  }
  finally {
    syncing.value = false
  }
}

async function handleRetry() {
  if (!appointmentId || retrying.value)
    return
  retrying.value = true
  try {
    const result = await createMercadoPagoPreference(appointmentId, {
      payerEmail: user.value?.email ?? null,
      payerFirstName: user.value?.firstName ?? null,
      payerLastName: user.value?.lastName ?? null,
    })

    localStorage.setItem('mercadopago:paymentId', result.paymentId)
    localStorage.setItem('mercadopago:initPoint', result.initPoint)
    paymentId = result.paymentId

    toast.add({
      title: 'Nuevo intento de pago',
      description: 'Serás redirigido a Mercado Pago.',
      color: 'info',
    })

    if (import.meta.client) {
      window.location.href = result.initPoint
    }

    phase.value = 'pending'
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al reintentar el pago',
      color: 'error',
    })
  }
  finally {
    retrying.value = false
  }
}

onMounted(async () => {
  const storedPaymentId = localStorage.getItem('mercadopago:paymentId')
  const storedAppointmentId = localStorage.getItem('mercadopago:appointmentId')
  const urlRef = router.currentRoute.value.query.external_reference as string | undefined

  paymentId = storedPaymentId || urlRef || null
  appointmentId = storedAppointmentId || null

  if (!paymentId) {
    phase.value = 'error'
    errorMsg.value = 'No se encontró información del pago.'
    return
  }

  await doSync()
})
</script>

<template>
  <div class="mx-auto max-w-lg space-y-6">
    <div class="flex flex-col gap-1">
      <h1 class="text-2xl font-semibold tracking-tight">
        Resultado del pago
      </h1>
      <p class="text-muted">
        Estado de tu pago con Mercado Pago.
      </p>
    </div>

    <div class="rounded-xl border border-default bg-elevated/25 p-8">
      <!-- Loading -->
      <div v-if="phase === 'loading'" class="flex flex-col items-center gap-4 py-6">
        <UIcon name="i-lucide-loader-circle" class="size-10 animate-spin text-primary" />
        <p class="text-sm text-muted">
          Verificando tu pago...
        </p>
      </div>

      <!-- Success -->
      <div v-else-if="phase === 'success'" class="flex flex-col items-center gap-4 py-4">
        <div class="flex size-14 items-center justify-center rounded-full bg-success/10">
          <UIcon name="i-lucide-check-circle" class="size-8 text-success" />
        </div>
        <h2 class="text-lg font-semibold text-default">
          ¡Pago confirmado!
        </h2>
        <p class="text-center text-sm text-muted">
          Tu turno fue reservado con éxito.
        </p>
        <UButton
          label="Ver mis turnos"
          color="success"
          icon="i-lucide-arrow-right"
          trailing-icon
          to="/pacientes"
        />
      </div>

      <!-- Failure -->
      <div v-else-if="phase === 'failure'" class="flex flex-col items-center gap-4 py-4">
        <div class="flex size-14 items-center justify-center rounded-full bg-error/10">
          <UIcon name="i-lucide-x-circle" class="size-8 text-error" />
        </div>
        <h2 class="text-lg font-semibold text-default">
          El pago no pudo completarse
        </h2>
        <p class="text-center text-sm text-muted">
          No te preocupes, tu turno sigue reservado como pendiente de pago.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton
            label="Reintentar pago"
            color="primary"
            icon="i-lucide-refresh-cw"
            :loading="retrying"
            @click="handleRetry"
          />
          <UButton
            label="Ver mis turnos"
            variant="ghost"
            color="neutral"
            to="/pacientes"
          />
        </div>
      </div>

      <!-- Pending -->
      <div v-else-if="phase === 'pending'" class="flex flex-col items-center gap-4 py-4">
        <div class="flex size-14 items-center justify-center rounded-full bg-warning/10">
          <UIcon name="i-lucide-clock" class="size-8 text-warning" />
        </div>
        <h2 class="text-lg font-semibold text-default">
          Estamos confirmando tu pago
        </h2>
        <p class="text-center text-sm text-muted">
          Tu pago está siendo procesado. Aguardá unos segundos y reintentá.
        </p>
        <div class="flex flex-wrap justify-center gap-3">
          <UButton
            label="Verificar de nuevo"
            color="warning"
            icon="i-lucide-refresh-cw"
            :loading="syncing"
            @click="doSync"
          />
          <UButton
            label="Ver mis turnos"
            variant="ghost"
            color="neutral"
            to="/pacientes"
          />
        </div>
      </div>

      <!-- Error / No payment ID -->
      <div v-else-if="phase === 'error'" class="flex flex-col items-center gap-4 py-4">
        <div class="flex size-14 items-center justify-center rounded-full bg-neutral/10">
          <UIcon name="i-lucide-alert-circle" class="size-8 text-muted" />
        </div>
        <h2 class="text-lg font-semibold text-default">
          Sin información de pago
        </h2>
        <p class="text-center text-sm text-muted">
          {{ errorMsg }}
        </p>
        <UButton
          label="Ver mis turnos"
          color="neutral"
          icon="i-lucide-arrow-right"
          trailing-icon
          to="/pacientes"
        />
      </div>
    </div>
  </div>
</template>
