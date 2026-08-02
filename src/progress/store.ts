/**
 * Persistent learner progress, analytics, inventory, and settings extensions.
 */

import { LESSONS } from '../tutor/lessons'
import type { Finger, Hand } from '../tutor/fingerMap'
import {
  DEFAULT_CUSTOM,
  validateAppearance,
  validateCustomColors,
  type AppearanceMode,
  type CustomThemeColors,
} from '../core/theme'

export type ThemeId =
  | 'default'
  | 'hacker'
  | 'neon'
  | 'galaxy'
  | 'fire'
  | 'rainbow'
  | 'golden'
export type HandSkinId = 'classic' | 'gold' | 'cyan' | 'rose'
export type KeycapSkinId = 'standard' | 'orange' | 'mint' | 'midnight'
export type TitleId =
  | 'novice'
  | 'home-row-hero'
  | 'accuracy-ace'
  | 'speed-starter'
  | 'symbol-king'
  | 'code-wizard'
  | 'typing-master'
  | 'treasure-hunter'

export interface AchievementState {
  id: string
  unlockedAt: number
}

export interface ChestHistoryEntry {
  id: string
  at: number
  rarity: ChestRarity
  lessonId: string
  lessonTitle: string
  accuracy: number
  wpm: number
  rewards: RewardGrant[]
}

export type ChestRarity =
  | 'wooden'
  | 'bronze'
  | 'silver'
  | 'golden'
  | 'diamond'
  | 'legendary'
  | 'epic'

export type RewardKind =
  | 'coins'
  | 'xp'
  | 'gems'
  | 'title'
  | 'badge'
  | 'theme'
  | 'keycap'
  | 'hand'
  | 'frame'
  | 'boost'
  | 'ticket'
  | 'key'
  | 'mystery'

export interface RewardGrant {
  kind: RewardKind
  amount?: number
  itemId?: string
  label: string
}

export interface WeakKeyStat {
  key: string
  misses: number
  hits: number
  slowMsTotal: number
  slowCount: number
}

export interface FingerStat {
  finger: Finger
  hand: Hand
  misses: number
  hits: number
  slowMsTotal: number
  slowCount: number
}

export interface TutorProgress {
  version: 3
  onboardingComplete: boolean
  onboardingStep: number
  completedLessons: string[]
  lessonBest: Record<
    string,
    { accuracy: number; wpm: number; stars: number }
  >
  currentLessonId: string
  xp: number
  level: number
  coins: number
  gems: number
  bestWpm: number
  totalChars: number
  totalWords: number
  totalLessonsFinished: number
  achievements: AchievementState[]
  titles: TitleId[]
  activeTitle: TitleId
  themes: ThemeId[]
  activeTheme: ThemeId
  keycaps: KeycapSkinId[]
  activeKeycap: KeycapSkinId
  hands: HandSkinId[]
  activeHand: HandSkinId
  frames: string[]
  activeFrame: string
  badges: string[]
  tickets: number
  goldenKeys: number
  doubleXpUntil: number
  chestHistory: ChestHistoryEntry[]
  weakKeys: Record<string, WeakKeyStat>
  fingerStats: Record<string, FingerStat>
  streakDays: number
  lastPracticeDate: string // YYYY-MM-DD
  soundEnabled: boolean
  narrationEnabled: boolean
  /** @deprecated migrated to appearanceMode */
  darkMode: boolean
  appearanceMode: AppearanceMode
  customTheme: CustomThemeColors
  animationSpeed: 'slow' | 'normal' | 'fast'
  layout: 'qwerty'
  language: 'en'
  difficulty: 'beginner' | 'intermediate' | 'advanced'
}

const STORAGE_KEY = 'typing-practice-tutor-v1'

export function xpForLevel(level: number): number {
  return Math.floor(100 * Math.pow(level, 1.45))
}

export function levelFromXp(xp: number): number {
  let level = 1
  while (xp >= xpForLevel(level + 1) && level < 99) level++
  return level
}

export function defaultProgress(): TutorProgress {
  return {
    version: 3,
    onboardingComplete: false,
    onboardingStep: 0,
    completedLessons: [],
    lessonBest: {},
    currentLessonId: LESSONS[0]!.id,
    xp: 0,
    level: 1,
    coins: 0,
    gems: 0,
    bestWpm: 0,
    totalChars: 0,
    totalWords: 0,
    totalLessonsFinished: 0,
    achievements: [],
    titles: ['novice'],
    activeTitle: 'novice',
    themes: ['default'],
    activeTheme: 'default',
    keycaps: ['standard'],
    activeKeycap: 'standard',
    hands: ['classic'],
    activeHand: 'classic',
    frames: ['none'],
    activeFrame: 'none',
    badges: [],
    tickets: 0,
    goldenKeys: 0,
    doubleXpUntil: 0,
    chestHistory: [],
    weakKeys: {},
    fingerStats: {},
    streakDays: 0,
    lastPracticeDate: '',
    soundEnabled: true,
    narrationEnabled: false,
    darkMode: true,
    appearanceMode: 'dark',
    customTheme: { ...DEFAULT_CUSTOM },
    animationSpeed: 'normal',
    layout: 'qwerty',
    language: 'en',
    difficulty: 'beginner',
  }
}

export function loadProgress(): TutorProgress {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultProgress()
    const parsed = JSON.parse(raw) as Partial<TutorProgress> & {
      darkMode?: boolean
    }
    const merged: TutorProgress = {
      ...defaultProgress(),
      ...parsed,
      version: 3,
      appearanceMode: validateAppearance(
        parsed.appearanceMode ??
          (parsed.darkMode === false ? 'bright' : 'dark'),
      ),
      customTheme: validateCustomColors(parsed.customTheme),
    }
    merged.darkMode = merged.appearanceMode === 'dark' || merged.appearanceMode === 'custom'
    return merged
  } catch {
    return defaultProgress()
  }
}

export function saveProgress(p: TutorProgress): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
}

export function todayStamp(): string {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function touchStreak(p: TutorProgress): TutorProgress {
  const today = todayStamp()
  if (p.lastPracticeDate === today) return p
  const yesterday = new Date()
  yesterday.setDate(yesterday.getDate() - 1)
  const y = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, '0')}-${String(yesterday.getDate()).padStart(2, '0')}`
  const streak = p.lastPracticeDate === y ? p.streakDays + 1 : 1
  return { ...p, streakDays: streak, lastPracticeDate: today }
}

export function isLessonUnlocked(p: TutorProgress, lessonId: string): boolean {
  const lesson = LESSONS.find((l) => l.id === lessonId)
  if (!lesson) return false
  if (lesson.order === 1) return p.onboardingComplete
  const prev = LESSONS.find((l) => l.order === lesson.order - 1)
  if (!prev) return p.onboardingComplete
  return p.completedLessons.includes(prev.id)
}

export function markLessonComplete(
  p: TutorProgress,
  lessonId: string,
  accuracy: number,
  wpm: number,
): TutorProgress {
  const wasNew = !p.completedLessons.includes(lessonId)
  const completed = wasNew
    ? [...p.completedLessons, lessonId]
    : p.completedLessons
  const prev = p.lessonBest[lessonId]
  const stars =
    accuracy >= 98 ? 3 : accuracy >= 92 ? 2 : accuracy >= 85 ? 1 : 0
  const best = {
    accuracy: Math.max(prev?.accuracy ?? 0, accuracy),
    wpm: Math.max(prev?.wpm ?? 0, wpm),
    stars: Math.max(prev?.stars ?? 0, stars),
  }
  return {
    ...p,
    completedLessons: completed,
    lessonBest: { ...p.lessonBest, [lessonId]: best },
    totalLessonsFinished: p.totalLessonsFinished + (wasNew ? 1 : 0),
    bestWpm: Math.max(p.bestWpm, wpm),
    currentLessonId: lessonId,
  }
}

export function recordKeyResult(
  p: TutorProgress,
  key: string,
  correct: boolean,
  finger: Finger,
  hand: Hand,
  reactionMs: number,
): TutorProgress {
  const k = key.length === 1 ? key.toLowerCase() : key
  const weak = { ...(p.weakKeys[k] ?? { key: k, misses: 0, hits: 0, slowMsTotal: 0, slowCount: 0 }) }
  if (correct) weak.hits++
  else weak.misses++
  if (correct && reactionMs > 0) {
    weak.slowMsTotal += reactionMs
    weak.slowCount++
  }

  const fk = `${hand}-${finger}`
  const fs = {
    ...(p.fingerStats[fk] ?? {
      finger,
      hand,
      misses: 0,
      hits: 0,
      slowMsTotal: 0,
      slowCount: 0,
    }),
  }
  if (correct) fs.hits++
  else fs.misses++
  if (correct && reactionMs > 0) {
    fs.slowMsTotal += reactionMs
    fs.slowCount++
  }

  return {
    ...p,
    weakKeys: { ...p.weakKeys, [k]: weak },
    fingerStats: { ...p.fingerStats, [fk]: fs },
    totalChars: p.totalChars + 1,
  }
}

export function addRewards(p: TutorProgress, rewards: RewardGrant[]): TutorProgress {
  let next = { ...p }
  const double = Date.now() < next.doubleXpUntil
  for (const r of rewards) {
    switch (r.kind) {
      case 'coins':
        next.coins += r.amount ?? 0
        break
      case 'gems':
        next.gems += r.amount ?? 0
        break
      case 'xp': {
        const amt = (r.amount ?? 0) * (double ? 2 : 1)
        next.xp += amt
        next.level = levelFromXp(next.xp)
        break
      }
      case 'ticket':
        next.tickets += r.amount ?? 1
        break
      case 'key':
        next.goldenKeys += r.amount ?? 1
        break
      case 'boost':
        next.doubleXpUntil = Date.now() + 24 * 60 * 60 * 1000
        break
      case 'title':
        if (r.itemId && !next.titles.includes(r.itemId as TitleId)) {
          next.titles = [...next.titles, r.itemId as TitleId]
        }
        break
      case 'theme':
        if (r.itemId && !next.themes.includes(r.itemId as ThemeId)) {
          next.themes = [...next.themes, r.itemId as ThemeId]
        }
        break
      case 'keycap':
        if (r.itemId && !next.keycaps.includes(r.itemId as KeycapSkinId)) {
          next.keycaps = [...next.keycaps, r.itemId as KeycapSkinId]
        }
        break
      case 'hand':
        if (r.itemId && !next.hands.includes(r.itemId as HandSkinId)) {
          next.hands = [...next.hands, r.itemId as HandSkinId]
        }
        break
      case 'frame':
        if (r.itemId && !next.frames.includes(r.itemId)) {
          next.frames = [...next.frames, r.itemId]
        }
        break
      case 'badge':
        if (r.itemId && !next.badges.includes(r.itemId)) {
          next.badges = [...next.badges, r.itemId]
        }
        break
      case 'mystery':
        next.coins += 25
        next.gems += 1
        break
      default:
        break
    }
  }
  return next
}

export function unlockAchievement(
  p: TutorProgress,
  id: string,
): { progress: TutorProgress; newlyUnlocked: boolean } {
  if (p.achievements.some((a) => a.id === id)) {
    return { progress: p, newlyUnlocked: false }
  }
  return {
    progress: {
      ...p,
      achievements: [...p.achievements, { id, unlockedAt: Date.now() }],
    },
    newlyUnlocked: true,
  }
}
