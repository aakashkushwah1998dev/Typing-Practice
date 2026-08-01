/**
 * Offline / local practice content: home row, numbers, symbols, code, beginner.
 * Seeded so each session still feels varied without network.
 */

import type { Difficulty } from '../core/sanitize'

function mulberry32(seed: number): () => number {
  return () => {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function pick<T>(rng: () => number, items: T[]): T {
  return items[Math.floor(rng() * items.length)]!
}

function shuffle<T>(rng: () => number, arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[a[i], a[j]] = [a[j]!, a[i]!]
  }
  return a
}

const HOME_KEYS = 'asdfjkl;'
const HOME_WORDS = [
  'a', 'as', 'ask', 'add', 'all', 'fall', 'sad', 'dad', 'lad', 'flask',
  'salad', 'alaska', 'jade', 'lake', 'fade', 'deal', 'leaf', 'salad',
  'asks', 'falls', 'lass', 'fads', 'jars', 'lads', 'skald', 'flask',
]

const BEGINNER_ALPHABET = [
  'a b c d e f g h i j k l m',
  'n o p q r s t u v w x y z',
  'the quick brown fox jumps',
  'pack my box with five dozen',
  'how vexingly quick daft zebras jump',
  'sphinx of black quartz judge my vow',
  'the five boxing wizards jump quickly',
  'a lazy dog sat by the warm fire',
  'type each letter with care and return home',
  'keep your eyes on the screen not the keys',
]

const NUMBER_DRILLS = [
  '1234567890 0987654321',
  '1 2 3 4 5 6 7 8 9 0',
  '11 22 33 44 55 66 77 88 99 00',
  '10 20 30 40 50 60 70 80 90',
  '192.168.0.1 255.255.255.0',
  'port 8080 listens on 127.0.0.1',
  'call me at 555-0182 then dial 42',
  'year 2026 week 12 day 7 hour 15',
]

const SYMBOL_DRILLS = [
  '( ) ( ) ( ) [ ] [ ] [ ] { } { } { }',
  '( [ { } ] ) ( [ { } ] ) ( [ { } ] )',
  '= == === != !== < > <= >=',
  '+ - * / % ** // += -= *= /=',
  '&& || ! & | ^ << >>',
  '; ; ; : : : , , , . . . _ _ _',
  '" " " \' \' \' ` ` ` \\n \\t \\\\',
  '{ } [ ] ( ) => <= >= != ===',
  'path = "/mnt/user-data/"; print(f"Hi, {name}!")',
  'SELECT * FROM users WHERE age > 18;',
]

const CODE_SNIPPETS = [
  'def foo(): pass',
  'if (x == 1) { return true; }',
  'total += price * (1 - discount)',
  'self.name = name; self.age = age',
  'for i, val in enumerate(data):',
  'const sum = (a, b) => a + b;',
  'fn main() { println!("hello"); }',
  'public static void main(String[] args) {}',
  'let mut map = HashMap::new();',
  'async function fetchData(url: string) {',
  'try { await client.connect(); } catch (e) {}',
  'interface User { id: number; name: string; }',
  'SELECT id, name FROM accounts WHERE active = 1;',
  'npm install && npm run build',
  'git commit -m "fix: sanitize live quotes"',
  'docker run -p 8080:80 --rm app:latest',
  'arr.filter((x) => x > 0).map((x) => x * 2)',
  'while (queue.length) { const n = queue.shift(); }',
  'export default function App() { return null; }',
  'chmod +x ./scripts/setup.sh && ./scripts/setup.sh',
]

const PROSE_FALLBACK = [
  'Accuracy before speed is the golden rule of touch typing.',
  'Rest your fingers on the home row and return after every key.',
  'Programmers type symbols far more often than prose tutors teach.',
  'Light touch and floating wrists keep strain away during long sessions.',
  'Fifteen focused minutes a day beats a two hour cram once a week.',
  'Never look at the keyboard; keep your eyes on the screen always.',
  'Flow state thrives when typing becomes automatic and invisible.',
  'Number row symbols deserve deliberate practice for fluent code.',
  'Raised bumps on F and J help you find home without looking down.',
  'A misplaced character in code does not just look bad; it breaks the build.',
]

function expandHomeRow(rng: () => number, difficulty: Difficulty): string {
  const count = difficulty === 'beginner' ? 12 : difficulty === 'intermediate' ? 20 : 28
  const words = Array.from({ length: count }, () => pick(rng, HOME_WORDS))
  if (difficulty === 'beginner') {
    return words.join(' ')
  }
  const extras = shuffle(rng, HOME_KEYS.split('')).join(' ')
  return `${words.join(' ')} ${extras}`
}

function joinUnique(rng: () => number, pool: string[], count: number): string {
  const shuffled = shuffle(rng, pool)
  return shuffled.slice(0, Math.min(count, shuffled.length)).join(' ')
}

export function generateFallbackPassage(options: {
  kind: 'beginner' | 'homerow' | 'numbers' | 'symbols' | 'code' | 'prose' | 'mixed'
  difficulty: Difficulty
  seed?: number
}): string {
  const seed = options.seed ?? (Date.now() ^ (Math.random() * 0xffffffff))
  const rng = mulberry32(seed >>> 0)
  const { kind, difficulty } = options

  switch (kind) {
    case 'beginner':
      return joinUnique(rng, BEGINNER_ALPHABET, difficulty === 'beginner' ? 2 : 3)
    case 'homerow':
      return expandHomeRow(rng, difficulty)
    case 'numbers':
      return joinUnique(rng, NUMBER_DRILLS, difficulty === 'advanced' ? 3 : 2)
    case 'symbols':
      return joinUnique(rng, SYMBOL_DRILLS, difficulty === 'beginner' ? 2 : 3)
    case 'code':
      return joinUnique(rng, CODE_SNIPPETS, difficulty === 'beginner' ? 2 : difficulty === 'intermediate' ? 3 : 4)
    case 'mixed': {
      const parts = [
        pick(rng, PROSE_FALLBACK),
        pick(rng, CODE_SNIPPETS),
        pick(rng, SYMBOL_DRILLS),
      ]
      return shuffle(rng, parts).join(' ')
    }
    case 'prose':
    default:
      return joinUnique(rng, PROSE_FALLBACK, difficulty === 'beginner' ? 2 : 3)
  }
}

export function progressiveContent(level: number, difficulty: Difficulty, seed?: number): string {
  const week = Math.min(4, Math.max(1, level))
  if (week === 1) return generateFallbackPassage({ kind: 'homerow', difficulty, seed })
  if (week === 2) {
    return [
      generateFallbackPassage({ kind: 'numbers', difficulty, seed }),
      generateFallbackPassage({ kind: 'symbols', difficulty, seed: (seed ?? 1) + 7 }),
    ].join(' ')
  }
  if (week === 3) {
    return [
      generateFallbackPassage({ kind: 'symbols', difficulty, seed }),
      generateFallbackPassage({ kind: 'code', difficulty, seed: (seed ?? 1) + 11 }),
    ].join(' ')
  }
  return [
    generateFallbackPassage({ kind: 'code', difficulty, seed }),
    generateFallbackPassage({ kind: 'prose', difficulty, seed: (seed ?? 1) + 13 }),
  ].join(' ')
}
