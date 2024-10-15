<!-- src/components/SnackbarTask.vue -->

<template>
  <v-snackbar v-model="show" :color="color" timeout="3000" top right>
    {{ message }}
    <v-btn text @click="show = false">
      <v-icon>mdi-close</v-icon>
    </v-btn>
  </v-snackbar>
</template>

<script lang="ts">
import { defineComponent, watch, ref } from 'vue'
import type { PropType } from 'vue'

export default defineComponent({
  name: 'SnackbarTask',
  props: {
    notify: {
      type: String as PropType<'delete' | 'update' | 'add' | null>,
      default: null,
    },
  },
  setup(props) {
    const show = ref(false)
    const message = ref('')
    const color = ref('')

    watch(
      () => props.notify,
      newVal => {
        if (newVal) {
          show.value = true
          switch (newVal) {
            case 'add':
              message.value = 'Tarea agregada exitosamente.'
              color.value = 'success'
              break
            case 'update':
              message.value = 'Tarea actualizada exitosamente.'
              color.value = 'info'
              break
            case 'delete':
              message.value = 'Tarea eliminada exitosamente.'
              color.value = 'error'
              break
            default:
              message.value = ''
              color.value = ''
          }
        }
      },
    )

    return {
      show,
      message,
      color,
    }
  },
})
</script>

<style scoped></style>
