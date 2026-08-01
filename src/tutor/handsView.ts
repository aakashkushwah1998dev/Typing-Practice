/**
 * SVG animated hands — highlight active finger / press / return.
 */

import type { Finger, Hand } from './fingerMap'

export type HandAnim = 'idle' | 'reach' | 'press' | 'return'

const FINGER_IDS: Finger[] = ['pinky', 'ring', 'middle', 'index', 'thumb']

export function renderHandsHtml(skin: string = 'classic'): string {
  return `
  <div class="hands-stage skin-${skin}" aria-hidden="true">
    ${handSvg('left')}
    ${handSvg('right')}
    <div class="hands-caption" id="hands-caption">Rest on the home row</div>
  </div>`
}

function handSvg(side: Hand): string {
  // Simplified top-down hand silhouette with finger groups
  const order =
    side === 'left'
      ? (['pinky', 'ring', 'middle', 'index', 'thumb'] as Finger[])
      : (['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[])

  const fingers = order
    .map((f, i) => {
      const x = 18 + i * 28
      const h = f === 'middle' ? 78 : f === 'index' ? 72 : f === 'ring' ? 68 : f === 'pinky' ? 58 : 42
      const y = f === 'thumb' ? 70 : 22
      const rot = f === 'thumb' ? (side === 'left' ? -35 : 35) : 0
      return `
      <g class="finger finger-${f}" data-finger="${f}" data-hand="${side}" transform="translate(${x} ${y}) rotate(${rot})">
        <rect class="finger-bone" x="-8" y="0" width="16" height="${h}" rx="8" />
        <circle class="finger-tip" cx="0" cy="0" r="9" />
      </g>`
    })
    .join('')

  return `
  <svg class="hand-svg hand-${side}" viewBox="0 0 160 160" width="180" height="180">
    <ellipse class="palm" cx="80" cy="118" rx="52" ry="28" />
    ${fingers}
    <text x="80" y="155" text-anchor="middle" class="hand-label">${side === 'left' ? 'Left' : 'Right'}</text>
  </svg>`
}

export function setHandHighlight(
  root: ParentNode,
  hand: Hand | null,
  finger: Finger | null,
  anim: HandAnim,
  caption?: string,
): void {
  root.querySelectorAll('.finger').forEach((el) => {
    el.classList.remove('is-active', 'is-press', 'is-reach', 'is-return')
  })

  if (hand && finger) {
    const targets =
      hand === 'either'
        ? root.querySelectorAll(`.finger-${finger}`)
        : root.querySelectorAll(`.finger-${finger}[data-hand="${hand}"]`)
    targets.forEach((el) => {
      el.classList.add('is-active')
      if (anim === 'press') el.classList.add('is-press')
      if (anim === 'reach') el.classList.add('is-reach')
      if (anim === 'return') el.classList.add('is-return')
    })
  }

  const cap = root.querySelector('#hands-caption')
  if (cap && caption) cap.textContent = caption
}

export { FINGER_IDS }
