import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { config } from 'dotenv'

/** server/.env — path does not depend on process.cwd(). */
export const SERVER_ENV_PATH = resolve(dirname(fileURLToPath(import.meta.url)), '..', '.env')

if (!existsSync(SERVER_ENV_PATH)) {
  console.warn('[env] Missing file:', SERVER_ENV_PATH)
}

/** Standard dotenv (may omit keys in odd toolchains). */
config({ path: SERVER_ENV_PATH, override: false })

/** Re-apply Copilot-critical keys from disk so duplicates / tooling quirks still work. */
function hydrateCriticalKeysFromDisk(absPath: string): void {
  if (!existsSync(absPath)) return
  let raw = readFileSync(absPath, 'utf8')
  raw = raw.replace(/^\uFEFF/, '')

  for (const line of raw.split(/\r?\n/)) {
    let s = line.trim()
    const hashIdx = s.indexOf('#')
    if (hashIdx !== -1) s = s.slice(0, hashIdx).trim()
    if (!s) continue

    const eq = s.indexOf('=')
    if (eq <= 0) continue

    const key = s.slice(0, eq).trim()
    let val = s.slice(eq + 1).trim()
    const unquoted =
      ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) &&
      val.length >= 2
    if (unquoted) val = val.slice(1, -1)

    const isGeminiPrimary = key === 'GEMINI_API_KEY'
    const isGeminiIndexed = /^GEMINI_API_KEY_\d+$/.test(key)
    const isGooglePrimary = key === 'GOOGLE_AI_API_KEY'
    const isGeminiModel = key === 'GEMINI_MODEL'
    const isLlmIndexed = /^LLM_KEY_\d+$/.test(key)
    const isLlmProvider = /^LLM_KEY_\d+_PROVIDER$/.test(key)

    if (
      !isGeminiPrimary &&
      !isGeminiIndexed &&
      !isGooglePrimary &&
      !isGeminiModel &&
      !isLlmIndexed &&
      !isLlmProvider
    ) {
      continue
    }

    process.env[key] = val
  }
}

hydrateCriticalKeysFromDisk(SERVER_ENV_PATH)

if (process.env.DEBUG_ENV === '1') {
  console.info('[env] Loaded critical keys from', SERVER_ENV_PATH)
}

const noGemini =
  !process.env.GEMINI_API_KEY?.trim() && !process.env.GOOGLE_AI_API_KEY?.trim()

if (noGemini) {
  console.warn(
    `[env] No GEMINI_API_KEY or GOOGLE_AI_API_KEY after reading ${SERVER_ENV_PATH} — copilot disabled. Save that file with a key and restart.`,
  )
}
