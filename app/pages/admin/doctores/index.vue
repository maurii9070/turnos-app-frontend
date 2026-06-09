<script setup lang="ts">
import type { TableColumn } from '@nuxt/ui'
import type { DoctorListItem } from '~/types/doctors'

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['SuperAdmin'],
  layout: 'dashboard',
})

useHead({
  title: 'Gestionar Doctores',
})

const { fetchDoctors, deleteDoctor, loading } = useDoctors()
const toast = useToast()

const doctors = ref<DoctorListItem[]>([])
const error = ref<string | null>(null)

const deleteConfirmOpen = ref(false)
const deleteTarget = ref<DoctorListItem | null>(null)
const deleting = ref(false)

const columns: TableColumn<DoctorListItem>[] = [
  {
    id: 'name',
    header: 'Nombre',
    accessorFn: row => `${row.firstName} ${row.lastName}`,
  },
  {
    id: 'dni',
    header: 'DNI',
    accessorKey: 'dni' as keyof DoctorListItem,
  },
  {
    id: 'specialty',
    header: 'Especialidad',
    accessorKey: 'specialtyName' as keyof DoctorListItem,
  },
  {
    id: 'license',
    header: 'Matrícula',
    accessorKey: 'licenseNumber' as keyof DoctorListItem,
  },
  {
    id: 'price',
    header: 'Consulta',
    accessorFn: row => `$${row.consultationPrice.toLocaleString()}`,
  },
  {
    id: 'actions',
    header: '',
  },
]

async function loadDoctors() {
  error.value = null
  try {
    doctors.value = await fetchDoctors()
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar doctores'
    doctors.value = []
  }
}

function confirmDelete(doc: DoctorListItem) {
  deleteTarget.value = doc
  deleteConfirmOpen.value = true
}

async function handleDelete() {
  if (!deleteTarget.value || deleting.value)
    return

  deleting.value = true
  try {
    await deleteDoctor(deleteTarget.value.doctorId)
    toast.add({
      title: 'Doctor desactivado',
      description: `${deleteTarget.value.firstName} ${deleteTarget.value.lastName} fue desactivado.`,
      color: 'success',
    })
    await loadDoctors()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al desactivar el doctor',
      color: 'error',
    })
  }
  finally {
    deleting.value = false
    deleteConfirmOpen.value = false
    deleteTarget.value = null
  }
}

onMounted(() => {
  loadDoctors()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">
          Gestionar doctores
        </h1>
        <p class="mt-1 text-muted">
          Administrá los doctores registrados en el sistema.
        </p>
      </div>
      <UButton
        label="Registrar doctor"
        icon="i-lucide-plus"
        color="primary"
        to="/admin/nuevo-doctor"
      />
    </div>

    <UAlert
      v-if="error"
      color="error"
      variant="subtle"
      title="Error"
      icon="i-lucide-alert-circle"
      :description="error"
    >
      <template #footer>
        <UButton label="Reintentar" size="sm" variant="outline" @click="loadDoctors" />
      </template>
    </UAlert>

    <UTable
      :columns="columns"
      :data="doctors"
      :loading="loading"
    >
      <template #name-cell="{ row }">
        {{ row.original.firstName }} {{ row.original.lastName }}
      </template>

      <template #price-cell="{ row }">
        ${{ row.original.consultationPrice.toLocaleString() }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            label="Editar"
            color="primary"
            size="sm"
            variant="ghost"
            :to="`/admin/doctores/${row.original.doctorId}`"
          />
          <UButton
            icon="i-lucide-trash-2"
            label="Desactivar"
            color="error"
            size="sm"
            variant="ghost"
            @click="confirmDelete(row.original)"
          />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center py-8">
          <UIcon name="i-lucide-stethoscope" class="size-12 text-muted" />
          <p class="mt-2 font-medium">
            No hay doctores
          </p>
          <p class="text-sm text-muted">
            Todavía no se registraron doctores en el sistema.
          </p>
        </div>
      </template>
    </UTable>

    <UModal
      v-model:open="deleteConfirmOpen"
      title="Desactivar doctor"
      :description="deleteTarget ? `¿Estás seguro de que querés desactivar a ${deleteTarget.firstName} ${deleteTarget.lastName}?` : ''"
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
          label="Desactivar"
          color="error"
          :loading="deleting"
          @click="handleDelete"
        />
      </template>
    </UModal>
  </div>
</template>
