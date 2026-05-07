import { useState } from 'react'
import { JobFormDialog } from './JobFormDialog'
import { formatDateRange } from '../../lib/utils'
import type { Job } from '../../types'

interface Props {
  jobs: Job[]
  loading: boolean
  selectedJobId: number | null
  onSelectJob: (id: number) => void
  onCreateJob: (data: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'sort_order'>) => Promise<Job>
  onUpdateJob: (data: Partial<Job> & { id: number }) => Promise<Job>
  onDeleteJob: (id: number) => Promise<void>
}

export function JobList({ jobs, loading, selectedJobId, onSelectJob, onCreateJob, onUpdateJob, onDeleteJob }: Props) {
  const [showForm, setShowForm] = useState(false)
  const [editingJob, setEditingJob] = useState<Job | null>(null)

  async function handleSave(data: Omit<Job, 'id' | 'created_at' | 'updated_at' | 'sort_order'>) {
    if (editingJob) { await onUpdateJob({ id: editingJob.id, ...data }) }
    else { const job = await onCreateJob(data); onSelectJob(job.id) }
    setEditingJob(null)
  }

  async function handleDelete(job: Job) {
    if (!confirm(`Delete "${job.title} at ${job.company}" and all its bullets?`)) return
    await onDeleteJob(job.id)
    if (selectedJobId === job.id) onSelectJob(jobs.find((j) => j.id !== job.id)?.id ?? 0)
  }

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between">
          <span data-tauri-drag-region className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Positions</span>
          <button onClick={() => { setEditingJob(null); setShowForm(true) }} className="w-6 h-6 flex items-center justify-center rounded hover:bg-accent text-muted-foreground hover:text-foreground text-lg" title="Add position">+</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
        {loading && <div className="text-xs text-muted-foreground px-2 py-3">Loading…</div>}
        {!loading && !jobs.length && <div className="text-xs text-muted-foreground px-2 py-3">No positions yet.</div>}
        {jobs.map((job) => (
          <div key={job.id}
            className={`group flex items-start gap-2 px-2 py-2 rounded-md cursor-pointer transition-colors ${selectedJobId === job.id ? 'bg-primary/10 text-foreground' : 'hover:bg-accent text-muted-foreground hover:text-foreground'}`}
            onClick={() => onSelectJob(job.id)}>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{job.title}</div>
              <div className="text-xs truncate mt-0.5">{job.company}</div>
              <div className="text-xs opacity-60 mt-0.5">{formatDateRange(job.start_date, job.end_date)}</div>
            </div>
            <div className="opacity-0 group-hover:opacity-100 flex gap-1 shrink-0 mt-0.5">
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-border text-xs" onClick={(e) => { e.stopPropagation(); setEditingJob(job); setShowForm(true) }}>✏️</button>
              <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-destructive/20 text-xs" onClick={(e) => { e.stopPropagation(); handleDelete(job) }}>🗑</button>
            </div>
          </div>
        ))}
      </div>
      <JobFormDialog open={showForm} job={editingJob} onClose={() => { setShowForm(false); setEditingJob(null) }} onSave={handleSave} />
    </div>
  )
}
