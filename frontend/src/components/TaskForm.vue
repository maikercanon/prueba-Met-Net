<template >
  <div class="bg-violet-100 border border-gray-200 rounded-xl shadow-lg p-6 mx-auto w-full max-w-4xl">
    <h2 class="text-2xl font-bold text-gray-800 mb-6 text-center">Add New Task</h2>
    <form @submit.prevent="submitTask" class="space-y-4">
      <div>
        <label for="title" class="block text-sm font-medium text-gray-700 mb-2">
          Title:
        </label>
        <input
          type="text"
          id="title"
          v-model="task.title"
          required
          placeholder="Enter task title"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        />
      </div>
      <div>
        <label for="description" class="block text-sm font-medium text-gray-700 mb-2">
          Description:
        </label>
        <textarea
          id="description"
          v-model="task.description"
          placeholder="Enter task description"
          :rows="4"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors"
        ></textarea>
      </div>
      <div>
        <label for="priority" class="block text-sm font-medium text-gray-700 mb-2">
          Priority:
        </label>
        <select 
          id="priority" 
          v-model="task.priority"
          class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
        >
          <option value="low">🟢 Low</option>
          <option value="medium">🟡 Medium</option>
          <option value="high">🔴 High</option>
        </select>
      </div>
      <button 
        type="submit" 
        class="w-full bg-green-500 hover:bg-green-600 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 mt-6 flex items-center justify-center gap-2 shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
        </svg>
        Add Task
      </button>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { Task } from '../interfaces/Task'

const emit = defineEmits<{
  taskCreated: [task: Omit<Task, 'id' | 'createdAt'>]
}>()

const task = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  completed: false
})

const submitTask = () => {
  if (task.value.title.trim()) {
    emit('taskCreated', { ...task.value })
    task.value = {
      title: '',
      description: '',
      priority: 'medium',
      completed: false
    }
  }
}
</script>
