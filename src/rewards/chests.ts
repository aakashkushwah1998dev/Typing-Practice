/**
 * Treasure chest rarity, reward rolls, streak bonuses, surprise map.
 */

import type {
  ChestHistoryEntry,
  ChestRarity,
  RewardGrant,
  TutorProgress,
} from '../progress/store'
import { addRewards } from '../progress/store'

export function chestFromAccuracy(accuracy: number): ChestRarity {
  if (accuracy >= 99) return 'legendary'
  if (accuracy >= 95) return 'diamond'
  if (accuracy >= 90) return 'golden'
  if (accuracy >= 80) return 'silver'
  if (accuracy >= 70) return 'bronze'
  return 'wooden'
}

export const CHEST_META: Record<
  ChestRarity,
  { label: string; emoji: string; className: string }
> = {
  wooden: { label: 'Wooden Chest', emoji: '🪵', className: 'chest-wooden' },
  bronze: { label: 'Bronze Chest', emoji: '🥉', className: 'chest-bronze' },
  silver: { label: 'Silver Chest', emoji: '🥈', className: 'chest-silver' },
  golden: { label: 'Golden Chest', emoji: '🥇', className: 'chest-golden' },
  diamond: { label: 'Diamond Chest', emoji: '💎', className: 'chest-diamond' },
  legendary: {
    label: 'Legendary Treasure Chest',
    emoji: '🏆',
    className: 'chest-legendary',
  },
  epic: { label: 'Epic Pirate Chest', emoji: '🏴‍☠️', className: 'chest-epic' },
}

function mulberry(seed: number): () => number {
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

const LEGENDARY_POOL: RewardGrant[] = [
  { kind: 'theme', itemId: 'galaxy', label: 'Galaxy Theme' },
  { kind: 'theme', itemId: 'fire', label: 'Fire Keyboard' },
  { kind: 'theme', itemId: 'neon', label: 'Neon Keyboard' },
  { kind: 'theme', itemId: 'rainbow', label: 'Rainbow Keyboard' },
  { kind: 'theme', itemId: 'hacker', label: 'Hacker Theme' },
  { kind: 'theme', itemId: 'golden', label: 'Golden Cursor Theme' },
  { kind: 'badge', itemId: 'programmer', label: 'Programmer Badge' },
  { kind: 'badge', itemId: 'typing-master', label: 'Typing Master Badge' },
  { kind: 'title', itemId: 'typing-master', label: 'Title: Typing Master' },
  { kind: 'hand', itemId: 'gold', label: 'Golden Hand Skin' },
  { kind: 'keycap', itemId: 'midnight', label: 'Midnight Keycaps' },
  { kind: 'frame', itemId: 'legendary-frame', label: 'Legendary Profile Frame' },
]

export function rollRewards(
  rarity: ChestRarity,
  accuracy: number,
  wpm: number,
  seed = Date.now(),
): RewardGrant[] {
  const rng = mulberry(seed >>> 0)
  const rewards: RewardGrant[] = []

  const baseCoins =
    rarity === 'wooden'
      ? 5
      : rarity === 'bronze'
        ? 15
        : rarity === 'silver'
          ? 35
          : rarity === 'golden'
            ? 70
            : rarity === 'diamond'
              ? 120
              : rarity === 'epic'
                ? 200
                : 250

  const accuracyMult = accuracy >= 99 ? 2.5 : accuracy >= 95 ? 2 : accuracy >= 90 ? 1.5 : accuracy >= 80 ? 1.2 : 1
  const coins = Math.round(baseCoins * accuracyMult)
  const xp = Math.round(
    (20 + accuracy * 0.8 + Math.min(wpm, 80) * 0.35) *
      (rarity === 'legendary' || rarity === 'epic' ? 2 : 1) *
      accuracyMult,
  )

  rewards.push({ kind: 'coins', amount: coins, label: `${coins} Coins` })
  rewards.push({ kind: 'xp', amount: xp, label: `${xp} XP` })

  if (accuracy >= 95) {
    rewards.push({ kind: 'gems', amount: rarity === 'legendary' ? 5 : 2, label: 'Gems' })
  }

  if (rarity === 'golden' || rarity === 'diamond') {
    if (rng() < 0.35) rewards.push({ kind: 'ticket', amount: 1, label: 'Lucky Spin Ticket' })
    if (rng() < 0.25) rewards.push({ kind: 'keycap', itemId: pick(rng, ['orange', 'mint']), label: 'Keycap Skin' })
  }

  if (rarity === 'diamond' || rarity === 'legendary' || rarity === 'epic') {
    if (rng() < 0.5) rewards.push(pick(rng, LEGENDARY_POOL))
    if (rng() < 0.3) rewards.push({ kind: 'boost', label: 'Double XP (24h)' })
    if (rng() < 0.4) rewards.push({ kind: 'key', amount: 1, label: 'Golden Key' })
    if (rng() < 0.2) rewards.push({ kind: 'hand', itemId: pick(rng, ['cyan', 'rose', 'gold']), label: 'Hand Skin' })
  }

  if (rarity === 'legendary' && accuracy >= 99) {
    rewards.push({ kind: 'title', itemId: 'accuracy-ace', label: 'Title: Accuracy Ace' })
    rewards.push(pick(rng, LEGENDARY_POOL))
  }

  if (rng() < 0.08) {
    rewards.push({ kind: 'mystery', label: 'Mystery Gift' })
  }

  return rewards
}

export function streakChest(streakDays: number): ChestRarity | null {
  if (streakDays >= 100) return 'legendary'
  if (streakDays >= 30) return 'legendary'
  if (streakDays >= 15) return 'golden'
  if (streakDays >= 7) return 'silver'
  if (streakDays >= 3) return 'bronze'
  return null
}

export function shouldSurpriseMap(seed = Date.now()): boolean {
  return mulberry(seed >>> 0)() < 0.05
}

export function applyChestToProgress(
  p: TutorProgress,
  entry: Omit<ChestHistoryEntry, 'id' | 'rewards'> & { rewards: RewardGrant[] },
): TutorProgress {
  const full: ChestHistoryEntry = {
    ...entry,
    id: `chest-${entry.at}-${Math.random().toString(36).slice(2, 8)}`,
  }
  let next = addRewards(p, full.rewards)
  next = {
    ...next,
    chestHistory: [full, ...next.chestHistory].slice(0, 100),
  }
  return next
}

export const COLLECTION_CATALOG: {
  id: string
  kind: string
  label: string
  rarity: string
}[] = [
  { id: 'default', kind: 'theme', label: 'Classic Teal', rarity: 'common' },
  { id: 'hacker', kind: 'theme', label: 'Hacker', rarity: 'legendary' },
  { id: 'neon', kind: 'theme', label: 'Neon', rarity: 'legendary' },
  { id: 'galaxy', kind: 'theme', label: 'Galaxy', rarity: 'legendary' },
  { id: 'fire', kind: 'theme', label: 'Fire', rarity: 'legendary' },
  { id: 'rainbow', kind: 'theme', label: 'Rainbow', rarity: 'legendary' },
  { id: 'golden', kind: 'theme', label: 'Golden Cursor', rarity: 'legendary' },
  { id: 'standard', kind: 'keycap', label: 'Standard Keycaps', rarity: 'common' },
  { id: 'orange', kind: 'keycap', label: 'Orange Keycaps', rarity: 'rare' },
  { id: 'mint', kind: 'keycap', label: 'Mint Keycaps', rarity: 'rare' },
  { id: 'midnight', kind: 'keycap', label: 'Midnight Keycaps', rarity: 'legendary' },
  { id: 'classic', kind: 'hand', label: 'Classic Hands', rarity: 'common' },
  { id: 'gold', kind: 'hand', label: 'Golden Hands', rarity: 'legendary' },
  { id: 'cyan', kind: 'hand', label: 'Cyan Hands', rarity: 'rare' },
  { id: 'rose', kind: 'hand', label: 'Rose Hands', rarity: 'rare' },
  { id: 'programmer', kind: 'badge', label: 'Programmer', rarity: 'legendary' },
  { id: 'typing-master', kind: 'badge', label: 'Typing Master', rarity: 'legendary' },
  { id: 'novice', kind: 'title', label: 'Novice', rarity: 'common' },
  { id: 'home-row-hero', kind: 'title', label: 'Home Row Hero', rarity: 'rare' },
  { id: 'accuracy-ace', kind: 'title', label: 'Accuracy Ace', rarity: 'rare' },
  { id: 'symbol-king', kind: 'title', label: 'Symbol King', rarity: 'legendary' },
  { id: 'code-wizard', kind: 'title', label: 'Code Wizard', rarity: 'legendary' },
  { id: 'typing-master', kind: 'title', label: 'Typing Master', rarity: 'legendary' },
  { id: 'treasure-hunter', kind: 'title', label: 'Treasure Hunter', rarity: 'rare' },
]
