// Hand-rolled inline SVG icons — consistent stroke style, no extra deps.

const base = (props) => ({
  width: props.size || 20,
  height: props.size || 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: props.strokeWidth || 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  ...props,
})

export const PlayIcon = (p) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M8 5.5v13a1 1 0 0 0 1.53.85l10.2-6.5a1 1 0 0 0 0-1.7L9.53 4.65A1 1 0 0 0 8 5.5z" />
  </svg>
)

export const PauseIcon = (p) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <rect x="6.5" y="5" width="3.6" height="14" rx="1.2" />
    <rect x="13.9" y="5" width="3.6" height="14" rx="1.2" />
  </svg>
)

export const NextIcon = (p) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M5 6.5v11a1 1 0 0 0 1.55.83l8-5.5a1 1 0 0 0 0-1.66l-8-5.5A1 1 0 0 0 5 6.5z" />
    <rect x="16.5" y="5.5" width="2.4" height="13" rx="1.1" />
  </svg>
)

export const PrevIcon = (p) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M19 6.5v11a1 1 0 0 1-1.55.83l-8-5.5a1 1 0 0 1 0-1.66l8-5.5A1 1 0 0 1 19 6.5z" />
    <rect x="5.1" y="5.5" width="2.4" height="13" rx="1.1" />
  </svg>
)

export const RepeatIcon = (p) => (
  <svg {...base(p)}>
    <path d="M17 2.5 20 5.5 17 8.5" />
    <path d="M4 5.5h12a4 4 0 0 1 4 4v1" />
    <path d="m7 21.5-3-3 3-3" />
    <path d="M20 18.5H8a4 4 0 0 1-4-4v-1" />
  </svg>
)

export const RepeatOneIcon = (p) => (
  <svg {...base(p)}>
    <path d="M17 2.5 20 5.5 17 8.5" />
    <path d="M4 5.5h12a4 4 0 0 1 4 4v1" />
    <path d="m7 21.5-3-3 3-3" />
    <path d="M20 18.5H8a4 4 0 0 1-4-4v-1" />
    <path d="M10.5 11.5v3M9 12.5l1.5-1 1.5 1" />
  </svg>
)

export const ShuffleIcon = (p) => (
  <svg {...base(p)}>
    <path d="M3 6h2.5a6 6 0 0 1 4.8 2.4l3.4 4.2a6 6 0 0 0 4.8 2.4H20" />
    <path d="M17 5l3 1-3 1" />
    <path d="M3 18h2.5a6 6 0 0 0 4.8-2.4l1.4-1.7" />
    <path d="M17 22l3-1-3-1" />
    <path d="M20 13v-1a6 6 0 0 0-4.8-2.4l-.7-.1" />
  </svg>
)

export const PlaylistIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 6h12M4 11h12M4 16h7" />
    <path d="M17 15.5a2.5 2.5 0 1 0 2.5 2.5V12l3-1" />
  </svg>
)

export const PlusIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const TrashIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M6.5 7l.8 12a2 2 0 0 0 2 1.9h5.4a2 2 0 0 0 2-1.9l.8-12" />
  </svg>
)

export const HeartIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 20.5s-7.5-4.7-9.3-9.4C1.4 7.8 3.6 4.8 6.7 4.8c2 0 3.7 1.1 5.3 3.1 1.6-2 3.3-3.1 5.3-3.1 3.1 0 5.3 3 4 6.3-1.8 4.7-9.3 9.4-9.3 9.4z" />
  </svg>
)

export const HeartFilledIcon = (p) => (
  <svg {...base(p)} fill="currentColor" stroke="none">
    <path d="M12 20.5s-7.5-4.7-9.3-9.4C1.4 7.8 3.6 4.8 6.7 4.8c2 0 3.7 1.1 5.3 3.1 1.6-2 3.3-3.1 5.3-3.1 3.1 0 5.3 3 4 6.3-1.8 4.7-9.3 9.4-9.3 9.4z" />
  </svg>
)

export const SearchIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20.5 20.5-4.5-4.5" />
  </svg>
)

export const SparkIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 3l1.9 5.6L19.5 10l-5.6 1.9L12 17.5l-1.9-5.6L4.5 10l5.6-1.4L12 3z" />
    <path d="M19 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8.8-2.2z" />
  </svg>
)

export const QueueIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 6h10M4 12h10M4 18h7" />
    <path d="M18 9v9M15.5 16.5 18 19l2.5-2.5" />
  </svg>
)

export const LyricsIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 6h16M4 12h10M4 18h7" />
    <circle cx="17.5" cy="16.5" r="2.5" />
  </svg>
)

export const XIcon = (p) => (
  <svg {...base(p)}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const ChevronIcon = (p) => (
  <svg {...base(p)}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const ClockIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3.5 2" />
  </svg>
)

export const SendIcon = (p) => (
  <svg {...base(p)}>
    <path d="M12 19V5M6 11l6-6 6 6" />
  </svg>
)

export const MusicIcon = (p) => (
  <svg {...base(p)}>
    <path d="M9 18V6l10-2v12" />
    <circle cx="6.5" cy="18" r="2.5" />
    <circle cx="16.5" cy="16" r="2.5" />
  </svg>
)

export const RadioIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="12" cy="12" r="2.2" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 7.8a6 6 0 0 1 0 8.4" />
    <path d="M4.9 4.9a10 10 0 0 0 0 14.2M19.1 4.9a10 10 0 0 1 0 14.2" />
  </svg>
)

export const LeafIcon = (p) => (
  <svg {...base(p)}>
    <path d="M20 4c-9 0-15 4-15 11 0 2.5 1.2 4 1.2 4s-1.2-6 6.3-8.5C6.8 13 4.5 16.5 4.5 16.5S13 14 16.5 8.5C13.5 7.5 10 8 10 8c1.5-2.5 5-3 8-3.5L20 4z" />
  </svg>
)

export const VolumeIcon = (p) => (
  <svg {...base(p)}>
    <path d="M4 10v4h3l4 3.5v-11L7 10H4z" />
    <path d="M15 9.5a4 4 0 0 1 0 5M17.5 7a7.5 7.5 0 0 1 0 10" />
  </svg>
)

export const DotsIcon = (p) => (
  <svg {...base(p)}>
    <circle cx="5" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="12" cy="12" r="1.4" fill="currentColor" stroke="none" />
    <circle cx="19" cy="12" r="1.4" fill="currentColor" stroke="none" />
  </svg>
)
