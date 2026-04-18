const test = require('node:test')
const assert = require('node:assert/strict')

const {
  calculateTrend,
  estimateQueueMinutes,
  fallbackRecommendation,
  queueConfidenceFromEvent,
} = require('../src/recommendations')

test('estimateQueueMinutes increases under pressure', () => {
  const result = estimateQueueMinutes({ density: 'critical', queueMinutes: 12, footfall: 900 })
  assert.ok(result > 12)
})

test('queue confidence is bounded and numeric', () => {
  const result = queueConfidenceFromEvent({ score: 95, footfall: 2200 })
  assert.ok(result >= 0)
  assert.ok(result <= 0.99)
})

test('calculateTrend returns surging when score jumps', () => {
  const result = calculateTrend({ score: 40 }, { score: 55 })
  assert.equal(result, 'surging')
})

test('fallbackRecommendation returns reroute at critical scores', () => {
  const result = fallbackRecommendation({ zoneId: 'north-gate', score: 90 })
  assert.equal(result.action, 'reroute')
  assert.equal(result.severity, 'red')
})
