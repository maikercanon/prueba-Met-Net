<template>
  <div>
    <!-- Header with task count -->
    <div class="px-6 py-6 border-b border-gray-200">
      <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <h2 class="text-2xl font-bold text-gray-800">Task List</h2>
        <div class="flex items-center text-sm text-gray-600">
          <span class="bg-blue-100 text-blue-800 px-3 py-1 rounded-full font-medium">
            {{ tasks.length }} {{ tasks.length === 1 ? 'task' : 'tasks' }}
          </span>
          <span v-if="completedCount > 0" class="ml-2 text-gray-500">
            ({{ completedCount }} completed)
          </span>
        </div>
      </div>
    </div>

    <!-- Task list content -->
    <div class="px-6 py-6">
      <!-- Empty state -->
      <div v-if="tasks.length === 0" class="text-center py-16">
        <div class="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg class="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
          </svg>
        </div>
        <h3 class="text-xl font-medium text-gray-900 mb-2">No tasks yet</h3>
        <p class="text-gray-500 max-w-md mx-auto">
          Get started by creating your first task using the form on the left.
        </p>
      </div>

      <!-- Task items -->
      <div v-else class="space-y-4">
        <!-- Filter/Sort controls for larger screens -->
        <div class="hidden sm:flex items-center justify-between mb-6">
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Filter:</span>
            <select 
              v-model="filter" 
              class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm font-medium text-gray-700">Sort:</span>
            <select 
              v-model="sortBy" 
              class="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        <!-- Mobile filter controls -->
        <div class="sm:hidden mb-4">
          <div class="grid grid-cols-2 gap-2">
            <select 
              v-model="filter" 
              class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Tasks</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
            <select 
              v-model="sortBy" 
              class="text-sm border border-gray-300 rounded-md px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
            </select>
          </div>
        </div>

        <!-- Filtered and sorted task items -->
        <TransitionGroup name="task-list" tag="div" class="space-y-4">
          <TaskItem
            v-for="task in filteredAndSortedTasks"
            :key="task.id"
            :task="task"
            @task-updated="updateTask"
            @task-deleted="deleteTask"
          />
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import TaskItem from './TaskItem.vue'
import type { Task } from '../interfaces/Task'

const props = defineProps<{
  tasks: Task[]
}>()

const emit = defineEmits<{
  taskUpdated: [task: Task]
  taskDeleted: [taskId: string]
}>()

const filter = ref<'all' | 'pending' | 'completed'>('all')
const sortBy = ref<'newest' | 'oldest' | 'priority'>('newest')

const completedCount = computed(() => {
  return props.tasks.filter(task => task.completed).length
})

const filteredAndSortedTasks = computed(() => {
  let filtered = props.tasks

  // Apply filter
  if (filter.value === 'pending') {
    filtered = filtered.filter(task => !task.completed)
  } else if (filter.value === 'completed') {
    filtered = filtered.filter(task => task.completed)
  }

  // Apply sort
  return filtered.sort((a, b) => {
    if (sortBy.value === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    } else if (sortBy.value === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    } else if (sortBy.value === 'priority') {
      const priorityOrder = { high: 3, medium: 2, low: 1 }
      return priorityOrder[b.priority] - priorityOrder[a.priority]
    }
    return 0
  })
})

const updateTask = (task: Task) => {
  emit('taskUpdated', task)
}

const deleteTask = (taskId: string) => {
  emit('taskDeleted', taskId)
}
</script>

<style scoped>
/* Task list animations */
.task-list-enter-active,
.task-list-leave-active {
  transition: all 0.3s ease;
}

.task-list-enter-from,
.task-list-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}

.task-list-move {
  transition: transform 0.3s ease;
}
</style> 