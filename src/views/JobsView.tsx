import { useState } from 'react'
import { BulletCard } from '../components/bullets/BulletCard'
import { BulletFormDialog } from '../components/bullets/BulletFormDialog'
import { useBullets } from '../hooks/useBullets'
import { formatDateRange } from '../lib/utils'
import type { Job, Tag, BulletWithTags, NewBulletPayload, UpdateBulletPayload } from '../types'

interface Props { job: Job | null; tags: Tag[] }

export function JobsView({ job, tags }: Props) {
  const { bullets, loading, createBullet, updateBullet, deleteBullet } = useBullets(job?.id ?? null)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<BulletWithTags | null>(null)

  if (!job) return (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      <div className="text-center"><div className="text-4xl mb-3">🎯</div>
        <p className="text-sm">Select a position from the sidebar</p>
        <p className="text-xs mt-1 opacity-60">or add a new one to get started</p>
      </div>
    </div>
  )

  async function handleSave(data: NewBulletPayload | UpdateBulletPayload) {
    if ('id' in data) await updateBullet(data as UpdateBulletPayload)
    else await createBullet(data as NewBulletPayload)
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div data-tauri-drag-region className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-xl font-bold">{job.title}</h1>
        <p className="text-sm text-muted-foreground mt-0.5">{job.company} · {formatDateRange(job.start_date, job.end_date)}</p>
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        {loading && <div className="text-sm text-muted-foreground">Loading…</div>}
        {!loading && !bullets.length && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-3xl mb-3">✍️</div>
            <p className="text-sm">No bullets yet for this position</p>
            <button className="mt-4 px-4 py-2 text-sm bg-primary text-primary-foreground rounded-lg hover:opacity-90" onClick={() => { setEditing(null); setShowForm(true) }}>Add your first bullet</button>
          </div>
        )}
        <div className="space-y-3">
          {bullets.map((bullet) => (
            <BulletCard key={bullet.id} bullet={bullet}
              onEdit={() => { setEditing(bullet); setShowForm(true) }}
              onDelete={() => confirm('Delete this bullet?') && deleteBullet(bullet.id)} />
          ))}
        </div>
      </div>
      {bullets.length > 0 && (
        <div className="px-6 py-4 border-t border-border shrink-0">
          <button className="w-full py-2 text-sm rounded-lg border border-dashed border-border hover:border-primary hover:text-primary text-muted-foreground transition-colors"
            onClick={() => { setEditing(null); setShowForm(true) }}>+ Add bullet</button>
        </div>
      )}
      <BulletFormDialog open={showForm} bullet={editing} jobId={job.id} tags={tags}
        onClose={() => { setShowForm(false); setEditing(null) }} onSave={handleSave} />
    </div>
  )
}
