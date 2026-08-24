import api from './api';
import type { Task, TaskCreatePayload, TaskUpdatePayload } from '../types';

export const getTasks = async (): Promise<Task[]> => {
  const response = await api.get<Task[]>('/Tasks');
  return response.data;
};

export const getTask = async (id: number): Promise<Task> => {
  const response = await api.get<Task>(`/Tasks/${id}`);
  return response.data;
};

export const createTask = async (payload: TaskCreatePayload): Promise<Task> => {
  const response = await api.post<Task>('/Tasks', payload);
  return response.data;
};

export const updateTask = async (id: number, payload: TaskUpdatePayload): Promise<void> => {
  await api.put(`/Tasks/${id}`, payload);
};

export const deleteTask = async (id: number): Promise<void> => {
  await api.delete(`/Tasks/${id}`);
};