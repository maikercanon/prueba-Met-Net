import axios from 'axios'
import type { CreateTaskDto, Task, UpdateTaskDto } from '../interfaces/Task'
import { API_CONFIG } from '../config/api'

class TaskService {
  constructor() {
    // Configure axios defaults
    axios.defaults.baseURL = API_CONFIG.baseURL
    axios.defaults.timeout = API_CONFIG.timeout
  }

  private transformTask(task: any): Task {
    return {
      id: task._id || task.id,
      _id: task._id,
      title: task.title,
      description: task.description || '',
      priority: task.priority || 'medium',
      completed: task.completed || false,
      createdAt: task.createdAt ? new Date(task.createdAt) : new Date(),
      updatedAt: task.updatedAt ? new Date(task.updatedAt) : new Date()
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const response = await axios.get('/tasks')
      if (response.data.success) {
        return response.data.data.map((task: any) => this.transformTask(task))
      }
      throw new Error(response.data.message || 'Failed to get tasks')
    } catch (error: any) {
      console.error('Error getting tasks:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to get tasks')
    }
  }

  async getTaskById(id: string): Promise<Task> {
    const tasks = await this.getAllTasks()
    const task = tasks.find(t => t.id === id || t._id === id)
    if (task) {
      return task
    }
    throw new Error('Task not found')
  }

  async createTask(task: CreateTaskDto): Promise<Task> {
    try {
      const response = await axios.post('/tasks', task)
      if (response.data.success) {
        return this.transformTask(response.data.data)
      }
      throw new Error(response.data.message || 'Failed to create task')
    } catch (error: any) {
      console.error('Error creating task:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to create task')
    }
  }

  async updateTask(id: string, task: UpdateTaskDto): Promise<Task> {
    try {
      const response = await axios.put(`/tasks/${id}`, task)
      if (response.data.success) {
        return this.transformTask(response.data.data)
      }
      throw new Error(response.data.message || 'Failed to update task')
    } catch (error: any) {
      console.error('Error updating task:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to update task')
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const response = await axios.delete(`/tasks/${id}`)
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to delete task')
      }
    } catch (error: any) {
      console.error('Error deleting task:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to delete task')
    }
  }

  async toggleTaskCompletion(id: string): Promise<Task> {
    try {
      // Get current task first
      const tasks = await this.getAllTasks()
      const currentTask = tasks.find(task => task.id === id || task._id === id)
      
      if (!currentTask) {
        throw new Error('Task not found')
      }
      
      // Toggle completion status
      return await this.updateTask(id, {
        completed: !currentTask.completed
      })
    } catch (error: any) {
      console.error('Error toggling task completion:', error)
      throw new Error(error.response?.data?.message || error.message || 'Failed to toggle task completion')
    }
  }
}

export const taskService = new TaskService()
export default taskService 