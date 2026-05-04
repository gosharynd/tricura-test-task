import type { RiskLevel } from './types'

export const computeRiskLevel = (reimbursementRisk: number): RiskLevel => {
  if (reimbursementRisk >= 0.7) return 'High'
  if (reimbursementRisk >= 0.4) return 'Medium'
  return 'Low'
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  High: 'text-red-600 bg-red-50',
  Medium: 'text-orange-600 bg-orange-50',
  Low: 'text-green-600 bg-green-50',
}

export const SEVERITY_COLORS: Record<string, string> = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-green-600',
}
