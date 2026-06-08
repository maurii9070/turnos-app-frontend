<script setup lang="ts">
import type { Specialty } from '~/types/specialties'

definePageMeta({
  layout: 'default',
})

const { fetchSpecialties } = useSpecialties()

const { data: specialties, pending, error, refresh } = await useAsyncData('specialties:list', () => fetchSpecialties())

const search = ref('')

const icons = [
  'i-lucide-heart-pulse',
  'i-lucide-brain',
  'i-lucide-bone',
  'i-lucide-eye',
  'i-lucide-baby',
  'i-lucide-syringe',
  'i-lucide-microscope',
  'i-lucide-ribbon',
  'i-lucide-activity',
  'i-lucide-pill',
  'i-lucide-hand-heart',
  'i-lucide-ear',
]

function iconFor(index: number) {
  return icons[index % icons.length] ?? 'i-lucide-stethoscope'
}

useHead({ title: 'Especialidades' })

const items = computed<Specialty[]>(() => specialties.value ?? [])

const filtered = computed<Specialty[]>(() => {
  const query = search.value.trim().toLowerCase()
  if (!query)
    return items.value
  return items.value.filter(s => s.name.toLowerCase().includes(query))
})
</script>

<template>
  <div>
    <UPageSection
      :ui="{ container: 'py-12 sm:py-16' }"
    >
      <template #headline>
        <div class="inline-flex items-center gap-2 text-primary text-sm font-semibold">
          <UIcon name="i-lucide-stethoscope" class="size-4" />
          <span>Especialidades</span>
        </div>
      </template>

      <template #title>
        <span class="text-3xl sm:text-4xl text-pretty font-bold text-highlighted">
          Elegí la especialidad que necesitás
        </span>
      </template>

      <template #description>
        <span class="text-base sm:text-lg text-muted">
          Conocé todas las especialidades disponibles en nuestra clínica y reservá tu consulta con el profesional indicado.
        </span>
      </template>

      <UAlert
        v-if="error"
        color="error"
        icon="i-lucide-triangle-alert"
        title="No se pudieron cargar las especialidades"
        :description="error.message"
        class="mb-6"
      >
        <template #actions>
          <UButton label="Reintentar" color="error" variant="outline" @click="refresh()" />
        </template>
      </UAlert>

      <template v-else>
        <div class="mb-6 max-w-md">
          <UInput
            v-model="search"
            icon="i-lucide-search"
            placeholder="Buscar especialidad por nombre"
            size="lg"
            autocomplete="off"
          />
        </div>

        <div v-if="pending" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <USkeleton v-for="i in 6" :key="i" class="h-44" />
        </div>

        <UEmpty
          v-else-if="items.length === 0"
          icon="i-lucide-stethoscope"
          title="Aún no hay especialidades cargadas"
          description="Volvé más tarde o contactanos para conocer los servicios disponibles."
        />

        <UEmpty
          v-else-if="filtered.length === 0"
          icon="i-lucide-search-x"
          title="Sin resultados"
          :description="`No encontramos especialidades que coincidan con “${search}”`"
        />

        <UPageGrid v-else>
          <UPageCard
            v-for="(specialty, index) in filtered"
            :key="specialty.id"
            variant="subtle"
            spotlight
            spotlight-color="primary"
            class="h-full"
          >
            <template #leading>
              <div class="inline-flex items-center justify-center size-12 rounded-lg bg-primary/10 text-primary">
                <UIcon :name="iconFor(index)" class="size-6" />
              </div>
            </template>
            <template #title>
              <span class="text-highlighted font-semibold">{{ specialty.name }}</span>
            </template>
            <template #description>
              <span class="text-muted">
                {{ specialty.description ?? 'Consultá con profesionales especializados en esta área.' }}
              </span>
            </template>
          </UPageCard>
        </UPageGrid>
      </template>
    </UPageSection>
  </div>
</template>
