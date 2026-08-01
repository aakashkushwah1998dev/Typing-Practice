import { escapeHtml } from '../core/sanitize'
import { LESSONS } from '../tutor/lessons'
import {
  isLessonUnlocked,
  type TutorProgress,
  xpForLevel,
} from '../progress/store'
import { formatTime } from '../core/metrics'
import type { TutorSessionState } from '../tutor/tutorEngine'
import { renderKeyboardHtml } from '../tutor/keyboardView'
import { renderHandsHtml } from '../tutor/handsView'
import type { LessonMode } from '../tutor/lessons'

export function renderTutorHub(p: TutorProgress): string {
  const xpNext = xpForLevel(p.level + 1)
  const xpPrev = xpForLevel(p.level)
  const xpPct = Math.min(100, Math.round(((p.xp - xpPrev) / Math.max(1, xpNext - xpPrev)) * 100))

  const cards = LESSONS.map((lesson) => {
    const unlocked = isLessonUnlocked(p, lesson.id)
    const done = p.completedLessons.includes(lesson.id)
    const best = p.lessonBest[lesson.id]
    return `
      <button type="button" class="lesson-card ${unlocked ? '' : 'locked'} ${done ? 'done' : ''}" data-open-lesson="${lesson.id}" ${unlocked ? '' : 'disabled'}>
        <div class="lesson-order">Lesson ${lesson.order}</div>
        <h3>${escapeHtml(lesson.title)}</h3>
        <p>${escapeHtml(lesson.subtitle)}</p>
        <div class="lesson-meta">
          ${done ? `<span class="tag tag-ok">Completed · ${best?.stars ?? 0}★</span>` : unlocked ? `<span class="tag">Unlocked</span>` : `<span class="tag tag-lock">Locked</span>`}
          ${best ? `<span class="tag">${best.accuracy}% · ${best.wpm} WPM</span>` : ''}
          ${lesson.programmer ? `<span class="tag tag-code">Programmer</span>` : ''}
        </div>
      </button>`
  }).join('')

  return `
  <section class="tutor-hub">
    <div class="hero-banner panel">
      <div class="panel-body hero-grid">
        <div>
          <p class="eyebrow">Beginner Typing Tutor</p>
          <h2>Learn how to type — then get fast</h2>
          <p class="lede">Guided fingers, animated hands, and lessons that unlock step by step. Accuracy earns better treasure.</p>
          <div class="hero-stats">
            <div><strong>Lv ${p.level}</strong><span>Level</span></div>
            <div><strong>${p.coins}</strong><span>Coins</span></div>
            <div><strong>${p.gems}</strong><span>Gems</span></div>
            <div><strong>${p.streakDays}d</strong><span>Streak</span></div>
            <div><strong>${p.bestWpm}</strong><span>Best WPM</span></div>
          </div>
          <div class="xp-bar"><div class="xp-fill" style="width:${xpPct}%"></div></div>
          <p class="hint">${p.xp} XP · next level at ${xpNext} XP · Title: ${escapeHtml(p.activeTitle)}</p>
        </div>
        <div class="hero-cta">
          <button type="button" class="btn btn-primary" data-action="resume-lesson">Continue learning</button>
          <button type="button" class="btn" data-action="replay-onboarding">Replay intro</button>
        </div>
      </div>
    </div>
    <div class="lesson-grid">${cards}</div>
  </section>`
}

export function renderLessonPlayer(
  p: TutorProgress,
  state: TutorSessionState | null,
  mode: LessonMode,
): string {
  const lesson = state?.lesson ?? LESSONS.find((l) => l.id === p.currentLessonId) ?? LESSONS[0]!
  const modes: LessonMode[] = ['guided', 'practice', 'challenge', 'timed']
  const modeBtns = modes
    .map(
      (m) =>
        `<button type="button" class="mode-chip ${m === mode ? 'active' : ''}" data-lesson-mode="${m}">${m}</button>`,
    )
    .join('')

  const cur = state?.current
  const prompt = renderPrompt(state)

  return `
  <section class="lesson-player">
    <div class="panel">
      <div class="panel-body">
        <div class="lesson-head">
          <div>
            <button type="button" class="btn btn-ghost" data-action="back-tutor">← Lessons</button>
            <h2>${escapeHtml(lesson.title)}</h2>
            <p class="lede">${escapeHtml(lesson.why)}</p>
          </div>
          <div class="mode-chips">${modeBtns}</div>
        </div>

        <div class="live-feedback">
          <div class="stat"><div class="label">Accuracy</div><div class="value" id="t-acc">${state?.metrics.accuracy ?? 100}%</div></div>
          <div class="stat"><div class="label">Mistakes</div><div class="value" id="t-mistakes">${state?.mistakes ?? 0}</div></div>
          <div class="stat"><div class="label">WPM</div><div class="value" id="t-wpm">${state?.metrics.wpm ?? 0}</div></div>
          <div class="stat"><div class="label">Best WPM</div><div class="value">${p.bestWpm}</div></div>
          <div class="stat"><div class="label">Finger</div><div class="value value-sm" id="t-finger">${cur?.finger ? escapeHtml(cur.hand + ' ' + cur.finger) : '—'}</div></div>
          <div class="stat"><div class="label">Key</div><div class="value" id="t-key">${cur ? escapeHtml(cur.char === ' ' ? 'Space' : cur.char) : '—'}</div></div>
          <div class="stat"><div class="label">Progress</div><div class="value" id="t-progress">${state?.metrics.progress ?? 0}%</div></div>
          <div class="stat"><div class="label">Time</div><div class="value" id="t-time">${formatTime(state?.metrics.elapsedMs ?? 0)}</div></div>
        </div>

        <div class="coach-line" id="coach-line">${escapeHtml(cur?.explanation ?? 'Press Start to begin guided practice.')}</div>
        <div class="error-line ${state?.lastError ? 'visible' : ''}" id="error-line">${escapeHtml(state?.lastError ?? '')}</div>

        <div class="target-stage" id="target-stage">
          <div class="big-target" id="big-target">${cur ? escapeHtml(cur.char === ' ' ? '␣' : cur.char) : 'Ready'}</div>
          <div class="prompt-line" id="prompt-line">${prompt}</div>
          <input class="tutor-input" id="tutor-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Tutor typing input" />
        </div>

        ${renderHandsHtml(p.activeHand)}
        <div id="lesson-keyboard">${renderKeyboardHtml({
          activeKey: cur?.char ?? null,
          state: 'target',
        })}</div>

        <div class="onboard-actions">
          <button type="button" class="btn btn-primary" data-action="start-mode">Start ${mode}</button>
          <button type="button" class="btn" data-action="restart-mode">Restart</button>
        </div>
      </div>
    </div>
  </section>`
}

function renderPrompt(state: TutorSessionState | null): string {
  if (!state) return ''
  if (state.mode === 'guided') {
    return `<span class="guided-hint">Key ${state.index + 1} of ${state.sequence.length}</span>`
  }
  let html = ''
  for (let i = 0; i < state.sequence.length; i++) {
    const ch = state.sequence[i]!
    const shown = ch === ' ' ? '&nbsp;' : escapeHtml(ch)
    if (i < state.index) {
      const ok = state.typed[i] === ch
      html += `<span class="char ${ok ? 'correct' : 'incorrect'}">${shown}</span>`
    } else if (i === state.index) {
      html += `<span class="char current">${shown}</span>`
    } else {
      html += `<span class="char upcoming">${shown}</span>`
    }
  }
  return html
}

export function patchLessonLive(root: ParentNode, state: TutorSessionState): void {
  const set = (id: string, v: string) => {
    const el = root.querySelector(`#${id}`)
    if (el) el.textContent = v
  }
  set('t-acc', `${state.metrics.accuracy}%`)
  set('t-mistakes', String(state.mistakes))
  set('t-wpm', String(state.metrics.wpm))
  set('t-progress', `${state.metrics.progress}%`)
  set('t-time', formatTime(state.metrics.elapsedMs))
  const cur = state.current
  set('t-finger', cur?.finger ? `${cur.hand} ${cur.finger}` : '—')
  set('t-key', cur ? (cur.char === ' ' ? 'Space' : cur.char) : '—')

  const coach = root.querySelector('#coach-line')
  if (coach && cur) coach.textContent = cur.explanation

  const err = root.querySelector('#error-line')
  if (err) {
    err.textContent = state.lastError ?? ''
    err.classList.toggle('visible', Boolean(state.lastError))
  }

  const big = root.querySelector('#big-target')
  if (big) big.textContent = cur ? (cur.char === ' ' ? '␣' : cur.char) : state.status === 'finished' ? '✓' : 'Ready'

  const prompt = root.querySelector('#prompt-line')
  if (prompt) prompt.innerHTML = renderPrompt(state)
}
