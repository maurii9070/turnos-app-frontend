<script setup lang="ts">
import type { FormSubmitEvent, TableColumn } from '@nuxt/ui'
import type { Specialty } from '~/types/specialties'
import * as v from 'valibot'

const specialtySchema = v.object({
  name: v.pipe(
    v.string('El nombre es obligatorio.'),
    v.nonEmpty('El nombre es obligatorio.'),
    v.maxLength(100, 'El nombre no puede superar los 100 caracteres.'),
  ),
  description: v.optional(
    v.pipe(
      v.string(),
      v.check(
        s => s === '' || s.length <= 500,
        'La descripción no puede superar los 500 caracteres.',
      ),
    ),
  ),
})

type SpecialtyFormOutput = v.InferOutput<typeof specialtySchema>

definePageMeta({
  middleware: ['auth', 'role'],
  allowedRoles: ['SuperAdmin'],
  layout: 'dashboard',
})

useHead({
  title: 'Gestionar Especialidades',
})

const { fetchSpecialties, createSpecialty, updateSpecialty, deleteSpecialty, loading } = useSpecialties()
const toast = useToast()
const form = useTemplateRef('form')

const specialties = ref<Specialty[]>([])
const error = ref<string | null>(null)

const showFormModal = ref(false)
const editingSpecialty = ref<Specialty | null>(null)
const saving = ref(false)

const showDeleteModal = ref(false)
const deletingSpecialty = ref<Specialty | null>(null)
const deleting = ref(false)

const formState = reactive<Partial<SpecialtyFormOutput>>({
  name: '',
  description: '',
})

const columns: TableColumn<Specialty>[] = [
  { accessorKey: 'name', header: 'Nombre' },
  { accessorKey: 'description', header: 'Descripción' },
  { id: 'actions', header: '' },
]

async function loadSpecialties() {
  error.value = null
  try {
    specialties.value = await fetchSpecialties()
  }
  catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Error al cargar especialidades'
    specialties.value = []
  }
}

function openCreateModal() {
  editingSpecialty.value = null
  formState.name = ''
  formState.description = ''
  showFormModal.value = true
}

function openEditModal(specialty: Specialty) {
  editingSpecialty.value = specialty
  formState.name = specialty.name
  formState.description = specialty.description ?? ''
  showFormModal.value = true
}

function confirmDelete(specialty: Specialty) {
  deletingSpecialty.value = specialty
  showDeleteModal.value = true
}

async function handleFormSubmit(event: FormSubmitEvent<SpecialtyFormOutput>) {
  saving.value = true
  try {
    if (editingSpecialty.value) {
      await updateSpecialty(editingSpecialty.value.id, {
        name: event.data.name,
        description: event.data.description || null,
      })
      toast.add({
        title: 'Especialidad actualizada',
        description: `${event.data.name} fue actualizada con éxito.`,
        color: 'success',
      })
    }
    else {
      await createSpecialty({
        name: event.data.name,
        description: event.data.description || null,
      })
      toast.add({
        title: 'Especialidad creada',
        description: `${event.data.name} fue creada con éxito.`,
        color: 'success',
      })
    }
    showFormModal.value = false
    editingSpecialty.value = null
    await loadSpecialties()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al guardar la especialidad',
      color: 'error',
    })
  }
  finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!deletingSpecialty.value || deleting.value)
    return

  deleting.value = true
  try {
    await deleteSpecialty(deletingSpecialty.value.id)
    toast.add({
      title: 'Especialidad eliminada',
      description: `${deletingSpecialty.value.name} fue eliminada con éxito.`,
      color: 'success',
    })
    showDeleteModal.value = false
    deletingSpecialty.value = null
    await loadSpecialties()
  }
  catch (err: unknown) {
    toast.add({
      title: 'Error',
      description: err instanceof Error ? err.message : 'Error al eliminar la especialidad',
      color: 'error',
    })
  }
  finally {
    deleting.value = false
  }
}

onMounted(() => {
  loadSpecialties()
})
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-semibold">
          Gestionar especialidades
        </h1>
        <p class="mt-1 text-muted">
          Administrá las especialidades disponibles en el sistema.
        </p>
      </div>
      <UButton
        label="Nueva especialidad"
        icon="i-lucide-plus"
        color="primary"
        @click="openCreateModal"
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
        <UButton label="Reintentar" size="sm" variant="outline" @click="loadSpecialties" />
      </template>
    </UAlert>

    <UTable
      :columns="columns"
      :data="specialties"
      :loading="loading"
    >
      <template #description-cell="{ row }">
        {{ row.original.description ?? '—' }}
      </template>

      <template #actions-cell="{ row }">
        <div class="flex items-center gap-1">
          <UButton
            icon="i-lucide-pencil"
            label="Editar"
            color="primary"
            size="sm"
            variant="ghost"
            @click="openEditModal(row.original)"
          />
          <UButton
            icon="i-lucide-trash-2"
            label="Eliminar"
            color="error"
            size="sm"
            variant="ghost"
            @click="confirmDelete(row.original)"
          />
        </div>
      </template>

      <template #empty>
        <div class="flex flex-col items-center py-8">
          <UIcon name="i-lucide-tag" class="size-12 text-muted" />
          <p class="mt-2 font-medium">
            No hay especialidades
          </p>
          <p class="text-sm text-muted">
            Todavía no se crearon especialidades en el sistema.
          </p>
        </div>
      </template>
    </UTable>

    <UModal
      v-model:open="showFormModal"
      :title="editingSpecialty ? 'Editar especialidad' : 'Nueva especialidad'"
    >
      <template #body>
        <UForm
          :key="editingSpecialty?.id ?? 'create'"
          ref="form"
          :schema="specialtySchema"
          :state="formState"
          class="space-y-4"
          @submit="handleFormSubmit"
        >
          <UFormField name="name" label="Nombre" required>
            <UInput
              v-model="formState.name"
              placeholder="ej. Cardiología"
              :disabled="saving"
            />
          </UFormField>

          <UFormField name="description" label="Descripción">
            <UTextarea
              v-model="formState.description"
              placeholder="Descripción opcional..."
              :disabled="saving"
              :rows="3"
            />
          </UFormField>

          <div class="flex justify-end gap-3 pt-2">
            <UButton
              label="Cancelar"
              color="neutral"
              variant="outline"
              :disabled="saving"
              @click="showFormModal = false"
            />
            <UButton
              type="submit"
              :label="editingSpecialty ? 'Guardar cambios' : 'Crear especialidad'"
              color="primary"
              :loading="saving"
            />
          </div>
        </UForm>
      </template>
    </UModal>

    <UModal
      v-model:open="showDeleteModal"
      title="Eliminar especialidad"
      :description="deletingSpecialty ? `¿Estás seguro de que querés eliminar «${deletingSpecialty.name}»?` : ''"
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
