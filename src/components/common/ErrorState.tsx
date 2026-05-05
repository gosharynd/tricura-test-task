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
      <h3 className="text-sm font-semibold text-black/87 mb-1">{title}</h3>
      <p className="text-[13px] text-black/60 mb-2">{description}</p>
      {errorCode && (
        <code className="text-xs bg-black/5 text-black/60 px-2 py-1 rounded mb-4">{errorCode}</code>
      )}
      {onRetry && (
        <Button variant="default" size="sm" onClick={onRetry} className="mt-2 bg-[#d32f2f] hover:bg-[#c62828] text-white uppercase text-xs font-semibold tracking-wide">
          Retry
        </Button>
      )}
    </div>
  )
}

export default ErrorState
