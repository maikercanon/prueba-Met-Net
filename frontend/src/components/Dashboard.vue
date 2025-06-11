<template>
  <div class="content-center min-h-screen bg-violet-400">
    <!-- Navigation Bar -->
    <nav class="w-full bg-violet-500 shadow-sm border-b border-gray-200">
      <div class="w-full max-w-[90rem] mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
          <div class="flex items-center">
            <h1 class="text-xl font-semibold text-white">Task Manager</h1>
          </div>
          
          <div class="flex items-center space-x-4">
            <span class="text-sm text-white">
              Welcome, {{ auth.user.value?.name }}
            </span>
            <button
              @click="handleLogout"
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- Main Content -->
    <main class="w-full max-w-[90rem] py-6 px-4 sm:px-6 lg:px-8">
      <!-- Task Management Section -->
      <div class="bg-violet-200 rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 class="text-lg font-semibold text-gray-900 mb-6">My Tasks</h2>
        
        <!-- Loading State -->
        <div v-if="isLoading" class="text-center py-8">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p class="mt-2 text-gray-600">Loading tasks...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <div class="flex">
            <div class="ml-3">
              <!-- Token Expiration Error -->
              <div v-if="isTokenError" class="text-center">
                <h3 class="text-sm font-medium text-red-800">Session Expired</h3>
                <p class="mt-1 text-sm text-red-700">Your session has expired. Please log in again to continue.</p>
                <button 
                  @click="handleSessionExpired"
                  class="mt-3 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded text-sm font-medium"
                >
                  Go to Login
                </button>
              </div>
              
              <!-- General Error -->
              <div v-else>
                <h3 class="text-sm font-medium text-red-800">Error</h3>
                <p class="mt-1 text-sm text-red-700">{{ error }}</p>
                <button 
                  @click="loadTasks"
                  class="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Task Content -->
        <div v-else>
          <TaskForm @task-created="handleTaskCreated" />
          <TaskList 
            :tasks="tasks" 
            @task-updated="handleTaskUpdated"
            @task-deleted="handleTaskDeleted"
          />
        </div>
      </div>
    </main>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import TaskForm from './TaskForm.vue'
import TaskList from './TaskList.vue'
import taskService from '../services/taskService'
import type { Task } from '../interfaces/Task'

const router = useRouter()
const auth = useAuth()

const tasks = ref<Task[]>([])
const isLoading = ref(false)
const error = ref<string | null>(null)

// Computed property to detect token-related errors
const isTokenError = computed(() => {
  return error.value && (
    error.value.includes('token') || 
    error.value.includes('unauthorized') || 
    error.value.includes('authentication') ||
    error.value.includes('expired') ||
    error.value.includes('Access token required') ||
    auth.error.value?.includes('token') ||
    auth.error.value?.includes('unauthorized') ||
    auth.error.value?.includes('authentication')
  )
})

// Task management functions
const loadTasks = async () => {
  try {
    isLoading.value = true
    error.value = null
    tasks.value = await taskService.getAllTasks()
  } catch (err: any) {
    console.error('Error loading tasks:', err)
    error.value = err.message || 'Failed to load tasks'
  } finally {
    isLoading.value = false
  }
}

const handleTaskCreated = async (newTaskData: Omit<Task, 'id' | 'createdAt'>) => {
  try {
    const createdTask = await taskService.createTask({
      title: newTaskData.title,
      description: newTaskData.description,
      priority: newTaskData.priority
    })
    tasks.value.unshift(createdTask)
  } catch (err: any) {
    console.error('Error creating task:', err)
    error.value = err.message || 'Failed to create task'
  }
}

const handleTaskUpdated = async (updatedTask: Task) => {
  try {
    const updated = await taskService.updateTask(updatedTask.id, {
      title: updatedTask.title,
      description: updatedTask.description,
      priority: updatedTask.priority,
      completed: updatedTask.completed
    })
    
    const index = tasks.value.findIndex(task => task.id === updatedTask.id)
    if (index !== -1) {
      tasks.value[index] = updated
    }
  } catch (err: any) {
    console.error('Error updating task:', err)
    error.value = err.message || 'Failed to update task'
  }
}

const handleTaskDeleted = async (taskId: string) => {
  try {
    await taskService.deleteTask(taskId)
    tasks.value = tasks.value.filter(task => task.id !== taskId)
  } catch (err: any) {
    console.error('Error deleting task:', err)
    error.value = err.message || 'Failed to delete task'
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const handleSessionExpired = () => {
  // Clear any existing errors
  error.value = null
  auth.clearError()
  
  // Logout user (this will clear tokens and redirect)
  auth.logout()
}

// Token validation interval reference
let tokenValidationInterval: number

onMounted(() => {
  // Load tasks from backend
  loadTasks()
  
  // Fetch updated user profile
  auth.fetchProfile()
  
  // Set up periodic token validation (every 5 minutes)
  tokenValidationInterval = setInterval(() => {
    if (auth.isAuthenticated.value && auth.isTokenExpired()) {
      console.log('Token expired during session, logging out...')
      clearInterval(tokenValidationInterval)
      handleSessionExpired()
    }
  }, 5 * 60 * 1000) // 5 minutes
})

// Clean up interval on component unmount
onUnmounted(() => {
  if (tokenValidationInterval) {
    clearInterval(tokenValidationInterval)
  }
})
</script> 