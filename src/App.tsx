import { useEffect } from 'react'
import { TitleBar } from './components/layout/TitleBar'
import { Sidebar } from './components/layout/Sidebar'
import { JobsView } from './views/JobsView'
import { MatchView } from './views/MatchView'
import { CollectionsView } from './views/CollectionsView'
import { useAppStore } from './stores/appStore'
import { useJobs } from './hooks/useJobs'
import { useTags } from './hooks/useTags'

export default function App() {
  const { selectedJobId, setSelectedJobId, activeView, theme } = useAppStore()
  const { jobs, loading, createJob, updateJob, deleteJob } = useJobs()
  const { tags, createTag, updateTag, deleteTag } = useTags()

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const selectedJob = jobs.find((j) => j.id === selectedJobId) ?? null

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background text-foreground">
      <TitleBar />
      <div className="flex flex-1 overflow-hidden">
        {activeView === 'jobs' && (
          <aside className="w-64 shrink-0 border-r border-border flex flex-col overflow-hidden">
            <Sidebar jobs={jobs} loading={loading} selectedJobId={selectedJobId}
              onSelectJob={(id) => setSelectedJobId(id === 0 ? null : id)}
              onCreateJob={createJob} onUpdateJob={updateJob} onDeleteJob={deleteJob}
              tags={tags} onCreateTag={createTag} onUpdateTag={updateTag} onDeleteTag={deleteTag} />
          </aside>
        )}
        <main className="flex-1 overflow-hidden">
          {activeView === 'jobs' && <JobsView job={selectedJob} tags={tags} />}
          {activeView === 'match' && <MatchView />}
          {activeView === 'collections' && <CollectionsView />}
        </main>
      </div>
    </div>
  )
}
