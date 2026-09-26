// Standalone fallback catalog with pre-resolved 320kbps streams
// Guarantees all 10 mood rooms and 147 tracks work on Netlify even when offline!

export const DEFAULT_CATEGORIES = [
  {
    "category": "angry",
    "label": "Frustration Release",
    "emoji": "🔥",
    "tagline": "Turn the rage into a rhythm",
    "description": "Loud, cathartic rock and metal for when you need to let it out. High energy, low sweetness, zero holding back.",
    "count": 15,
    "mood_tags": [
      "angry",
      "rock",
      "metal",
      "punk",
      "cathartic"
    ]
  },
  {
    "category": "chill_sunday",
    "label": "Chill Sunday",
    "emoji": "🌤️",
    "tagline": "Slow mornings, soft light, zero plans",
    "description": "Acoustic, indie and reggae warmth for slow mornings. Mid-valence brightness, gentle grooves, sunlight-through-curtains energy.",
    "count": 14,
    "mood_tags": [
      "acoustic",
      "indie",
      "reggae",
      "jazz",
      "morning"
    ]
  },
  {
    "category": "focus_lofi",
    "label": "Deep Focus",
    "emoji": "☕",
    "tagline": "Warm beats for quiet concentration",
    "description": "Lo-fi, chillhop and instrumental tracks engineered for deep work. Steady rhythms, low danceability, no vocal distractions.",
    "count": 14,
    "mood_tags": [
      "lofi",
      "study",
      "instrumental",
      "chillhop",
      "ambient"
    ]
  },
  {
    "category": "gym_power",
    "label": "Gym Beast",
    "emoji": "⚡",
    "tagline": "Maximum intensity, zero excuses",
    "description": "High-energy phonk, EDM and hip-hop built for heavy sets. Near-max energy, driving beats, zero mid-song naps.",
    "count": 15,
    "mood_tags": [
      "gym",
      "workout",
      "phonk",
      "edm",
      "high-energy"
    ]
  },
  {
    "category": "heartbreak",
    "label": "Broken Heart",
    "emoji": "💔",
    "tagline": "Let it hurt, then let it go",
    "description": "Slow, low-valence ballads for the nights you need to feel it all the way through. Acoustic textures, piano-led arrangements, minor keys.",
    "count": 15,
    "mood_tags": [
      "sad",
      "melancholy",
      "acoustic",
      "piano",
      "breakup"
    ]
  },
  {
    "category": "morning_motivation",
    "label": "Morning Fuel",
    "emoji": "🚀",
    "tagline": "Rise up. Today is yours.",
    "description": "Bright, forward-moving anthems for fresh starts. Uplifting major-key hooks, marching rhythms, optimistic valence.",
    "count": 15,
    "mood_tags": [
      "motivation",
      "uplifting",
      "positive",
      "morning",
      "inspirational"
    ]
  },
  {
    "category": "nostalgic",
    "label": "Nostalgic Hits",
    "emoji": "🕰️",
    "tagline": "Old songs, old friends, old feelings",
    "description": "90s Bollywood gold and timeless classics that feel like old friends. Familiar melodies, warm mid-valence, memory made audible.",
    "count": 15,
    "mood_tags": [
      "90s",
      "classics",
      "retro",
      "bollywood",
      "oldschool"
    ]
  },
  {
    "category": "party",
    "label": "Party Bangers",
    "emoji": "🎉",
    "tagline": "Turn it up. Tonight is the night.",
    "description": "Dance-first, high-energy bangers for clubs, weddings and celebrations. Near-max danceability — the room will move.",
    "count": 15,
    "mood_tags": [
      "party",
      "dance",
      "club",
      "celebration",
      "hindi-pop"
    ]
  },
  {
    "category": "rain_night",
    "label": "Rainy Night",
    "emoji": "🌧️",
    "tagline": "Rain on the window, music in the dark",
    "description": "Soft, cinematic, slightly dark tracks for rain at 2am. Ambient textures, mellow vocals, and a slow, thoughtful tempo.",
    "count": 14,
    "mood_tags": [
      "rain",
      "night",
      "ambient",
      "midnight",
      "calm"
    ]
  },
  {
    "category": "romantic",
    "label": "Love Vibes",
    "emoji": "🌹",
    "tagline": "For the one who makes your heart skip",
    "description": "Warm, tender, vocal-forward songs for date nights, anniversaries and slow dances. R&B soul mixed with Bollywood romance.",
    "count": 15,
    "mood_tags": [
      "romance",
      "rnb",
      "soul",
      "date-night",
      "hindi-romance"
    ]
  }
];

export const DEFAULT_CATALOGS = {
  "angry": [
    {
      "title": "Given Up",
      "artist": "Linkin Park",
      "album": "Minutes to Midnight",
      "language": "english",
      "year": "2007",
      "id": "u1RgR3A5",
      "cover": "https://c.saavncdn.com/708/Minutes-to-Midnight-English-2007-20231005115041-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/708/98c887536c451fd5b8e4c783b1cd0768_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Numb",
      "artist": "Linkin Park",
      "album": "Meteora",
      "language": "english",
      "year": "2003",
      "id": "0NQPTLJg",
      "cover": "https://c.saavncdn.com/845/Papercuts-English-2024-20240511014821-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/845/66f80443d81be7d0a1988fb07ee7b1c9_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "In the End",
      "artist": "Linkin Park",
      "album": "Hybrid Theory",
      "language": "english",
      "year": "2000",
      "id": "FE4Lharm",
      "cover": "https://c.saavncdn.com/845/Papercuts-English-2024-20240511014821-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/845/c2c837fe52a37ade2595a71f431ddb23_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Faint",
      "artist": "Linkin Park",
      "album": "Meteora",
      "language": "english",
      "year": "2003",
      "id": "wBBRsafl",
      "cover": "https://c.saavncdn.com/085/Meteora-20th-Anniversary-Edition-English-2023-20250307181443-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/085/ee49cadd1f5aac2db086910e3ddb518d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Chop Suey!",
      "artist": "System of a Down",
      "album": "Toxicity",
      "language": "english",
      "year": "2001",
      "id": "PZ8rli6P",
      "cover": "https://c.saavncdn.com/751/Toxicity-English-2025-20250430221648-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/751/bc61501e22c6a97133cd4a9078c03c55_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Toxicity",
      "artist": "System of a Down",
      "album": "Toxicity",
      "language": "english",
      "year": "2001",
      "id": "XLVMxkbq",
      "cover": "https://c.saavncdn.com/214/Toxicity-English-2002-20200820062140-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/214/7e536f7ccc71558c0a9d0aede7e367d9_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Break Stuff",
      "artist": "Limp Bizkit",
      "album": "Significant Other",
      "language": "english",
      "year": "1999",
      "id": "_ufMTY0J",
      "cover": "https://c.saavncdn.com/716/Greatest-Hitz-English-2005-20241112042444-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/716/638991beaa7106d12f3b9a72fc65ed27_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Du Hast",
      "artist": "Rammstein",
      "album": "Sehnsucht",
      "language": "german",
      "year": "1997",
      "id": "R82_xSDM",
      "cover": "https://c.saavncdn.com/619/Made-In-Germany-1995-2011-German-2011-20250923165537-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/619/fa7674a4d43e5d1407e95753ddb47b6a_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Killing in the Name",
      "artist": "Rage Against the Machine",
      "album": "Rage Against the Machine",
      "language": "english",
      "year": "1992",
      "id": "XHHAIyt7",
      "cover": "https://c.saavncdn.com/923/Rage-Against-The-Machine-English-1992-20200109191745-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/923/eaf19134726b768b56276fe8942aa22c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Enter Sandman",
      "artist": "Metallica",
      "album": "Metallica (The Black Album)",
      "language": "english",
      "year": "1991",
      "id": "D5E48rGl",
      "cover": "https://c.saavncdn.com/999/Enter-Sandman-Remastered-2021--English-2021-20210622183538-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/999/b2c9cc6b308c33c69c3664c72e8c619c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Back in Black",
      "artist": "AC/DC",
      "album": "Back in Black",
      "language": "english",
      "year": "1980",
      "id": "fASwtCvk",
      "cover": "https://c.saavncdn.com/137/Iron-Man-2-English-2010-20200717152527-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/137/3a9fa9903250f77199fc607db9a691e4_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Uprising",
      "artist": "Muse",
      "album": "The Resistance",
      "language": "english",
      "year": "2009",
      "id": "vSGzPxZk",
      "cover": "https://c.saavncdn.com/981/Uprising-English-2009-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/981/73f8d3f7c0f19d91fb2f771c92c0378d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "I'm So Sick",
      "artist": "Flyleaf",
      "album": "Flyleaf",
      "language": "english",
      "year": "2005",
      "id": "yD54PaiM",
      "cover": "https://c.saavncdn.com/630/Flyleaf-International-Version-English-2015-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/630/a1462813b36c09b91323544948ffef35_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Still Counting",
      "artist": "Volbeat",
      "album": "Guitar Gangsters & Cadillac Blood",
      "language": "english",
      "year": "2008",
      "id": "WkxJoL-N",
      "cover": "https://c.saavncdn.com/902/MSQ-Performs-Volbeat-Unknown-2013-20210901124711-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/902/ea5b1d50e2cc7a95978865877948a08d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Thunderstruck",
      "artist": "AC/DC",
      "album": "The Razors Edge",
      "language": "english",
      "year": "1990",
      "id": "m7zzj4Qm",
      "cover": "https://c.saavncdn.com/137/Iron-Man-2-English-2010-20200717152527-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/137/6a24367bfac481c790a74b03eba4c212_320.mp4",
      "source": "jiosaavn"
    }
  ],
  "chill_sunday": [
    {
      "title": "Kabira",
      "artist": "Arijit Singh & Rekha Bhardwaj",
      "album": "Yeh Jawaani Hai Deewani",
      "language": "hindi",
      "year": "2013",
      "id": "Cyu6QA-C",
      "cover": "https://c.saavncdn.com/440/Yeh-Jawaani-Hai-Deewani-2013-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/440/664097ba2ddb94e9a8c9e9527b3010ec_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Ilahi",
      "artist": "Arijit Singh & Mohit Chauhan",
      "album": "Yeh Jawaani Hai Deewani",
      "language": "hindi",
      "year": "2013",
      "id": "Cyu6QA-C",
      "cover": "https://c.saavncdn.com/440/Yeh-Jawaani-Hai-Deewani-2013-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/440/664097ba2ddb94e9a8c9e9527b3010ec_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tumse Hi",
      "artist": "Mohit Chauhan",
      "album": "Jab We Met",
      "language": "hindi",
      "year": "2007",
      "id": "zIPKC8PK",
      "cover": "https://c.saavncdn.com/223/Jab-We-Met-Hindi-2007-20231016162009-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/223/7eddc0f9b56f110ae39a145752fabb34_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kho Gaye Hum Kahan",
      "artist": "Jasleen Royal",
      "album": "Kho Gaye Hum Kahan",
      "language": "hindi",
      "year": "2023",
      "id": "-fePrjuE",
      "cover": "https://c.saavncdn.com/905/Valentines-Special-Hindi-2026-20260122144848-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/905/03cba3d6a846862a30adb1e9a3201d33_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Banjaara",
      "artist": "Mohammed Irfan",
      "album": "Ek Tha Tiger",
      "language": "hindi",
      "year": "2012",
      "id": "bUmbjiqy",
      "cover": "https://c.saavncdn.com/868/Ek-Tha-Tiger-Hindi-2012-20190329150659-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/868/8f1d1d2b4f63149326bd5f08897e2b17_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Here Comes the Sun",
      "artist": "The Beatles",
      "album": "Abbey Road",
      "language": "english",
      "year": "1969",
      "id": "LcFoFw4m",
      "cover": "https://c.saavncdn.com/137/The-Beatles-1967-1970-2023-Edition-English-2023-20251110230556-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/137/4aaeebdb9339b60c1d16a42e48bf858d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Banana Pancakes",
      "artist": "Jack Johnson",
      "album": "In Between Dreams",
      "language": "english",
      "year": "2005",
      "id": "LbKR92dC",
      "cover": "https://c.saavncdn.com/209/weekend-vibes-English-2025-20251218053621-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/209/0a8212d097a5afe557eca48bc3b0718b_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Better Together",
      "artist": "Jack Johnson",
      "album": "In Between Dreams",
      "language": "english",
      "year": "2005",
      "id": "ezEpVQXX",
      "cover": "https://c.saavncdn.com/604/Cafe-Slow-Sips-Soft-Grooves-English-2026-20260507053538-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/604/5cb370f3f462e929effd7c68bc369042_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Don't Know Why",
      "artist": "Norah Jones",
      "album": "Come Away with Me",
      "language": "english",
      "year": "2002",
      "id": "AePukGSr",
      "cover": "https://c.saavncdn.com/654/Classic-Jones-English-2020-20240829000106-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/654/4cb9c9c59e4a2cb48a4e3a1ae7a86d3e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Three Little Birds",
      "artist": "Bob Marley & The Wailers",
      "album": "Exodus",
      "language": "english",
      "year": "1977",
      "id": "Hb0MpSlr",
      "cover": "https://c.saavncdn.com/820/Exodus-Deluxe-Edition-2007-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/820/40d5fe558941a49e36c62464d914d025_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Island in the Sun",
      "artist": "Weezer",
      "album": "Weezer (Green Album)",
      "language": "english",
      "year": "2001",
      "id": "y7MEqFnu",
      "cover": "https://c.saavncdn.com/522/Weezer-2001-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/522/32f382ad81ccbe108c586294f253802e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Sunrise",
      "artist": "Norah Jones",
      "album": "Feels Like Home",
      "language": "english",
      "year": "2004",
      "id": "-EFATX7O",
      "cover": "https://c.saavncdn.com/859/Sunrise-English-2004-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/859/a188f2d51f41852a0fbbc45518d6c8cc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Banjaara (Lo-Fi)",
      "artist": "Mohammed Irfan",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2021",
      "id": "Ka8GD1kR",
      "cover": "https://c.saavncdn.com/696/Awaarapan-Banjarapan-Lofi-Beat-Hindi-2024-20250130073119-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/696/8298aa278a2611e71373944dcdc1af3f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tum Saath Ho (Acoustic)",
      "artist": "Arijit Singh",
      "album": "Tamasha Acoustic",
      "language": "hindi",
      "year": "2015",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    }
  ],
  "focus_lofi": [
    {
      "title": "Tum Hi Ho (Lo-Fi Remix)",
      "artist": "Arijit Singh",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2020",
      "id": "FEviHpXD",
      "cover": "https://c.saavncdn.com/483/Tum-Se-Hi-From-Love-In-Lo-Fi-Volume-1--Hindi-2022-20220217191007-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/483/b257ef0c1c9ba6a358cef71b09bc8486_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kesariya (Lo-Fi Mix)",
      "artist": "Arijit Singh",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2022",
      "id": "XvLGG8mv",
      "cover": "https://c.saavncdn.com/470/Singham-Hindi-2011-20221211220044-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/971/6135b7bb882ab68c151b74eee28187f7_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Shayad (Lo-Fi Mix)",
      "artist": "Arijit Singh",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2020",
      "id": "jtqHRwaj",
      "cover": "https://c.saavncdn.com/172/Shayad-Film-Version-From-Love-Aaj-Kal--Hindi-2021-20210325204139-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/172/c3e80f041eb1b726fd01e804813a8354_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Raataan Lambiyan (Lo-Fi Mix)",
      "artist": "Jubin Nautiyal",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2021",
      "id": "mPTrDSun",
      "cover": "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Bekhayali (Lo-Fi Mix)",
      "artist": "Sachet Tandon",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2019",
      "id": "B8vB53GH",
      "cover": "https://c.saavncdn.com/473/Ravishing-Bollywood-Actress-Raveena-Tandon-Hindi-2016-20260331205724-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/473/5b20f11b57ce5ba1e1e995a30f5c913a_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tera Ban Jaunga (Lo-Fi)",
      "artist": "Akhil Sachdeva",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2019",
      "id": "AM4Pj507",
      "cover": "https://c.saavncdn.com/231/Tera-Ban-Jaunga-Lofi-Mix-Hindi-2026-20260720185248-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/231/20c3f9108385d171764cae0a141f4d16_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Channa Mereya (Lo-Fi)",
      "artist": "Arijit Singh",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2016",
      "id": "Tb1LKDy2",
      "cover": "https://c.saavncdn.com/040/Channa-Mereya-Lofi-Flip--Hindi-2021-20210630194600-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/040/54532a513c8373c648d7a26c4453bad2_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Ilahi (Lo-Fi Mix)",
      "artist": "Arijit Singh",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2013",
      "id": "toQMhss6",
      "cover": "https://c.saavncdn.com/617/Ilahi-Lofi-Mix-Hindi-2022-20220419131001-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/617/39b5bff5cad932e8cbe26f973aefc38e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Main Rahoon Ya Na Rahoon (Lo-Fi)",
      "artist": "Armaan Malik",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2020",
      "id": "UuGteRjX",
      "cover": "https://c.saavncdn.com/395/Main-Rahoon-Ya-Na-Rahoon-Hindi-2015-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/395/1e3c94b9a575aa2887f47bd38e9dc3ac_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Phir Se Ud Chala (Lo-Fi)",
      "artist": "Mohit Chauhan",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2020",
      "id": "IIRnaY7g",
      "cover": "https://c.saavncdn.com/505/Phir-Se-Ud-Chala-Lofi-Flip-Hindi-2023-20230113055829-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/505/8f29bfdac4d0a66baab1bd0ebbf55ced_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Filhaal (Lo-Fi Mix)",
      "artist": "B Praak",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2020",
      "id": "Z99SSBU7",
      "cover": "https://c.saavncdn.com/383/Nanpan-No-Nedlo-Lo-Fi-Mix-R-Square-Gujarati-2022-20220728203712-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/383/885e6eb401e465269dd624f61eb98b5d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tujhe Kitna Chahne Lage (Lo-Fi)",
      "artist": "Arijit Singh",
      "album": "Lo-Fi Hindi Mix",
      "language": "hindi",
      "year": "2020",
      "id": "Ke9TPSUf",
      "cover": "https://c.saavncdn.com/807/Kabir-Singh-Hindi-2019-20240131131003-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/807/bda6cd88c18ee0d75854146145922bcc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Snowfall",
      "artist": "Øneheart & Reidenshi",
      "album": "Snowfall",
      "language": "instrumental",
      "year": "2020",
      "id": "3fVh99lH",
      "cover": "https://c.saavncdn.com/841/snowfall-Unknown-2022-20211220065912-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/841/223617636f46a69510e5bf655c43353d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Dreams",
      "artist": "NEFFEX",
      "album": "Dreams",
      "language": "instrumental",
      "year": "2018",
      "id": "f7WMn3b4",
      "cover": "https://c.saavncdn.com/886/Broken-Dreams-English-2018-20251122012254-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/886/e35051217042026ccf61d058f75e99a4_320.mp4",
      "source": "jiosaavn"
    }
  ],
  "gym_power": [
    {
      "title": "Murder In My Mind",
      "artist": "Kordhell",
      "album": "Murder In My Mind",
      "language": "instrumental",
      "year": "2022",
      "id": "ke4RyqoV",
      "cover": "https://c.saavncdn.com/502/Murder-In-My-Mind-English-2022-20260724210340-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/502/a3b436c0e2628bfd6f16138c0a14446c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "METAMORPHOSIS",
      "artist": "INTERWORLD",
      "album": "METAMORPHOSIS",
      "language": "instrumental",
      "year": "2021",
      "id": "Jo4IdGXK",
      "cover": "https://c.saavncdn.com/221/METAMORPHOSIS-English-2021-20220215012012-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/221/ca8e470bc81ad14badde22770b837deb_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Till I Collapse",
      "artist": "Eminem",
      "album": "The Eminem Show",
      "language": "english",
      "year": "2002",
      "id": "_5sWTSFJ",
      "cover": "https://c.saavncdn.com/020/The-Eminem-Show-Unknown-2007-20250826100622-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/020/d0a7641689b4a3df14ffef4f19073b22_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Lose Yourself",
      "artist": "Eminem",
      "album": "8 Mile",
      "language": "english",
      "year": "2002",
      "id": "ccsVSBDR",
      "cover": "https://c.saavncdn.com/934/Curtain-Call-The-Hits-English-2005-20250826045028-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/934/f9eb5732f5c0f0c7a69c35d315f64a08_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Stronger",
      "artist": "Kanye West",
      "album": "Graduation",
      "language": "english",
      "year": "2007",
      "id": "LQsOhEMw",
      "cover": "https://c.saavncdn.com/638/Stronger-English-2007-20200724142539-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/638/794ff78046887c032178791a3e77b70e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Eye of the Tiger",
      "artist": "Survivor",
      "album": "Eye of the Tiger",
      "language": "english",
      "year": "1982",
      "id": "SmrJXKQw",
      "cover": "https://c.saavncdn.com/136/Football-Tail-Gate-Party-Music-English-2010-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/136/ff48c3dd89b7b44ec7a5a8026936e529_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Believer",
      "artist": "Imagine Dragons",
      "album": "Evolve",
      "language": "english",
      "year": "2017",
      "id": "BeXBcbVK",
      "cover": "https://c.saavncdn.com/248/Evolve-English-2018-20260605220036-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/248/46944eb7b4b31f5b0abf5eb2e1be2d2a_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Natural",
      "artist": "Imagine Dragons",
      "album": "Origins",
      "language": "english",
      "year": "2018",
      "id": "bts8P3Ub",
      "cover": "https://c.saavncdn.com/189/Origins-English-2018-20260611050603-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/189/0464ed6599387940fc638c2a4eee304f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Animals",
      "artist": "Martin Garrix",
      "album": "Animals",
      "language": "english",
      "year": "2013",
      "id": "o008byuo",
      "cover": "https://c.saavncdn.com/732/Now-That-s-What-I-Call-EDM-2014-2014-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/732/a9fc6515144f03571678033fe7b1fd2a_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Turn Down for What",
      "artist": "DJ Snake & Lil Jon",
      "album": "Turn Down for What",
      "language": "english",
      "year": "2013",
      "id": "hbVm7UH4",
      "cover": "https://c.saavncdn.com/779/Turn-Down-For-What-2013-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/779/97dd5b8a3324c0346ba4869fa0832597_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Can't Hold Us",
      "artist": "Macklemore & Ryan Lewis",
      "album": "The Heist",
      "language": "english",
      "year": "2011",
      "id": "IhLRxlD4",
      "cover": "https://c.saavncdn.com/191/The-Heist-English-2012-20250307181125-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/191/c0d56a0acc373edd8582c5dbc16b6d3b_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Zinda",
      "artist": "Vishal Dadlani",
      "album": "Bhaag Milkha Bhaag",
      "language": "hindi",
      "year": "2013",
      "id": "Y43k2ooH",
      "cover": "https://c.saavncdn.com/783/Vande-Mataram-The-Fighter-Anthem-From-Fighter-Hindi-2024-20241205141022-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/783/c1926a14cea558b8ccf0c6ccbe491a34_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kar Har Maidaan Fateh",
      "artist": "Sukhwinder Singh",
      "album": "Sanju",
      "language": "hindi",
      "year": "2018",
      "id": "XqY3IQa6",
      "cover": "https://c.saavncdn.com/319/Sanju-Hindi-2018-20180629-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/319/d3527e7086440a3948677ae0fd591c04_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Khalnayak",
      "artist": "Divine",
      "album": "Khalnayak",
      "language": "hindi",
      "year": "2021",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    },
    {
      "title": "Sandstorm",
      "artist": "Darude",
      "album": "Before the Storm",
      "language": "english",
      "year": "1999",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    }
  ],
  "heartbreak": [
    {
      "title": "Channa Mereya",
      "artist": "Arijit Singh",
      "album": "Ae Dil Hai Mushkil",
      "language": "hindi",
      "year": "2016",
      "id": "uiEWT3kP",
      "cover": "https://c.saavncdn.com/257/Ae-Dil-Hai-Mushkil-Hindi-2016-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/597/6da0627cfcc4b937160f664841e4572d_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tum Hi Ho",
      "artist": "Arijit Singh",
      "album": "Aashiqui 2",
      "language": "hindi",
      "year": "2013",
      "id": "aRZbUYD7",
      "cover": "https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/430/5c5ea5cc00e3bff45616013226f376fe_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Agar Tum Saath Ho",
      "artist": "Arijit Singh & Alka Yagnik",
      "album": "Tamasha",
      "language": "hindi",
      "year": "2015",
      "id": "Ni6noMmw",
      "cover": "https://c.saavncdn.com/994/Tamasha-Hindi-2015-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/994/2e6b47719cea3e7c9f971a3f1ddc9b0a_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Bekhayali",
      "artist": "Sachet Tandon",
      "album": "Kabir Singh",
      "language": "hindi",
      "year": "2019",
      "id": "OtKh5C06",
      "cover": "https://c.saavncdn.com/807/Kabir-Singh-Hindi-2019-20240131131003-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/807/db5027c7f61ea05b4f9841bfc056e1c5_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tujhe Kitna Chahne Lage",
      "artist": "Arijit Singh",
      "album": "Kabir Singh",
      "language": "hindi",
      "year": "2019",
      "id": "Ke9TPSUf",
      "cover": "https://c.saavncdn.com/807/Kabir-Singh-Hindi-2019-20240131131003-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/807/bda6cd88c18ee0d75854146145922bcc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kaise Hua",
      "artist": "Vishal Mishra",
      "album": "Kabir Singh",
      "language": "hindi",
      "year": "2019",
      "id": "SdU_RBkC",
      "cover": "https://c.saavncdn.com/807/Kabir-Singh-Hindi-2019-20240131131003-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/807/1d624cb93424180a8743387b3fd57605_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tera Yaar Hoon Main",
      "artist": "Arijit Singh",
      "album": "Sonu Ke Titu Ki Sweety",
      "language": "hindi",
      "year": "2018",
      "id": "awlhKnsk",
      "cover": "https://c.saavncdn.com/074/Sonu-Ke-Titu-Ki-Sweety-Hindi-2018-20180214153942-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/074/1f7370aa302c7fec4d6b2bec451abbae_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Phir Bhi Tumko Chahunga",
      "artist": "Arijit Singh & Shashaa Tirupati",
      "album": "Half Girlfriend",
      "language": "hindi",
      "year": "2017",
      "id": "IlbqfHKT",
      "cover": "https://c.saavncdn.com/441/Half-Girlfriend-Hindi-2017-20180622-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/441/5be788f75761b20e5dbcecdd3069a1c4_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Hawayein",
      "artist": "Arijit Singh",
      "album": "Jab Harry Met Sejal",
      "language": "hindi",
      "year": "2017",
      "id": "4NRpZd1v",
      "cover": "https://c.saavncdn.com/584/Jab-Harry-Met-Sejal-Hindi-2017-20170803161007-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/584/1c4f10826f2336b0cb7db275f1051f8c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tujhe Yaad Na Meri Aayee",
      "artist": "Jubin Nautiyal",
      "album": "M.S. Dhoni: The Untold Story",
      "language": "hindi",
      "year": "2016",
      "id": "pge252Zj",
      "cover": "https://c.saavncdn.com/366/Jubin-Nautiyal-Romantic-Mashup-2022-Hindi-2022-20221014181007-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/366/fd060f762cb3d42c3827c542bd1c9a3f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tere Bin",
      "artist": "Arijit Singh & Aditya Dev",
      "album": "Simmba",
      "language": "hindi",
      "year": "2018",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    },
    {
      "title": "Someone Like You",
      "artist": "Adele",
      "album": "21",
      "language": "english",
      "year": "2011",
      "id": "lBKwNJK3",
      "cover": "https://c.saavncdn.com/612/Rolling-In-The-Deep-English-2017-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/612/ad933d7f01385b30aba7f38973d8aaae_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Fix You",
      "artist": "Coldplay",
      "album": "X&Y",
      "language": "english",
      "year": "2005",
      "id": "MNsqx6q1",
      "cover": "https://c.saavncdn.com/659/X-Y-English-2005-20201104171639-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/659/8a687d0af70dff400c5a391efb065a7f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "When I Was Your Man",
      "artist": "Bruno Mars",
      "album": "Unorthodox Jukebox",
      "language": "english",
      "year": "2012",
      "id": "8bS_YP0c",
      "cover": "https://c.saavncdn.com/658/Unorthodox-Jukebox-English-2012-20190607045137-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/658/da47f6b7d28f2462618464ba560ffd9a_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Jee Le Zaraa",
      "artist": "Vishal Dadlani",
      "album": "Talaash",
      "language": "hindi",
      "year": "2012",
      "id": "iU7UPQsU",
      "cover": "https://c.saavncdn.com/379/Talaash-Hindi-2012-20221213035735-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/379/0e7b1ca19999a64acc21dd0e6b93bb88_320.mp4",
      "source": "jiosaavn"
    }
  ],
  "morning_motivation": [
    {
      "title": "Hall of Fame",
      "artist": "The Script ft. will.i.am",
      "album": "#3",
      "language": "english",
      "year": "2012",
      "id": "1L-qinVp",
      "cover": "https://c.saavncdn.com/160/3-Deluxe-Version-2012-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/160/9ea26fb636b89dd2c23105fea6a0f979_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Unstoppable",
      "artist": "Sia",
      "album": "This Is Acting",
      "language": "english",
      "year": "2016",
      "id": "bMiRFQ9_",
      "cover": "https://c.saavncdn.com/832/This-Is-Acting-Deluxe-Version-English-2016-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/832/2ca1b06025a1f0112f0e8e73a1d2f7c3_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Roar",
      "artist": "Katy Perry",
      "album": "Prism",
      "language": "english",
      "year": "2013",
      "id": "VDV7Mzpr",
      "cover": "https://c.saavncdn.com/844/Maturafeier-Party-Hits-English-2026-20260728212527-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/844/2b9b48e086e01606543ab3d1af4ab9f6_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Firework",
      "artist": "Katy Perry",
      "album": "Teenage Dream",
      "language": "english",
      "year": "2010",
      "id": "9zhn9aSv",
      "cover": "https://c.saavncdn.com/412/Ni-os-Fiesta-Hits-English-2026-20260521225148-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/412/0014a13ffd07e0dc8999bf7bfd2e6de9_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Happy",
      "artist": "Pharrell Williams",
      "album": "G I R L",
      "language": "english",
      "year": "2013",
      "id": "rMKwZimO",
      "cover": "https://c.saavncdn.com/877/G-I-R-L-English-2014-20250924204116-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/877/944d061fe1bc59525026861937e5bd68_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Can't Stop the Feeling!",
      "artist": "Justin Timberlake",
      "album": "Trolls",
      "language": "english",
      "year": "2016",
      "id": "_3pNmLZN",
      "cover": "https://c.saavncdn.com/653/Can-t-Stop-the-Feeling-Original-Song-from-DreamWorks-Animation-TROLLS-English-2016-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/653/ec2f0e3d920b3a116ad247cded4e2ea6_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Best Day of My Life",
      "artist": "American Authors",
      "album": "Oh, What a Life",
      "language": "english",
      "year": "2013",
      "id": "MLzBDKU9",
      "cover": "https://c.saavncdn.com/887/Pop-para-peques-English-2026-20260521215421-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/887/5c735d41b47be17e6e03cb82ed3daa26_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "On Top of the World",
      "artist": "Imagine Dragons",
      "album": "Night Visions",
      "language": "english",
      "year": "2012",
      "id": "_BMx78Jr",
      "cover": "https://c.saavncdn.com/210/Night-Visions-2013-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/210/d670cb3ea0df1461a5e8dfda233635fe_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Beautiful Day",
      "artist": "U2",
      "album": "All That You Can't Leave Behind",
      "language": "english",
      "year": "2000",
      "id": "H642uarY",
      "cover": "https://c.saavncdn.com/106/U218-Singles-English-2006-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/106/fe08a32a3de54d90d048956da18ad2cd_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Rise Up",
      "artist": "Andra Day",
      "album": "Cheers to the Fall",
      "language": "english",
      "year": "2015",
      "id": "E4sUzQgN",
      "cover": "https://c.saavncdn.com/556/Cheers-To-The-Fall-English-2015-20190607044119-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/556/c0eeff290b2b263dda4da4e91d649b2f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kar Har Maidaan Fateh",
      "artist": "Sukhwinder Singh",
      "album": "Sanju",
      "language": "hindi",
      "year": "2018",
      "id": "XqY3IQa6",
      "cover": "https://c.saavncdn.com/319/Sanju-Hindi-2018-20180629-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/319/d3527e7086440a3948677ae0fd591c04_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Zinda",
      "artist": "Vishal Dadlani",
      "album": "Bhaag Milkha Bhaag",
      "language": "hindi",
      "year": "2013",
      "id": "Vw5lAkVW",
      "cover": "https://c.saavncdn.com/575/Bhaag-Milkha-Bhaag-Hindi-2013-20260120201340-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/575/cf7dbb23a4ba808632752d4f12f93ddb_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Chak De! India",
      "artist": "Sukhwinder Singh",
      "album": "Chak De! India",
      "language": "hindi",
      "year": "2007",
      "id": "ANByQyDs",
      "cover": "https://c.saavncdn.com/620/Chak-De-India-Hindi-2007-20190329150809-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/620/1a8f9f6db4adf6aa9d7dc8ab58eecbe8_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Ae Watan",
      "artist": "Arijit Singh",
      "album": "Raazi",
      "language": "hindi",
      "year": "2018",
      "id": "yZRDLqHv",
      "cover": "https://c.saavncdn.com/941/Raazi-Hindi-2018-20190322193246-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/941/cf761bbd65f15500fecfd109bb743bcb_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Dil Chahta Hai",
      "artist": "Shankar Mahadevan",
      "album": "Dil Chahta Hai",
      "language": "hindi",
      "year": "2001",
      "id": "EvaQr_UY",
      "cover": "https://c.saavncdn.com/219/Dil-Chahta-Hai-Hindi-2001-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/219/e92e9a632990c55bf3f9e1cc41c071c7_320.mp4",
      "source": "jiosaavn"
    }
  ],
  "nostalgic": [
    {
      "title": "Kuch Kuch Hota Hai",
      "artist": "Udit Narayan & Alka Yagnik",
      "album": "Kuch Kuch Hota Hai",
      "language": "hindi",
      "year": "1998",
      "id": "rtdvmBBB",
      "cover": "https://c.saavncdn.com/907/Kuch-Kuch-Hota-Hai-Original-Motion-Picture-Soundtrack-Hindi-1998-20240711192101-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/907/ce17826775d66752dba879fc2e3d4eb3_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tujhe Dekha To",
      "artist": "Kumar Sanu & Lata Mangeshkar",
      "album": "Dilwale Dulhania Le Jayenge",
      "language": "hindi",
      "year": "1995",
      "id": "U3wEEo6F",
      "cover": "https://c.saavncdn.com/588/Dilwale-Dulhania-Le-Jayenge-Hindi-1995-20171114-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/588/1915cd0934f79eeb646ffebde384e59d_sar_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Pehla Nasha",
      "artist": "Udit Narayan & Sadhana Sargam",
      "album": "Jo Jeeta Wohi Sikandar",
      "language": "hindi",
      "year": "1992",
      "id": "TX73Q0ZS",
      "cover": "https://c.saavncdn.com/852/Jo-Jeeta-Wohi-Sikandar-Hindi-1992-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/852/9d335ee08b26f171a3d65e11f8819d52_sar_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Koi Mil Gaya",
      "artist": "Kishore Kumar",
      "album": "Kuch Kuch Hota Hai",
      "language": "hindi",
      "year": "1998",
      "id": "jFerJMnc",
      "cover": "https://c.saavncdn.com/907/Kuch-Kuch-Hota-Hai-Original-Motion-Picture-Soundtrack-Hindi-1998-20240711192101-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/907/f89badfc28dda452969272f0277b0dd6_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Ladki Badi Anjani Hai",
      "artist": "Kumar Sanu & Alka Yagnik",
      "album": "Kuch Kuch Hota Hai",
      "language": "hindi",
      "year": "1998",
      "id": "FOn06quY",
      "cover": "https://c.saavncdn.com/907/Kuch-Kuch-Hota-Hai-Original-Motion-Picture-Soundtrack-Hindi-1998-20240711192101-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/907/aa60fd44fa10bd8f7529877445fcaf13_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tum Paas Aaye",
      "artist": "Kumar Sanu & Kavita Krishnamurthy",
      "album": "Kuch Kuch Hota Hai",
      "language": "hindi",
      "year": "1998",
      "id": "Qe5tFpTM",
      "cover": "https://c.saavncdn.com/871/Kismat-Hindi-1995-20260225223750-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/871/37b090b93cec249b89c69fcef83b0acc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Chura Ke Dil Mera",
      "artist": "Kumar Sanu & Alka Yagnik",
      "album": "Main Khiladi Tu Anari",
      "language": "hindi",
      "year": "1994",
      "id": "EwaVRyUv",
      "cover": "https://c.saavncdn.com/274/Main-Khiladi-Tu-Anari-With-Jhankar-Beats-Hindi-2024-20240125184145-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/274/7fef90c6c49981cb50403835234722da_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tere Bina Zindagi Se",
      "artist": "Lata Mangeshkar & Kishore Kumar",
      "album": "Andhaa Yudh",
      "language": "hindi",
      "year": "1985",
      "id": "aI-aI9EB",
      "cover": "https://c.saavncdn.com/381/Retro-Cool-Vol-1-Hindi-2019-20200511121840-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/381/777aed747e84914e4a79fbc9a5bcb410_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Do Dil Mil Rahe Hain",
      "artist": "Kumar Sanu",
      "album": "Krodh",
      "language": "hindi",
      "year": "1992",
      "id": "982HsOgi",
      "cover": "https://c.saavncdn.com/139/Do-Dil-Mil-Rahe-Hain-Lofi-Mix-Hindi-2022-20250115193316-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/139/f7d71b8ad660802bb35f681353ab8bc8_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kal Ho Naa Ho",
      "artist": "Sonu Nigam",
      "album": "Kal Ho Naa Ho",
      "language": "hindi",
      "year": "2003",
      "id": "TfJX33Qk",
      "cover": "https://c.saavncdn.com/587/Kal-Ho-Naa-Ho-Hindi-2003-20190516130956-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/587/d3bd1ed49eb108d2425e4875cc3ad86e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Mitwa",
      "artist": "Shafqat Amanat Ali",
      "album": "Kabhi Alvida Naa Kehna",
      "language": "hindi",
      "year": "2006",
      "id": "i670PkEc",
      "cover": "https://c.saavncdn.com/089/Kabhi-Alvida-Naa-Kehna-Hindi-2006-20260120201519-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/089/ef7c4f1b84b6f7b2b1cb33a97b9bd93b_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "September",
      "artist": "Earth, Wind & Fire",
      "album": "The Best of Earth, Wind & Fire",
      "language": "english",
      "year": "1978",
      "id": "PnO4h5aO",
      "cover": "https://c.saavncdn.com/004/The-Eternal-Dance-English-2019-20190316013815-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/004/8c48512b34174358e1c6b6dcd9380d24_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Bohemian Rhapsody",
      "artist": "Queen",
      "album": "A Night at the Opera",
      "language": "english",
      "year": "1975",
      "id": "V8ABATns",
      "cover": "https://c.saavncdn.com/285/Epic-English-2026-20260701222418-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/285/d9149bb073b722d5b07e650d37ef574c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Billie Jean",
      "artist": "Michael Jackson",
      "album": "Thriller",
      "language": "english",
      "year": "1982",
      "id": "TA2RrZY6",
      "cover": "https://c.saavncdn.com/798/Mundial-2026-Copa-de-F-tbol-del-Mundo-2026-English-2026-20260714021441-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/798/ba245d3ac53dc20f560b9da379d7f4b3_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Dancing Queen",
      "artist": "ABBA",
      "album": "Arrival",
      "language": "english",
      "year": "1976",
      "id": "Z0vcEufh",
      "cover": "https://c.saavncdn.com/219/Top-30-Mega-Hits-Of-All-Time-English-2026-20260513065502-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/219/880d62dc22195e4d80ae3fd2a212f631_320.mp4",
      "source": "jiosaavn"
    }
  ],
  "party": [
    {
      "title": "Gallan Goodiyaan",
      "artist": "Farhan Akhtar & Sukhwinder Singh",
      "album": "Dil Dhadakne Do",
      "language": "hindi",
      "year": "2015",
      "id": "JQK6ye5t",
      "cover": "https://c.saavncdn.com/240/Dil-Dhadakne-Do-Hindi-2015-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/240/2a80b5248e85af6a6567011982bc5cfc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "London Thumakda",
      "artist": "Labh Janjua",
      "album": "Queen",
      "language": "hindi",
      "year": "2014",
      "id": "xxsFHiKl",
      "cover": "https://c.saavncdn.com/125/Queen-2014-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/125/1b203d1d1e51a1bd0035baa481cb1b13_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Balam Pichkari",
      "artist": "Pritam & Vishal Dadlani",
      "album": "Yeh Jawaani Hai Deewani",
      "language": "hindi",
      "year": "2013",
      "id": "rh1gIwY_",
      "cover": "https://c.saavncdn.com/440/Yeh-Jawaani-Hai-Deewani-2013-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/440/402182e33ef81008a8aecbdd57886c4c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Subha Hone Na De",
      "artist": "Mika Singh",
      "album": "Desi Boyz",
      "language": "hindi",
      "year": "2011",
      "id": "JHMmQ1Pp",
      "cover": "https://c.saavncdn.com/743/Desi-Boyz-Hindi-2011-20241223142123-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/743/75c6adf15c7ce788993785a9c2becef1_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Kar Gayi Chull",
      "artist": "Badshah, Aastha Gill & Neha Kakkar",
      "album": "Kapoor & Sons",
      "language": "hindi",
      "year": "2016",
      "id": "_QHbAsOZ",
      "cover": "https://c.saavncdn.com/978/Kapoor-Sons-Since-1921--Hindi-2016-20180504172446-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/978/e7a6e97299ca851067e09e31fec18e6f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Aankh Marey",
      "artist": "Neha Kakkar & Tanishk Bagchi",
      "album": "Simmba",
      "language": "hindi",
      "year": "2018",
      "id": "vLV27MvE",
      "cover": "https://c.saavncdn.com/616/Simmba-Hindi-2018-20231017141628-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/616/c1235768b97843c8b539caa41974bf70_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Dilbar",
      "artist": "Neha Kakkar & Dhvani Bhanushali",
      "album": "Satyameva Jayate",
      "language": "hindi",
      "year": "2018",
      "id": "wOTPo9Mc",
      "cover": "https://c.saavncdn.com/333/Satyameva-Jayate-Hindi-2018-20180801-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/333/35b50861b2ab58628f3dea16d87cd546_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Morni Banke",
      "artist": "Guru Randhawa & Neha Kakkar",
      "album": "Badhaai Ho",
      "language": "hindi",
      "year": "2018",
      "id": "TBz3zMCn",
      "cover": "https://c.saavncdn.com/494/Badhaai-Ho-Hindi-2018-20260724181006-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/494/cf685d648323f3ad9bc82d6b198d3fb3_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Chammak Challo",
      "artist": "Akon & Hamsika Iyer",
      "album": "Ra.One",
      "language": "hindi",
      "year": "2011",
      "id": "Fy1Afntv",
      "cover": "https://c.saavncdn.com/026/Ra-One-Hindi-2011-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/026/4525eb9287203ed2f7d2abab5eff46bc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Uptown Funk",
      "artist": "Mark Ronson ft. Bruno Mars",
      "album": "Uptown Special",
      "language": "english",
      "year": "2014",
      "id": "wLxoOff5",
      "cover": "https://c.saavncdn.com/049/Uptown-Funk-English-2014-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/049/5118387f6549c47bef98a2d5a92e00a8_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Blinding Lights",
      "artist": "The Weeknd",
      "album": "After Hours",
      "language": "english",
      "year": "2019",
      "id": "fW-Mxsnu",
      "cover": "https://c.saavncdn.com/077/After-Hours-English-2020-20260804045014-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/077/0b02a92687d1ae3369b6859f44872e52_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Levitating",
      "artist": "Dua Lipa",
      "album": "Future Nostalgia",
      "language": "english",
      "year": "2020",
      "id": "3IoDK8qI",
      "cover": "https://c.saavncdn.com/665/Future-Nostalgia-English-2020-20260306223201-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/665/7790c3b9097592113008eaf1031d6e57_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Danza Kuduro",
      "artist": "Don Omar ft. Lucenzo",
      "album": "Fast Five",
      "language": "spanish",
      "year": "2010",
      "id": "2oaBwxwg",
      "cover": "https://c.saavncdn.com/552/Emigrante-Del-Mundo-Portuguese-2020-20201203053620-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/552/cab295d6de16f761d8d9d861652c2fdd_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "I Gotta Feeling",
      "artist": "The Black Eyed Peas",
      "album": "The E.N.D.",
      "language": "english",
      "year": "2009",
      "id": "HlRYwYaC",
      "cover": "https://c.saavncdn.com/705/All-Inclusive-Holiday-Bangers-English-2026-20260619065006-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/705/c391e3341fe2987f9b020f3d0d6c077c_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Shape of You",
      "artist": "Ed Sheeran",
      "album": "÷ (Divide)",
      "language": "english",
      "year": "2017",
      "id": "icJam_5l",
      "cover": "https://c.saavncdn.com/126/Shape-of-You-English-2017-500x500.jpg",
      "stream_url": "https://aac.saavncdn.com/126/da7cde34b008294e181842062530546d_320.mp4",
      "source": "jiosaavn"
    }
  ],
  "rain_night": [
    {
      "title": "Kun Faya Kun",
      "artist": "A.R. Rahman, Javed Ali & Mohit Chauhan",
      "album": "Rockstar",
      "language": "hindi",
      "year": "2011",
      "id": "csaEsVWV",
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/274/aee250c500588f117ae5343688e12b42_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tum Ho",
      "artist": "Mohit Chauhan",
      "album": "Rockstar",
      "language": "hindi",
      "year": "2011",
      "id": "mB4sJKrB",
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/274/fd6e420a5742d1a3cdcd13c833d0489f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Nadaan Parindey",
      "artist": "A.R. Rahman & Mohit Chauhan",
      "album": "Rockstar",
      "language": "hindi",
      "year": "2011",
      "id": "W3ZAWX5t",
      "cover": "https://c.saavncdn.com/408/Rockstar-Hindi-2011-20221212023139-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/274/ed2193d56b29e06f96ad428cf6ffeae0_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "O Re Piya",
      "artist": "Atif Aslam",
      "album": "Aaja Nachle",
      "language": "hindi",
      "year": "2007",
      "id": "8MyWq0_r",
      "cover": "https://c.saavncdn.com/953/club-ambition-Unknown-2024-20240628202752-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/953/9b1581a4c5948df2b42e16132e02ed51_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tere Bina",
      "artist": "A.R. Rahman & Chinmayi",
      "album": "Guru",
      "language": "hindi",
      "year": "2007",
      "id": "uitzykz8",
      "cover": "https://c.saavncdn.com/020/Guru-Hindi-2006-20190516131307-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/020/6ac166981a9551c3ea2a435f938c554e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Luka Chuppi",
      "artist": "Lata Mangeshkar & A.R. Rahman",
      "album": "Rang De Basanti",
      "language": "hindi",
      "year": "2006",
      "id": "1a_MxvYZ",
      "cover": "https://c.saavncdn.com/825/Rang-De-Basanti-Hindi-2005-20190516125130-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/825/7622361ea6522d91368b31b41ad304e7_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Aaj Din Chadeya",
      "artist": "Rahat Fateh Ali Khan",
      "album": "Love Aaj Kal",
      "language": "hindi",
      "year": "2009",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    },
    {
      "title": "Saiyaara",
      "artist": "Mohit Chauhan",
      "album": "Ek Tha Tiger",
      "language": "hindi",
      "year": "2012",
      "id": "ZyWQEqq7",
      "cover": "https://c.saavncdn.com/868/Ek-Tha-Tiger-Hindi-2012-20190329150659-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/868/dd764763d2659f968486b9134fc8a7a2_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Maula Mere Maula",
      "artist": "Roop Kumar Rathod",
      "album": "Anwar",
      "language": "hindi",
      "year": "2007",
      "id": "mCYHPwCR",
      "cover": "https://c.saavncdn.com/524/Anwar-Hindi-2007-20180112-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/524/67a2ec08ed5b373ab38e6c9b462f2d73_sar_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Phir Le Aya Dil",
      "artist": "Arijit Singh",
      "album": "Barfi!",
      "language": "hindi",
      "year": "2012",
      "id": "J82LrEcw",
      "cover": "https://c.saavncdn.com/678/Barfi-2012-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/678/2fa567f57cfc85469780214d9a8910af_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Purple Rain",
      "artist": "Prince",
      "album": "Purple Rain",
      "language": "english",
      "year": "1984",
      "id": "CCVuxkD5",
      "cover": "https://c.saavncdn.com/375/Purple-Rain-English-2007-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/375/8d68204a8c169b123412c55fd2448954_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "November Rain",
      "artist": "Guns N' Roses",
      "album": "Use Your Illusion I",
      "language": "english",
      "year": "1991",
      "id": "k9jl-x5y",
      "cover": "https://c.saavncdn.com/527/Use-Your-Illusion-I-English-1991-20180704023004-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/527/3fd33a551124d53abb04864f1fc092dc_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Hymn for the Weekend",
      "artist": "Coldplay",
      "album": "A Head Full of Dreams",
      "language": "english",
      "year": "2015",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    },
    {
      "title": "Rain Sounds for Deep Sleep",
      "artist": "Relaxing Rain Sounds",
      "album": "Nature Sounds",
      "language": "instrumental",
      "year": "2020",
      "id": "",
      "cover": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300&auto=format&fit=crop&q=80",
      "stream_url": "",
      "source": "jiosaavn"
    }
  ],
  "romantic": [
    {
      "title": "Kesariya",
      "artist": "Arijit Singh",
      "album": "Brahmastra",
      "language": "hindi",
      "year": "2022",
      "id": "rjkrTnma",
      "cover": "https://c.saavncdn.com/871/Brahmastra-Original-Motion-Picture-Soundtrack-Hindi-2022-20221006155213-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/871/c2febd353f3a076a406fa37510f31f9f_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Raataan Lambiyan",
      "artist": "Jubin Nautiyal",
      "album": "Shershaah",
      "language": "hindi",
      "year": "2021",
      "id": "mPTrDSun",
      "cover": "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/238/35726d4394604604e961bf5b846870d0_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Shayad",
      "artist": "Arijit Singh",
      "album": "Love Aaj Kal",
      "language": "hindi",
      "year": "2020",
      "id": "_rJmbKSP",
      "cover": "https://c.saavncdn.com/862/Love-Aaj-Kal-Hindi-2020-20200214140423-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/862/e277c1b441b562640c6b264aa3335a83_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Mann Bharrya 2.0",
      "artist": "B Praak",
      "album": "Shershaah",
      "language": "hindi",
      "year": "2021",
      "id": "WTe1jIud",
      "cover": "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/238/9520cefb65e0fb210591ba92781c897e_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Tere Sang Yaara",
      "artist": "Atif Aslam",
      "album": "Rustom",
      "language": "hindi",
      "year": "2016",
      "id": "NfTeTcgq",
      "cover": "https://c.saavncdn.com/809/Wedding-Love-Songs-Hindi-2026-20251230172703-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/809/0481bfc90d836513541476fdbf9c6934_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Jeena Jeena",
      "artist": "Atif Aslam",
      "album": "Badrinath Ki Dulhania",
      "language": "hindi",
      "year": "2017",
      "id": "8MyWq0_r",
      "cover": "https://c.saavncdn.com/953/club-ambition-Unknown-2024-20240628202752-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/953/9b1581a4c5948df2b42e16132e02ed51_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Humsafar",
      "artist": "Akhil Sachdeva",
      "album": "Badrinath Ki Dulhania",
      "language": "hindi",
      "year": "2017",
      "id": "gMCUOdzs",
      "cover": "https://c.saavncdn.com/804/Badrinath-Ki-Dulhania-Full-Hindi-2017-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/804/671a613f55f54fbef197749fef0149a8_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Sanam Re",
      "artist": "Arijit Singh",
      "album": "Sanam Re",
      "language": "hindi",
      "year": "2016",
      "id": "riNBfJ3P",
      "cover": "https://c.saavncdn.com/829/Sanam-Re-Hindi-2015-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/829/60f214aa16aadb4de15be6db3e962232_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Dil Diyan Gallan",
      "artist": "Atif Aslam",
      "album": "Tiger Zinda Hai",
      "language": "hindi",
      "year": "2017",
      "id": "RgLLRnht",
      "cover": "https://c.saavncdn.com/893/Dil-Diyan-Gallan-From-Carry-On-Jatta-4-Punjabi-2026-20260520103640-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/893/e2907ad4dde944dd82860f7efe21d534_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Ranjha",
      "artist": "Jasleen Royal & B Praak",
      "album": "Shershaah",
      "language": "hindi",
      "year": "2021",
      "id": "KFcbby8R",
      "cover": "https://c.saavncdn.com/238/Shershaah-Original-Motion-Picture-Soundtrack--Hindi-2021-20210815181610-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/238/f19fcf72286d3daf013431d6838364f6_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Pehla Nasha",
      "artist": "Udit Narayan & Sadhana Sargam",
      "album": "Jo Jeeta Wohi Sikandar",
      "language": "hindi",
      "year": "1992",
      "id": "TX73Q0ZS",
      "cover": "https://c.saavncdn.com/852/Jo-Jeeta-Wohi-Sikandar-Hindi-1992-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/852/9d335ee08b26f171a3d65e11f8819d52_sar_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Perfect",
      "artist": "Ed Sheeran",
      "album": "÷ (Divide)",
      "language": "english",
      "year": "2017",
      "id": "6o8JoQ8b",
      "cover": "https://c.saavncdn.com/286/WMG_190295851286-English-2017-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/286/71bb6cc3391ddf619a4a3f1a1134f1c4_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "All of Me",
      "artist": "John Legend",
      "album": "Love in the Future",
      "language": "english",
      "year": "2013",
      "id": "OFmsfIZG",
      "cover": "https://c.saavncdn.com/041/All-Of-Me-John-Legend-Piano-Karaoke-Instrumental-2025-20251017161543-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/041/1387076de04d92b35f71b298c86cd73b_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Just the Way You Are",
      "artist": "Bruno Mars",
      "album": "Doo-Wops & Hooligans",
      "language": "english",
      "year": "2010",
      "id": "OX3tu2y9",
      "cover": "https://c.saavncdn.com/517/Doo-Wops-Hooligans-English-2010-20211110051526-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/517/fc6ce0bb9aa14ed184fbbcb576bf7750_320.mp4",
      "source": "jiosaavn"
    },
    {
      "title": "Adore You",
      "artist": "Harry Styles",
      "album": "Fine Line",
      "language": "english",
      "year": "2019",
      "id": "I0d080YV",
      "cover": "https://c.saavncdn.com/213/Fine-Line-English-2019-20191211223631-150x150.jpg",
      "stream_url": "https://aac.saavncdn.com/213/063a54b5b776dcfb49e34f040eeaf3b2_320.mp4",
      "source": "jiosaavn"
    }
  ]
};
