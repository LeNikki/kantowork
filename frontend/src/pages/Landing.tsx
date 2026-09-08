import { Link } from 'react-router-dom'

// TODO: replace this copy with what kantowork actually does.
export default function Landing() {
  return (
    <main>
      <section className="hero">
        <h1>Run your business in one place.</h1>
        <p>
          kantowork keeps your work, your records and your people together,
          so you spend less time chasing information and more time working.
        </p>
        <Link className="btn btn-lg" to="/signup">Create an account</Link>
      </section>

      <section className="features">
        <div>
          <h2>Everything together</h2>
          <p>One account, one place to look. No spreadsheets scattered across machines.</p>
        </div>
        <div>
          <h2>Built to grow</h2>
          <p>Add people as you need them, with roles that control what each can see.</p>
        </div>
        <div>
          <h2>Yours to keep</h2>
          <p>Your data lives in your own database, exportable whenever you want it.</p>
        </div>
      </section>
    </main>
  )
}
