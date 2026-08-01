import { computeMetrics, type SessionMetrics } from './metrics'

export type EngineStatus = 'idle' | 'ready' | 'running' | 'finished'

export interface EngineState {
  target: string
  typed: string
  status: EngineStatus
  startedAt: number | null
  endedAt: number | null
  durationLimitMs: number | null
  metrics: SessionMetrics
}

export type EngineListener = (state: EngineState) => void

export class TypingEngine {
  private target = ''
  private typed = ''
  private status: EngineStatus = 'idle'
  private startedAt: number | null = null
  private endedAt: number | null = null
  private durationLimitMs: number | null = null
  private listeners = new Set<EngineListener>()
  private timerId: number | null = null

  subscribe(listener: EngineListener): () => void {
    this.listeners.add(listener)
    listener(this.getState())
    return () => this.listeners.delete(listener)
  }

  getState(): EngineState {
    return {
      target: this.target,
      typed: this.typed,
      status: this.status,
      startedAt: this.startedAt,
      endedAt: this.endedAt,
      durationLimitMs: this.durationLimitMs,
      metrics: this.currentMetrics(),
    }
  }

  load(target: string, durationSeconds: number): void {
    this.stopTimer()
    this.target = target
    this.typed = ''
    this.status = target ? 'ready' : 'idle'
    this.startedAt = null
    this.endedAt = null
    this.durationLimitMs = durationSeconds > 0 ? durationSeconds * 1000 : null
    this.emit()
  }

  handleInput(value: string): void {
    if (this.status === 'finished' || this.status === 'idle') return
    if (!this.target) return

    if (this.status === 'ready') {
      this.status = 'running'
      this.startedAt = performance.now()
      this.startTimer()
    }

    // Cap input length to target + small buffer to avoid abuse
    const maxLen = this.target.length + 32
    this.typed = value.slice(0, maxLen)

    if (this.typed.length >= this.target.length) {
      const prefix = this.typed.slice(0, this.target.length)
      if (prefix === this.target || this.durationLimitMs === null) {
        // Complete passage when fully typed (untimed) or exact match
        if (prefix === this.target) {
          this.finish()
          return
        }
      }
    }

    this.emit()
  }

  handleKeydown(event: KeyboardEvent): boolean {
    if (this.status === 'finished') return false
    // Prevent Tab from leaving the input during a run
    if (event.key === 'Tab' && this.status === 'running') {
      event.preventDefault()
      return true
    }
    return false
  }

  reset(): void {
    this.load(this.target, this.durationLimitMs ? this.durationLimitMs / 1000 : 0)
  }

  private finish(): void {
    if (this.status === 'finished') return
    this.status = 'finished'
    this.endedAt = performance.now()
    this.stopTimer()
    this.emit()
  }

  private currentMetrics(): SessionMetrics {
    const now = this.endedAt ?? performance.now()
    const elapsed =
      this.startedAt === null ? 0 : Math.max(0, now - this.startedAt)
    return computeMetrics(
      this.target,
      this.typed,
      elapsed,
      this.status === 'finished',
    )
  }

  private startTimer(): void {
    this.stopTimer()
    this.timerId = window.setInterval(() => {
      if (this.status !== 'running' || this.startedAt === null) return

      if (this.durationLimitMs !== null) {
        const elapsed = performance.now() - this.startedAt
        if (elapsed >= this.durationLimitMs) {
          this.finish()
          return
        }
      }

      this.emit()
    }, 100)
  }

  private stopTimer(): void {
    if (this.timerId !== null) {
      clearInterval(this.timerId)
      this.timerId = null
    }
  }

  private emit(): void {
    const state = this.getState()
    for (const listener of this.listeners) listener(state)
  }
}
