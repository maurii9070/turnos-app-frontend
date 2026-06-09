<script setup lang="ts">
definePageMeta({
  layout: 'default',
})

useHead({
  title: 'Inicio - Turnos Médicos',
})

const features = [
  {
    title: 'Elegí tu especialista',
    description: 'Encontrá al profesional adecuado entre nuestras especialidades y doctores disponibles.',
    icon: 'i-lucide-stethoscope',
  },
  {
    title: 'Horarios flexibles',
    description: 'Reservá el turno en el día y horario que mejor se ajuste a tu rutina.',
    icon: 'i-lucide-calendar-check',
  },
  {
    title: 'Pago sencillo',
    description: 'Aboná en efectivo, transferencia o MercadoPago al confirmar tu turno.',
    icon: 'i-lucide-wallet',
  },
  {
    title: 'Desde cualquier lugar',
    description: 'Gestioná tus turnos desde la web, en cualquier momento y dispositivo.',
    icon: 'i-lucide-smartphone',
  },
]

const steps = [
  {
    title: 'Registrate',
    description: 'Creá tu cuenta con tu DNI y datos básicos en menos de un minuto.',
    icon: 'i-lucide-user-plus',
  },
  {
    title: 'Elegí médico y horario',
    description: 'Buscá por especialidad, seleccioná al profesional y el horario disponible.',
    icon: 'i-lucide-calendar-days',
  },
  {
    title: 'Confirmá tu turno',
    description: 'Aboná según el método elegido y recibí la confirmación al instante.',
    icon: 'i-lucide-circle-check',
  },
]
</script>

<template>
  <div>
    <UPageHero
      title="Turnos médicos sin esperas"
      description="Reservá tu consulta con el especialista que necesitás, en el horario que prefieras. Simple, rápido y sin complicaciones."
      :links="[
        { label: 'Sacar turno', to: '/registro', icon: 'i-lucide-arrow-right', trailing: true, size: 'xl' },
        { label: 'Ver especialidades', to: '/especialidades', color: 'neutral', variant: 'subtle', size: 'xl' },
      ]"
    >
      <template #headline>
        <div class="inline-flex items-center gap-2 text-primary text-sm font-medium">
          <UIcon name="i-lucide-stethoscope" class="size-4" />
          <span>Clínica de turnos médicos</span>
        </div>
      </template>
    </UPageHero>

    <UPageSection
      id="beneficios"
      title="Todo lo que necesitás para tu consulta"
      description="Reservar un turno nunca fue tan fácil. Olvidate de las llamadas y esperas telefónicas."
      :features="features"
    />

    <UPageSection
      id="como-funciona"
      headline="Cómo funciona"
      title="Reservá tu turno en 3 pasos"
      description="Un proceso simple pensado para que reserves en cuestión de minutos."
    >
      <UPageGrid>
        <UPageCard
          v-for="(step, index) in steps"
          :key="step.title"
          :title="step.title"
          :description="step.description"
          :icon="step.icon"
        >
          <template #title>
            <div class="flex items-center gap-3">
              <span class="text-2xl font-semibold text-primary">
                {{ index + 1 }}
              </span>
              <span>{{ step.title }}</span>
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>

    <UPageCTA
      title="¿Listo para tu próxima consulta?"
      description="Registrate gratis y empezá a gestionar tus turnos médicos en un solo lugar."
      :links="[
        { label: 'Crear cuenta', to: '/registro', size: 'xl' },
        { label: 'Ya tengo cuenta', to: '/login', color: 'neutral', variant: 'subtle', size: 'xl' },
      ]"
    />
  </div>
</template>
