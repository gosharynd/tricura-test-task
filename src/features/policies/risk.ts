import type { RiskLevel, Severity } from './types'

export const computeRiskLevel = (reimbursementRisk: number): RiskLevel => {
  if (reimbursementRisk >= 0.7) return 'High'
  if (reimbursementRisk >= 0.4) return 'Medium'
  return 'Low'
}

export const RISK_COLORS: Record<RiskLevel, string> = {
  High: 'text-danger bg-danger-bg',
  Medium: 'text-warning bg-warning-bg',
  Low: 'text-success bg-success-bg',
}

export const SEVERITY_COLORS: Record<Severity, string> = {
  critical: 'text-danger bg-danger-bg',
  high: 'text-warning bg-warning-bg',
  medium: 'text-info bg-info-bg',
  low: 'text-success bg-success-bg',
}
