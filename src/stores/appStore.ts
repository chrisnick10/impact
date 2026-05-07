import { create } from 'zustand'

type View = 'jobs' | 'match' | 'collections'

interface AppState {
  selectedJobId: number | null
  activeView: View
  theme: 'light' | 'dark'
  setSelectedJobId: (id: number | null) => void
  setActiveView: (view: View) => void
  toggleTheme: () => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedJobId: null,
  activeView: 'jobs',
  theme: 'dark',
  setSelectedJobId: (id) => set({ selectedJobId: id }),
  setActiveView: (view) => set({ activeView: view }),
  toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' }))
}))
