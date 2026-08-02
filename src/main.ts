import './styles/main.css'
import './styles/tutor.css'
import './styles/treasure.css'

import { NAV, type AppView } from './app/types'
import {
  defaultProgress,
  isLessonUnlocked,
  loadProgress,
  markLessonComplete,
  recordKeyResult,
  saveProgress,
  touchStreak,
  type TutorProgress,
  type TitleId,
  type ThemeId,
  type HandSkinId,
  type KeycapSkinId,
} from './progress/store'
import { getLesson, LESSONS, type LessonMode } from './tutor/lessons'
import { TutorEngine } from './tutor/tutorEngine'
import { setHandHighlight, syncHandsToCurrentChar } from './tutor/handsView'
import { setKeyboardKeyState, renderKeyboardHtml } from './tutor/keyboardView'
import { renderOnboarding } from './ui/onboardingView'
import { patchLessonLive, renderLessonPlayer, renderTutorHub } from './ui/tutorView'
import {
  renderAnalytics,
  renderChestModal,
  renderCollection,
  renderSettings,
  renderSurpriseMap,
  renderTreasureRoom,
} from './ui/rewardViews'
import { renderPracticeArena } from './ui/practiceView'
import {
  applyChestToProgress,
  chestFromAccuracy,
  rollRewards,
  shouldSurpriseMap,
  streakChest,
} from './rewards/chests'
import type { ChestRarity } from './progress/store'
import { evaluateAchievements } from './rewards/achievements'
import {
  playChestOpen,
  playCoin,
  playCorrect,
  playLessonComplete,
  playWrong,
} from './audio/sounds'
import { getAssignment } from './tutor/fingerMap'
import { applyAppearanceToDocument, type AppearanceMode } from './core/theme'
import { loadSettings, saveSettings, type AppSettings } from './core/settings'
import { TypingEngine, type EngineState } from './core/typingEngine'
import { formatTime, wpmLevel } from './core/metrics'
import type { PracticeMode } from './core/sanitize'
import { escapeHtml } from './core/sanitize'
import { fetchPracticeContent } from './content/liveFetcher'
import { generateFallbackPassage, progressiveContent } from './content/fallback'

const rootEl = document.querySelector<HTMLDivElement>('#app')
if (!rootEl) throw new Error('Missing #app')
const root: HTMLDivElement = rootEl

let progress = loadProgress()
let view: AppView = progress.onboardingComplete ? 'tutor' : 'onboarding'
let lessonMode: LessonMode = 'guided'
let activeLessonId = progress.currentLessonId
const tutor = new TutorEngine()
let unsubTutor: (() => void) | null = null

// Speed arena state
let arenaSettings = loadSettings()
const arenaEngine = new TypingEngine()
let arenaNote = ''
let arenaSource: 'live' | 'offline' | '' = ''
let arenaLoading = false
let arenaWired = false
let unsubArena: (() => void) | null = null

function persist(): void {
  saveProgress(progress)
  applyChrome()
}

function applyChrome(): void {
  document.documentElement.dataset.theme = progress.activeTheme
  document.documentElement.dataset.keycap = progress.activeKeycap
  document.documentElement.dataset.anim = progress.animationSpeed
  applyAppearanceToDocument(progress.appearanceMode, progress.customTheme)
}

function formatTitle(id: string): string {
  return id
    .split('-')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

function rarityRank(r: ChestRarity): number {
  const order: ChestRarity[] = [
    'wooden',
    'bronze',
    'silver',
    'golden',
    'diamond',
    'legendary',
    'epic',
  ]
  return order.indexOf(r)
}

function betterRarity(a: ChestRarity, b: ChestRarity): ChestRarity {
  return rarityRank(a) >= rarityRank(b) ? a : b
}

function shell(content: string): string {
  const nav = NAV.map(
    (n) =>
      `<button type="button" class="nav-btn ${view === n.id || (view === 'lesson' && n.id === 'tutor') || (view === 'onboarding' && n.id === 'tutor') ? 'active' : ''}" data-nav="${n.id}" ${!progress.onboardingComplete && n.id !== 'tutor' && n.id !== 'settings' ? 'disabled' : ''}>
        <span class="nav-ico">${n.icon}</span><span>${n.label}</span>
      </button>`,
  ).join('')

  return `
  <div class="app-shell theme-${progress.activeTheme} keycap-${progress.activeKeycap}">
    <header class="topbar">
      <div class="brand">
        <div class="brand-mark">
          <img class="brand-logo" src="./icon-128.png" width="48" height="48" alt="Typing Practice" />
          <div>
            <h1>Typing Practice</h1>
            <p class="brand-sub">Tutor · Treasure · Speed · ${escapeHtml(formatTitle(progress.activeTitle))}</p>
          </div>
        </div>
      </div>
      <div class="wallet-mini" aria-label="Player stats">
        <span class="chip">Lv ${progress.level}</span>
        <span class="chip">Coins ${progress.coins}</span>
        <span class="chip">Gems ${progress.gems}</span>
        <span class="chip">Streak ${progress.streakDays}d</span>
      </div>
    </header>
    <nav class="main-nav">${nav}</nav>
    <div id="view-root" class="view-root">${content}</div>
    <p class="footer-note">Typing Practice · Accuracy earns better treasure · Accuracy before speed</p>
  </div>`
}

function render(): void {
  unsubTutor?.()
  unsubTutor = null
  arenaWired = false

  let content = ''
  if (view === 'onboarding') {
    content = renderOnboarding(progress.onboardingStep, progress.activeHand)
  } else if (view === 'tutor') {
    content = renderTutorHub(progress)
  } else if (view === 'lesson') {
    content = renderLessonPlayer(progress, null, lessonMode)
  } else if (view === 'practice') {
    content = renderPracticeArena(arenaSettings)
  } else if (view === 'treasure') {
    content = renderTreasureRoom(progress)
  } else if (view === 'collection') {
    content = renderCollection(progress)
  } else if (view === 'analytics') {
    content = renderAnalytics(progress)
  } else if (view === 'settings') {
    content = renderSettings(progress)
  }

  root.innerHTML = shell(content)
  applyChrome()
  wireGlobal()

  if (view === 'lesson') {
    startLessonSession(false)
  }
  if (view === 'practice') {
    wireArena()
    void loadArenaPassage()
  }
  if (view === 'onboarding') {
    wireOnboarding()
  }
  if (view === 'settings') {
    wireSettings()
  }
}

let globalWired = false

function wireGlobal(): void {
  // Nav buttons are recreated each render — bind each time
  root.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.nav as AppView
      if (!progress.onboardingComplete && id !== 'tutor' && id !== 'settings') return
      if (id === 'tutor' && !progress.onboardingComplete) {
        view = 'onboarding'
      } else {
        view = id
      }
      render()
    })
  })

  root.querySelectorAll('[data-open-lesson]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = (btn as HTMLElement).dataset.openLesson!
      if (!isLessonUnlocked(progress, id)) return
      activeLessonId = id
      view = 'lesson'
      lessonMode = 'guided'
      render()
    })
  })

  root.querySelectorAll('[data-lesson-mode]').forEach((btn) => {
    btn.addEventListener('click', () => {
      lessonMode = (btn as HTMLElement).dataset.lessonMode as LessonMode
      startLessonSession(true)
    })
  })

  if (globalWired) return
  globalWired = true

  root.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLElement>('[data-action]')
    if (!t?.dataset.action) return
    const action = t.dataset.action

    if (action === 'onboard-next') {
      progress = {
        ...progress,
        onboardingStep: Math.min(2, progress.onboardingStep + 1),
      }
      persist()
      render()
    }
    if (action === 'onboard-back') {
      progress = {
        ...progress,
        onboardingStep: Math.max(0, progress.onboardingStep - 1),
      }
      persist()
      render()
    }
    if (action === 'onboard-finish') {
      progress = {
        ...progress,
        onboardingComplete: true,
        onboardingStep: 2,
        currentLessonId: LESSONS[0]!.id,
      }
      persist()
      view = 'lesson'
      activeLessonId = LESSONS[0]!.id
      lessonMode = 'guided'
      render()
    }
    if (action === 'resume-lesson') {
      const next =
        LESSONS.find(
          (l) =>
            isLessonUnlocked(progress, l.id) &&
            !progress.completedLessons.includes(l.id),
        ) ?? getLesson(progress.currentLessonId) ?? LESSONS[0]!
      activeLessonId = next.id
      view = 'lesson'
      lessonMode = 'guided'
      render()
    }
    if (action === 'replay-onboarding') {
      progress = { ...progress, onboardingComplete: false, onboardingStep: 0 }
      persist()
      view = 'onboarding'
      render()
    }
    if (action === 'back-tutor') {
      view = 'tutor'
      render()
    }
    if (action === 'start-mode' || action === 'restart-mode') {
      startLessonSession(true)
    }
    if (action === 'close-chest') {
      document.querySelector('#chest-modal')?.remove()
      playCoin(progress.soundEnabled)
    }
    if (action === 'skip-map') {
      document.querySelector('#map-modal')?.remove()
    }
    if (action === 'start-map') {
      runSurpriseChallenge()
    }
    if (action === 'reset-progress') {
      if (confirm('Reset all tutor progress, treasure, and achievements?')) {
        progress = defaultProgress()
        persist()
        view = 'onboarding'
        render()
      }
    }
  })
}

function wireOnboarding(): void {
  root.querySelectorAll('[data-zone]').forEach((btn) => {
    btn.addEventListener('click', () => {
      root.querySelectorAll('.zone-pill').forEach((b) => b.classList.remove('active'))
      btn.classList.add('active')
      const zone = (btn as HTMLElement).dataset.zone!
      const kb = root.querySelector('#tour-keyboard')
      if (kb) {
        kb.innerHTML = renderKeyboardHtml({ highlightZone: zone })
      }
    })
  })
  // animate home row hands
  setHandHighlight(root, 'left', 'index', 'idle', 'Left: A S D F · Right: J K L ;')
}

function wireSettings(): void {
  const bind = (id: string, fn: (v: string | boolean) => void) => {
    const el = root.querySelector(`#${id}`)
    el?.addEventListener('change', () => {
      if (el instanceof HTMLInputElement && el.type === 'checkbox') fn(el.checked)
      else if (el instanceof HTMLSelectElement || el instanceof HTMLInputElement) fn(el.value)
      persist()
      applyChrome()
    })
  }

  const appearance = root.querySelector<HTMLSelectElement>('#set-appearance')
  appearance?.addEventListener('change', () => {
    const mode = appearance.value as AppearanceMode
    progress = { ...progress, appearanceMode: mode }
    const panel = root.querySelector('#custom-theme-panel')
    panel?.classList.toggle('hidden', mode !== 'custom')
    persist()
    applyChrome()
    // Re-render settings so color panel state stays in sync when switching away/to custom
    if (view === 'settings') render()
  })

  const bindColor = (id: string, key: keyof typeof progress.customTheme) => {
    root.querySelector<HTMLInputElement>(`#${id}`)?.addEventListener('input', (e) => {
      const value = (e.target as HTMLInputElement).value
      progress = {
        ...progress,
        customTheme: { ...progress.customTheme, [key]: value },
      }
      persist()
      applyChrome()
    })
  }
  bindColor('cust-bg', 'bg')
  bindColor('cust-elevated', 'elevated')
  bindColor('cust-ink', 'ink')
  bindColor('cust-muted', 'muted')
  bindColor('cust-accent', 'accent')
  bindColor('cust-warm', 'accentWarm')

  bind('set-sound', (v) => {
    progress = { ...progress, soundEnabled: Boolean(v) }
  })
  bind('set-narration', (v) => {
    progress = { ...progress, narrationEnabled: Boolean(v) }
  })
  bind('set-anim', (v) => {
    progress = {
      ...progress,
      animationSpeed: v as TutorProgress['animationSpeed'],
    }
  })
  bind('set-diff', (v) => {
    progress = {
      ...progress,
      difficulty: v as TutorProgress['difficulty'],
    }
  })
  bind('set-theme', (v) => {
    progress = { ...progress, activeTheme: v as ThemeId }
  })
  bind('set-hand', (v) => {
    progress = { ...progress, activeHand: v as HandSkinId }
  })
  bind('set-keycap', (v) => {
    progress = { ...progress, activeKeycap: v as KeycapSkinId }
  })
  bind('set-title', (v) => {
    progress = { ...progress, activeTitle: v as TitleId }
  })

  // Follow OS theme live when "system" is selected
  const mq = window.matchMedia('(prefers-color-scheme: dark)')
  const onScheme = () => {
    if (progress.appearanceMode === 'system') applyChrome()
  }
  mq.removeEventListener?.('change', onScheme)
  mq.addEventListener?.('change', onScheme)
}

function startLessonSession(focus: boolean): void {
  const lesson = getLesson(activeLessonId) ?? LESSONS[0]!
  progress = { ...progress, currentLessonId: lesson.id }
  persist()

  // Re-render player chrome with mode chips
  const viewRoot = root.querySelector('#view-root')
  if (viewRoot) {
    viewRoot.innerHTML = renderLessonPlayer(progress, null, lessonMode)
    // re-bind lesson-specific buttons inside view
    viewRoot.querySelectorAll('[data-lesson-mode]').forEach((btn) => {
      btn.addEventListener('click', () => {
        lessonMode = (btn as HTMLElement).dataset.lessonMode as LessonMode
        startLessonSession(true)
      })
    })
  }

  unsubTutor?.()
  tutor.start(lesson, lessonMode)
  unsubTutor = tutor.subscribe((state) => {
    patchLessonLive(root, state)
    const cur = state.current
    // Always mirror the NEXT character to type (never the previous key)
    syncHandsToCurrentChar(
      root,
      cur?.char,
      state.lastError ? 'reach' : 'press',
      cur?.explanation,
    )
    setKeyboardKeyState(
      root,
      cur?.char ?? null,
      state.lastError ? 'wrong' : 'target',
    )
    if (state.status === 'finished') {
      void onLessonFinished(state)
    }
  })

  const input = root.querySelector<HTMLInputElement>('#tutor-input')
  if (input) {
    input.value = ''
    input.onkeydown = (e) => {
      if (e.key === 'Tab') e.preventDefault()
      if (e.key.length !== 1 && e.key !== ' ') return
      e.preventDefault()
      const ch = e.key
      const result = tutor.handleChar(ch)
      const assign = getAssignment(result.expected)
      const next = tutor.getState()

      if (result.correct) {
        playCorrect(progress.soundEnabled)
        if (assign) {
          progress = recordKeyResult(
            progress,
            result.expected,
            true,
            assign.finger,
            assign.hand,
            result.reactionMs,
          )
          // Brief flash on the key just pressed, then lock onto the next target
          setKeyboardKeyState(root, result.expected, 'correct')
        }
        persist()
      } else if (result.expected) {
        playWrong(progress.soundEnabled)
        if (assign) {
          progress = recordKeyResult(
            progress,
            result.expected,
            false,
            assign.finger,
            assign.hand,
            0,
          )
          setKeyboardKeyState(root, result.expected, 'wrong')
        }
        persist()
      }

      // Hands + coach always follow the current target character in parallel
      syncHandsToCurrentChar(
        root,
        next.current?.char,
        result.correct ? 'press' : 'reach',
        next.current?.explanation ?? next.lastError ?? undefined,
      )
      if (next.current?.char && result.correct) {
        setKeyboardKeyState(root, next.current.char, 'target')
      }
    }
    if (focus) input.focus()
    else setTimeout(() => input?.focus(), 50)
  }
}

let lessonFinishToken = ''

async function onLessonFinished(state: ReturnType<TutorEngine['getState']>): Promise<void> {
  const token = `${state.lesson.id}-${state.startedAt}-${state.endedAt}`
  if (lessonFinishToken === token) return
  lessonFinishToken = token

  playLessonComplete(progress.soundEnabled)
  progress = touchStreak(progress)
  const accuracy = state.metrics.accuracy
  const wpm = state.metrics.wpm
  const words = Math.max(1, Math.round(state.typed.length / 5))
  progress = {
    ...progress,
    totalWords: progress.totalWords + words,
  }

  const passed = accuracy >= state.lesson.passAccuracy
  if (passed) {
    progress = markLessonComplete(progress, state.lesson.id, accuracy, wpm)
  }

  // Accuracy first: failing the pass gate still gives a soft wooden chest only
  let rarity: ChestRarity = passed
    ? chestFromAccuracy(accuracy)
    : 'wooden'
  const streakBonus = streakChest(progress.streakDays)
  if (
    passed &&
    [3, 7, 15, 30, 100].includes(progress.streakDays) &&
    streakBonus
  ) {
    rarity = betterRarity(rarity, streakBonus)
  }

  const rewards = rollRewards(rarity, accuracy, wpm)
  progress = applyChestToProgress(progress, {
    at: Date.now(),
    rarity,
    lessonId: state.lesson.id,
    lessonTitle: state.lesson.title,
    accuracy,
    wpm,
    rewards,
  })

  const ach = evaluateAchievements(progress, {
    accuracy,
    wpm,
    mistakes: state.mistakes,
    lessonId: state.lesson.id,
  })
  progress = ach.progress
  persist()

  playChestOpen(progress.soundEnabled)
  const passNote = passed
    ? undefined
    : [
        `Need ${state.lesson.passAccuracy}% to unlock the next lesson (you scored ${accuracy}%). Keep practicing — accuracy first.`,
      ]
  showModal(
    renderChestModal(rarity, rewards, {
      achievements: [
        ...(ach.unlocked.map((a) => a.title)),
        ...(passNote ?? []),
      ],
      surprise: false,
    }),
  )

  if (passed && shouldSurpriseMap() && accuracy >= 90) {
    setTimeout(() => {
      if (!document.querySelector('#map-modal')) showModal(renderSurpriseMap())
    }, 600)
  }
}

function showModal(html: string): void {
  document.querySelectorAll('.modal-backdrop').forEach((m) => {
    if (m.id !== 'chest-modal') m.remove()
  })
  root.insertAdjacentHTML('beforeend', html)
  // confetti particles
  const confetti = root.querySelector('.confetti')
  if (confetti) {
    confetti.innerHTML = Array.from({ length: 40 }, (_, i) => {
      const left = Math.random() * 100
      const delay = Math.random() * 0.8
      const color = ['#3b82f6', '#f97316', '#5ec8ff', '#fbbf24', '#38bdf8'][i % 5]
      return `<i style="left:${left}%;animation-delay:${delay}s;background:${color}"></i>`
    }).join('')
  }
}

function runSurpriseChallenge(): void {
  const modal = document.querySelector('#map-modal')
  const input = document.querySelector<HTMLInputElement>('#map-input')
  const target = '() {} [] == => && ||'
  let idx = 0
  let mistakes = 0
  if (!input) return
  input.focus()
  input.onkeydown = (e) => {
    if (e.key.length !== 1 && e.key !== ' ') return
    e.preventDefault()
    if (e.key === target[idx]) {
      idx++
      playCorrect(progress.soundEnabled)
      if (idx >= target.length) {
        const accuracy = Math.round(((target.length - mistakes) / target.length) * 100)
        modal?.remove()
        if (accuracy >= 90) {
          const rewards = rollRewards('epic', accuracy, 40)
          progress = applyChestToProgress(progress, {
            at: Date.now(),
            rarity: 'epic',
            lessonId: 'surprise-map',
            lessonTitle: 'Pirate Treasure Map',
            accuracy,
            wpm: 40,
            rewards,
          })
          persist()
          playChestOpen(progress.soundEnabled)
          showModal(renderChestModal('epic', rewards, { surprise: true }))
        }
      }
    } else {
      mistakes++
      playWrong(progress.soundEnabled)
    }
  }
  void modal
}

/* ---------- Speed Arena (preserved) ---------- */

function wireArena(): void {
  if (arenaWired) return
  arenaWired = true
  unsubArena?.()

  const syncControls = () => {
    const difficulty = root.querySelector<HTMLSelectElement>('#difficulty')
    const duration = root.querySelector<HTMLSelectElement>('#duration')
    const sentenceType = root.querySelector<HTMLSelectElement>('#sentence-type')
    const progressive = root.querySelector<HTMLSelectElement>('#progressive-level')
    const codeMode = root.querySelector<HTMLInputElement>('#code-mode')
    if (difficulty) difficulty.value = arenaSettings.difficulty
    if (duration) duration.value = String(arenaSettings.duration)
    if (sentenceType) sentenceType.value = arenaSettings.sentenceType
    if (progressive) progressive.value = String(arenaSettings.progressiveLevel)
    if (codeMode) codeMode.checked = arenaSettings.codeTypingMode
  }
  syncControls()

  root.querySelector('#mode-grid')?.addEventListener('click', (e) => {
    const t = (e.target as HTMLElement).closest<HTMLButtonElement>('[data-mode]')
    if (!t?.dataset.mode) return
    arenaSettings = { ...arenaSettings, mode: t.dataset.mode as PracticeMode }
    saveSettings(arenaSettings)
    render()
  })

  const bindSel = (id: string, key: keyof AppSettings, cast: (v: string) => unknown) => {
    root.querySelector(`#${id}`)?.addEventListener('change', (e) => {
      arenaSettings = {
        ...arenaSettings,
        [key]: cast((e.target as HTMLSelectElement).value),
      } as AppSettings
      saveSettings(arenaSettings)
      void loadArenaPassage()
    })
  }
  bindSel('difficulty', 'difficulty', (v) => v)
  bindSel('duration', 'duration', (v) => Number(v))
  bindSel('sentence-type', 'sentenceType', (v) => v)
  bindSel('progressive-level', 'progressiveLevel', (v) => Number(v))
  root.querySelector('#code-mode')?.addEventListener('change', (e) => {
    arenaSettings = {
      ...arenaSettings,
      codeTypingMode: (e.target as HTMLInputElement).checked,
    }
    saveSettings(arenaSettings)
    void loadArenaPassage()
  })

  root.querySelector('#btn-new')?.addEventListener('click', () => void loadArenaPassage())
  root.querySelector('#btn-restart')?.addEventListener('click', () => {
    const input = root.querySelector<HTMLTextAreaElement>('#typing-input')
    if (input) input.value = ''
    arenaEngine.reset()
    input?.focus()
  })
  root.querySelector('#btn-focus')?.addEventListener('click', () => {
    root.querySelector<HTMLTextAreaElement>('#typing-input')?.focus()
  })
  root.querySelector('#typing-stage')?.addEventListener('click', () => {
    root.querySelector<HTMLTextAreaElement>('#typing-input')?.focus()
  })

  const input = root.querySelector<HTMLTextAreaElement>('#typing-input')
  input?.addEventListener('input', () => arenaEngine.handleInput(input.value))
  input?.addEventListener('keydown', (e) => arenaEngine.handleKeydown(e))

  unsubArena = arenaEngine.subscribe(updateArena)
}

function updateArena(state: EngineState): void {
  const prompt = root.querySelector('#prompt')
  if (prompt) {
    if (arenaLoading) {
      prompt.innerHTML = `<span class="loading">Fetching fresh practice content…</span>`
    } else {
      let html = ''
      for (let i = 0; i < state.target.length; i++) {
        const expected = state.target[i]!
        const display = expected === ' ' ? '&nbsp;' : escapeHtml(expected)
        if (i < state.typed.length) {
          html += `<span class="char ${state.typed[i] === expected ? 'correct' : 'incorrect'}">${display}</span>`
        } else if (i === state.typed.length) {
          html += `<span class="char current">${display}</span>`
        } else {
          html += `<span class="char upcoming">${display}</span>`
        }
      }
      prompt.innerHTML = html || `<span class="loading">Click New practice</span>`
    }
  }
  const m = state.metrics
  const set = (id: string, v: string) => {
    const el = root.querySelector(`#${id}`)
    if (el) el.textContent = v
  }
  set('stat-wpm', String(m.wpm))
  set('stat-level', state.status === 'ready' || state.status === 'idle' ? '—' : wpmLevel(m.wpm))
  set('stat-acc', `${m.accuracy}%`)
  set('stat-mistakes', String(m.mistakes))
  set('stat-progress', `${m.progress}%`)
  set('stat-time', formatTime(m.elapsedMs))
  const fill = root.querySelector<HTMLDivElement>('#progress-fill')
  if (fill) fill.style.width = `${m.progress}%`
  const sourceLabel = root.querySelector('#source-label')
  const sourceBadge = root.querySelector('#source-badge')
  if (sourceLabel) sourceLabel.textContent = arenaNote || 'Ready'
  if (sourceBadge) {
    sourceBadge.innerHTML =
      arenaSource === 'live'
        ? `<span class="badge badge-live">Live</span>`
        : arenaSource === 'offline'
          ? `<span class="badge badge-offline">Offline</span>`
          : ''
  }
  const results = root.querySelector('#results')
  const grid = root.querySelector('#results-grid')
  if (results && grid && state.status === 'finished') {
    results.classList.add('visible')
    grid.innerHTML = `
      <div class="stat"><div class="label">Final WPM</div><div class="value">${m.wpm}</div></div>
      <div class="stat"><div class="label">Accuracy</div><div class="value">${m.accuracy}%</div></div>
      <div class="stat"><div class="label">Mistakes</div><div class="value">${m.mistakes}</div></div>
      <div class="stat"><div class="label">Time</div><div class="value">${formatTime(m.elapsedMs)}</div></div>`
    // award arena chest once
    awardArenaChest(m.accuracy, m.wpm)
  } else {
    results?.classList.remove('visible')
  }
}

let lastArenaAwardToken = ''
function awardArenaChest(accuracy: number, wpm: number): void {
  const token = `${arenaEngine.getState().startedAt}-${arenaEngine.getState().endedAt}`
  if (!token || lastArenaAwardToken === token) return
  lastArenaAwardToken = token
  progress = touchStreak(progress)
  const rarity = chestFromAccuracy(accuracy)
  const rewards = rollRewards(rarity, accuracy, wpm)
  progress = applyChestToProgress(progress, {
    at: Date.now(),
    rarity,
    lessonId: 'arena',
    lessonTitle: 'Speed Arena',
    accuracy,
    wpm,
    rewards,
  })
  const ach = evaluateAchievements(progress, {
    accuracy,
    wpm,
    mistakes: 0,
    lessonId: 'arena',
  })
  progress = ach.progress
  persist()
  playChestOpen(progress.soundEnabled)
  showModal(
    renderChestModal(rarity, rewards, {
      achievements: ach.unlocked.map((a) => a.title),
    }),
  )
}

async function loadArenaPassage(): Promise<void> {
  arenaLoading = true
  updateArena(arenaEngine.getState())
  const input = root.querySelector<HTMLTextAreaElement>('#typing-input')
  if (input) input.value = ''
  const banner = root.querySelector('#error-banner')
  banner?.classList.remove('visible')

  try {
    let text = ''
    const preferCode = arenaSettings.codeTypingMode || arenaSettings.mode === 'code'
    switch (arenaSettings.mode) {
      case 'beginner':
        text = generateFallbackPassage({ kind: 'beginner', difficulty: arenaSettings.difficulty })
        arenaSource = 'offline'
        arenaNote = 'Beginner alphabet'
        break
      case 'homerow':
        text = generateFallbackPassage({ kind: 'homerow', difficulty: arenaSettings.difficulty })
        arenaSource = 'offline'
        arenaNote = 'Home-row drill'
        break
      case 'numbers':
        text = generateFallbackPassage({ kind: 'numbers', difficulty: arenaSettings.difficulty })
        arenaSource = 'offline'
        arenaNote = 'Number-row practice'
        break
      case 'symbols':
        text = generateFallbackPassage({ kind: 'symbols', difficulty: arenaSettings.difficulty })
        arenaSource = 'offline'
        arenaNote = 'Symbol drills'
        break
      case 'code':
        text = generateFallbackPassage({ kind: 'code', difficulty: arenaSettings.difficulty })
        arenaSource = 'offline'
        arenaNote = 'Programming text'
        break
      case 'progressive':
        text = progressiveContent(arenaSettings.progressiveLevel, arenaSettings.difficulty)
        arenaSource = 'offline'
        arenaNote = `Week ${arenaSettings.progressiveLevel}`
        break
      default: {
        const result = await fetchPracticeContent({
          preferCode,
          difficulty: arenaSettings.difficulty,
          offlineKind:
            arenaSettings.sentenceType === 'code'
              ? 'code'
              : arenaSettings.sentenceType === 'mixed'
                ? 'mixed'
                : 'prose',
        })
        text = result.text
        arenaSource = result.source
        arenaNote = result.message ?? ''
        if (result.source === 'offline' && banner) {
          banner.textContent = 'Live content unavailable — offline fallback loaded.'
          banner.classList.add('visible')
        }
      }
    }
    arenaEngine.load(text, arenaSettings.duration)
  } catch {
    const fallback = generateFallbackPassage({
      kind: 'prose',
      difficulty: arenaSettings.difficulty,
    })
    arenaSource = 'offline'
    arenaNote = 'Network error — offline fallback'
    arenaEngine.load(fallback, arenaSettings.duration)
  } finally {
    arenaLoading = false
    updateArena(arenaEngine.getState())
    input?.focus()
  }
}

applyChrome()
render()
