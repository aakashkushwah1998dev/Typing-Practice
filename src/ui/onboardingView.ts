import { escapeHtml } from '../core/sanitize'
import { ONBOARDING_STEPS } from '../tutor/lessons'
import { renderKeyboardHtml } from '../tutor/keyboardView'
import { renderHandsHtml } from '../tutor/handsView'

export function renderOnboarding(step: number, handSkin: string): string {
  const s = ONBOARDING_STEPS[Math.min(step, ONBOARDING_STEPS.length - 1)]!
  if (s.kind === 'story') return storyLesson()
  if (s.kind === 'keyboard-tour') return keyboardTour()
  return homeRowIntro(handSkin)
}

function storyLesson(): string {
  return `
  <section class="onboard panel">
    <div class="panel-body onboard-story">
      <p class="eyebrow">Lesson 1 · Foundations</p>
      <h2>What is Touch Typing?</h2>
      <div class="story-grid">
        <article class="story-card anim-fade">
          <div class="illus illus-typewriter" aria-hidden="true"></div>
          <h3>What is typing?</h3>
          <p>Typing is converting thoughts into characters. Touch typing means doing it without looking at the keyboard — your fingers know the map.</p>
        </article>
        <article class="story-card anim-fade delay-1">
          <div class="illus illus-brain" aria-hidden="true"></div>
          <h3>Why touch typing exists</h3>
          <p>It frees your eyes and working memory. You watch the screen (or your code), while hands handle the keys automatically.</p>
        </article>
        <article class="story-card anim-fade delay-2">
          <div class="illus illus-code" aria-hidden="true"></div>
          <h3>Why programmers need it</h3>
          <p>Code is rewritten constantly. Every glance down at the keys steals a second from problem-solving. Symbols and brackets demand finger discipline.</p>
        </article>
        <article class="story-card anim-fade delay-3">
          <div class="illus illus-target" aria-hidden="true"></div>
          <h3>Accuracy before speed</h3>
          <p>A fast, messy line teaches bad habits. A slow, clean line builds muscle memory. Speed arrives as a side effect.</p>
        </article>
        <article class="story-card anim-fade delay-4">
          <div class="illus illus-muscle" aria-hidden="true"></div>
          <h3>Muscle memory</h3>
          <p>Repeating the correct finger for each key wires automatic motion. That is why we teach one key family at a time.</p>
        </article>
        <article class="story-card anim-fade delay-5">
          <div class="illus illus-eyes" aria-hidden="true"></div>
          <h3>Do not look down</h3>
          <p>Looking at the keyboard resets learning. Find home on the F and J bumps, then keep your eyes on the lesson.</p>
        </article>
      </div>
      <div class="onboard-actions">
        <button type="button" class="btn btn-primary" data-action="onboard-next">Continue</button>
      </div>
    </div>
  </section>`
}

function keyboardTour(): string {
  const zones = [
    { id: 'Number row', title: 'Number row', blurb: 'Digits and Shift-symbols: ! @ # $ % ^ & * ( )' },
    { id: 'Top letter row', title: 'Top letter row', blurb: 'Q W E R T Y U I O P and brackets [ ] \\' },
    { id: 'Home row', title: 'Home row', blurb: 'A S D F G H J K L ; \' — your resting position' },
    { id: 'Bottom row', title: 'Bottom row', blurb: 'Z X C V B N M and , . /' },
    { id: 'Modifiers', title: 'Modifiers', blurb: 'Shift, Ctrl, Alt, Win, Tab, Caps, Enter, Backspace' },
    { id: 'Spacebar', title: 'Spacebar', blurb: 'Thumbs share the spacebar' },
  ]

  return `
  <section class="onboard panel">
    <div class="panel-body">
      <p class="eyebrow">Lesson 2 · Keyboard Tour</p>
      <h2>Meet Your Keyboard</h2>
      <p class="lede">Click each zone to highlight it. Learn the map before you race.</p>
      <div class="zone-pills" id="zone-pills">
        ${zones
          .map(
            (z, i) =>
              `<button type="button" class="zone-pill ${i === 0 ? 'active' : ''}" data-zone="${escapeHtml(z.id)}"><strong>${escapeHtml(z.title)}</strong><span>${escapeHtml(z.blurb)}</span></button>`,
          )
          .join('')}
      </div>
      <div id="tour-keyboard">${renderKeyboardHtml({ highlightZone: 'Number row' })}</div>
      <div class="modifier-glossary">
        <div><strong>Enter</strong> — confirm / new line (right pinky)</div>
        <div><strong>Shift</strong> — capitals & symbols (opposite pinky)</div>
        <div><strong>Ctrl / Alt / Win</strong> — shortcuts & OS commands</div>
        <div><strong>Backspace</strong> — delete left (right pinky)</div>
        <div><strong>Tab</strong> — indent / focus (left pinky)</div>
        <div><strong>Caps Lock</strong> — avoid while learning touch typing</div>
        <div><strong>Spacebar</strong> — thumbs</div>
        <div><strong>Function / Nav</strong> — F-keys, arrows (learn later)</div>
      </div>
      <div class="onboard-actions">
        <button type="button" class="btn" data-action="onboard-back">Back</button>
        <button type="button" class="btn btn-primary" data-action="onboard-next">Continue</button>
      </div>
    </div>
  </section>`
}

function homeRowIntro(handSkin: string): string {
  return `
  <section class="onboard panel">
    <div class="panel-body">
      <p class="eyebrow">Lesson 3 · Home Row</p>
      <h2>Park Your Fingers Here</h2>
      <p class="lede">Left hand on <strong>A S D F</strong>. Right hand on <strong>J K L ;</strong>. Thumbs on space. After every key — return home.</p>
      ${renderHandsHtml(handSkin)}
      <div id="homerow-keyboard">${renderKeyboardHtml({ highlightZone: 'Home row' })}</div>
      <ul class="why-list">
        <li>F and J have raised bumps so you can find home without looking.</li>
        <li>Every finger owns a column — resist reaching with the wrong finger.</li>
        <li>The return trip is the skill. Speed comes later.</li>
      </ul>
      <div class="onboard-actions">
        <button type="button" class="btn" data-action="onboard-back">Back</button>
        <button type="button" class="btn btn-primary" data-action="onboard-finish">Start Lesson 1</button>
      </div>
    </div>
  </section>`
}
