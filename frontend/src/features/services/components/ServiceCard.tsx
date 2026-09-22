import { Link } from 'react-router-dom'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { formatServicePrice } from '@/lib/money'
import type { Service } from '@/types/service'

interface ServiceCardProps {
  service: Service
}

export function ServiceCard({ service }: ServiceCardProps) {
  return (
    <Card className="flex flex-col p-6">
      {service.categoryName && <Badge>{service.categoryName}</Badge>}
      <Link to={`/services/${service.id}`} className="mt-3 font-display text-xl text-charcoal hover:text-rose">
        {service.name}
      </Link>
      {service.shortDescription && <p className="mt-2 flex-1 text-sm text-charcoal-soft">{service.shortDescription}</p>}
      <div className="mt-4 flex items-center justify-between text-sm">
        <span className="font-medium text-rose">{formatServicePrice(service)}</span>
        <span className="text-charcoal-soft">{service.durationMinutes} min</span>
      </div>
      <Button className="mt-4" variant="secondary" size="sm" asChild>
        <Link to="/book" state={{ serviceId: service.id }}>
          Book Now
        </Link>
      </Button>
    </Card>
  )
}
