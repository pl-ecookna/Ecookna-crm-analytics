import type {
  AuthLoginRequest,
  AuthLoginResponse,
  AuthMeResponse,
  AuthUser,
  AuthUsersResponse,
  CallsQueryParams,
  CreateAuthUserRequest,
  CreateAuthUserResponse,
  CrmDeleteCallResult,
  CrmCallDetails,
  CrmCallListItem,
  CrmMetricsResponse,
  PaginatedResponse,
  PromptDto,
  UpdateAuthUserRequest,
} from "@ecookna/shared-types";

class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

const buildQuery = (params: Record<string, unknown> = {}) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};

const normalizeBaseUrl = (baseUrl = "") => baseUrl.replace(/\/+$/, "");

const buildApiUrl = (baseUrl: string, path: string) => {
  const normalizedBase = normalizeBaseUrl(baseUrl);

  if (!normalizedBase) {
    return `/api${path}`;
  }

  if (normalizedBase.endsWith("/api")) {
    return `${normalizedBase}${path}`;
  }

  return `${normalizedBase}/api${path}`;
};

const isJsonResponse = (response: Response) =>
  response.headers.get("content-type")?.includes("application/json");

const parseResponse = async <T>(response: Response): Promise<T> => {
  if (response.status === 204) {
    return undefined as T;
  }

  if (isJsonResponse(response)) {
    return (await response.json()) as T;
  }

  return (await response.text()) as T;
};

const createRequest = (baseUrl: string) => async <T>(
  path: string,
  init: RequestInit = {},
) => {
  const headers = new Headers(init.headers || {});
  const isFormData = typeof FormData !== "undefined" && init.body instanceof FormData;

  if (init.body && !isFormData && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(buildApiUrl(baseUrl, path), {
    credentials: "include",
    ...init,
    headers,
  });

  const data = await parseResponse<any>(response).catch(() => null);

  if (!response.ok) {
    throw new ApiError(
      data?.error || `Request failed with status ${response.status}`,
      response.status,
      data,
    );
  }

  return data as T;
};

export const createApiClient = (baseUrl = "") => {
  const request = createRequest(baseUrl);

  return {
    login: async (payload: AuthLoginRequest) =>
      request<AuthLoginResponse>("/auth/login", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    logout: async () =>
      request<{ ok: true }>("/auth/logout", {
        method: "POST",
      }),
    me: async () => request<AuthMeResponse>("/auth/me"),
    getUsers: async () => request<AuthUsersResponse>("/auth/users"),
    createUser: async (payload: CreateAuthUserRequest) =>
      request<CreateAuthUserResponse>("/auth/users", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    updateUser: async (id: string, payload: UpdateAuthUserRequest) =>
      request<AuthUser>(`/auth/users/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deleteUser: async (id: string) =>
      request<{ deleted: true; id: string }>(`/auth/users/${id}`, {
        method: "DELETE",
      }),
    getCalls: async (params: CallsQueryParams = {}) =>
      request<PaginatedResponse<CrmCallListItem>>(`/crm/calls${buildQuery(params)}`),
    getCallById: async (id: string | number) =>
      request<CrmCallDetails>(`/crm/calls/${id}`),
    deleteCallById: async (id: string | number) =>
      request<CrmDeleteCallResult>(`/crm/calls/${id}`, {
        method: "DELETE",
      }),
    deleteLatestCrmCalls: async (limit = 7) =>
      request<{ deletedCount: number; deletedIds: number[] }>(
        `/crm/calls/latest${buildQuery({ limit })}`,
        {
          method: "DELETE",
        },
      ),
    getMetrics: async () => request<CrmMetricsResponse>("/crm/metrics"),
    getPrompts: async () => request<PromptDto[]>("/prompts"),
    updatePrompt: async (id: number, payload: Partial<PromptDto>) =>
      request<PromptDto>(`/prompts/${id}`, {
        method: "PATCH",
        body: JSON.stringify(payload),
      }),
    deletePrompt: async (id: number) =>
      request<{ ok: true }>(`/prompts/${id}`, {
        method: "DELETE",
      }),
  };
};

export { ApiError };
