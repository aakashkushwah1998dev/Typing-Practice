/**
 * Onboarding + progressive typing lessons with unlock gating.
 */

export type LessonMode = 'guided' | 'practice' | 'challenge' | 'timed'
export type LessonCategory =
  | 'onboarding'
  | 'foundation'
  | 'rows'
  | 'symbols'
  | 'words'
  | 'code'

export interface LessonDef {
  id: string
  order: number
  category: LessonCategory
  title: string
  subtitle: string
  why: string
  /** Characters unlocked / taught in this lesson */
  keys: string[]
  /** Cumulative allowed characters for practice text */
  allowed: string[]
  drills: {
    guided: string[]
    practice: string[]
    challenge: string[]
    timed: string[]
  }
  /** Seconds for timed mode */
  timedSeconds: number
  /** Min accuracy (0-100) to unlock next */
  passAccuracy: number
  programmer?: boolean
}

function seq(chars: string[]): string[] {
  return chars.flatMap((c) => [c, c, c, c])
}

function wordsFrom(pool: string[], list: string[]): string[] {
  return list.filter((w) => [...w].every((ch) => pool.includes(ch) || ch === ' '))
}

const HOME_L = ['a', 's', 'd', 'f']
const HOME_R = ['j', 'k', 'l', ';']
const HOME = [...HOME_L, ...HOME_R]
const HOME_G = [...HOME, 'g', 'h']
const TOP = ['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']
const BOTTOM = ['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']
const NUMS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
const SHIFT_SYMS = ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')']

export const ONBOARDING_STEPS = [
  {
    id: 'intro-touch',
    title: 'What is Touch Typing?',
    kind: 'story' as const,
  },
  {
    id: 'intro-keyboard',
    title: 'Meet Your Keyboard',
    kind: 'keyboard-tour' as const,
  },
  {
    id: 'intro-homerow',
    title: 'Home Row Position',
    kind: 'homerow' as const,
  },
] as const

export const LESSONS: LessonDef[] = [
  {
    id: 'l1-home-left',
    order: 1,
    category: 'foundation',
    title: 'Home Row — Left Hand',
    subtitle: 'A S D F',
    why: 'Your left hand rests on A S D F. Every left-hand keystroke starts and ends here. Build the return habit before chasing speed.',
    keys: HOME_L,
    allowed: [...HOME_L, ' '],
    drills: {
      guided: seq(HOME_L),
      practice: ['a', 's', 'd', 'f', 'as', 'ad', 'af', 'sa', 'sd', 'sf', 'da', 'ds', 'df', 'fa', 'fs', 'fd', 'asdf', 'asdf'],
      challenge: ['asdf asdf', 'fads', 'adds', 'sad', 'dad', 'fad', 'sass'],
      timed: ['asdf asdf asdf sad dad fad adds'],
    },
    timedSeconds: 30,
    passAccuracy: 85,
  },
  {
    id: 'l2-home-right',
    order: 2,
    category: 'foundation',
    title: 'Home Row — Right Hand',
    subtitle: 'J K L ;',
    why: 'Right hand rests on J K L ;. Find the raised bump on J without looking — that is your anchor.',
    keys: HOME_R,
    allowed: [...HOME_R, ' '],
    drills: {
      guided: seq(HOME_R),
      practice: ['j', 'k', 'l', ';', 'jk', 'jl', 'j;', 'kj', 'kl', 'k;', 'lj', 'lk', 'l;', ';j', ';k', ';l', 'jkl;', 'jkl;'],
      challenge: ['jkl; jkl;', 'kk', 'll', 'jj', ';k', 'lkj'],
      timed: ['jkl; jkl; jkl; kk ll jj'],
    },
    timedSeconds: 30,
    passAccuracy: 85,
  },
  {
    id: 'l3-home-combine',
    order: 3,
    category: 'foundation',
    title: 'Home Row Combined',
    subtitle: 'A S D F · J K L ;',
    why: 'Both hands work together. Type a letter, return home, then the next. Speed is a side effect of clean returns.',
    keys: HOME,
    allowed: [...HOME, ' '],
    drills: {
      guided: ['a', 'j', 's', 'k', 'd', 'l', 'f', ';', 'a', 'j', 's', 'k'],
      practice: wordsFrom([...HOME, ' '], [
        'a', 'as', 'ask', 'dad', 'sad', 'fad', 'fall', 'all', 'lad', 'lass',
        'flask', 'salad', 'alfalfa', 'jazz', 'jak', 'dak', 'skald',
      ]).concat(['asdf jkl;', 'fall', 'salad', 'asks']),
      challenge: ['dad sad fall', 'ask all lads', 'flask salad', 'asdf jkl; asdf jkl;'],
      timed: ['dad sad fall ask all lads flask salad asdf jkl;'],
    },
    timedSeconds: 45,
    passAccuracy: 88,
  },
  {
    id: 'l4-home-gh',
    order: 4,
    category: 'foundation',
    title: 'Home Row Reach — G H',
    subtitle: 'Index finger reaches',
    why: 'G and H are reach zones for your index fingers. Resist cheating with the wrong finger — discomfort is temporary.',
    keys: ['g', 'h'],
    allowed: [...HOME_G, ' '],
    drills: {
      guided: seq(['g', 'h', 'f', 'j', 'g', 'h']),
      practice: ['fg', 'jh', 'gf', 'hj', 'gh', 'hg', 'flag', 'glad', 'half', 'flash', 'glass', 'shall'],
      challenge: ['flash glass', 'half glad', 'shall ask', 'flag falls'],
      timed: ['flash glass half glad shall ask flag falls'],
    },
    timedSeconds: 45,
    passAccuracy: 88,
  },
  {
    id: 'l5-top-row',
    order: 5,
    category: 'rows',
    title: 'Top Letter Row',
    subtitle: 'Q W E R T Y U I O P',
    why: 'Reach straight up from home. Return after every key. Top-row letters power most English words.',
    keys: TOP,
    allowed: [...HOME_G, ...TOP, ' '],
    drills: {
      guided: seq(['q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p']),
      practice: ['frf', 'juj', 'ded', 'kik', 'sws', 'lol', 'aqa', ';p;', 'ftf', 'jyj', 'were', 'you', 'type', 'quiet', 'power'],
      challenge: ['quiet power', 'were you', 'try type', 'just ask', 'pretty fast'],
      timed: ['quiet power were you try type just ask pretty fast'],
    },
    timedSeconds: 60,
    passAccuracy: 88,
  },
  {
    id: 'l6-bottom-row',
    order: 6,
    category: 'rows',
    title: 'Bottom Letter Row',
    subtitle: 'Z X C V B N M , . /',
    why: 'Reach down from home, then return. Commas, periods, and slash appear constantly in code and prose.',
    keys: BOTTOM,
    allowed: [...HOME_G, ...TOP, ...BOTTOM, ' '],
    drills: {
      guided: seq(['z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/']),
      practice: ['fvf', 'jmj', 'cdc', 'k,k', 'sxs', 'l.l', 'aza', ';/;', 'vb', 'nm', 'mix', 'can', 'box', 'zoom'],
      challenge: ['mix can box', 'zoom next', 'calm vibe', 'next, please.'],
      timed: ['mix can box zoom next calm vibe next, please.'],
    },
    timedSeconds: 60,
    passAccuracy: 88,
  },
  {
    id: 'l7-numbers',
    order: 7,
    category: 'rows',
    title: 'Number Row',
    subtitle: '1 2 3 4 5 6 7 8 9 0',
    why: 'Each finger reaches straight up its column. Number fluency separates hunt-and-peck from fluid coding.',
    keys: NUMS,
    allowed: [...HOME_G, ...TOP, ...BOTTOM, ...NUMS, ' ', '-', '='],
    drills: {
      guided: seq(NUMS),
      practice: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '12', '34', '56', '78', '90', '123', '456', '7890'],
      challenge: ['1234567890', '10 20 30', '42 7 99', '8080 443'],
      timed: ['1234567890 10 20 30 42 7 99 8080 443'],
    },
    timedSeconds: 60,
    passAccuracy: 90,
  },
  {
    id: 'l8-shift',
    order: 8,
    category: 'symbols',
    title: 'Shift & Capitals',
    subtitle: 'Opposite-hand Shift',
    why: 'Capital letters use the opposite pinky on Shift while the other hand types the letter. Never shift with the same hand awkwardly if you can avoid it.',
    keys: ['A', 'S', 'D', 'F', 'J', 'K', 'L'],
    allowed: [...HOME_G, ...TOP, ...BOTTOM, ...NUMS, ' ', 'A', 'S', 'D', 'F', 'J', 'K', 'L', 'T', 'H', 'E'],
    drills: {
      guided: ['A', 'S', 'D', 'F', 'J', 'K', 'L', 'T', 'H', 'E'],
      practice: ['A', 'Ask', 'Dad', 'Fall', 'Jazz', 'The', 'She', 'Lake', 'Fast', 'Just'],
      challenge: ['Ask Dad', 'The Lake', 'Just Fast', 'She Said'],
      timed: ['Ask Dad The Lake Just Fast She Said Hello'],
    },
    timedSeconds: 60,
    passAccuracy: 90,
  },
  {
    id: 'l9-symbols',
    order: 9,
    category: 'symbols',
    title: 'Common Symbols',
    subtitle: '! @ # $ % ^ & * ( )',
    why: 'Shift + number row creates the symbols prose tutors ignore and programmers need constantly.',
    keys: SHIFT_SYMS,
    allowed: [...HOME_G, ...TOP, ...BOTTOM, ...NUMS, ...SHIFT_SYMS, ' ', '-', '_', '=', '+'],
    drills: {
      guided: seq(SHIFT_SYMS),
      practice: ['!', '@', '#', '$', '%', '^', '&', '*', '(', ')', '(!)', '@#', '$%', '&*', '()'],
      challenge: ['(1+2)*3', 'a@b.com', '#todo', '$price', 'a && b'],
      timed: ['(1+2)*3 a@b.com #todo $price a && b'],
    },
    timedSeconds: 60,
    passAccuracy: 90,
  },
  {
    id: 'l10-prog-symbols',
    order: 10,
    category: 'symbols',
    title: 'Programming Symbols',
    subtitle: '() {} [] <> == =>',
    why: 'Brackets, braces, arrows, and operators are the heart of code typing. Practice them slowly and accurately.',
    keys: ['(', ')', '{', '}', '[', ']', '<', '>', '=', '!', '+', '-', '*', '&', '|', ':', ';'],
    allowed: [
      ...'abcdefghijklmnopqrstuvwxyz'.split(''),
      ...'0123456789'.split(''),
      ...' (){}[]<>=!+-*/&|:;_.,"\''.split(''),
      ' ',
    ],
    drills: {
      guided: ['(', ')', '{', '}', '[', ']', '<', '>', '=', '=', '!', '+', '-', '*', '&', '|', ':', ';'],
      practice: ['()', '{}', '[]', '<>', '==', '===', '!=', '+=', '-=', '*=', '&&', '||', '::', '->', '=>'],
      challenge: ['if (x == 1) {}', 'arr[0] += 1', 'a && b || c', 'fn => x', 'a != b'],
      timed: ['() {} [] == === != += && || => -> ::'],
    },
    timedSeconds: 75,
    passAccuracy: 92,
    programmer: true,
  },
  {
    id: 'l11-words',
    order: 11,
    category: 'words',
    title: 'Words',
    subtitle: 'Real vocabulary',
    why: 'Letters become words. Keep eyes on the screen and let muscle memory assemble common patterns.',
    keys: [],
    allowed: [...'abcdefghijklmnopqrstuvwxyz ;,./'.split(''), ' '],
    drills: {
      guided: ['the', 'and', 'for', 'you', 'type', 'code', 'fast', 'slow', 'home', 'row'],
      practice: [
        'the and for you',
        'type code well',
        'home row first',
        'accuracy before speed',
        'return after every key',
      ],
      challenge: [
        'practice makes permanent',
        'look at the screen always',
        'fingers return home',
      ],
      timed: [
        'accuracy before speed practice makes permanent look at the screen always fingers return home',
      ],
    },
    timedSeconds: 60,
    passAccuracy: 90,
  },
  {
    id: 'l12-sentences',
    order: 12,
    category: 'words',
    title: 'Sentences',
    subtitle: 'Flowing prose',
    why: 'Connect words into sentences. Rhythm matters more than raw speed at this stage.',
    keys: [],
    allowed: [...'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ ;,./\'\"'.split(''), ' '],
    drills: {
      guided: [
        'Type with care.',
        'Keep your wrists light.',
        'Return to home row.',
      ],
      practice: [
        'Accuracy comes before speed every session.',
        'Rest your fingers on the home row bumps.',
        'Never look down at the keyboard while learning.',
      ],
      challenge: [
        'Fifteen focused minutes beat a long unfocused session.',
        'Programmers type symbols more than most tutors teach.',
      ],
      timed: [
        'Accuracy comes before speed. Rest on the home row. Never look down. Fifteen focused minutes beat a long cram.',
      ],
    },
    timedSeconds: 90,
    passAccuracy: 92,
  },
  {
    id: 'l13-python',
    order: 13,
    category: 'code',
    title: 'Python Drills',
    subtitle: 'def, :, indent style',
    why: 'Retype familiar Python patterns so symbols and naming feel automatic.',
    keys: [],
    allowed: [],
    drills: {
      guided: ['def', 'return', 'if', 'else', 'for', 'in', 'print'],
      practice: [
        'def foo(): pass',
        'for i, val in enumerate(data):',
        'print(f"Hello, {name}!")',
        'total += price * (1 - discount)',
      ],
      challenge: [
        'def greet(name: str) -> str:\n    return f"Hi, {name}"'.replace('\n', ' '),
        'self.name = name; self.age = age',
      ],
      timed: [
        'def foo(): pass for i, val in enumerate(data): print(f"Hello, {name}!") total += price * (1 - discount)',
      ],
    },
    timedSeconds: 90,
    passAccuracy: 92,
    programmer: true,
  },
  {
    id: 'l14-javascript',
    order: 14,
    category: 'code',
    title: 'JavaScript Drills',
    subtitle: '=> {} ===',
    why: 'Arrows, braces, and strict equality show up in almost every JS file.',
    keys: [],
    allowed: [],
    drills: {
      guided: ['const', 'let', '=>', '===', '!==', '{}', '[]'],
      practice: [
        'const sum = (a, b) => a + b;',
        'if (x === 1) { return true; }',
        'arr.filter((x) => x > 0)',
        'async function fetchData(url) {}',
      ],
      challenge: [
        'try { await client.connect(); } catch (e) {}',
        'export default function App() { return null; }',
      ],
      timed: [
        'const sum = (a, b) => a + b; if (x === 1) { return true; } arr.filter((x) => x > 0)',
      ],
    },
    timedSeconds: 90,
    passAccuracy: 92,
    programmer: true,
  },
  {
    id: 'l15-sql-cpp',
    order: 15,
    category: 'code',
    title: 'SQL & C++ Style',
    subtitle: 'Queries and operators',
    why: 'SQL punctuation and C-family operators round out programmer fluency.',
    keys: [],
    allowed: [],
    drills: {
      guided: ['SELECT', 'FROM', 'WHERE', '::', '->', '&&', '||'],
      practice: [
        'SELECT * FROM users WHERE age > 18;',
        'SELECT id, name FROM accounts WHERE active = 1;',
        'a && b || c',
        'ptr->value = 0;',
      ],
      challenge: [
        'std::vector<int> nums;',
        'if (ptr != nullptr) { ptr->run(); }',
      ],
      timed: [
        'SELECT * FROM users WHERE age > 18; a && b || c; ptr->value = 0;',
      ],
    },
    timedSeconds: 90,
    passAccuracy: 92,
    programmer: true,
  },
]

export function getLesson(id: string): LessonDef | undefined {
  return LESSONS.find((l) => l.id === id)
}

export function getNextLesson(currentId: string): LessonDef | undefined {
  const cur = getLesson(currentId)
  if (!cur) return LESSONS[0]
  return LESSONS.find((l) => l.order === cur.order + 1)
}

export function firstLockedLesson(completedIds: string[]): LessonDef | undefined {
  return LESSONS.find((l) => !completedIds.includes(l.id))
}

/** Avoid unused import lint if PROG_SYMS unused - use in export for programmer kit */
export const PROGRAMMER_OPERATORS = [
  '()',
  '{}',
  '[]',
  '<>',
  '==',
  '===',
  '!=',
  '+=',
  '-=',
  '*=',
  '&&',
  '||',
  '::',
  '->',
  '=>',
]
