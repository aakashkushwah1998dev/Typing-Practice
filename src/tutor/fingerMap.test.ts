import { describe, expect, it } from 'vitest'
import {
  explainKey,
  fingerLabel,
  getAssignment,
  requiresShift,
} from './fingerMap'
import { chestFromAccuracy, rollRewards } from '../rewards/chests'
import { LESSONS } from './lessons'
import { isLessonUnlocked, defaultProgress, markLessonComplete } from '../progress/store'

describe('finger map', () => {
  it('maps home row fingers', () => {
    expect(getAssignment('a')?.finger).toBe('pinky')
    expect(getAssignment('a')?.hand).toBe('left')
    expect(getAssignment('j')?.finger).toBe('index')
    expect(getAssignment('j')?.hand).toBe('right')
    expect(getAssignment(';')?.finger).toBe('pinky')
  })

  it('maps symbols and shift', () => {
    expect(requiresShift('{')).toBe(true)
    expect(getAssignment('{')?.key).toBe('[')
    expect(getAssignment('(')?.key).toBe('9')
    expect(explainKey('a')).toMatch(/little/i)
    expect(fingerLabel('index', 'left')).toMatch(/Left index/)
  })
})

describe('lessons unlock', () => {
  it('locks later lessons until previous complete', () => {
    let p = defaultProgress()
    p = { ...p, onboardingComplete: true }
    expect(isLessonUnlocked(p, LESSONS[0]!.id)).toBe(true)
    expect(isLessonUnlocked(p, LESSONS[1]!.id)).toBe(false)
    p = markLessonComplete(p, LESSONS[0]!.id, 90, 25)
    expect(isLessonUnlocked(p, LESSONS[1]!.id)).toBe(true)
  })
})

describe('treasure rarity', () => {
  it('prioritizes accuracy tiers', () => {
    expect(chestFromAccuracy(65)).toBe('wooden')
    expect(chestFromAccuracy(75)).toBe('bronze')
    expect(chestFromAccuracy(85)).toBe('silver')
    expect(chestFromAccuracy(92)).toBe('golden')
    expect(chestFromAccuracy(96)).toBe('diamond')
    expect(chestFromAccuracy(100)).toBe('legendary')
  })

  it('rolls rewards with xp and coins', () => {
    const rewards = rollRewards('golden', 93, 40, 123)
    expect(rewards.some((r) => r.kind === 'coins')).toBe(true)
    expect(rewards.some((r) => r.kind === 'xp')).toBe(true)
  })
})
