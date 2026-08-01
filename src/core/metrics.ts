/**
 * WPM / accuracy metrics for typing sessions.
 * Standard WPM = (correct characters / 5) / minutes elapsed.
 */

export interface CharResult {
  expected: string
  typed: string
  correct: boolean
}

export interface SessionMetrics {
  wpm: number
  rawWpm: number
  accuracy: number
  correctChars: number
  incorrectChars: number
  totalTyped: number
  mistakes: number
  elapsedMs: number
  progress: number
  complete: boolean
}

export function computeMetrics(
  target: string,
  typed: string,
  elapsedMs: number,
  finished: boolean,
): SessionMetrics {
  const len = Math.min(typed.length, target.length)
  let correct = 0
  let incorrect = 0

  for (let i = 0; i < len; i++) {
    if (typed[i] === target[i]) correct++
    else incorrect++
  }

  // Extra typed beyond target counts as incorrect
  if (typed.length > target.length) {
    incorrect += typed.length - target.length
  }

  const totalTyped = typed.length
  const mistakes = incorrect
  const minutes = Math.max(elapsedMs / 60000, 1 / 60000)
  const wpm = Math.round((correct / 5) / minutes)
  const rawWpm = Math.round((totalTyped / 5) / minutes)
  const accuracy =
    totalTyped === 0 ? 100 : Math.max(0, Math.round((correct / totalTyped) * 100))
  const progress =
    target.length === 0 ? 0 : Math.min(100, Math.round((len / target.length) * 100))
  const complete =
    finished ||
    (typed.length >= target.length &&
      typed.slice(0, target.length) === target)

  return {
    wpm: Number.isFinite(wpm) ? wpm : 0,
    rawWpm: Number.isFinite(rawWpm) ? rawWpm : 0,
    accuracy,
    correctChars: correct,
    incorrectChars: incorrect,
    totalTyped,
    mistakes,
    elapsedMs,
    progress,
    complete,
  }
}

export function formatTime(ms: number): string {
  const totalSec = Math.max(0, Math.floor(ms / 1000))
  const m = Math.floor(totalSec / 60)
  const s = totalSec % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function wpmLevel(wpm: number): string {
  if (wpm < 30) return 'Beginner'
  if (wpm < 50) return 'Developing'
  if (wpm < 70) return 'Solid'
  if (wpm < 90) return 'Fast'
  return 'Expert'
}
