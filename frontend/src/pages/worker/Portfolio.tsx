import { useEffect, useState, type FormEvent } from 'react'
import type { PortfolioProject } from '../../api'
import { workerService, type PortfolioInput } from '../../services/workerService'
import { formatDate } from '../../format'
import Gallery from '../../components/Gallery'

const EMPTY: PortfolioInput = { title: '', description: '', completed_on: '', images: [] }

/**
 * Previous work. The one place a worker can show rather than tell, so it is
 * the part of their profile worth the most.
 *
 * Pictures are web addresses. Nothing here uploads a file - a worker points at
 * an image they host elsewhere, and the form says so rather than leaving them
 * to work it out from a field that quietly wants a URL.
 */
export default function Portfolio() {
  const [projects, setProjects] = useState<PortfolioProject[]>([])
  const [editing, setEditing] = useState<number | 'new' | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    workerService.myPortfolio()
      .then(setProjects)
      .catch((err) => setError((err as Error).message))
      .finally(() => setLoading(false))
  }, [])

  const reload = () => workerService.myPortfolio().then(setProjects)

  const save = async (input: PortfolioInput) => {
    if (editing === 'new') {
      await workerService.addProject({ ...input, position: projects.length })
    } else if (editing !== null) {
      const existing = projects.find((p) => p.id === editing)
      await workerService.saveProject(editing, { ...input, position: existing?.position ?? 0 })
    }
    await reload()
    setEditing(null)
  }

  const remove = async (project: PortfolioProject) => {
    if (!window.confirm(`Remove "${project.title}" and its pictures from your portfolio?`)) return
    setError('')
    try {
      await workerService.removeProject(project.id)
      await reload()
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (loading) return <main className="page"><p>Loading…</p></main>

  return (
    <main className="page">
      <h1>Your portfolio</h1>
      <p className="muted">Work you have finished. This is what a client looks at first.</p>

      {error && <p className="error">{error}</p>}

      <div className="jobs">
        {projects.map((project) => (
          <article key={project.id} className="job">
            {editing === project.id ? (
              <ProjectFields
                initial={{
                  title: project.title,
                  description: project.description,
                  completed_on: project.completed_on ?? '',
                  images: project.images.map((i) => ({ url: i.url, caption: i.caption })),
                }}
                submitLabel="Save"
                onSubmit={save}
                onCancel={() => setEditing(null)}
              />
            ) : (
              <>
                <h2>{project.title}</h2>
                {project.completed_on && (
                  <p className="muted">Finished {formatDate(project.completed_on)}</p>
                )}
                {project.description && <p>{project.description}</p>}
                <Gallery images={project.images} />
                <div className="form-actions">
                  <button className="btn btn-quiet" onClick={() => setEditing(project.id)}>Edit</button>
                  <button className="btn btn-quiet" onClick={() => remove(project)}>Remove</button>
                </div>
              </>
            )}
          </article>
        ))}
      </div>

      {editing === 'new' ? (
        <section className="panel">
          <h2>Add a project</h2>
          <ProjectFields
            initial={EMPTY}
            submitLabel="Add it"
            onSubmit={save}
            onCancel={() => setEditing(null)}
          />
        </section>
      ) : (
        <p><button className="btn" onClick={() => setEditing('new')}>Add a project</button></p>
      )}

      {projects.length === 0 && editing !== 'new' && (
        <p className="muted">You have not added any work yet.</p>
      )}
    </main>
  )
}

function ProjectFields({
  initial, submitLabel, onSubmit, onCancel,
}: {
  initial: PortfolioInput
  submitLabel: string
  onSubmit: (input: PortfolioInput) => Promise<void>
  onCancel: () => void
}) {
  const [fields, setFields] = useState<PortfolioInput>(initial)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const set = (key: 'title' | 'description' | 'completed_on') => (value: string) =>
    setFields((f) => ({ ...f, [key]: value }))

  const setImage = (index: number, key: 'url' | 'caption', value: string) =>
    setFields((f) => ({
      ...f,
      images: f.images.map((img, i) => (i === index ? { ...img, [key]: value } : img)),
    }))

  const addImage = () =>
    setFields((f) => ({ ...f, images: [...f.images, { url: '', caption: '' }] }))

  const removeImage = (index: number) =>
    setFields((f) => ({ ...f, images: f.images.filter((_, i) => i !== index) }))

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      // A row the worker added and left blank is not a picture, so it does
      // not get sent - the URL is required and it would be refused.
      await onSubmit({ ...fields, images: fields.images.filter((i) => i.url.trim() !== '') })
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
        <span>What you built</span>
        <input
          value={fields.title}
          onChange={(e) => set('title')(e.target.value)}
          placeholder="Walk-in wardrobe in Quezon City"
          maxLength={140}
          required
        />
      </label>

      <label>
        <span>About the job</span>
        <textarea
          value={fields.description}
          onChange={(e) => set('description')(e.target.value)}
          rows={4}
          placeholder="Materials, what was tricky, how long it took."
          maxLength={4000}
        />
      </label>

      <label>
        <span>Finished on</span>
        <input
          type="date"
          value={fields.completed_on}
          onChange={(e) => set('completed_on')(e.target.value)}
        />
      </label>

      <fieldset className="images">
        <legend>Pictures</legend>
        <p className="muted">
          kantowork does not host pictures yet, so paste the web address of an image you
          have online already — it has to start with http:// or https://.
        </p>

        {fields.images.map((image, i) => (
          <div key={i} className="image-row">
            <label>
              <span>Web address</span>
              <input
                value={image.url}
                onChange={(e) => setImage(i, 'url', e.target.value)}
                placeholder="https://…/wardrobe.jpg"
                maxLength={2000}
              />
            </label>
            <label>
              <span>Caption</span>
              <input
                value={image.caption}
                onChange={(e) => setImage(i, 'caption', e.target.value)}
                placeholder="Doors closed"
                maxLength={200}
              />
            </label>
            <button className="btn btn-quiet" type="button" onClick={() => removeImage(i)}>
              Remove
            </button>
          </div>
        ))}

        {fields.images.length < 12 && (
          <button className="btn btn-quiet" type="button" onClick={addImage}>
            Add a picture
          </button>
        )}
      </fieldset>

      <div className="form-actions">
        <button className="btn" type="submit" disabled={busy}>
          {busy ? 'Saving…' : submitLabel}
        </button>
        <button className="btn btn-quiet" type="button" onClick={onCancel}>Cancel</button>
      </div>
    </form>
  )
}
