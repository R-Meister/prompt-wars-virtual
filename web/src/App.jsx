import { useEffect, useMemo, useState } from 'react'
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth'
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  doc,
} from 'firebase/firestore'
import { Link, Navigate, Route, Routes } from 'react-router-dom'
import { auth, db, firebaseReady } from './lib/firebase'
import './App.css'

const navItems = ['Timeline', 'Tracks', 'Features', 'Prizes', 'FAQ']

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

function useAuthState() {
  const [user, setUser] = useState(null)
  const [claims, setClaims] = useState({ role: 'viewer' })
  const [loading, setLoading] = useState(firebaseReady)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!firebaseReady || !auth) {
      setLoading(false)
      return undefined
    }

    const unsub = onAuthStateChanged(auth, async (nextUser) => {
      try {
        setUser(nextUser)

        if (!nextUser) {
          setClaims({ role: 'viewer' })
          setLoading(false)
          return
        }

        const token = await nextUser.getIdTokenResult(true)
        setClaims({ role: token.claims.role || 'viewer' })

        await setDoc(
          doc(db, 'profiles', nextUser.uid),
          {
            uid: nextUser.uid,
            email: nextUser.email || null,
            displayName: nextUser.displayName || null,
            photoURL: nextUser.photoURL || null,
            updatedAt: serverTimestamp(),
          },
          { merge: true },
        )
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    })

    return () => unsub()
  }, [])

  async function login() {
    setError('')
    try {
      if (!auth) {
        throw new Error('Firebase Auth is not configured. Add web/.env.local values.')
      }

      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (err) {
      setError(err.message)
    }
  }

  async function logout() {
    setError('')
    try {
      if (!auth) {
        return
      }

      await signOut(auth)
    } catch (err) {
      setError(err.message)
    }
  }

  return { user, claims, loading, error, login, logout }
}

function useLiveZones(enabled) {
  const [zones, setZones] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled || !firebaseReady || !db) {
      setLoading(false)
      return undefined
    }

    const zonesQuery = query(collection(db, 'zones'), orderBy('score', 'desc'), limit(6))
    const alertsQuery = query(
      collection(db, 'alerts'),
      orderBy('createdAt', 'desc'),
      limit(5),
    )

    const unsubZones = onSnapshot(
      zonesQuery,
      (snapshot) => {
        setZones(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )

    const unsubAlerts = onSnapshot(
      alertsQuery,
      (snapshot) => {
        setAlerts(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      },
      (err) => {
        setError(err.message)
      },
    )

    return () => {
      unsubZones()
      unsubAlerts()
    }
  }, [enabled])

  return { zones, alerts, loading, error }
}

function toneFromAlert(alertLevel = 'green') {
  if (alertLevel === 'red') {
    return 'danger'
  }

  if (alertLevel === 'amber') {
    return 'warning'
  }

  return 'safe'
}

function toPrettyDensity(value = 'low') {
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function statCardsFromZones(zones) {
  if (!zones.length) {
    return [
      { value: '0', label: 'Active Zones', tone: 'light' },
      { value: '0m', label: 'Peak Queue', tone: 'orange' },
      { value: '0', label: 'Critical Zones', tone: 'lime' },
    ]
  }

  const maxQueue = zones.reduce((max, zone) => Math.max(max, zone.queueMinutes || 0), 0)
  const criticalCount = zones.filter((zone) => zone.alertLevel === 'red').length

  return [
    { value: String(zones.length), label: 'Active Zones', tone: 'light' },
    { value: `${maxQueue}m`, label: 'Peak Queue', tone: 'orange' },
    { value: String(criticalCount), label: 'Critical Zones', tone: 'lime' },
  ]
}

function LandingPage() {
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

function DashboardPage() {
  const { user, claims, loading: authLoading, error: authError, login, logout } = useAuthState()
  const {
    zones,
    alerts,
    loading: zonesLoading,
    error: zoneError,
  } = useLiveZones(Boolean(user))

  const stats = useMemo(() => statCardsFromZones(zones), [zones])

  const recommendation = useMemo(() => {
    if (!zones.length) {
      return 'No live zone telemetry yet. Use the simulator script to ingest events.'
    }

    const hottest = zones[0]
    if (!hottest) {
      return 'No live zone telemetry yet. Use the simulator script to ingest events.'
    }

    if ((hottest.score || 0) >= 85) {
      return `Reroute attendees away from ${hottest.zoneId} for 10 minutes and trigger localized alerts.`
    }

    return `Monitor ${hottest.zoneId}; current score ${hottest.score || 0} remains below critical threshold.`
  }, [zones])

  const statusMessage =
    authError || zoneError || (firebaseReady ? '' : 'Missing Firebase env vars in web/.env.local')

  return (
    <div className="dashboard-shell">
      <header className="dashboard-topbar">
        <div>
          <p className="dashboard-eyebrow">Live Control Room</p>
          <h1 className="dashboard-title">CrowdSense Dashboard</h1>
          <p className="dashboard-userline">
            {user ? `Signed in as ${user.email || user.uid}` : 'Not signed in'}
          </p>
          <p className="dashboard-userline">Role: {claims.role || 'viewer'}</p>
        </div>
        <div className="dashboard-actions">
          {user ? (
            <button type="button" className="btn btn-secondary" onClick={logout}>
              Sign Out
            </button>
          ) : (
            <button
              type="button"
              className="btn btn-primary"
              onClick={login}
              disabled={!firebaseReady}
            >
              Sign In With Google
            </button>
          )}
          <Link className="btn btn-secondary" to="/">
            Back to Landing
          </Link>
        </div>
      </header>

      {statusMessage ? <p className="status-banner">{statusMessage}</p> : null}

      <section className="dashboard-metrics" aria-label="Dashboard stats">
        {stats.map((card) => (
          <article key={card.label} className={`stat-card stat-${card.tone}`}>
            <p className="stat-value">{card.value}</p>
            <p className="stat-label">{card.label}</p>
          </article>
        ))}
      </section>

      <section className="dashboard-grid" aria-label="Live status overview">
        {authLoading || zonesLoading ? (
          <p className="grid-placeholder">Loading live telemetry...</p>
        ) : null}

        {!authLoading && !user ? (
          <p className="grid-placeholder">Sign in to view live zones and alerts.</p>
        ) : null}

        {user && !zonesLoading && zones.length === 0 ? (
          <p className="grid-placeholder">No zones yet. Run the simulation push script.</p>
        ) : null}

        {zones.map((zone) => (
          <article key={zone.id} className={`zone-card zone-${toneFromAlert(zone.alertLevel)}`}>
            <h2>{zone.zoneId}</h2>
            <p>
              Density <strong>{toPrettyDensity(zone.density)}</strong>
            </p>
            <p>
              Queue <strong>{zone.queueMinutes || 0} min</strong>
            </p>
            <p>
              Score <strong>{zone.score || 0}</strong>
            </p>
            <p>
              Alert <strong>{zone.alertLevel || 'green'}</strong>
            </p>
          </article>
        ))}
      </section>

      <section className="recommendation-panel" aria-label="System recommendation">
        <h2>System Recommendation</h2>
        <p>{recommendation}</p>
      </section>

      <section className="alert-panel" aria-label="Recent alerts">
        <h2>Recent Alerts</h2>
        {alerts.length === 0 ? (
          <p>No active alerts.</p>
        ) : (
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>
                <strong>{alert.zoneId}</strong> - {alert.message || 'Alert issued'} ({alert.level})
              </li>
            ))}
          </ul>
        )}
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
