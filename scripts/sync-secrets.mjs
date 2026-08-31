import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

console.log('🔒 Synchronizing Secrets to Cloudflare Workers...')
console.log('==================================================')

const envPath = path.resolve(process.cwd(), '.env')
if (!fs.existsSync(envPath)) {
  console.error('❌ .env file not found. Create your .env file first.')
  process.exit(1)
}

const envContent = fs.readFileSync(envPath, 'utf-8')
const envVars = {}
envContent.split('\n').forEach((line) => {
  const trimmed = line.trim()
  if (!trimmed || trimmed.startsWith('#')) return
  const eqIdx = trimmed.indexOf('=')
  if (eqIdx !== -1) {
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && val) {
      envVars[key] = val
    }
  }
})

const entries = Object.entries(envVars)
console.log(`Found ${entries.length} environment variables in .env.\n`)

for (const [key, value] of entries) {
  // Skip obvious dummy placeholder templates
  if (value.startsWith('your-') || value.includes('your-supabase') || value.includes('your-appwrite')) {
    console.log(`⏭️  Skipping placeholder: ${key}`)
    continue
  }

  try {
    console.log(`🔑 Syncing secret: ${key}...`)
    // Pipe value safely into wrangler secret put stdin without exposing in process list
    execSync(`npx wrangler secret put ${key}`, {
      input: value,
      stdio: ['pipe', 'inherit', 'inherit'],
    })
  } catch (err) {
    console.warn(`⚠️ Could not set secret ${key}: ${err.message}`)
  }
}

console.log('\n✅ All environment variables from .env synchronized to Cloudflare Workers!')
console.log('==================================================')
