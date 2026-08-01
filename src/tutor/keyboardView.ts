/**
 * Interactive visual keyboard renderer.
 */

import { KEYBOARD_ROWS, getAssignment, requiresShift } from './fingerMap'

export type KeyVisualState = 'idle' | 'target' | 'correct' | 'wrong' | 'zone'

export function renderKeyboardHtml(options?: {
  highlightZone?: string | null
  activeKey?: string | null
  state?: KeyVisualState
}): string {
  const zone = options?.highlightZone ?? null
  const active = options?.activeKey ?? null
  const state = options?.state ?? 'idle'

  const rows = KEYBOARD_ROWS.map((row) => {
    const keys = row
      .map((k) => {
        const wide =
          k === 'Backspace' || k === 'Enter' || k === 'Tab' || k === 'CapsLock'
            ? 'key-wide'
            : k.startsWith('Shift')
              ? 'key-shift'
              : k === ' '
                ? 'key-space'
                : k.startsWith('Control') || k.startsWith('Alt') || k.startsWith('Meta')
                  ? 'key-mod'
                  : ''

        const assign = getAssignment(k.length === 1 ? k : ' ')
        const keyZone =
          k === ' ' ? 'Spacebar' : assign?.zone ?? (k.includes('Shift') ? 'Modifiers' : 'Modifiers')

        let cls = `key ${wide}`
        if (zone && (keyZone === zone || (zone === 'Home row' && 'asdfghjkl;'.includes(k)))) {
          cls += ' key-zone'
        }
        if (active && normalizeActive(active) === normalizeActive(k)) {
          cls += ` key-${state === 'idle' ? 'target' : state}`
        }
        if (active && requiresShift(active) && (k === 'ShiftLeft' || k === 'ShiftRight')) {
          const hand = getAssignment(active)?.hand
          if (
            (hand === 'left' && k === 'ShiftRight') ||
            (hand === 'right' && k === 'ShiftLeft') ||
            hand === 'either'
          ) {
            cls += ' key-target'
          }
        }

        const label =
          k === ' '
            ? 'Space'
            : k === 'ShiftLeft' || k === 'ShiftRight'
              ? 'Shift'
              : k === 'ControlLeft' || k === 'ControlRight'
                ? 'Ctrl'
                : k === 'AltLeft' || k === 'AltRight'
                  ? 'Alt'
                  : k === 'MetaLeft'
                    ? 'Win'
                    : k === 'CapsLock'
                      ? 'Caps'
                      : k === 'Backspace'
                        ? '⌫'
                        : k

        const dataKey = k.length === 1 ? k : k
        return `<button type="button" class="${cls}" data-key="${escapeAttr(dataKey)}" tabindex="-1">${escapeAttr(label)}</button>`
      })
      .join('')
    return `<div class="kb-row">${keys}</div>`
  }).join('')

  return `<div class="visual-keyboard" aria-hidden="true">${rows}</div>`
}

function normalizeActive(k: string): string {
  if (k.length === 1) return k.toLowerCase()
  return k
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')
}

export function setKeyboardKeyState(
  root: ParentNode,
  key: string | null,
  state: KeyVisualState,
): void {
  root.querySelectorAll('.key').forEach((el) => {
    el.classList.remove('key-target', 'key-correct', 'key-wrong', 'key-press')
  })
  if (!key) return
  const want = normalizeActive(key)
  root.querySelectorAll('.key').forEach((el) => {
    const dk = (el as HTMLElement).dataset.key ?? ''
    if (normalizeActive(dk) === want) {
      el.classList.add(`key-${state}`)
      el.classList.add('key-press')
    }
  })
  if (requiresShift(key)) {
    const hand = getAssignment(key)?.hand
    const shiftSel =
      hand === 'left' ? '[data-key="ShiftRight"]' : '[data-key="ShiftLeft"]'
    root.querySelector(shiftSel)?.classList.add('key-target')
  }
}
