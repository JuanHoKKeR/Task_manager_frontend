// src/main.ts
import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify'
import 'vuetify/styles'
import api from './plugins/axios'
import { useUserStore } from '@/stores/userStore'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(vuetify)

// Obtener el store después de que Pinia esté activo
const userStore = useUserStore()

// Configurar los interceptores de Axios
api.interceptors.request.use(
  config => {
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => Promise.reject(error),
)

// Configurar los guards de navegación
router.beforeEach((to, from, next) => {
  const isAuthenticated = userStore.isAuthenticated

  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (
    (to.name === 'Login' || to.name === 'Register') &&
    isAuthenticated
  ) {
    next('/tasks')
  } else {
    next()
  }
})

// Función asíncrona para inicializar la aplicación
const initializeApp = async () => {
  if (userStore.token) {
    try {
      await userStore.fetchUser()
    } catch (error) {
      console.error('Error al revalidar el token:', error)
      userStore.logout()
      router.push('/login')
    }
  }
  app.mount('#app')
}

// Llamar a la función de inicialización
initializeApp()
