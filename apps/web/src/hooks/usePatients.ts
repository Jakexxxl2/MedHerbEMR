import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Patient } from "@medherb/shared";
import { apiClient } from "../lib/apiClient.ts";

export interface UsePatientsParams {
  search?: string;
  phone?: string;
  page?: number;
  pageSize?: number;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  // 当后端返回整数组时，前端会在本地分页，并在此保留完整数据用于统计等场景
  allItems?: T[];
}

async function fetchPatients(params: UsePatientsParams): Promise<PaginatedResult<Patient>> {
  const response = await apiClient.get("/patients", {
    params
  });
  const data = response.data as any;

  // 兼容两种后端返回：
  // 1）直接返回数组： [patient, ...] —— 在前端按 page / pageSize 进行切片
  // 2）返回分页对象： { items, total, page, pageSize }
  if (Array.isArray(data)) {
    const allItems = data as Patient[];
    const total = allItems.length;

    const effectivePage = params.page && params.page > 0 ? params.page : 1;
    const effectivePageSize =
      params.pageSize && params.pageSize > 0 ? params.pageSize : total || 10;

    const start = (effectivePage - 1) * effectivePageSize;
    const end = start + effectivePageSize;
    const pagedItems = allItems.slice(start, end);

    return {
      items: pagedItems,
      total,
      page: effectivePage,
      pageSize: effectivePageSize,
      allItems
    };
  }

  return data as PaginatedResult<Patient>;
}

export function usePatients(params: UsePatientsParams) {
  return useQuery({
    queryKey: ["patients", params],
    queryFn: () => fetchPatients(params),
    staleTime: 60_000
  });
}

export function useCreatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: Omit<Patient, "id">) => {
      const response = await apiClient.post<Patient>("/patients", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
    }
  });
}

export function useUpdatePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (args: { id: string; data: Partial<Omit<Patient, "id">> }) => {
      const response = await apiClient.put<Patient>(`/patients/${args.id}`, args.data);
      return response.data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["patient", variables.id] });
    }
  });
}

export function useDeletePatient() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/patients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["patients"] });
      queryClient.invalidateQueries({ queryKey: ["visits"] });
    }
  });
}


