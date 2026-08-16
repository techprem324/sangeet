// Quick-prompt pills shown above the chat input, plus a warm accent color
// per mood category so every vibe has its own hue in the UI.

export const MOOD_PILLS = [
  { key: 'heartbreak', label: 'Broken Heart', emoji: '💔', prompt: "I just went through a breakup and it's raining outside at 2am" },
  { key: 'focus_lofi', label: 'Lo-Fi Focus', emoji: '☕', prompt: "I'm stressed about exams and need to focus for hours" },
  { key: 'gym_power', label: 'Gym Beast', emoji: '⚡', prompt: 'Gym day — time to lift heavy and go beast mode' },
  { key: 'romantic', label: 'Love Vibes', emoji: '🌹', prompt: "It's our anniversary — I want romantic songs for a slow dance" },
  { key: 'chill_sunday', label: 'Chill Sunday', emoji: '🌤️', prompt: 'Just relaxing on a Sunday morning with tea and no plans' },
  { key: 'party', label: 'Party Time', emoji: '🎉', prompt: "It's my birthday weekend and we're throwing a huge party" },
  { key: 'angry', label: 'Frustrated', emoji: '🔥', prompt: 'My day was awful and I need to let the anger out' },
  { key: 'nostalgic', label: 'Nostalgic', emoji: '🕰️', prompt: 'These old songs remind me of school days, so nostalgic' },
  { key: 'morning_motivation', label: 'Morning Fuel', emoji: '🚀', prompt: 'New day, new me — I need motivation to crush today' },
  { key: 'rain_night', label: 'Rainy Night', emoji: '🌧️', prompt: 'Rain on the window at midnight and I want to feel everything' },
]

// warm, non-neon accent per category
export const MOOD_COLORS = {
  heartbreak: { main: '#c98a8a', deep: '#a96f6f' },
  rain_night: { main: '#8aa8c9', deep: '#6f8aa9' },
  focus_lofi: { main: '#c9a97e', deep: '#a98a5f' },
  gym_power: { main: '#d97742', deep: '#b85f33' },
  romantic: { main: '#d98b7a', deep: '#b96f5f' },
  angry: { main: '#cf7d6f', deep: '#a85f52' },
  chill_sunday: { main: '#a3b189', deep: '#83916f' },
  party: { main: '#c9a86a', deep: '#a98a4f' },
  nostalgic: { main: '#a88bb8', deep: '#886f98' },
  morning_motivation: { main: '#e0a35e', deep: '#c9853f' },
  default: { main: '#e09a4e', deep: '#c97f3a' },
}

export function moodColor(key) {
  return MOOD_COLORS[key] || MOOD_COLORS.default
}

export const VIEWS = [
  { key: 'home', label: 'Home' },
  { key: 'chat', label: 'Chat' },
  { key: 'browse', label: 'Mood rooms' },
  { key: 'search', label: 'Search' },
  { key: 'playlists', label: 'My playlists' },
  { key: 'liked', label: 'Your songs' },
]
