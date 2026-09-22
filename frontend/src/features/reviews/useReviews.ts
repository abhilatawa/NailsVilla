import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { Review } from '@/types/review'

export function useReviews() {
  return useQuery({
    queryKey: ['reviews'],
    queryFn: () => apiClient.get<Review[]>('/reviews'),
    staleTime: 5 * 60 * 1000,
  })
}
