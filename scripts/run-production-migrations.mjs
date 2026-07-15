import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

const migrationURL = process.env.DATABASE_MIGRATION_URL?.trim()
if (!migrationURL) {
  console.error('DATABASE_MIGRATION_URL is required for production migrations.')
  process.exit(1)
}

const payloadCLI = resolve('node_modules/payload/bin.js')
const result = spawnSync(process.execPath, [payloadCLI, 'migrate'], {
  env: { ...process.env, DATABASE_URL: migrationURL },
  stdio: 'inherit',
})

if (result.error) {
  console.error('Production migrations could not start:', result.error.message)
  process.exit(1)
}

process.exit(result.status ?? 1)
