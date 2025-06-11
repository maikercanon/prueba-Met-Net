<template>
  <div class="app-container">
    <router-view />
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { createAuthProvider } from './composables/useAuth'

// Initialize auth provider at app level
const auth = createAuthProvider()

// Initialize auth when app mounts
onMounted(() => {
  auth.initializeAuth()
})
</script>
