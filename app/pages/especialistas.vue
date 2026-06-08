<script setup lang="ts">
import type { DoctorListItem } from '~/types/doctors'
import { formatCurrency } from '~/utils'

definePageMeta({
  layout: 'default',
})

const { fetchDoctors } = useDoctors()
const { isAuthenticated, role } = useAuth()

const { data: doctors, pending, error, refresh } = await useAsyncData('doctors:list', () => fetchDoctors())

const items = computed<DoctorListItem[]>(() => doctors.value ?? [])

function fullName(d: DoctorListItem) {
  return `Dr. ${d.firstName} ${d.lastName}`
}

function initials(d: DoctorListItem) {
  return `${d.firstName.charAt(0)}${d.lastName.charAt(0)}`.toUpperCase()
}

const reserveTo = computed(() => (isAuthenticated.value && role.value === 'Patient' ? '/pacientes/nuevo-turno' : '/registro'))

useHead({ title: 'Doctores' })
</script>

<template>
  <div>
    <UPageSection
      :ui="{ container: 'py-12 sm:py-16' }"
    >
      <template #headline>
        <div class="inline-flex items-center gap-2 text-primary text-sm font-semibold">
          <UIcon name="i-lucide-user-round" class="size-4" />
          <span>Profesionales</span>
        </div>
      </template>

      <template #title>
        <span class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted">
          Conocé a nuestro equipo médico
        </span>
      </template>

      <template #description>
        <span class="text-base sm:text-lg text-muted">
          Profesionales matriculados, listos para atenderte. Elegí con quién querés reservar tu próxima consulta.
        </span>
      </template>

      <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-triangle-alert"
        title="No se pudieron cargar los doctores"
        :description="error.message"
        class="mb-6"
      >
        <template #actions>
          <UButton label="Reintentar" color="error" variant="outline" @click="refresh()" />
        </template>
      </UAlert>

      <div v-else-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <USkeleton v-for="i in 6" :key="i" class="h-56" />
      </div>

      <UEmpty
        v-else-if="items.length === 0"
        icon="i-lucide-user-round"
        title="Aún no hay doctores cargados"
        description="Volvé más tarde para conocer a nuestros profesionales."
      />

      <UPageGrid v-else>
        <UPageCard
          v-for="doc in items"
          :key="doc.doctorId"
          variant="subtle"
          spotlight
          spotlight-color="primary"
          class="h-full"
        >
          <template #leading>
            <UAvatar
              :text="initials(doc)"
              size="lg"
              class="bg-primary/10 text-primary font-semibold"
            />
          </template>
          <template #title>
            <span class="text-highlighted font-semibold">{{ fullName(doc) }}</span>
          </template>
          <template #description>
            <div class="flex flex-col gap-1.5">
              <UBadge color="primary" variant="soft" size="sm" :label="doc.specialtyName" />
              <div class="flex items-center gap-2 text-muted text-sm">
                <UIcon name="i-lucide-id-card" class="size-4 shrink-0" />
                <span>Matrícula {{ doc.licenseNumber }}</span>
              </div>
            </div>
          </template>
          <template #footer>
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-baseline gap-1">
                <span class="text-xs text-muted">Consulta desde</span>
                <span class="text-base font-semibold text-highlighted">{{ formatCurrency(doc.consultationPrice) }}</span>
              </div>
              <UButton
                size="sm"
                color="primary"
                variant="solid"
                :to="reserveTo"
                trailing-icon="i-lucide-arrow-right"
              >
                Reservar
              </UButton>
            </div>
          </template>
        </UPageCard>
      </UPageGrid>
    </UPageSection>
  </div>
</template>
