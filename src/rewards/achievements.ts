/**
 * Achievement definitions and evaluation after sessions.
 */

import type { TutorProgress } from '../progress/store'
import { addRewards, unlockAchievement } from '../progress/store'
import type { RewardGrant } from '../progress/store'
import { LESSONS } from '../tutor/lessons'

export interface AchievementDef {
  id: string
  title: string
  description: string
  rewards: RewardGrant[]
}

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first-lesson',
    title: 'First Lesson',
    description: 'Complete your first typing lesson.',
    rewards: [
      { kind: 'coins', amount: 50, label: '50 Coins' },
      { kind: 'badge', itemId: 'first-lesson', label: 'First Lesson Badge' },
      { kind: 'xp', amount: 40, label: '40 XP' },
    ],
  },
  {
    id: 'home-row-master',
    title: 'Home Row Master',
    description: 'Complete all home-row foundation lessons.',
    rewards: [
      { kind: 'title', itemId: 'home-row-hero', label: 'Home Row Hero' },
      { kind: 'coins', amount: 100, label: '100 Coins' },
    ],
  },
  {
    id: 'wpm-10',
    title: '10 WPM',
    description: 'Reach 10 WPM in a lesson.',
    rewards: [{ kind: 'xp', amount: 20, label: '20 XP' }],
  },
  {
    id: 'wpm-20',
    title: '20 WPM',
    description: 'Reach 20 WPM in a lesson.',
    rewards: [{ kind: 'coins', amount: 30, label: '30 Coins' }],
  },
  {
    id: 'wpm-30',
    title: '30 WPM',
    description: 'Reach 30 WPM in a lesson.',
    rewards: [{ kind: 'gems', amount: 1, label: '1 Gem' }],
  },
  {
    id: 'wpm-50',
    title: '50 WPM',
    description: 'Reach 50 WPM in a lesson.',
    rewards: [
      { kind: 'title', itemId: 'speed-starter', label: 'Speed Starter' },
      { kind: 'coins', amount: 80, label: '80 Coins' },
    ],
  },
  {
    id: 'wpm-70',
    title: '70 WPM',
    description: 'Reach 70 WPM in a lesson.',
    rewards: [{ kind: 'gems', amount: 3, label: '3 Gems' }],
  },
  {
    id: 'wpm-90',
    title: '90 WPM',
    description: 'Reach 90 WPM in a lesson.',
    rewards: [
      { kind: 'badge', itemId: 'speed-demon', label: 'Speed Demon' },
      { kind: 'theme', itemId: 'neon', label: 'Neon Theme' },
    ],
  },
  {
    id: 'perfect-accuracy',
    title: 'Perfect Accuracy',
    description: 'Finish a lesson with 100% accuracy.',
    rewards: [
      { kind: 'title', itemId: 'accuracy-ace', label: 'Accuracy Ace' },
      { kind: 'gems', amount: 5, label: '5 Gems' },
    ],
  },
  {
    id: 'no-mistakes',
    title: 'No Mistakes',
    description: 'Complete a challenge with zero mistakes.',
    rewards: [{ kind: 'coins', amount: 60, label: '60 Coins' }],
  },
  {
    id: 'symbol-master',
    title: 'Symbol King',
    description: 'Complete symbol and programming symbol lessons.',
    rewards: [
      { kind: 'title', itemId: 'symbol-king', label: 'Symbol King' },
      { kind: 'keycap', itemId: 'orange', label: 'Orange Keycaps' },
    ],
  },
  {
    id: 'programmer-mode',
    title: 'Programmer Mode',
    description: 'Complete all programmer code lessons.',
    rewards: [
      { kind: 'title', itemId: 'code-wizard', label: 'Code Wizard' },
      { kind: 'badge', itemId: 'programmer', label: 'Programmer Badge' },
      { kind: 'theme', itemId: 'hacker', label: 'Hacker Theme' },
    ],
  },
  {
    id: 'lessons-100',
    title: '100 Lessons',
    description: 'Finish 100 lesson sessions (replays count).',
    rewards: [
      { kind: 'title', itemId: 'typing-master', label: 'Typing Master' },
      { kind: 'badge', itemId: 'typing-master-badge', label: 'Typing Master Badge' },
      { kind: 'frame', itemId: 'master-frame', label: 'Master Frame' },
    ],
  },
  {
    id: 'words-1000',
    title: '1000 Words',
    description: 'Type 1000 words across all practice.',
    rewards: [{ kind: 'coins', amount: 150, label: '150 Coins' }],
  },
  {
    id: 'chars-10000',
    title: '10,000 Characters',
    description: 'Type 10,000 characters.',
    rewards: [{ kind: 'gems', amount: 8, label: '8 Gems' }],
  },
  {
    id: 'treasure-hunter',
    title: 'Treasure Hunter',
    description: 'Open 10 treasure chests.',
    rewards: [
      { kind: 'title', itemId: 'treasure-hunter', label: 'Treasure Hunter' },
      { kind: 'ticket', amount: 2, label: '2 Spin Tickets' },
    ],
  },
]

export function evaluateAchievements(
  p: TutorProgress,
  ctx: { accuracy: number; wpm: number; mistakes: number; lessonId: string },
): { progress: TutorProgress; unlocked: AchievementDef[] } {
  let next = p
  const unlocked: AchievementDef[] = []

  const tryUnlock = (id: string) => {
    const def = ACHIEVEMENTS.find((a) => a.id === id)
    if (!def) return
    const res = unlockAchievement(next, id)
    if (res.newlyUnlocked) {
      next = addRewards(res.progress, def.rewards)
      unlocked.push(def)
    } else {
      next = res.progress
    }
  }

  if (next.completedLessons.length >= 1) tryUnlock('first-lesson')

  const homeIds = ['l1-home-left', 'l2-home-right', 'l3-home-combine', 'l4-home-gh']
  if (homeIds.every((id) => next.completedLessons.includes(id))) {
    tryUnlock('home-row-master')
  }

  if (ctx.wpm >= 10) tryUnlock('wpm-10')
  if (ctx.wpm >= 20) tryUnlock('wpm-20')
  if (ctx.wpm >= 30) tryUnlock('wpm-30')
  if (ctx.wpm >= 50) tryUnlock('wpm-50')
  if (ctx.wpm >= 70) tryUnlock('wpm-70')
  if (ctx.wpm >= 90) tryUnlock('wpm-90')
  if (ctx.accuracy >= 100) tryUnlock('perfect-accuracy')
  if (ctx.mistakes === 0 && ctx.accuracy >= 100) tryUnlock('no-mistakes')

  if (
    next.completedLessons.includes('l9-symbols') &&
    next.completedLessons.includes('l10-prog-symbols')
  ) {
    tryUnlock('symbol-master')
  }

  const codeIds = LESSONS.filter((l) => l.programmer).map((l) => l.id)
  if (codeIds.every((id) => next.completedLessons.includes(id))) {
    tryUnlock('programmer-mode')
  }

  if (next.totalLessonsFinished >= 100) tryUnlock('lessons-100')
  if (next.totalWords >= 1000) tryUnlock('words-1000')
  if (next.totalChars >= 10000) tryUnlock('chars-10000')
  if (next.chestHistory.length >= 10) tryUnlock('treasure-hunter')

  void ctx.lessonId
  return { progress: next, unlocked }
}
