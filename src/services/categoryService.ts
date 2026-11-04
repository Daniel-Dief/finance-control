import type { Category, CategoryPayload, PaginatedResult } from '@/types/category';

import { apiClient } from '@/services/apiClient';

export interface CategoryListParams {
  name?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 50;

function emptyPage(params: CategoryListParams): PaginatedResult<Category> {
  return {
    data: [],
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIMIT,
    total: 0,
    total_pages: 0
  };
}

export const categoryService = {
  async list(params: CategoryListParams = {}): Promise<PaginatedResult<Category>> {
    const { data } = await apiClient.get<PaginatedResult<Category> | null>('/categories/list', {
      params
    });

    // A API responde 204 (corpo vazio) quando não há categorias cadastradas.
    if (!data || !Array.isArray(data.data)) {
      return emptyPage(params);
    }

    return data;
  },
  async getById(id: number): Promise<Category> {
    const { data } = await apiClient.get<Category>(`/categories/${id}`);

    return data;
  },
  async create(payload: CategoryPayload): Promise<Category> {
    const { data } = await apiClient.post<Category>('/categories/create', payload);

    return data;
  },
  async update(id: number, payload: CategoryPayload): Promise<Category> {
    const { data } = await apiClient.put<Category>(`/categories/${id}`, payload);

    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/categories/${id}`);
  }
};
