export type AppView =
  | 'onboarding'
  | 'tutor'
  | 'lesson'
  | 'practice'
  | 'treasure'
  | 'collection'
  | 'analytics'
  | 'settings'

export interface NavItem {
  id: AppView
  label: string
  icon: string
}

export const NAV: NavItem[] = [
  { id: 'tutor', label: 'Tutor', icon: '🎓' },
  { id: 'practice', label: 'Speed Arena', icon: '⚡' },
  { id: 'treasure', label: 'Treasure', icon: '🗝️' },
  { id: 'collection', label: 'Collection', icon: '📚' },
  { id: 'analytics', label: 'Analytics', icon: '📊' },
  { id: 'settings', label: 'Settings', icon: '⚙️' },
]
