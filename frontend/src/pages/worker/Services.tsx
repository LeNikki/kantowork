import { useEffect, useState, type FormEvent } from 'react'
import type { ServiceOffering } from '../../api'
import { workerService, type ServiceInput } from '../../services/workerService'
import { formatRate } from '../../format'

const EMPTY: ServiceInput = { title: '', description: '', rate: '', rate_unit: 'job' }

/**
 * What a worker offers, as a list they can add to and rearrange.
 *
 * One row at a time is editable: `editing` holds an id, or 'new', or nothing.
 * Each row is its own record on the server, so this is four ordinary requests
 * rather than one save of everything.
 */
export default function Services() {
  const [services, setServices] = useState<ServiceOffering[]>([])
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    workerService.myServices()
      .then(setServices)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const reload = () => workerService.myServices().then(setServices)

  const save = async (input: ServiceInput) => {
    // Position keeps the list in the order it is shown: a new service goes
    // last, an edited one stays where it was.
    if (editing === 'new') {
      await workerService.addService({ ...input, position: services.length })
    } else if (editing !== null) {
      const existing = services.find((s) => s.id === editing)
      await workerService.saveService(editing, { ...input, position: existing?.position ?? 0 })
    }
    await reload()
    setEditing(null)
  }

  const remove = async (service: ServiceOffering) => {
    if (!window.confirm(`Remove "${service.title}" from what you offer?`)) return
    setError('')
    try {
      await workerService.removeService(service.id)
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>What you offer</h1>
      <p className="muted">
        Priced work a client can ask you for. Your skills say what you can do; these say
        what you sell.
      </p>

      {error && <p className="error">{error}</p>}

      <div className="jobs">
        {services.map((service) => (
          <article key={service.id} className="job">
            {editing === service.id ? (
              <ServiceFields
                initial={{
                  title: service.title,
                  description: service.description,
                  rate: service.rate?.toString() ?? '',
                  rate_unit: service.rate_unit,
                }}
                submitLabel="Save"
                onSubmit={save}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <h2>{service.title}</h2>
                <p className="muted">{formatRate(service.rate, service.rate_unit)}</p>
                {service.description && <p>{service.description}</p>}
                <div className="form-actions">
                  <button className="btn btn-quiet" onClick={() => setEditing(service.id)}>Edit</button>
                  <button className="btn btn-quiet" onClick={() => remove(service)}>Remove</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>

      {editing === 'new' ? (
        <section className="panel">
          <h2>Add a service</h2>
          <ServiceFields
            initial={EMPTY}
            submitLabel="Add it"
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : (
        <p><button className="btn" onClick={() => setEditing('new')}>Add a service</button></p>
      )}

      {services.length === 0 && editing !== 'new' && (
        <p className="muted">You have not listed anything yet.</p>
      )}
    </main>
  )
}

// Not exported: the page is the only thing that needs it, and a module that
// exports more than components cannot be hot-reloaded.
function ServiceFields({
  initial, submitLabel, onSubmit, onCancel,
}: {
  initial: ServiceInput
  submitLabel: string
  onSubmit: (input: ServiceInput) => Promise<void>
  onCancel: () => void
}) {
  const [fields, setFields] = useState<ServiceInput>(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key: keyof ServiceInput) => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      await onSubmit(fields)
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
        <span>What it is</span>
        <input
          value={fields.title}
          onChange={(e) => set('title')(e.target.value)}
          placeholder="Fitted wardrobe, built on site"
          maxLength={140}
          required
        />
      </label>

      <label>
        <span>What it includes</span>
        <textarea
          value={fields.description}
          onChange={(e) => set('description')(e.target.value)}
          rows={3}
          placeholder="Materials, finish, what is and is not covered."
          maxLength={4000}
        />
      </label>

      <div className="form-row">
        <label>
          <span>Price</span>
          <input
            type="number"
            value={fields.rate}
            onChange={(e) => set('rate')(e.target.value)}
            min={0}
            step="0.01"
            placeholder="Leave blank to quote per job"
          />
        </label>

        <label>
          <span>Charged</span>
          <select value={fields.rate_unit} onChange={(e) => set('rate_unit')(e.target.value)}>
            <option value="job">per job</option>
            <option value="hour">per hour</option>
            <option value="day">per day</option>
            <option value="sqm">per square metre</option>
          </select>
        </label>
      </div>

      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button className="btn btn-quiet" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
