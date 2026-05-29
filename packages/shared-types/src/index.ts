export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface RuntimeConfigResponse {
  speechProvider: SpeechProvider;
}

export interface CallsQueryParams extends Record<string, unknown> {
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
  provider?: string | null;
  greeting_correct?: boolean | null;
  operator_said_name?: boolean | null;
  cause_identified?: boolean | null;
  cause_clarified?: boolean | null;
  address_clarified?: boolean | null;
  active_listening_done?: boolean | null;
  answer_complete?: boolean | null;
  operator_thanked?: boolean | null;
  client_helped?: boolean | null;
  conflict_resolved?: boolean | null;
  conflict_moments?: string | null;
  conflict_risk_score?: number | null;
  operator_tonality?: string | null;
  final_conclusion?: string | null;
  compliance_score?: number | null;
  burnout_level?: number | null;
  burnout_signs?: string | string[] | null;
  conversation_stage_greeting?: string | null;
  conversation_stage_request?: string | null;
  conversation_stage_solution?: string | null;
  conversation_stage_closing?: string | null;
  conversation_duration_total?: string | null;
  stages_score?: number | null;
  quality_score?: number | null;
  transfer_required?: boolean | null;
  transfer_done?: boolean | null;
  transfer_quality?: number | null;
  transfer_comment?: string | null;
  tag?: string | null;
  transkription?: string | null;
  transkription_full_json?: SpeechAnalysisPayload | null;
  [key: string]: unknown;
}

export type SpeechProvider = 'sber' | 'yandex';

export interface SpeechAnalysisTalkPhrase {
  channelNumber?: number | string;
  channel_number?: number | string;
  startTimeMs?: number | string;
  start_time_ms?: number | string;
  endTimeMs?: number | string;
  end_time_ms?: number | string;
  phrase?: {
    text?: string;
    normalizedText?: string;
    normalized_text?: string;
    words?: Array<Record<string, unknown>>;
  };
}

export interface SpeechAnalysisTalk {
  id?: string;
  transcription?: {
    phrases?: SpeechAnalysisTalkPhrase[];
  };
  talkState?: Record<string, unknown>;
  talk_state?: Record<string, unknown>;
  conversationStatistics?: Record<string, unknown>;
  conversation_statistics?: Record<string, unknown>;
  silenceStatistics?: Record<string, unknown>;
  silence_statistics?: Record<string, unknown>;
  speechStatistics?: Record<string, unknown>;
  speech_statistics?: Record<string, unknown>;
  interruptsStatistics?: Record<string, unknown>;
  interrupts_statistics?: Record<string, unknown>;
  summarization?: Record<string, unknown>;
  textClassifiers?: Record<string, unknown>;
  talk_fields?: Record<string, unknown>;
  [key: string]: unknown;
}

export interface SpeechAnalysisPayload {
  schema_version?: number;
  provider?: SpeechProvider | string;
  provider_result?: {
    talk?: SpeechAnalysisTalk[];
    result?: unknown[];
    insight_result?: {
      csi?: Record<string, unknown> | null;
      call_features?: Record<string, unknown>;
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  insight_result?: {
    csi?: Record<string, unknown> | null;
    call_features?: Record<string, unknown>;
    [key: string]: unknown;
  };
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

export interface AnalyticsCountItem {
  label: string;
  count: number;
}

export interface DisapproveLeadListItem {
  id: number | string;
  call_id: string | null;
  call_datetime: string | null;
  user_name: string | null;
  department: string | null;
  brand: string | null;
  call_type: string | null;
  deal_source: string | null;
  product_type: string | null;
  region: string | null;
  file_status: string | null;
  reject_reasons: Record<string, boolean> | null;
  created_at: string;
}

export interface DisapproveAnalyticsSummary {
  total: number;
  completed: number;
  failed: number;
  processing: number;
  withReasons: number;
  uniqueEmployees: number;
  uniqueDepartments: number;
  uniqueBrands: number;
  reasonEntries: number;
  averageReasonsPerLead: number;
  minCallDatetime: string | null;
  maxCallDatetime: string | null;
}

export interface DisapproveAnalyticsResponse {
  summary: DisapproveAnalyticsSummary;
  topReasons: AnalyticsCountItem[];
  topBrands: AnalyticsCountItem[];
  topDepartments: AnalyticsCountItem[];
  topRegions: AnalyticsCountItem[];
  monthlyTrend: AnalyticsCountItem[];
  recentLeads: DisapproveLeadListItem[];
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

export type UserRole = 'admin' | 'call_center';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthLoginRequest {
  email: string;
  password: string;
}

export interface AuthLoginResponse {
  user: AuthUser;
}

export interface AuthMeResponse {
  user: AuthUser | null;
}

export interface AuthUsersResponse {
  users: AuthUser[];
}

export interface CreateAuthUserRequest {
  email: string;
  name: string;
  role: UserRole;
  is_active?: boolean;
  password?: string;
}

export interface CreateAuthUserResponse {
  user: AuthUser;
  generatedPassword: string | null;
}

export interface UpdateAuthUserRequest {
  email?: string;
  password?: string;
  name?: string;
  role?: UserRole;
  is_active?: boolean;
}
