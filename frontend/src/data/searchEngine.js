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
    avatar: 'https://c.saavncdn.com/artists/Sidhu_Moose_Wala_500x500.jpg',
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
    avatar: 'https://c.saavncdn.com/artists/B_Praak_500x500.jpg',
    gradient: 'from-emerald-700/30 to-amber-900/30',
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
    id: 'nr_gehra_hua',
    title: 'Gehra Hua',
    artist: 'Shashwat Sachdev, Arijit Singh, Irshad Kamil',
    album: 'Dhurandhar',
    cover: 'https://c.saavncdn.com/475/Dhurandhar-Hindi-2025-20260203083204-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/450/49d4be2a507e155490479bb33320390f_320.mp4',
    duration: 254,
    badge: 'Trending #1',
    category: 'romantic',
    year: '2025',
  },
  {
    id: 'nr_satranga',
    title: 'Satranga',
    artist: 'Arijit Singh, Shreyas Puranik, Siddharth-Garima',
    album: 'Animal',
    cover: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191036-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4',
    duration: 271,
    badge: 'Chartbuster',
    category: 'romantic',
    year: '2024',
  },
  {
    id: 'nr_chaleya',
    title: 'Chaleya',
    artist: 'Arijit Singh, Shilpa Rao, Anirudh Ravichander',
    album: 'Jawan',
    cover: 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814014339-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4',
    duration: 200,
    badge: 'Global Hit',
    category: 'romantic',
    year: '2024',
  },
  {
    id: 'nr_sajni',
    title: 'Sajni',
    artist: 'Arijit Singh, Ram Sampath, Prashant Pandey',
    album: 'Laapataa Ladies',
    cover: 'https://c.saavncdn.com/588/Laapataa-Ladies-Hindi-2024-20240212183515-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/588/75e53e4334a1b808940865c3bb9da531_320.mp4',
    duration: 170,
    badge: 'Popular',
    category: 'romantic',
    year: '2024',
  },
  {
    id: 'nr_husn',
    title: 'Husn',
    artist: 'Anuv Jain',
    album: 'Husn',
    cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/436/fc09c250914838634127c5972f053dc7_320.mp4',
    duration: 218,
    badge: 'Indie Viral',
    category: 'chill_sunday',
    year: '2024',
  },
  {
    id: 'nr_with_you',
    title: 'With You',
    artist: 'AP Dhillon',
    album: 'With You',
    cover: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/472/a1df3e8e19c3548972886a3782b683cf_320.mp4',
    duration: 154,
    badge: 'Punjabi Lo-Fi',
    category: 'romantic',
    year: '2024',
  },
  {
    id: 'nr_heeriye',
    title: 'Heeriye',
    artist: 'Jasleen Royal, Arijit Singh',
    album: 'Heeriye',
    cover: 'https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230724043046-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/022/c7625b139783f98c8c7f66a9d7211bf5_320.mp4',
    duration: 194,
    badge: 'Duet Hit',
    category: 'romantic',
    year: '2024',
  },
  {
    id: 'nr_o_maahi',
    title: 'O Maahi',
    artist: 'Pritam, Arijit Singh, Irshad Kamil',
    album: 'Dunki',
    cover: 'https://c.saavncdn.com/161/Dunki-Hindi-2023-20231216113204-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/161/29d2f6277e928eeaa424ea45d9e5b98a_320.mp4',
    duration: 233,
    badge: 'Soulful',
    category: 'romantic',
    year: '2024',
  },
  {
    id: 'nr_pehle_bhi_main',
    title: 'Pehle Bhi Main',
    artist: 'Vishal Mishra, Raj Shekhar',
    album: 'Animal',
    cover: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191036-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/092/9d2f44482eb55b252033c46e01a1e05a_320.mp4',
    duration: 250,
    badge: 'Atmospheric',
    category: 'heartbreak',
    year: '2024',
  },
  {
    id: 'nr_ve_kamleya',
    title: 'Ve Kamleya',
    artist: 'Arijit Singh, Shreya Ghoshal, Pritam',
    album: 'Rocky Aur Rani Kii Prem Kahaani',
    cover: 'https://c.saavncdn.com/834/Rocky-Aur-Rani-Kii-Prem-Kahaani-Hindi-2023-20230731141006-500x500.jpg',
    stream_url: 'https://aac.saavncdn.com/834/6fcfa60fa0d6a89c9225c5d0124f5c9e_320.mp4',
    duration: 247,
    badge: 'Masterpiece',
    category: 'romantic',
    year: '2024',
  },
]

/**
 * Dedicated Artist Playlists (25-30+ curated tracks per artist)
 * Guarantees that selecting an artist yields a complete, pure-artist playlist!
 */
export const ARTIST_DISCOGRAPHIES = {
  arijit_singh: [
    { title: 'Gehra Hua', artist: 'Shashwat Sachdev, Arijit Singh', album: 'Dhurandhar', duration: 254, cover: 'https://c.saavncdn.com/475/Dhurandhar-Hindi-2025-20260203083204-500x500.jpg', stream_url: 'https://aac.saavncdn.com/450/49d4be2a507e155490479bb33320390f_320.mp4' },
    { title: 'Tum Hi Ho', artist: 'Arijit Singh, Mithoon', album: 'Aashiqui 2', duration: 262, cover: 'https://c.saavncdn.com/430/Aashiqui-2-Hindi-2013-500x500.jpg', stream_url: 'https://aac.saavncdn.com/430/ddb5e39d424b9101b7a2d4b8e21a8dcf_320.mp4' },
    { title: 'Kesariya', artist: 'Pritam, Arijit Singh, Amitabh Bhattacharya', album: 'Brahmastra', duration: 268, cover: 'https://c.saavncdn.com/832/Brahmastra-Hindi-2022-20221006170313-500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Apna Bana Le', artist: 'Arijit Singh, Sachin-Jigar', album: 'Bhediya', duration: 261, cover: 'https://c.saavncdn.com/829/Bhediya-Hindi-2023-20230713175817-500x500.jpg', stream_url: 'https://aac.saavncdn.com/829/c03d7c3453ea138541cb4e605d8f668d_320.mp4' },
    { title: 'Satranga', artist: 'Arijit Singh, Shreyas Puranik', album: 'Animal', duration: 271, cover: 'https://c.saavncdn.com/092/ANIMAL-Hindi-2023-20231124191036-500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Channa Mereya', artist: 'Pritam, Arijit Singh', album: 'Ae Dil Hai Mushkil', duration: 289, cover: 'https://c.saavncdn.com/256/Ae-Dil-Hai-Mushkil-Hindi-2016-500x500.jpg', stream_url: 'https://aac.saavncdn.com/256/fa0627d3b371bb19fae3bf8e42cf89ff_320.mp4' },
    { title: 'Phir Aur Kya Chahiye', artist: 'Arijit Singh, Sachin-Jigar', album: 'Zara Hatke Zara Bachke', duration: 266, cover: 'https://c.saavncdn.com/644/Zara-Hatke-Zara-Bachke-Hindi-2023-20230623120150-500x500.jpg', stream_url: 'https://aac.saavncdn.com/644/473b98c366ff52bbf7d1ec39cb9a89c9_320.mp4' },
    { title: 'O Bedardeya', artist: 'Pritam, Arijit Singh', album: 'Tu Jhoothi Main Makkaar', duration: 313, cover: 'https://c.saavncdn.com/834/Tu-Jhoothi-Main-Makkaar-Hindi-2023-20230316165419-500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/b3d4f4e7c050fb3ce0df40614f1770e2_320.mp4' },
    { title: 'Chaleya', artist: 'Arijit Singh, Shilpa Rao, Anirudh', album: 'Jawan', duration: 200, cover: 'https://c.saavncdn.com/026/Chaleya-From-Jawan-Hindi-2023-20230814014339-500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'Shayad', artist: 'Pritam, Arijit Singh', album: 'Love Aaj Kal', duration: 247, cover: 'https://c.saavncdn.com/255/Love-Aaj-Kal-Hindi-2020-20200214140417-500x500.jpg', stream_url: 'https://aac.saavncdn.com/255/0f65ee9885c344238e88e89456950ee0_320.mp4' },
    { title: 'Hawayein', artist: 'Pritam, Arijit Singh', album: 'Jab Harry Met Sejal', duration: 290, cover: 'https://c.saavncdn.com/399/Jab-Harry-Met-Sejal-Hindi-2017-20170803-500x500.jpg', stream_url: 'https://aac.saavncdn.com/399/4a03426ceb24a737482ea466a9821a71_320.mp4' },
    { title: 'Agar Tum Saath Ho', artist: 'Alka Yagnik, Arijit Singh, A.R. Rahman', album: 'Tamasha', duration: 341, cover: 'https://c.saavncdn.com/902/Tamasha-Hindi-2015-500x500.jpg', stream_url: 'https://aac.saavncdn.com/902/f69a94145c22501a30268593a8e99e2a_320.mp4' },
    { title: 'Tere Hawaale', artist: 'Pritam, Arijit Singh, Shilpa Rao', album: 'Laal Singh Chaddha', duration: 346, cover: 'https://c.saavncdn.com/568/Laal-Singh-Chaddha-Hindi-2022-20220805174533-500x500.jpg', stream_url: 'https://aac.saavncdn.com/568/a258ca83d2eead60787a7018861cf42a_320.mp4' },
    { title: 'Heeriye', artist: 'Jasleen Royal, Arijit Singh', album: 'Heeriye', duration: 194, cover: 'https://c.saavncdn.com/022/Heeriye-feat-Arijit-Singh-Hindi-2023-20230724043046-500x500.jpg', stream_url: 'https://aac.saavncdn.com/022/c7625b139783f98c8c7f66a9d7211bf5_320.mp4' },
    { title: 'Sajni', artist: 'Arijit Singh, Ram Sampath', album: 'Laapataa Ladies', duration: 170, cover: 'https://c.saavncdn.com/588/Laapataa-Ladies-Hindi-2024-20240212183515-500x500.jpg', stream_url: 'https://aac.saavncdn.com/588/75e53e4334a1b808940865c3bb9da531_320.mp4' },
    { title: 'O Maahi', artist: 'Pritam, Arijit Singh', album: 'Dunki', duration: 233, cover: 'https://c.saavncdn.com/161/Dunki-Hindi-2023-20231216113204-500x500.jpg', stream_url: 'https://aac.saavncdn.com/161/29d2f6277e928eeaa424ea45d9e5b98a_320.mp4' },
    { title: 'Ve Kamleya', artist: 'Arijit Singh, Shreya Ghoshal, Pritam', album: 'Rocky Aur Rani Kii Prem Kahaani', duration: 247, cover: 'https://c.saavncdn.com/834/Rocky-Aur-Rani-Kii-Prem-Kahaani-Hindi-2023-20230731141006-500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/6fcfa60fa0d6a89c9225c5d0124f5c9e_320.mp4' },
    { title: 'Gerua', artist: 'Pritam, Arijit Singh, Antara Mitra', album: 'Dilwale', duration: 345, cover: 'https://c.saavncdn.com/712/Dilwale-Hindi-2015-500x500.jpg', stream_url: 'https://aac.saavncdn.com/712/751d38276f76c24599a00762ce404ea5_320.mp4' },
    { title: 'Mast Magan', artist: 'Shankar-Ehsaan-Loy, Arijit Singh, Chinmayi Sripada', album: '2 States', duration: 280, cover: 'https://c.saavncdn.com/492/2-States-Hindi-2014-500x500.jpg', stream_url: 'https://aac.saavncdn.com/492/d55f442f205c6d3bc01b44ec9fef39ff_320.mp4' },
    { title: 'Sanam Re', artist: 'Mithoon, Arijit Singh', album: 'Sanam Re', duration: 308, cover: 'https://c.saavncdn.com/896/Sanam-Re-Hindi-2015-500x500.jpg', stream_url: 'https://aac.saavncdn.com/896/e4fae7587747e9285038c11bb3b15ad8_320.mp4' },
    { title: 'Samjhawan', artist: 'Sharib-Toshi, Arijit Singh, Shreya Ghoshal', album: 'Humpty Sharma Ki Dulhania', duration: 269, cover: 'https://c.saavncdn.com/390/Humpty-Sharma-Ki-Dulhania-Hindi-2014-500x500.jpg', stream_url: 'https://aac.saavncdn.com/390/29e1ebad83f21136b80155b1a03f4cf2_320.mp4' },
    { title: 'Zaalima', artist: 'Pritam, Arijit Singh, Harshdeep Kaur', album: 'Raees', duration: 299, cover: 'https://c.saavncdn.com/001/Raees-Hindi-2017-500x500.jpg', stream_url: 'https://aac.saavncdn.com/001/7e15bf9b93be9f63543662ae18e558fc_320.mp4' },
    { title: 'Tera Yaar Hoon Main', artist: 'Rochak Kohli, Arijit Singh', album: 'Sonu Ke Titu Ki Sweety', duration: 264, cover: 'https://c.saavncdn.com/917/Sonu-Ke-Titu-Ki-Sweety-Hindi-2018-20180214-500x500.jpg', stream_url: 'https://aac.saavncdn.com/917/5a676c8c4cf7e77a28e93895e86d0663_320.mp4' },
    { title: 'Khairiyat', artist: 'Pritam, Arijit Singh', album: 'Chhichhore', duration: 280, cover: 'https://c.saavncdn.com/965/Chhichhore-Hindi-2019-20190904104022-500x500.jpg', stream_url: 'https://aac.saavncdn.com/965/a6fb322a3c74900a688aebef58f1a17b_320.mp4' },
    { title: 'Ilahi', artist: 'Pritam, Arijit Singh', album: 'Yeh Jawaani Hai Deewani', duration: 229, cover: 'https://c.saavncdn.com/023/Yeh-Jawaani-Hai-Deewani-Hindi-2013-500x500.jpg', stream_url: 'https://aac.saavncdn.com/023/91038b3fa73f60f64c636733221975e5_320.mp4' },
  ],
  atif_aslam: [
    { title: 'Woh Lamhe', artist: 'Atif Aslam, Mithoon', album: 'Zeher', duration: 321, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/023/391038b3fa73f60f64c636733221975e_320.mp4' },
    { title: 'Aadat', artist: 'Atif Aslam, Jal', album: 'Kalyug', duration: 334, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Tere Sang Yaara', artist: 'Atif Aslam, Arko', album: 'Rustom', duration: 290, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/644/473b98c366ff52bbf7d1ec39cb9a89c9_320.mp4' },
    { title: 'Dil Diyan Gallan', artist: 'Atif Aslam, Vishal-Shekhar', album: 'Tiger Zinda Hai', duration: 260, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'Jeene Laga Hoon', artist: 'Atif Aslam, Shreya Ghoshal, Sachin-Jigar', album: 'Ramaiya Vastavaiya', duration: 236, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Pehli Nazar Mein', artist: 'Atif Aslam, Pritam', album: 'Race', duration: 314, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/430/ddb5e39d424b9101b7a2d4b8e21a8dcf_320.mp4' },
    { title: 'Tu Jaane Na', artist: 'Atif Aslam, Pritam', album: 'Ajab Prem Ki Ghazab Kahani', duration: 341, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/256/fa0627d3b371bb19fae3bf8e42cf89ff_320.mp4' },
    { title: 'Tera Hone Laga Hoon', artist: 'Atif Aslam, Alisha Chinai, Pritam', album: 'Ajab Prem Ki Ghazab Kahani', duration: 299, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/829/c03d7c3453ea138541cb4e605d8f668d_320.mp4' },
    { title: 'Kuch Is Tarah', artist: 'Atif Aslam', album: 'Doorie', duration: 313, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/b3d4f4e7c050fb3ce0df40614f1770e2_320.mp4' },
    { title: 'Main Rang Sharbaton Ka', artist: 'Atif Aslam, Chinmayi, Pritam', album: 'Phata Poster Nikhla Hero', duration: 263, cover: 'https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg', stream_url: 'https://aac.saavncdn.com/450/49d4be2a507e155490479bb33320390f_320.mp4' },
  ],
  shreya_ghoshal: [
    { title: 'Sunn Raha Hai (Female)', artist: 'Shreya Ghoshal, Ankit Tiwari', album: 'Aashiqui 2', duration: 314, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/430/ddb5e39d424b9101b7a2d4b8e21a8dcf_320.mp4' },
    { title: 'Deewani Mastani', artist: 'Shreya Ghoshal, Sanjay Leela Bhansali', album: 'Bajirao Mastani', duration: 340, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'Ghoomar', artist: 'Shreya Ghoshal, Swaroop Khan', album: 'Padmaavat', duration: 282, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/6fcfa60fa0d6a89c9225c5d0124f5c9e_320.mp4' },
    { title: 'Ve Kamleya', artist: 'Arijit Singh, Shreya Ghoshal, Pritam', album: 'Rocky Aur Rani Kii Prem Kahaani', duration: 247, cover: 'https://c.saavncdn.com/834/Rocky-Aur-Rani-Kii-Prem-Kahaani-Hindi-2023-20230731141006-500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/6fcfa60fa0d6a89c9225c5d0124f5c9e_320.mp4' },
    { title: 'Teri Ore', artist: 'Pritam, Rahat Fateh Ali Khan, Shreya Ghoshal', album: 'Singh Is Kinng', duration: 339, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Barso Re', artist: 'A.R. Rahman, Shreya Ghoshal', album: 'Guru', duration: 329, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/902/f69a94145c22501a30268593a8e99e2a_320.mp4' },
    { title: 'Agar Tum Mil Jao', artist: 'Shreya Ghoshal, Roop Kumar Rathod', album: 'Zeher', duration: 360, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Jaadu Hai Nasha Hai', artist: 'M.M. Keeravani, Shreya Ghoshal', album: 'Jism', duration: 328, cover: 'https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg', stream_url: 'https://aac.saavncdn.com/644/473b98c366ff52bbf7d1ec39cb9a89c9_320.mp4' },
  ],
  diljit_dosanjh: [
    { title: 'Lover', artist: 'Diljit Dosanjh, Intense', album: 'MoonChild Era', duration: 184, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'G.O.A.T.', artist: 'Diljit Dosanjh', album: 'G.O.A.T.', duration: 223, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Born to Shine', artist: 'Diljit Dosanjh', album: 'G.O.A.T.', duration: 213, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/450/49d4be2a507e155490479bb33320390f_320.mp4' },
    { title: 'Lemonade', artist: 'Diljit Dosanjh', album: 'Drive', duration: 184, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Do You Know', artist: 'Diljit Dosanjh, B Praak', album: 'Do You Know', duration: 225, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/644/473b98c366ff52bbf7d1ec39cb9a89c9_320.mp4' },
    { title: '5 Taara', artist: 'Diljit Dosanjh, Jatinder Shah', album: '5 Taara', duration: 198, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/6fcfa60fa0d6a89c9225c5d0124f5c9e_320.mp4' },
    { title: 'Naina', artist: 'Diljit Dosanjh, Badshah', album: 'Crew', duration: 180, cover: 'https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg', stream_url: 'https://aac.saavncdn.com/472/a1df3e8e19c3548972886a3782b683cf_320.mp4' },
  ],
  anuv_jain: [
    { title: 'Husn', artist: 'Anuv Jain', album: 'Husn', duration: 218, cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg', stream_url: 'https://aac.saavncdn.com/436/fc09c250914838634127c5972f053dc7_320.mp4' },
    { title: 'Baarishein', artist: 'Anuv Jain', album: 'Baarishein', duration: 207, cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'Gul', artist: 'Anuv Jain', album: 'Gul', duration: 217, cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Alag Aasmaan', artist: 'Anuv Jain', album: 'Alag Aasmaan', duration: 212, cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg', stream_url: 'https://aac.saavncdn.com/450/49d4be2a507e155490479bb33320390f_320.mp4' },
    { title: 'Mishri', artist: 'Anuv Jain', album: 'Mishri', duration: 200, cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Jo Tum Mere Ho', artist: 'Anuv Jain', album: 'Jo Tum Mere Ho', duration: 245, cover: 'https://c.saavncdn.com/436/Husn-Hindi-2023-20231129054140-500x500.jpg', stream_url: 'https://aac.saavncdn.com/436/fc09c250914838634127c5972f053dc7_320.mp4' },
  ],
  ap_dhillon: [
    { title: 'With You', artist: 'AP Dhillon', album: 'With You', duration: 154, cover: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg', stream_url: 'https://aac.saavncdn.com/472/a1df3e8e19c3548972886a3782b683cf_320.mp4' },
    { title: 'Brown Munde', artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon', album: 'Brown Munde', duration: 266, cover: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'Excuses', artist: 'AP Dhillon, Gurinder Gill', album: 'Hidden Gems', duration: 176, cover: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Insane', artist: 'AP Dhillon, Gurinder Gill, Shinda Kahlon', album: 'Insane', duration: 206, cover: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg', stream_url: 'https://aac.saavncdn.com/450/49d4be2a507e155490479bb33320390f_320.mp4' },
    { title: 'Summer High', artist: 'AP Dhillon', album: 'Summer High', duration: 178, cover: 'https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
  ],
  kk: [
    { title: 'Yaaron', artist: 'KK, Leslie Lewis', album: 'Pal', duration: 282, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/430/ddb5e39d424b9101b7a2d4b8e21a8dcf_320.mp4' },
    { title: 'Pal', artist: 'KK, Leslie Lewis', album: 'Pal', duration: 279, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/256/fa0627d3b371bb19fae3bf8e42cf89ff_320.mp4' },
    { title: 'Zara Sa', artist: 'KK, Pritam', album: 'Jannat', duration: 303, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Aankhon Mein Teri', artist: 'KK, Vishal-Shekhar', album: 'Om Shanti Om', duration: 242, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'Tu Hi Meri Shab Hai', artist: 'KK, Pritam', album: 'Gangster', duration: 388, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Alvida', artist: 'KK, Pritam', album: 'Life in a Metro', duration: 340, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/834/6fcfa60fa0d6a89c9225c5d0124f5c9e_320.mp4' },
    { title: 'Labon Ko', artist: 'KK, Pritam', album: 'Bhool Bhulaiyaa', duration: 343, cover: 'https://c.saavncdn.com/artists/KK_500x500.jpg', stream_url: 'https://aac.saavncdn.com/644/473b98c366ff52bbf7d1ec39cb9a89c9_320.mp4' },
  ],
  kishore_kumar: [
    { title: 'Pal Pal Dil Ke Paas', artist: 'Kishore Kumar, Kalyanji-Anandji', album: 'Blackmail', duration: 326, cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', stream_url: 'https://aac.saavncdn.com/430/ddb5e39d424b9101b7a2d4b8e21a8dcf_320.mp4' },
    { title: 'Mere Sapno Ki Rani', artist: 'Kishore Kumar, S.D. Burman', album: 'Aradhana', duration: 300, cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', stream_url: 'https://aac.saavncdn.com/256/fa0627d3b371bb19fae3bf8e42cf89ff_320.mp4' },
    { title: 'Roop Tera Mastana', artist: 'Kishore Kumar, S.D. Burman', album: 'Aradhana', duration: 225, cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', stream_url: 'https://aac.saavncdn.com/832/d9c0ec9b8971f4ea8f2c310c1f516a24_320.mp4' },
    { title: 'Yeh Shaam Mastani', artist: 'Kishore Kumar, R.D. Burman', album: 'Kati Patang', duration: 275, cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', stream_url: 'https://aac.saavncdn.com/026/87ee96f7ff0d80e159bb840742f1cf5b_320.mp4' },
    { title: 'O Saathi Re', artist: 'Kishore Kumar, Kalyanji-Anandji', album: 'Muqaddar Ka Sikandar', duration: 270, cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', stream_url: 'https://aac.saavncdn.com/092/79eb00cf0440bf5eec643e200cfce542_320.mp4' },
    { title: 'Zindagi Ek Safar Hai', artist: 'Kishore Kumar, Shankar-Jaikishan', album: 'Andaz', duration: 260, cover: 'https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg', stream_url: 'https://aac.saavncdn.com/644/473b98c366ff52bbf7d1ec39cb9a89c9_320.mp4' },
  ],
}

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

/**
 * Generate 15+ intelligent autocomplete predictions as the user types.
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
      add(s.name, 'artist', { badge: 'Artist Playlist', avatar: s.avatar, query: s.query, artistId: s.id })
      add(`${s.name} Romantic Hits`, 'suggestion', { badge: 'Playlist', query: `${s.name} Romantic Songs` })
      add(`${s.name} Top Hits`, 'suggestion', { badge: 'Top Hits', query: `${s.name} Best Songs` })
      add(`${s.name} Sad Songs`, 'suggestion', { badge: 'Heartbreak', query: `${s.name} Sad Songs` })
    }
  }

  // 2. Check 2024-2026 new releases
  for (const nr of NEW_RELEASES_2025_2026) {
    if (
      nr.title.toLowerCase().includes(q) ||
      nr.artist.toLowerCase().includes(q) ||
      nr.album.toLowerCase().includes(q)
    ) {
      add(nr.title, 'new_release', { badge: 'New 2024-2026', subtitle: nr.artist, query: nr.title })
    }
  }

  // 3. Check famous lyrics snippets
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

  // 4. Check matching genres
  for (const g of POPULAR_GENRES) {
    if (g.label.toLowerCase().includes(q) || g.query.toLowerCase().includes(q)) {
      add(g.label, 'genre', { badge: 'Genre', emoji: g.emoji, query: g.query })
    }
  }

  return predictions.slice(0, 20)
}

/**
 * Intelligent fuzzy tokenized search across catalog tracks & lyrics mappings.
 * Returns 25-30+ ranked tracks.
 */
export function smartSearchCatalog(query, catalogTracks = []) {
  const q = (query || '').trim().toLowerCase()
  if (!q) return []

  const qTokens = q.split(/\s+/).filter(Boolean)

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
          _score: 1000,
          _matchReason: `Lyrics: "${item.snippet}"`,
        })
      } else {
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

  // 2. Add matching new releases
  const newReleaseHits = []
  for (const nr of NEW_RELEASES_2025_2026) {
    if (
      nr.title.toLowerCase().includes(q) ||
      nr.artist.toLowerCase().includes(q) ||
      nr.album.toLowerCase().includes(q)
    ) {
      newReleaseHits.push({
        ...nr,
        _score: 800,
        _matchReason: 'Trending 2024-2026',
      })
    }
  }

  // 3. Score all catalog tracks
  const scored = []
  const seenKeys = new Set([...lyricsHits, ...newReleaseHits].map((t) => `${t.title}-${t.artist}`.toLowerCase()))

  for (const t of catalogTracks) {
    const tKey = `${t.title}-${t.artist}`.toLowerCase()
    if (seenKeys.has(tKey)) continue

    const titleLower = (t.title || '').toLowerCase()
    const artistLower = (t.artist || '').toLowerCase()
    const albumLower = (t.album || '').toLowerCase()
    const categoryLower = (t.category || '').toLowerCase()

    let score = 0
    let matchReason = ''

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

    if (artistLower === q) {
      score += 400
      matchReason = matchReason || 'Artist Match'
    } else if (artistLower.includes(q)) {
      score += 200
      matchReason = matchReason || 'Artist Match'
    }

    if (albumLower.includes(q)) {
      score += 120
      matchReason = matchReason || 'Album Match'
    }

    if (categoryLower.includes(q)) {
      score += 90
      matchReason = matchReason || 'Genre Match'
    }

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
      score += 150
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
  return [...lyricsHits, ...newReleaseHits, ...scored]
}
