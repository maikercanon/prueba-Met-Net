<template>
  <div 
    class="flex flex-col sm:flex-row sm:justify-between sm:items-start p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
    :class="{ 'opacity-70 bg-gray-50': task?.completed }"
  >
    <!-- Main content area -->
    <div class="flex-1 mb-3 sm:mb-0 sm:mr-4">
      <!-- Header with title and priority -->
      <div class="flex flex-col xs:flex-row xs:justify-between xs:items-start gap-2 mb-2">
        <h3 
          class="text-lg font-semibold text-gray-800 break-words"
          :class="{ 'line-through text-gray-500': task?.completed }"
        >
          {{ task?.title || 'Untitled Task' }}
        </h3>
        <span 
          class="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap self-start xs:self-auto"
          :class="priorityClasses[task?.priority || 'medium']"
        >
          {{ (task?.priority || 'medium').toUpperCase() }}
        </span>
      </div>
      
      <!-- Description -->
      <p 
        v-if="task?.description" 
        class="text-gray-600 leading-relaxed mb-2 break-words"
      >
        {{ task.description }}
      </p>
      
      <!-- Metadata -->
      <div class="text-xs text-gray-400 space-y-1 sm:space-y-0 sm:space-x-4 sm:flex sm:items-center">
        <span class="block sm:inline">
          Created: {{ formatDate(task?.createdAt) }}
        </span>
        <span v-if="task?.updatedAt" class="block sm:inline">
          • Updated: {{ formatDate(task.updatedAt) }}
        </span>
      </div>
    </div>
    
    <!-- Action buttons -->
    <div class="flex justify-end sm:justify-start gap-2 sm:flex-col lg:flex-row">
      <!-- Toggle completion button -->
      <button
        @click="toggleCompleted"
        class="w-8 h-8 rounded-md border-2 flex items-center justify-center transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="task?.completed 
          ? 'bg-green-500 border-green-500 text-white focus:ring-green-500' 
          : 'bg-gray-100 border-gray-300 text-gray-500 hover:border-green-400 focus:ring-green-400'"
        :title="task?.completed ? 'Mark as pending' : 'Mark as completed'"
      >
        <span class="text-sm">
          {{ task?.completed ? '✓' : '○' }}
        </span>
      </button>
      
      <!-- Edit button -->
      <button
        @click="openEditModal"
        :disabled="task?.completed"
        class="w-8 h-8 rounded-md flex items-center justify-center text-sm transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
        :class="task?.completed 
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
          : 'bg-blue-500 text-white hover:bg-blue-600 focus:ring-blue-500'"
        title="Edit task"
      >
        <span class="font-medium">✎</span>
      </button>
      
      <!-- Delete button -->
      <button
        @click="deleteTask"
        class="w-8 h-8 bg-red-500 text-white rounded-md flex items-center justify-center text-sm hover:bg-red-600 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        title="Delete task"
      >
        <span class="font-medium">✕</span>
      </button>
    </div>
  </div>

  <!-- Edit Modal -->
  <TaskEditModal
    :is-open="isEditModalOpen"
    :task="task"
    @close="closeEditModal"
    @save="handleTaskSave"
  />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskEditModal from './TaskEditModal.vue'
import type { Task } from '../interfaces/Task'

const props = defineProps<{
  task: Task
}>()

const emit = defineEmits<{
  taskUpdated: [task: Task]
  taskDeleted: [taskId: string]
}>()

const isEditModalOpen = ref(false)

const priorityClasses = computed(() => ({
  low: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-red-100 text-red-800'
}))

const toggleCompleted = () => {
  if (!props.task) return
  
  const updatedTask = {
    ...props.task,
    completed: !props.task.completed,
    updatedAt: new Date()
  }
  emit('taskUpdated', updatedTask)
}

const openEditModal = () => {
  if (!props.task?.completed) {
    isEditModalOpen.value = true
  }
}

const closeEditModal = () => {
  isEditModalOpen.value = false
}

const handleTaskSave = (updatedTask: Task) => {
  emit('taskUpdated', updatedTask)
}

const deleteTask = () => {
  if (!props.task) return
  
  if (confirm('Are you sure you want to delete this task?')) {
    emit('taskDeleted', props.task.id)
  }
}

const formatDate = (date: Date | string | undefined) => {
  if (!date) return 'No date'
  return new Date(date).toLocaleDateString()
}
</script> 