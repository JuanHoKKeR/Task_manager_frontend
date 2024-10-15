// src/stores/tagStore.ts
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import type { Tag } from '@/types'

export const useTagStore = defineStore('tag', {
  state: () => ({
    tags: [] as Tag[],
  }),
  actions: {
    /**
     * Obtiene todas las etiquetas del servidor.
     */
    async fetchTags() {
      try {
        const response = await axios.get('/tags/')
        this.tags = response.data
      } catch (error) {
        console.error('Error al obtener las etiquetas.', error)
        throw error
      }
    },

    /**
     * Crea una nueva etiqueta.
     * @param name - Nombre de la etiqueta.
     */
    async createTag(name: string) {
      try {
        const response = await axios.post('/tags/', { name })
        this.tags.push(response.data)
      } catch (error) {
        console.error('Error al crear la etiqueta.', error)
        throw error
      }
    },

    /**
     * Elimina una etiqueta por ID.
     * @param id - ID de la etiqueta a eliminar.
     */
    async deleteTag(id: number) {
      try {
        await axios.delete(`/tags/${id}/`)
        this.tags = this.tags.filter(tag => tag.id !== id)
      } catch (error) {
        console.error('Error al eliminar la etiqueta.', error)
        throw error
      }
    },
  },
})
