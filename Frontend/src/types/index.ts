export enum TaskPriority {
    Low = 1,
    Normal = 2,
    High = 3,
    Urgent = 4,
    Critical = 5,
  }
  
  export enum TaskItemStatus {
    Pending = 0,
    InProgress = 1,
    Completed = 2,
    Cancelled = 3,
  }
  
  export interface User {
    userId: number;
    username: string;
    email: string;
  }
  
  export interface AuthResponse {
    token: string;
    userId: number;
    username: string;
    email: string;
  }
  
  export interface RegisterPayload {
    username: string;
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
  }
  
  export interface LoginPayload {
    username: string;
    password: string;
  }
  
  export interface Category {
    id: number;
    name: string;
    description?: string;
    color?: string;
    taskCount: number;
  }
  
  export interface CategoryPayload {
    name: string;
    description?: string;
    color?: string;
  }
  
  export interface Task {
    id: number;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskItemStatus;
    dueDate?: string;
    completedAt?: string;
    categoryId?: number;
    categoryName?: string;
  }
  
  export interface TaskCreatePayload {
    title: string;
    description?: string;
    priority: TaskPriority;
    dueDate?: string;
    categoryId?: number;
  }
  
  export interface TaskUpdatePayload {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskItemStatus;
    dueDate?: string;
    categoryId?: number;
  }