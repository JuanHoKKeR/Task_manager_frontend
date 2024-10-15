<!-- src/App.vue -->
<script lang="ts">
import { defineComponent } from 'vue'
import HeaderComponent from '@/components/HeaderComponent.vue'

export default defineComponent({
  name: 'App',
  components: {
    HeaderComponent,
  },
})
</script>

<template>
  <v-app>
    <HeaderComponent />
    <RouterView />
  </v-app>
</template>

<style scoped></style>
