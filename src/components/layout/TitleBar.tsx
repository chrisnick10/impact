import { useAppStore } from '../../stores/appStore'

export function TitleBar() {
  const { theme, toggleTheme, activeView, setActiveView } = useAppStore()

  return (
    <div data-tauri-drag-region className="h-11 flex items-center px-4 gap-2 border-b border-border shrink-0 bg-background select-none">
      <div className="w-20 shrink-0" />
      <span className="text-sm font-semibold tracking-tight text-foreground flex-1 text-center">impact</span>
      <div className="flex items-center gap-1">
        {(['jobs', 'match', 'collections'] as const).map((view) => (
          <button key={view}
            className={`px-3 py-1 text-xs rounded transition-colors ${activeView === view ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent'}`}
            onClick={() => setActiveView(view)}>
            {view === 'jobs' ? 'Jobs' : view === 'match' ? 'Match to JD' : 'Collections'}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        <button className="w-7 h-7 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground" onClick={toggleTheme} title="Toggle theme">
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
      </div>
    </div>
  )
}
