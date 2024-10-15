<!-- src/views/RegisterView.vue -->
<template>
  <v-container class="fill-height" fluid>
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card>
          <v-card-title class="headline">Registrarse</v-card-title>
          <v-card-text>
            <v-form ref="registerForm" @submit.prevent="handleRegister">
              <v-text-field
                label="Usuario"
                v-model="username"
                :rules="[v => !!v || 'Usuario es requerido']"
                required
              ></v-text-field>
              <v-text-field
                label="Correo Electrónico"
                v-model="email"
                type="email"
                :rules="emailRules"
                required
              ></v-text-field>
              <v-text-field
                label="Contraseña"
                v-model="password"
                type="password"
                :rules="[v => !!v || 'Contraseña es requerida']"
                required
              ></v-text-field>
              <v-btn color="primary" type="submit" :loading="loading" block
                >Registrarse</v-btn
              >
            </v-form>
            <v-alert v-if="error" type="error" dismissible class="mt-3">
              {{ error }}
            </v-alert>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <router-link to="/login"
              >¿Ya tienes una cuenta? Inicia sesión</router-link
            >
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { useUserStore } from '@/stores/userStore'
import { useRouter } from 'vue-router'

export default defineComponent({
  name: 'RegisterView',
  setup() {
    const username = ref('')
    const email = ref('')
    const password = ref('')
    const error = ref('')
    const loading = ref(false)
    const userStore = useUserStore()
    const router = useRouter()

    const emailRules = [
      (v: string) => !!v || 'Correo es requerido',
      (v: string) => /.+@.+\..+/.test(v) || 'Correo inválido',
    ]

    const handleRegister = async () => {
      error.value = ''
      loading.value = true
      try {
        await userStore.register(username.value, password.value, email.value)
        router.push('/tasks')
      } catch (err: any) {
        error.value = err.message
      } finally {
        loading.value = false
      }
    }

    return {
      username,
      email,
      password,
      error,
      loading,
      handleRegister,
      emailRules,
    }
  },
})
</script>

<style scoped>
.fill-height {
  height: 100vh;
}
</style>
