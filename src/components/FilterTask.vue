<!-- src/components/FilterTask.vue -->
<template>
  <div class="filter-container">
    <label class="filter-label">Filtrar por Estado:</label>
    <div class="radio-group">
      <v-radio-group v-model="selectedStatus" @change="filterTasks" row>
        <v-radio
          v-for="option in statusOptions"
          :key="option.value"
          :value="option.value"
          :label="option.label"
        />
      </v-radio-group>
    </div>
    <v-btn
      @click="clearFilter"
      class="clear-button"
      color="primary"
      variant="text"
    >
      Limpiar Filtro
    </v-btn>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue'
import { useTaskStore } from '@/stores/taskStore'

export default defineComponent({
  name: 'FilterTask',
  setup() {
    const statusOptions = [
      { label: 'Todos', value: 'all' },
      { label: 'Pendiente', value: 'pending' },
      { label: 'Completada', value: 'completed' },
      { label: 'Abandonada', value: 'abandoned' },
    ]

    const taskStore = useTaskStore()
    const selectedStatus = ref<string>('all')

    // Actualizamos el filtro en el store cuando cambia selectedStatus
    watch(selectedStatus, newStatus => {
      taskStore.setFilter(newStatus)
    })

    const filterTasks = () => {
      taskStore.setFilter(selectedStatus.value)
    }
    // Limpiamos el filtro
    const clearFilter = () => {
      selectedStatus.value = 'all'
    }

    return {
      statusOptions,
      selectedStatus,
      clearFilter,
      filterTasks,
    }
  },
})
</script>
