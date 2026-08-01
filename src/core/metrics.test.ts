import { describe, expect, it } from 'vitest'
import { computeMetrics, formatTime, wpmLevel } from './metrics'
import {
  escapeHtml,
  sanitizePracticeText,
  validateDuration,
  validateMode,
} from './sanitize'

describe('sanitizePracticeText', () => {
  it('strips HTML and script-like content', () => {
    const dirty = '<script>alert(1)</script>Hello world practice text today'
    expect(sanitizePracticeText(dirty)).not.toMatch(/script/i)
    expect(sanitizePracticeText(dirty)).toContain('Hello world')
  })

  it('rejects short or empty input', () => {
    expect(sanitizePracticeText('hi')).toBe('')
    expect(sanitizePracticeText(null)).toBe('')
    expect(sanitizePracticeText(42)).toBe('')
  })

  it('escapes HTML entities', () => {
    expect(escapeHtml('<b>"x"</b>')).toBe('&lt;b&gt;&quot;x&quot;&lt;/b&gt;')
  })
})

describe('settings validation', () => {
  it('falls back to safe defaults', () => {
    expect(validateMode('hack')).toBe('live')
    expect(validateDuration(999)).toBe(60)
    expect(validateDuration('30')).toBe(30)
  })
})

describe('metrics', () => {
  it('computes WPM and accuracy for perfect typing', () => {
    const target = 'hello world test'
    const typed = 'hello world test'
    // 16 chars in 12s → (16/5) / 0.2 = 16 WPM
    const m = computeMetrics(target, typed, 12_000, true)
    expect(m.accuracy).toBe(100)
    expect(m.mistakes).toBe(0)
    expect(m.complete).toBe(true)
    expect(m.wpm).toBe(Math.round((target.length / 5) / 0.2))
  })

  it('counts mistakes and reduces accuracy', () => {
    const m = computeMetrics('abcd', 'abxd', 60_000, false)
    expect(m.correctChars).toBe(3)
    expect(m.incorrectChars).toBe(1)
    expect(m.accuracy).toBe(75)
  })

  it('formats time and levels', () => {
    expect(formatTime(65_000)).toBe('1:05')
    expect(wpmLevel(25)).toBe('Beginner')
    expect(wpmLevel(95)).toBe('Expert')
  })
})
