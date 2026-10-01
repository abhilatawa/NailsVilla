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

/** Today's date as "YYYY-MM-DD" in the visitor's local timezone. */
export function todayIso(): string {
  return toIsoDate(new Date())
}

export function addDaysIso(isoDate: string, days: number): string {
  const parts = isoDate.split('-').map(Number)
  return toIsoDate(new Date(parts[0] ?? 0, (parts[1] ?? 1) - 1, (parts[2] ?? 1) + days))
}

function toIsoDate(date: Date): string {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${date.getFullYear()}-${month}-${day}`
}

/** The moment an appointment's online cancellation closes: `hours` before it starts. */
export function cancellationDeadline(isoDate: string, startTime: string, hours: number): Date {
  const [year = 0, month = 1, day = 1] = isoDate.split('-').map(Number)
  const [hour = 0, minute = 0] = startTime.split(':').map(Number)
  return new Date(year, month - 1, day, hour - hours, minute)
}

/** e.g. "Thu, Oct 1, 6:00 AM" — en-US so the time reads "AM", matching formatTime. */
export function formatDateTimeShort(date: Date): string {
  return date.toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}
