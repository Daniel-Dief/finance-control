import type { Budget, BudgetPayload, BudgetUpdatePayload, PaginatedResult } from '@/types/budget';

import { apiClient } from '@/services/apiClient';

export interface BudgetListParams {
  year?: number;
  month?: number;
  area_id?: number;
  page?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 50;

function emptyPage(params: BudgetListParams): PaginatedResult<Budget> {
  return {
    data: [],
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIMIT,
    total: 0,
    total_pages: 0
  };
}

export const budgetService = {
  async list(params: BudgetListParams = {}): Promise<PaginatedResult<Budget>> {
    const { data } = await apiClient.get<PaginatedResult<Budget> | null>('/budgets/list', {
      params
    });

    // A API responde 204 (corpo vazio) quando não há orçamentos cadastrados.
    if (!data || !Array.isArray(data.data)) {
      return emptyPage(params);
    }

    return data;
  },
  async getById(id: number): Promise<Budget> {
    const { data } = await apiClient.get<Budget>(`/budgets/${id}`);

    return data;
  },
  async create(payload: BudgetPayload): Promise<Budget> {
    const { data } = await apiClient.post<Budget>('/budgets/create', payload);

    return data;
  },
  async update(id: number, payload: BudgetUpdatePayload): Promise<Budget> {
    const { data } = await apiClient.put<Budget>(`/budgets/${id}`, payload);

    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/budgets/${id}`);
  }
};
