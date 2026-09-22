import type { Job, RateUnit } from './api'

// Money always reads with two decimal places. A bare "450.5" looks like a typo
// rather than an amount.
export const formatMoney = (amount: number) =>
  `₱${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

/**
 * A budget is a range, and either end may be missing - a client often knows
 * roughly what they will pay before they know exactly. Each combination gets
 * wording that says what is actually known, rather than a dash with a gap.
 */
export const formatBudget = (job: Pick<Job, 'budget_min' | 'budget_max' | 'budget_type'>) => {
  const { budget_min: min, budget_max: max, budget_type: type } = job
  const per = type === 'hourly' ? ' / hour' : ''

  if (min === null && max === null) return 'Budget open'
  if (min !== null && max !== null) {
    return min === max ? `${formatMoney(min)}${per}` : `${formatMoney(min)} – ${formatMoney(max)}${per}`
  }
  if (min !== null) return `From ${formatMoney(min)}${per}`
  return `Up to ${formatMoney(max as number)}${per}`
}

// A deadline is a plain date, so it is split by hand rather than passed
// through Date - parsing 'YYYY-MM-DD' treats it as UTC and can land on the
// day before in a western timezone.
export const formatDate = (iso: string) => {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString(undefined, {
    year: 'numeric', month: 'short', day: 'numeric',
  })
}

const RATE_UNITS: Record<RateUnit, string> = {
  job: 'per job',
  hour: 'per hour',
  day: 'per day',
  sqm: 'per m²',
}

// A service may be offered without a price - plenty of work cannot be quoted
// until it has been looked at, and an empty rate says exactly that.
export const formatRate = (rate: number | null, unit: RateUnit) =>
  rate === null ? 'Price on asking' : `${formatMoney(rate)} ${RATE_UNITS[unit]}`
