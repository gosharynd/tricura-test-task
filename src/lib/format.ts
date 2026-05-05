export const parseDate = (isoDate: string): Date => {
  if (isoDate.includes('T')) return new Date(isoDate)
  const [year, month, day] = isoDate.split('-').map(Number)
  return new Date(year, month - 1, day)
}

// --- Currency ---

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value)
}

export const formatCurrencyAbbr = (value: number): string => {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 10_000) return `$${Math.round(value / 1_000)}k`
  return formatCurrency(value)
}

// --- Number formatting for form inputs ---

/** Integer with thousands separator: 200000 → "200,000" */
export const formatInteger = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: 0,
  }).format(value)
}

/** Decimal 0–1 with two places: 0.2 → "0.20" */
export const formatDecimal = (value: number): string => {
  return value.toFixed(2)
}

/** Parse a formatted string back to number, stripping commas */
export const parseFormattedNumber = (raw: string): number | undefined => {
  const cleaned = raw.replace(/,/g, '').trim()
  if (cleaned === '') return undefined
  const n = Number(cleaned)
  return Number.isNaN(n) ? undefined : n
}

// --- Dates ---

/** "Jan 2026" */
export const formatMonth = (isoDate: string): string => {
  return parseDate(isoDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export const formatDate = (isoDate: string): string => {
  return parseDate(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export const formatDateShort = (isoDate: string): string => {
  return parseDate(isoDate).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

/** ISO date → "MM/DD/YYYY" for display */
export const formatDateSlash = (isoDate: string): string => {
  const d = parseDate(isoDate)
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const yyyy = d.getFullYear()
  return `${mm}/${dd}/${yyyy}`
}
