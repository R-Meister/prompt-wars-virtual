const roles = ['viewer', 'admin']
const allowedDensities = ['low', 'medium', 'high', 'critical']

function toSafeString(value) {
  return String(value || '').trim()
}

function sanitizeSimulationEvent(raw = {}, admin) {
  const zoneId = toSafeString(raw.zoneId)
  const density = toSafeString(raw.density).toLowerCase()
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

function sanitizeRoleUpdate(raw = {}) {
  const uid = toSafeString(raw.uid)
  const role = toSafeString(raw.role)

  if (!uid) {
    throw new Error('uid is required')
  }

  if (!roles.includes(role)) {
    throw new Error('role must be viewer|admin')
  }

  return { uid, role }
}

module.exports = {
  roles,
  allowedDensities,
  sanitizeRoleUpdate,
  sanitizeSimulationEvent,
}
