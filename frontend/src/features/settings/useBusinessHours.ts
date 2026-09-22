import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/apiClient'
import { formatTime } from '@/lib/time'
import type { BusinessHoursDay } from '@/types/businessHours'

const DAY_NAMES = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

export function useBusinessHours() {
  return useQuery({
    queryKey: ['business-hours'],
    queryFn: () => apiClient.get<BusinessHoursDay[]>('/business-hours'),
    staleTime: 5 * 60 * 1000,
  })
}

export function dayName(dayOfWeek: number): string {
  return DAY_NAMES[dayOfWeek] ?? ''
}

/** Collapses runs of consecutive days with identical hours, e.g. "Monday – Friday 8:00 AM – 7:00 PM". */
export function summarizeHours(days: BusinessHoursDay[]): string[] {
  const sorted = [...days].sort((a, b) => a.dayOfWeek - b.dayOfWeek)
  const lines: string[] = []
  let i = 0
  while (i < sorted.length) {
    const start = sorted[i]
    if (!start) break
    let j = i
    let next = sorted[j + 1]
    while (next && next.closed === start.closed && next.openTime === start.openTime && next.closeTime === start.closeTime) {
      j++
      next = sorted[j + 1]
    }
    const end = sorted[j] ?? start
    const label = i === j ? dayName(start.dayOfWeek) : `${dayName(start.dayOfWeek)} – ${dayName(end.dayOfWeek)}`
    const hours = start.closed || !start.openTime || !start.closeTime
      ? 'Closed'
      : `${formatTime(start.openTime)} – ${formatTime(start.closeTime)}`
    lines.push(`${label}: ${hours}`)
    i = j + 1
  }
  return lines
}
