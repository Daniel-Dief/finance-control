import type {
  Transaction,
  TransactionPayload,
  TransactionType,
  TransactionUpdatePayload,
  PaginatedResult
} from '@/types/transaction';

import { apiClient } from '@/services/apiClient';

export interface TransactionListParams {
  type?: TransactionType;
  category_id?: number;
  area_id?: number;
  from?: string;
  to?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 50;

function emptyPage(params: TransactionListParams): PaginatedResult<Transaction> {
  return {
    data: [],
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIMIT,
    total: 0,
    total_pages: 0
  };
}

export const transactionService = {
  async list(params: TransactionListParams = {}): Promise<PaginatedResult<Transaction>> {
    const { data } = await apiClient.get<PaginatedResult<Transaction> | null>(
      '/transactions/list',
      { params }
    );

    // A API responde 204 (corpo vazio) quando não há transações cadastradas.
    if (!data || !Array.isArray(data.data)) {
      return emptyPage(params);
    }

    return data;
  },
  async getById(id: number): Promise<Transaction> {
    const { data } = await apiClient.get<Transaction>(`/transactions/${id}`);

    return data;
  },
  async create(payload: TransactionPayload): Promise<Transaction> {
    const { data } = await apiClient.post<Transaction>('/transactions/create', payload);

    return data;
  },
  async update(id: number, payload: TransactionUpdatePayload): Promise<Transaction> {
    const { data } = await apiClient.put<Transaction>(`/transactions/${id}`, payload);

    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  }
};
