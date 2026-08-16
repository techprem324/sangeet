import { moodColor } from '../data/moods'

// A tiny radar chart that visualizes the NLP mood vector the backend
// computed for the user's message — makes the "AI thinking" visible.

const AXES = [
  { key: 'target_valence', label: 'Valence', hint: 'brightness of the mood' },
  { key: 'target_energy', label: 'Energy', hint: 'how intense' },
  { key: 'target_danceability', label: 'Groove', hint: 'how danceable' },
]

export default function MoodRadar({ mood }) {
  const color = moodColor(mood.mood)
  const size = 130
  const cx = size / 2
  const cy = size / 2
  const R = size / 2 - 18

  const points = AXES.map((a, i) => {
    const angle = (Math.PI * 2 * i) / AXES.length - Math.PI / 2
    return {
      ...a,
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
      value: Math.max(0.05, Math.min(1, mood[a.key] ?? 0.5)),
    }
  })

  const poly = points
    .map((p) => {
      const v = p.value
      const x = cx + R * v * Math.cos((Math.PI * 2 * points.indexOf(p)) / AXES.length - Math.PI / 2)
      const y = cy + R * v * Math.sin((Math.PI * 2 * points.indexOf(p)) / AXES.length - Math.PI / 2)
      return `${x},${y}`
    })
    .join(' ')

  return (
    <div className="flex items-center gap-4" style={{ color: color.main }}>
      <svg width={size} height={size} className="shrink-0">
        {/* grid rings */}
        {[0.33, 0.66, 1].map((r) => (
          <polygon
            key={r}
            points={points.map((p) => `${cx + R * r * Math.cos((Math.PI * 2 * points.indexOf(p)) / 3 - Math.PI / 2)},${cy + R * r * Math.sin((Math.PI * 2 * points.indexOf(p)) / 3 - Math.PI / 2)}`).join(' ')}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.14"
            strokeWidth="1"
          />
        ))}
        <polygon points={poly} fill="currentColor" fillOpacity="0.18" stroke="currentColor" strokeWidth="1.6" />
        {/* axis dots */}
        {points.map((p) => (
          <circle
            key={p.key}
            cx={p.x}
            cy={p.y}
            r="2.4"
            fill="currentColor"
            opacity="0.7"
          />
        ))}
        {points.map((p) => {
          const v = p.value
          const x = cx + R * v * Math.cos((Math.PI * 2 * points.indexOf(p)) / 3 - Math.PI / 2)
          const y = cy + R * v * Math.sin((Math.PI * 2 * points.indexOf(p)) / 3 - Math.PI / 2)
          return <circle key={`dot-${p.key}`} cx={x} cy={y} r="3.4" fill="currentColor" />
        })}
      </svg>
      <div className="space-y-1.5 text-[11px] leading-tight">
        {points.map((p) => (
          <div key={p.key} className="flex items-baseline gap-2">
            <span className="w-14 text-sand-dim">{p.label}</span>
            <span className="font-semibold text-cream">{Math.round(p.value * 100)}</span>
            <span className="hidden sm:inline text-sand-dim/70">{p.hint}</span>
          </div>
        ))}
        <div className="flex items-baseline gap-2">
          <span className="w-14 text-sand-dim">Mood read</span>
          <span className="font-semibold text-cream">{Math.round((mood.confidence ?? 0.5) * 100)}%</span>
          <span className="text-sand-dim/70">confidence</span>
        </div>
      </div>
    </div>
  )
}
