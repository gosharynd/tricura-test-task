import { Input } from '@/components/ui/input'
import { Slider } from '@/components/ui/slider'

type RangeSliderProps = {
  label: string
  min: number
  max: number
  step?: number
  value: [number | undefined, number | undefined]
  onChange: (value: [number | undefined, number | undefined]) => void
  formatLabel?: (value: number) => string
}

const RangeSlider = ({ label, min, max, step = 1, value, onChange, formatLabel }: RangeSliderProps) => {
  const currentMin = value[0] ?? min
  const currentMax = value[1] ?? max

  return (
    <div className="space-y-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</label>
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Min</label>
          <Input
            type="number"
            value={value[0] ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? undefined : Number(e.target.value)
              onChange([v, value[1]])
            }}
            placeholder={String(min)}
          />
        </div>
        <div className="flex-1">
          <label className="text-xs text-muted-foreground">Max</label>
          <Input
            type="number"
            value={value[1] ?? ''}
            onChange={(e) => {
              const v = e.target.value === '' ? undefined : Number(e.target.value)
              onChange([value[0], v])
            }}
            placeholder={String(max)}
          />
        </div>
      </div>
      <Slider min={min} max={max} step={step} value={[currentMin, currentMax]} onValueChange={([newMin, newMax]) => {
        onChange([newMin === min ? undefined : newMin, newMax === max ? undefined : newMax])
      }} />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{formatLabel ? formatLabel(min) : min}</span>
        <span>{formatLabel ? formatLabel(max) : max}</span>
      </div>
    </div>
  )
}

export default RangeSlider
