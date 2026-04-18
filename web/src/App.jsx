import { Link, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'

function LandingPage() {
  const navItems = ['Timeline', 'Tracks', 'Features', 'Prizes', 'FAQ']

  const statCards = [
    { value: '48', label: 'Hours to Build', tone: 'lime' },
    { value: '92%', label: 'Surge Precision', tone: 'orange' },
    { value: '1.2s', label: 'Target LCP', tone: 'light' },
  ]

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

  return (
    <div className="page-shell">
      <header className="topbar">
        <div className="brand">
          CrowdSense <span className="brand-mark">AI</span>
        </div>
        <nav className="top-nav" aria-label="Primary">
          {navItems.map((item) => (
            <a key={item} href="#" className="nav-pill">
              {item}
            </a>
          ))}
        </nav>
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
            Real-time crowd intelligence platform for large venues. Predict surge risk,
            reduce queue stress, and send multilingual alerts before disruption begins.
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
          {statCards.map((card) => (
            <article key={card.label} className={`stat-card stat-${card.tone}`}>
              <p className="stat-value">{card.value}</p>
              <p className="stat-label">{card.label}</p>
            </article>
          ))}
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

function DashboardPage() {
  const zoneStats = [
    { zone: 'North Gate', density: 'High', queue: '18 min', tone: 'danger' },
    { zone: 'Food Court A', density: 'Medium', queue: '9 min', tone: 'warning' },
    { zone: 'East Exit', density: 'Low', queue: '3 min', tone: 'safe' },
  ]

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="dashboard-eyebrow">Live Control Room</p>
          <h1 className="dashboard-title">CrowdSense Dashboard</h1>
        </div>
        <Link className="btn btn-secondary" to="/">
          Back to Landing
        </Link>
      </header>

      <section className="dashboard-grid" aria-label="Live status overview">
        {zoneStats.map((zone) => (
          <article key={zone.zone} className={`zone-card zone-${zone.tone}`}>
            <h2>{zone.zone}</h2>
            <p>
              Density <strong>{zone.density}</strong>
            </p>
            <p>
              Queue <strong>{zone.queue}</strong>
            </p>
          </article>
        ))}
      </section>

      <section className="recommendation-panel" aria-label="System recommendation">
        <h2>System Recommendation</h2>
        <p>
          Reroute incoming attendees from North Gate to East Entry for the next 12
          minutes. Trigger multilingual advisory in English and Hindi.
        </p>
      </section>
    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
