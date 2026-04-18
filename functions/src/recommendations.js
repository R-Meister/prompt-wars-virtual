function queueConfidenceFromEvent(event = {}) {
  const score = Number(event.score || 0)
  const footfall = Number(event.footfall || 0)

  const confidence = Math.min(0.99, 0.45 + score / 180 + Math.min(footfall, 3000) / 12000)

  return Number(confidence.toFixed(2))
}

function estimateQueueMinutes(event = {}) {
  const queueMinutes = Number(event.queueMinutes || 0)
  const densityFactor =
    {
      low: 0.95,
      medium: 1.05,
      high: 1.2,
      critical: 1.35,
    }[event.density] || 1

  const footfallPressure = Math.min(18, Number(event.footfall || 0) / 130)
  const estimated = Math.round(queueMinutes * densityFactor + footfallPressure)

  return Math.max(0, estimated)
}

function calculateTrend(previousZone = {}, nextZone = {}) {
  const prevScore = Number(previousZone.score || 0)
  const nextScore = Number(nextZone.score || 0)
  const delta = nextScore - prevScore

  if (delta >= 8) {
    return 'surging'
  }

  if (delta <= -8) {
    return 'easing'
  }

  return 'stable'
}

function fallbackRecommendation(zoneState = {}) {
  const score = Number(zoneState.score || 0)
  const estimatedQueueMinutes = Number(zoneState.estimatedQueueMinutes || zoneState.queueMinutes || 0)
  const alternateRouteByZone = {
    'north-gate': 'west-entry',
    'west-entry': 'east-exit',
    'food-court-a': 'food-court-b',
    'east-exit': 'north-gate',
  }
  const alternateRoute = alternateRouteByZone[zoneState.zoneId] || 'nearest-open-gate'

  if (score >= 85) {
    return {
      action: 'reroute',
      headline: `Reroute traffic away from ${zoneState.zoneId}`,
      guidance:
        'Dispatch ground staff, update signage, and send multilingual advisory for the next 10 minutes.',
      attendeeMessage:
        'This zone is temporarily crowded. Follow steward guidance to the nearest alternate route.',
      operatorAction: `Dispatch two stewards and update signage toward ${alternateRoute}.`,
      rerouteZone: alternateRoute,
      expectedQueueDeltaMinutes: Math.max(3, Math.round(estimatedQueueMinutes * 0.2)),
      severity: 'red',
    }
  }

  if (score >= 60) {
    return {
      action: 'preemptive-dispatch',
      headline: `Queue pressure rising at ${zoneState.zoneId}`,
      guidance: 'Stage one queue marshal and prepare a soft reroute message.',
      attendeeMessage: 'Expect moderate wait. Consider nearby concession points with shorter lines.',
      operatorAction: 'Pre-stage one marshal and prepare multilingual soft reroute advisory.',
      rerouteZone: alternateRoute,
      expectedQueueDeltaMinutes: Math.max(2, Math.round(estimatedQueueMinutes * 0.12)),
      severity: 'amber',
    }
  }

  return {
    action: 'monitor',
    headline: `${zoneState.zoneId} remains stable`,
    guidance: 'Continue passive monitoring; no intervention required.',
    attendeeMessage: 'Conditions are normal. Continue through standard route guidance.',
    operatorAction: 'No intervention required. Maintain routine observation.',
    rerouteZone: zoneState.zoneId,
    expectedQueueDeltaMinutes: 0,
    severity: 'green',
  }
}

module.exports = {
  calculateTrend,
  estimateQueueMinutes,
  fallbackRecommendation,
  queueConfidenceFromEvent,
}
