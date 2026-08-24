import api from './api';
import type { Category, CategoryPayload } from '../types';

export const getCategories = async (): Promise<Category[]> => {
  const response = await api.get<Category[]>('/Categories');
  return response.data;
};

export const createCategory = async (payload: CategoryPayload): Promise<Category> => {
  const response = await api.post<Category>('/Categories', payload);
  return response.data;
};

export const updateCategory = async (id: number, payload: CategoryPayload): Promise<void> => {
  await api.put(`/Categories/${id}`, payload);
};

export const deleteCategory = async (id: number): Promise<void> => {
  await api.delete(`/Categories/${id}`);
};