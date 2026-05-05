import { memo } from 'react'

type FloatingInputProps = {
  legend: string
  children: React.ReactNode
}

/** MUI-style outlined input wrapper with floating label on top border. Uses divs to avoid fieldset/legend form interference. */
const FloatingInput = memo(({ legend, children }: FloatingInputProps) => (
  <div className="group relative border border-black/12 rounded px-3 py-1.5 focus-within:border-[#1976d2] focus-within:border-2 focus-within:px-[11px] focus-within:py-[5px]">
    <span className="absolute -top-2 left-2 bg-white px-1 text-[11px] leading-none text-black/60 group-focus-within:text-[#1976d2]">
      {legend}
    </span>
    {children}
  </div>
))

export default FloatingInput
