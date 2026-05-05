import { useState, useCallback, useMemo, useEffect, memo } from 'react'
import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'
import { parseFormattedNumber } from '@/lib/format'

type RangeSliderProps = {
  label: string
  min: number
  max: number
  step?: number
  value: [number | undefined, number | undefined]
  onChange: (value: [number | undefined, number | undefined]) => void
  /** Format for the min/max labels below slider (e.g. "$0") */
  formatLabel?: (value: number) => string
  /** Format for the input display value (e.g. "200,000" or "0.20") */
  formatValue?: (value: number) => string
}

const RangeSlider = memo(({ label, min, max, step = 1, value, onChange, formatLabel, formatValue }: RangeSliderProps) => {
  const currentMin = value[0] ?? min
  const currentMax = value[1] ?? max

  const sliderValue = useMemo(() => [currentMin, currentMax], [currentMin, currentMax])

  // Local display strings for formatted inputs
  const formatDisplay = useCallback((v: number | undefined) => {
    if (v === undefined) return ''
    return formatValue ? formatValue(v) : String(v)
  }, [formatValue])

  const [minText, setMinText] = useState(() => formatDisplay(value[0]))
  const [maxText, setMaxText] = useState(() => formatDisplay(value[1]))

  // Sync display when parent value changes (e.g. slider drag, reset)
  useEffect(() => { setMinText(formatDisplay(value[0])) }, [value[0], formatDisplay])
  useEffect(() => { setMaxText(formatDisplay(value[1])) }, [value[1], formatDisplay])

  const handleMinInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMinText(e.target.value)
  }, [])

  const handleMaxInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setMaxText(e.target.value)
  }, [])

  const handleMinBlur = useCallback(() => {
    const parsed = parseFormattedNumber(minText)
    onChange([parsed, value[1]])
  }, [minText, onChange, value])

  const handleMaxBlur = useCallback(() => {
    const parsed = parseFormattedNumber(maxText)
    onChange([value[0], parsed])
  }, [maxText, onChange, value])

  const handleSliderChange = useCallback(([newMin, newMax]: number[]) => {
    onChange([newMin === min ? undefined : newMin, newMax === max ? undefined : newMax])
  }, [onChange, min, max])

  const minLabel = useMemo(() => formatLabel ? formatLabel(min) : String(min), [formatLabel, min])
  const maxLabel = useMemo(() => formatLabel ? formatLabel(max) : String(max), [formatLabel, max])

  const minPlaceholder = useMemo(
    () => formatValue ? formatValue(min) : String(min),
    [formatValue, min],
  )
  const maxPlaceholder = useMemo(
    () => formatValue ? formatValue(max) : String(max),
    [formatValue, max],
  )

  return (
    <div className="space-y-3">
      <h5 className="text-[11px] font-semibold uppercase tracking-[0.08em] text-black/60 pb-1.5 border-b border-black/6 mb-2.5">{label}</h5>
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1">
          <label className="text-[11px] text-black/60">Min</label>
          <Input
            type="text"
            inputMode="decimal"
            value={minText}
            onChange={handleMinInput}
            onBlur={handleMinBlur}
            placeholder={minPlaceholder}
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] text-black/60">Max</label>
          <Input
            type="text"
            inputMode="decimal"
            value={maxText}
            onChange={handleMaxInput}
            onBlur={handleMaxBlur}
            placeholder={maxPlaceholder}
          />
        </div>
      </div>
      <Slider min={min} max={max} step={step} value={sliderValue} onValueChange={handleSliderChange} />
      <div className="flex justify-between text-[11px] text-black/60 tabular-nums">
        <span>{minLabel}</span>
        <span>{maxLabel}</span>
      </div>
    </div>
  )
})

export default RangeSlider
