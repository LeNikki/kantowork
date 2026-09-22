import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import type { Skill } from '../../api'
import { skillService } from '../../services/skillService'
import { workerService, type WorkerProfileInput } from '../../services/workerService'
import SkillPicker from '../../components/SkillPicker'

const EMPTY: WorkerProfileInput = {
  headline: '', bio: '', location: '', years_experience: '', hourly_rate: '', phone: '',
}

export default function WorkerProfileEdit() {
  const [fields, setFields] = useState<WorkerProfileInput>(EMPTY)
  // The chosen skills are a Set of ids rather than part of `fields`: they are
  // saved by their own endpoint, and membership is the only question asked.
  const [chosen, setChosen] = useState<Set<number>>(new Set())
  const [vocabulary, setVocabulary] = useState<Skill[]>([])
  const [workerId, setWorkerId] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    // Both are needed before the form can render, and neither depends on the
    // other, so they go together.
    Promise.all([workerService.myProfile(), skillService.list()])
      .then(([profile, skills]) => {
        setFields({
          headline: profile.headline,
          bio: profile.bio,
          location: profile.location,
          // null means unanswered, and an input's value cannot be null.
          years_experience: profile.years_experience?.toString() ?? '',
          hourly_rate: profile.hourly_rate?.toString() ?? '',
          phone: profile.phone,
        })
        setChosen(new Set(profile.skills.map((s) => s.id)))
        setWorkerId(profile.user_id)
        setVocabulary(skills)
      })
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof WorkerProfileInput) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const toggleSkill = (id: number) => {
    setChosen((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })
    setSaved(false)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      // Two endpoints, so two calls. The profile goes first: if the skills
      // call fails, the details the worker typed are already safe.
      await workerService.saveProfile(fields)
      await workerService.saveSkills([...chosen])
      setSaved(true)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>Your profile</h1>
      <p className="muted">This is what a client sees when they look you up.</p>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={submit}>
        <label>
          <span>Headline</span>
          <input
            value={fields.headline}
            onChange={(e) => set('headline')(e.target.value)}
            placeholder="Cabinetmaker, 12 years"
            maxLength={120}
          />
        </label>

        <label>
          <span>About your work</span>
          <textarea
            value={fields.bio}
            onChange={(e) => set('bio')(e.target.value)}
            rows={5}
            placeholder="The kind of work you take on, and anything a client should know."
            maxLength={4000}
          />
        </label>

        <div className="form-row">
          <label>
            <span>Location</span>
            <input
              value={fields.location}
              onChange={(e) => set('location')(e.target.value)}
              placeholder="Quezon City"
              maxLength={120}
            />
          </label>

          <label>
            <span>Phone</span>
            <input
              value={fields.phone}
              onChange={(e) => set('phone')(e.target.value)}
              placeholder="0917 555 1234"
              maxLength={30}
            />
          </label>
        </div>

        <div className="form-row">
          <label>
            <span>Years of experience</span>
            <input
              type="number"
              value={fields.years_experience}
              onChange={(e) => set('years_experience')(e.target.value)}
              min={0}
              max={80}
              placeholder="12"
            />
          </label>

          <label>
            <span>Hourly rate</span>
            <input
              type="number"
              value={fields.hourly_rate}
              onChange={(e) => set('hourly_rate')(e.target.value)}
              min={0}
              step="0.01"
              placeholder="450"
            />
          </label>
        </div>

        <SkillPicker
          vocabulary={vocabulary}
          chosen={chosen}
          onToggle={toggleSkill}
          legend="What you can do"
        />

        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
          {saved && <span className="muted">Saved.</span>}
          {workerId !== null && (
            <Link className="btn btn-quiet" to={`/workers/${workerId}`}>
              See it as a client does
            </Link>
          )}
        </div>
      </form>
    </main>
  )
}
