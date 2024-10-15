<!-- src/components/ShowTasks.vue -->
<template>
  <v-container>
    <v-row>
      <v-col cols="12">
        <h2>Tareas</h2>
        <v-btn @click="fetchTasks" color="primary" class="mb-4">
          Actualizar Lista de Tareas
        </v-btn>
        <v-alert v-if="error" type="error" class="mb-4">
          {{ error }}
        </v-alert>
        <v-progress-circular
          v-if="loading"
          indeterminate
          color="primary"
          class="mb-4"
        />
      </v-col>
    </v-row>
    <v-row v-if="tasks.length">
      <v-col v-for="task in tasks" :key="task.id" cols="12" md="4">
        <v-card class="task-card">
          <v-card-title class="task-title">{{ task.title }}</v-card-title>
          <v-card-subtitle class="task-status">
            Estado: <strong>{{ capitalizeStatus(task.status) }}</strong>
          </v-card-subtitle>
          <v-card-text>
            <p class="task-description">{{ task.description }}</p>
            <p class="task-deadline">
              Fecha de finalización: {{ task.deadline }}
            </p>
            <div v-if="task.tags && task.tags.length">
              <strong>Etiquetas:</strong>
              <v-chip v-for="tag in task.tags" :key="tag.id" class="ma-1">
                {{ tag.name }}
              </v-chip>
            </div>
            <!-- Mostrar el adjunto si existe -->
            <div v-if="task.attachment">
              <strong>Adjunto:</strong>
              <div v-if="isImage(task.attachment)">
                <!-- Mostrar la imagen -->
                <v-img
                  :src="getAttachmentURL(task.attachment)"
                  max-height="200"
                  class="mt-2"
                ></v-img>
              </div>
              <div v-else>
                <!-- Proporcionar enlace para descargar o abrir -->
                <v-btn
                  :href="getAttachmentURL(task.attachment)"
                  target="_blank"
                  color="primary"
                  class="mt-2"
                >
                  Descargar Adjunto
                </v-btn>
              </div>
            </div>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" @click.stop="markTaskAsCompleted(task.id)">
              <v-icon>mdi-check</v-icon>
            </v-btn>
            <v-btn color="error" @click.stop="deleteTask(task.id)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
            <v-btn color="blue" @click.stop="openEditDialog(task)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col cols="12">
        <v-alert type="info">No hay tareas disponibles.</v-alert>
      </v-col>
    </v-row>

    <!-- Modal para Editar Tarea -->
    <v-dialog v-model="isEditDialogOpen" max-width="500px">
      <v-card>
        <v-card-title>
          <span>Editar Tarea</span>
        </v-card-title>
        <v-card-text>
          <v-text-field
            v-model="editedTask.title"
            label="Título"
            required
          ></v-text-field>
          <v-textarea
            v-model="editedTask.description"
            label="Descripción"
          ></v-textarea>
          <v-text-field
            v-model="editedTask.deadline"
            label="Fecha de Finalización"
            type="date"
          ></v-text-field>
          <v-select
            v-model="editedTask.status"
            :items="statusOptions"
            item-text="text"
            item-value="value"
            label="Estado"
          ></v-select>
          <!-- Selector de Etiquetas usando v-checkbox -->
          <div class="mt-2">
            <h4>Etiquetas:</h4>
            <v-checkbox
              v-for="tag in tags"
              :key="tag.id"
              :label="tag.name"
              :value="tag.id"
              v-model="editedTags"
              class="mb-1"
            />
          </div>
        </v-card-text>
        <v-card-actions>
          <v-btn color="blue darken-1" text @click="closeEditDialog">
            Cancelar
          </v-btn>
          <v-btn color="green darken-1" text @click="updateTask">
            Guardar Cambios
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import { useTagStore } from '@/stores/tagStore'
import type { Task, Tag } from '@/types'
import axios from '@/plugins/axios'

export default defineComponent({
  name: 'ShowTasks',
  setup() {
    const taskStore = useTaskStore()
    const tagStore = useTagStore()
    const loading = ref(false)
    const error = ref<string | null>(null)

    const tasks = ref<Task[]>([])
    const tags = ref<Tag[]>([])

    const isEditDialogOpen = ref(false)
    const editedTask = ref({
      id: 0,
      title: '',
      description: '',
      deadline: '',
      status: '',
      attachment: null as File | null,
    })
    const editedTags = ref<number[]>([])

    const statusOptions = [
      { text: 'Pendiente', value: 'pending' },
      { text: 'Completada', value: 'completed' },
      { text: 'Abandonada', value: 'abandoned' },
    ]

    const baseURL = axios.defaults.baseURL || ''

    onMounted(async () => {
      await fetchTasks()
      await fetchTags()
    })

    const fetchTasks = async () => {
      loading.value = true
      try {
        await taskStore.fetchTasks()
        tasks.value = taskStore.tasks
      } catch (err) {
        error.value = 'Error al cargar las tareas.'
      } finally {
        loading.value = false
      }
    }

    const fetchTags = async () => {
      try {
        await tagStore.fetchTags()
        tags.value = tagStore.tags
      } catch (err) {
        console.error('Error al obtener las etiquetas:', err)
        error.value = 'Error al cargar las etiquetas.'
      }
    }

    const deleteTask = async (id: number) => {
      try {
        await taskStore.deleteTask(id)
        await fetchTasks()
      } catch (err) {
        error.value = 'Error al eliminar la tarea.'
      }
    }

    const markTaskAsCompleted = async (id: number) => {
      try {
        await taskStore.partialUpdateTask(id, { status: 'completed' })
        await fetchTasks()
      } catch (err) {
        error.value = 'Error al marcar la tarea como completada.'
      }
    }

    const openEditDialog = (task: Task) => {
      editedTask.value = {
        id: task.id,
        title: task.title || '',
        description: task.description || '',
        deadline: task.deadline || '',
        status: task.status || 'pending',
        attachment: null,
      }
      // Obtener los IDs de las etiquetas seleccionadas
      editedTags.value = task.tags ? task.tags.map(tag => tag.id) : []
      isEditDialogOpen.value = true
    }

    const closeEditDialog = () => {
      isEditDialogOpen.value = false
    }

    const updateTask = async () => {
      try {
        const updatedData = {
          title: editedTask.value.title,
          description: editedTask.value.description,
          deadline: editedTask.value.deadline,
          status: editedTask.value.status as
            | 'pending'
            | 'completed'
            | 'abandoned',
          tags: editedTags.value.length > 0 ? editedTags.value : undefined,
          attachment: editedTask.value.attachment || undefined,
        }

        await taskStore.updateTask(editedTask.value.id, updatedData)
        await fetchTasks()
        closeEditDialog()
      } catch (err) {
        error.value = 'Error al actualizar la tarea.'
      }
    }

    // Función para capitalizar el estado
    const capitalizeStatus = (status: string) => {
      const option = statusOptions.find(opt => opt.value === status)
      return option ? option.text : status
    }

    // Función para verificar si un archivo es una imagen
    const isImage = (url: string): boolean => {
      const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp']
      const urlPath = url.split('?')[0]
      const extension = urlPath.split('.').pop()?.toLowerCase()
      return extension ? imageExtensions.includes(extension) : false
    }

    // Función para obtener la URL completa del adjunto
    const getAttachmentURL = (attachmentPath: string): string => {
      // Si attachmentPath es una URL absoluta
      if (attachmentPath.startsWith('http')) {
        return attachmentPath
      }
      // Asegurar que baseURL termina sin '/' y attachmentPath comienza con '/'
      const normalizedBaseURL = baseURL.endsWith('/')
        ? baseURL.slice(0, -1)
        : baseURL
      const normalizedPath = attachmentPath.startsWith('/')
        ? attachmentPath
        : '/' + attachmentPath
      return normalizedBaseURL + normalizedPath
    }

    return {
      tasks,
      tags,
      loading,
      error,
      isEditDialogOpen,
      editedTask,
      editedTags,
      statusOptions,
      deleteTask,
      markTaskAsCompleted,
      openEditDialog,
      closeEditDialog,
      updateTask,
      capitalizeStatus,
      isImage,
      getAttachmentURL,
    }
  },
})
</script>

<style scoped>
.mb-4 {
  margin-bottom: 1rem;
}
.ma-1 {
  margin: 0.25rem;
}
.mt-2 {
  margin-top: 1rem;
}
.task-title {
  font-size: 1.2rem;
}
.task-status {
  font-size: 0.9rem;
}
.task-description,
.task-deadline {
  font-size: 0.85rem;
}
.task-card {
  cursor: pointer;
  transition: transform 0.2s ease;
}
.task-card:hover {
  transform: scale(1.02);
}
</style>
