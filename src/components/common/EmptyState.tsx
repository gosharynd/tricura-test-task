import { Search } from 'lucide-react'
import { Button } from '@/components/ui/button'

type EmptyStateProps = {
  title: string
  description: string
  actions?: Array<{
    label: string
    onClick: () => void
    variant?: 'default' | 'outline'
  }>
}

const EmptyState = ({ title, description, actions }: EmptyStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-muted p-3 mb-4">
        <Search className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-sm font-semibold text-black/87 mb-1">{title}</h3>
      <p className="text-[13px] text-black/60 mb-6">{description}</p>
      {actions && (
        <div className="flex gap-3">
          {actions.map((action) => (
            <Button key={action.label} variant={action.variant ?? 'outline'} onClick={action.onClick}>
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  )
}

export default EmptyState
