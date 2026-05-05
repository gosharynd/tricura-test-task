import { useRef, useCallback, memo } from 'react'
import { Calendar } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { formatDate } from '@/lib/format'

type DateInputProps = {
  value: string | undefined
  onChange: (value: string | undefined) => void
  placeholder?: string
}

const DateInput = memo(({ value, onChange, placeholder = 'Select date' }: DateInputProps) => {
  const dateRef = useRef<HTMLInputElement>(null)
  const display = value ? formatDate(value) : ''

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value || undefined)
  }, [onChange])

  const handleOpen = useCallback(() => {
    dateRef.current?.showPicker()
  }, [])

  return (
    <div className="relative cursor-pointer" onClick={handleOpen}>
      <Input
        type="text"
        readOnly
        value={display}
        placeholder={placeholder}
        className="cursor-pointer pr-9"
      />
      <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-black/40 pointer-events-none" />
      <input
        ref={dateRef}
        type="date"
        value={value ?? ''}
        onChange={handleChange}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </div>
  )
})

export default DateInput
