import type { RiskLevel, Severity } from './types'

export const computeRiskLevel = (reimbursementRisk: number): RiskLevel => {
  if (reimbursementRisk >= 0.7) return 'High'
  if (reimbursementRisk >= 0.4) return 'Medium'
  return 'Low'
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  High: 'text-[#d32f2f] bg-[#fdece2]',
  Medium: 'text-[#ed6c02] bg-[#fff4e5]',
  Low: 'text-[#2e7d32] bg-[#e8f5e9]',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'text-red-600',
  high: 'text-orange-600',
  medium: 'text-yellow-600',
  low: 'text-green-600',
}
