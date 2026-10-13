export interface Area {
  id: number;
  name: string;
  user_id: number;
}

export interface AreaPayload {
  name: string;
}

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}
