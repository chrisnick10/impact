import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { IMMEditor } from './IMMEditor'
import { TagPicker } from '../tags/TagPicker'
import type { BulletWithTags, NewBulletPayload, Tag, UpdateBulletPayload } from '../../types'

interface Props {
  open: boolean
  bullet?: BulletWithTags | null
  jobId: number
  tags: Tag[]
  onClose: () => void
  onSave: (data: NewBulletPayload | UpdateBulletPayload) => Promise<void>
}

export function BulletFormDialog({ open, bullet, jobId, tags, onClose, onSave }: Props) {
  const [mode, setMode] = useState<'custom' | 'imm'>('imm')
  const [customText, setCustomText] = useState('')
  const [impact, setImpact] = useState('')
  const [method, setMethod] = useState('')
  const [metric, setMetric] = useState('')
  const [tagIds, setTagIds] = useState<number[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (bullet) {
      setMode(bullet.mode); setCustomText(bullet.custom_text ?? '')
      setImpact(bullet.imm_impact ?? ''); setMethod(bullet.imm_method ?? '')
      setMetric(bullet.imm_metric ?? ''); setTagIds(bullet.tags.map((t) => t.id))
    } else {
      setMode('imm'); setCustomText(''); setImpact(''); setMethod(''); setMetric(''); setTagIds([])
    }
    setError(null)
  }, [bullet, open])

  if (!open) return null

  const isValid = mode === 'custom' ? customText.trim().length > 0 : impact.trim().length > 0

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isValid) return
    setSaving(true)
    setError(null)
    try {
      if (bullet) {
        await onSave({ id: bullet.id, mode,
          custom_text: mode === 'custom' ? customText.trim() : null,
          imm_impact: mode === 'imm' ? impact.trim() : null,
          imm_method: mode === 'imm' ? (method.trim() || null) : null,
          imm_metric: mode === 'imm' ? (metric.trim() || null) : null,
          tag_ids: tagIds } as UpdateBulletPayload)
      } else {
        await onSave({ job_id: jobId, mode,
          custom_text: mode === 'custom' ? customText.trim() : undefined,
          imm_impact: mode === 'imm' ? impact.trim() : undefined,
          imm_method: mode === 'imm' ? (method.trim() || undefined) : undefined,
          imm_metric: mode === 'imm' ? (metric.trim() || undefined) : undefined,
          tag_ids: tagIds } as NewBulletPayload)
      }
      onClose()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save. Check the console for details.')
    } finally { setSaving(false) }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-lg shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
        <h2 className="text-lg font-semibold mb-4">{bullet ? 'Edit Bullet' : 'Add Bullet'}</h2>
        <div className="flex gap-1 p-1 bg-muted rounded-lg mb-5">
          {(['imm', 'custom'] as const).map((m) => (
            <button key={m} type="button"
              className={`flex-1 py-1.5 text-sm rounded-md transition-colors ${mode === m ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
              onClick={() => setMode(m)}>
              {m === 'imm' ? 'Impact · Method · Metric' : 'Custom'}
            </button>
          ))}
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {mode === 'custom' ? (
            <textarea className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={4} value={customText} onChange={(e) => setCustomText(e.target.value)}
              placeholder="Led cross-functional team of 8 to deliver product 2 months early." autoFocus />
          ) : (
            <IMMEditor impact={impact} method={method} metric={metric}
              onChange={(f, v) => { if (f === 'impact') setImpact(v); else if (f === 'method') setMethod(v); else setMetric(v) }} />
          )}
          {tags.length > 0 && (
            <div>
              <label className="text-sm font-medium text-muted-foreground block mb-2">Tags</label>
              <TagPicker tags={tags} selectedIds={tagIds} onChange={setTagIds} />
            </div>
          )}
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex justify-end gap-2 pt-1">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm rounded-md border border-border hover:bg-accent">Cancel</button>
            <button type="submit" disabled={saving || !isValid} className="px-4 py-2 text-sm rounded-md bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-50">
              {saving ? 'Saving…' : bullet ? 'Save changes' : 'Add bullet'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
