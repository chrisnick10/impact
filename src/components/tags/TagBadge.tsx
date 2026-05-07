import type { Tag } from '../../types'

interface Props {
  tag: Tag
  removable?: boolean
  onRemove?: () => void
}

export function TagBadge({ tag, removable, onRemove }: Props) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: tag.color }}
    >
      {tag.name}
      {removable && (
        <button className="leading-none hover:opacity-70" onClick={(e) => { e.stopPropagation(); onRemove?.() }}>
          ×
        </button>
      )}
    </span>
  )
}
