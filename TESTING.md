# Testing — Typing Tutor + Treasure Quest

## Automated

```powershell
cd "D:\Typing Practice\Typing Practice"
npm test
npm run build
```

Expect all Vitest suites green and a successful Vite production build.

## Manual checklist

### Onboarding
- [ ] First visit opens “What is Touch Typing?” with illustrated cards
- [ ] Continue → keyboard tour; zone pills highlight keyboard sections
- [ ] Continue → home row + animated hands
- [ ] Start Lesson 1 enters guided tutor

### Lessons & unlocks
- [ ] Lesson 2 locked until Lesson 1 completed at pass accuracy
- [ ] Guided mode shows one big target key + finger coach line
- [ ] Wrong key shows finger explanation (not only “Wrong”)
- [ ] Keyboard target glows; correct = green; wrong = red shake
- [ ] Active finger animates on the hand SVG
- [ ] Practice / Challenge / Timed modes run end-to-end
- [ ] Progress persists after refresh (resume same lesson / completions)

### Treasure
- [ ] Finishing a lesson opens chest modal with confetti
- [ ] Low accuracy → wooden; 100% → legendary tier
- [ ] Rewards add coins/XP; Treasure Room lists history
- [ ] Collection shows locked/unlocked items
- [ ] Streak increments when practicing on a new calendar day

### Arena & misc
- [ ] Speed Arena still loads live/offline passages
- [ ] Arena finish also awards a chest
- [ ] Settings: dark mode, mute sound, theme/skin changes apply
- [ ] Analytics shows recommendations after some mistakes
- [ ] Responsive layout works on a narrow phone viewport
- [ ] No dead nav buttons after onboarding

### Quality bar
- [ ] Feels like a tutor (explains WHY), not only a WPM test
- [ ] Animations play (hands, keys, chest)
- [ ] No console errors during a full Lesson 1 guided run
