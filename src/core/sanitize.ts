/**
 * Security helpers — sanitize external text and validate user settings.
 * Never inject unsanitized HTML from the network into the DOM.
 */

const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g
const HTML_TAG = /<\/?[a-zA-Z][^>]*>/g
const SCRIPTISH =
  /(?:javascript:|data:text\/html|vbscript:|on\w+\s*=|<script|<\/script|<iframe|<\/iframe|<object|<embed|<link\s|<\?php)/gi

/** Escape characters that would break HTML if ever interpolated as markup. */
export function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

/**
 * Strip HTML/script patterns and control characters from live-fetched content.
 * Returns plain text only. Empty string if content is unsafe or useless.
 */
export function sanitizePracticeText(raw: unknown, maxLength = 800): string {
  if (typeof raw !== 'string') return ''

  let text = raw
    .replace(CONTROL_CHARS, '')
    .replace(HTML_TAG, ' ')
    .replace(SCRIPTISH, ' ')
    .replace(/\s+/g, ' ')
    .trim()

  // Reject if still looks like markup or injection (reset lastIndex on global regexes)
  HTML_TAG.lastIndex = 0
  SCRIPTISH.lastIndex = 0
  if (HTML_TAG.test(text) || SCRIPTISH.test(text)) {
    return ''
  }

  // Keep printable-ish characters (letters, numbers, punctuation, common symbols)
  text = text.replace(/[^\x20-\x7E\u00A0-\u024F\u2010-\u2027\u2030-\u205E]/g, '')
  text = text.replace(/\s+/g, ' ').trim()

  if (text.length < 12) return ''
  if (text.length > maxLength) {
    text = text.slice(0, maxLength).replace(/\s+\S*$/, '').trim()
  }

  return text
}

export function isSafeHttpUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

export type Difficulty = 'beginner' | 'intermediate' | 'advanced'
export type PracticeMode =
  | 'live'
  | 'beginner'
  | 'homerow'
  | 'numbers'
  | 'symbols'
  | 'code'
  | 'progressive'
export type SentenceType = 'prose' | 'mixed' | 'code'
export type TestDuration = 30 | 60 | 90 | 120 | 0 // 0 = untimed / complete passage

const DIFFICULTIES: Difficulty[] = ['beginner', 'intermediate', 'advanced']
const MODES: PracticeMode[] = [
  'live',
  'beginner',
  'homerow',
  'numbers',
  'symbols',
  'code',
  'progressive',
]
const SENTENCE_TYPES: SentenceType[] = ['prose', 'mixed', 'code']
const DURATIONS: TestDuration[] = [30, 60, 90, 120, 0]

export function validateDifficulty(value: unknown): Difficulty {
  return DIFFICULTIES.includes(value as Difficulty)
    ? (value as Difficulty)
    : 'beginner'
}

export function validateMode(value: unknown): PracticeMode {
  return MODES.includes(value as PracticeMode) ? (value as PracticeMode) : 'live'
}

export function validateSentenceType(value: unknown): SentenceType {
  return SENTENCE_TYPES.includes(value as SentenceType)
    ? (value as SentenceType)
    : 'prose'
}

export function validateDuration(value: unknown): TestDuration {
  const n = typeof value === 'string' ? Number(value) : value
  return DURATIONS.includes(n as TestDuration) ? (n as TestDuration) : 60
}

export function clampProgressLevel(level: unknown): number {
  const n = typeof level === 'number' ? level : Number(level)
  if (!Number.isFinite(n)) return 1
  return Math.min(4, Math.max(1, Math.floor(n)))
}
