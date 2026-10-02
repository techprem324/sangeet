/**
 * searchEngine.js
 * Comprehensive Spotify-style search, prediction & artist playlist engine for Sangeet.
 * Handles:
 * - Popular Singers with verified portraits and full dedicated artist discographies
 * - Dedicated Artist Playlists (Arijit Singh, Atif Aslam, Shreya Ghoshal, etc.)
 * - New Releases & Recent 2024-2026 Trending Chartbusters
 * - Famous lyrics fragment matching (e.g. "dil sambhal ja zara", "kesariya tera ishq")
 * - 15+ instant autocomplete suggestions & predictions
 * - Multi-token fuzzy scoring & ranking
 */

export const POPULAR_SINGERS = [
  {
    id: 'arijit_singh',
    name: 'Arijit Singh',
    role: 'Playback Singer & King of Soul',
    avatar: 'https://c.saavncdn.com/840/Best-Of-Arijit-Singh-Collection-Of-Romantic-Songs-Hindi-2025-20251203161112-500x500.jpg',
    gradient: 'from-amber-600/30 to-rose-900/30',
    tags: ['Romantic', 'Heartbreak', 'Acoustic'],
    query: 'Arijit Singh',
    monthlyListeners: '42.8M',
    bio: 'India’s most streamed artist of the decade. The definitive voice of modern romance, yearning, and cathartic melodies.',
  },
  {
    id: 'atif_aslam',
    name: 'Atif Aslam',
    role: 'Vocal Legend & Rock Balladeer',
    avatar: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg',
    gradient: 'from-blue-600/30 to-indigo-900/30',
    tags: ['Soulful', 'Nostalgic', 'Rock'],
    query: 'Atif Aslam',
    monthlyListeners: '29.4M',
    bio: 'Pioneer of early 2000s South Asian pop-rock and unforgettable romantic anthems that defined a generation.',
  },
  {
    id: 'shreya_ghoshal',
    name: 'Shreya Ghoshal',
    role: 'Melody Queen of India',
    avatar: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg',
    gradient: 'from-emerald-600/30 to-teal-900/30',
    tags: ['Classical', 'Romantic', 'Bollywood'],
    query: 'Shreya Ghoshal',
    monthlyListeners: '35.1M',
    bio: 'Five-time National Film Award winner with an unmatched vocal range from classical Indian compositions to modern pop.',
  },
  {
    id: 'diljit_dosanjh',
    name: 'Diljit Dosanjh',
    role: 'Global Punjabi Icon & Superstar',
    avatar: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg',
    gradient: 'from-orange-600/30 to-red-900/30',
    tags: ['Punjabi Pop', 'Party', 'Bhangra'],
    query: 'Diljit Dosanjh',
    monthlyListeners: '24.7M',
    bio: 'History-maker selling out global stadiums and Coachella, fusing Punjabi folk with modern hip-hop and trap rhythms.',
  },
  {
    id: 'karan_aujla',
    name: 'Karan Aujla',
    role: 'Geetan Di Machine & Global Punjabi Icon',
    avatar: 'https://c.saavncdn.com/918/AUJLA-SZN-1-Punjabi-2026-20260925122119-500x500.jpg',
    gradient: 'from-red-600/30 to-amber-900/30',
    tags: ['Punjabi Trap', 'High Energy', 'Hip-Hop'],
    query: 'Karan Aujla',
    monthlyListeners: '28.6M',
    bio: 'Prolific lyricist and international sensation redefining modern Punjabi hip-hop with viral chartbusters like Tauba Tauba, Winning Speech, Ashke, and Softly.',
  },
  {
    id: 'pritam',
    name: 'Pritam',
    role: 'Chartbuster Maestro & Composer',
    avatar: 'https://c.saavncdn.com/316/Tum-Mile-Hindi-2009-20260120201221-500x500.jpg',
    gradient: 'from-purple-600/30 to-violet-900/30',
    tags: ['Bollywood Hits', 'Youth Anthems'],
    query: 'Pritam',
    monthlyListeners: '38.2M',
    bio: 'The musical architect behind two decades of Bollywood’s most beloved albums, from Life in a Metro to Brahmāstra.',
  },
  {
    id: 'kishore_kumar',
    name: 'Kishore Kumar',
    role: 'Golden Retro Evergreen Legend',
    avatar: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg',
    gradient: 'from-yellow-600/30 to-amber-900/30',
    tags: ['Retro Classics', 'Evergreen 70s & 80s'],
    query: 'Kishore Kumar',
    monthlyListeners: '18.9M',
    bio: 'The greatest entertainer in Indian cinema history. Unbound vocal energy, peerless yodeling, and eternal soul.',
  },
  {
    id: 'ap_dhillon',
    name: 'AP Dhillon',
    role: 'Brown Munde & Modern Trap',
    avatar: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg',
    gradient: 'from-zinc-600/30 to-neutral-900/30',
    tags: ['Punjabi Trap', 'Lo-Fi Melodies'],
    query: 'AP Dhillon',
    monthlyListeners: '16.5M',
    bio: 'Spearheaded the worldwide wave of Punjabi lo-fi and trap, turning minimalist beats into global anthems.',
  },
  {
    id: 'kk',
    name: 'KK (Krishnakumar Kunnath)',
    role: 'Voice of Nostalgia & College Memories',
    avatar: 'https://c.saavncdn.com/artists/KK_500x500.jpg',
    gradient: 'from-cyan-600/30 to-blue-900/30',
    tags: ['Empathy', 'Rock', 'Memories'],
    query: 'KK',
    monthlyListeners: '22.3M',
    bio: 'Pure heart, electric raw rock vocals, and eternal songs of friendship, heartbreak, and growing up.',
  },
  {
    id: 'sonu_nigam',
    name: 'Sonu Nigam',
    role: 'Modern Rafi & Vocal Perfectionist',
    avatar: 'https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg',
    gradient: 'from-pink-600/30 to-rose-900/30',
    tags: ['Golden Era', 'Emotional', 'Range'],
    query: 'Sonu Nigam',
    monthlyListeners: '26.8M',
    bio: 'Flawless pitch and emotional versatility, delivering the highest caliber of Hindi romantic playback.',
  },
  {
    id: 'anuv_jain',
    name: 'Anuv Jain',
    role: 'Acoustic Indie & Gentle Poetry',
    avatar: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg',
    gradient: 'from-stone-600/30 to-amber-950/30',
    tags: ['Indie Acoustic', 'Poetry', 'Late Night'],
    query: 'Anuv Jain',
    monthlyListeners: '14.2M',
    bio: 'Intimate acoustic storyteller whose gentle guitar fingerpicking and poetic lyrics touch millions of hearts.',
  },
  {
    id: 'sidhu_moose_wala',
    name: 'Sidhu Moose Wala',
    role: 'The Legend & Punjabi Hip-Hop Giant',
    avatar: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg',
    gradient: 'from-red-600/30 to-rose-950/30',
    tags: ['High Bass', 'Hip-Hop', 'Legacy'],
    query: 'Sidhu Moose Wala',
    monthlyListeners: '21.0M',
    bio: 'The undisputed voice of Punjabi street rap. Raw lyrics, hard-hitting bass, and an eternal cultural legacy.',
  },
  {
    id: 'b_praak',
    name: 'B Praak',
    role: 'Powerhouse of Emotional Melodies',
    avatar: 'https://c.saavncdn.com/artists/B_Praak_001_20191118112005_500x500.jpg',
    gradient: 'from-amber-700/30 to-orange-950/30',
    tags: ['Heartfelt', 'Anthems', 'High Pitch'],
    query: 'B Praak',
    monthlyListeners: '19.4M',
    bio: 'National Award-winning singer and composer famous for tear-jerking ballads with soaring high notes.',
  },
  {
    id: 'mohit_chauhan',
    name: 'Mohit Chauhan',
    role: 'Sufi, Travel & Rockstar Ballads',
    avatar: 'https://c.saavncdn.com/artists/Mohit_Chauhan_500x500.jpg',
    gradient: 'from-teal-600/30 to-slate-900/30',
    tags: ['Travel', 'Rockstar', 'Silk Voice'],
    query: 'Mohit Chauhan',
    monthlyListeners: '17.6M',
    bio: 'The earthy, silk-textured voice behind Rockstar and countless road-trip melodies.',
  },
]

/**
 * 2024-2026 Latest Releases & Trending Chartbusters
 */
export const NEW_RELEASES_2025_2026 = [
  {
    "id": "nr_1",
    "title": "Apna Bana Le",
    "artist": "Amitabh Bhattacharya, Sachin-Jigar, Arijit Singh",
    "album": "Best of 2025",
    "cover": "https://c.saavncdn.com/960/Best-of-2025-Hindi-2025-20251231141050-150x150.jpg",
    "stream_url": "https://aac.saavncdn.com/960/db549ef7360e430ba9351369c39d7fd2_320.mp4",
    "duration": 261,
    "badge": "Trending #1",
    "year": "2025"
  },
  {
    "id": "nr_2",
    "title": "Zaalima",
    "artist": "Arijit Singh, Harshdeep Kaur",
    "album": "Best of 2025",
    "cover": "https://c.saavncdn.com/960/Best-of-2025-Hindi-2025-20251231141050-150x150.jpg",
    "stream_url": "https://aac.saavncdn.com/960/93fcdbb7bfd475fe2fbec55ad4fcae4b_320.mp4",
    "duration": 299,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_3",
    "title": "Gehra Hua (From &quot;Dhurandhar&quot;)",
    "artist": "Arijit Singh, Armaan Khan",
    "album": "Gehra Hua (From &quot;Dhurandhar&quot;)",
    "cover": "https://c.saavncdn.com/450/Gehra-Hua-From-Dhurandhar-Hindi-2025-20251205154217-150x150.jpg",
    "stream_url": "https://aac.saavncdn.com/450/f467e05e2825cec2203546333e0d0550_320.mp4",
    "duration": 362,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_4",
    "title": "Tainu Khabar Nahi",
    "artist": "Amitabh Bhattacharya, Sachin-Jigar, Arijit Singh",
    "album": "Best of 2025",
    "cover": "https://c.saavncdn.com/960/Best-of-2025-Hindi-2025-20251231141050-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/960/c8edd07c5972a030b46112fdb055664c_320.mp4",
    "duration": 188,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_5",
    "title": "Arz Kiya Hai | Coke Studio Bharat",
    "artist": "Anuv Jain",
    "album": "Arz Kiya Hai | Coke Studio Bharat",
    "cover": "https://c.saavncdn.com/504/Arz-Kiya-Hai-Coke-Studio-Bharat-Hindi-2025-20250818054005-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/504/a70f9144a360aa064fadffa886e7c8b6_320.mp4",
    "duration": 294,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_6",
    "title": "Barbaad",
    "artist": "The Rish, Jubin Nautiyal",
    "album": "Saiyaara",
    "cover": "https://c.saavncdn.com/598/Saiyaara-Hindi-2025-20250703061754-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/598/9117397be2712fb843b268a7c16b941a_320.mp4",
    "duration": 357,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_7",
    "title": "Saiyaara",
    "artist": "Tanishk Bagchi, Faheem Abdullah, Arslan Nizami, Irshad Kamil",
    "album": "Saiyaara",
    "cover": "https://c.saavncdn.com/598/Saiyaara-Hindi-2025-20250703061754-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/598/7323a0d8686f6c1b9c21f098c23a9557_320.mp4",
    "duration": 370,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_8",
    "title": "Vaaroon Trending Version",
    "artist": "Ginny Diwan, Anand Bhaskar, Romy",
    "album": "Vaaroon Trending Version",
    "cover": "https://c.saavncdn.com/037/Vaaroon-Trending-Version-Hindi-2025-20250709213623-150x150.jpg",
    "stream_url": "https://aac.saavncdn.com/037/5c1b6f34a94c685bd67cb567bf688e6a_320.mp4",
    "duration": 151,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_9",
    "title": "Ashke",
    "artist": "Karan Aujla, MXRCI",
    "album": "AUJLA SZN 1",
    "cover": "https://c.saavncdn.com/918/AUJLA-SZN-1-Punjabi-2026-20260925122119-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/918/6e6686166f6041833dbc333a70ca1eeb_320.mp4",
    "duration": 217,
    "badge": "Trending #1",
    "year": "2026"
  },
  {
    "id": "nr_10",
    "title": "Tauba Tauba (From \"Bad Newz\")",
    "artist": "Karan Aujla",
    "album": "Bad Newz",
    "cover": "https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4",
    "duration": 207,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_11",
    "title": "Winning Speech",
    "artist": "Karan Aujla, MXRCI",
    "album": "Winning Speech",
    "cover": "https://c.saavncdn.com/089/Winning-Speech-Punjabi-2024-20260626013220-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4",
    "duration": 227,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_12",
    "title": "Softly",
    "artist": "Karan Aujla, Ikky",
    "album": "Making Memories",
    "cover": "https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4",
    "duration": 155,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_13",
    "title": "Boyfriend",
    "artist": "Karan Aujla, IKKY",
    "album": "P-POP CULTURE",
    "cover": "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/621/895e14c38bf774a0122eef2528b39272_320.mp4",
    "duration": 160,
    "badge": "Trending #1",
    "year": "2026"
  },
  {
    "id": "nr_14",
    "title": "Wavy",
    "artist": "Karan Aujla, Jay Trak",
    "album": "Wavy",
    "cover": "https://c.saavncdn.com/178/Wavy-Punjabi-2024-20250523044332-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/178/9af31095a56a0a124dee89ef89ffee5a_320.mp4",
    "duration": 161,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_15",
    "title": "For A Reason",
    "artist": "Karan Aujla, IKKY",
    "album": "P-POP CULTURE",
    "cover": "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/621/59d7b22aeaa69bd8158c1852e0b556d3_320.mp4",
    "duration": 180,
    "badge": "Chartbuster",
    "year": "2025"
  },
  {
    "id": "nr_16",
    "title": "Low Fade",
    "artist": "Karan Aujla, MXRCI",
    "album": "AUJLA SZN",
    "cover": "https://c.saavncdn.com/892/Low-Fade-Punjabi-2026-20260621183701-500x500.jpg",
    "stream_url": "https://aac.saavncdn.com/892/1beba31a15434dcae47bcb4085bb5827_320.mp4",
    "duration": 175,
    "badge": "Trending #1",
    "year": "2026"
  }
]

/**
 * Dedicated Artist Playlists (Verified 320 kbps & Active CDNs)
 */
export const ARTIST_DISCOGRAPHIES = {
  "karan_aujla": [
    {
      "id": "karan_aujla_AhkSYQEF",
      "title": "Ashke",
      "artist": "Karan Aujla, MXRCI",
      "album": "AUJLA SZN 1",
      "cover": "https://c.saavncdn.com/918/AUJLA-SZN-1-Punjabi-2026-20260925122119-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/918/6e6686166f6041833dbc333a70ca1eeb_320.mp4",
      "duration": 217,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_tauba_tauba",
      "title": "Tauba Tauba (From \"Bad Newz\")",
      "artist": "Karan Aujla",
      "album": "Bad Newz",
      "cover": "https://c.saavncdn.com/992/Bad-Newz-Hindi-2024-20250730113701-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/992/5d44da8bc1d78fb72d18b701d758fd1f_320.mp4",
      "duration": 207,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_DF6eazs2",
      "title": "Winning Speech",
      "artist": "Karan Aujla, MXRCI",
      "album": "Winning Speech",
      "cover": "https://c.saavncdn.com/089/Winning-Speech-Punjabi-2024-20260626013220-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/089/64beffa430e4c948223ec6bfcc3a13f0_320.mp4",
      "duration": 227,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_softly",
      "title": "Softly",
      "artist": "Karan Aujla, Ikky",
      "album": "Making Memories",
      "cover": "https://c.saavncdn.com/538/Making-Memories-English-2023-20230818075015-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/538/727114725cd7ec508b1df0a7e4515e5e_320.mp4",
      "duration": 155,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_X1qxz-Cc",
      "title": "Boyfriend",
      "artist": "Karan Aujla, IKKY",
      "album": "P-POP CULTURE",
      "cover": "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/621/895e14c38bf774a0122eef2528b39272_320.mp4",
      "duration": 160,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_gwX71Dmc",
      "title": "Wavy",
      "artist": "Karan Aujla, Jay Trak",
      "album": "Wavy",
      "cover": "https://c.saavncdn.com/178/Wavy-Punjabi-2024-20250523044332-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/178/9af31095a56a0a124dee89ef89ffee5a_320.mp4",
      "duration": 161,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_vLSaC03b",
      "title": "For A Reason",
      "artist": "Karan Aujla, IKKY",
      "album": "P-POP CULTURE",
      "cover": "https://c.saavncdn.com/621/P-POP-CULTURE-Punjabi-2025-20250820043757-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/621/59d7b22aeaa69bd8158c1852e0b556d3_320.mp4",
      "duration": 180,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_bHO-xsvi",
      "title": "White Brown Black",
      "artist": "Avvy Sra, Karan Aujla, Jaani",
      "album": "White Brown Black",
      "cover": "https://c.saavncdn.com/177/White-Brown-Black-Punjabi-2022-20251118151218-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/177/8a4e89ae82b74333f57ab3130b05d056_320.mp4",
      "duration": 176,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_P-3rf5qD",
      "title": "Low Fade",
      "artist": "Karan Aujla, MXRCI",
      "album": "AUJLA SZN",
      "cover": "https://c.saavncdn.com/892/Low-Fade-Punjabi-2026-20260621183701-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/892/1beba31a15434dcae47bcb4085bb5827_320.mp4",
      "duration": 175,
      "badge": "Studio 320kbps"
    },
    {
      "id": "karan_aujla_iAKpx8Y8",
      "title": "Aujla Szn",
      "artist": "Karan Aujla, MXRCI",
      "album": "AUJLA SZN 1",
      "cover": "https://c.saavncdn.com/918/AUJLA-SZN-1-Punjabi-2026-20260925122119-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/918/77389adc1c06a78f1cd939a4038a9fe2_320.mp4",
      "duration": 218,
      "badge": "Studio 320kbps"
    }
  ],
  "arijit_singh": [
    {
      "id": "arijit_singh_1",
      "title": "Apna Bana Le",
      "artist": "Amitabh Bhattacharya, Sachin-Jigar, Arijit Singh",
      "album": "Romantic Classics Hits",
      "duration": 261,
      "cover": "https://c.saavncdn.com/238/Romantic-Classics-Hits-Hindi-2026-20260529163838-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/238/5583fbab6328b12f467f01ee335e496d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_2",
      "title": "Zaalima",
      "artist": "Arijit Singh, Harshdeep Kaur",
      "album": "Romantic Classics Hits",
      "duration": 299,
      "cover": "https://c.saavncdn.com/238/Romantic-Classics-Hits-Hindi-2026-20260529163838-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/238/4a6bad397e3277a422604a4e5db29327_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_3",
      "title": "Muskurane (Romantic)",
      "artist": "Jeet Gannguli, Arijit Singh, Rashmi-Virag",
      "album": "Emraan Hashmi Sad Love Hits",
      "duration": 334,
      "cover": "https://c.saavncdn.com/732/Emraan-Hashmi-Sad-Love-Hits-Hindi-2026-20260604155755-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/732/1639e30ad182af5cabcd44f451abd5d1_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_4",
      "title": "Romantic Mashup 2026 by DJ Star & DJ Alex Mumbai",
      "artist": "Arijit Singh, Dj Star, Dj Alex Mumbai",
      "album": "Romantic Mashup 2026 by DJ Star & DJ Alex Mumbai",
      "duration": 267,
      "cover": "https://c.saavncdn.com/237/Romantic-Mashup-2026-by-DJ-Star-DJ-Alex-Mumbai-Hindi-2026-20260213025005-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/237/cf8a4c9d9695cb7f383d4d79d400ee56_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_5",
      "title": "Tum Hi Ho (From \"Aashiqui 2\")",
      "artist": "Arijit Singh, Mithoon",
      "album": "Best Of Arijit Singh - Collection Of Romantic Songs",
      "duration": 261,
      "cover": "https://c.saavncdn.com/840/Best-Of-Arijit-Singh-Collection-Of-Romantic-Songs-Hindi-2025-20251203161112-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/840/c9e70fb62d66fa6e14f6b7cdbc56cc05_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_6",
      "title": "Pal Pal Dil Ke Paas- Title Track",
      "artist": "Siddharth-Garima, Arijit Singh, Parampara Tandon, Sachet-Parampara",
      "album": "Romantic Classics Hits",
      "duration": 254,
      "cover": "https://c.saavncdn.com/238/Romantic-Classics-Hits-Hindi-2026-20260529163838-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/238/0a5adedbe840b54c9ffc67bc1da9d019_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_7",
      "title": "Tainu Khabar Nahi",
      "artist": "Amitabh Bhattacharya, Sachin-Jigar, Arijit Singh",
      "album": "Romantic Classics Hits",
      "duration": 188,
      "cover": "https://c.saavncdn.com/238/Romantic-Classics-Hits-Hindi-2026-20260529163838-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/238/83033b7ee4e73eefb77ef50b544d1481_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_8",
      "title": "Gehra Hua (From &quot;Dhurandhar&quot;)",
      "artist": "Arijit Singh, Armaan Khan",
      "album": "Gehra Hua (From &quot;Dhurandhar&quot;)",
      "duration": 362,
      "cover": "https://c.saavncdn.com/450/Gehra-Hua-From-Dhurandhar-Hindi-2025-20251205154217-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/450/f467e05e2825cec2203546333e0d0550_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_9",
      "title": "Mast Magan",
      "artist": "Shankar-Ehsaan-Loy, Arijit Singh, Chinmayi Sripada",
      "album": "2 States",
      "duration": 280,
      "cover": "https://c.saavncdn.com/930/2-States-2014-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/930/951f2d707e9ea617fce5e5d8338393ae_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_10",
      "title": "Sanam Re (From \"Sanam Re\")",
      "artist": "Mithoon, Arijit Singh",
      "album": "World Music Day - Best Of Bollywood Hits",
      "duration": 308,
      "cover": "https://c.saavncdn.com/179/World-Music-Day-Best-Of-Bollywood-Hits-Hindi-2026-20260622111029-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/179/03c13437be11cba6e79791eed8a32949_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_11",
      "title": "Samjhawan",
      "artist": "Jawad Ahmad, Sharib Toshi, Arijit Singh, Shreya Ghoshal",
      "album": "Humpty Sharma Ki Dulhania",
      "duration": 269,
      "cover": "https://c.saavncdn.com/540/Humpty-Sharma-Ki-Dulhania-Hindi-2014-20190618095042-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/540/f807aad8e5c60a87334231f72267c725_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "arijit_singh_12",
      "title": "Hamari Adhuri Kahani (Title Track) [From &quot;Hamari Adhuri Kahani&quot;]",
      "artist": "Rashmi-Virag, Jeet Gannguli, Arijit Singh",
      "album": "Emraan Hashmi Sad Love Hits",
      "duration": 398,
      "cover": "https://c.saavncdn.com/732/Emraan-Hashmi-Sad-Love-Hits-Hindi-2026-20260604155755-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/732/dac6bf362c5b7021ad3589b4975b0e57_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "atif_aslam": [
    {
      "id": "atif_aslam_1",
      "title": "O'Meri Laila",
      "artist": "Atif Aslam, Jyotica Tangri",
      "album": "Monsoon Bollywood Hits",
      "duration": 281,
      "cover": "https://c.saavncdn.com/169/Monsoon-Bollywood-Hits-Hindi-2023-20230616161232-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/169/164b572a0e2f8962d9012c644c246287_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_2",
      "title": "atif aslam",
      "artist": "Ambient Aura",
      "album": "club ambition",
      "duration": 161,
      "cover": "https://c.saavncdn.com/953/club-ambition-Unknown-2024-20240628202752-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/953/9b1581a4c5948df2b42e16132e02ed51_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_3",
      "title": "Atif Aslam Mashup 2",
      "artist": "Alka Yagnik",
      "album": "Atif Aslam Mashup 2",
      "duration": 193,
      "cover": "https://c.saavncdn.com/716/Atif-Aslam-Mashup-2-Hindi-2026-20260424160758-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/716/f985e3b73c823939adec7dfca1d487b4_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_4",
      "title": "Atif Aslam Songs",
      "artist": "Dreamy Dynamics",
      "album": "Smells Like Teen Spirit Guitar",
      "duration": 67,
      "cover": "https://c.saavncdn.com/411/Smells-Like-Teen-Spirit-Guitar-Unknown-2024-20240808193301-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/411/e27b2829246e242ecb73554e5a1ecc72_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_5",
      "title": "O Meri Laila - Atif Aslam & Jyotica Tangri Vocals Only",
      "artist": "Jyotica Tangri",
      "album": "O Meri Laila - Atif Aslam & Jyotica Tangri Vocals Only",
      "duration": 270,
      "cover": "https://c.saavncdn.com/465/O-Meri-Laila-Atif-Aslam-Jyotica-Tangri-Vocals-Only-Hindi-2026-20260804094326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/465/be2718149e51ca3e48662d4464b9f3cc_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_6",
      "title": "Atif Aslam Mashup",
      "artist": "Jasmeet Jamrai",
      "album": "Atif Aslam Mashup",
      "duration": 311,
      "cover": "https://c.saavncdn.com/224/Atif-Aslam-Mashup-Hindi-2023-20240408232921-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/224/7f43190959134c8e30f5a705aaf333cd_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_7",
      "title": "Tere Liye | Atif Aslam- Romantic Song",
      "artist": "NITEVOID",
      "album": "Tere Liye | Atif Aslam- Romantic Song",
      "duration": 345,
      "cover": "https://c.saavncdn.com/614/Tere-Liye-Atif-Aslam-Romantic-Song-Hindi-2026-20260910230454-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/614/7a8b318bea7e6a890a760dd0b7572086_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_8",
      "title": "Non Stop Lofi Love Mash Up, Vol. 3",
      "artist": "Hariharan, Swarnalatha, Kumar Sanu, Sapna Mukherjee, Lata Mangeshkar, Aamir Khan, Alka Yagnik, Arijit Singh, Atif Aslam, Shre...",
      "album": "Non Stop Lofi Love Mash Up, Vol. 3",
      "duration": 3346,
      "cover": "https://c.saavncdn.com/180/Non-Stop-Lofi-Love-Mash-Up-Vol-3-Hindi-2024-20240408232244-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/180/e20127900b3a607514b8941abeefff3e_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "atif_aslam_9",
      "title": "laundry room organization",
      "artist": "Calming Cadence",
      "album": "atif aslam songs",
      "duration": 133,
      "cover": "https://c.saavncdn.com/916/atif-aslam-songs-Unknown-2024-20240711114503-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/916/428b06431eebaee5eb1b3531e49fc2db_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "shreya_ghoshal": [
    {
      "id": "shreya_ghoshal_1",
      "title": "Vaaroon Forever (From “Mirzapur The Movie”)",
      "artist": "Anand Bhaskar, Romy, Shreya Ghoshal, Ginny Diwan",
      "album": "Vaaroon Forever (From “Mirzapur The Movie”)",
      "duration": 252,
      "cover": "https://c.saavncdn.com/381/Vaaroon-Forever-From-Mirzapur-The-Movie-Hindi-2026-20260817160523-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/381/02ffb399df66aec14cbebb1a0ced6fd5_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_2",
      "title": "KALYANI (Remix)",
      "artist": "ARJN, KDS, FIFTY4, Shreya Ghoshal",
      "album": "KALYANI (Remix)",
      "duration": 269,
      "cover": "https://c.saavncdn.com/475/KALYANI-Remix-Malayalam-2026-20260622131127-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/475/5fc341ce2ad68492fce5ed0bf4655f8f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_3",
      "title": "Samjhawan",
      "artist": "Jawad Ahmad, Sharib Toshi, Arijit Singh, Shreya Ghoshal",
      "album": "Humpty Sharma Ki Dulhania",
      "duration": 269,
      "cover": "https://c.saavncdn.com/540/Humpty-Sharma-Ki-Dulhania-Hindi-2014-20190618095042-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/540/f807aad8e5c60a87334231f72267c725_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_4",
      "title": "Tum Kya Mile - Pritam' s Version (From \"Rocky Aur Rani Kii Prem Kahaani\")",
      "artist": "Amitabh Bhattacharya, Pritam, Arijit Singh, Shreya Ghoshal",
      "album": "Rocky Aur Rani Kii Prem Kahaani",
      "duration": 192,
      "cover": "https://c.saavncdn.com/001/Rocky-Aur-Rani-Kii-Prem-Kahaani-Hindi-2023-20250130073112-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/001/93fc1931668d22fb4093045472218dd1_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_5",
      "title": "Jai Jai Ram (From \"Ramayana\")",
      "artist": "A.R. Rahman, Shreya Ghoshal, Arijit Singh, Kumar Vishwas",
      "album": "Jai Jai Ram (From \"Ramayana\")",
      "duration": 320,
      "cover": "https://c.saavncdn.com/816/Jai-Jai-Ram-From-Ramayana-Hindi-2026-20260914170135-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/816/0ba2085804650ab95b697b9948487553_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_6",
      "title": "Teri Yaadon Mein (From \"The Killer\")",
      "artist": "KK, Shreya Ghoshal, Sajid-Wajid, Jalees Sherwani",
      "album": "Emraan Hashmi Hits",
      "duration": 287,
      "cover": "https://c.saavncdn.com/106/Emraan-Hashmi-Hits-Hindi-2026-20260905191028-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/106/a002772a4dc657bccce308a73272ec37_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_7",
      "title": "Maheroo Maheroo",
      "artist": "Shreya Ghoshal, Darshan Rathod",
      "album": "Shreya Ghoshal Romantic Hits",
      "duration": 274,
      "cover": "https://c.saavncdn.com/198/Shreya-Ghoshal-Romantic-Hits-Hindi-2026-20260623182752-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/198/58edfab758f1897b909a5f2062031ee3_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_8",
      "title": "Thodi Der",
      "artist": "Kumaar, Shreya Ghoshal",
      "album": "Shreya Ghoshal Romantic Hits",
      "duration": 296,
      "cover": "https://c.saavncdn.com/198/Shreya-Ghoshal-Romantic-Hits-Hindi-2026-20260623182752-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/198/073f40ca503477d4c362d663483c3f4d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_9",
      "title": "Dhadak Title Track",
      "artist": "Ajay Gogavale, Shreya Ghoshal",
      "album": "Shreya Ghoshal Romantic Hits",
      "duration": 243,
      "cover": "https://c.saavncdn.com/198/Shreya-Ghoshal-Romantic-Hits-Hindi-2026-20260623182752-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/198/9770064eeba8377fcb77717859555a18_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_10",
      "title": "Jugraafiya",
      "artist": "Udit Narayan, Shreya Ghoshal",
      "album": "Bollywood Top Romantic Hits",
      "duration": 274,
      "cover": "https://c.saavncdn.com/390/Bollywood-Top-Romantic-Hits-Hindi-2026-20260717151136-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/390/682054f0dbf5833ac2e262adbbeed60c_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_11",
      "title": "Ghar More Pardesiya",
      "artist": "Pritam, Shreya Ghoshal",
      "album": "Shreya Ghoshal Romantic Hits",
      "duration": 319,
      "cover": "https://c.saavncdn.com/198/Shreya-Ghoshal-Romantic-Hits-Hindi-2026-20260623182752-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/198/3b6e08199956d15ecf47cc85fcf5ee1f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "shreya_ghoshal_12",
      "title": "Tabaah Ho Gaye",
      "artist": "Pritam, Shreya Ghoshal",
      "album": "Shreya Ghoshal Romantic Hits",
      "duration": 341,
      "cover": "https://c.saavncdn.com/198/Shreya-Ghoshal-Romantic-Hits-Hindi-2026-20260623182752-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/198/a64a805d068108cbd90ab210f0b2e0ea_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "diljit_dosanjh": [
    {
      "id": "diljit_dosanjh_1",
      "title": "Hass Hass",
      "artist": "Diljit Dosanjh, Sia, Greg Kurstin",
      "album": "Hass Hass",
      "duration": 153,
      "cover": "https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/245/fd196de0f557e19e2e8d42150d34cf5b_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_2",
      "title": "Born to Shine",
      "artist": "Diljit Dosanjh",
      "album": "G.O.A.T.",
      "duration": 214,
      "cover": "https://c.saavncdn.com/597/G-O-A-T-Punjabi-2020-20240708055140-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/597/f1efd650819d3f427bd10e8b9addcd40_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_3",
      "title": "Water",
      "artist": "Diljit Dosanjh, Mixsingh, Raj Ranjodh",
      "album": "Water",
      "duration": 197,
      "cover": "https://c.saavncdn.com/925/Water-Punjabi-2025-20250214212740-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/925/4f117195f297e5e0d4796311940b53b4_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_4",
      "title": "Raat Di Gedi",
      "artist": "Diljit Dosanjh",
      "album": "Raat Di Gedi",
      "duration": 198,
      "cover": "https://c.saavncdn.com/698/Raat-Di-Gedi-Punjabi-2018-20180323-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/698/727adb91e70e5a4ed2a268acdbf55172_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_5",
      "title": "Ez-Ez Eclipsa Audio",
      "artist": "Shashwat Sachdev, Diljit Dosanjh, Hanumankind",
      "album": "Ez-Ez Eclipsa Audio",
      "duration": 182,
      "cover": "https://c.saavncdn.com/925/Ez-Ez-Eclipsa-Audio-Hindi-2026-20260708093725-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/925/9d4181b24f0082faaaea8f1671a80b13_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_6",
      "title": "Ez-Ez (From \"Dhurandhar\")",
      "artist": "Hanumankind, Shashwat Sachdev, Raj Ranjodh, Diljit Dosanjh",
      "album": "Ez-Ez (From \"Dhurandhar\")",
      "duration": 182,
      "cover": "https://c.saavncdn.com/525/Ez-Ez-From-Dhurandhar-Hindi-2025-20251217164219-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/525/38f7db698549b844f0b008ebe4d1d3a2_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_7",
      "title": "G.O.A.T.",
      "artist": "Diljit Dosanjh",
      "album": "G.O.A.T.",
      "duration": 224,
      "cover": "https://c.saavncdn.com/597/G-O-A-T-Punjabi-2020-20240708055140-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/597/ce842951d6cde3c4355046ca5e250809_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "diljit_dosanjh_8",
      "title": "Lemonade",
      "artist": "Diljit Dosanjh",
      "album": "Drive Thru",
      "duration": 167,
      "cover": "https://c.saavncdn.com/467/Drive-Thru-Punjabi-2022-20240708054744-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/467/c1f149509d4ee7d20c0c4474090ab5f1_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "pritam": [
    {
      "id": "pritam_1",
      "title": "Tera Mera Rishta -  New Version (From &quot;Awarapan 2&quot;)",
      "artist": "Mithoon, Pritam, Sayeed Quadri, Saaj Bhatt, Subodhh Sharma",
      "album": "Tera Mera Rishta - New Version (From &quot;Awarapan 2&quot;)",
      "duration": 365,
      "cover": "https://c.saavncdn.com/114/Tera-Mera-Rishta-New-Version-From-Awarapan-2-Hindi-2026-20260812173715-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/114/9109db7f112172c6c6246e929a818c1d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "pritam_2",
      "title": "Tera Mera Rishta - New Version (From Awarapan 2)",
      "artist": "Mithoon, Pritam, Sayeed Quadri, Saaj Bhatt, Subodhh Sharma",
      "album": "Awarapan: The Complete Soundtrack",
      "duration": 365,
      "cover": "https://c.saavncdn.com/734/Awarapan-The-Complete-Soundtrack-Hindi-2026-20260908202653-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/734/41af6aa0785b084b5de0da757e003934_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "pritam_3",
      "title": "Dil Ibaadat",
      "artist": "Pritam, KK, Sayeed Quadri",
      "album": "Tum Mile",
      "duration": 329,
      "cover": "https://c.saavncdn.com/316/Tum-Mile-Hindi-2009-20260120201221-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/316/7bc5895688704839a1686d3afb07bb7d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "pritam_4",
      "title": "Labon Ko (From \"Bhool Bhulaiyaa\")",
      "artist": "KK, Pritam, Sayeed Quadri",
      "album": "Romantic Hits Of K.K.",
      "duration": 341,
      "cover": "https://c.saavncdn.com/857/Romantic-Hits-Of-K-K-Hindi-2025-20251202151020-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/857/c15c3a5ca3d2308ed3c9b5ad69683f44_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "pritam_5",
      "title": "Tu Hi Haqeeqat",
      "artist": "Pritam, Javed Ali, Irshan Ashraf, Shadab, Sayeed Quadri",
      "album": "Javed Ali Best Hindi Hit Songs",
      "duration": 304,
      "cover": "https://c.saavncdn.com/576/Javed-Ali-Best-Hindi-Hit-Songs-Hindi-2026-20260622145613-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/576/cf7db3d3b52aa9b4675524121f47f94b_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "kishore_kumar": [
    {
      "id": "kishore_kumar_1",
      "title": "Chalte Chalte (Part 1 / From &quot;Chalte Chalte&quot;)",
      "artist": "Kishore Kumar",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 311,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/946/ecbe4fd0030854305101098bf2379ad6_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_2",
      "title": "Dilbar Mere (From &quot;Satte Pe Satta&quot;)",
      "artist": "Kishore Kumar, Anette, R.D. Burman",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 287,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/946/83b8e8f2bc51b9bc1faf3cd0bf13a87e_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_3",
      "title": "Saagar Kinare (From &quot;Saagar&quot;)",
      "artist": "Lata Mangeshkar, Kishore Kumar, R.D. Burman",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 258,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/946/643a6ef8e5d22e51d355b5eded416e5a_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_4",
      "title": "Tere Jaisa Yaar Kahan (From \"Yaarana\")",
      "artist": "Kishore Kumar",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 278,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/d2022877eaff97e7f96b46bf536e1093_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_5",
      "title": "Tera Mujhse (From “Aa Gale Lag Jaa”)",
      "artist": "Kishore Kumar, R.D. Burman",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 338,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/ef66dac12b6f156c941c130dae1f52a7_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_6",
      "title": "Koi Roko Na (From \"Priyatama\")",
      "artist": "Kishore Kumar",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 286,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/2c3819d7d9bd32d820f7d5d6de26fd28_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_7",
      "title": "Aise Na Mujhe (From \"Darling Darling\")",
      "artist": "Kishore Kumar, R.D. Burman",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 264,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/0fe3c0a859db9d30961ffaa6907f9ea0_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_8",
      "title": "Jahan Teri Yeh Nazar Hai (From \"Kaalia\")",
      "artist": "Kishore Kumar, R.D. Burman",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 323,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/8e797c73184f368e82ed4bde22e1934f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_9",
      "title": "Samne Ye Kaun Aya (From \"Jawani Diwani\")",
      "artist": "Kishore Kumar, R.D. Burman",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 252,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/aa675fc0091403b130988ac4f14f5653_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_10",
      "title": "Kya Khabar Kya Pata (From \"Saaheb\")",
      "artist": "Kishore Kumar",
      "album": "Kishore Kumar Evergreen Hits",
      "duration": 383,
      "cover": "https://c.saavncdn.com/946/Kishore-Kumar-Evergreen-Hits-Hindi-2023-20241004165326-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/946/e04823cf5ad03a58fc55d2c2c65a450e_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_11",
      "title": "Aaj Ei Dintake (From &quot;Antarale&quot;)",
      "artist": "Kishore Kumar",
      "album": "Romantic Gems Of Bappi Lahiri",
      "duration": 266,
      "cover": "https://c.saavncdn.com/202/Romantic-Gems-Of-Bappi-Lahiri-Bengali-2018-20181011-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/202/112d19bf0dbf8b6691a19ae459fb79d8_sar_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kishore_kumar_12",
      "title": "Se Jeno Aamar Pashe",
      "artist": "Kishore Kumar",
      "album": "Valentine Special Bengali Romantic Modern Songs",
      "duration": 209,
      "cover": "https://c.saavncdn.com/694/Valentine-Special-Bengali-Romantic-Modern-Songs-Bengali-2015-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/694/dfed307479505edb2ae516a79774b418_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "ap_dhillon": [
    {
      "id": "ap_dhillon_1",
      "title": "Thodi Si Daaru",
      "artist": "AP Dhillon, Shreya Ghoshal",
      "album": "Thodi Si Daaru",
      "duration": 180,
      "cover": "https://c.saavncdn.com/587/Thodi-Si-Daaru-Punjabi-2025-20250717063530-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/587/855f5c3f77ae0c40ed7de3c955f8fdcc_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_2",
      "title": "Excuses",
      "artist": "AP Dhillon, Gurinder Gill, Intense",
      "album": "Excuses",
      "duration": 177,
      "cover": "https://c.saavncdn.com/890/Excuses-English-2021-20210930112054-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/890/a18aabc4681dc6c334d5d29b67e84a0f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_3",
      "title": "With You",
      "artist": "AP Dhillon",
      "album": "First of a Kind (From the Amazon Original Series)",
      "duration": 154,
      "cover": "https://c.saavncdn.com/671/First-of-a-Kind-From-the-Amazon-Original-Series-Punjabi-2023-20230904091351-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/671/50b256cc8e60dc8b0243f5e0767e8467_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_4",
      "title": "STFU",
      "artist": "AP Dhillon, Shinda Kahlon",
      "album": "OKAY STFU",
      "duration": 175,
      "cover": "https://c.saavncdn.com/378/OKAY-STFU-Punjabi-2025-20250502063450-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/378/8cee3668b7d5ae40e5371e7568d7c7cd_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_5",
      "title": "Aadat (Feat. AP Dhillon)",
      "artist": "Yo Yo Honey Singh, AP Dhillon, Shinda Kahlon, JackBars",
      "album": "51 GLORIOUS DAYS",
      "duration": 220,
      "cover": "https://c.saavncdn.com/167/51-GLORIOUS-DAYS-Hindi-2025-20251204181542-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/167/182f95ea58f961e3b4df0d6295810c1d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_6",
      "title": "Old Money",
      "artist": "AP Dhillon",
      "album": "Old Money",
      "duration": 127,
      "cover": "https://c.saavncdn.com/939/Old-Money-Punjabi-2024-20240809063655-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/939/a749b617dec1c3c77e61b4a1083b2436_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_7",
      "title": "Afsos",
      "artist": "Anuv Jain, AP Dhillon, Satinderpal Singh",
      "album": "Afsos",
      "duration": 191,
      "cover": "https://c.saavncdn.com/773/Afsos-Punjabi-2025-20250129053900-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/773/a05bddf58f9158b522b7d782c77612ba_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "ap_dhillon_8",
      "title": "Thinking of You",
      "artist": "AP Dhillon",
      "album": "Thinking of You",
      "duration": 180,
      "cover": "https://c.saavncdn.com/699/Thinking-of-You-Punjabi-2026-20260206063613-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/699/929c446154d5336760ca9ef8a58408b3_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "kk": [
    {
      "id": "kk_1",
      "title": "Dil Ibaadat",
      "artist": "Pritam, KK, Sayeed Quadri",
      "album": "Tum Mile",
      "duration": 329,
      "cover": "https://c.saavncdn.com/316/Tum-Mile-Hindi-2009-20260120201221-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/316/7bc5895688704839a1686d3afb07bb7d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kk_2",
      "title": "Labon Ko",
      "artist": "Pritam, KK",
      "album": "Bhool Bhulaiyaa",
      "duration": 341,
      "cover": "https://c.saavncdn.com/056/Bhool-Bhulaiyaa-Hindi-2007-20241223151003-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/056/15f4ea0f635f05ede93c4169d1ece6ac_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kk_3",
      "title": "Zara Sa",
      "artist": "Sayeed Quadri, Pritam, KK",
      "album": "Jannat",
      "duration": 302,
      "cover": "https://c.saavncdn.com/801/Jannat-Hindi-2008-20190629135803-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/801/571617f7810fb699ed56bc8a7d9e40d9_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kk_4",
      "title": "Haan Tu Hain",
      "artist": "Pritam, KK, Sayeed Quadri",
      "album": "Emraan Hashmi Sad Love Hits",
      "duration": 324,
      "cover": "https://c.saavncdn.com/732/Emraan-Hashmi-Sad-Love-Hits-Hindi-2026-20260604155755-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/732/c493c52307159b47df47045f8c4343cd_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "kk_5",
      "title": "Kya Mujhe Pyar Hai",
      "artist": "Pritam, KK",
      "album": "Woh Lamhe",
      "duration": 266,
      "cover": "https://c.saavncdn.com/832/Woh-Lamhe-Hindi-2006-20241223151332-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/832/41670273e6110da4b44085d45981aa53_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "sonu_nigam": [
    {
      "id": "sonu_nigam_1",
      "title": "Main Agar Kahoon",
      "artist": "Vishal &amp; Shekhar, Sonu Nigam, Shreya Ghoshal",
      "album": "Om Shanti Om",
      "duration": 308,
      "cover": "https://c.saavncdn.com/179/Om-Shanti-Om-Hindi-2007-20241205141724-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/179/072d8e825c532778560b38b4042c8fc3_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sonu_nigam_2",
      "title": "Chori Kiya Re Jiya",
      "artist": "Sonu Nigam, Shreya Ghoshal",
      "album": "Dabangg",
      "duration": 286,
      "cover": "https://c.saavncdn.com/765/Dabangg-Hindi-2010-20221211114032-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/765/367d390c0c3c272fabefc6da8a81b305_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sonu_nigam_3",
      "title": "Aisa Deewana",
      "artist": "Sonu Nigam, Alka Yagnik",
      "album": "Dil Maange More",
      "duration": 313,
      "cover": "https://c.saavncdn.com/406/Dil-Maange-More-Hindi-2004-20221124142445-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/406/79e3c487d7b4656baa29bc0b983cc048_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sonu_nigam_4",
      "title": "Pardesiya (From \"Param Sundari\")",
      "artist": "Sonu Nigam, Krishnakali Saha, Amitabh Bhattacharya, Sachin-Jigar",
      "album": "Param Sundari",
      "duration": 232,
      "cover": "https://c.saavncdn.com/029/Param-Sundari-Hindi-2025-20250825135103-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/029/48267da576cd70080f4a3f021404e186_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sonu_nigam_5",
      "title": "Dil Dooba",
      "artist": "Sonu Nigam, Shreya Ghoshal",
      "album": "Khakee",
      "duration": 230,
      "cover": "https://c.saavncdn.com/817/Khakee-Hindi-2003-20221201092105-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/817/7338c49444ba9a09780de14b1dacff8a_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sonu_nigam_6",
      "title": "Yeh Dil Deewana",
      "artist": "Sonu Nigam, Hema Sardesai, Shankar Mahadevan",
      "album": "Pardes",
      "duration": 426,
      "cover": "https://c.saavncdn.com/386/Pardes-Hindi-1997-20250711223347-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/386/a53b2ccf1b097919b44e5433d77e896d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sonu_nigam_7",
      "title": "Soniyo",
      "artist": "Raju Singh, Sonu Nigam, Shreya Ghoshal",
      "album": "RAAZ - The Mystery Continues",
      "duration": 329,
      "cover": "https://c.saavncdn.com/542/RAAZ-The-Mystery-Continues-Hindi-2008-20190617160418-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/542/34e05537cc5017bfd6fdba3c6cfedf2d_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "anuv_jain": [
    {
      "id": "anuv_jain_1",
      "title": "Arz Kiya Hai | Coke Studio Bharat",
      "artist": "Anuv Jain",
      "album": "Arz Kiya Hai | Coke Studio Bharat",
      "duration": 294,
      "cover": "https://c.saavncdn.com/504/Arz-Kiya-Hai-Coke-Studio-Bharat-Hindi-2025-20250818054005-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/504/a70f9144a360aa064fadffa886e7c8b6_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_2",
      "title": "Jo Tum Mere Ho",
      "artist": "Anuv Jain",
      "album": "Jo Tum Mere Ho",
      "duration": 252,
      "cover": "https://c.saavncdn.com/401/Jo-Tum-Mere-Ho-Hindi-2024-20240731053953-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/401/1e4444c13f76ac543c19b01d7ea0423a_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_3",
      "title": "Husn",
      "artist": "Anuv Jain",
      "album": "Husn",
      "duration": 217,
      "cover": "https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/436/13795b7aa2e87393366162b9e6a6fe88_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_4",
      "title": "Afsos",
      "artist": "Anuv Jain, AP Dhillon, Satinderpal Singh",
      "album": "Afsos",
      "duration": 191,
      "cover": "https://c.saavncdn.com/773/Afsos-Punjabi-2025-20250129053900-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/773/a05bddf58f9158b522b7d782c77612ba_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_5",
      "title": "Alag Aasmaan",
      "artist": "Anuv Jain",
      "album": "Alag Aasmaan",
      "duration": 213,
      "cover": "https://c.saavncdn.com/879/Alag-Aasmaan-Unknown-2020-20200716212927-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/879/72ded7665bbd5f8947f014de81e5fc1d_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_6",
      "title": "Inaam",
      "artist": "Anuv Jain",
      "album": "Inaam",
      "duration": 257,
      "cover": "https://c.saavncdn.com/198/Inaam-Hindi-2025-20251210053823-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/198/0b3a459efb6c87cc55ef68a3528f6088_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_7",
      "title": "Gul",
      "artist": "Anuv Jain",
      "album": "Gul",
      "duration": 218,
      "cover": "https://c.saavncdn.com/266/Gul-Hindi-2021-20210706151615-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/266/75a2c612178dea03a50e943310efa85f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_8",
      "title": "Baarishein (Acoustic)",
      "artist": "Anuv Jain",
      "album": "Baarishein (Acoustic)",
      "duration": 209,
      "cover": "https://c.saavncdn.com/923/Baarishein-Acoustic-Hindi-2023-20230712053421-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/923/53300d41d4b1dc17a3951b6d67bac0cb_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "anuv_jain_9",
      "title": "Arz Kiya Hai (Acoustic)",
      "artist": "Veera",
      "album": "Arz Kiya Hai",
      "duration": 342,
      "cover": "https://c.saavncdn.com/398/Arz-Kiya-Hai-Unknown-2026-20260727100735-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/398/413d68610ff71f8433c0f3e2eb9035fc_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "sidhu_moose_wala": [
    {
      "id": "sidhu_moose_wala_1",
      "title": "Ghostface Killah",
      "artist": "Sidhu Moose Wala, MXRCI",
      "album": "Ghostface Killah",
      "duration": 137,
      "cover": "https://c.saavncdn.com/930/Ghostface-Killah-Punjabi-2026-20260921193403-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/930/25735de6056f5c5029cb79ea79c6e512_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_2",
      "title": "Same Beef",
      "artist": "Bohemia, Sidhu Moose Wala",
      "album": "Same Beef",
      "duration": 290,
      "cover": "https://c.saavncdn.com/154/Same-Beef-Punjabi-2019-20190919071247-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/154/d8e13e5a519f8392580616d3931b8adb_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_3",
      "title": "295",
      "artist": "Sidhu Moose Wala",
      "album": "Moosetape",
      "duration": 270,
      "cover": "https://c.saavncdn.com/609/Moosetape-Punjabi-2021-20260626155141-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/609/852628435c98083dfe217c1cfa731bb5_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_4",
      "title": "0008",
      "artist": "The Kidd, Sidhu Moose Wala, Jenny Johal",
      "album": "Moose Print",
      "duration": 132,
      "cover": "https://c.saavncdn.com/785/Moose-Print-Punjabi-2025-20260626153146-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/785/f3a2893ad1dbe12d208c7b5dc134d919_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_5",
      "title": "So High",
      "artist": "Sidhu Moose Wala",
      "album": "So High",
      "duration": 233,
      "cover": "https://c.saavncdn.com/544/So-High-Punjabi-2017-20220811172517-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/544/fa128b5b00df068d78bc50bf19bf137f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_6",
      "title": "East Side Flow",
      "artist": "Sidhu Moose Wala",
      "album": "East Side Flow",
      "duration": 224,
      "cover": "https://c.saavncdn.com/599/East-Side-Flow-Punjabi-2019-20190317052003-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/599/90947a11238d8886a891d10e672d53e1_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_7",
      "title": "Levels",
      "artist": "Sidhu Moose Wala, Sunny Malton",
      "album": "Levels",
      "duration": 228,
      "cover": "https://c.saavncdn.com/220/Levels-Punjabi-2022-20260626154343-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/220/2386e255fd1a5235aad25d92ca7dc82c_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_8",
      "title": "Devil",
      "artist": "Sidhu Moose Wala",
      "album": "Pbx 1",
      "duration": 247,
      "cover": "https://c.saavncdn.com/588/Pbx-1-Punjabi-2018-20181018-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/588/87ef653fa7baffee19f1f1c0c4733ab6_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_9",
      "title": "Barota",
      "artist": "Sidhu Moose Wala, The Kidd",
      "album": "Barota",
      "duration": 243,
      "cover": "https://c.saavncdn.com/625/Barota-Punjabi-2025-20260626143211-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/625/d54029654a10587ebb1cffe24758df2b_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "sidhu_moose_wala_10",
      "title": "Eyes on Me",
      "artist": "Sidhu Moose Wala, The Kidd",
      "album": "Eyes on Me",
      "duration": 154,
      "cover": "https://c.saavncdn.com/505/Eyes-on-Me-Punjabi-2026-20260626143324-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/505/a45b5363405c22ca876c1d538afcca6d_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "b_praak": [
    {
      "id": "b_praak_1",
      "title": "Garmi Non Stop Dance Mix(Remix By Kedrock,Sd Style)",
      "artist": "Parampara Tandon, Vishal, Shekhar, KK, Shaan, Tulsi Kumar, Mika Singh, Meet Bros, Jubin Nautiyal, Dhvani Bhanushali, Nitin Mukesh, Guru Randhawa, Arijit Singh, Armaan Malik, B Praak, Mehul Vyas, Adarsh Shinde, Yo Yo Honey Singh, Romy, Bombay Rockers, Neha Kakkar, Tanishk Bagchi, A.R. Rahman, Pritam, Amaal Mallik, Sachet-Parampara, Tony Kakkar, Mithoon, Lijo George, Dj Chetas, Badshah, Vishal &amp; Shekhar, Laxmikant - Pyarelal, Viju Shah, Sachin-Jigar, Vee",
      "album": "Garmi Non Stop Dance Mix",
      "duration": 3600,
      "cover": "https://c.saavncdn.com/500/Garmi-Non-Stop-Dance-Mix-Hindi-2020-20201228161048-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/500/f386a5c0dcb2f43494b25e1ff45da594_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_2",
      "title": "Bala Bala Non Stop Remix(Remix By Kedrock,Sd Style)",
      "artist": "Badshah, Sachin-Jigar, Sohail Sen, Guru Randhawa, Dj Money Willz, Arya Acharya, Arijit Singh, Vishal &amp; Shekhar, Sandesh Shandilya, Goldboy, Mithoon, Dj Chetas, Pitbull, Jasbir Jassi, Shreya Ghoshal, Tulsi Kumar, Dj Blackout, B Praak, Gurmeet Singh, Dhvani Bhanushali, Tanishk Bagchi, Lijo George, Manj Musik, Neha Kakkar, Preet Hundal, Nikhil D'souza, Abhijit Vaghani, Vishal Dadlani, Neeti Mohan, Sachet Tandon, Sachet-Parampara, Sanjay Leela Bhansali",
      "album": "Bala Bala Non Stop Remix",
      "duration": 3052,
      "cover": "https://c.saavncdn.com/595/Bala-Bala-Non-Stop-Remix-Hindi-2020-20200129134001-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/595/b3e624c50ca2cedb891c276b0e9dfdb5_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_3",
      "title": "Bollywood Non Stop Dandiya-2020(Remix By Kedrock,Sd Style)",
      "artist": "Arijit Singh, Asees Kaur, B Praak, Badshah, Darshan Raval, Dhvani Bhanushali, Guru Randhawa, Jubin Nautiyal, Kamaal Khan, Mika Singh, Millind Gaba, Neeti Mohan, Neha Kakkar, Nikhita Gandhi, Palak Muchhal, Sachet Tandon, Sukhwinder Singh, Tanishk Bagchi, Tulsi Kumar, Yo Yo Honey Singh, Amaal Mallik, Gaurav Chatterji, Jasbir Jassi, Lijo George-Dj Chetas, Meet Bros, Mehul Vyas, Raaj Aashoo, Rochak Kohli, Sachet-Parampara, Sachin-Jigar, Sajid-Wajid, Shyam Bhateja, Sunny Vik, The Fusion Project, Ved Sharma, Vishal &amp; Shekhar",
      "album": "Bollywood Non Stop Dandiya-2020",
      "duration": 2919,
      "cover": "https://c.saavncdn.com/495/Bollywood-Non-Stop-Dandiya-2020-Hindi-2020-20201017191001-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/495/f8813dabe337a4a1beda803dfaddd2d3_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_4",
      "title": "Filhall",
      "artist": "B Praak",
      "album": "Sad Songs",
      "duration": 255,
      "cover": "https://c.saavncdn.com/193/Sad-Songs-Hindi-2020-20250124193408-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/193/f675d2940761cd2fecb77d74afbc4427_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_5",
      "title": "Filhaal2 Mohabbat",
      "artist": "B Praak",
      "album": "Top 10 Sad Songs - Hindi",
      "duration": 300,
      "cover": "https://c.saavncdn.com/237/Top-10-Sad-Songs-Hindi-Hindi-2021-20250124193408-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/237/3351e854e8e6dc82c4362a3a1fbde361_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_6",
      "title": "Kuch Bhi Ho Jaye",
      "artist": "B Praak",
      "album": "Sad Songs",
      "duration": 274,
      "cover": "https://c.saavncdn.com/193/Sad-Songs-Hindi-2020-20250124193408-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/193/f62a19fa4176c491da2ffea8aca611c2_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_7",
      "title": "Soch Lofi Mix(Remix By Kedrock,Sd Style)",
      "artist": "Harrdy Sandhu, B Praak",
      "album": "Soch Lofi Mix",
      "duration": 208,
      "cover": "https://c.saavncdn.com/124/Soch-Lofi-Mix-Punjabi-2023-20230112201002-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/124/b86aa4826c3f780082274d4b8a4484f0_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_8",
      "title": "Besharam Bewaffa (From \"Jaani Ve\")",
      "artist": "B Praak",
      "album": "Dil Se Galti - Hindi Sad Songs",
      "duration": 271,
      "cover": "https://c.saavncdn.com/528/Dil-Se-Galti-Hindi-Sad-Songs-Hindi-2021-20210925071001-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/528/fabede49bdb5de42bd617ea4dff52e95_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_9",
      "title": "The Mega Party Mix(Remix By Kedrock,Sd Style)",
      "artist": "Pitbull, Diljit Dosanjh, Neeraj Shridhar, Shilpa Rao, Sachet Tandon, Arijit Singh, Charan, Yo Yo Honey Singh, B Praak, R.D. Burman, Romy, Tanishk Bagchi, Guru Randhawa, Raj Ranjodh, Benny Dayal, Vishal & Shekhar, Mellow D, Pritam, Sachin-Jigar, Mitraz",
      "album": "The Mega Party Mix",
      "duration": 2362,
      "cover": "https://c.saavncdn.com/268/The-Mega-Party-Mix-Hindi-2024-20241226111003-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/268/5f97ebc682f0e0b57af1353cabd7240f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_10",
      "title": "Mahakaal",
      "artist": "B Praak, Jaani",
      "album": "Mahakaal",
      "duration": 284,
      "cover": "https://c.saavncdn.com/978/Mahakaal-Hindi-2025-20250215053510-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/978/25195473f5de75ff30ef492b133c1c81_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_11",
      "title": "Kya Baat Ay",
      "artist": "Harrdy Sandhu, Jaani",
      "album": "Kya Baat Ay",
      "duration": 181,
      "cover": "https://c.saavncdn.com/706/Kya-Baat-Ay-Punjabi-2018-20180921123124-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/706/69cb3455870c4a907e44e2492318b12c_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "b_praak_12",
      "title": "Backbone",
      "artist": "Harrdy Sandhu, Jaani",
      "album": "Backbone",
      "duration": 175,
      "cover": "https://c.saavncdn.com/828/Backbone-Punjabi-2017-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/828/ee25a607181de97439eb411a68019869_320.mp4",
      "badge": "Studio 320kbps"
    }
  ],
  "mohit_chauhan": [
    {
      "id": "mohit_chauhan_1",
      "title": "Tum Se Hi",
      "artist": "Pritam, Mohit Chauhan",
      "album": "Jab We Met",
      "duration": 321,
      "cover": "https://c.saavncdn.com/223/Jab-We-Met-Hindi-2007-20231016162009-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/223/7eddc0f9b56f110ae39a145752fabb34_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_2",
      "title": "Chikiri Chikiri (From &quot;Peddi&quot;) - Telugu",
      "artist": "Mohit Chauhan",
      "album": "Chikiri Chikiri (From &quot;Peddi&quot;) - Telugu",
      "duration": 273,
      "cover": "https://c.saavncdn.com/735/Chikiri-Chikiri-From-Peddi-Telugu-Telugu-2025-20251107191120-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/735/afffe241f71836496fd3ebd720b06822_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_3",
      "title": "Chikiri Chikiri (From &quot;Peddi&quot;)",
      "artist": "Balaji, A.R. Rahman, Mohit Chauhan",
      "album": "World Music Day - Top 10 Telugu Superhits",
      "duration": 273,
      "cover": "https://c.saavncdn.com/063/World-Music-Day-Top-10-Telugu-Superhits-Telugu-2026-20260619191140-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/063/96148548d2eca0745bae970df3884b4e_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_4",
      "title": "Rang Lageya",
      "artist": "Mohit Chauhan, Rochak Kohli",
      "album": "Rang Lageya",
      "duration": 227,
      "cover": "https://c.saavncdn.com/861/Rang-Lageya-Hindi-2021-20210315162921-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/861/5eeb61506d78189000c55c0337db4c15_sar_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_5",
      "title": "Tune Jo Na Kaha",
      "artist": "Pritam, Mohit Chauhan, Sandeep Shrivastava",
      "album": "New York",
      "duration": 309,
      "cover": "https://c.saavncdn.com/978/New-York-Hindi-2009-20190329182537-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/978/c0cd117c13a98276c0b770b38289e97f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_6",
      "title": "Tum Ho",
      "artist": "Suzanne D'Mello, Mohit Chauhan",
      "album": "Rockstar",
      "duration": 318,
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/274/fd6e420a5742d1a3cdcd13c833d0489f_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_7",
      "title": "Kun Faaya Kun",
      "artist": "Javed Ali, Mohit Chauhan, A.R. Rahman",
      "album": "Rockstar",
      "duration": 473,
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/274/aee250c500588f117ae5343688e12b42_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_8",
      "title": "Kun Faya Kun (From &quot;Rockstar&quot;)",
      "artist": "Irshad Kamil, A.R. Rahman, Javed Ali, Mohit Chauhan",
      "album": "World Music Day - Best Of Bollywood Hits",
      "duration": 469,
      "cover": "https://c.saavncdn.com/179/World-Music-Day-Best-Of-Bollywood-Hits-Hindi-2026-20260622111029-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/179/53fd6b97b1616b941b115f840e8b1e42_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_9",
      "title": "Phir Se Ud Chala",
      "artist": "Mohit Chauhan",
      "album": "Rockstar",
      "duration": 271,
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/274/c7fa8d1999f3b3d3dc5881beb1e8c31b_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_10",
      "title": "Nadaan Parindey",
      "artist": "A.R. Rahman, Mohit Chauhan",
      "album": "Rockstar",
      "duration": 386,
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/274/ed2193d56b29e06f96ad428cf6ffeae0_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_11",
      "title": "Saadda Haq (Featuring Orianthi Panagaris On Guitars)",
      "artist": "A.R. Rahman, Clinton Cerejo, Mohit Chauhan",
      "album": "Rockstar",
      "duration": 365,
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/274/ec39b6b040265fdf0c97080bad3b9e86_320.mp4",
      "badge": "Studio 320kbps"
    },
    {
      "id": "mohit_chauhan_12",
      "title": "Jo Bhi Main",
      "artist": "A.R. Rahman, Mohit Chauhan",
      "album": "Rockstar",
      "duration": 275,
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/274/a0c47c2ade58e93115e1774c9199e33b_320.mp4",
      "badge": "Studio 320kbps"
    }
  ]
}

/**
 * Curated Featured Playlists (20-25+ verified songs each)
 * Shown in the "Featured Playlists & Trends" section
 */
export const FEATURED_PLAYLISTS = [
  {
    id: 'ghaint_flow',
    title: 'Ghaint Flow',
    subtitle: 'Keep it Punjabi, keep it real. Cover: Karan Aujla',
    badge: 'Public Playlist',
    cover: 'https://c.saavncdn.com/918/AUJLA-SZN-1-Punjabi-2026-20260925122119-500x500.jpg',
    gradient: 'from-red-900/50 via-rose-950/40 to-coal',
    tags: ['Punjabi Trap', 'Karan Aujla', 'Desi Flow'],
    trackCount: '25 Tracks',
    description: 'Keep it Punjabi, keep it real. Featuring Karan Aujla, Diljit Dosanjh, Sidhu Moose Wala, and AP Dhillon.',
  },
  {
    id: 'trending_top_50',
    title: 'Top 50 Hindi Chartbusters',
    subtitle: 'The hottest tracks trending right now in India',
    badge: 'Trending #1',
    cover: 'https://c.saavncdn.com/475/Dhurandhar-Hindi-2025-20260203083204-500x500.jpg',
    gradient: 'from-amber-600/40 via-rose-700/30 to-purple-900/40',
    tags: ['Trending', 'Chartbusters', 'Viral 2025-2026'],
    trackCount: '25 Tracks',
    description: 'India’s biggest streaming sensations, viral reels anthems, and blockbuster chartbusters in ultra 320 kbps.',
  },
  {
    id: 'bollywood_romance_2025',
    title: 'Pure Bollywood Romance',
    subtitle: 'Timeless love songs, cathartic confessions & acoustic duets',
    badge: 'Most Streamed',
    cover: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg',
    gradient: 'from-rose-600/40 via-pink-700/30 to-red-950/40',
    tags: ['Romantic', 'Love Anthems', 'Arijit & Shreya'],
    trackCount: '26 Tracks',
    description: 'The defining romantic ballads of modern cinema, featuring Arijit Singh, Shreya Ghoshal, and Pritam.',
  },
  {
    id: 'punjabi_wave_trap',
    title: 'Punjabi Wave & Trap Bangers',
    subtitle: 'High-bass anthems, trap beats & stadium bangers',
    badge: 'High Energy',
    cover: 'https://c.saavncdn.com/245/Hass-Hass-English-2023-20231026170517-500x500.jpg',
    gradient: 'from-orange-600/40 via-red-700/30 to-zinc-950/40',
    tags: ['Punjabi Trap', 'Diljit & AP Dhillon', 'Bass Boosted'],
    trackCount: '28 Tracks',
    description: 'Global Punjabi heatwaves, heavyweight 808 bass, and stadium-shaking flows from Diljit, AP Dhillon, and Sidhu.',
  },
  {
    id: 'late_night_lofi',
    title: 'Late Night Lo-Fi & Chillout',
    subtitle: 'Acoustic fingerpicking, poetry, and midnight calming beats',
    badge: 'Chill Vibe',
    cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg',
    gradient: 'from-indigo-600/40 via-purple-700/30 to-slate-950/40',
    tags: ['Lo-Fi', 'Anuv Jain', 'Midnight Beats'],
    trackCount: '22 Tracks',
    description: 'Gentle acoustic strings, poetic storytelling, and warm lo-fi tape saturation for 2 AM contemplative sessions.',
  },
  {
    id: 'party_club_bangers',
    title: 'Dance Floor & Party Bangers',
    subtitle: 'Unstoppable celebration beats, club drops & dance anthems',
    badge: 'Party Fuel',
    cover: 'https://c.saavncdn.com/881/War-Hindi-2019-20191001104931-500x500.jpg',
    gradient: 'from-amber-500/40 via-orange-600/30 to-red-950/40',
    tags: ['Party', 'Dance', 'Club Remixes'],
    trackCount: '22 Tracks',
    description: 'Max-energy floor-fillers and chart-topping dance party hits guaranteed to get everyone moving.',
  },
  {
    id: 'retro_golden_classics',
    title: '90s & Golden Retro Classics',
    subtitle: 'Timeless nostalgia from Kishore Kumar, Rafi, and Lata',
    badge: 'Evergreen Gold',
    cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg',
    gradient: 'from-yellow-600/40 via-amber-700/30 to-neutral-950/40',
    tags: ['Evergreen', 'Kishore Kumar', 'Golden 90s'],
    trackCount: '25 Tracks',
    description: 'Gold-standard vintage classics and 90s Bollywood evergreen melodies that defined generations.',
  },
  {
    id: 'heartbreak_catharsis',
    title: 'Broken Heart & Cathartic Soul',
    subtitle: 'Slow, low-valence ballads for when words are not enough',
    badge: 'Dard & Soul',
    cover: 'https://c.saavncdn.com/257/Ae-Dil-Hai-Mushkil-Hindi-2016-500x500.jpg',
    gradient: 'from-blue-700/40 via-slate-800/30 to-coal',
    tags: ['Sad Melodies', 'Heartbreak', 'Cathartic'],
    trackCount: '24 Tracks',
    description: 'Raw, cathartic emotional ballads that let you feel every tear, sigh, and longing notes in pure high fidelity.',
  },
]

export const POPULAR_GENRES = [
  {
    id: 'punjabi',
    label: 'Punjabi',
    bgColor: '#4A1E17',
    cover: 'https://c.saavncdn.com/918/AUJLA-SZN-1-Punjabi-2026-20260925122119-500x500.jpg',
    subtags: ['Punjabi Workout >', 'Punjabi Love >', 'Desi Hip-Hop >', 'Trending Hits >'],
    artistIds: ['karan_aujla', 'diljit_dosanjh', 'ap_dhillon', 'sidhu_moose_wala', 'b_praak'],
    playlistIds: ['ghaint_flow', 'punjabi_wave_trap'],
    query: 'Punjabi Hits',
    category: 'party',
    description: 'Global Punjabi heatwaves, heavyweight 808 bass, and stadium-shaking anthems.',
    trackCount: '30+ Tracks',
  },
  {
    id: 'romantic',
    label: 'Bollywood Romance',
    bgColor: '#8B3A2B',
    cover: 'https://c.saavncdn.com/815/Bhediya-Hindi-2023-20230927155213-500x500.jpg',
    subtags: ['Acoustic Love >', 'Monsoon Romance >', 'Soul Duets >', 'Late Night Romance >'],
    artistIds: ['arijit_singh', 'shreya_ghoshal', 'atif_aslam', 'pritam'],
    playlistIds: ['bollywood_romance_2025'],
    query: 'Romantic Hindi Songs',
    category: 'romantic',
    description: 'Sweet acoustic guitar ballads, breathtaking soul duets, and heartfelt Bollywood love anthems.',
    trackCount: '28+ Tracks',
  },
  {
    id: 'new_releases',
    label: 'New Releases',
    bgColor: '#B45309',
    cover: 'https://c.saavncdn.com/475/Dhurandhar-Hindi-2025-20260203083204-500x500.jpg',
    subtags: ['2025-2026 Chartbusters >', 'Viral Hits >', 'Bollywood 2026 >', 'Blockbusters >'],
    artistIds: ['karan_aujla', 'arijit_singh', 'diljit_dosanjh', 'anuv_jain'],
    playlistIds: ['trending_top_50', 'ghaint_flow'],
    query: 'New Releases Hindi Songs',
    category: 'party',
    description: 'India’s newest streaming sensations, viral reels anthems, and blockbuster chartbusters in ultra 320 kbps.',
    trackCount: '25+ Tracks',
  },
  {
    id: 'lofi',
    label: 'Late Night Lo-Fi',
    bgColor: '#4A2E35',
    cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg',
    subtags: ['Midnight Acoustic >', 'Study Chill >', 'Gentle Poetry >', 'Lo-Fi Beats >'],
    artistIds: ['anuv_jain', 'ap_dhillon', 'mohit_chauhan'],
    playlistIds: ['late_night_lofi'],
    query: 'Lo-Fi Hindi Chill',
    category: 'focus_lofi',
    description: 'Hypnotic chillhop beats, warm tape saturation, and gentle acoustic songs for midnight study and relax.',
    trackCount: '24+ Tracks',
  },
  {
    id: 'party',
    label: 'Party & Dance',
    bgColor: '#A84218',
    cover: 'https://c.saavncdn.com/881/War-Hindi-2019-20191001104931-500x500.jpg',
    subtags: ['Club Bangers >', 'Desi Party >', 'High Energy >', 'Dance Floor >'],
    artistIds: ['diljit_dosanjh', 'karan_aujla', 'pritam', 'b_praak'],
    playlistIds: ['party_club_bangers'],
    query: 'Bollywood Dance Hits',
    category: 'party',
    description: 'Max-energy floor-fillers, unstoppable celebration beats, and chart-topping dance anthems.',
    trackCount: '26+ Tracks',
  },
  {
    id: 'sad',
    label: 'Sad & Heartbreak',
    bgColor: '#252836',
    cover: 'https://c.saavncdn.com/257/Ae-Dil-Hai-Mushkil-Hindi-2016-500x500.jpg',
    subtags: ['Broken Heart >', 'Cathartic Soul >', 'Dard-e-Dil >', 'Slow Burn >'],
    artistIds: ['b_praak', 'arijit_singh', 'kk', 'atif_aslam'],
    playlistIds: ['heartbreak_catharsis'],
    query: 'Sad Hindi Songs',
    category: 'heartbreak',
    description: 'Cathartic heartbreak songs and melancholy slow-burn tracks from Arijit Singh, B Praak, and KK.',
    trackCount: '25+ Tracks',
  },
  {
    id: 'retro',
    label: '90s & Golden Retro',
    bgColor: '#854D0E',
    cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg',
    subtags: ['Evergreen 70s >', 'Golden 90s >', 'Kishore Classics >', 'Vintage Gems >'],
    artistIds: ['kishore_kumar', 'sonu_nigam'],
    playlistIds: ['retro_golden_classics'],
    query: 'Retro Hindi Classics',
    category: 'nostalgic',
    description: 'Timeless vintage Bollywood gems from Kishore Kumar, Sonu Nigam, and the golden retro era.',
    trackCount: '28+ Tracks',
  },
  {
    id: 'indie',
    label: 'Acoustic Indie',
    bgColor: '#444B2B',
    cover: 'https://c.saavncdn.com/504/Arz-Kiya-Hai-Coke-Studio-Bharat-Hindi-2025-20250818054005-500x500.jpg',
    subtags: ['Indie Storytelling >', 'Raw Vocals >', 'Fingerpicking >', 'Coffee House >'],
    artistIds: ['anuv_jain', 'mohit_chauhan', 'kk'],
    playlistIds: ['late_night_lofi'],
    query: 'Indie Acoustic Hindi',
    category: 'chill_sunday',
    description: 'Heart-to-heart acoustic storytelling, gentle fingerpicking, and poetic lyrics from indie singer-songwriters.',
    trackCount: '25+ Tracks',
  },
  {
    id: 'sufi',
    label: 'Sufi & Qawwali',
    bgColor: '#5C1B24',
    cover: 'https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-500x500.jpg',
    subtags: ['Sufi Qawwali >', 'Soul Healing >', 'Spiritual Waves >', 'Meditative >'],
    artistIds: ['mohit_chauhan', 'atif_aslam', 'b_praak'],
    playlistIds: ['bollywood_romance_2025'],
    query: 'Sufi Hindi Qawwali',
    category: 'sufi',
    description: 'Deep meditative sufi renditions, qawwalis, and spiritual soul-elevating compositions.',
    trackCount: '22+ Tracks',
  },
  {
    id: 'gym',
    label: 'Gym & Beast Mode',
    bgColor: '#291D18',
    cover: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_004_20250617183705_500x500.jpg',
    subtags: ['Beast Workout >', 'High Testosterone >', 'Heavy Bass >', 'Hype Drops >'],
    artistIds: ['sidhu_moose_wala', 'diljit_dosanjh', 'karan_aujla'],
    playlistIds: ['punjabi_wave_trap'],
    query: 'Workout Gym Motivation Hindi',
    category: 'gym_power',
    description: 'High-testosterone motivation tracks, driving basslines, and heavy-intensity gym pump anthems.',
    trackCount: '26+ Tracks',
  },
  {
    id: 'devotional',
    label: 'Devotional & Spiritual',
    bgColor: '#8C431B',
    cover: 'https://c.saavncdn.com/artists/Arijit_Singh_004_20241118063717_500x500.jpg',
    subtags: ['Morning Prayers >', 'Peaceful Mantras >', 'Soul Peace >'],
    artistIds: ['arijit_singh', 'sonu_nigam', 'mohit_chauhan'],
    playlistIds: ['retro_golden_classics'],
    query: 'Devotional Hindi Bhajans',
    category: 'sufi',
    description: 'Serene morning chants, divine peace, and uplifting spiritual compositions.',
    trackCount: '20+ Tracks',
  },
  {
    id: 'chartbusters',
    label: 'Trending Chartbusters',
    bgColor: '#B93815',
    cover: 'https://c.saavncdn.com/960/Best-of-2025-Hindi-2025-20251231141050-500x500.jpg',
    subtags: ['Top 50 India >', 'Viral Reels >', 'Global Heatwaves >'],
    artistIds: ['karan_aujla', 'arijit_singh', 'diljit_dosanjh', 'shreya_ghoshal'],
    playlistIds: ['trending_top_50'],
    query: 'Top Bollywood Chartbusters',
    category: 'party',
    description: 'The most streamed songs in India right now, updated with fresh hits.',
    trackCount: '30+ Tracks',
  },
]

export const FAMOUS_LYRICS_MAP = [
  {
    snippet: 'dil sambhal ja zara',
    fullPhrase: 'Dil sambhal ja zara phir mohabbat karne chala hai tu',
    title: 'Phir Mohabbat',
    artist: 'Mohammed Irfan, Arijit Singh, Saim Bhat',
    album: 'Murder 2',
    canonicalQuery: 'Phir Mohabbat Murder 2',
    tags: ['dil sambhal', 'phir mohabbat', 'murder 2', 'arijit', 'sad', 'romantic'],
  },
  {
    snippet: 'kesariya tera ishq',
    fullPhrase: 'Kesariya tera ishq hai piya rang jaaun jo main haath lagaun',
    title: 'Kesariya',
    artist: 'Arijit Singh, Pritam, Amitabh Bhattacharya',
    album: 'Brahmastra',
    canonicalQuery: 'Kesariya Brahmastra',
    tags: ['kesariya', 'ishq hai piya', 'arijit', 'pritam', 'brahmastra'],
  },
  {
    snippet: 'tu hai to mujhe phir aur kya chahiye',
    fullPhrase: 'Tu hai to mujhe phir aur kya chahiye kisi se na koi shikwa na koi gila',
    title: 'Phir Aur Kya Chahiye',
    artist: 'Arijit Singh, Sachin-Jigar, Amitabh Bhattacharya',
    album: 'Zara Hatke Zara Bachke',
    canonicalQuery: 'Phir Aur Kya Chahiye',
    tags: ['phir aur kya chahiye', 'tu hai to mujhe', 'zara hatke zara bachke', 'arijit'],
  },
  {
    snippet: 'tere hawale mera sab kuch',
    fullPhrase: 'Tere hawale mera sab kuch sab kuch tere hawale kar diya',
    title: 'Tere Hawaale',
    artist: 'Arijit Singh, Shilpa Rao, Pritam',
    album: 'Laal Singh Chaddha',
    canonicalQuery: 'Tere Hawaale Laal Singh Chaddha',
    tags: ['tere hawale', 'sab kuch', 'laal singh chaddha', 'arijit', 'shilpa rao'],
  },
  {
    snippet: 'apna bana le priya',
    fullPhrase: 'Tu apna bana le mujhe bas apna bana le priya',
    title: 'Apna Bana Le',
    artist: 'Arijit Singh, Sachin-Jigar',
    album: 'Bhediya',
    canonicalQuery: 'Apna Bana Le Bhediya',
    tags: ['apna bana le', 'bhediya', 'arijit singh', 'sachin jigar'],
  },
  {
    snippet: 'hum tere bin ab reh nahi sakte',
    fullPhrase: 'Hum tere bin ab reh nahi sakte tere bina kya wajood mera',
    title: 'Tum Hi Ho',
    artist: 'Arijit Singh, Mithoon',
    album: 'Aashiqui 2',
    canonicalQuery: 'Tum Hi Ho Aashiqui 2',
    tags: ['tum hi ho', 'aashiqui 2', 'hum tere bin', 'kyun ki tum hi ho'],
  },
  {
    snippet: 'channa mereya',
    fullPhrase: 'Achha chalta hoon duaaon mein yaad rakhna mere zikr ka zubaan pe swaad rakhna',
    title: 'Channa Mereya',
    artist: 'Arijit Singh, Pritam',
    album: 'Ae Dil Hai Mushkil',
    canonicalQuery: 'Channa Mereya Ae Dil Hai Mushkil',
    tags: ['channa mereya', 'achha chalta hoon', 'ae dil hai mushkil', 'sad', 'breakup'],
  },
  {
    snippet: 'kahani suno zubani suno',
    fullPhrase: 'Kahani suno haan zubani suno mujhe pyaar hua tha ikraar hua tha',
    title: 'Kahani Suno 2.0',
    artist: 'Kaifi Khalil',
    album: 'Kahani Suno 2.0',
    canonicalQuery: 'Kahani Suno 2.0 Kaifi Khalil',
    tags: ['kahani suno', 'zubani suno', 'pyaar hua tha', 'kaifi khalil', 'sad'],
  },
  {
    snippet: 'o bedardeya',
    fullPhrase: 'O bedardeya yaara o bedardeya pyar hota kayi baar hai',
    title: 'O Bedardeya',
    artist: 'Arijit Singh, Pritam',
    album: 'Tu Jhoothi Main Makkaar',
    canonicalQuery: 'O Bedardeya Tu Jhoothi Main Makkaar',
    tags: ['o bedardeya', 'bedardeya', 'tu jhoothi main makkaar', 'arijit', 'sad'],
  },
  {
    snippet: 'tu aake dekhle',
    fullPhrase: 'Tu aake dekhle ho maine raatein kitni saari teri yaadon mein guzari',
    title: 'Tu Aake Dekhle',
    artist: 'King',
    album: 'The Carnival',
    canonicalQuery: 'Tu Aake Dekhle King',
    tags: ['tu aake dekhle', 'king', 'carnival', 'hip hop', 'romance'],
  },
  {
    snippet: 'pal pal dil ke paas',
    fullPhrase: 'Pal pal dil ke paas tum rehti ho jeevan meethi pyaas yeh kehti ho',
    title: 'Pal Pal Dil Ke Paas',
    artist: 'Kishore Kumar, Kalyanji-Anandji',
    album: 'Blackmail',
    canonicalQuery: 'Pal Pal Dil Ke Paas Kishore Kumar',
    tags: ['pal pal dil ke paas', 'kishore kumar', 'blackmail', 'retro', 'golden'],
  },
  {
    snippet: 'raatan lambiyan',
    fullPhrase: 'Teri meri gallan ho gayi mashhoor kar na kabhi tu mujhe nazron se door',
    title: 'Raatan Lambiyan',
    artist: 'Jubin Nautiyal, Asees Kaur, Tanishk Bagchi',
    album: 'Shershaah',
    canonicalQuery: 'Raatan Lambiyan Shershaah',
    tags: ['raatan lambiyan', 'teri meri gallan', 'shershaah', 'jubin nautiyal'],
  },
  {
    snippet: 'shayad kabhi na keh sakun',
    fullPhrase: 'Shayad kabhi na keh sakun main tumko kahe bina samajh lo tum shayad',
    title: 'Shayad',
    artist: 'Arijit Singh, Pritam',
    album: 'Love Aaj Kal',
    canonicalQuery: 'Shayad Love Aaj Kal',
    tags: ['shayad', 'love aaj kal', 'kahe bina samajh lo', 'arijit'],
  },
  {
    snippet: 'agar tum saath ho',
    fullPhrase: 'Pal bhar thehar jao dil yeh sambhal jaye kaise tumhe roka karun',
    title: 'Agar Tum Saath Ho',
    artist: 'Alka Yagnik, Arijit Singh, A.R. Rahman',
    album: 'Tamasha',
    canonicalQuery: 'Agar Tum Saath Ho Tamasha',
    tags: ['agar tum saath ho', 'pal bhar thehar jao', 'tamasha', 'ar rahman', 'arijit'],
  },
  {
    snippet: 'hawaon mein bahenge',
    fullPhrase: 'Hawaon mein bahenge ghataon mein rahenge tu barkha meri main tera baadal piya',
    title: 'Kalank (Title Track)',
    artist: 'Arijit Singh, Pritam',
    album: 'Kalank',
    canonicalQuery: 'Kalank Title Track Arijit Singh',
    tags: ['kalank', 'hawaon mein bahenge', 'arijit singh', 'pritam'],
  },
  {
    snippet: 'le jayein jane kahan hawayein',
    fullPhrase: 'Hawayein hawayein le jayein mujhe wahan jahan pe chhupe ho tum',
    title: 'Hawayein',
    artist: 'Arijit Singh, Pritam',
    album: 'Jab Harry Met Sejal',
    canonicalQuery: 'Hawayein Jab Harry Met Sejal',
    tags: ['hawayein', 'jab harry met sejal', 'arijit singh', 'pritam'],
  },
  {
    snippet: 'teri mitti me mil jawa',
    fullPhrase: 'O maai meri kya fikar tujhe kyun aankh se dariya behta hai',
    title: 'Teri Mitti',
    artist: 'B Praak, Arko',
    album: 'Kesari',
    canonicalQuery: 'Teri Mitti Kesari B Praak',
    tags: ['teri mitti', 'kesari', 'b praak', 'desh bhakti', 'emotional'],
  },
  {
    snippet: 'chaleya ishq me dil bana hai',
    fullPhrase: 'Ishq me dil bana hai ishq me dil fanaa hai',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh Ravichander',
    album: 'Jawan',
    canonicalQuery: 'Chaleya Jawan Arijit Singh',
    tags: ['chaleya', 'jawan', 'anirudh', 'arijit singh', 'shilpa rao'],
  },
  {
    snippet: 'satranga ishq',
    fullPhrase: 'Aadha tera aadha mera satranga ishq yeh ishq yeh',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik',
    album: 'Animal',
    canonicalQuery: 'Satranga Animal Arijit Singh',
    tags: ['satranga', 'animal', 'arijit singh', 'shreyas puranik'],
  },
  {
    snippet: 'woh lamhe woh baatein',
    fullPhrase: 'Woh lamhe woh baatein koi na jaane thi kaisi raatein',
    title: 'Woh Lamhe',
    artist: 'Atif Aslam, Mithoon, Jal',
    album: 'Zeher',
    canonicalQuery: 'Woh Lamhe Atif Aslam',
    tags: ['woh lamhe', 'atif aslam', 'zeher', 'nostalgia', 'rock ballad'],
  },
  {
    snippet: 'aadat se majboor',
    fullPhrase: 'Juda hoke bhi tu mujhme kahin baaki hai',
    title: 'Aadat',
    artist: 'Atif Aslam, Jal',
    album: 'Kalyug',
    canonicalQuery: 'Aadat Atif Aslam Jal',
    tags: ['aadat', 'juda hoke bhi', 'atif aslam', 'kalyug'],
  },
  {
    snippet: 'baarishein',
    fullPhrase: 'Hawaayein chali hain naya sa sama hai tu aake mil ja mujhse',
    title: 'Baarishein',
    artist: 'Anuv Jain',
    album: 'Baarishein',
    canonicalQuery: 'Baarishein Anuv Jain',
    tags: ['baarishein', 'anuv jain', 'acoustic', 'indie', 'rain'],
  },
  {
    snippet: 'brown munde',
    fullPhrase: 'Brown munde brown munde gaddiyan ucchiyan rakhiyan',
    title: 'Brown Munde',
    artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon',
    album: 'Brown Munde',
    canonicalQuery: 'Brown Munde AP Dhillon',
    tags: ['brown munde', 'ap dhillon', 'gurinder gill', 'punjabi hip hop'],
  },
  {
    snippet: 'yaaron dosti badi hi haseen hai',
    fullPhrase: 'Yaaron dosti badi hi haseen hai yeh na ho to kya phir',
    title: 'Yaaron',
    artist: 'KK',
    album: 'Pal',
    canonicalQuery: 'Yaaron Dosti KK Pal',
    tags: ['yaaron', 'kk', 'dosti', 'pal', 'farewell', 'memories'],
  },
  {
    snippet: 'kal ho naa ho',
    fullPhrase: 'Har ghadi badal rahi hai roop zindagi chaanv hai kahin',
    title: 'Kal Ho Naa Ho',
    artist: 'Sonu Nigam, Shankar-Ehsaan-Loy',
    album: 'Kal Ho Naa Ho',
    canonicalQuery: 'Kal Ho Naa Ho Sonu Nigam',
    tags: ['kal ho naa ho', 'har ghadi badal rahi hai', 'sonu nigam', 'classic'],
  },
  {
    snippet: 'tum se hi din hota hai',
    fullPhrase: 'Tum se hi din hota hai surmayi shaam aati hai tum se hi',
    title: 'Tum Se Hi',
    artist: 'Mohit Chauhan, Pritam',
    album: 'Jab We Met',
    canonicalQuery: 'Tum Se Hi Jab We Met Mohit Chauhan',
    tags: ['tum se hi', 'jab we met', 'mohit chauhan', 'surmayi shaam'],
  },
]

// ============================================================================
// AI SEMANTIC MOOD & GENRE TAXONOMY
// Enables NLP / ML-style mood queries like "sad songs", "dard bhare gaane",
// "romantic hits", "late night lofi", "party bangers", etc.
// ============================================================================
export const MOOD_GENRE_TAXONOMY = [
  {
    genreId: 'sad',
    category: 'heartbreak',
    label: 'Sad & Heartbreak',
    keywords: [
      'sad', 'dard', 'heartbreak', 'broken', 'breakup', 'alone', 'lonely', 'cry',
      'crying', 'emotional', 'judai', 'bewafa', 'tears', 'udas', 'tanhai', 'gham',
      'pain', 'depressed', 'gloomy', 'slow burn', 'cathartic', 'broken heart',
      'sad songs', 'sad song', 'dard bhare'
    ],
    primaryArtistIds: ['arijit_singh', 'atif_aslam', 'kk', 'b_praak'],
    topSongTitles: ['Channa Mereya', 'Ae Dil Hai Mushkil', 'Agar Tum Saath Ho', 'Tujhe Kitna Chahne Lage', 'Pachtaoge', 'Filhall', 'Aadat', 'Woh Lamhe', 'Yaaron', 'Alvida'],
    badge: 'AI Mood: Sad & Soul',
    description: 'Cathartic heartbreak songs, melancholic ballads, and deep emotional melodies for soul healing.',
    playlistTitle: 'Sad Songs & Broken Hearts',
    gradient: 'from-blue-900/60 via-slate-900/60 to-coal',
  },
  {
    genreId: 'romantic',
    category: 'romantic',
    label: 'Bollywood Romance',
    keywords: [
      'romantic', 'romance', 'love', 'pyaar', 'ishq', 'mohabbat', 'dil', 'crush',
      'couple', 'propose', 'sweet', 'valetine', 'ishqbaazi', 'sanware', 'chaahat',
      'deewana', 'humsafar', 'lovers', 'romantic songs', 'romantic song', 'love songs'
    ],
    primaryArtistIds: ['arijit_singh', 'shreya_ghoshal', 'atif_aslam', 'pritam'],
    topSongTitles: ['Kesariya', 'Chaleya', 'Satranga', 'Apna Bana Le', 'Tum Hi Ho', 'Hawayein', 'Gerua', 'Raabta', 'Zaalima', 'Pee Loon', 'Jeene Laga Hoon'],
    badge: 'AI Mood: Bollywood Romance',
    description: 'Timeless love anthems, sweet acoustic confessions, and breathtaking Bollywood duets.',
    playlistTitle: 'Pure Bollywood Romance',
    gradient: 'from-rose-900/60 via-pink-950/60 to-coal',
  },
  {
    genreId: 'party',
    category: 'party',
    label: 'Party & Dance',
    keywords: [
      'party', 'dance', 'club', 'nach', 'bhangra', 'dj', 'energy', 'edm', 'hype',
      'bass', 'celebration', 'wedding', 'shadi', 'dhol', 'beat', 'remix', 'masti',
      'hungama', 'high energy', 'club bangers', 'party songs', 'dance songs'
    ],
    primaryArtistIds: ['diljit_dosanjh', 'karan_aujla', 'pritam', 'b_praak'],
    topSongTitles: ['Tauba Tauba', 'Ashke', 'Winning Speech', 'Softly', 'Proper Patola', 'Lover', 'Kala Chashma', 'Kar Gayi Chull', 'Badtameez Dil', 'Ghungroo'],
    badge: 'AI Mood: Party & Dance',
    description: 'Floor-fillers, celebration bangers, and chart-topping dance anthems.',
    playlistTitle: 'Dance Floor & Party Bangers',
    gradient: 'from-amber-700/60 via-orange-950/60 to-coal',
  },
  {
    genreId: 'punjabi',
    category: 'party',
    label: 'Punjabi Hits & Global Trap',
    keywords: [
      'punjabi', 'desi', 'jatt', 'sidhu', 'moosewala', 'aujla', 'dhillon',
      'bhangra', 'shinda', 'karan', 'diljit', 'ghaint', 'swag', 'chandigarh',
      'amritsar', 'punjabi songs', 'punjabi hits'
    ],
    primaryArtistIds: ['karan_aujla', 'diljit_dosanjh', 'ap_dhillon', 'sidhu_moose_wala', 'b_praak'],
    topSongTitles: ['Tauba Tauba', 'Ashke', 'Winning Speech', 'Softly', 'Brown Munde', 'With You', 'Excuses', 'Lover', 'GOAT', 'Kinni Kinni', 'Hass Hass'],
    badge: 'AI Genre: Punjabi Hits',
    description: 'Global Punjabi heatwaves, heavyweight 808 basslines, and stadium-shaking flows.',
    playlistTitle: 'Ghaint Punjabi Flow',
    gradient: 'from-red-900/60 via-rose-950/60 to-coal',
  },
  {
    genreId: 'lofi',
    category: 'focus_lofi',
    label: 'Late Night Lo-Fi',
    keywords: [
      'lofi', 'lo-fi', 'chill', 'relax', 'calm', 'peace', 'study', 'sleep', 'night',
      'late night', 'midnight', 'sleepy', 'focus', 'soft', 'cozy', 'rain', 'barish',
      'acoustic', 'slowed', 'reverb', 'lofi songs', 'chill songs'
    ],
    primaryArtistIds: ['anuv_jain', 'ap_dhillon', 'mohit_chauhan'],
    topSongTitles: ['Baarishein', 'Husn', 'Alag Aasmaan', 'Mishri', 'Riha', 'Arz Kiya Hai', 'With You', 'Excuses', 'Tum Se Hi', 'Kun Faya Kun'],
    badge: 'AI Mood: Late Night Chill',
    description: 'Gentle acoustic strings, poetic storytelling, and warm tape saturation for calm vibes.',
    playlistTitle: 'Late Night Lo-Fi & Chillout',
    gradient: 'from-indigo-900/60 via-purple-950/60 to-coal',
  },
  {
    genreId: 'retro',
    category: 'nostalgic',
    label: '90s & Golden Retro',
    keywords: [
      'retro', 'old', 'purane', 'vintage', 'classic', 'golden', '90s', '80s', '70s',
      'kishore', 'rafi', 'lata', 'mukesh', 'rd burman', 'evergreen', 'purane gane',
      'nostalgia', 'nostalgic', 'retro songs', 'old songs'
    ],
    primaryArtistIds: ['kishore_kumar', 'sonu_nigam'],
    topSongTitles: ['Mere Sapno Ki Rani', 'Pal Pal Dil Ke Paas', 'O Mere Dil Ke Chain', 'Roop Tera Mastana', 'Yeh Shaam Mastani', 'Kal Ho Naa Ho', 'Sandese Aate Hai', 'Abhi Mujh Mein Kahin'],
    badge: 'AI Genre: Golden Retro',
    description: 'Gold-standard vintage classics and 90s Bollywood evergreen melodies that defined generations.',
    playlistTitle: '90s & Golden Retro Classics',
    gradient: 'from-yellow-900/60 via-amber-950/60 to-coal',
  },
  {
    genreId: 'sufi',
    category: 'sufi',
    label: 'Sufi & Qawwali',
    keywords: [
      'sufi', 'qawwali', 'spiritual', 'healing', 'khwaja', 'ali', 'meditation',
      'meditative', 'soul', 'nusrat', 'rahat', 'dargah', 'sufi songs'
    ],
    primaryArtistIds: ['mohit_chauhan', 'atif_aslam', 'b_praak'],
    topSongTitles: ['Kun Faya Kun', 'Nadaan Parinde', 'Pee Loon', 'Teri Deewani', 'Saiyyan', 'Tum Mile', 'Tera Hone Laga Hoon'],
    badge: 'AI Genre: Sufi & Qawwali',
    description: 'Deep meditative sufi renditions, qawwalis, and spiritual soul-elevating compositions.',
    playlistTitle: 'Sufi & Meditative Soul',
    gradient: 'from-rose-950/60 via-red-950/60 to-coal',
  },
  {
    genreId: 'gym',
    category: 'gym_power',
    label: 'Gym & Beast Mode',
    keywords: [
      'gym', 'workout', 'beast', 'motivation', 'motivational', 'fitness', 'running',
      'pump', 'power', 'heavy', 'training', 'iron', 'gym songs', 'workout songs'
    ],
    primaryArtistIds: ['sidhu_moose_wala', 'diljit_dosanjh', 'karan_aujla'],
    topSongTitles: ['Winning Speech', 'Ashke', 'Tauba Tauba', 'GOAT', '295', 'The Last Ride', 'Born to Shine'],
    badge: 'AI Mood: Beast Mode Workout',
    description: 'High-testosterone motivation tracks, driving basslines, and heavy-intensity pump anthems.',
    playlistTitle: 'Gym & Beast Mode Bangers',
    gradient: 'from-zinc-900/60 via-red-950/60 to-coal',
  },
  {
    genreId: 'new_releases',
    category: 'party',
    label: 'New Releases 2025-2026',
    keywords: [
      'new', 'latest', 'fresh', 'recent', '2025', '2026', 'trending', 'viral',
      'drops', 'chartbusters', 'top 50', 'hit', 'new drops', 'latest songs', 'fresh songs'
    ],
    primaryArtistIds: ['karan_aujla', 'arijit_singh', 'diljit_dosanjh', 'anuv_jain'],
    topSongTitles: ['Apna Bana Le', 'Zaalima', 'Gehra Hua', 'Tainu Khabar Nahi', 'Arz Kiya Hai', 'Barbaad', 'Saiyaara', 'Ashke', 'Tauba Tauba'],
    badge: 'AI Radar: Fresh Drops',
    description: 'India’s latest streaming sensations, viral reels anthems, and blockbuster chartbusters in ultra 320 kbps.',
    playlistTitle: '2025-2026 Chartbusters',
    gradient: 'from-amber-600/50 via-rose-950/50 to-coal',
  },
]

/**
 * Fast Levenshtein distance for typo tolerance & fuzzy phonetic matching.
 */
function levenshteinDist(a, b) {
  if (a === b) return 0
  if (!a.length) return b.length
  if (!b.length) return a.length
  const row = []
  for (let i = 0; i <= b.length; i++) row[i] = i
  for (let i = 1; i <= a.length; i++) {
    let prev = i
    for (let j = 1; j <= b.length; j++) {
      const val = b[j - 1] === a[i - 1] ? row[j - 1] : Math.min(row[j - 1], row[j], prev) + 1
      row[j - 1] = prev
      prev = val
    }
    row[b.length] = prev
  }
  return row[b.length]
}

/**
 * Semantic Mood & Genre Detector (AI Mood Search).
 * Detects if query expresses mood intent like "sad songs", "romantic hits", "party dance", etc.
 */
export function detectMoodOrGenre(query) {
  if (!query) return null
  const cleanQ = query.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').trim()
  if (!cleanQ) return null

  const tokens = cleanQ.split(/\s+/).filter(Boolean)
  let bestMatch = null
  let highestScore = 0

  for (const item of MOOD_GENRE_TAXONOMY) {
    let score = 0
    for (const kw of item.keywords) {
      if (cleanQ === kw) {
        score += 150
      } else if (cleanQ.includes(kw)) {
        score += kw.length >= 4 ? 80 : 50
      }
      for (const tok of tokens) {
        if (tok === kw) {
          score += 60
        } else if (tok.length >= 4 && (kw.startsWith(tok) || tok.startsWith(kw))) {
          score += 35
        } else if (tok.length >= 4 && kw.length >= 4 && levenshteinDist(tok, kw) <= 1) {
          score += 45
        }
      }
    }

    if (cleanQ.includes(item.label.toLowerCase())) {
      score += 100
    }

    if (score > highestScore && score >= 45) {
      highestScore = score
      bestMatch = item
    }
  }

  if (bestMatch) {
    const genreObj = POPULAR_GENRES.find((g) => g.id === bestMatch.genreId) || POPULAR_GENRES[0]
    const matchingArtists = bestMatch.primaryArtistIds
      .map((id) => POPULAR_SINGERS.find((s) => s.id === id))
      .filter(Boolean)
    return {
      ...bestMatch,
      genreObj,
      artists: matchingArtists,
      score: highestScore,
    }
  }
  return null
}

/**
 * Typo-Tolerant Artist Detector.
 * Identifies if query references an artist like "arijit", "arijit songs", "arijet", "atif", etc.
 */
export function detectArtist(query) {
  if (!query) return null
  const cleanQ = query
    .toLowerCase()
    .replace(/\b(songs|song|all songs|hits|hit|playlist|by|of|gaane|gana|best|top|new|track|tracks|music|mp3|audio)\b/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .trim()
  if (!cleanQ || cleanQ.length < 2) return null

  const qTokens = cleanQ.split(/\s+/).filter((t) => t.length > 1)
  let bestSinger = null
  let highestScore = 0

  for (const s of POPULAR_SINGERS) {
    const sNameLower = s.name.toLowerCase()
    const sTokens = sNameLower.split(/\s+/).filter(Boolean)
    let score = 0

    if (sNameLower === cleanQ) {
      score = 500
    } else if (cleanQ.includes(sNameLower)) {
      score = 400
    } else if (sNameLower.includes(cleanQ)) {
      score = 300
    } else {
      for (const qt of qTokens) {
        for (const st of sTokens) {
          if (qt === st) {
            score += 160
          } else if (st.startsWith(qt) && qt.length >= 3) {
            score += 110
          } else {
            const dist = levenshteinDist(qt, st)
            if (dist === 1 && Math.max(qt.length, st.length) >= 4) {
              score += 95
            } else if (dist === 2 && Math.max(qt.length, st.length) >= 6) {
              score += 65
            }
          }
        }
      }
    }

    if (score > highestScore && score >= 90) {
      highestScore = score
      bestSinger = s
    }
  }

  if (bestSinger) {
    const discography = ARTIST_DISCOGRAPHIES[bestSinger.id] || []
    return {
      artist: bestSinger,
      tracks: discography,
      score: highestScore,
    }
  }
  return null
}

/**
 * Generate 15+ intelligent autocomplete predictions as the user types.
 * Supports:
 * - AI Mood & Genre predictions ("sad songs" -> "Sad & Heartbreak Playlist", "Arijit Sad Songs")
 * - Artist playlists & discographies ("arijit" -> "Arijit Singh Verified Artist", "Arijit Romantic Hits")
 * - 2024-2026 new release hits
 * - Famous lyrics matches
 */
export function getSearchPredictions(query) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []

  const predictions = []
  const seen = new Set()

  const add = (text, type, meta = {}) => {
    const key = `${type}:${text}`.toLowerCase()
    if (!seen.has(key)) {
      seen.add(key)
      predictions.push({ text, type, ...meta })
    }
  }

  // 1. AI Mood / Genre Detection
  const moodMatch = detectMoodOrGenre(q)
  if (moodMatch) {
    add(moodMatch.label, 'genre', {
      badge: 'AI Mood Hub',
      emoji: moodMatch.genreObj?.emoji || '✨',
      query: moodMatch.label,
      genreObj: moodMatch.genreObj,
    })
    add(moodMatch.playlistTitle, 'playlist', {
      badge: 'AI Playlist',
      subtitle: `${moodMatch.label} · Curated Hits`,
      query: `${moodMatch.label} Songs`,
      genreObj: moodMatch.genreObj,
    })
    // Add top artists for this mood
    for (const art of moodMatch.artists.slice(0, 3)) {
      add(`${art.name} (${moodMatch.label} Special)`, 'artist', {
        badge: 'Artist Playlist',
        avatar: art.avatar,
        query: `${art.name} ${moodMatch.label}`,
        artistId: art.id,
        singerObj: art,
      })
    }
    // Add top songs for this mood
    for (const sTitle of moodMatch.topSongTitles.slice(0, 6)) {
      add(sTitle, 'song', {
        badge: moodMatch.badge,
        subtitle: `${moodMatch.label} Favorite`,
        query: sTitle,
      })
    }
  }

  // 2. Artist Detection
  const artistMatch = detectArtist(q)
  if (artistMatch) {
    const s = artistMatch.artist
    add(s.name, 'artist', {
      badge: 'Verified Artist Playlist',
      avatar: s.avatar,
      query: s.name,
      artistId: s.id,
      singerObj: s,
    })
    add(`${s.name} Complete Discography`, 'artist_playlist', {
      badge: `${artistMatch.tracks.length || '30'}+ Songs`,
      avatar: s.avatar,
      query: s.name,
      artistId: s.id,
      singerObj: s,
    })
    add(`${s.name} Romantic Hits`, 'suggestion', { badge: 'Romantic', query: `${s.name} Romantic Songs` })
    add(`${s.name} Sad Songs`, 'suggestion', { badge: 'Heartbreak', query: `${s.name} Sad Songs` })
    add(`${s.name} Top Chartbusters`, 'suggestion', { badge: 'Top Hits', query: `${s.name} Best Songs` })

    // Add first 5 songs of this artist
    for (const t of (artistMatch.tracks || []).slice(0, 5)) {
      add(t.title, 'song', {
        badge: 'Artist Track',
        subtitle: t.artist,
        query: t.title,
        trackObj: t,
      })
    }
  }

  // 3. Fallback popular singer check for broader queries
  for (const s of POPULAR_SINGERS) {
    if (s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase().split(' ')[0])) {
      add(s.name, 'artist', { badge: 'Artist Playlist', avatar: s.avatar, query: s.query, artistId: s.id, singerObj: s })
    }
  }

  // 4. Famous lyrics snippets
  for (const item of FAMOUS_LYRICS_MAP) {
    const matchedSnippet =
      item.snippet.toLowerCase().includes(q) ||
      item.fullPhrase.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.tags.some((t) => t.includes(q))

    if (matchedSnippet) {
      add(item.title, 'song', {
        badge: 'Lyrics Match',
        subtitle: `"${item.snippet}" · ${item.artist}`,
        query: item.canonicalQuery,
      })
      add(item.snippet, 'lyrics', {
        badge: 'Lyric Line',
        subtitle: `From "${item.title}"`,
        query: item.canonicalQuery,
      })
    }
  }

  // 5. 2024-2026 new releases
  for (const nr of NEW_RELEASES_2025_2026) {
    if (
      nr.title.toLowerCase().includes(q) ||
      nr.artist.toLowerCase().includes(q) ||
      nr.album.toLowerCase().includes(q)
    ) {
      add(nr.title, 'new_release', { badge: 'New 2024-2026', subtitle: nr.artist, query: nr.title })
    }
  }

  // 6. Genres
  for (const g of POPULAR_GENRES) {
    if (g.label.toLowerCase().includes(q) || g.query.toLowerCase().includes(q)) {
      add(g.label, 'genre', { badge: 'Genre', emoji: g.emoji, query: g.query, genreObj: g })
    }
  }

  return predictions.slice(0, 20)
}

/**
 * Intelligent fuzzy tokenized search across catalog tracks & lyrics mappings.
 * Automatically incorporates AI Mood detection and Artist matching.
 * Returns 30-35+ highly ranked tracks.
 */
export function smartSearchCatalog(query, catalogTracks = []) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []

  const qTokens = q.split(/\s+/).filter(Boolean)
  const mood = detectMoodOrGenre(q)
  const artistData = detectArtist(q)

  // 1. Direct lyrics phrase match
  const lyricsHits = []
  for (const item of FAMOUS_LYRICS_MAP) {
    const isLyricMatch =
      item.snippet.toLowerCase().includes(q) ||
      q.includes(item.snippet.toLowerCase()) ||
      item.fullPhrase.toLowerCase().includes(q) ||
      qTokens.some((tok) => tok.length > 2 && item.snippet.toLowerCase().includes(tok))

    if (isLyricMatch) {
      const inCatalog = catalogTracks.find(
        (t) =>
          (t.title && t.title.toLowerCase().includes(item.title.toLowerCase())) ||
          (item.title && item.title.toLowerCase().includes(t.title?.toLowerCase()))
      )

      if (inCatalog) {
        lyricsHits.push({
          ...inCatalog,
          _score: 1600,
          _matchReason: `Lyrics: "${item.snippet}"`,
        })
      } else {
        lyricsHits.push({
          id: `lyric_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          title: item.title,
          artist: item.artist,
          album: item.album,
          cover: item.cover || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
          stream_url: item.stream_url,
          duration: item.duration || 240,
          query: item.canonicalQuery,
          source: 'lyrics_match',
          _score: 1550,
          _matchReason: `Lyrics: "${item.snippet}"`,
        })
      }
    }
  }

  // 2. If artist detected, include their discography with top priority
  const artistHits = []
  if (artistData && artistData.tracks && artistData.tracks.length > 0) {
    for (const t of artistData.tracks) {
      artistHits.push({
        ...t,
        _score: 1400,
        _matchReason: `${artistData.artist.name} Discography`,
      })
    }
  }

  // 3. Add matching new releases
  const newReleaseHits = []
  for (const nr of NEW_RELEASES_2025_2026) {
    if (
      nr.title.toLowerCase().includes(q) ||
      nr.artist.toLowerCase().includes(q) ||
      nr.album.toLowerCase().includes(q)
    ) {
      newReleaseHits.push({
        ...nr,
        _score: 1100,
        _matchReason: 'Trending 2024-2026',
      })
    }
  }

  // 4. Score all catalog tracks
  const scored = []
  const seenKeys = new Set(
    [...lyricsHits, ...artistHits, ...newReleaseHits].map((t) => `${t.title}-${t.artist}`.toLowerCase())
  )

  for (const t of catalogTracks) {
    const tKey = `${t.title}-${t.artist}`.toLowerCase()
    if (seenKeys.has(tKey)) continue

    const titleLower = (t.title || '').toLowerCase()
    const artistLower = (t.artist || '').toLowerCase()
    const albumLower = (t.album || '').toLowerCase()
    const categoryLower = (t.category || '').toLowerCase()

    let score = 0
    let matchReason = ''

    // Exact or prefix title match
    if (titleLower === q) {
      score += 800
      matchReason = 'Exact Title Match'
    } else if (titleLower.startsWith(q)) {
      score += 550
      matchReason = 'Title Match'
    } else if (titleLower.includes(q)) {
      score += 400
      matchReason = 'Title Match'
    }

    // Artist match
    if (artistLower === q) {
      score += 650
      matchReason = matchReason || 'Artist Match'
    } else if (artistLower.includes(q)) {
      score += 350
      matchReason = matchReason || 'Artist Match'
    }

    // AI Mood matching bonus
    if (mood) {
      if (categoryLower === mood.category || categoryLower === mood.genreId) {
        score += 500
        matchReason = matchReason || `${mood.label} Pick`
      }
      if (mood.primaryArtistIds.some((id) => artistLower.includes(id.replace(/_/g, ' ')))) {
        score += 300
        matchReason = matchReason || `${mood.label} Artist`
      }
      if (mood.topSongTitles.some((tit) => titleLower.includes(tit.toLowerCase()))) {
        score += 450
        matchReason = matchReason || `${mood.label} Essential`
      }
    }

    if (albumLower.includes(q)) {
      score += 150
      matchReason = matchReason || 'Album Match'
    }

    if (categoryLower.includes(q)) {
      score += 120
      matchReason = matchReason || 'Genre Match'
    }

    // Token-based matching & Levenshtein typo scoring
    let tokenMatches = 0
    for (const tok of qTokens) {
      if (tok.length <= 1) continue
      if (titleLower.includes(tok)) {
        score += 80
        tokenMatches++
      } else if (artistLower.includes(tok)) {
        score += 70
        tokenMatches++
      } else {
        // Typo tolerance on word tokens
        const titleTokens = titleLower.split(/\s+/)
        for (const tt of titleTokens) {
          if (tt.length >= 4 && tok.length >= 4 && levenshteinDist(tok, tt) <= 1) {
            score += 50
            tokenMatches++
            matchReason = matchReason || 'Did you mean'
            break
          }
        }
      }
    }

    if (tokenMatches === qTokens.length && qTokens.length > 1) {
      score += 200
      matchReason = matchReason || 'Keyword Match'
    }

    if (score > 0) {
      seenKeys.add(tKey)
      scored.push({
        ...t,
        _score: score,
        _matchReason: matchReason || 'Related Match',
      })
    }
  }

  scored.sort((a, b) => b._score - a._score)
  return [...lyricsHits, ...artistHits, ...newReleaseHits, ...scored]
}
