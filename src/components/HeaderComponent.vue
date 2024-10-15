<!-- src/components/HeaderComponent.vue -->
<template>
  <v-app-bar app color="primary" dark>
    <v-toolbar-title class="d-flex justify-start align-center">
      <v-icon left>mdi-star</v-icon>Gestor de Tareas
    </v-toolbar-title>
    <v-spacer></v-spacer>
    <div v-if="isAuthenticated">
      <v-btn variant="text" @click="goToTasks">Tareas</v-btn>
      <v-btn variant="text" @click="goToCreateTask">Crear Tarea</v-btn>
      <v-btn variant="text" @click="goToStatistics">Estadísticas</v-btn>
      <v-menu bottom left>
        <template #activator="{ props }">
          <v-btn variant="text" v-bind="props">
            {{ user?.username }}
            <v-icon right>mdi-menu-down</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="logout">
            <v-list-item-title>Cerrar Sesión</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-menu>
    </div>
    <div v-else>
      <v-btn variant="text" @click="goToLogin">Iniciar Sesión</v-btn>
      <v-btn variant="text" @click="goToRegister">Registrarse</v-btn>
    </div>
  </v-app-bar>
</template>

<script lang="ts">
import { defineComponent, computed, onMounted } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'HeaderComponent',
  setup() {
    const userStore = useUserStore()
    const router = useRouter()

    const isAuthenticated = computed(() => userStore.isAuthenticated)
    const user = computed(() => userStore.user)

    const logout = () => {
      userStore.logout()
      router.push('/login')
    }

    const goToTasks = () => {
      router.push('/tasks')
    }

    const goToCreateTask = () => {
      router.push('/create-task')
    }

    const goToStatistics = () => {
      router.push('/statistics')
    }

    const goToLogin = () => {
      router.push('/login')
    }

    const goToRegister = () => {
      router.push('/register')
    }

    // Para depuración
    onMounted(() => {
      console.log('Is Authenticated:', isAuthenticated.value)
      console.log('User:', user.value)
    })

    return {
      isAuthenticated,
      user,
      logout,
      goToTasks,
      goToCreateTask,
      goToStatistics,
      goToLogin,
      goToRegister,
    }
  },
})
</script>

<style scoped>
.d-flex {
  display: flex;
  align-items: center;
}
.mr-2 {
  margin-right: 0.5rem;
}
</style>
