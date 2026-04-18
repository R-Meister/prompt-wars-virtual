const test = require('node:test')
const assert = require('node:assert/strict')

const {
  estimateQueueMinutes,
  fallbackRecommendation,
  queueConfidenceFromEvent,
} = require('../src/recommendations')

test('critical event yields actionable operator recommendation', () => {
  const event = {
    zoneId: 'north-gate',
    density: 'critical',
    queueMinutes: 16,
    footfall: 1300,
    score: 90,
  }

  const estimatedQueueMinutes = estimateQueueMinutes(event)
  const queueConfidence = queueConfidenceFromEvent(event)
  const recommendation = fallbackRecommendation({ ...event, estimatedQueueMinutes })

  assert.equal(recommendation.action, 'reroute')
  assert.ok(recommendation.operatorAction.includes('Dispatch'))
  assert.ok(recommendation.expectedQueueDeltaMinutes > 0)
  assert.ok(queueConfidence > 0)
})
