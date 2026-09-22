import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Service, ServiceCategory } from '@/types/service'

export function useServices(categoryId?: string) {
  return useQuery({
    queryKey: ['services', { categoryId: categoryId ?? null }],
    queryFn: () => apiClient.get<Service[]>(`/services${categoryId ? `?categoryId=${categoryId}` : ''}`),
    staleTime: 5 * 60 * 1000,
  })
}

export function useService(id: string | undefined) {
  return useQuery({
    queryKey: ['services', id],
    queryFn: () => apiClient.get<Service>(`/services/${id}`),
    enabled: Boolean(id),
  })
}

export function useServiceCategories() {
  return useQuery({
    queryKey: ['service-categories'],
    queryFn: () => apiClient.get<ServiceCategory[]>('/service-categories'),
    staleTime: 5 * 60 * 1000,
  })
}
