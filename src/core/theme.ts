/**
 * Appearance themes: dark / bright / system / custom.
 */

export type AppearanceMode = 'dark' | 'bright' | 'system' | 'custom'

export interface CustomThemeColors {
  bg: string
  elevated: string
  ink: string
  muted: string
  accent: string
  accentWarm: string
}

export const DEFAULT_CUSTOM: CustomThemeColors = {
  bg: '#070b16',
  elevated: '#10182a',
  ink: '#e8eefc',
  muted: '#93a0bf',
  accent: '#3b82f6',
  accentWarm: '#f97316',
}

export function resolveAppearance(mode: AppearanceMode): 'dark' | 'bright' {
  if (mode === 'dark' || mode === 'custom') return 'dark'
  if (mode === 'bright') return 'bright'
  // system
  try {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'bright'
  } catch {
    return 'dark'
  }
}

export function validateAppearance(value: unknown): AppearanceMode {
  return value === 'dark' ||
    value === 'bright' ||
    value === 'system' ||
    value === 'custom'
    ? value
    : 'dark'
}

export function validateCustomColors(
  raw: unknown,
): CustomThemeColors {
  const base = { ...DEFAULT_CUSTOM }
  if (!raw || typeof raw !== 'object') return base
  const o = raw as Record<string, unknown>
  const hex = (v: unknown, fallback: string) =>
    typeof v === 'string' && /^#[0-9a-fA-F]{6}$/.test(v) ? v : fallback
  return {
    bg: hex(o.bg, base.bg),
    elevated: hex(o.elevated, base.elevated),
    ink: hex(o.ink, base.ink),
    muted: hex(o.muted, base.muted),
    accent: hex(o.accent, base.accent),
    accentWarm: hex(o.accentWarm, base.accentWarm),
  }
}

export function applyAppearanceToDocument(
  mode: AppearanceMode,
  custom: CustomThemeColors,
): void {
  const root = document.documentElement
  const resolved = resolveAppearance(mode)
  root.dataset.appearance = mode
  root.dataset.resolved = resolved
  root.classList.toggle('dark', resolved === 'dark')
  root.classList.toggle('bright', resolved === 'bright')

  if (mode === 'custom') {
    root.style.setProperty('--bg', custom.bg)
    root.style.setProperty('--bg-elevated', custom.elevated)
    root.style.setProperty('--card', custom.elevated)
    root.style.setProperty('--ink', custom.ink)
    root.style.setProperty('--muted', custom.muted)
    root.style.setProperty('--accent', custom.accent)
    root.style.setProperty('--accent-strong', custom.accent)
    root.style.setProperty('--accent-warm', custom.accentWarm)
    root.style.setProperty('--accent-soft', `${custom.accent}33`)
    root.style.setProperty('--line', `${custom.ink}22`)
    root.style.setProperty('--typed-ok', custom.ink)
  } else {
    ;[
      '--bg',
      '--bg-elevated',
      '--card',
      '--ink',
      '--muted',
      '--accent',
      '--accent-strong',
      '--accent-warm',
      '--accent-soft',
      '--line',
      '--typed-ok',
    ].forEach((p) => root.style.removeProperty(p))
  }
}
