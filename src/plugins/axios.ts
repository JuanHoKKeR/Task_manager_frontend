// src/plugins/axios.ts
import axios from 'axios'
import { useUserStore } from '@/stores/userStore'

// Crear una instancia de Axios
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000/api',
})

// Interceptor para añadir el token a las cabeceras de cada petición
api.interceptors.request.use(
  config => {
    const userStore = useUserStore()
    if (userStore.token) {
      config.headers.Authorization = `Bearer ${userStore.token}`
    }
    return config
  },
  error => Promise.reject(error),
)

// Variables para manejar la renovación del token
let isRefreshing = false
let failedQueue: Array<{
  resolve: (value?: unknown) => void
  reject: (error: any) => void
}> = []

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error)
    } else {
      prom.resolve(token)
    }
  })
  failedQueue = []
}

api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config
    const userStore = useUserStore()

    if (
      error.response.status === 401 &&
      !originalRequest._retry &&
      userStore.refreshToken
    ) {
      if (isRefreshing) {
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject })
        })
          .then(token => {
            originalRequest.headers['Authorization'] = 'Bearer ' + token
            return axios(originalRequest)
          })
          .catch(err => {
            return Promise.reject(err)
          })
      }

      originalRequest._retry = true
      isRefreshing = true

      return new Promise(async (resolve, reject) => {
        try {
          const response = await api.post('/token/refresh/', {
            refresh: userStore.refreshToken,
          })
          userStore.token = response.data.access
          localStorage.setItem('token', userStore.token)
          api.defaults.headers.common['Authorization'] =
            `Bearer ${userStore.token}`
          originalRequest.headers['Authorization'] = `Bearer ${userStore.token}`
          processQueue(null, userStore.token)
          resolve(axios(originalRequest))
        } catch (err) {
          processQueue(err, null)
          userStore.logout()
          reject(err)
        } finally {
          isRefreshing = false
        }
      })
    }

    return Promise.reject(error)
  },
)

export default api
