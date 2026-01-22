import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Visit } from "@medherb/shared";
import { apiClient } from "../lib/apiClient.ts";

export interface UseVisitsParams {
  from?: string;
  to?: string;
  keyword?: string;
  patientId?: string;
}

async function fetchVisits(params: UseVisitsParams): Promise<Visit[]> {
  const response = await apiClient.get("/visits", { params });
  const data = response.data as any;

  // 兼容两种后端返回：
  // 1）直接返回数组：[visit, ...]
  // 2）分页对象：{ items, total, page, pageSize }
  if (Array.isArray(data)) {
    return data as Visit[];
  }
  if (data && Array.isArray(data.items)) {
    return data.items as Visit[];
  }

  return [];
}

export function useVisits(params: UseVisitsParams, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["visits", params],
    queryFn: () => fetchVisits(params),
    staleTime: 60_000,
    enabled: options?.enabled ?? true
  });
}

export interface VisitFormValues {
  patientId: string;
  visitDate: string;
  mainComplaint?: string;
  prescription?: string;
  diagnosisTcm?: string;
  diagnosisWestern?: string;
  treatmentPrinciple?: string;
  notes?: string;
}

export function useCreateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: VisitFormValues) => {
      const response = await apiClient.post<Visit>("/visits", data);
      return response.data;
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      if (created.patientId) {
        queryClient.invalidateQueries({ queryKey: ["patient", created.patientId] });
      }
    }
  });
}

export function useUpdateVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (params: { id: string; data: Partial<VisitFormValues> }) => {
      const response = await apiClient.put<Visit>(`/visits/${params.id}`, params.data);
      return response.data;
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      if (updated.patientId) {
        queryClient.invalidateQueries({ queryKey: ["patient", updated.patientId] });
      }
    }
  });
}

export function useDeleteVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/visits/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["visits"] });
      queryClient.invalidateQueries({ queryKey: ["patient"] });
    }
  });
}

