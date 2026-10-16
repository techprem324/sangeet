/**
 * test_search.js
 * Comprehensive automated search accuracy suite for Sangeet.
 */

import {
  smartSearchCatalog,
  getSearchPredictions,
  detectArtist,
  detectMoodOrGenre,
  POPULAR_SINGERS,
  ARTIST_DISCOGRAPHIES,
  NEW_RELEASES_2025_2026,
} from './frontend/src/data/searchEngine.js'

// Construct catalog
const ALL_TRACKS = [
  ...Object.values(ARTIST_DISCOGRAPHIES).flat(),
  ...NEW_RELEASES_2025_2026,
]

console.log(`\n==============================================`)
console.log(`🎵 SANGEET SEARCH ENGINE ACCURACY TEST SUITE`)
console.log(`Total indexed tracks: ${ALL_TRACKS.length}`)
console.log(`Total popular singers: ${POPULAR_SINGERS.length}`)
console.log(`==============================================\n`)

const testCases = [
  // 1. Direct song title matches
  { query: 'Kesariya', expectedType: 'song', mustContain: 'Kesariya' },
  { query: 'Haseen', expectedType: 'song', mustContain: 'Haseen' },
  { query: 'Maan Meri Jaan', expectedType: 'song', mustContain: 'Maan Meri Jaan' },
  { query: 'Pehle Bhi Main', expectedType: 'song', mustContain: 'Pehle' },
  { query: 'Hola Amigo', expectedType: 'song', mustContain: 'Hola Amigo' },
  { query: 'Tum Hi Ho', expectedType: 'song', mustContain: 'Tum Hi Ho' },
  { query: 'Channa Mereya', expectedType: 'song', mustContain: 'Channa Mereya' },

  // 2. Artist queries (exact & typos)
  { query: 'Talwiinder', expectedType: 'artist', mustContain: 'Talwiinder' },
  { query: 'talwinder', expectedType: 'artist', mustContain: 'Talwiinder' },
  { query: 'Seedhe Maut', expectedType: 'artist', mustContain: 'Seedhe Maut' },
  { query: 'seedhe mout', expectedType: 'artist', mustContain: 'Seedhe Maut' },
  { query: 'arjit', expectedType: 'artist', mustContain: 'Arijit' },
  { query: 'arjit singh', expectedType: 'artist', mustContain: 'Arijit' },
  { query: 'honey singh', expectedType: 'artist', mustContain: 'Honey Singh' },
  { query: 'badshah', expectedType: 'artist', mustContain: 'Badshah' },
  { query: 'badsha', expectedType: 'artist', mustContain: 'Badshah' },
  { query: 'kumar sanu', expectedType: 'artist', mustContain: 'Kumar Sanu' },
  { query: 'sanu', expectedType: 'artist', mustContain: 'Kumar Sanu' },
  { query: 'lucky ali', expectedType: 'artist', mustContain: 'Lucky Ali' },
  { query: 'jagjit singh', expectedType: 'artist', mustContain: 'Jagjit Singh' },
  { query: 'vishal mishra', expectedType: 'artist', mustContain: 'Vishal Mishra' },
  { query: 'jasleen royal', expectedType: 'artist', mustContain: 'Jasleen Royal' },
  { query: 'prateek kuhad', expectedType: 'artist', mustContain: 'Prateek Kuhad' },
  { query: 'king', expectedType: 'artist', mustContain: 'King' },
  { query: 'the weeknd', expectedType: 'artist', mustContain: 'The Weeknd' },
  { query: 'taylor swift', expectedType: 'artist', mustContain: 'Taylor Swift' },
  { query: 'coldplay', expectedType: 'artist', mustContain: 'Coldplay' },

  // 3. Famous Lyrics snippets
  { query: 'dil sambhal ja zara', expectedType: 'lyrics', mustContain: 'Phir Mohabbat' },
  { query: 'kehndi hundi si', expectedType: 'lyrics', mustContain: 'Excuses' },
  { query: 'pehle bhi main tumse mila', expectedType: 'lyrics', mustContain: 'Pehle Bhi Main' },
  { query: 'heeriye heeriye aa', expectedType: 'lyrics', mustContain: 'Heeriye' },
  { query: 'husn tera tauba tauba', expectedType: 'lyrics', mustContain: 'Tauba Tauba' },
  { query: 'mera dil badal gaya', expectedType: 'lyrics', mustContain: 'Haseen' },
  { query: 'o sajni re', expectedType: 'lyrics', mustContain: 'Sajni' },
  { query: 'aaj ki raat', expectedType: 'lyrics', mustContain: 'Aaj Ki Raat' },

  // 4. Mood & Genre Queries
  { query: 'sad songs', expectedType: 'mood', mustContain: 'Sad' },
  { query: 'romantic hits', expectedType: 'mood', mustContain: 'Romance' },
  { query: 'party songs', expectedType: 'mood', mustContain: 'Party' },
  { query: 'punjabi hits', expectedType: 'mood', mustContain: 'Punjabi' },
  { query: 'late night lofi', expectedType: 'mood', mustContain: 'Lo-Fi' },
]

let passed = 0
let failed = 0

for (const tc of testCases) {
  // Test prediction
  const preds = getSearchPredictions(tc.query)
  // Test smart search
  const hits = smartSearchCatalog(tc.query, ALL_TRACKS)
  const artistDet = detectArtist(tc.query)
  const moodDet = detectMoodOrGenre(tc.query)

  let matched = false
  let detail = ''

  if (tc.expectedType === 'artist') {
    if (artistDet && artistDet.artist.name.toLowerCase().includes(tc.mustContain.toLowerCase())) {
      matched = true
      detail = `Artist detected: ${artistDet.artist.name} (${artistDet.tracks.length} tracks)`
    } else if (preds.some(p => p.text.toLowerCase().includes(tc.mustContain.toLowerCase()) || (p.query && p.query.toLowerCase().includes(tc.mustContain.toLowerCase())))) {
      matched = true
      detail = `Prediction matched: ${preds[0].text}`
    } else if (hits.some(h => (h.artist || '').toLowerCase().includes(tc.mustContain.toLowerCase()))) {
      matched = true
      detail = `Catalog hit: ${hits[0].title} by ${hits[0].artist}`
    }
  } else if (tc.expectedType === 'lyrics') {
    if (hits.some(h => (h.title || '').toLowerCase().includes(tc.mustContain.toLowerCase()))) {
      matched = true
      detail = `Lyrics mapped to track: ${hits[0].title}`
    } else if (preds.some(p => p.text.toLowerCase().includes(tc.mustContain.toLowerCase()))) {
      matched = true
      detail = `Prediction matched: ${preds[0].text}`
    }
  } else if (tc.expectedType === 'mood') {
    if (moodDet && moodDet.label.toLowerCase().includes(tc.mustContain.toLowerCase())) {
      matched = true
      detail = `Mood detected: ${moodDet.label}`
    } else if (preds.some(p => p.text.toLowerCase().includes(tc.mustContain.toLowerCase()))) {
      matched = true
      detail = `Prediction matched: ${preds[0].text}`
    }
  } else {
    // Song title
    if (hits.some(h => (h.title || '').toLowerCase().includes(tc.mustContain.toLowerCase()))) {
      matched = true
      detail = `Top song hit: ${hits[0].title} by ${hits[0].artist}`
    } else if (preds.some(p => p.text.toLowerCase().includes(tc.mustContain.toLowerCase()))) {
      matched = true
      detail = `Prediction: ${preds[0].text}`
    }
  }

  if (matched) {
    passed++
    console.log(`  ✅ [PASS] "${tc.query}" -> ${detail}`)
  } else {
    failed++
    console.log(`  ❌ [FAIL] "${tc.query}" -> Expected "${tc.mustContain}" not found!`)
  }
}

console.log(`\n==============================================`)
console.log(`Test Results: ${passed} PASSED, ${failed} FAILED (Accuracy: ${((passed / testCases.length) * 100).toFixed(1)}%)`)
console.log(`==============================================\n`)

if (failed > 0) {
  process.exit(1)
}
