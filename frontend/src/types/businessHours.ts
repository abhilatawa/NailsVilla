export interface BusinessHoursDay {
  dayOfWeek: number
  closed: boolean
  openTime: string | null
  closeTime: string | null
}
