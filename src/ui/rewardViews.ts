import { escapeHtml } from '../core/sanitize'
import { CHEST_META, COLLECTION_CATALOG } from '../rewards/chests'
import type {
  ChestHistoryEntry,
  ChestRarity,
  RewardGrant,
  TutorProgress,
} from '../progress/store'
import { ACHIEVEMENTS } from '../rewards/achievements'
import { buildAnalytics } from '../progress/analytics'

export function renderTreasureRoom(p: TutorProgress): string {
  const history = p.chestHistory
    .map((c) => chestCard(c))
    .join('') || `<p class="lede">Complete a lesson to earn your first treasure chest. Higher accuracy = better loot.</p>`

  return `
  <section class="panel">
    <div class="panel-body">
      <p class="eyebrow">Treasure Room</p>
      <h2>Your Chests</h2>
      <p class="lede">Accuracy is the highest priority. Rushing for speed unlocks only wooden loot.</p>
      <div class="wallet">
        <span>🪙 ${p.coins}</span>
        <span>💎 ${p.gems}</span>
        <span>🎟️ ${p.tickets}</span>
        <span>🔑 ${p.goldenKeys}</span>
        <span>🔥 ${p.streakDays}-day streak</span>
      </div>
      <div class="chest-history">${history}</div>
    </div>
  </section>`
}

function chestCard(c: ChestHistoryEntry): string {
  const meta = CHEST_META[c.rarity]
  return `
  <article class="chest-card ${meta.className}">
    <div class="chest-emoji">${meta.emoji}</div>
    <div>
      <h3>${escapeHtml(meta.label)}</h3>
      <p>${escapeHtml(c.lessonTitle)} · ${c.accuracy}% accuracy · ${c.wpm} WPM</p>
      <p class="hint">${new Date(c.at).toLocaleString()} · ${c.rewards.map((r) => r.label).join(', ')}</p>
    </div>
  </article>`
}

export function renderCollection(p: TutorProgress): string {
  const owned = new Set<string>([
    ...p.themes,
    ...p.keycaps,
    ...p.hands,
    ...p.badges,
    ...p.titles,
    ...p.frames,
  ])
  const total = COLLECTION_CATALOG.length
  const got = COLLECTION_CATALOG.filter((c) => owned.has(c.id)).length
  const pct = Math.round((got / total) * 100)

  const items = COLLECTION_CATALOG.map((c) => {
    const unlocked = owned.has(c.id)
    return `
      <div class="collect-item ${unlocked ? 'unlocked' : 'locked'}">
        <div class="collect-icon">${unlocked ? '✨' : '🔒'}</div>
        <strong>${escapeHtml(c.label)}</strong>
        <span>${escapeHtml(c.kind)} · ${escapeHtml(c.rarity)}</span>
      </div>`
  }).join('')

  const ach = ACHIEVEMENTS.map((a) => {
    const u = p.achievements.some((x) => x.id === a.id)
    return `<div class="collect-item ${u ? 'unlocked' : 'locked'}"><div class="collect-icon">${u ? '🏅' : '🔒'}</div><strong>${escapeHtml(a.title)}</strong><span>${escapeHtml(a.description)}</span></div>`
  }).join('')

  return `
  <section class="panel">
    <div class="panel-body">
      <p class="eyebrow">Collection Book</p>
      <h2>Cosmetics & Badges</h2>
      <p class="lede">Completion: <strong>${pct}%</strong> (${got}/${total} catalog items)</p>
      <div class="collect-grid">${items}</div>
      <h3 style="margin-top:1.25rem">Achievements</h3>
      <div class="collect-grid">${ach}</div>
    </div>
  </section>`
}

export function renderAnalytics(p: TutorProgress): string {
  const a = buildAnalytics(p)
  return `
  <section class="panel">
    <div class="panel-body">
      <p class="eyebrow">Analytics</p>
      <h2>Finger & Key Insights</h2>
      <div class="live-feedback">
        <div class="stat"><div class="label">Most missed</div><div class="value value-sm">${escapeHtml(a.mostMissedKey ?? '—')}</div></div>
        <div class="stat"><div class="label">Slowest key</div><div class="value value-sm">${escapeHtml(a.slowestKey ?? '—')}</div></div>
        <div class="stat"><div class="label">Weakest finger</div><div class="value value-sm">${escapeHtml(a.weakestFinger ?? '—')}</div></div>
        <div class="stat"><div class="label">Weak row</div><div class="value value-sm">${escapeHtml(a.weakRow ?? '—')}</div></div>
      </div>
      <h3>Recommendations</h3>
      <ul class="why-list">${a.recommendations.map((r) => `<li>${escapeHtml(r)}</li>`).join('')}</ul>
      ${a.weakSymbols.length ? `<p class="hint">Weak symbols: ${a.weakSymbols.map((s) => escapeHtml(s)).join(' ')}</p>` : ''}
    </div>
  </section>`
}

export function renderSettings(p: TutorProgress): string {
  return `
  <section class="panel">
    <div class="panel-body settings-grid">
      <p class="eyebrow">Settings</p>
      <h2>Customize your tutor</h2>
      <label class="field row"><span>Dark mode</span><input type="checkbox" id="set-dark" ${p.darkMode ? 'checked' : ''} /></label>
      <label class="field row"><span>Sound effects</span><input type="checkbox" id="set-sound" ${p.soundEnabled ? 'checked' : ''} /></label>
      <label class="field row"><span>Lesson narration (beeps)</span><input type="checkbox" id="set-narration" ${p.narrationEnabled ? 'checked' : ''} /></label>
      <div class="field"><label for="set-anim">Animation speed</label>
        <select id="set-anim">
          <option value="slow" ${p.animationSpeed === 'slow' ? 'selected' : ''}>Slow</option>
          <option value="normal" ${p.animationSpeed === 'normal' ? 'selected' : ''}>Normal</option>
          <option value="fast" ${p.animationSpeed === 'fast' ? 'selected' : ''}>Fast</option>
        </select>
      </div>
      <div class="field"><label for="set-diff">Difficulty</label>
        <select id="set-diff">
          <option value="beginner" ${p.difficulty === 'beginner' ? 'selected' : ''}>Beginner</option>
          <option value="intermediate" ${p.difficulty === 'intermediate' ? 'selected' : ''}>Intermediate</option>
          <option value="advanced" ${p.difficulty === 'advanced' ? 'selected' : ''}>Advanced</option>
        </select>
      </div>
      <div class="field"><label for="set-theme">Keyboard theme</label>
        <select id="set-theme">
          ${p.themes.map((t) => `<option value="${t}" ${p.activeTheme === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label for="set-hand">Hand skin</label>
        <select id="set-hand">
          ${p.hands.map((t) => `<option value="${t}" ${p.activeHand === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label for="set-keycap">Keycap skin</label>
        <select id="set-keycap">
          ${p.keycaps.map((t) => `<option value="${t}" ${p.activeKeycap === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label for="set-title">Active title</label>
        <select id="set-title">
          ${p.titles.map((t) => `<option value="${t}" ${p.activeTitle === t ? 'selected' : ''}>${t}</option>`).join('')}
        </select>
      </div>
      <div class="field"><label>Keyboard layout</label><input value="QWERTY" disabled /></div>
      <div class="field"><label>Language</label><input value="English" disabled /></div>
      <button type="button" class="btn" data-action="reset-progress">Reset all progress</button>
    </div>
  </section>`
}

export function renderChestModal(
  rarity: ChestRarity,
  rewards: RewardGrant[],
  extras?: { surprise?: boolean; achievements?: string[] },
): string {
  const meta = CHEST_META[rarity]
  return `
  <div class="modal-backdrop" id="chest-modal">
    <div class="modal chest-modal ${meta.className}">
      <div class="confetti" aria-hidden="true"></div>
      <div class="chest-stage">
        <div class="chest-glow"></div>
        <div class="chest-box anim-chest">
          <div class="chest-lid"></div>
          <div class="chest-body">${meta.emoji}</div>
        </div>
      </div>
      <h2>${extras?.surprise ? 'Pirate Map Bonus! ' : ''}${escapeHtml(meta.label)}</h2>
      <p class="lede">Accuracy paid off. Collect your rewards:</p>
      <ul class="reward-list">
        ${rewards.map((r) => `<li>${escapeHtml(r.label)}</li>`).join('')}
      </ul>
      ${
        extras?.achievements?.length
          ? `<p class="hint">Achievements unlocked: ${extras.achievements.map(escapeHtml).join(', ')}</p>`
          : ''
      }
      <button type="button" class="btn btn-primary" data-action="close-chest">Collect</button>
    </div>
  </div>`
}

export function renderSurpriseMap(): string {
  return `
  <div class="modal-backdrop" id="map-modal">
    <div class="modal">
      <h2>🏴‍☠️ Surprise Treasure Map!</h2>
      <p class="lede">A rare map appeared. Complete this bonus challenge with at least 90% accuracy to claim an Epic Chest.</p>
      <p class="big-target" style="font-size:1.2rem;margin:1rem 0">() {} [] == => && ||</p>
      <input class="tutor-input" id="map-input" autocomplete="off" spellcheck="false" aria-label="Bonus challenge input" />
      <div class="onboard-actions">
        <button type="button" class="btn" data-action="skip-map">Skip</button>
        <button type="button" class="btn btn-primary" data-action="start-map">Start bonus</button>
      </div>
    </div>
  </div>`
}
