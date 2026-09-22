import type { SearchFilters } from './api'

/**
 * Filters and paging as a query string, for the board and the directory.
 *
 * An empty filter is left out rather than sent empty: `?q=` and no `q` at all
 * mean the same thing to the server, and a URL that says only what was asked
 * for is one a person can read.
 */
export const searchQuery = (
  filters: SearchFilters,
  page: { limit: number; offset: number },
) => {
  const params = new URLSearchParams()

  if (filters.q) params.set('q', filters.q)
  if (filters.location) params.set('location', filters.location)
  if (filters.skill_ids && filters.skill_ids.length > 0) {
    params.set('skill_ids', filters.skill_ids.join(','))
  }
  if (filters.mine) params.set('mine', '1')

  params.set('limit', String(page.limit))
  params.set('offset', String(page.offset))

  return `?${params}`
}
