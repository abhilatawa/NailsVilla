import type { Service } from '@/types/service'

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency, minimumFractionDigits: 0 }).format(amount)
}

/** Renders the right label for a service's pricing model: Section 2 of the brief is explicit that not every service should just say "$60". */
export function formatServicePrice(service: Service): string {
  switch (service.priceType) {
    case 'FIXED':
      return formatMoney(service.price ?? 0, service.currency)
    case 'STARTING_FROM':
      return `Starting from ${formatMoney(service.startingPrice ?? 0, service.currency)}`
    case 'RANGE':
      return `${formatMoney(service.minPrice ?? 0, service.currency)} – ${formatMoney(service.maxPrice ?? 0, service.currency)}`
    default:
      return ''
  }
}
