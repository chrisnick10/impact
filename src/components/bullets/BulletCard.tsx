import { useState } from 'react'
import { TagBadge } from '../tags/TagBadge'
import { getBulletText } from '../../lib/utils'
import type { BulletWithTags } from '../../types'

interface Props { bullet: BulletWithTags; onEdit: () => void; onDelete: () => void }

export function BulletCard({ bullet, onEdit, onDelete }: Props) {
  const [copied, setCopied] = useState(false)
  const text = getBulletText(bullet)

  async function handleCopy() {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="group relative bg-card border border-border rounded-lg p-4 hover:border-primary/40 transition-colors">
      {bullet.mode === 'imm' && (
        <div className="flex gap-2 mb-2 flex-wrap">
          {bullet.imm_impact && <span className="text-xs px-1.5 py-0.5 rounded bg-primary/10 text-primary font-medium">Impact</span>}
          {bullet.imm_method && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Method</span>}
          {bullet.imm_metric && <span className="text-xs px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-medium">Metric</span>}
        </div>
      )}
      <p className="text-sm text-foreground leading-relaxed">{text}</p>
      {bullet.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {bullet.tags.map((tag) => <TagBadge key={tag.id} tag={tag} />)}
        </div>
      )}
      <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
        <button onClick={handleCopy} title="Copy" className="w-7 h-7 flex items-center justify-center rounded-md bg-background border border-border hover:border-primary text-xs">{copied ? '✓' : '📋'}</button>
        <button onClick={onEdit} title="Edit" className="w-7 h-7 flex items-center justify-center rounded-md bg-background border border-border hover:border-primary text-xs">✏️</button>
        <button onClick={onDelete} title="Delete" className="w-7 h-7 flex items-center justify-center rounded-md bg-background border border-border hover:border-destructive text-xs">🗑</button>
      </div>
    </div>
  )
}
