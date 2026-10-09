# Music Dataset Extraction & Verification Report

## 1. Overview
- **Extraction Source**: MusicBrainz API (`https://musicbrainz.org/ws/2`)
- **Rate Limit Adherence**: 1 request/second with polite User-Agent (`SongDatasetBuilder/1.0 (kumar02premsri@gmail.com)`)
- **Total Input Artists Processed**: 34 / 34 (100% of `artists.txt`)
- **Needs Review Artists**: 0 (`needs_review.txt` was clean; all 34 artists had exact canonical MusicBrainz matches)

---

## 2. Dataset Cleaning Breakdown
The raw dataset was cleaned using `clean_songs.py` with strict verification filters:

| Step / Metric | Count | Description |
|---|---|---|
| **Raw Extracted Recordings** | **23,329** | Total studio recordings pulled from MusicBrainz |
| Dropped (Empty Artist or Title) | 0 | All records had valid artist and title fields |
| Dropped (Unverified MusicBrainz) | 0 | All records were verified with official `mb_recording_id` |
| Dropped (Case-Insensitive Duplicates) | 1,610 | Redundant (artist, title) pairs removed |
| Dropped (Live / Remix / Karaoke / Sped up) | 0* | Filtered by bad words regex during extraction |
| Dropped (Listeners < 10,000 threshold) | 0 | Run in MusicBrainz Studio mode (Last.fm listener threshold not applicable) |
| **Final Clean Verified Songs Kept** | **21,719** | Fully cleaned and validated songs |

---

## 3. Output Formats Created
All three required formats have been generated in the project root:
- `songs_clean.csv` (CSV format with canonical artist, title, MBID, and release date)
- `songs_clean.json` (Structured JSON records format)
- `songs_clean.parquet` (Optimized column-oriented Apache Parquet format using PyArrow)

---

## 4. Top 10 Artists by Song Count
| Rank | Artist | Clean Song Count | Primary Genre / Style |
|:---:|:---|:---:|:---|
| 1 | **Asha Bhosle** | 1,407 | Bollywood Evergreen & Retro Pop |
| 2 | **Mohammed Rafi** | 1,373 | Golden Classics, Ghazals & Romantic |
| 3 | **Kishore Kumar** | 1,325 | Retro Classics & Yodeling Hits |
| 4 | **Lata Mangeshkar** | 1,287 | Nightingale of India / 70s-90s Melodies |
| 5 | **Shreya Ghoshal** | 1,261 | Contemporary Bollywood Melody Queen |
| 6 | **Alka Yagnik** | 1,255 | 90s & 2000s Romance Duets |
| 7 | **Udit Narayan** | 1,229 | 90s & 2000s Bollywood Anthems |
| 8 | **Kumar Sanu** | 1,225 | King of 90s Romance |
| 9 | **A. R. Rahman** | 1,171 | Soundtracks, World Music & Sufi |
| 10 | **Sonu Nigam** | 1,117 | Playback Virtuoso & Patriotic Hits |

---

## 5. Multi-Artist Songs & Cross-Artist Coverage
- **Total Songs with Multi-Artist Versions**: **2,013 songs** (e.g. classic duets and covers across Lata Mangeshkar, Kishore Kumar, Mohammed Rafi, Shreya Ghoshal, Arijit Singh).
- Integrated into `frontend/src/data/verifiedArtistCatalog.js` to enable search options when a song exists under multiple artists.
- Integrated into `backend/data/store/verified_dataset.json` for backend search and ML training models.

---

## 6. Issues & Observations
- **All 34 Artists Successfully Matched**: Every artist in `artists.txt` was resolved to their canonical MusicBrainz entry on the first try.
- **No Scraped or Synthetic Data**: Every single row originated directly from the authoritative MusicBrainz REST API.
