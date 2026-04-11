export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface CallsQueryParams {
  page?: number;
  pageSize?: number;
  employee?: string;
  department?: string;
  brand?: string;
  callSuccess?: string;
}

export interface CrmCallListItem {
  id: number | string;
  call_id: string | null;
  call_datetime: string | null;
  user_name: string | null;
  department: string | null;
  brand: string | null;
  overall_score: number | null;
  call_success: string | null;
  conversation_duration_minutes: number | null;
  call_type: string | null;
  file_status: string | null;
  client_phone: string | null;
}

export interface CrmCallDetails extends CrmCallListItem {
  [key: string]: unknown;
}

export interface CrmMetricsResponse {
  successfulCount: number;
  failedCount: number;
  averageResultCount: number;
  totalScoreSum: number;
  scoredCount: number;
  employees: string[];
  departments: string[];
  brands: string[];
}

export interface CrmDeleteResponse {
  deleted: true;
  id: number;
}

export interface CrmDeleteNotFoundResponse {
  deleted: false;
  notFound: true;
  id: number;
}

export type CrmDeleteCallResult = CrmDeleteResponse | CrmDeleteNotFoundResponse;

export interface PromptDto {
  id: number;
  prompt_key: string;
  prompt_name: string;
  prompt_text: string;
  created_at: string;
}
