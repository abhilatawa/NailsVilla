export type PriceType = 'FIXED' | 'STARTING_FROM' | 'RANGE'

export interface Service {
  id: string
  categoryId: string
  categoryName: string | null
  name: string
  description: string | null
  shortDescription: string | null
  priceType: PriceType
  price: number | null
  startingPrice: number | null
  minPrice: number | null
  maxPrice: number | null
  currency: string
  durationMinutes: number
  featured: boolean
  displayOrder: number
}

export interface ServiceCategory {
  id: string
  name: string
  description: string | null
  displayOrder: number
}
