const test = require('node:test')
const assert = require('node:assert/strict')

const { shouldCallVertex } = require('../src/vertex')

test('shouldCallVertex returns false when disabled', () => {
  const result = shouldCallVertex({
    previousZone: { score: 40 },
    nextZone: { score: 90 },
    enabled: false,
  })

  assert.equal(result, false)
})

test('shouldCallVertex returns true on large score delta', () => {
  const result = shouldCallVertex({
    previousZone: { score: 30 },
    nextZone: { score: 45 },
    enabled: true,
  })

  assert.equal(result, true)
})

test('shouldCallVertex returns true on critical score', () => {
  const result = shouldCallVertex({
    previousZone: { score: 80 },
    nextZone: { score: 86 },
    enabled: true,
  })

  assert.equal(result, true)
})
