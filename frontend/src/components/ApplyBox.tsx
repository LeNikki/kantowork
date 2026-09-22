import { useState, type FormEvent } from 'react'
import type { Application } from '../api'
import { applicationService } from '../services/applicationService'
import { formatMoney } from '../format'

/**
 * The worker's half of a job page. It is one of three things depending on
 * where they stand: a form, the application they already sent, or nothing at
 * all once the job is no longer taking any.
 */
export default function ApplyBox({
  jobId, jobOpen, application, onChange,
}: {
  jobId: number
  jobOpen: boolean
  application: Application | null
  onChange: (application: Application | null) => void
}) {
  const [message, setMessage] = useState('')
  const [amount, setAmount] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  const apply = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setBusy(true)
    try {
      onChange(await applicationService.apply(jobId, { cover_message: message, proposed_amount: amount }))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const withdraw = async () => {
    if (!application) return
    if (!window.confirm('Withdraw your application? You can apply again while the job is open.')) return
    setError('')
    setBusy(true)
    try {
      onChange(await applicationService.withdraw(application.id))
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  // An application that still stands. A withdrawn one is not one - it falls
  // through to the form below, which is how a worker applies again.
  if (application && application.status !== 'withdrawn') {
    return (
      <section className="panel">
        <h2>
          Your application
          <span className={`badge badge-${application.status}`}>{application.status}</span>
        </h2>
        {application.proposed_amount !== null && (
          <p className="muted">You offered {formatMoney(application.proposed_amount)}.</p>
        )}
        {application.cover_message && <p className="bio">{application.cover_message}</p>}
        {error && <p className="error">{error}</p>}

        {application.status === 'pending' && (
          <button className="btn btn-quiet" onClick={withdraw} disabled={busy}>
            Withdraw
          </button>
        )}
        {application.status === 'accepted' && (
          <p>You were chosen for this job. The client will be in touch.</p>
        )}
        {application.status === 'rejected' && (
          <p className="muted">The client went with someone else this time.</p>
        )}
      </section>
    )
  }

  if (!jobOpen) return null

  return (
    <section className="panel">
      <h2>Apply for this job</h2>
      <form className="form" onSubmit={apply}>
        {error && <p className="error">{error}</p>}

        <label>
          <span>Your message</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={5}
            placeholder="Why you are a good fit, and anything you want to ask."
            maxLength={4000}
          />
        </label>

        <label>
          <span>What you would charge</span>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            min={0}
            step="0.01"
            placeholder="Leave blank to discuss it"
          />
        </label>

        <div className="form-actions">
          <button className="btn" type="submit" disabled={busy}>
            {busy ? 'Sending…' : 'Apply'}
          </button>
        </div>
      </form>
    </section>
  )
}
