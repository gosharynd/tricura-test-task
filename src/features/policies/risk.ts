import type { RiskLevel, Severity } from './types'

export const computeRiskLevel = (reimbursementRisk: number): RiskLevel => {
  if (reimbursementRisk >= 0.7) return 'High'
  if (reimbursementRisk >= 0.4) return 'Medium'
  return 'Low'
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  High: 'text-[#d32f2f] bg-[#fdecea]',
  Medium: 'text-[#ed6c02] bg-[#fff4e5]',
  Low: 'text-[#2e7d32] bg-[#e8f5e9]',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'text-[#d32f2f] bg-[#fdecea]',
  high: 'text-[#ed6c02] bg-[#fff4e5]',
  medium: 'text-[#0288d1] bg-[#e1f5fe]',
  low: 'text-[#2e7d32] bg-[#e8f5e9]',
}
