const densityByScore = [
  { max: 25, value: 'low' },
  { max: 55, value: 'medium' },
  { max: 80, value: 'high' },
  { max: 100, value: 'critical' },
]

function resolveDensity(score) {
  return densityByScore.find((entry) => score <= entry.max).value
}

function makeRandomEvent(zoneId) {
  const base = Math.floor(Math.random() * 101)
  const queueMinutes = Math.max(1, Math.floor(base / 4) + Math.floor(Math.random() * 8))
  const footfall = 120 + base * 5 + Math.floor(Math.random() * 120)

  return {
    zoneId,
    density: resolveDensity(base),
    queueMinutes,
    footfall,
  }
}

function generateBatch(zoneIds = []) {
  if (!Array.isArray(zoneIds) || zoneIds.length === 0) {
    throw new Error('zoneIds must be a non-empty array')
  }

  return zoneIds.map((zoneId) => makeRandomEvent(zoneId))
}

module.exports = {
  generateBatch,
  makeRandomEvent,
}
