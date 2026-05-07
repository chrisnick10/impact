import { composeIMM } from '../../lib/utils'

interface Props {
  impact: string; method: string; metric: string
  onChange: (field: 'impact' | 'method' | 'metric', value: string) => void
}

export function IMMEditor({ impact, method, metric, onChange }: Props) {
  const preview = composeIMM(impact || null, method || null, metric || null)
  const field = (label: string, hint: string, key: 'impact' | 'method' | 'metric', val: string, ph: string) => (
    <div>
      <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block mb-1">
        {label} <span className="font-normal normal-case text-muted-foreground/60">— {hint}</span>
      </label>
      <input
        className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
        value={val}
        onChange={(e) => onChange(key, e.target.value)}
        placeholder={ph}
      />
    </div>
  )
  return (
    <div className="space-y-3">
      {field('Impact', 'What was achieved?', 'impact', impact, 'Reduced customer churn by 15%')}
      {field('Method', 'How?', 'method', method, 'implementing predictive analytics dashboard')}
      {field('Metric', 'Supporting data', 'metric', metric, 'across 2,000+ enterprise accounts')}
      {preview && (
        <div className="rounded-md bg-muted/50 border border-border p-3">
          <p className="text-xs font-medium text-muted-foreground mb-1">Preview</p>
          <p className="text-sm text-foreground leading-relaxed">{preview}</p>
        </div>
      )}
    </div>
  )
}
