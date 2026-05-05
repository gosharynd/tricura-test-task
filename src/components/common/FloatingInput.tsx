import { memo } from 'react'

type FloatingInputProps = {
  legend: string
  error?: string
  children: React.ReactNode
}

/** MUI-style outlined input wrapper with floating label on top border. Uses divs to avoid fieldset/legend form interference. */
const FloatingInput = memo(({ legend, error, children }: FloatingInputProps) => (
  <div>
    <div className={`group relative border rounded px-3 py-1.5 focus-within:border-2 focus-within:px-[11px] focus-within:py-[5px] ${error ? 'border-red-500 focus-within:border-red-500' : 'border-black/12 focus-within:border-[#1976d2]'}`}>
      <span className={`absolute -top-2 left-2 bg-white px-1 text-[11px] leading-none ${error ? 'text-red-500' : 'text-black/60 group-focus-within:text-[#1976d2]'}`}>
        {legend}
      </span>
      {children}
    </div>
    {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
  </div>
))

export default FloatingInput
