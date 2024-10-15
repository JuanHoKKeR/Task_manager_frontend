<!-- src/components/TaskForm.vue -->
<template>
  <v-dialog v-model="dialog" max-width="600px">
    <template #activator="{ on, attrs }">
      <v-btn color="primary" dark v-bind="attrs" v-on="on">
        {{ isEdit ? 'Editar Tarea' : 'Crear Tarea' }}
      </v-btn>
    </template>

    <v-card>
      <v-card-title>
        <span class="headline">{{
          isEdit ? 'Editar Tarea' : 'Crear Tarea'
        }}</span>
      </v-card-title>

      <v-card-text>
        <v-form ref="form" @submit.prevent="handleSubmit">
          <v-text-field
            label="Título"
            v-model="taskData.title"
            :rules="[v => !!v || 'Título es requerido']"
            required
          ></v-text-field>

          <v-textarea
            label="Descripción"
            v-model="taskData.description"
          ></v-textarea>

          <v-select
            :items="statuses"
            label="Estado"
            v-model="taskData.status"
            :rules="[v => !!v || 'Estado es requerido']"
            required
          ></v-select>

          <v-menu
            ref="deadlineMenu"
            v-model="deadlineMenu"
            :close-on-content-click="false"
            transition="scale-transition"
            offset-y
            min-width="auto"
          >
            <template #activator="{ on, attrs }">
              <v-text-field
                v-model="taskData.deadline"
                label="Fecha Límite"
                prepend-icon="mdi-calendar"
                readonly
                v-bind="attrs"
                v-on="on"
              ></v-text-field>
            </template>
            <v-date-picker
              v-model="taskData.deadline"
              @input="deadlineMenu = false"
            ></v-date-picker>
          </v-menu>

          <v-file-input
            label="Adjuntar Archivo"
            v-model="taskData.attachment"
            prepend-icon="mdi-paperclip"
            accept="image/*"
            @change="handleFileChange"
          ></v-file-input>

          <TagSelector v-model="taskData.tags" />
        </v-form>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn text @click="closeDialog">Cancelar</v-btn>
        <v-btn color="primary" text @click="handleSubmit" :loading="loading">
          {{ isEdit ? 'Actualizar' : 'Crear' }}
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import TagSelector from './TagSelector.vue'
import type { Task, Tag } from '@/types'

export default defineComponent({
  name: 'TaskForm',
  components: { TagSelector },
  props: {
    task: {
      type: Object as () => Task | null,
      default: null,
    },
  },
  emits: ['close'],
  setup(props, { emit }) {
    const dialog = ref(false)
    const form = ref<HTMLFormElement | null>(null)
    const taskStore = useTaskStore()

    const isEdit = ref(false)

    const statuses = ['pending', 'completed', 'abandoned']

    const taskData = ref({
      title: '',
      description: '',
      status: 'pending',
      deadline: '',
      attachment: null as File | null,
      tags: [] as Tag[],
    })

    const deadlineMenu = ref(false)

    watch(
      () => props.task,
      newTask => {
        if (newTask) {
          isEdit.value = true
          taskData.value.title = newTask.title
          taskData.value.description = newTask.description || ''
          taskData.value.status = newTask.status
          taskData.value.deadline = newTask.deadline
          taskData.value.tags = newTask.tags
          // No manejamos attachments en edición por simplicidad
        } else {
          isEdit.value = false
          resetForm()
        }
      },
      { immediate: true },
    )

    const resetForm = () => {
      taskData.value = {
        title: '',
        description: '',
        status: 'pending',
        deadline: '',
        attachment: null,
        tags: [],
      }
    }

    const handleFileChange = (file: File | null) => {
      taskData.value.attachment = file
    }

    const handleSubmit = async () => {
      if (form.value?.validate()) {
        try {
          if (isEdit.value && props.task) {
            await taskStore.updateTask({
              id: props.task.id,
              task: taskData.value.title,
              description: taskData.value.description,
              status: taskData.value.status,
              deadline: taskData.value.deadline,
              tags: taskData.value.tags.map(tag => tag.id),
              attachment: taskData.value.attachment,
            })
          } else {
            await taskStore.createTask({
              title: taskData.value.title,
              description: taskData.value.description,
              status: taskData.value.status,
              deadline: taskData.value.deadline,
              tags: taskData.value.tags.map(tag => tag.id),
              attachment: taskData.value.attachment,
            })
          }
          closeDialog()
        } catch (error) {
          console.error('Error al guardar la tarea', error)
        }
      }
    }

    const closeDialog = () => {
      dialog.value = false
      emit('close')
      resetForm()
    }

    return {
      dialog,
      form,
      isEdit,
      statuses,
      taskData,
      deadlineMenu,
      handleFileChange,
      handleSubmit,
      closeDialog,
    }
  },
})
</script>

<style scoped></style>
