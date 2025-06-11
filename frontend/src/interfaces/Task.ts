export interface Task {
  id: string
  _id?: string // MongoDB ObjectId
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  completed: boolean
  createdAt: Date | string
  updatedAt?: Date | string
}

export interface CreateTaskDto {
  title: string
  description: string
  priority: 'low' | 'medium' | 'high'
  completed?: boolean
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  priority?: 'low' | 'medium' | 'high'
  completed?: boolean
} 