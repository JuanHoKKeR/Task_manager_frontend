<!-- src/components/TagSelector.vue -->

<template>
  <v-autocomplete
    v-model="selectedTags"
    :items="tags"
    item-text="name"
    item-value="id"
    label="Etiquetas"
    multiple
    chips
    clearable
    hide-details
    @update:modelValue="updateTags"
    @keydown.enter.prevent
    @blur="closeMenu"
    @click:append="openMenu"
  >
    <template #prepend-item>
      <v-list-item ripple @click="createTag">
        <v-list-item-content>
          <v-list-item-title>Agregar nueva etiqueta</v-list-item-title>
        </v-list-item-content>
        <v-list-item-action>
          <v-icon>mdi-plus</v-icon>
        </v-list-item-action>
      </v-list-item>
      <v-divider class="mt-2"></v-divider>
    </template>
  </v-autocomplete>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue'
import { useTaskStore } from '@/stores/taskStore'
import axios from '@/plugins/axios'
import type { Tag } from '@/types'

export default defineComponent({
  name: 'TagSelector',
  emits: ['update:modelValue'],
  props: {
    modelValue: {
      type: Array as () => number[],
      default: () => [],
    },
  },
  setup(props, { emit }) {
    const taskStore = useTaskStore()
    const tags = ref<Tag[]>([])
    const selectedTags = ref<number[]>(props.modelValue)

    const fetchTags = async () => {
      try {
        const response = await axios.get('/tags')
        tags.value = response.data
      } catch (error) {
        console.error('Error al obtener las etiquetas', error)
      }
    }

    const createTag = async () => {
      const newTagName = prompt('Ingrese el nombre de la nueva etiqueta:')
      if (newTagName) {
        try {
          const response = await axios.post('/tags', { name: newTagName })
          tags.value.push(response.data)
          selectedTags.value.push(response.data.id)
          emit('update:modelValue', selectedTags.value)
        } catch (error) {
          console.error('Error al crear la etiqueta', error)
        }
      }
    }

    const updateTags = (value: number[]) => {
      emit('update:modelValue', value)
    }

    const openMenu = () => {
      // Opcional: lógica para abrir el menú
    }

    const closeMenu = () => {
      // Opcional: lógica para cerrar el menú
    }

    onMounted(() => {
      fetchTags()
    })

    return {
      tags,
      selectedTags,
      createTag,
      updateTags,
      openMenu,
      closeMenu,
    }
  },
})
</script>

<style scoped></style>
