<template>
  <!-- Modal overlay with fade animation -->
  <transition name="modal" appear>
    <div v-if="isOpen" class="fixed inset-0 z-50 overflow-y-auto" @click.self="closeModal">
      <!-- Responsive modal container -->
      <div class="flex items-end sm:items-center justify-center min-h-screen px-4 pt-4 pb-4 sm:pb-20 text-center sm:block sm:p-0">
        <!-- Background overlay -->
        <transition name="fade" appear>
          <div 
            v-if="isOpen"
            class="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" 
            @click="closeModal"
          ></div>
        </transition>
        
        <!-- Modal panel - Responsive sizing -->
        <transition name="scale" appear>
          <div 
            v-if="isOpen"
            class="inline-block w-full max-w-sm sm:max-w-md lg:max-w-lg p-4 sm:p-6 lg:p-8 my-4 sm:my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-t-3xl sm:rounded-2xl"
          >
            <!-- Modal header - Responsive -->
            <div class="flex items-center justify-between mb-4 sm:mb-6">
              <h3 class="text-lg sm:text-xl lg:text-2xl font-semibold text-gray-900">
                Edit Task
              </h3>
              <button
                @click="closeModal"
                class="text-gray-400 hover:text-gray-600 transition-colors duration-200 p-1 sm:p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                <svg class="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <!-- Form - Responsive spacing -->
            <form @submit.prevent="saveTask" class="space-y-3 sm:space-y-4 lg:space-y-5">
              <!-- Title field -->
              <div>
                <label for="edit-title" class="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  id="edit-title"
                  ref="titleInput"
                  type="text"
                  v-model="editForm.title"
                  required
                  class="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                  placeholder="Enter task title"
                />
              </div>

              <!-- Description field -->
              <div>
                <label for="edit-description" class="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  id="edit-description"
                  v-model="editForm.description"
                  :rows="isMobile ? 2 : 3"
                  class="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical transition-colors text-sm sm:text-base"
                  placeholder="Enter task description"
                ></textarea>
              </div>

              <!-- Priority field -->
              <div>
                <label for="edit-priority" class="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  id="edit-priority"
                  v-model="editForm.priority"
                  class="w-full px-3 py-2 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors text-sm sm:text-base"
                >
                  <option value="low">🟢 Low</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="high">🔴 High</option>
                </select>
              </div>

              <!-- Completed status -->
              <div class="flex items-center p-3 sm:p-4 bg-gray-50 rounded-lg">
                <input
                  id="edit-completed"
                  type="checkbox"
                  v-model="editForm.completed"
                  class="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label for="edit-completed" class="ml-3 text-sm font-medium text-gray-700">
                  <span class="flex items-center">
                    <span class="mr-2 text-base">✓</span>
                    Mark as completed
                  </span>
                </label>
              </div>

              <!-- Form buttons - Responsive layout -->
              <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-4 sm:pt-6">
                <button
                  type="button"
                  @click="closeModal"
                  class="w-full sm:w-auto px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  :disabled="!editForm.title.trim()"
                  class="w-full sm:w-auto px-4 py-2 sm:py-3 text-sm sm:text-base font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </transition>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, nextTick, computed, onMounted, onUnmounted } from 'vue'
import type { Task } from '../interfaces/Task'

const props = defineProps<{
  isOpen: boolean
  task: Task | null
}>()

const emit = defineEmits<{
  close: []
  save: [task: Task]
}>()

const titleInput = ref<HTMLInputElement>()
const windowWidth = ref(window.innerWidth)

const editForm = ref({
  title: '',
  description: '',
  priority: 'medium' as 'low' | 'medium' | 'high',
  completed: false
})

// Check if mobile device
const isMobile = computed(() => windowWidth.value < 640)

// Handle window resize
const handleResize = () => {
  windowWidth.value = window.innerWidth
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

// Watch for task changes to populate form
watch(() => props.task, (newTask) => {
  if (newTask) {
    editForm.value = {
      title: newTask.title || '',
      description: newTask.description || '',
      priority: newTask.priority || 'medium',
      completed: newTask.completed || false
    }
  }
}, { immediate: true })

// Focus on title input when modal opens
watch(() => props.isOpen, (isOpen) => {
  if (isOpen) {
    nextTick(() => {
      titleInput.value?.focus()
    })
    document.addEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'hidden'
  } else {
    document.removeEventListener('keydown', handleKeydown)
    document.body.style.overflow = 'auto'
  }
})

const closeModal = () => {
  emit('close')
}

const saveTask = () => {
  if (!props.task || !editForm.value.title.trim()) {
    return
  }

  const updatedTask: Task = {
    ...props.task,
    title: editForm.value.title.trim(),
    description: editForm.value.description.trim(),
    priority: editForm.value.priority,
    completed: editForm.value.completed,
    updatedAt: new Date()
  }

  emit('save', updatedTask)
  closeModal()
}

// Close modal on Escape key
const handleKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && props.isOpen) {
    closeModal()
  }
}
</script>

<style scoped>
/* Modal animations */
.modal-enter-active, .modal-leave-active {
  transition: opacity 0.3s ease;
}

.modal-enter-from, .modal-leave-to {
  opacity: 0;
}

/* Fade animation for overlay */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Scale animation for modal content - Responsive */
.scale-enter-active, .scale-leave-active {
  transition: all 0.3s ease;
}

.scale-enter-from, .scale-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

/* Mobile-specific modal positioning */
@media (max-width: 640px) {
  .scale-enter-from, .scale-leave-to {
    transform: scale(0.95) translateY(100px);
  }
}
</style> 