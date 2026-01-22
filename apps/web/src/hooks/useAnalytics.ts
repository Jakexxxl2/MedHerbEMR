import { useQuery } from "@tanstack/react-query";
import type { AnalyticsSummary } from "@medherb/shared";
import { apiClient } from "../lib/apiClient.ts";

export interface UseAnalyticsParams {
  year?: number;
  month?: number;
}

async function fetchAnalytics(params: UseAnalyticsParams): Promise<AnalyticsSummary> {
  const response = await apiClient.get<AnalyticsSummary>("/analytics", {
    params
  });
  return response.data;
}

export function useAnalytics(params: UseAnalyticsParams) {
  return useQuery({
    queryKey: ["analytics", params],
    queryFn: () => fetchAnalytics(params),
    staleTime: 60_000
  });
}








