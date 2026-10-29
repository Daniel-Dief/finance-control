export type { PaginatedResult } from './pagination';

export interface Area {
  id: number;
  name: string;
  user_id: number;
}

export interface AreaPayload {
  name: string;
}
