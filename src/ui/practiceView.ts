/**
 * Speed Arena — existing live/drill practice modes (preserved).
 */

import type { PracticeMode } from '../core/sanitize'
import type { AppSettings } from '../core/settings'

const MODE_META: Record<PracticeMode, { title: string; blurb: string }> = {
  live: { title: 'Live sentences', blurb: 'Fresh web content each run' },
  beginner: { title: 'Beginner alphabet', blurb: 'Simple letters and pangrams' },
  homerow: { title: 'Home row drills', blurb: 'A S D F · J K L ;' },
  numbers: { title: 'Number row', blurb: 'Digits and patterns' },
  symbols: { title: 'Symbol drills', blurb: 'Brackets and operators' },
  code: { title: 'Programming text', blurb: 'Code-like snippets' },
  progressive: { title: '4-week plan', blurb: 'Gradual difficulty ramp' },
}

export function renderPracticeArena(settings: AppSettings): string {
  const modes = (Object.keys(MODE_META) as PracticeMode[])
    .map((mode) => {
      const meta = MODE_META[mode]
      const active = settings.mode === mode ? 'active' : ''
      return `<button type="button" class="mode-btn ${active}" data-mode="${mode}"><strong>${meta.title}</strong><span>${meta.blurb}</span></button>`
    })
    .join('')

  return `
  <div class="layout practice-layout">
    <aside class="panel">
      <div class="panel-body">
        <h2>Speed modes</h2>
        <div class="mode-grid" id="mode-grid">${modes}</div>
        <h2>Settings</h2>
        <div class="field"><label for="difficulty">Difficulty</label>
          <select id="difficulty">
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </select>
        </div>
        <div class="field"><label for="duration">Test duration</label>
          <select id="duration">
            <option value="30">30 seconds</option>
            <option value="60">60 seconds</option>
            <option value="90">90 seconds</option>
            <option value="120">2 minutes</option>
            <option value="0">Complete the passage</option>
          </select>
        </div>
        <div class="field"><label for="sentence-type">Sentence type</label>
          <select id="sentence-type">
            <option value="prose">Prose</option>
            <option value="mixed">Mixed</option>
            <option value="code">Code-leaning</option>
          </select>
        </div>
        <div class="field"><label for="progressive-level">Progressive week</label>
          <select id="progressive-level">
            <option value="1">Week 1</option>
            <option value="2">Week 2</option>
            <option value="3">Week 3</option>
            <option value="4">Week 4</option>
          </select>
        </div>
        <div class="field row"><label for="code-mode">Code typing mode</label><input type="checkbox" id="code-mode" /></div>
        <p class="hint">Finish the Tutor lessons first for best results. Arena is for speed once technique is solid.</p>
      </div>
    </aside>
    <main>
      <div class="error-banner" id="error-banner" role="alert"></div>
      <section class="panel"><div class="panel-body">
        <div class="top-actions" style="margin-bottom:0.75rem">
          <button type="button" class="btn btn-primary" id="btn-new">New practice</button>
          <button type="button" class="btn" id="btn-restart">Restart</button>
          <button type="button" class="btn btn-ghost" id="btn-focus">Focus input</button>
        </div>
        <div class="stats">
          <div class="stat"><div class="label">WPM</div><div class="value" id="stat-wpm">0</div><div class="sub" id="stat-level">—</div></div>
          <div class="stat"><div class="label">Accuracy</div><div class="value" id="stat-acc">100%</div></div>
          <div class="stat"><div class="label">Mistakes</div><div class="value" id="stat-mistakes">0</div></div>
          <div class="stat"><div class="label">Progress</div><div class="value" id="stat-progress">0%</div></div>
          <div class="stat"><div class="label">Time</div><div class="value" id="stat-time">0:00</div><div class="sub" id="stat-time-sub">elapsed</div></div>
        </div>
        <div class="source-bar"><div id="source-label">Loading…</div><div id="source-badge"></div></div>
        <div class="typing-stage" id="typing-stage">
          <div class="prompt" id="prompt"></div>
          <textarea class="hidden-input" id="typing-input" autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" aria-label="Typing practice input"></textarea>
        </div>
        <div class="progress-track"><div class="progress-fill" id="progress-fill"></div></div>
        <div class="results" id="results"><h3>Session complete</h3><div class="results-grid" id="results-grid"></div></div>
      </div></section>
    </main>
  </div>`
}
