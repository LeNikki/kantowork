import { Link } from 'react-router-dom'

export default function Landing() {
  return (
    <main>
      <section className="hero">
        <h1>Work that needs skilled hands.</h1>
        <p>
          kantowork puts tradespeople and the people who need them in one place.
          Say what you need built, fixed or fitted — or show what you can make,
          and find the people looking for it.
        </p>
        {/* One way in for each side. Both lead to the same form, which is
            where the choice between them is actually made. */}
        <div className="hero-actions">
          <Link className="btn btn-lg" to="/signup">I need work done</Link>
          <Link className="btn btn-lg btn-quiet" to="/signup">I have a skill to offer</Link>
        </div>
      </section>

      <section className="features">
        <div>
          <h2>Show what you can build</h2>
          <p>
            A profile that says your trade, what you charge and how long you have been
            at it, with pictures of the work you have finished.
          </p>
        </div>
        <div>
          <h2>Say what you need doing</h2>
          <p>
            Post the job with the details, the place and what you are willing to pay.
            Workers who want it apply to you.
          </p>
        </div>
        <div>
          <h2>Choose who does it</h2>
          <p>
            Read an applicant&rsquo;s profile, look at what they have already built, and
            give the job to whoever fits it.
          </p>
        </div>
      </section>
    </main>
  )
}
