const fs = require('node:fs')
const path = require('node:path')

const envExamplePath = path.join(__dirname, '..', '.env.example')
const content = fs.readFileSync(envExamplePath, 'utf8')

const requiredLines = ['ALLOW_EXTERNAL_APIS=false']
const missing = requiredLines.filter((line) => !content.includes(line))

if (missing.length > 0) {
  console.error(`Zero-cost guard check failed. Missing: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('Zero-cost guard check passed.')
