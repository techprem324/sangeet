// Client-side rule-based sentiment & mood NLP analyzer
// Runs instantly in browser for real-time mood radar and chat recommendations
// even when backend is offline or on standalone Netlify hosting.

import { DEFAULT_CATEGORIES, DEFAULT_CATALOGS } from './defaultCatalog'

const MOOD_PROFILES = {
  heartbreak: {
    label: 'Broken Heart',
    emoji: '💔',
    valence: 0.18,
    energy: 0.25,
    danceability: 0.32,
    keywords: ['breakup', 'broke up', 'broken', 'heartbreak', 'heartbroken', 'sad', 'crying', 'tears', 'lonely', 'alone', 'hurt', 'pain', 'miss you', 'missing', 'unhappy', 'depressed', 'melancholy', 'dumped'],
    explanation: 'Detected sadness and heartbreak signals — cueing slow, acoustic piano ballads with low valence.'
  },
  rain_night: {
    label: 'Rainy Night',
    emoji: '🌧️',
    valence: 0.28,
    energy: 0.35,
    danceability: 0.40,
    keywords: ['rain', 'raining', 'rainy', 'midnight', 'night', '2am', '3am', 'dark', 'window', 'storm', 'clouds', 'thunder', 'late night'],
    explanation: 'Detected rainy, late-night atmospheric context — serving deep, contemplative midnight tracks.'
  },
  focus_lofi: {
    label: 'Lo-Fi Focus',
    emoji: '☕',
    valence: 0.50,
    energy: 0.40,
    danceability: 0.45,
    keywords: ['study', 'studying', 'focus', 'exam', 'exams', 'reading', 'read', 'code', 'coding', 'work', 'working', 'chill', 'lofi', 'lo-fi', 'tea', 'coffee'],
    explanation: 'Detected study and concentration flow — queueing gentle beats and non-distracting textures.'
  },
  gym_power: {
    label: 'Gym Beast',
    emoji: '⚡',
    valence: 0.65,
    energy: 0.92,
    danceability: 0.85,
    keywords: ['gym', 'workout', 'lift', 'lifting', 'heavy', 'beast', 'run', 'running', 'fitness', 'cardio', 'pump', 'pumped', 'training', 'power', 'hardstyle'],
    explanation: 'High-intensity athletic signals recognized — driving max-energy, pulse-pounding rhythm tracks.'
  },
  romantic: {
    label: 'Love Vibes',
    emoji: '🌹',
    valence: 0.82,
    energy: 0.55,
    danceability: 0.60,
    keywords: ['love', 'romantic', 'romance', 'date', 'crush', 'anniversary', 'sweetheart', 'kiss', 'valentine', 'dance', 'slow dance', 'couple', 'together'],
    explanation: 'Affection and warmth detected — curating lush, melodic love songs for intimate vibes.'
  },
  angry: {
    label: 'Frustrated',
    emoji: '🔥',
    valence: 0.22,
    energy: 0.88,
    danceability: 0.55,
    keywords: ['angry', 'anger', 'mad', 'furious', 'rage', 'hate', 'pissed', 'frustrated', 'frustration', 'screaming', 'yelling', 'betrayed', 'cheated', 'sick of'],
    explanation: 'High agitation and anger detected — selecting hard-hitting, cathartic release music.'
  },
  chill_sunday: {
    label: 'Chill Sunday',
    emoji: '🌤️',
    valence: 0.70,
    energy: 0.42,
    danceability: 0.50,
    keywords: ['sunday', 'relax', 'relaxing', 'calm', 'peaceful', 'lazy', 'breeze', 'tea', 'unwind', 'soothing', 'serene', 'smooth'],
    explanation: 'Restful, easygoing mood detected — blending acoustic strums and breezy weekend vibes.'
  },
  party: {
    label: 'Party Time',
    emoji: '🎉',
    valence: 0.88,
    energy: 0.90,
    danceability: 0.95,
    keywords: ['party', 'club', 'celebrate', 'celebrating', 'dance', 'dancing', 'birthday', 'weekend', 'drinks', 'dj', 'turn up', 'hyped', 'crazy'],
    explanation: 'Celebration and party signals active — delivering high-valence club bangers with peak danceability.'
  },
  nostalgic: {
    label: 'Nostalgic',
    emoji: '🕰️',
    valence: 0.58,
    energy: 0.52,
    danceability: 0.55,
    keywords: ['nostalgia', 'nostalgic', 'childhood', 'school', 'college', 'old days', 'memories', 'memory', 'remember', '90s', '2000s', 'classic', 'retro'],
    explanation: 'Sentimental reflection identified — bringing back timeless melodies from yesterday.'
  },
  morning_motivation: {
    label: 'Morning Fuel',
    emoji: '🚀',
    valence: 0.80,
    energy: 0.80,
    danceability: 0.75,
    keywords: ['morning', 'new day', 'awake', 'wake up', 'grind', 'motivation', 'motivate', 'motivated', 'fresh', 'sunshine', 'start', 'ready'],
    explanation: 'Early morning momentum detected — uplifting, forward-driving anthems to conquer the day.'
  }
}

export function clientAnalyzeMood(text = '', moodHint = '') {
  const clean = (text || '').toLowerCase()
  let bestKey = moodHint && MOOD_PROFILES[moodHint] ? moodHint : null
  let maxScore = 0

  if (!bestKey) {
    for (const [key, profile] of Object.entries(MOOD_PROFILES)) {
      let score = 0
      for (const kw of profile.keywords) {
        if (clean.includes(kw)) {
          score += kw.length > 5 ? 3 : 2
        }
      }
      if (score > maxScore) {
        maxScore = score
        bestKey = key
      }
    }
  }

  // default fallback
  if (!bestKey) {
    bestKey = 'chill_sunday'
  }

  const profile = MOOD_PROFILES[bestKey]
  return {
    mood: bestKey,
    mood_label: profile.label,
    emoji: profile.emoji,
    target_valence: profile.valence,
    target_energy: profile.energy,
    target_danceability: profile.danceability,
    confidence: maxScore > 0 ? Math.min(0.95, 0.65 + maxScore * 0.05) : 0.72,
    explanation: profile.explanation,
  }
}

export function clientGenerateChat(text = '', moodHint = '') {
  const mood = clientAnalyzeMood(text, moodHint)
  const tracks = DEFAULT_CATALOGS[mood.mood] || DEFAULT_CATALOGS['chill_sunday'] || []
  
  // Pick top 5 tracks for this vibe
  const selectedTracks = tracks.slice(0, 5)

  const reply = `${mood.emoji} **${mood.mood_label}** — I hear you. ${mood.explanation} Here are hand-picked 320kbps tracks aligned with your frequency:`

  return {
    reply,
    mood,
    tracks: selectedTracks,
  }
}
