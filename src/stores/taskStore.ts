// src/stores/taskStore.ts
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import type { Task } from '@/types'

export const useTaskStore = defineStore('task', {
  state: () => ({
    tasks: [] as Task[],
    filter: 'all' as string,
    notify: null as 'delete' | 'update' | 'add' | null,
  }),
  getters: {
    filteredTasks: state => {
      if (state.filter === 'all') return state.tasks
      return state.tasks.filter(task => task.status === state.filter)
    },
  },
  actions: {
    /**
     * Obtiene todas las tareas del servidor.
     */
    async fetchTasks() {
      try {
        const response = await axios.get('/tasks/', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.tasks = response.data
      } catch (error) {
        console.error('Error al obtener las tareas.', error)
        throw error
      }
    },

    /**
     * Crea una nueva tarea.
     * @param taskData - Datos de la nueva tarea.
     */
    async createTask(taskData: {
      title: string
      description?: string
      status: 'pending' | 'completed' | 'abandoned'
      tags?: number[] // Hacer 'tags' opcional
      deadline: string
      attachment?: File
    }) {
      try {
        const formData = new FormData()
        formData.append('title', taskData.title)
        if (taskData.description)
          formData.append('description', taskData.description)
        formData.append('status', taskData.status)
        formData.append('deadline', taskData.deadline)
        if (taskData.tags && taskData.tags.length > 0) {
          taskData.tags.forEach(tagId =>
            formData.append('tags', tagId.toString()),
          )
        }
        if (taskData.attachment)
          formData.append('attachment', taskData.attachment)

        const response = await axios.post('/tasks/', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.tasks.push(response.data)
        this.notify = 'add'
      } catch (error) {
        console.error('Error al crear la tarea.', error)
        throw error
      }
    },

    /**
     * Elimina una tarea por su ID.
     * @param id - ID de la tarea a eliminar.
     */
    async deleteTask(id: number) {
      try {
        await axios.delete(`/tasks/${id}/`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        this.tasks = this.tasks.filter(task => task.id !== id)
        this.notify = 'delete'
      } catch (error) {
        console.error('Error al eliminar la tarea.', error)
        throw error
      }
    },

    /**
     * Actualiza una tarea existente.
     * @param id - ID de la tarea a actualizar.
     * @param updatedData - Datos a actualizar en la tarea.
     */
    async updateTask(
      id: number,
      updatedData: {
        title?: string
        description?: string
        status?: 'pending' | 'completed' | 'abandoned'
        tags?: number[]
        deadline?: string
        attachment?: File
      },
    ) {
      try {
        const formData = new FormData()
        if (updatedData.title) formData.append('title', updatedData.title)
        if (updatedData.description)
          formData.append('description', updatedData.description)
        if (updatedData.status) formData.append('status', updatedData.status)
        if (updatedData.deadline)
          formData.append('deadline', updatedData.deadline)
        if (updatedData.tags && updatedData.tags.length > 0) {
          updatedData.tags.forEach(tagId =>
            formData.append('tags', tagId.toString()),
          )
        }
        if (updatedData.attachment)
          formData.append('attachment', updatedData.attachment)

        const response = await axios.put(`/tasks/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        // Actualizamos la tarea en el estado local.
        this.tasks = this.tasks.map(task =>
          task.id === id ? response.data : task,
        )
        this.notify = 'update'
      } catch (error) {
        console.error('Error al actualizar la tarea.', error)
        throw error
      }
    },
    /**
     * Actualiza parcialmente una tarea existente.
     * @param id - ID de la tarea a actualizar.
     * @param updatedData - Datos a actualizar en la tarea.
     */
    async partialUpdateTask(
      id: number,
      updatedData: {
        title?: string
        description?: string
        status?: 'pending' | 'completed' | 'abandoned'
        tags?: number[]
        deadline?: string
        attachment?: File
      },
    ) {
      try {
        const formData = new FormData()
        if (updatedData.title) formData.append('title', updatedData.title)
        if (updatedData.description)
          formData.append('description', updatedData.description)
        if (updatedData.status) formData.append('status', updatedData.status)
        if (updatedData.deadline)
          formData.append('deadline', updatedData.deadline)
        if (updatedData.tags && updatedData.tags.length > 0) {
          updatedData.tags.forEach(tagId =>
            formData.append('tags', tagId.toString()),
          )
        }
        if (updatedData.attachment)
          formData.append('attachment', updatedData.attachment)

        const response = await axios.patch(`/tasks/${id}/`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        })
        // Actualizamos la tarea en el estado local.
        this.tasks = this.tasks.map(task =>
          task.id === id ? response.data : task,
        )
        this.notify = 'update'
      } catch (error) {
        console.error('Error al actualizar la tarea parcialmente.', error)
        throw error
      }
    },

    /**
     * Establece el tipo de notificación.
     * @param type - Tipo de notificación ('delete', 'update', 'add', o null).
     */
    setNotify(type: 'delete' | 'update' | 'add' | null) {
      this.notify = type
    },

    /**
     * Establece el filtro de tareas.
     * @param filter - Estado por el cual filtrar ('all', 'pending', 'completed', 'abandoned').
     */
    setFilter(filter: string) {
      this.filter = filter
    },
  },
})
