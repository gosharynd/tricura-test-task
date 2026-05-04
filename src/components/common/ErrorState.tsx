import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

type ErrorStateProps = {
  title: string
  description: string
  errorCode?: string
  onRetry?: () => void
}

const ErrorState = ({ title, description, errorCode, onRetry }: ErrorStateProps) => {
  return (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="rounded-full bg-red-50 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-red-500" />
      </div>
      <h3 className="text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-2">{description}</p>
      {errorCode && (
        <code className="text-xs bg-muted px-2 py-1 rounded mb-4">{errorCode}</code>
      )}
      {onRetry && (
        <Button variant="default" size="sm" onClick={onRetry} className="mt-2">
          Retry
        </Button>
      )}
    </div>
  )
}

export default ErrorState
