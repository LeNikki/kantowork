import { useEffect, useState, type FormEvent } from 'react'
import type { Skill } from '../api'
import { skillService } from '../services/skillService'
import SkillPicker from './SkillPicker'
import type { JobInput } from '../services/jobService'

/**
 * Posting a job and editing one are the same form, so they are the same
 * component - the only differences are what it starts with and what the
 * button says.
 *
 * `initial` is read once, when this mounts. A parent that has to fetch the
 * job first holds this back until it has one, so there is nothing to sync
 * afterwards.
 */
export default function JobForm({
  initial, submitLabel, onSubmit,
}: {
  initial: JobInput
  submitLabel: string
  onSubmit: (input: JobInput) => Promise<void>
}) {
  const [fields, setFields] = useState<JobInput>(initial)
  const [chosen, setChosen] = useState<Set<number>>(new Set(initial.skill_ids))
  const [vocabulary, setVocabulary] = useState<Skill[]>([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => { skillService.list().then(setVocabulary).catch(() => setVocabulary([])) }, [])

  const set = (key: keyof JobInput) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }))

  const toggleSkill = (id: number) => setChosen((prev) => {
    const next = new Set(prev)
    if (!next.delete(id)) next.add(id)
    return next
  })

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSubmit({ ...fields, skill_ids: [...chosen] })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <form className="form" onSubmit={submit}>
      {error && <p className="error">{error}</p>}

      <label>
        <span>Title</span>
        <input
          value={fields.title}
          onChange={(e) => set('title')(e.target.value)}
          placeholder="Built-in wardrobe for a small bedroom"
          maxLength={140}
          required
        />
      </label>

      <label>
        <span>What needs doing</span>
        <textarea
          value={fields.description}
          onChange={(e) => set('description')(e.target.value)}
          rows={7}
          placeholder="The work, the materials, anything a worker should know before they quote."
          maxLength={8000}
          required
        />
      </label>

      <div className="form-row">
        <label>
          <span>Location</span>
          <input
            value={fields.location}
            onChange={(e) => set('location')(e.target.value)}
            placeholder="Makati"
            maxLength={120}
          />
        </label>

        <label>
          <span>Finish by</span>
          <input
            type="date"
            value={fields.deadline}
            onChange={(e) => set('deadline')(e.target.value)}
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          <span>Budget type</span>
          <select value={fields.budget_type} onChange={(e) => set('budget_type')(e.target.value)}>
            <option value="job">A fixed price for the job</option>
            <option value="hour">An hourly rate</option>
            <option value="day">A day rate</option>
            <option value="sqm">A rate per square metre</option>
          </select>
        </label>

        <label>
          <span>Budget from</span>
          <input
            type="number"
            value={fields.budget_min}
            onChange={(e) => set('budget_min')(e.target.value)}
            min={0}
            step="0.01"
            placeholder="25000"
          />
        </label>

        <label>
          <span>Budget up to</span>
          <input
            type="number"
            value={fields.budget_max}
            onChange={(e) => set('budget_max')(e.target.value)}
            min={0}
            step="0.01"
            placeholder="40000"
          />
        </label>
      </div>
      <p className="muted">Leave the budget blank if you would rather workers tell you.</p>

      <SkillPicker
        vocabulary={vocabulary}
        chosen={chosen}
        onToggle={toggleSkill}
        legend="What the work needs"
      />

      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
      </div>
    </form>
  )
}

