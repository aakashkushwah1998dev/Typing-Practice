/**
 * Live sentence sources with timeout, sanitization, and offline fallback.
 * Multiple HTTPS endpoints — one succeeds per session when online.
 */

import { isSafeHttpUrl, sanitizePracticeText, type Difficulty } from '../core/sanitize'
import { generateFallbackPassage } from './fallback'

export interface ContentResult {
  text: string
  source: 'live' | 'offline'
  provider?: string
  message?: string
}

interface FetchSource {
  name: string
  url: string
  extract: (data: unknown) => string | null
}

const FETCH_TIMEOUT_MS = 6000

const SOURCES: FetchSource[] = [
  {
    name: 'quotable',
    url: 'https://api.quotable.io/random?minLength=80&maxLength=220',
    extract: (data) => {
      if (data && typeof data === 'object' && 'content' in data) {
        const content = (data as { content?: unknown }).content
        return typeof content === 'string' ? content : null
      }
      return null
    },
  },
  {
    name: 'advice-slip',
    url: 'https://api.adviceslip.com/advice',
    extract: (data) => {
      if (data && typeof data === 'object' && 'slip' in data) {
        const slip = (data as { slip?: { advice?: unknown } }).slip
        return typeof slip?.advice === 'string' ? slip.advice : null
      }
      return null
    },
  },
  {
    name: 'dummyjson-quotes',
    url: 'https://dummyjson.com/quotes/random',
    extract: (data) => {
      if (data && typeof data === 'object' && 'quote' in data) {
        const quote = (data as { quote?: unknown }).quote
        return typeof quote === 'string' ? quote : null
      }
      return null
    },
  },
  {
    name: 'bored-activity',
    url: 'https://www.boredapi.com/api/activity',
    extract: (data) => {
      if (data && typeof data === 'object' && 'activity' in data) {
        const activity = (data as { activity?: unknown }).activity
        return typeof activity === 'string'
          ? `Today try this: ${activity}. Type carefully and keep accuracy high.`
          : null
      }
      return null
    },
  },
]

async function fetchJson(url: string): Promise<unknown> {
  if (!isSafeHttpUrl(url)) {
    throw new Error('Blocked unsafe URL')
  }

  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

  try {
    const response = await fetch(url, {
      method: 'GET',
      signal: controller.signal,
      headers: { Accept: 'application/json' },
      credentials: 'omit',
      referrerPolicy: 'no-referrer',
      // Avoid sending cookies / auth
      cache: 'no-store',
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`)
    }

    const contentType = response.headers.get('content-type') ?? ''
    if (!contentType.includes('json') && !contentType.includes('javascript')) {
      // Some APIs omit content-type; still try JSON parse carefully
      const text = await response.text()
      return JSON.parse(text)
    }

    return await response.json()
  } finally {
    clearTimeout(timer)
  }
}

function shuffleSources(seed: number): FetchSource[] {
  const arr = [...SOURCES]
  let s = seed >>> 0
  for (let i = arr.length - 1; i > 0; i--) {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0
    const j = s % (i + 1)
    ;[arr[i], arr[j]] = [arr[j]!, arr[i]!]
  }
  return arr
}

/**
 * Try live APIs in random order. Fall back to offline generator on any failure.
 */
export async function fetchPracticeContent(options: {
  preferCode?: boolean
  difficulty: Difficulty
  offlineKind?: 'prose' | 'mixed' | 'code'
}): Promise<ContentResult> {
  const seed = Date.now() ^ ((Math.random() * 0xffffffff) | 0)
  const ordered = shuffleSources(seed)

  if (!options.preferCode) {
    for (const source of ordered) {
      try {
        const data = await fetchJson(source.url)
        const raw = source.extract(data)
        const clean = sanitizePracticeText(raw)
        if (clean) {
          return {
            text: clean,
            source: 'live',
            provider: source.name,
            message: `Live content from ${source.name}`,
          }
        }
      } catch {
        // try next source
      }
    }
  }

  const kind = options.preferCode
    ? 'code'
    : options.offlineKind ?? 'prose'

  return {
    text: generateFallbackPassage({
      kind,
      difficulty: options.difficulty,
      seed,
    }),
    source: 'offline',
    message: options.preferCode
      ? 'Code practice using local drill library'
      : 'Offline fallback — live sources unavailable or filtered',
  }
}
