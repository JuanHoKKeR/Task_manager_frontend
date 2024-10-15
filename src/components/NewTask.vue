<!-- src/components/NewTask.vue -->
<template>
  <div class="container-newtask">
    <v-card class="pa-4">
      <v-form @submit.prevent="addTask">
        <h2>Crea una Nueva Tarea 😎</h2>

        <!-- Campo Título -->
        <v-text-field
          v-model="title"
          label="Título de la tarea"
          :rules="[v => !!v || 'El título es requerido']"
          required
        />

        <!-- Campo Descripción -->
        <v-textarea v-model="description" label="Descripción" rows="3" />

        <!-- Selector de Estado -->
        <div class="mt-2">
          <h4>Estado:</h4>
          <v-radio-group v-model="status" row>
            <v-radio
              v-for="option in statusOptions"
              :key="option.value"
              :label="option.text"
              :value="option.value"
            />
          </v-radio-group>
        </div>

        <!-- Selector de Etiquetas -->
        <div class="mt-2">
          <h4>Etiquetas:</h4>
          <v-checkbox
            v-for="tag in tags"
            :key="tag.id"
            :label="tag.name"
            :value="tag.id"
            v-model="selectedTags"
            class="mb-1"
          />
        </div>

        <!-- Crear Nueva Etiqueta -->
        <div class="mt-2">
          <v-text-field
            v-model="newTagName"
            label="Nueva Etiqueta"
            @keyup.enter="createTag"
          />
          <v-btn @click="createTag" color="primary" class="mt-2">
            Crear Etiqueta
          </v-btn>
        </div>

        <!-- Campo Adjuntar Archivo -->
        <v-file-input
          v-model="attachment"
          label="Archivo adjunto"
          prepend-icon="mdi-paperclip"
          accept="image/*,application/pdf"
          :rules="[
            v =>
              !v ||
              (v && v.size < 10485760) ||
              'Archivo demasiado grande (máx 10MB)',
          ]"
        />

        <!-- Campo Fecha de Finalización -->
        <v-text-field
          v-model="deadline"
          label="Fecha de finalización"
          type="date"
          :rules="[v => !!v || 'La fecha de finalización es requerida']"
          required
        />

        <!-- Botón Agregar Tarea -->
        <v-btn
          type="submit"
          color="primary"
          :loading="loading"
          class="mt-4"
          block
        >
          Agregar Tarea
        </v-btn>

        <!-- Alerta de Error -->
        <v-alert v-if="error" type="error" dismissible class="mt-2">
          {{ error }}
        </v-alert>

        <!-- Indicador de Carga -->
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="mt-2"
        />
      </v-form>
    </v-card>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import { useTagStore } from '../stores/tagStore'
import type { Tag } from '@/types'
import router from '@/router' // Importar el router para redirigir al login si es necesario

export default defineComponent({
  name: 'NewTask',
  setup() {
    const taskStore = useTaskStore()
    const tagStore = useTagStore()

    const title = ref<string>('')
    const description = ref<string>('')
    const status = ref<'pending' | 'completed' | 'abandoned'>('pending')
    const selectedTags = ref<number[]>([])
    const attachment = ref<File | null>(null)
    const deadline = ref<string>('')
    const error = ref<string>('')
    const loading = ref<boolean>(false)
    const newTagName = ref<string>('')

    const statusOptions = [
      { text: 'Pendiente', value: 'pending' },
      { text: 'Completada', value: 'completed' },
      { text: 'Abandonada', value: 'abandoned' },
    ]

    const tags = ref<Tag[]>([])

    // Obtener las etiquetas disponibles al montar el componente
    const fetchTags = async () => {
      try {
        await tagStore.fetchTags()
        tags.value = tagStore.tags
      } catch (err) {
        console.error('Error al obtener las etiquetas:', err)
        error.value = 'Error al cargar las etiquetas.'
      }
    }

    // Crear una nueva etiqueta
    const createTag = async () => {
      if (!newTagName.value.trim()) {
        error.value = 'El nombre de la etiqueta es requerido.'
        return
      }
      try {
        await tagStore.createTag(newTagName.value)
        newTagName.value = ''
        await fetchTags()
      } catch (err: any) {
        if (err.response?.status === 401) {
          // Redirigir al usuario a la página de login si no está autenticado
          router.push({ name: 'Login' }) // Asegúrate de que el nombre de la ruta es correcto
        } else {
          console.error('Error al crear la etiqueta:', err)
          error.value =
            'Error al crear la etiqueta. Asegúrate de estar autenticado.'
        }
      }
    }

    onMounted(() => {
      fetchTags()
    })

    // Agregar una nueva tarea
    const addTask = async () => {
      // Validaciones
      if (!title.value.trim()) {
        error.value = 'El título es requerido.'
        return
      }
      if (!status.value) {
        error.value = 'El estado es requerido.'
        return
      }
      if (!deadline.value.trim()) {
        error.value = 'La fecha de finalización es requerida.'
        return
      }
      // No requerir etiquetas o attachment, así que no se necesitan validaciones adicionales

      loading.value = true
      error.value = ''

      try {
        // Crear el objeto de la tarea para enviar
        const taskData = {
          title: title.value,
          description: description.value,
          status: status.value,
          deadline: deadline.value,
          tags: selectedTags.value, // number[]
          attachment: attachment.value || undefined,
        }

        // Utilizar el store para crear la tarea
        await taskStore.createTask(taskData)

        // Limpiar los campos después de agregar la tarea
        title.value = ''
        description.value = ''
        status.value = 'pending'
        selectedTags.value = []
        attachment.value = null
        deadline.value = ''
      } catch (err: any) {
        // Manejo de errores, extraer el mensaje de error
        if (err.response && err.response.data && err.response.data.detail) {
          error.value = err.response.data.detail
        } else {
          error.value = 'Error al agregar la tarea.'
        }
      } finally {
        loading.value = false
      }
    }

    return {
      title,
      description,
      status,
      selectedTags,
      attachment,
      deadline,
      error,
      loading,
      statusOptions,
      tags,
      newTagName,
      createTag,
      addTask,
    }
  },
})
</script>

<style scoped>
.container-newtask {
  margin: 80px 40px 80px;
}
.pa-4 {
  padding: 1.5rem;
}
.mt-2 {
  margin-top: 1rem;
}
.mt-4 {
  margin-top: 2rem;
}
</style>
