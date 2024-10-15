// src/stores/userStore.ts
import { defineStore } from 'pinia'
import axios from '@/plugins/axios'
import type { User } from '@/types'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    user: null as User | null,
  }),
  getters: {
    isAuthenticated: state => !!state.token,
  },
  actions: {
    /**
     * Inicia sesión el usuario.
     * @param username - Nombre de usuario.
     * @param password - Contraseña del usuario.
     */
    async login(username: string, password: string) {
      try {
        const response = await axios.post('/token/', { username, password })
        this.token = response.data.access
        this.refreshToken = response.data.refresh
        localStorage.setItem('token', this.token)
        localStorage.setItem('refreshToken', this.refreshToken)
        await this.fetchUser()
      } catch (error) {
        console.error('Error al iniciar sesión.', error)
        throw error
      }
    },

    /**
     * Registra un nuevo usuario y lo inicia sesión automáticamente.
     * @param username - Nombre de usuario.
     * @param password - Contraseña del usuario.
     * @param email - Correo electrónico del usuario.
     */
    async register(username: string, password: string, email: string) {
      try {
        await axios.post('/users/', { username, password, email })
        // Iniciar sesión automáticamente después del registro
        await this.login(username, password)
      } catch (error) {
        console.error('Error al registrarse.', error)
        throw error
      }
    },

    /**
     * Obtiene la información del usuario actual.
     */
    async fetchUser() {
      if (!this.token) {
        this.user = null
        return
      }
      try {
        const response = await axios.get('/current_user/')
        this.user = response.data
      } catch (error) {
        console.error('Error al obtener la información del usuario.', error)
        // Si el token es inválido, intentar renovar el token
        await this.refreshTokenAction()
      }
    },

    /**
     * Renueva el token de acceso usando el token de refresco.
     */
    async refreshTokenAction() {
      try {
        const response = await axios.post('/token/refresh/', {
          refresh: this.refreshToken,
        })
        this.token = response.data.access
        localStorage.setItem('token', this.token)
        // Reintentar obtener la información del usuario
        await this.fetchUser()
      } catch (error) {
        console.error('Error al renovar el token.', error)
        this.logout()
      }
    },

    /**
     * Cierra la sesión del usuario.
     */
    logout() {
      this.token = ''
      this.refreshToken = ''
      this.user = null
      localStorage.removeItem('token')
      localStorage.removeItem('refreshToken')
    },
  },
})
