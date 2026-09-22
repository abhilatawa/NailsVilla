import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import type { GalleryImage } from '@/types/gallery'

export function useGallery(category?: string) {
  return useQuery({
    queryKey: ['gallery', { category: category ?? null }],
    queryFn: () => apiClient.get<GalleryImage[]>(`/gallery${category ? `?category=${category}` : ''}`),
    staleTime: 5 * 60 * 1000,
  })
}
