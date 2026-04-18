function shouldCallVertex({ previousZone, nextZone, enabled }) {
  if (!enabled) {
    return false
  }

  if (!previousZone) {
    return Number(nextZone.score || 0) >= 85
  }

  const prevScore = Number(previousZone.score || 0)
  const nextScore = Number(nextZone.score || 0)
  const delta = Math.abs(nextScore - prevScore)

  return nextScore >= 85 || delta >= 10
}

async function requestVertexSuggestion({ endpoint, token, zoneState }) {
  if (!endpoint || !token) {
    throw new Error('missing vertex config')
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      instances: [
        {
          zoneId: zoneState.zoneId,
          score: Number(zoneState.score || 0),
          queueMinutes: Number(zoneState.queueMinutes || 0),
          estimatedQueueMinutes: Number(zoneState.estimatedQueueMinutes || 0),
          trend: zoneState.trend || 'stable',
        },
      ],
    }),
  })

  if (!response.ok) {
    throw new Error(`vertex request failed (${response.status})`)
  }

  const payload = await response.json()
  const first = payload?.predictions?.[0]
  if (!first || typeof first !== 'object') {
    throw new Error('vertex response missing prediction payload')
  }

  return {
    action: first.action || 'monitor',
    headline: first.headline || `Monitor ${zoneState.zoneId}`,
    guidance: first.guidance || 'Continue monitoring live telemetry.',
    attendeeMessage:
      first.attendeeMessage || 'Follow stadium guidance updates for the fastest movement route.',
    operatorAction: first.operatorAction || 'Monitor telemetry and respond to escalations as needed.',
    expectedQueueDeltaMinutes: Number(first.expectedQueueDeltaMinutes || 0),
    severity: first.severity || zoneState.alertLevel || 'green',
  }
}

module.exports = {
  requestVertexSuggestion,
  shouldCallVertex,
}
