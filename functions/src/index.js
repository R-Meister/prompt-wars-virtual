const { onRequest } = require('firebase-functions/v2/https')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')
const {
  calculateTrend,
  estimateQueueMinutes,
  fallbackRecommendation,
  queueConfidenceFromEvent,
} = require('./recommendations')
const { buildLocalizedMessages } = require('./localization')
const { sanitizeRoleUpdate, sanitizeSimulationEvent } = require('./validation')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()

function congestionScore(event) {
  const densityWeight = {
    low: 10,
    medium: 35,
    high: 65,
    critical: 90,
  }

  const score =
    densityWeight[event.density] +
    Math.min(event.queueMinutes * 0.6, 50) +
    Math.min(event.footfall * 0.02, 40)

  return Math.min(Math.round(score), 100)
}

exports.ingestSimulationEvent = onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' })
      return
    }

    const payload = sanitizeSimulationEvent(req.body, admin)
    const score = congestionScore(payload)
    const alertLevel = score >= 85 ? 'red' : score >= 60 ? 'amber' : 'green'
    const estimatedQueueMinutes = estimateQueueMinutes({ ...payload, score })
    const queueConfidence = queueConfidenceFromEvent({ ...payload, score })

    const zoneRef = db.collection('zones').doc(payload.zoneId)
    const ingestRef = db.collection('simulationEvents').doc()
    const recommendationRef = db.collection('recommendations').doc(payload.zoneId)
    const existingZone = await zoneRef.get()
    const previousZone = existingZone.exists ? existingZone.data() : null
    const trend = calculateTrend(previousZone, { score })
    const fallback = fallbackRecommendation({ ...payload, score })

    const supportedLocales = ['en', 'es', 'fr', 'hi']
    const localizedMessages = await buildLocalizedMessages({
      db,
      baseMessage:
        alertLevel === 'red'
          ? 'Critical congestion detected. Reroute attendees now.'
          : 'Queue pressure rising. Prepare reroute advisory.',
      locales: supportedLocales,
      apiKey: process.env.GOOGLE_TRANSLATE_API_KEY,
      admin,
    })

    await db.runTransaction(async (tx) => {
      tx.set(
        zoneRef,
        {
          zoneId: payload.zoneId,
          density: payload.density,
          queueMinutes: payload.queueMinutes,
          footfall: payload.footfall,
          score,
          alertLevel,
          estimatedQueueMinutes,
          queueConfidence,
          trend,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      tx.set(ingestRef, payload)

      tx.set(
        recommendationRef,
        {
          zoneId: payload.zoneId,
          action: fallback.action,
          headline: fallback.headline,
          guidance: fallback.guidance,
          severity: fallback.severity,
          score,
          trend,
          generatedAt: admin.firestore.FieldValue.serverTimestamp(),
          source: 'deterministic-fallback',
        },
        { merge: true },
      )

      if (alertLevel !== 'green') {
        const alertRef = db.collection('alerts').doc()
        tx.set(alertRef, {
          zoneId: payload.zoneId,
          level: alertLevel,
          score,
          message: localizedMessages.en,
          localizedMessages,
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    })

    logger.info('simulation_event_ingested', {
      zoneId: payload.zoneId,
      score,
      alertLevel,
      estimatedQueueMinutes,
      queueConfidence,
      trend,
    })

    res.status(200).json({
      ok: true,
      zoneId: payload.zoneId,
      score,
      alertLevel,
      estimatedQueueMinutes,
      queueConfidence,
      trend,
      recommendation: fallback,
    })
  } catch (error) {
    logger.error('simulation_ingest_failed', { message: error.message })
    res.status(400).json({ ok: false, error: error.message })
  }
})

exports.setUserRole = onRequest(async (req, res) => {
  try {
    res.set('Access-Control-Allow-Origin', '*')
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS')
    if (req.method === 'OPTIONS') {
      res.status(204).send('')
      return
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' })
      return
    }

    const bootstrapSecret = process.env.ADMIN_BOOTSTRAP_SECRET
    const providedSecret = req.get('x-admin-bootstrap-secret')

    if (!bootstrapSecret || providedSecret !== bootstrapSecret) {
      res.status(403).json({ ok: false, error: 'Forbidden' })
      return
    }

    const { uid, role } = sanitizeRoleUpdate(req.body)

    await admin.auth().setCustomUserClaims(uid, { role })
    await db.collection('profiles').doc(uid).set(
      {
        uid,
        role,
        roleUpdatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true },
    )

    logger.info('user_role_updated', { uid, role })
    res.status(200).json({ ok: true, uid, role })
  } catch (error) {
    logger.error('set_user_role_failed', { message: error.message })
    res.status(500).json({ ok: false, error: error.message })
  }
})
