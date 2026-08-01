# Typing Practice

A premium **Beginner Typing Tutor** plus **Speed Arena**, with a **Treasure Quest** reward system.

Learn *how* to type first (touch typing, home row, finger map, animated hands), then unlock speed tests. High accuracy earns better treasure chests.

Inspired by *Keyboard Typing for Programmers*.

---

## Quick start

```powershell
cd "D:\Typing Practice\Typing Practice"
npm install
npm run dev
```

Open `http://localhost:5173`.

New users start in the **onboarding course** automatically.

```powershell
npm run build
npm run preview
npm test
```

---

## What you get

### Beginner Typing Tutor
1. **What is Touch Typing?** — illustrated foundations (accuracy, muscle memory, eyes on screen)
2. **Meet Your Keyboard** — interactive zone tour (number / top / home / bottom / modifiers / space)
3. **Home Row** — animated hands + A S D F · J K L ;

Then **15 progressive lessons** (unlock in order):

| # | Focus |
|---|--------|
| 1–4 | Home row left, right, combine, G/H reach |
| 5–7 | Top row, bottom row, numbers |
| 8–10 | Shift/capitals, symbols, programming symbols |
| 11–12 | Words, sentences |
| 13–15 | Python, JavaScript, SQL/C++ drills |

Each lesson has **Guided · Practice · Challenge · Timed** modes.

### Interactive teaching
- Visual keyboard (target / correct green / wrong red)
- Animated hands with finger highlight, press, and return
- Full finger assignment map for letters, numbers, and symbols
- Wrong-key coaching: explains the **correct finger**, not only “wrong”
- Live stats: accuracy, mistakes, WPM, best WPM, finger, key, progress, time

### Treasure Quest
- Chests by accuracy: Wooden → Bronze → Silver → Golden → Diamond → Legendary
- Rewards: coins, XP, gems, titles, badges, themes, keycaps, hand skins, boosts, tickets, keys
- Collection book, Treasure Room history, streak bonuses, ~5% pirate map surprise
- Level / XP progression

### Speed Arena
Original live-sentence and drill modes (with offline fallback) remain under **Speed Arena**.

### Analytics & settings
- Weak keys / fingers / rows + recommendations
- Dark mode, sound, animation speed, difficulty, themes, skins

Progress saves automatically in your browser.

---

## How to practice (users)

1. Finish the 3 intro lessons (Continue buttons).
2. Open **Lesson 1** → start **Guided** (one key at a time).
3. Watch the glowing key and highlighted finger — match them.
4. Unlock **Practice / Challenge / Timed** after you are comfortable.
5. Hit the lesson’s accuracy goal to unlock the next lesson and open a chest.
6. Visit **Treasure** and **Collection** to see loot.
7. Use **Speed Arena** only after technique feels solid.

**Golden rule:** accuracy first. Legendary chests require near-perfect accuracy — rushing is punished.

---

## Testing

See [TESTING.md](./TESTING.md).

```powershell
npm test
npm run build
```

---

## Project structure

```
src/
  main.ts                 # App shell, navigation, wiring
  tutor/                  # Finger map, lessons, engine, keyboard, hands
  progress/               # Save data + analytics
  rewards/                # Chests + achievements
  audio/                  # Web Audio feedback
  ui/                     # Views (onboarding, tutor, treasure, practice)
  content/                # Live fetch + offline fallbacks (arena)
  core/                   # Metrics, sanitize, settings
  styles/                 # main, tutor, treasure CSS
```

---

## Security

External arena content is sanitized. Tutor lessons are local. No API keys required. Settings and progress stay on-device (`localStorage`).

---

## GitHub

https://github.com/aakashkushwah1998dev/Typing-Practice
