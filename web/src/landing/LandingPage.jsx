import { Link } from 'react-router-dom'

const featureCards = [
  {
    title: 'Live Congestion Map',
    description: 'See zone density, bottlenecks, and movement trends in real time.',
  },
  {
    title: 'Queue Intelligence',
    description: 'Predict long lines before they form and reroute footfall instantly.',
  },
  {
    title: 'Localized Alerts',
    description: 'Push precise multilingual advisories to the right audience at the right time.',
  },
]

export function LandingPage() {
  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          CrowdSense <span className="brand-mark">AI</span>
        </div>
        <Link to="/dashboard" className="register-btn">
          Launch Dashboard
        </Link>
      </header>

      <main className="hero-grid">
        <section className="hero-copy">
          <p className="eyebrow">Smart Stadium Operations</p>
          <h1>
            CrowdSense<span className="hero-year"> '26</span>
          </h1>
          <p className="venue-tag">Built for organizers, operators, and safety teams</p>
          <p className="hero-text">
            Real-time crowd intelligence platform for large venues. Predict surge risk, reduce queue
            stress, and send multilingual alerts before disruption begins.
          </p>

          <div className="hero-actions">
            <Link className="btn btn-primary" to="/dashboard">
              Start Simulation
            </Link>
            <a className="btn btn-secondary" href="#features">
              Explore Architecture
            </a>
          </div>

          <div className="hero-spark" aria-hidden="true">
            STAR
          </div>
        </section>

        <section className="stats-column" aria-label="Platform metrics">
          <article className="stat-card stat-lime">
            <p className="stat-value">Live</p>
            <p className="stat-label">Realtime Sync</p>
          </article>
          <article className="stat-card stat-orange">
            <p className="stat-value">Role</p>
            <p className="stat-label">Secure Access</p>
          </article>
          <article className="stat-card stat-light">
            <p className="stat-value">AI</p>
            <p className="stat-label">Predictive Routing</p>
          </article>
        </section>
      </main>

      <section id="features" className="feature-strip" aria-label="Key capabilities">
        {featureCards.map((feature) => (
          <article key={feature.title} className="feature-card">
            <h2>{feature.title}</h2>
            <p>{feature.description}</p>
          </article>
        ))}
      </section>

      <section className="phase-strip" aria-label="Build phases">
        <p>Phase 1: Data + Functions</p>
        <p>Phase 2: Prediction Engine</p>
        <p>Phase 3: Real-Time Dashboard</p>
        <p>Phase 4-6: Accessibility, Security, Performance</p>
      </section>
    </div>
  )
}
