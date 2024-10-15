<!-- src/components/TaskManager.vue -->
<template>
  <div class="container-section">
    <v-container>
      <v-row>
        <v-col cols="12">
          <h2>Gestor de Tareas</h2>
          <FilterTask />
          <ShowTasks :tasks="filteredTasks" />
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue'
import ShowTasks from '../components/ShowTasks.vue'
import FilterTask from '../components/FilterTask.vue'
import { useTaskStore } from '@/stores/taskStore'

export default defineComponent({
  name: 'TaskManager',
  components: {
    ShowTasks,
    FilterTask,
  },
  setup() {
    const taskStore = useTaskStore()

    // Usamos computed para que filteredTasks sea reactivo
    const filteredTasks = computed(() => taskStore.filteredTasks)

    return {
      filteredTasks,
    }
  },
})
</script>

<style scoped>
.container-section {
  margin-top: 80px;
}
</style>
