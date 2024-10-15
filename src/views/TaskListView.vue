<!-- src/views/TaskListView.vue -->

<template>
  <TaskManager />
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import TaskManager from '../components/TaskManager.vue'

export default defineComponent({
  name: 'TaskListView',
  components: { TaskManager },
})
</script>

<style scoped></style>
