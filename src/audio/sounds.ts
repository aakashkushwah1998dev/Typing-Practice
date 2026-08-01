/**
 * Lightweight Web Audio beeps — no external assets required.
 */

let ctx: AudioContext | null = null

function ac(): AudioContext | null {
  try {
    if (!ctx) ctx = new AudioContext()
    return ctx
  } catch {
    return null
  }
}

function tone(
  freq: number,
  duration: number,
  type: OscillatorType,
  gain = 0.04,
  enabled: boolean,
): void {
  if (!enabled) return
  const audio = ac()
  if (!audio) return
  if (audio.state === 'suspended') void audio.resume()
  const osc = audio.createOscillator()
  const g = audio.createGain()
  osc.type = type
  osc.frequency.value = freq
  g.gain.value = gain
  osc.connect(g)
  g.connect(audio.destination)
  const now = audio.currentTime
  g.gain.setValueAtTime(gain, now)
  g.gain.exponentialRampToValueAtTime(0.001, now + duration)
  osc.start(now)
  osc.stop(now + duration)
}

export function playCorrect(enabled: boolean): void {
  tone(660, 0.06, 'sine', 0.035, enabled)
}

export function playWrong(enabled: boolean): void {
  tone(180, 0.12, 'square', 0.03, enabled)
}

export function playLessonComplete(enabled: boolean): void {
  if (!enabled) return
  tone(523, 0.1, 'sine', 0.04, enabled)
  setTimeout(() => tone(659, 0.1, 'sine', 0.04, enabled), 90)
  setTimeout(() => tone(784, 0.16, 'sine', 0.045, enabled), 180)
}

export function playChestOpen(enabled: boolean): void {
  if (!enabled) return
  tone(200, 0.15, 'triangle', 0.05, enabled)
  setTimeout(() => tone(400, 0.12, 'sine', 0.05, enabled), 120)
  setTimeout(() => tone(800, 0.2, 'sine', 0.04, enabled), 260)
  setTimeout(() => tone(1200, 0.25, 'sine', 0.03, enabled), 400)
}

export function playCoin(enabled: boolean): void {
  tone(980, 0.08, 'sine', 0.03, enabled)
  setTimeout(() => tone(1320, 0.1, 'sine', 0.025, enabled), 70)
}
