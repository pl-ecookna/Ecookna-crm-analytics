import type {
  CallsQueryParams,
  CrmDeleteCallResult,
  CrmCallDetails,
  CrmCallListItem,
  CrmMetricsResponse,
  PaginatedResponse,
  PromptDto,
} from "@ecookna/shared-types";

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

export const createApiClient = (baseUrl = "") => ({
  getCalls: async (params: CallsQueryParams = {}) => {
    const response = await fetch(buildApiUrl(baseUrl, `/crm/calls${buildQuery(params)}`));
    return (await response.json()) as PaginatedResponse<CrmCallListItem>;
  },
  getCallById: async (id: string | number) => {
    const response = await fetch(buildApiUrl(baseUrl, `/crm/calls/${id}`));
    return (await response.json()) as CrmCallDetails;
  },
  deleteCallById: async (id: string | number) => {
    const response = await fetch(buildApiUrl(baseUrl, `/crm/calls/${id}`), {
      method: "DELETE",
    });

    if (response.status === 404) {
      return { deleted: false, notFound: true, id: Number(id) } as CrmDeleteCallResult;
    }

    if (!response.ok) {
      throw new Error(`Failed to delete call (HTTP ${response.status})`);
    }

    return (await response.json()) as CrmDeleteCallResult;
  },
  deleteLatestCrmCalls: async (limit = 7) => {
    const response = await fetch(buildApiUrl(baseUrl, `/crm/calls/latest${buildQuery({ limit })}`), {
      method: "DELETE",
    });
    return (await response.json()) as { deletedCount: number; deletedIds: number[] };
  },
  getMetrics: async () => {
    const response = await fetch(buildApiUrl(baseUrl, "/crm/metrics"));
    return (await response.json()) as CrmMetricsResponse;
  },
  getPrompts: async () => {
    const response = await fetch(buildApiUrl(baseUrl, "/prompts"));
    return (await response.json()) as PromptDto[];
  },
  updatePrompt: async (id: number, payload: Partial<PromptDto>) => {
    const response = await fetch(buildApiUrl(baseUrl, `/prompts/${id}`), {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await response.json()) as PromptDto;
  },
  deletePrompt: async (id: number) => {
    const response = await fetch(buildApiUrl(baseUrl, `/prompts/${id}`), {
      method: "DELETE",
    });
    return response.ok;
  },
});
