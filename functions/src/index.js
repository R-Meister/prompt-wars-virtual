const { onRequest } = require('firebase-functions/v2/https')
const { logger } = require('firebase-functions')
const admin = require('firebase-admin')

if (!admin.apps.length) {
  admin.initializeApp()
}

const db = admin.firestore()
const roles = ['viewer', 'admin']

const allowedDensities = ['low', 'medium', 'high', 'critical']

function sanitizeEvent(raw = {}) {
  const zoneId = String(raw.zoneId || '').trim()
  const density = String(raw.density || '').toLowerCase().trim()
  const queueMinutes = Number(raw.queueMinutes)
  const footfall = Number(raw.footfall)

  if (!zoneId) {
    throw new Error('zoneId is required')
  }

  if (!allowedDensities.includes(density)) {
    throw new Error('density must be low|medium|high|critical')
  }

  if (Number.isNaN(queueMinutes) || queueMinutes < 0 || queueMinutes > 240) {
    throw new Error('queueMinutes must be between 0 and 240')
  }

  if (Number.isNaN(footfall) || footfall < 0) {
    throw new Error('footfall must be a non-negative number')
  }

  return {
    zoneId,
    density,
    queueMinutes,
    footfall,
    capturedAt: admin.firestore.FieldValue.serverTimestamp(),
  }
}

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
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Use POST' })
      return
    }

    const payload = sanitizeEvent(req.body)
    const score = congestionScore(payload)
    const alertLevel = score >= 85 ? 'red' : score >= 60 ? 'amber' : 'green'

    const zoneRef = db.collection('zones').doc(payload.zoneId)
    const ingestRef = db.collection('simulationEvents').doc()

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
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        },
        { merge: true },
      )

      tx.set(ingestRef, payload)

      if (alertLevel !== 'green') {
        const alertRef = db.collection('alerts').doc()
        tx.set(alertRef, {
          zoneId: payload.zoneId,
          level: alertLevel,
          score,
          message:
            alertLevel === 'red'
              ? 'Critical congestion detected. Reroute attendees now.'
              : 'Queue pressure rising. Prepare reroute advisory.',
          createdAt: admin.firestore.FieldValue.serverTimestamp(),
        })
      }
    })

    logger.info('simulation_event_ingested', {
      zoneId: payload.zoneId,
      score,
      alertLevel,
    })

    res.status(200).json({ ok: true, zoneId: payload.zoneId, score, alertLevel })
  } catch (error) {
    logger.error('simulation_ingest_failed', { message: error.message })
    res.status(400).json({ ok: false, error: error.message })
  }
})

exports.setUserRole = onRequest(async (req, res) => {
  try {
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

    const uid = String(req.body?.uid || '').trim()
    const role = String(req.body?.role || '').trim()

    if (!uid) {
      res.status(400).json({ ok: false, error: 'uid is required' })
      return
    }

    if (!roles.includes(role)) {
      res.status(400).json({ ok: false, error: 'role must be viewer|admin' })
      return
    }

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
