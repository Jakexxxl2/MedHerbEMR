import { useQuery } from "@tanstack/react-query";
import type { Patient } from "@medherb/shared";
import { apiClient } from "../lib/apiClient.ts";

async function fetchPatient(id: string): Promise<Patient> {
  const response = await apiClient.get<Patient>(`/patients/${id}`);
  return response.data;
}

export function usePatient(id: string | null) {
  return useQuery({
    queryKey: ["patient", id],
    queryFn: () => fetchPatient(id as string),
    enabled: !!id
  });
}


