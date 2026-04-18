const test = require('node:test')
const assert = require('node:assert/strict')

const { sanitizeRoleUpdate } = require('../src/validation')

test('sanitizeRoleUpdate validates role and uid', () => {
  const result = sanitizeRoleUpdate({ uid: 'abc123', role: 'admin' })
  assert.equal(result.uid, 'abc123')
  assert.equal(result.role, 'admin')
})

test('sanitizeRoleUpdate rejects invalid role', () => {
  assert.throws(() => sanitizeRoleUpdate({ uid: 'abc123', role: 'owner' }), /viewer\|admin/)
})
