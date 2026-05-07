import { TagBadge } from './TagBadge'
import type { Tag } from '../../types'

interface Props {
  tags: Tag[]
  selectedIds: number[]
  onChange: (ids: number[]) => void
}

export function TagPicker({ tags, selectedIds, onChange }: Props) {
  if (!tags.length) return <p className="text-xs text-muted-foreground">No tags yet — add some in the sidebar.</p>
  return (
    <div className="flex flex-wrap gap-1.5">
      {tags.map((tag) => (
        <button
          key={tag.id}
          type="button"
          onClick={() => onChange(selectedIds.includes(tag.id) ? selectedIds.filter((i) => i !== tag.id) : [...selectedIds, tag.id])}
          className={`rounded-full transition-all ${selectedIds.includes(tag.id) ? 'ring-2 ring-ring ring-offset-1 ring-offset-background scale-105' : 'opacity-50 hover:opacity-80'}`}
        >
          <TagBadge tag={tag} />
        </button>
      ))}
    </div>
  )
}
