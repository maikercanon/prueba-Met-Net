<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Reset your password
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Enter your email address and we'll send you a reset link
        </p>
      </div>
      
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700">Email address</label>
          <input
            id="email"
            v-model="form.email"
            name="email"
            type="email"
            autocomplete="email"
            required
            class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
            placeholder="your@email.com"
          />
          <div v-if="errors.email" class="text-red-500 text-xs mt-1">
            {{ errors.email }}
          </div>
        </div>

        <div v-if="auth.error.value" class="text-red-500 text-sm text-center">
          {{ auth.error.value }}
        </div>

        <div v-if="successMessage" class="text-green-600 text-sm text-center bg-green-50 p-3 rounded-md">
          {{ successMessage }}
          <div v-if="resetToken" class="mt-2 text-xs text-gray-600">
            <strong>Development Token:</strong> {{ resetToken }}
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="auth.isLoading.value"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="auth.isLoading.value" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Sending reset link...
            </span>
            <span v-else>Send Reset Link</span>
          </button>
        </div>

        <div class="text-center">
          <router-link to="/login" class="text-sm text-indigo-600 hover:text-indigo-500">
            Back to sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useAuth } from '../../composables/useAuth'

const auth = useAuth()

const form = reactive({
  email: ''
})

const errors = reactive({
  email: ''
})

const successMessage = ref('')
const resetToken = ref('')

const validateForm = () => {
  errors.email = ''
  
  if (!form.email) {
    errors.email = 'Email is required'
    return false
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = 'Please enter a valid email address'
    return false
  }
  
  return true
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  auth.clearError()
  successMessage.value = ''
  resetToken.value = ''
  
  const result = await auth.forgotPassword(form.email)
  
  if (result.success) {
    successMessage.value = result.message
    if (result.resetToken) {
      resetToken.value = result.resetToken
      console.log('Reset token for development:', result.resetToken)
    }
    form.email = '' // Clear form on success
  }
}
</script> 