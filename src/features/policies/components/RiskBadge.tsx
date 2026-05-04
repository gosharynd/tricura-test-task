import { computeRiskLevel, RISK_COLORS } from '../risk'

type RiskBadgeProps = {
  reimbursementRisk: number
}

const RiskBadge = ({ reimbursementRisk }: RiskBadgeProps) => {
  const level = computeRiskLevel(reimbursementRisk)
  const colors = RISK_COLORS[level]

  return (
    <div className="flex items-center gap-1.5">
      <span className={`text-xs font-medium px-2 py-0.5 rounded ${colors}`}>{level}</span>
      <span className="text-sm text-muted-foreground">{reimbursementRisk.toFixed(2)}</span>
    </div>
  )
}

export default RiskBadge
