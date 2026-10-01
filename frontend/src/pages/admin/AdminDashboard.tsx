import { useState } from 'react'
import { Mail, Phone, RefreshCw } from 'lucide-react'
import { type AdminAppointmentFilters, useAdminAppointments } from '@/features/admin/useAdminAppointments'
import { formatMoney } from '@/lib/money'
import { addDaysIso, formatDateLong, formatTime, todayIso } from '@/lib/time'
import { cn } from '@/lib/utils'
import type { AdminAppointment, AppointmentStatus } from '@/types/appointment'

type Preset = 'upcoming' | 'today' | 'week' | 'past' | 'custom'

const PRESETS: { id: Preset; label: string }[] = [
  { id: 'upcoming', label: 'Next 30 days' },
  { id: 'today', label: 'Today' },
  { id: 'week', label: 'Next 7 days' },
  { id: 'past', label: 'Past 30 days' },
  { id: 'custom', label: 'Custom' },
]

const STATUS_OPTIONS: AppointmentStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW']

const STATUS_STYLES: Record<AppointmentStatus, string> = {
  PENDING: 'bg-amber-50 text-amber-800 ring-amber-200',
  CONFIRMED: 'bg-emerald-50 text-emerald-800 ring-emerald-200',
  COMPLETED: 'bg-slate-100 text-slate-700 ring-slate-200',
  CANCELLED: 'bg-red-50 text-red-700 ring-red-200',
  NO_SHOW: 'bg-orange-50 text-orange-800 ring-orange-200',
}

function presetRange(preset: Exclude<Preset, 'custom'>): { from: string; to: string } {
  const today = todayIso()
  switch (preset) {
    case 'today':
      return { from: today, to: today }
    case 'week':
      return { from: today, to: addDaysIso(today, 6) }
    case 'past':
      return { from: addDaysIso(today, -30), to: addDaysIso(today, -1) }
    case 'upcoming':
      return { from: today, to: addDaysIso(today, 30) }
  }
}

export function AdminDashboardPage() {
  const [preset, setPreset] = useState<Preset>('upcoming')
  const [custom, setCustom] = useState(() => presetRange('upcoming'))
  const [status, setStatus] = useState<AppointmentStatus | ''>('')

  const range = preset === 'custom' ? custom : presetRange(preset)
  const filters: AdminAppointmentFilters = { ...range, status: status || undefined }
  const { data: appointments, isLoading, isError, isFetching, refetch } = useAdminAppointments(filters)

  const byDate = groupByDate(appointments ?? [])
  const active = (appointments ?? []).filter((a) => a.status === 'PENDING' || a.status === 'CONFIRMED').length
  const cancelled = (appointments ?? []).filter((a) => a.status === 'CANCELLED').length

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Bookings</h1>
          <p className="mt-1 text-sm text-slate-600">
            {formatDateLong(range.from)}
            {range.to !== range.from && <> – {formatDateLong(range.to)}</>}
          </p>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
        >
          <RefreshCw className={cn('h-4 w-4', isFetching && 'animate-spin')} aria-hidden="true" />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="flex flex-wrap gap-1 rounded-md border border-slate-200 p-1" role="group" aria-label="Date range">
          {PRESETS.map(({ id, label }) => (
            <button
              key={id}
              type="button"
              aria-pressed={preset === id}
              onClick={() => {
                if (id === 'custom' && preset !== 'custom') setCustom(range)
                setPreset(id)
              }}
              className={cn(
                'rounded px-3 py-1.5 text-sm',
                preset === id ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {preset === 'custom' && (
          <div className="flex items-end gap-2 text-sm">
            <label className="flex flex-col gap-1 text-slate-600">
              From
              <input
                type="date"
                value={custom.from}
                onChange={(event) => event.target.value && setCustom((c) => ({ ...c, from: event.target.value }))}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-slate-900"
              />
            </label>
            <label className="flex flex-col gap-1 text-slate-600">
              To
              <input
                type="date"
                value={custom.to}
                min={custom.from}
                onChange={(event) => event.target.value && setCustom((c) => ({ ...c, to: event.target.value }))}
                className="rounded-md border border-slate-300 px-2 py-1.5 text-slate-900"
              />
            </label>
          </div>
        )}

        <label className="flex flex-col gap-1 text-sm text-slate-600">
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as AppointmentStatus | '')}
            className="rounded-md border border-slate-300 px-2 py-1.5 text-slate-900"
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {statusLabel(option)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Summary */}
      {appointments && (
        <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-md">
          <Stat label="Bookings" value={appointments.length} />
          <Stat label="Active" value={active} />
          <Stat label="Cancelled" value={cancelled} />
        </dl>
      )}

      {/* List */}
      <div className="mt-8">
        {isLoading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse rounded-md bg-slate-100" />
            ))}
          </div>
        ) : isError ? (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Couldn&rsquo;t load bookings.{' '}
            <button type="button" onClick={() => refetch()} className="font-medium underline">
              Try again
            </button>
          </div>
        ) : byDate.length === 0 ? (
          <p className="rounded-md border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
            No bookings in this range.
          </p>
        ) : (
          <div className="space-y-8">
            {byDate.map(([date, dayAppointments]) => (
              <section key={date}>
                <h2 className="mb-2 text-sm font-semibold text-slate-700">
                  {formatDateLong(date)}{' '}
                  <span className="font-normal text-slate-500">· {dayAppointments.length}</span>
                </h2>
                <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
                  {dayAppointments.map((appointment) => (
                    <BookingRow key={appointment.id} appointment={appointment} />
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function BookingRow({ appointment }: { appointment: AdminAppointment }) {
  const isCancelled = appointment.status === 'CANCELLED'
  return (
    <li className={cn('grid gap-3 p-4 text-sm md:grid-cols-[8rem_1fr_1fr_auto] md:items-start', isCancelled && 'opacity-60')}>
      <div className="font-medium tabular-nums">
        {formatTime(appointment.startTime)}
        <span className="block text-xs font-normal text-slate-500">to {formatTime(appointment.endTime)}</span>
      </div>

      <div>
        <p className="font-medium">
          {appointment.customerName}
          {appointment.guest && (
            <span className="ml-2 rounded bg-slate-100 px-1.5 py-0.5 text-xs font-normal text-slate-600">Guest</span>
          )}
        </p>
        <div className="mt-1 flex flex-col gap-0.5 text-slate-600">
          {appointment.customerEmail && (
            <a href={`mailto:${appointment.customerEmail}`} className="inline-flex items-center gap-1.5 hover:text-slate-900">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              {appointment.customerEmail}
            </a>
          )}
          {appointment.customerPhone && (
            <a href={`tel:${appointment.customerPhone}`} className="inline-flex items-center gap-1.5 hover:text-slate-900">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              {appointment.customerPhone}
            </a>
          )}
        </div>
      </div>

      <div>
        <p className="font-medium">{appointment.serviceName}</p>
        <p className="text-slate-600">
          {appointment.durationMinutes} min · {formatMoney(appointment.price, appointment.currency)}
        </p>
        {appointment.customerNotes && (
          <p className="mt-1 rounded bg-slate-50 px-2 py-1 text-slate-700">“{appointment.customerNotes}”</p>
        )}
        {isCancelled && appointment.cancellationReason && (
          <p className="mt-1 text-slate-600">Cancelled: {appointment.cancellationReason}</p>
        )}
      </div>

      <span
        className={cn(
          'justify-self-start rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset',
          STATUS_STYLES[appointment.status],
        )}
      >
        {statusLabel(appointment.status)}
      </span>
    </li>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-md border border-slate-200 px-3 py-2">
      <dt className="text-xs uppercase tracking-wide text-slate-500">{label}</dt>
      <dd className="text-xl font-semibold tabular-nums">{value}</dd>
    </div>
  )
}

function statusLabel(status: AppointmentStatus) {
  return status === 'NO_SHOW' ? 'No-show' : status.charAt(0) + status.slice(1).toLowerCase()
}

function groupByDate(appointments: AdminAppointment[]): [string, AdminAppointment[]][] {
  const groups = new Map<string, AdminAppointment[]>()
  for (const appointment of appointments) {
    groups.set(appointment.date, [...(groups.get(appointment.date) ?? []), appointment])
  }
  return [...groups.entries()]
}
