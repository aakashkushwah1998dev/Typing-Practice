import type { Difficulty, PracticeMode, SentenceType, TestDuration } from './sanitize'
import {
  clampProgressLevel,
  validateDifficulty,
  validateDuration,
  validateMode,
  validateSentenceType,
} from './sanitize'

export interface AppSettings {
  difficulty: Difficulty
  mode: PracticeMode
  duration: TestDuration
  sentenceType: SentenceType
  codeTypingMode: boolean
  soundEnabled: boolean
  /** Progressive plan week 1–4 */
  progressiveLevel: number
}

const STORAGE_KEY = 'typing-practice-settings-v1'

const DEFAULTS: AppSettings = {
  difficulty: 'beginner',
  mode: 'live',
  duration: 60,
  sentenceType: 'prose',
  codeTypingMode: false,
  soundEnabled: false,
  progressiveLevel: 1,
}

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...DEFAULTS }
    const parsed = JSON.parse(raw) as Partial<AppSettings>
    return {
      difficulty: validateDifficulty(parsed.difficulty),
      mode: validateMode(parsed.mode),
      duration: validateDuration(parsed.duration),
      sentenceType: validateSentenceType(parsed.sentenceType),
      codeTypingMode: Boolean(parsed.codeTypingMode),
      soundEnabled: Boolean(parsed.soundEnabled),
      progressiveLevel: clampProgressLevel(parsed.progressiveLevel),
    }
  } catch {
    return { ...DEFAULTS }
  }
}

export function saveSettings(settings: AppSettings): void {
  const safe: AppSettings = {
    difficulty: validateDifficulty(settings.difficulty),
    mode: validateMode(settings.mode),
    duration: validateDuration(settings.duration),
    sentenceType: validateSentenceType(settings.sentenceType),
    codeTypingMode: Boolean(settings.codeTypingMode),
    soundEnabled: Boolean(settings.soundEnabled),
    progressiveLevel: clampProgressLevel(settings.progressiveLevel),
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safe))
}

export function getDefaults(): AppSettings {
  return { ...DEFAULTS }
}
