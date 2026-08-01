import type { TutorProgress, FingerStat, WeakKeyStat } from '../progress/store'
import { fingerLabel, type Finger, type Hand } from '../tutor/fingerMap'

export interface AnalyticsReport {
  mostMissedKey: string | null
  slowestKey: string | null
  weakestFinger: string | null
  weakRow: string | null
  weakSymbols: string[]
  recommendations: string[]
}

function missRate(s: { hits: number; misses: number }): number {
  const t = s.hits + s.misses
  return t === 0 ? 0 : s.misses / t
}

function avgSlow(s: { slowMsTotal: number; slowCount: number }): number {
  return s.slowCount === 0 ? 0 : s.slowMsTotal / s.slowCount
}

export function buildAnalytics(p: TutorProgress): AnalyticsReport {
  const keys = Object.values(p.weakKeys)
  const fingers = Object.values(p.fingerStats)

  const mostMissed = [...keys].sort((a, b) => missRate(b) - missRate(a))[0] ?? null
  const slowest = [...keys]
    .filter((k) => k.slowCount > 0)
    .sort((a, b) => avgSlow(b) - avgSlow(a))[0] ?? null
  const weakestFinger =
    [...fingers].sort((a, b) => missRate(b) - missRate(a))[0] ?? null

  const rowBuckets: Record<string, { hits: number; misses: number }> = {
    home: { hits: 0, misses: 0 },
    top: { hits: 0, misses: 0 },
    bottom: { hits: 0, misses: 0 },
    number: { hits: 0, misses: 0 },
    symbol: { hits: 0, misses: 0 },
  }

  const home = 'asdfghjkl;'
  const top = 'qwertyuiop[]\\'
  const bottom = 'zxcvbnm,./'
  const number = '1234567890-='
  const symbol = '`~!@#$%^&*()_+{}|:\"<>?'

  for (const k of keys) {
    const ch = k.key
    let bucket = 'symbol'
    if (home.includes(ch)) bucket = 'home'
    else if (top.includes(ch)) bucket = 'top'
    else if (bottom.includes(ch)) bucket = 'bottom'
    else if (number.includes(ch)) bucket = 'number'
    else if (symbol.includes(ch)) bucket = 'symbol'
    rowBuckets[bucket]!.hits += k.hits
    rowBuckets[bucket]!.misses += k.misses
  }

  const weakRow =
    Object.entries(rowBuckets).sort((a, b) => missRate(b[1]) - missRate(a[1]))[0]?.[0] ??
    null

  const weakSymbols = keys
    .filter((k) => symbol.includes(k.key) && missRate(k) > 0.15)
    .sort((a, b) => missRate(b) - missRate(a))
    .slice(0, 5)
    .map((k) => k.key)

  const recommendations: string[] = []
  if (mostMissed && missRate(mostMissed) > 0.1) {
    recommendations.push(
      `Drill the key “${mostMissed.key}” slowly — it is your most missed character.`,
    )
  }
  if (weakestFinger && missRate(weakestFinger) > 0.1) {
    recommendations.push(
      `Strengthen your ${fingerLabel(weakestFinger.finger, weakestFinger.hand)} with guided single-key practice.`,
    )
  }
  if (weakRow) {
    recommendations.push(
      `Spend a session on the ${weakRow} row before mixing rows together.`,
    )
  }
  if (weakSymbols.length) {
    recommendations.push(
      `Symbol focus: practice ${weakSymbols.map((s) => `“${s}”`).join(', ')} with Shift drills.`,
    )
  }
  if (!recommendations.length) {
    recommendations.push(
      'Great balance so far. Keep accuracy above 95% before pushing for higher WPM.',
    )
  }

  return {
    mostMissedKey: mostMissed?.key ?? null,
    slowestKey: slowest?.key ?? null,
    weakestFinger: weakestFinger
      ? fingerLabel(weakestFinger.finger, weakestFinger.hand)
      : null,
    weakRow,
    weakSymbols,
    recommendations,
  }
}

export type { FingerStat, WeakKeyStat, Finger, Hand }
