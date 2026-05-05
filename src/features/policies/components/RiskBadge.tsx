import { useMemo, memo } from 'react'
import { computeRiskLevel, RISK_COLORS } from '../risk'

type RiskBadgeProps = {
  reimbursementRisk: number
}

const RiskBadge = memo(({ reimbursementRisk }: RiskBadgeProps) => {
  const level = useMemo(() => computeRiskLevel(reimbursementRisk), [reimbursementRisk])
  const colors = RISK_COLORS[level]
  const formatted = useMemo(() => reimbursementRisk.toFixed(2), [reimbursementRisk])

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-[11px] font-semibold tracking-wide px-2 h-[22px] inline-flex items-center rounded-full ${colors}`}>{level}</span>
      <span className="text-xs text-black/60">{formatted}</span>
    </div>
  )
})

export default RiskBadge
