/**
 * Complete QWERTY finger assignment map.
 * Every practice key knows which hand + finger presses it.
 */

export type Hand = 'left' | 'right' | 'either'
export type Finger =
  | 'pinky'
  | 'ring'
  | 'middle'
  | 'index'
  | 'thumb'

export interface KeyAssignment {
  key: string
  display: string
  shiftDisplay?: string
  finger: Finger
  hand: Hand
  row: 'number' | 'top' | 'home' | 'bottom' | 'space' | 'modifier' | 'function' | 'nav'
  zone: string
}

const L = (finger: Finger): Pick<KeyAssignment, 'finger' | 'hand'> => ({
  finger,
  hand: 'left',
})
const R = (finger: Finger): Pick<KeyAssignment, 'finger' | 'hand'> => ({
  finger,
  hand: 'right',
})

/** Lowercase / unshifted base characters → assignment */
const BASE: Record<string, Omit<KeyAssignment, 'key' | 'display'>> = {
  '`': { ...L('pinky'), row: 'number', zone: 'Number row', shiftDisplay: '~' },
  '1': { ...L('pinky'), row: 'number', zone: 'Number row', shiftDisplay: '!' },
  '2': { ...L('ring'), row: 'number', zone: 'Number row', shiftDisplay: '@' },
  '3': { ...L('middle'), row: 'number', zone: 'Number row', shiftDisplay: '#' },
  '4': { ...L('index'), row: 'number', zone: 'Number row', shiftDisplay: '$' },
  '5': { ...L('index'), row: 'number', zone: 'Number row', shiftDisplay: '%' },
  '6': { ...R('index'), row: 'number', zone: 'Number row', shiftDisplay: '^' },
  '7': { ...R('index'), row: 'number', zone: 'Number row', shiftDisplay: '&' },
  '8': { ...R('middle'), row: 'number', zone: 'Number row', shiftDisplay: '*' },
  '9': { ...R('ring'), row: 'number', zone: 'Number row', shiftDisplay: '(' },
  '0': { ...R('pinky'), row: 'number', zone: 'Number row', shiftDisplay: ')' },
  '-': { ...R('pinky'), row: 'number', zone: 'Number row', shiftDisplay: '_' },
  '=': { ...R('pinky'), row: 'number', zone: 'Number row', shiftDisplay: '+' },

  q: { ...L('pinky'), row: 'top', zone: 'Top letter row' },
  w: { ...L('ring'), row: 'top', zone: 'Top letter row' },
  e: { ...L('middle'), row: 'top', zone: 'Top letter row' },
  r: { ...L('index'), row: 'top', zone: 'Top letter row' },
  t: { ...L('index'), row: 'top', zone: 'Top letter row' },
  y: { ...R('index'), row: 'top', zone: 'Top letter row' },
  u: { ...R('index'), row: 'top', zone: 'Top letter row' },
  i: { ...R('middle'), row: 'top', zone: 'Top letter row' },
  o: { ...R('ring'), row: 'top', zone: 'Top letter row' },
  p: { ...R('pinky'), row: 'top', zone: 'Top letter row' },
  '[': { ...R('pinky'), row: 'top', zone: 'Top letter row', shiftDisplay: '{' },
  ']': { ...R('pinky'), row: 'top', zone: 'Top letter row', shiftDisplay: '}' },
  '\\': { ...R('pinky'), row: 'top', zone: 'Top letter row', shiftDisplay: '|' },

  a: { ...L('pinky'), row: 'home', zone: 'Home row' },
  s: { ...L('ring'), row: 'home', zone: 'Home row' },
  d: { ...L('middle'), row: 'home', zone: 'Home row' },
  f: { ...L('index'), row: 'home', zone: 'Home row' },
  g: { ...L('index'), row: 'home', zone: 'Home row' },
  h: { ...R('index'), row: 'home', zone: 'Home row' },
  j: { ...R('index'), row: 'home', zone: 'Home row' },
  k: { ...R('middle'), row: 'home', zone: 'Home row' },
  l: { ...R('ring'), row: 'home', zone: 'Home row' },
  ';': { ...R('pinky'), row: 'home', zone: 'Home row', shiftDisplay: ':' },
  "'": { ...R('pinky'), row: 'home', zone: 'Home row', shiftDisplay: '"' },

  z: { ...L('pinky'), row: 'bottom', zone: 'Bottom row' },
  x: { ...L('ring'), row: 'bottom', zone: 'Bottom row' },
  c: { ...L('middle'), row: 'bottom', zone: 'Bottom row' },
  v: { ...L('index'), row: 'bottom', zone: 'Bottom row' },
  b: { ...L('index'), row: 'bottom', zone: 'Bottom row' },
  n: { ...R('index'), row: 'bottom', zone: 'Bottom row' },
  m: { ...R('index'), row: 'bottom', zone: 'Bottom row' },
  ',': { ...R('middle'), row: 'bottom', zone: 'Bottom row', shiftDisplay: '<' },
  '.': { ...R('ring'), row: 'bottom', zone: 'Bottom row', shiftDisplay: '>' },
  '/': { ...R('pinky'), row: 'bottom', zone: 'Bottom row', shiftDisplay: '?' },

  ' ': { finger: 'thumb', hand: 'either', row: 'space', zone: 'Spacebar' },
}

/** Shifted character → base key */
const SHIFT_CHARS: Record<string, string> = {
  '~': '`',
  '!': '1',
  '@': '2',
  '#': '3',
  $: '4',
  '%': '5',
  '^': '6',
  '&': '7',
  '*': '8',
  '(': '9',
  ')': '0',
  _: '-',
  '+': '=',
  '{': '[',
  '}': ']',
  '|': '\\',
  ':': ';',
  '"': "'",
  '<': ',',
  '>': '.',
  '?': '/',
}

const MODIFIERS: KeyAssignment[] = [
  { key: 'Tab', display: 'Tab', finger: 'pinky', hand: 'left', row: 'modifier', zone: 'Modifiers' },
  { key: 'CapsLock', display: 'Caps', finger: 'pinky', hand: 'left', row: 'modifier', zone: 'Modifiers' },
  { key: 'ShiftLeft', display: 'Shift', finger: 'pinky', hand: 'left', row: 'modifier', zone: 'Modifiers' },
  { key: 'ShiftRight', display: 'Shift', finger: 'pinky', hand: 'right', row: 'modifier', zone: 'Modifiers' },
  { key: 'ControlLeft', display: 'Ctrl', finger: 'pinky', hand: 'left', row: 'modifier', zone: 'Modifiers' },
  { key: 'ControlRight', display: 'Ctrl', finger: 'pinky', hand: 'right', row: 'modifier', zone: 'Modifiers' },
  { key: 'AltLeft', display: 'Alt', finger: 'thumb', hand: 'left', row: 'modifier', zone: 'Modifiers' },
  { key: 'AltRight', display: 'Alt', finger: 'thumb', hand: 'right', row: 'modifier', zone: 'Modifiers' },
  { key: 'MetaLeft', display: 'Win', finger: 'thumb', hand: 'left', row: 'modifier', zone: 'Modifiers' },
  { key: 'Enter', display: 'Enter', finger: 'pinky', hand: 'right', row: 'modifier', zone: 'Modifiers' },
  { key: 'Backspace', display: 'Back', finger: 'pinky', hand: 'right', row: 'modifier', zone: 'Modifiers' },
]

export function normalizeChar(ch: string): string {
  if (ch.length !== 1) return ch
  const lower = ch.toLowerCase()
  if (BASE[lower]) return lower
  if (SHIFT_CHARS[ch]) return SHIFT_CHARS[ch]!
  return ch
}

export function requiresShift(ch: string): boolean {
  if (ch.length !== 1) return false
  if (ch >= 'A' && ch <= 'Z') return true
  return ch in SHIFT_CHARS
}

export function getAssignment(ch: string): KeyAssignment | null {
  if (ch === ' ') {
    return { key: ' ', display: 'Space', ...BASE[' ']! }
  }
  const base = normalizeChar(ch)
  const info = BASE[base]
  if (!info) return null
  return {
    key: base,
    display: ch,
    ...info,
  }
}

export function fingerLabel(finger: Finger, hand: Hand): string {
  const side =
    hand === 'either' ? 'Either' : hand === 'left' ? 'Left' : 'Right'
  const names: Record<Finger, string> = {
    pinky: 'little (pinky)',
    ring: 'ring',
    middle: 'middle',
    index: 'index',
    thumb: 'thumb',
  }
  return `${side} ${names[finger]} finger`
}

export function explainKey(ch: string): string {
  const a = getAssignment(ch)
  if (!a) return `Press “${ch}”.`
  const shift = requiresShift(ch) ? ' Hold Shift, then' : ''
  return `${shift} use your ${fingerLabel(a.finger, a.hand)} for “${ch}” on the ${a.zone.toLowerCase()}.`.trim()
}

export function getAllBaseKeys(): string[] {
  return Object.keys(BASE)
}

export function getModifiers(): KeyAssignment[] {
  return MODIFIERS
}

/** Visual keyboard layout rows (display keys) */
export const KEYBOARD_ROWS: string[][] = [
  ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
  ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
  ['CapsLock', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', "'", 'Enter'],
  ['ShiftLeft', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftRight'],
  ['ControlLeft', 'MetaLeft', 'AltLeft', ' ', 'AltRight', 'ControlRight'],
]

export const HOME_ROW_LEFT = ['a', 's', 'd', 'f']
export const HOME_ROW_RIGHT = ['j', 'k', 'l', ';']
export const HOME_ROW = [...HOME_ROW_LEFT, 'g', 'h', ...HOME_ROW_RIGHT]
