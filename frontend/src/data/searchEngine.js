/**
 * searchEngine.js
 * Comprehensive Spotify-style search & prediction engine for Sangeet.
 * Handles:
 * - Singer/Artist top hits and suggestions
 * - Famous lyrics fragment matching (e.g. "dil sambhal ja zara", "kesariya tera ishq")
 * - Genre & Mood discovery pills
 * - Instant typing predictions & autocomplete
 * - Multi-token fuzzy scoring & ranking
 */

export const POPULAR_SINGERS = [
  {
    id: 'arijit_singh',
    name: 'Arijit Singh',
    role: 'Playback Singer & King of Soul',
    avatar: 'https://c.saavncdn.com/artists/Arijit_Singh_002_20240321074712_500x500.jpg',
    gradient: 'from-amber-600/30 to-rose-900/30',
    tags: ['Romantic', 'Heartbreak', 'Acoustic'],
    query: 'Arijit Singh',
  },
  {
    id: 'atif_aslam',
    name: 'Atif Aslam',
    role: 'Vocal Legend & Rock Balladeer',
    avatar: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg',
    gradient: 'from-blue-600/30 to-indigo-900/30',
    tags: ['Soulful', 'Nostalgic', 'Rock'],
    query: 'Atif Aslam',
  },
  {
    id: 'shreya_ghoshal',
    name: 'Shreya Ghoshal',
    role: 'Melody Queen of India',
    avatar: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg',
    gradient: 'from-emerald-600/30 to-teal-900/30',
    tags: ['Classical', 'Romantic', 'Bollywood'],
    query: 'Shreya Ghoshal',
  },
  {
    id: 'diljit_dosanjh',
    name: 'Diljit Dosanjh',
    role: 'Global Punjabi Icon',
    avatar: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg',
    gradient: 'from-orange-600/30 to-red-900/30',
    tags: ['Punjabi Pop', 'Party', 'Bhangra'],
    query: 'Diljit Dosanjh',
  },
  {
    id: 'pritam',
    name: 'Pritam',
    role: 'Chartbuster Maestro',
    avatar: 'https://c.saavncdn.com/artists/Pritam_500x500.jpg',
    gradient: 'from-purple-600/30 to-violet-900/30',
    tags: ['Bollywood Hits', 'Youth Anthems'],
    query: 'Pritam',
  },
  {
    id: 'kishore_kumar',
    name: 'Kishore Kumar',
    role: 'Golden Retro Evergreen',
    avatar: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg',
    gradient: 'from-yellow-600/30 to-amber-900/30',
    tags: ['Retro Classics', 'Evergreen 70s & 80s'],
    query: 'Kishore Kumar',
  },
  {
    id: 'ap_dhillon',
    name: 'AP Dhillon',
    role: 'Brown Munde & Modern Trap',
    avatar: 'https://c.saavncdn.com/artists/AP_Dhillon_500x500.jpg',
    gradient: 'from-zinc-600/30 to-neutral-900/30',
    tags: ['Punjabi Trap', 'Lo-Fi Melodies'],
    query: 'AP Dhillon',
  },
  {
    id: 'kk',
    name: 'KK (Krishnakumar Kunnath)',
    role: 'Voice of Nostalgia & College Memories',
    avatar: 'https://c.saavncdn.com/artists/KK_500x500.jpg',
    gradient: 'from-cyan-600/30 to-blue-900/30',
    tags: ['Empathy', 'Rock', 'Memories'],
    query: 'KK',
  },
  {
    id: 'sonu_nigam',
    name: 'Sonu Nigam',
    role: 'Modern Rafi & Vocal Perfectionist',
    avatar: 'https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg',
    gradient: 'from-pink-600/30 to-rose-900/30',
    tags: ['Golden Era', 'Emotional', 'Range'],
    query: 'Sonu Nigam',
  },
  {
    id: 'anuv_jain',
    name: 'Anuv Jain',
    role: 'Acoustic Indie & Gentle Poetry',
    avatar: 'https://c.saavncdn.com/artists/Anuv_Jain_500x500.jpg',
    gradient: 'from-stone-600/30 to-amber-950/30',
    tags: ['Indie Acoustic', 'Poetry', 'Late Night'],
    query: 'Anuv Jain',
  },
  {
    id: 'sidhu_moose_wala',
    name: 'Sidhu Moose Wala',
    role: 'The Legend & Punjabi Hip-Hop Giant',
    avatar: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_500x500.jpg',
    gradient: 'from-red-600/30 to-rose-950/30',
    tags: ['High Bass', 'Hip-Hop', 'Legacy'],
    query: 'Sidhu Moose Wala',
  },
  {
    id: 'b_praak',
    name: 'B Praak',
    role: 'Powerhouse of Emotional Melodies',
    avatar: 'https://c.saavncdn.com/artists/B_Praak_500x500.jpg',
    gradient: 'from-emerald-700/30 to-amber-900/30',
    tags: ['Heartfelt', 'Anthems', 'High Pitch'],
    query: 'B Praak',
  },
  {
    id: 'mohit_chauhan',
    name: 'Mohit Chauhan',
    role: 'Sufi, Travel & Rockstar Ballads',
    avatar: 'https://c.saavncdn.com/artists/Mohit_Chauhan_500x500.jpg',
    gradient: 'from-teal-600/30 to-slate-900/30',
    tags: ['Travel', 'Rockstar', 'Silk Voice'],
    query: 'Mohit Chauhan',
  },
  {
    id: 'darshan_raval',
    name: 'Darshan Raval',
    role: 'Monsoon Melodies & Youth Pop',
    avatar: 'https://c.saavncdn.com/artists/Darshan_Raval_500x500.jpg',
    gradient: 'from-sky-600/30 to-indigo-900/30',
    tags: ['Rain Melodies', 'Romantic Pop'],
    query: 'Darshan Raval',
  },
  {
    id: 'jubin_nautiyal',
    name: 'Jubin Nautiyal',
    role: 'Soulful Ballads & Acoustic Hits',
    avatar: 'https://c.saavncdn.com/artists/Jubin_Nautiyal_500x500.jpg',
    gradient: 'from-amber-700/30 to-orange-950/30',
    tags: ['Slow Melodies', 'Devotional', 'Acoustic'],
    query: 'Jubin Nautiyal',
  },
]

export const POPULAR_GENRES = [
  {
    id: 'romantic',
    label: 'Romantic Melodies',
    emoji: '❤️',
    color: 'from-rose-500/20 to-pink-900/30',
    border: 'hover:border-rose-500/40',
    tag: 'Love & Acoustic',
    query: 'Romantic Hindi Songs',
  },
  {
    id: 'sad',
    label: 'Sad & Heartbreak',
    emoji: '💔',
    color: 'from-blue-600/20 to-slate-900/40',
    border: 'hover:border-blue-500/40',
    tag: 'Emotional & Dard',
    query: 'Sad Hindi Songs',
  },
  {
    id: 'lofi',
    label: 'Late Night Lo-Fi',
    emoji: '🎧',
    color: 'from-purple-600/20 to-indigo-950/40',
    border: 'hover:border-purple-500/40',
    tag: 'Chill Rhythms & Study',
    query: 'Lo-Fi Hindi Chill',
  },
  {
    id: 'punjabi',
    label: 'Punjabi Bangers',
    emoji: '🔥',
    color: 'from-orange-600/20 to-red-950/40',
    border: 'hover:border-orange-500/40',
    tag: 'High Bass & Energy',
    query: 'Punjabi Hits',
  },
  {
    id: 'retro',
    label: '90s & Golden Retro',
    emoji: '✨',
    color: 'from-amber-600/20 to-yellow-950/40',
    border: 'hover:border-amber-500/40',
    tag: 'Kishore, Rafi, Lata',
    query: 'Retro Hindi Classics',
  },
  {
    id: 'gym',
    label: 'Gym & Beast Mode',
    emoji: '⚡',
    color: 'from-emerald-600/20 to-cyan-950/40',
    border: 'hover:border-emerald-500/40',
    tag: 'Workout & Motivation',
    query: 'Workout Gym Motivation Hindi',
  },
  {
    id: 'indie',
    label: 'Acoustic Indie',
    emoji: '🌿',
    color: 'from-teal-600/20 to-emerald-950/40',
    border: 'hover:border-teal-500/40',
    tag: 'Guitar & Raw Vocals',
    query: 'Indie Acoustic Hindi',
  },
  {
    id: 'sufi',
    label: 'Sufi & Devotional',
    emoji: '🕊️',
    color: 'from-amber-700/20 to-orange-950/40',
    border: 'hover:border-amber-600/40',
    tag: 'Peace & Soul Stirring',
    query: 'Sufi Hindi Qawwali',
  },
]

/**
 * Famous lyrics fragments and search keywords mapped directly
 * to their authentic songs, artist, and Spotify-style suggestions.
 */
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
    snippet: 'om deva deva',
    fullPhrase: 'Deva deva om deva deva namah om roop tu prachand hai',
    title: 'Deva Deva',
    artist: 'Arijit Singh, Pritam',
    album: 'Brahmastra',
    canonicalQuery: 'Deva Deva Brahmastra',
    tags: ['deva deva', 'brahmastra', 'om deva', 'spiritual', 'positive'],
  },
  {
    snippet: 'kaisi teri khudgarzi',
    fullPhrase: 'Kaisi teri khudgarzi na dhoop chune na chhaanv kabira maan jaa',
    title: 'Kabira',
    artist: 'Tochi Raina, Rekha Bhardwaj, Arijit Singh',
    album: 'Yeh Jawaani Hai Deewani',
    canonicalQuery: 'Kabira Yeh Jawaani Hai Deewani',
    tags: ['kabira', 'yeh jawaani hai deewani', 'tochi raina', 'pritam'],
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
    snippet: 'hawaon mein bahenge',
    fullPhrase: 'Hawaon mein bahenge ghataon mein rahenge tu barkha meri main tera baadal piya',
    title: 'Kalank (Title Track)',
    artist: 'Arijit Singh, Pritam',
    album: 'Kalank',
    canonicalQuery: 'Kalank Title Track Arijit Singh',
    tags: ['kalank', 'hawaon mein bahenge', 'arijit singh', 'pritam'],
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
    snippet: 'pehle bhi main tumse mila hoon',
    fullPhrase: 'Pehle bhi main tumse mila hoon pehli dafa hi milke laga',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    album: 'Animal',
    canonicalQuery: 'Pehle Bhi Main Animal',
    tags: ['pehle bhi main', 'animal', 'vishal mishra', 'slow romantic'],
  },
  {
    snippet: 'heeriye heeriye aa',
    fullPhrase: 'Heeriye heeriye aa heeriye teri khushboo aave',
    title: 'Heeriye',
    artist: 'Arijit Singh, Jasleen Royal',
    album: 'Heeriye',
    canonicalQuery: 'Heeriye Jasleen Royal Arijit Singh',
    tags: ['heeriye', 'jasleen royal', 'arijit singh', 'punjabi romance'],
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
    snippet: 'choo lo jo tum mujhe',
    fullPhrase: 'Khada hoon aaj bhi wahin ki dil phir beqarar hai',
    title: 'Choo Lo',
    artist: 'The Local Train',
    album: 'Aalas Ka Pedh',
    canonicalQuery: 'Choo Lo The Local Train',
    tags: ['choo lo', 'the local train', 'khada hoon aaj bhi wahin', 'indie rock'],
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
    snippet: 'excuses kehndi hundi si',
    fullPhrase: 'Kehndi hundi si chan tak raah bana de taare ne pasand mainu',
    title: 'Excuses',
    artist: 'AP Dhillon, Gurinder Gill',
    album: 'Hidden Gems',
    canonicalQuery: 'Excuses AP Dhillon',
    tags: ['excuses', 'kehndi hundi si', 'chan tak raah bana de', 'ap dhillon'],
  },
  {
    snippet: '295 sidhu moose wala',
    fullPhrase: 'Dass keda karda e copy ethe sach bolda e sidhu moose wala',
    title: '295',
    artist: 'Sidhu Moose Wala',
    album: 'Moosetape',
    canonicalQuery: '295 Sidhu Moose Wala',
    tags: ['295', 'sidhu moose wala', 'moosetape', 'punjabi'],
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
    snippet: 'pyaar ke pal',
    fullPhrase: 'Hum rahein ya na rahein kal kal yaad aayenge yeh pal',
    title: 'Pal',
    artist: 'KK',
    album: 'Pal',
    canonicalQuery: 'Pal KK Hum Rahein Ya Na Rahein',
    tags: ['pal', 'kk', 'hum rahein ya na rahein', 'evergreen', 'school memories'],
  },
  {
    snippet: 'abhi mujh mein kahin',
    fullPhrase: 'Abhi mujh mein kahin baaqi thodi si hai zindagi',
    title: 'Abhi Mujh Mein Kahin',
    artist: 'Sonu Nigam, Ajay-Atul',
    album: 'Agneepath',
    canonicalQuery: 'Abhi Mujh Mein Kahin Sonu Nigam',
    tags: ['abhi mujh mein kahin', 'sonu nigam', 'agneepath', 'masterpiece'],
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
  {
    snippet: 'kun faya kun',
    fullPhrase: 'Kun faya kun faya kun jab kahin pe kuch nahi bhi nahi tha',
    title: 'Kun Faya Kun',
    artist: 'A.R. Rahman, Mohit Chauhan, Javed Ali',
    album: 'Rockstar',
    canonicalQuery: 'Kun Faya Kun Rockstar A.R. Rahman',
    tags: ['kun faya kun', 'rockstar', 'ar rahman', 'mohit chauhan', 'sufi'],
  },
]

/**
 * Generate intelligent autocomplete predictions as the user types.
 * Matches singers, genres, famous lyrics, and song titles.
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

  // 1. Check matching popular singers
  for (const s of POPULAR_SINGERS) {
    if (s.name.toLowerCase().includes(q) || q.includes(s.name.toLowerCase().split(' ')[0])) {
      add(s.name, 'artist', { badge: 'Singer / Artist', avatar: s.avatar, query: s.query })
      add(`${s.name} Romantic`, 'suggestion', { badge: 'Trending', query: `${s.name} Romantic` })
      add(`${s.name} Best Hits`, 'suggestion', { badge: 'Top Hits', query: `${s.name} Best Songs` })
    }
  }

  // 2. Check matching genres
  for (const g of POPULAR_GENRES) {
    if (g.label.toLowerCase().includes(q) || g.query.toLowerCase().includes(q)) {
      add(g.label, 'genre', { badge: 'Genre', emoji: g.emoji, query: g.query })
    }
  }

  // 3. Check famous lyrics snippets
  for (const item of FAMOUS_LYRICS_MAP) {
    const matchedSnippet = item.snippet.toLowerCase().includes(q) ||
      item.fullPhrase.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.tags.some(t => t.includes(q))

    if (matchedSnippet) {
      add(item.title, 'song', {
        badge: 'Lyrics Match',
        subtitle: `${item.snippet} · ${item.artist}`,
        query: item.canonicalQuery,
      })
      add(item.snippet, 'lyrics', {
        badge: 'Lyrics Query',
        subtitle: `From "${item.title}" (${item.artist})`,
        query: item.canonicalQuery,
      })
    }
  }

  return predictions.slice(0, 8)
}

/**
 * Intelligent fuzzy tokenized search across catalog tracks & lyrics mappings.
 * Scores matches so exact & lyrics matches appear at the top.
 */
export function smartSearchCatalog(query, catalogTracks = []) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []

  const qTokens = q.split(/\s+/).filter(Boolean)

  // 1. First, check if query matches any known lyrics snippets directly
  const lyricsHits = []
  for (const item of FAMOUS_LYRICS_MAP) {
    const isLyricMatch = item.snippet.toLowerCase().includes(q) ||
      q.includes(item.snippet.toLowerCase()) ||
      item.fullPhrase.toLowerCase().includes(q) ||
      qTokens.some(tok => tok.length > 2 && item.snippet.toLowerCase().includes(tok))

    if (isLyricMatch) {
      // Find matching track in catalogTracks if exists
      const inCatalog = catalogTracks.find(t =>
        (t.title && t.title.toLowerCase().includes(item.title.toLowerCase())) ||
        (item.title && item.title.toLowerCase().includes(t.title?.toLowerCase()))
      )

      if (inCatalog) {
        lyricsHits.push({
          ...inCatalog,
          _score: 1000,
          _matchReason: `Lyrics: "${item.snippet}"`,
        })
      } else {
        // Construct high-confidence synthetic track card with direct search canonical query
        lyricsHits.push({
          id: `lyric_${item.title.toLowerCase().replace(/[^a-z0-9]/g, '_')}`,
          title: item.title,
          artist: item.artist,
          album: item.album,
          cover: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80',
          duration: 240,
          query: item.canonicalQuery,
          source: 'lyrics_match',
          _score: 950,
          _matchReason: `Lyrics: "${item.snippet}"`,
        })
      }
    }
  }

  // 2. Score all catalog tracks
  const scored = []
  const seenKeys = new Set(lyricsHits.map(t => `${t.title}-${t.artist}`.toLowerCase()))

  for (const t of catalogTracks) {
    const tKey = `${t.title}-${t.artist}`.toLowerCase()
    if (seenKeys.has(tKey)) continue

    const titleLower = (t.title || '').toLowerCase()
    const artistLower = (t.artist || '').toLowerCase()
    const albumLower = (t.album || '').toLowerCase()
    const categoryLower = (t.category || '').toLowerCase()

    let score = 0
    let matchReason = ''

    // Exact title match
    if (titleLower === q) {
      score += 500
      matchReason = 'Exact Title Match'
    } else if (titleLower.startsWith(q)) {
      score += 350
      matchReason = 'Title Match'
    } else if (titleLower.includes(q)) {
      score += 250
      matchReason = 'Title Match'
    }

    // Artist match
    if (artistLower === q) {
      score += 400
      matchReason = matchReason || 'Artist Match'
    } else if (artistLower.includes(q)) {
      score += 200
      matchReason = matchReason || 'Artist Match'
    }

    // Album match
    if (albumLower.includes(q)) {
      score += 120
      matchReason = matchReason || 'Album Match'
    }

    // Category / genre match
    if (categoryLower.includes(q)) {
      score += 90
      matchReason = matchReason || 'Genre Match'
    }

    // Tokenized word matching (handles multi-word queries like "arijit sad" or "lofi beats")
    let tokenMatches = 0
    for (const tok of qTokens) {
      if (titleLower.includes(tok)) {
        score += 60
        tokenMatches++
      }
      if (artistLower.includes(tok)) {
        score += 50
        tokenMatches++
      }
      if (albumLower.includes(tok)) {
        score += 30
        tokenMatches++
      }
    }

    if (tokenMatches === qTokens.length && qTokens.length > 1) {
      score += 150 // All tokens matched somewhere
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
  return [...lyricsHits, ...scored]
}
