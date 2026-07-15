import { spawnSync } from 'node:child_process'
import { readFileSync } from 'node:fs'

const result = spawnSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], {
  encoding: 'utf8',
})
if (result.status !== 0) {
  console.error('Unable to enumerate tracked files for secret scanning.')
  process.exit(1)
}

const files = result.stdout
  .split('\0')
  .filter(Boolean)
  .filter((file) => !file.startsWith('tests/'))
  .filter((file) => !file.endsWith('pnpm-lock.yaml'))

const patterns = [
  { label: 'private key', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: 'Supabase secret key', pattern: /\bsb_secret_[A-Za-z0-9_-]{16,}/ },
  { label: 'live payment key', pattern: /\b(?:sk|rk)_live_[A-Za-z0-9]{16,}/ },
  { label: 'AWS access key', pattern: /\bAKIA[0-9A-Z]{16}\b/ },
  { label: 'GitHub token', pattern: /\bgh[pousr]_[A-Za-z0-9]{24,}/ },
  { label: 'Resend API key', pattern: /\bre_[A-Za-z0-9]{32,}/ },
]

const findings = []
for (const file of files) {
  const buffer = readFileSync(file)
  if (buffer.includes(0)) continue
  const contents = buffer.toString('utf8')

  for (const [index, line] of contents.split('\n').entries()) {
    for (const { label, pattern } of patterns) {
      if (pattern.test(line)) findings.push(`${file}:${index + 1} (${label})`)
    }
  }
}

if (findings.length) {
  console.error('Potential tracked secrets detected:')
  for (const finding of findings) console.error(`- ${finding}`)
  process.exit(1)
}

console.log(`Tracked-secret scan passed across ${files.length} files.`)
