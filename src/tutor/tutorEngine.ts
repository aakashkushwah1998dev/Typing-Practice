/**
 * Guided / practice / challenge / timed lesson session engine.
 */

import { computeMetrics, type SessionMetrics } from '../core/metrics'
import {
  explainKey,
  fingerLabel,
  getAssignment,
  type Finger,
  type Hand,
} from './fingerMap'
import type { LessonDef, LessonMode } from './lessons'

export interface TutorTarget {
  char: string
  finger: Finger | null
  hand: Hand | null
  explanation: string
}

export interface TutorSessionState {
  mode: LessonMode
  lesson: LessonDef
  sequence: string
  index: number
  typed: string
  status: 'ready' | 'running' | 'finished'
  startedAt: number | null
  endedAt: number | null
  mistakes: number
  lastError: string | null
  metrics: SessionMetrics
  current: TutorTarget | null
}

export type TutorListener = (state: TutorSessionState) => void

function buildSequence(lesson: LessonDef, mode: LessonMode): string {
  const parts = lesson.drills[mode]
  if (mode === 'guided') return parts.join('')
  if (mode === 'challenge') return parts.join(' · ')
  if (mode === 'timed') return parts.join(' ')
  return parts.join(' ')
}

export class TutorEngine {
  private mode: LessonMode = 'guided'
  private lesson: LessonDef | null = null
  private sequence = ''
  private index = 0
  private typed = ''
  private status: TutorSessionState['status'] = 'ready'
  private startedAt: number | null = null
  private endedAt: number | null = null
  private mistakes = 0
  private lastError: string | null = null
  private listeners = new Set<TutorListener>()
  private timer: number | null = null
  private lastKeyAt = 0

  subscribe(fn: TutorListener): () => void {
    this.listeners.add(fn)
    fn(this.getState())
    return () => this.listeners.delete(fn)
  }

  start(lesson: LessonDef, mode: LessonMode): void {
    this.stopTimer()
    this.lesson = lesson
    this.mode = mode
    this.sequence = buildSequence(lesson, mode)
    this.index = 0
    this.typed = ''
    this.status = 'ready'
    this.startedAt = null
    this.endedAt = null
    this.mistakes = 0
    this.lastError = null
    this.lastKeyAt = 0
    this.emit()
  }

  getState(): TutorSessionState {
    const lesson = this.lesson!
    const elapsed =
      this.startedAt === null
        ? 0
        : Math.max(0, (this.endedAt ?? performance.now()) - this.startedAt)

    // Mistake-aware accuracy: wrong presses count even though we don't advance
    const attempts = this.typed.length + this.mistakes
    const base = computeMetrics(
      this.mode === 'guided'
        ? this.sequence.slice(0, Math.max(this.typed.length, 1))
        : this.sequence,
      this.typed,
      elapsed,
      this.status === 'finished',
    )
    const accuracy =
      attempts === 0
        ? 100
        : Math.max(0, Math.round((this.typed.length / attempts) * 100))
    const metrics = {
      ...base,
      accuracy,
      mistakes: this.mistakes,
      incorrectChars: this.mistakes,
    }
    // For guided, progress by index (cap at 100 when finished)
    if (this.mode === 'guided') {
      metrics.progress =
        this.sequence.length === 0
          ? 0
          : Math.min(
              100,
              Math.round(
                (Math.min(this.index, this.sequence.length) /
                  this.sequence.length) *
                  100,
              ),
            )
    }

    const ch = this.sequence[this.index] ?? null
    const assign = ch ? getAssignment(ch) : null
    const current: TutorTarget | null = ch
      ? {
          char: ch,
          finger: assign?.finger ?? null,
          hand: assign?.hand ?? null,
          explanation: explainKey(ch),
        }
      : null

    return {
      mode: this.mode,
      lesson,
      sequence: this.sequence,
      index: this.index,
      typed: this.typed,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      mistakes: this.mistakes,
      lastError: this.lastError,
      metrics,
      current,
    }
  }

  /** Returns reaction time ms for analytics when correct */
  handleChar(input: string): {
    correct: boolean
    expected: string
    reactionMs: number
    finished: boolean
  } {
    if (!this.lesson || this.status === 'finished') {
      return { correct: false, expected: '', reactionMs: 0, finished: true }
    }
    if (this.status === 'ready') {
      this.status = 'running'
      this.startedAt = performance.now()
      this.lastKeyAt = this.startedAt
      this.startTimer()
    }

    const expected = this.sequence[this.index] ?? ''
    const now = performance.now()
    const reactionMs = Math.max(0, now - this.lastKeyAt)

    if (input === expected) {
      this.typed += input
      this.index++
      this.lastError = null
      this.lastKeyAt = now
      if (this.index >= this.sequence.length) {
        this.finish()
        this.emit()
        return { correct: true, expected, reactionMs, finished: true }
      }
      this.emit()
      return { correct: true, expected, reactionMs, finished: false }
    }

    this.mistakes++
    const assign = getAssignment(expected)
    const pressed = getAssignment(input)
    let msg = `Expected “${expected}”. `
    if (assign && pressed && (pressed.finger !== assign.finger || pressed.hand !== assign.hand)) {
      msg = `You pressed with the wrong finger. Use your ${fingerLabel(assign.finger, assign.hand)} for “${expected}”.`
    } else if (assign) {
      msg = `Wrong key. ${explainKey(expected)}`
    } else {
      msg += explainKey(expected)
    }
    this.lastError = msg
    this.emit()
    return { correct: false, expected, reactionMs: 0, finished: false }
  }

  private finish(): void {
    this.status = 'finished'
    this.endedAt = performance.now()
    this.stopTimer()
  }

  private startTimer(): void {
    this.stopTimer()
    if (this.mode !== 'timed' || !this.lesson) return
    const limit = this.lesson.timedSeconds * 1000
    this.timer = window.setInterval(() => {
      if (this.status !== 'running' || this.startedAt === null) return
      if (performance.now() - this.startedAt >= limit) {
        this.finish()
        this.emit()
      } else {
        this.emit()
      }
    }, 100)
  }

  private stopTimer(): void {
    if (this.timer !== null) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  private emit(): void {
    if (!this.lesson) return
    const state = this.getState()
    for (const fn of this.listeners) fn(state)
  }
}
