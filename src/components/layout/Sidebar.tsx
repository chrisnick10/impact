import { useState } from 'react'
import { JobList } from '../jobs/JobList'
import type { Job, Tag } from '../../types'

const TAG_COLORS = ['#6366f1','#8b5cf6','#ec4899','#f43f5e','#f97316','#eab308','#22c55e','#14b8a6','#3b82f6']

interface Props {
  jobs: Job[]; loading: boolean; selectedJobId: number | null
  onSelectJob: (id: number) => void
  onCreateJob: (data: Omit<Job, 'id'|'created_at'|'updated_at'|'sort_order'>) => Promise<Job>
  onUpdateJob: (data: Partial<Job> & { id: number }) => Promise<Job>
  onDeleteJob: (id: number) => Promise<void>
  tags: Tag[]
  onCreateTag: (data: { name: string; color: string }) => Promise<Tag>
  onUpdateTag: (id: number, data: { name?: string; color?: string }) => Promise<void>
  onDeleteTag: (id: number) => Promise<void>
}

export function Sidebar(props: Props) {
  const { tags, onCreateTag, onUpdateTag, onDeleteTag } = props
  const [showTagInput, setShowTagInput] = useState(false)
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0])
  const [editingTagId, setEditingTagId] = useState<number | null>(null)

  async function handleCreateTag(e: React.FormEvent) {
    e.preventDefault()
    if (!newTagName.trim()) return
    await onCreateTag({ name: newTagName.trim(), color: newTagColor })
    setNewTagName(''); setShowTagInput(false)
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="flex-1 overflow-hidden"><JobList {...props} /></div>
      <div className="border-t border-border p-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tags</span>
          <button onClick={() => setShowTagInput((v) => !v)} className="w-5 h-5 flex items-center justify-center rounded hover:bg-accent text-muted-foreground text-base" title="Add tag">+</button>
        </div>
        {showTagInput && (
          <form onSubmit={handleCreateTag} className="mb-2 space-y-1.5">
            <input className="w-full bg-input border border-border rounded px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              value={newTagName} onChange={(e) => setNewTagName(e.target.value)} placeholder="Tag name" autoFocus />
            <div className="flex gap-1 flex-wrap">
              {TAG_COLORS.map((c) => (
                <button key={c} type="button"
                  className={`w-4 h-4 rounded-full transition-transform ${newTagColor === c ? 'scale-125 ring-2 ring-ring ring-offset-1 ring-offset-background' : ''}`}
                  style={{ backgroundColor: c }} onClick={() => setNewTagColor(c)} />
              ))}
            </div>
            <div className="flex gap-1">
              <button type="submit" className="flex-1 text-xs py-1 rounded bg-primary text-primary-foreground hover:opacity-90">Add</button>
              <button type="button" className="flex-1 text-xs py-1 rounded border border-border hover:bg-accent" onClick={() => setShowTagInput(false)}>Cancel</button>
            </div>
          </form>
        )}
        <div className="flex flex-wrap gap-1 max-h-32 overflow-y-auto">
          {tags.map((tag) => (
            <div key={tag.id}>
              <div className="group flex items-center gap-1 px-2 py-0.5 rounded-full text-xs text-white cursor-pointer"
                style={{ backgroundColor: tag.color }}
                onClick={() => setEditingTagId(editingTagId === tag.id ? null : tag.id)}>
                <span>{tag.name}</span>
                <button className="opacity-0 group-hover:opacity-100 leading-none" onClick={(e) => { e.stopPropagation(); onDeleteTag(tag.id) }}>×</button>
              </div>
              {editingTagId === tag.id && (
                <div className="mt-1 flex gap-1 flex-wrap pl-1">
                  {TAG_COLORS.map((c) => (
                    <button key={c} type="button"
                      className={`w-4 h-4 rounded-full transition-transform ${tag.color === c ? 'scale-125 ring-2 ring-ring ring-offset-1 ring-offset-background' : 'hover:scale-110'}`}
                      style={{ backgroundColor: c }}
                      onClick={() => { onUpdateTag(tag.id, { color: c }); setEditingTagId(null) }} />
                  ))}
                </div>
              )}
            </div>
          ))}
          {!tags.length && !showTagInput && <span className="text-xs text-muted-foreground">No tags yet</span>}
        </div>
      </div>
    </div>
  )
}
