import type {
  CallsQueryParams,
  CrmCallDetails,
  CrmCallListItem,
  CrmMetricsResponse,
  PaginatedResponse,
  PromptDto,
} from "@ecookna/shared-types";

const buildQuery = (params: CallsQueryParams = {}) => {
  const search = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  }

  const query = search.toString();
  return query ? `?${query}` : "";
};

export const createApiClient = (baseUrl = "") => ({
  getCalls: async (params: CallsQueryParams = {}) => {
    const response = await fetch(`${baseUrl}/api/crm/calls${buildQuery(params)}`);
    return (await response.json()) as PaginatedResponse<CrmCallListItem>;
  },
  getCallById: async (id: string | number) => {
    const response = await fetch(`${baseUrl}/api/crm/calls/${id}`);
    return (await response.json()) as CrmCallDetails;
  },
  getMetrics: async () => {
    const response = await fetch(`${baseUrl}/api/crm/metrics`);
    return (await response.json()) as CrmMetricsResponse;
  },
  getPrompts: async () => {
    const response = await fetch(`${baseUrl}/api/prompts`);
    return (await response.json()) as PromptDto[];
  },
  updatePrompt: async (id: number, payload: Partial<PromptDto>) => {
    const response = await fetch(`${baseUrl}/api/prompts/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return (await response.json()) as PromptDto;
  },
  deletePrompt: async (id: number) => {
    const response = await fetch(`${baseUrl}/api/prompts/${id}`, {
      method: "DELETE",
    });
    return response.ok;
  },
});
