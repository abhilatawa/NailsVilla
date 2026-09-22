/** Formats a "HH:mm" 24-hour string (as returned by the API) as "8:00 AM". */
export function formatTime(time: string): string {
  const parts = time.split(':')
  const hour = Number(parts[0] ?? 0)
  const minuteStr = parts[1] ?? '00'
  const period = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 === 0 ? 12 : hour % 12
  return `${hour12}:${minuteStr} ${period}`
}

export function formatDateLong(isoDate: string): string {
  const parts = isoDate.split('-').map(Number)
  const date = new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, parts[2] ?? 1)
  return date.toLocaleDateString('en-CA', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
}
