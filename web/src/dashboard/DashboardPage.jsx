import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuthState } from '../auth/useAuthState'
import { useLiveZones } from './useLiveZones'
import { firebaseReady } from '../lib/firebase'
import { statCardsFromZones, toPrettyDensity, toneFromAlert } from '../shared/utils/zone'

function recommendationFromData(zones, recommendations) {
  if (recommendations.length) {
    return recommendations[0].guidance || 'Continue monitoring live telemetry.'
  }

  if (!zones.length) {
    return 'No live zone telemetry yet. Use the simulator script to ingest events.'
  }

  const hottest = zones[0]
  if ((hottest.score || 0) >= 85) {
    return `Reroute attendees away from ${hottest.zoneId} for 10 minutes and trigger localized alerts.`
  }

  return `Monitor ${hottest.zoneId}; current score ${hottest.score || 0} remains below critical threshold.`
}

function localizedAlertMessage(alert, locale) {
  const localized = alert?.localizedMessages
  if (localized && localized[locale]) {
    return localized[locale]
  }

  return alert?.message || 'Alert issued'
}

export function DashboardPage() {
  const { user, claims, loading: authLoading, error: authError, login, logout } = useAuthState()
  const {
    zones,
    alerts,
    recommendations,
    loading: zonesLoading,
    error: zoneError,
  } = useLiveZones(Boolean(user))
  const [locale, setLocale] = useState('en')

  const stats = useMemo(() => statCardsFromZones(zones), [zones])
  const recommendation = useMemo(
    () => recommendationFromData(zones, recommendations),
    [zones, recommendations],
  )

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
          <label className="locale-picker" htmlFor="locale-select">
            Language
            <select
              id="locale-select"
              value={locale}
              onChange={(event) => setLocale(event.target.value)}
            >
              <option value="en">English</option>
              <option value="es">Espanol</option>
              <option value="fr">Francais</option>
              <option value="hi">Hindi</option>
            </select>
          </label>
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
          <p className="grid-placeholder" role="status" aria-live="polite">
            Loading live telemetry...
          </p>
        ) : null}

        {!authLoading && !user ? (
          <p className="grid-placeholder" role="status" aria-live="polite">
            Sign in to view live zones and alerts.
          </p>
        ) : null}

        {user && !zonesLoading && zones.length === 0 ? (
          <p className="grid-placeholder" role="status" aria-live="polite">
            No zones yet. Run the simulation push script.
          </p>
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
              Estimated Queue <strong>{zone.estimatedQueueMinutes || zone.queueMinutes || 0} min</strong>
            </p>
            <p>
              Score <strong>{zone.score || 0}</strong>
            </p>
            <p>
              Alert <strong>{zone.alertLevel || 'green'}</strong>
            </p>
            <p>
              Trend <strong>{zone.trend || 'stable'}</strong>
            </p>
          </article>
        ))}
      </section>

      <section className="recommendation-panel" aria-label="System recommendation">
        <h2>System Recommendation</h2>
        <p>{recommendation}</p>
      </section>

      <section className="alert-panel" aria-label="Recent alerts" aria-live="polite">
        <h2>Recent Alerts</h2>
        {alerts.length === 0 ? (
          <p>No active alerts.</p>
        ) : (
          <ul>
            {alerts.map((alert) => (
              <li key={alert.id}>
                <strong>{alert.zoneId}</strong> - {localizedAlertMessage(alert, locale)} ({alert.level})
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
