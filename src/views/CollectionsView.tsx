import { useState } from 'react'
import { useAllBullets } from '../hooks/useBullets'
import { useJobs } from '../hooks/useJobs'
import { useTags } from '../hooks/useTags'
import { BulletCard } from '../components/bullets/BulletCard'
import { TagBadge } from '../components/tags/TagBadge'
import { getDb } from '../lib/db'

export function CollectionsView() {
  const { bullets, reload } = useAllBullets()
  const { jobs } = useJobs()
  const { tags } = useTags()
  const [activeTagIds, setActiveTagIds] = useState<Set<number>>(new Set())
  const [activeJobIds, setActiveJobIds] = useState<Set<number>>(new Set())

  function toggleSet(prev: Set<number>, id: number) {
    const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n
  }

  const filtered = bullets
    .filter((b) => activeTagIds.size === 0 || b.tags.some((t) => activeTagIds.has(t.id)))
    .filter((b) => activeJobIds.size === 0 || activeJobIds.has(b.job_id))
  const bulletsByJob = jobs.map((job) => ({ job, bullets: filtered.filter((b) => b.job_id === job.id) })).filter((g) => g.bullets.length > 0)

  async function handleDelete(id: number) {
    if (!confirm('Delete this bullet?')) return
    const db = await getDb()
    await db.execute('DELETE FROM bullets WHERE id = ?', [id])
    reload()
  }

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="px-6 py-4 border-b border-border shrink-0">
        <h1 className="text-xl font-bold">Collections</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Browse all bullets, filtered by tag</p>
      </div>
      <div className="px-6 py-3 border-b border-border shrink-0 space-y-2">
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium w-8">Tags</span>
            {tags.map((tag) => (
              <button key={tag.id}
                onClick={() => setActiveTagIds((prev) => toggleSet(prev, tag.id))}
                className={`rounded-full transition-all ${activeTagIds.has(tag.id) ? 'ring-2 ring-ring ring-offset-1 ring-offset-background scale-105' : 'opacity-60 hover:opacity-90'}`}>
                <TagBadge tag={tag} />
              </button>
            ))}
            {activeTagIds.size > 0 && <button className="text-xs text-muted-foreground hover:text-foreground underline" onClick={() => setActiveTagIds(new Set())}>Clear</button>}
          </div>
        )}
        {jobs.length > 0 && (
          <div className="flex flex-wrap gap-2 items-center">
            <span className="text-xs text-muted-foreground font-medium w-8">Jobs</span>
            {jobs.map((job) => (
              <button key={job.id}
                onClick={() => setActiveJobIds((prev) => toggleSet(prev, job.id))}
                className={`px-2 py-0.5 rounded-full text-xs border transition-all ${activeJobIds.has(job.id) ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/40'}`}>
                {job.title} · {job.company}
              </button>
            ))}
            {activeJobIds.size > 0 && <button className="text-xs text-muted-foreground hover:text-foreground underline" onClick={() => setActiveJobIds(new Set())}>Clear</button>}
          </div>
        )}
        {!tags.length && !jobs.length && <span className="text-xs text-muted-foreground">No filters available yet</span>}
      </div>
      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {!bulletsByJob.length && (
          <div className="text-center py-12 text-muted-foreground">
            <div className="text-3xl mb-3">🗂</div>
            <p className="text-sm">{bullets.length === 0 ? 'No bullets yet.' : 'No bullets match the selected tags.'}</p>
          </div>
        )}
        {bulletsByJob.map(({ job, bullets: jb }) => (
          <div key={job.id}>
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{job.title} · {job.company}</h2>
            <div className="space-y-3">
              {jb.map((bullet) => <BulletCard key={bullet.id} bullet={bullet} onEdit={() => {}} onDelete={() => handleDelete(bullet.id)} />)}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
