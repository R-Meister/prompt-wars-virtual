import { useEffect, useState } from 'react'
import { collection, limit, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db, firebaseReady } from '../lib/firebase'

export function useLiveZones(enabled) {
  const [zones, setZones] = useState([])
  const [alerts, setAlerts] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(Boolean(enabled))
  const [error, setError] = useState('')

  useEffect(() => {
    if (!enabled || !firebaseReady || !db) {
      return undefined
    }

    const zonesQuery = query(collection(db, 'zones'), orderBy('score', 'desc'), limit(6))
    const alertsQuery = query(collection(db, 'alerts'), orderBy('createdAt', 'desc'), limit(5))
    const recommendationsQuery = query(
      collection(db, 'recommendations'),
      orderBy('generatedAt', 'desc'),
      limit(6),
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

    const unsubRecommendations = onSnapshot(
      recommendationsQuery,
      (snapshot) => {
        setRecommendations(snapshot.docs.map((item) => ({ id: item.id, ...item.data() })))
      },
      (err) => {
        setError(err.message)
      },
    )

    return () => {
      unsubZones()
      unsubAlerts()
      unsubRecommendations()
    }
  }, [enabled])

  return { zones, alerts, recommendations, loading, error }
}
