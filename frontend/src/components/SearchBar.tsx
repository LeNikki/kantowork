import { useEffect, useState, type FormEvent } from 'react'
import type { SearchFilters, Skill } from '../api'
import { skillService } from '../services/skillService'

/**
 * The filters over the job board and the worker directory. Both are searched
 * the same way - words, a place, a trade - so both use this.
 *
 * Nothing is applied while typing: the text is local until the form is
 * submitted, so a listing does not refetch on every keystroke. Choosing a
 * trade applies at once, because a select has no moment of being half-typed.
 */
export default function SearchBar({
  filters, onChange, children,
}: {
  filters: SearchFilters
  onChange: (filters: SearchFilters) => void
  children?: React.ReactNode
}) {
  const [q, setQ] = useState(filters.q ?? '')
  const [location, setLocation] = useState(filters.location ?? '')
  const [vocabulary, setVocabulary] = useState<Skill[]>([])

  useEffect(() => { skillService.list().then(setVocabulary).catch(() => setVocabulary([])) }, [])

  const submit = (e: FormEvent) => {
    e.preventDefault()
    onChange({ ...filters, q, location })
  }

  const chooseSkill = (value: string) =>
    onChange({ ...filters, skill_ids: value === '' ? [] : [Number(value)] })

  const clear = () => {
    setQ('')
    setLocation('')
    onChange({ mine: filters.mine })
  }

  const narrowed = Boolean(filters.q || filters.location
    || (filters.skill_ids && filters.skill_ids.length > 0))

  // The vocabulary arrives grouped by category, so the select is grouped the
  // same way - twenty trades in one flat list is a scroll, not a choice.
  const categories = [...new Set(vocabulary.map((s) => s.category))]

  return (
    <form className="search" onSubmit={submit}>
      <label>
        <span>Search</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="wardrobe, rewire, gate…"
          maxLength={120}
        />
      </label>

      <label>
        <span>Where</span>
        <input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Makati"
          maxLength={120}
        />
      </label>

      <label>
        <span>Trade</span>
        <select
          value={filters.skill_ids?.[0]?.toString() ?? ''}
          onChange={(e) => chooseSkill(e.target.value)}
        >
          <option value="">Any</option>
          {categories.map((category) => (
            <optgroup key={category} label={category}>
              {vocabulary.filter((s) => s.category === category).map((skill) => (
                <option key={skill.id} value={skill.id}>{skill.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </label>

      <div className="search-actions">
        <button className="btn" type="submit">Search</button>
        {narrowed && (
          <button className="btn btn-quiet" type="button" onClick={clear}>Clear</button>
        )}
        {children}
      </div>
    </form>
  )
}
