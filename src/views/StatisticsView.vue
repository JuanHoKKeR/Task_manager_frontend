<template>
  <div class="container-statistics">
    <v-container>
      <v-row>
        <v-col cols="12">
          <v-card>
            <v-card-title>
              <v-icon left>mdi-chart-bar-stacked</v-icon> Estadísticas
            </v-card-title>
            <v-card-subtitle>Historial de tareas</v-card-subtitle>
            <v-card-text>
              <!-- Estadísticas por Estado -->
              <div class="stat-group">
                <h3>Por Estado</h3>
                <v-chip class="ma-2" color="orange" text-color="white">
                  <v-avatar left class="orange darken-4">
                    {{ tasksPending }}
                  </v-avatar>
                  Pendientes
                </v-chip>
                <v-chip class="ma-2" color="green" text-color="white">
                  <v-avatar left class="green darken-4">
                    {{ tasksCompleted }}
                  </v-avatar>
                  Completadas
                </v-chip>
                <v-chip class="ma-2" color="red" text-color="white">
                  <v-avatar left class="red darken-4">
                    {{ tasksAbandoned }}
                  </v-avatar>
                  Abandonadas
                </v-chip>
              </div>

              <!-- Estadísticas por Etiquetas -->
              <div class="stat-group">
                <h3>Por Etiqueta</h3>
                <v-chip
                  v-for="tag in tagCounts"
                  :key="tag.name"
                  class="ma-2"
                  color="blue"
                  text-color="white"
                >
                  <v-avatar left class="blue darken-4">{{
                    tag.count
                  }}</v-avatar>
                  {{ tag.name }}
                </v-chip>
              </div>

              <!-- Estadísticas por Fecha de Finalización -->
              <div class="stat-group">
                <h3>Por Tiempo de Finalización</h3>
                <v-chip class="ma-2" color="purple" text-color="white">
                  <v-avatar left class="purple darken-4">
                    {{ tasksDueThisWeek }}
                  </v-avatar>
                  Esta Semana
                </v-chip>
                <v-chip class="ma-2" color="indigo" text-color="white">
                  <v-avatar left class="indigo darken-4">
                    {{ tasksDueNextWeek }}
                  </v-avatar>
                  Próxima Semana
                </v-chip>
                <v-chip class="ma-2" color="grey" text-color="white">
                  <v-avatar left class="grey darken-4">
                    {{ tasksOverdue }}
                  </v-avatar>
                  Atrasadas
                </v-chip>
              </div>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'

export default defineComponent({
  name: 'StatisticsView',
  setup() {
    const taskStore = useTaskStore()

    onMounted(() => {
      taskStore.fetchTasks()
    })

    // Computed para estadísticas por estado
    const tasksPending = computed(
      () => taskStore.tasks.filter(task => task.status === 'pending').length,
    )
    const tasksCompleted = computed(
      () => taskStore.tasks.filter(task => task.status === 'completed').length,
    )
    const tasksAbandoned = computed(
      () => taskStore.tasks.filter(task => task.status === 'abandoned').length,
    )

    // Computed para estadísticas por etiquetas
    const tagCounts = computed(() => {
      const tagMap: { [key: string]: number } = {}
      taskStore.tasks.forEach(task => {
        if (task.tags) {
          task.tags.forEach(tag => {
            if (tagMap[tag.name]) {
              tagMap[tag.name]++
            } else {
              tagMap[tag.name] = 1
            }
          })
        }
      })
      return Object.keys(tagMap).map(name => ({
        name,
        count: tagMap[name],
      }))
    })

    // Computed para estadísticas por tiempo de finalización
    const tasksDueThisWeek = computed(() => {
      const now = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(now.getDate() + 7)

      return taskStore.tasks.filter(task => {
        const deadline = new Date(task.deadline)
        return deadline >= now && deadline <= nextWeek
      }).length
    })

    const tasksDueNextWeek = computed(() => {
      const now = new Date()
      const nextWeek = new Date()
      nextWeek.setDate(now.getDate() + 7)
      const twoWeeks = new Date()
      twoWeeks.setDate(now.getDate() + 14)

      return taskStore.tasks.filter(task => {
        const deadline = new Date(task.deadline)
        return deadline > nextWeek && deadline <= twoWeeks
      }).length
    })

    const tasksOverdue = computed(() => {
      const now = new Date()
      return taskStore.tasks.filter(task => {
        const deadline = new Date(task.deadline)
        return deadline < now && task.status !== 'completed'
      }).length
    })

    return {
      tasksPending,
      tasksCompleted,
      tasksAbandoned,
      tagCounts,
      tasksDueThisWeek,
      tasksDueNextWeek,
      tasksOverdue,
    }
  },
})
</script>

<style scoped>
.container-statistics {
  margin-top: 80px;
}
.stat-group {
  margin-bottom: 2rem;
}
</style>
