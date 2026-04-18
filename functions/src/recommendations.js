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

  if (score >= 85) {
    return {
      action: 'reroute',
      headline: `Reroute traffic away from ${zoneState.zoneId}`,
      guidance:
        'Dispatch ground staff, update signage, and send multilingual advisory for the next 10 minutes.',
      severity: 'red',
    }
  }

  if (score >= 60) {
    return {
      action: 'preemptive-dispatch',
      headline: `Queue pressure rising at ${zoneState.zoneId}`,
      guidance: 'Stage one queue marshal and prepare a soft reroute message.',
      severity: 'amber',
    }
  }

  return {
    action: 'monitor',
    headline: `${zoneState.zoneId} remains stable`,
    guidance: 'Continue passive monitoring; no intervention required.',
    severity: 'green',
  }
}

module.exports = {
  calculateTrend,
  estimateQueueMinutes,
  fallbackRecommendation,
  queueConfidenceFromEvent,
}
