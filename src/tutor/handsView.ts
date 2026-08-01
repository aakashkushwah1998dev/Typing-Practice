/**
 * SVG animated hands — highlight active finger in sync with the target key.
 */

import {
  explainKey,
  fingerLabel,
  getAssignment,
  type Finger,
  type Hand,
} from './fingerMap'

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
  const order =
    side === 'left'
      ? (['pinky', 'ring', 'middle', 'index', 'thumb'] as Finger[])
      : (['thumb', 'index', 'middle', 'ring', 'pinky'] as Finger[])

  const fingers = order
    .map((f, i) => {
      const x = 18 + i * 28
      const h =
        f === 'middle' ? 78 : f === 'index' ? 72 : f === 'ring' ? 68 : f === 'pinky' ? 58 : 42
      const y = f === 'thumb' ? 78 : 18
      const rot = f === 'thumb' ? (side === 'left' ? -40 : 40) : 0
      return `
      <g class="finger" data-finger="${f}" data-hand="${side}" transform="translate(${x} ${y}) rotate(${rot})">
        <rect class="finger-bone" x="-8" y="0" width="16" height="${h}" rx="8" />
        <circle class="finger-tip" cx="0" cy="0" r="9" />
        <title>${side} ${f}</title>
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

function clearHighlights(root: ParentNode): void {
  root.querySelectorAll('.finger').forEach((el) => {
    el.classList.remove('is-active', 'is-press', 'is-reach', 'is-return')
  })
}

function selectFingers(root: ParentNode, hand: Hand, finger: Finger): Element[] {
  if (hand === 'either') {
    return [...root.querySelectorAll(`.finger[data-finger="${finger}"]`)]
  }
  return [
    ...root.querySelectorAll(
      `.finger[data-finger="${finger}"][data-hand="${hand}"]`,
    ),
  ]
}

export function setHandHighlight(
  root: ParentNode,
  hand: Hand | null,
  finger: Finger | null,
  anim: HandAnim,
  caption?: string,
): void {
  clearHighlights(root)

  if (hand && finger) {
    selectFingers(root, hand, finger).forEach((el) => {
      el.classList.add('is-active')
      if (anim === 'press') el.classList.add('is-press')
      if (anim === 'reach') el.classList.add('is-reach')
      if (anim === 'return') el.classList.add('is-return')
    })
  }

  const cap = root.querySelector('#hands-caption')
  if (cap) {
    if (caption) cap.textContent = caption
    else if (hand && finger) cap.textContent = `Use your ${fingerLabel(finger, hand)}`
  }
}

/** Keep hands locked to the character the user must type now. */
export function syncHandsToCurrentChar(
  root: ParentNode,
  ch: string | null | undefined,
  anim: HandAnim = 'press',
  caption?: string,
): void {
  if (!ch) {
    clearHighlights(root)
    const cap = root.querySelector('#hands-caption')
    if (cap) cap.textContent = 'Rest on the home row'
    return
  }
  const a = getAssignment(ch)
  if (!a) {
    clearHighlights(root)
    return
  }
  setHandHighlight(root, a.hand, a.finger, anim, caption ?? explainKey(ch))
}

export { FINGER_IDS }
