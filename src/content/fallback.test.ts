import { describe, expect, it } from 'vitest'
import { generateFallbackPassage, progressiveContent } from './fallback'

describe('fallback generators', () => {
  it('produces different passages for different seeds', () => {
    const a = generateFallbackPassage({ kind: 'prose', difficulty: 'beginner', seed: 1 })
    const b = generateFallbackPassage({ kind: 'prose', difficulty: 'beginner', seed: 99 })
    expect(a.length).toBeGreaterThan(20)
    expect(b.length).toBeGreaterThan(20)
    expect(a).not.toBe(b)
  })

  it('home row content stays on home-ish characters for beginner', () => {
    const text = generateFallbackPassage({
      kind: 'homerow',
      difficulty: 'beginner',
      seed: 42,
    })
    expect(text.toLowerCase()).toMatch(/[asdfjkl;]/)
  })

  it('progressive weeks change focus', () => {
    const w1 = progressiveContent(1, 'beginner', 5)
    const w4 = progressiveContent(4, 'advanced', 5)
    expect(w1.length).toBeGreaterThan(10)
    expect(w4.length).toBeGreaterThan(10)
    expect(w1).not.toBe(w4)
  })
})
