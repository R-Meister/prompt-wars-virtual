const test = require('node:test')
const assert = require('node:assert/strict')

const { generateBatch } = require('../src/simulator')

test('generateBatch returns one event per zone', () => {
  const zones = ['north-gate', 'food-court-a', 'east-exit']
  const batch = generateBatch(zones)

  assert.equal(batch.length, zones.length)
  batch.forEach((event, idx) => {
    assert.equal(event.zoneId, zones[idx])
    assert.ok(['low', 'medium', 'high', 'critical'].includes(event.density))
    assert.ok(event.queueMinutes > 0)
    assert.ok(event.footfall >= 120)
  })
})

test('generateBatch rejects empty zone list', () => {
  assert.throws(() => generateBatch([]), /non-empty array/)
})
