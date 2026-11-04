import type { Area, AreaPayload, PaginatedResult } from '@/types/area';

import { apiClient } from '@/services/apiClient';

export interface AreaListParams {
  name?: string;
  page?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 50;

function emptyPage(params: AreaListParams): PaginatedResult<Area> {
  return {
    data: [],
    page: params.page ?? 1,
    limit: params.limit ?? DEFAULT_LIMIT,
    total: 0,
    total_pages: 0
  };
}

export const areaService = {
  async list(params: AreaListParams = {}): Promise<PaginatedResult<Area>> {
    const { data } = await apiClient.get<PaginatedResult<Area> | null>('/areas/list', { params });

    // A API responde 204 (corpo vazio) quando não há áreas cadastradas.
    if (!data || !Array.isArray(data.data)) {
      return emptyPage(params);
    }

    return data;
  },
  async getById(id: number): Promise<Area> {
    const { data } = await apiClient.get<Area>(`/areas/${id}`);

    return data;
  },
  async create(payload: AreaPayload): Promise<Area> {
    const { data } = await apiClient.post<Area>('/areas/create', payload);

    return data;
  },
  async update(id: number, payload: AreaPayload): Promise<Area> {
    const { data } = await apiClient.put<Area>(`/areas/${id}`, payload);

    return data;
  },
  async remove(id: number): Promise<void> {
    await apiClient.delete(`/areas/${id}`);
  }
};
