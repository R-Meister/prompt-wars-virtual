const { generateBatch } = require('../src/simulator')

const endpoint =
  process.env.SIMULATION_ENDPOINT ||
  'http://127.0.0.1:5001/crowdsense-ai-dev/us-central1/ingestSimulationEvent'

const rounds = Number(process.env.SIMULATION_ROUNDS || 1)
const zones = String(
  process.env.SIMULATION_ZONES || 'north-gate,food-court-a,east-exit,west-entry',
)
  .split(',')
  .map((zone) => zone.trim())
  .filter(Boolean)

async function pushBatch() {
  const events = generateBatch(zones)

  const responses = await Promise.all(
    events.map(async (event) => {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(event),
      })

      const payload = await response.json()
      if (!response.ok) {
        throw new Error(payload.error || 'simulation push failed')
      }

      return payload
    }),
  )

  return responses
}

async function run() {
  if (Number.isNaN(rounds) || rounds < 1) {
    throw new Error('SIMULATION_ROUNDS must be a positive number')
  }

  for (let i = 0; i < rounds; i += 1) {
    const payloads = await pushBatch()
    payloads.forEach((payload) => {
      console.log(
        `[round ${i + 1}] zone=${payload.zoneId} score=${payload.score} alert=${payload.alertLevel}`,
      )
    })
  }
}

run().catch((error) => {
  console.error(error.message)
  process.exit(1)
})
