import { useEffect, useState, type FormEvent } from 'react'
import { clientService, type ClientProfileInput } from '../../services/clientService'

const EMPTY: ClientProfileInput = { company: '', about: '', location: '', phone: '' }

export default function ClientProfileEdit() {
  const [fields, setFields] = useState<ClientProfileInput>(EMPTY)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    clientService.myProfile()
      .then((profile) => setFields({
        company: profile.company,
        about: profile.about,
        location: profile.location,
        phone: profile.phone,
      }))
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const set = (key: keyof ClientProfileInput) => (value: string) => {
    setFields((f) => ({ ...f, [key]: value }))
    setSaved(false)
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await clientService.saveProfile(fields)
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
      <p className="muted">
        Workers see this when they are deciding whether to apply for your jobs.
      </p>

      {error && <p className="error">{error}</p>}

      <form className="form" onSubmit={submit}>
        <label>
          <span>Company</span>
          <input
            value={fields.company}
            onChange={(e) => set('company')(e.target.value)}
            placeholder="Clara Interiors — or leave blank if it is just you"
            maxLength={120}
          />
        </label>

        <label>
          <span>About you</span>
          <textarea
            value={fields.about}
            onChange={(e) => set('about')(e.target.value)}
            rows={5}
            placeholder="The kind of work you usually need done."
            maxLength={4000}
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
            <span>Phone</span>
            <input
              value={fields.phone}
              onChange={(e) => set('phone')(e.target.value)}
              placeholder="0918 222 3344"
              maxLength={30}
            />
          </label>
        </div>

        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
          {saved && <span className="muted">Saved.</span>}
        </div>
      </form>
    </main>
  )
}
