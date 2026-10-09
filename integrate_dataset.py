#!/usr/bin/env python3
"""
integrate_dataset.py
====================
Takes the cleaned dataset (songs_clean.json) and prepares:
1. frontend/src/data/verifiedArtistCatalog.js (artists, discographies, multi-artist songs)
2. backend/data/store/verified_dataset.json (for backend search & ML training)
"""

import json
import os
import re
from collections import defaultdict

# High quality portraits for artists in artists.txt
ARTIST_METADATA = {
    "Arijit Singh": {
        "role": "King of Soul & Bollywood Playback",
        "avatar": "https://c.saavncdn.com/840/Best-Of-Arijit-Singh-Collection-Of-Romantic-Songs-Hindi-2025-20251203161112-500x500.jpg",
        "tags": ["Romantic", "Soulful", "Acoustic"],
        "bio": "India's most streamed artist of the decade. The definitive voice of modern romance and yearning."
    },
    "A. R. Rahman": {
        "role": "The Mozart of Madras & Oscar Winner",
        "avatar": "https://c.saavncdn.com/artists/A.R._Rahman_500x500.jpg",
        "tags": ["Sufi", "World Music", "Soundtracks"],
        "bio": "Two-time Academy Award winner who revolutionized Indian film music with global synth, orchestral, and Sufi fusions."
    },
    "Lata Mangeshkar": {
        "role": "Nightingale of India",
        "avatar": "https://c.saavncdn.com/artists/Lata_Mangeshkar_500x500.jpg",
        "tags": ["Evergreen", "Golden Classics", "Devotional"],
        "bio": "The legendary voice of seven decades of Indian cinema with thousands of timeless melodies."
    },
    "Kishore Kumar": {
        "role": "Golden Retro Evergreen Legend",
        "avatar": "https://c.saavncdn.com/artists/Kishore_Kumar_500x500.jpg",
        "tags": ["Retro Classics", "Evergreen 70s", "Yodeling"],
        "bio": "The greatest entertainer in Indian cinema history. Unbound vocal energy and eternal soul."
    },
    "Mohammed Rafi": {
        "role": "The Golden Voice of Indian Cinema",
        "avatar": "https://c.saavncdn.com/artists/Mohammed_Rafi_500x500.jpg",
        "tags": ["Golden Classics", "Ghazal", "Romantic"],
        "bio": "Incomparable vocal versatility spanning classical, romantic, qawwali, and melancholic masterworks."
    },
    "Asha Bhosle": {
        "role": "The Queen of Versatility & Cabaret",
        "avatar": "https://c.saavncdn.com/artists/Asha_Bhosle_500x500.jpg",
        "tags": ["Retro Pop", "Ghazal", "Upbeat"],
        "bio": "Guinness World Record holder for most studio recordings, celebrated for vivacious and sultry anthems."
    },
    "Shreya Ghoshal": {
        "role": "Melody Queen of India",
        "avatar": "https://c.saavncdn.com/artists/Shreya_Ghoshal_500x500.jpg",
        "tags": ["Classical", "Romantic", "Bollywood"],
        "bio": "Five-time National Film Award winner with unmatched vocal nuance and crystalline emotional purity."
    },
    "Sonu Nigam": {
        "role": "Modern Playback Virtuoso",
        "avatar": "https://c.saavncdn.com/artists/Sonu_Nigam_500x500.jpg",
        "tags": ["Romantic", "Patriotic", "90s & 2000s"],
        "bio": "Often hailed as the modern Rafi, defined the sound of 90s and 2000s Bollywood."
    },
    "Neha Kakkar": {
        "role": "Party Anthem Hitmaker",
        "avatar": "https://c.saavncdn.com/artists/Neha_Kakkar_500x500.jpg",
        "tags": ["Party Pop", "Dance", "Remakes"],
        "bio": "One of India's most viewed female artists on YouTube, synonymous with modern wedding and club bangers."
    },
    "Atif Aslam": {
        "role": "Vocal Legend & Rock Balladeer",
        "avatar": "https://c.saavncdn.com/artists/Atif_Aslam_500x500.jpg",
        "tags": ["Soulful", "Nostalgic", "Rock"],
        "bio": "Pioneer of 2000s South Asian pop-rock and unforgettable romantic anthems that defined a generation."
    },
    "Kumar Sanu": {
        "role": "King of 90s Romance",
        "avatar": "https://c.saavncdn.com/artists/Kumar_Sanu_500x500.jpg",
        "tags": ["90s Nostalgia", "Melodious", "Aashiqui"],
        "bio": "Held the Guinness World Record for recording 28 songs in a single day. The definitive voice of 90s Bollywood."
    },
    "Udit Narayan": {
        "role": "Sweet Voice of Bollywood",
        "avatar": "https://c.saavncdn.com/artists/Udit_Narayan_500x500.jpg",
        "tags": ["90s Romances", "Folk", "Evergreen"],
        "bio": "Four-time National Film Award recipient whose bright, smiling vocal timbre graced over four decades of cinema."
    },
    "Alka Yagnik": {
        "role": "Record-Breaking Queen of 90s & 2000s",
        "avatar": "https://c.saavncdn.com/artists/Alka_Yagnik_500x500.jpg",
        "tags": ["90s Hits", "Romantic", "Melodious"],
        "bio": "The world's most streamed artist on YouTube across consecutive years, reigning over countless classic duets."
    },
    "Sunidhi Chauhan": {
        "role": "Electrifying Vocal Dynamo",
        "avatar": "https://c.saavncdn.com/artists/Sunidhi_Chauhan_500x500.jpg",
        "tags": ["High Energy", "Power Vocals", "Dance"],
        "bio": "Unstoppable vocal powerhouse celebrated for fiery club tracks, western pop influences, and commanding stage energy."
    },
    "Jubin Nautiyal": {
        "role": "Soulful Acoustic Balladeer",
        "avatar": "https://c.saavncdn.com/artists/Jubin_Nautiyal_500x500.jpg",
        "tags": ["Heartfelt", "Acoustic", "Devotional"],
        "bio": "Known for his serene, melancholic timbre in modern blockbusters like Raataan Lambiyan, Lut Gaye, and Humnava Mere."
    },
    "Diljit Dosanjh": {
        "role": "Global Punjabi Icon & Superstar",
        "avatar": "https://c.saavncdn.com/artists/Diljit_Dosanjh_500x500.jpg",
        "tags": ["Punjabi Pop", "Bhangra", "Urban"],
        "bio": "History-making global icon selling out worldwide stadium arenas and Coachella."
    },
    "Sidhu Moose Wala": {
        "role": "Legend of Punjabi Hip-Hop",
        "avatar": "https://c.saavncdn.com/artists/Sidhu_Moose_Wala_500x500.jpg",
        "tags": ["Punjabi Rap", "Hard Bass", "Street Anthems"],
        "bio": "The raw, immortal voice of Punjabi street culture whose songwriting redefined the global desi soundscape."
    },
    "AP Dhillon": {
        "role": "Brown Munde & Lo-Fi Pioneer",
        "avatar": "https://c.saavncdn.com/472/With-You-Punjabi-2023-20230822145201-500x500.jpg",
        "tags": ["Punjabi Trap", "Lo-Fi", "Brown Munde"],
        "bio": "Turned minimalist trap beats and soulful Punjabi hooks into an unstoppable global sonic movement."
    },
    "Guru Randhawa": {
        "role": "High Rated Gabru & Pop Sensation",
        "avatar": "https://c.saavncdn.com/artists/Guru_Randhawa_500x500.jpg",
        "tags": ["Dance Pop", "Party Hits", "Bhangra Beat"],
        "bio": "Broke international YouTube records with crossover bangers like Lahore, High Rated Gabru, and Suit Suit."
    },
    "The Beatles": {
        "role": "The Greatest Rock Band in History",
        "avatar": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
        "tags": ["British Rock", "60s Pop", "Psychedelic"],
        "bio": "The Fab Four from Liverpool who transformed popular music, studio production, and modern culture forever."
    },
    "Queen": {
        "role": "Arena Rock Royalty & Freddie Mercury",
        "avatar": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
        "tags": ["Classic Rock", "Glam Rock", "Stadium Anthems"],
        "bio": "Operatic grandeur, timeless harmonies, and immortal anthems like Bohemian Rhapsody and We Will Rock You."
    },
    "Michael Jackson": {
        "role": "The King of Pop",
        "avatar": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
        "tags": ["Pop", "Funk", "Dance"],
        "bio": "The most decorated and influential performer of all time. Billie Jean, Thriller, Beat It, and the Moonwalk."
    },
    "Ed Sheeran": {
        "role": "Global Acoustic Pop Maestro",
        "avatar": "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500&auto=format&fit=crop&q=80",
        "tags": ["Acoustic Pop", "Loop Pedal", "Ballads"],
        "bio": "Stadium-filling singer-songwriter behind record-shattering acoustic hits like Shape of You and Perfect."
    },
    "Taylor Swift": {
        "role": "Global Pop Phenomenon & Songwriter",
        "avatar": "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500&auto=format&fit=crop&q=80",
        "tags": ["Pop", "Indie Folk", "Eras"],
        "bio": "Cultural titan whose narrative songwriting across country, pop, and indie folk defines an entire generation."
    },
    "Coldplay": {
        "role": "Anthemic Stadium Rock Pioneers",
        "avatar": "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500&auto=format&fit=crop&q=80",
        "tags": ["Alt Rock", "Stadium Anthems", "Piano Rock"],
        "bio": "Chris Martin and crew crafting glowing arena sing-alongs from Yellow and Fix You to Viva La Vida."
    },
    "Adele": {
        "role": "Soul-Stirring Vocal Powerhouse",
        "avatar": "https://images.unsplash.com/photo-1487180144351-b8472da7d491?w=500&auto=format&fit=crop&q=80",
        "tags": ["Soul Pop", "Ballads", "Emotional"],
        "bio": "Multiple Grammy and Oscar-winning British vocal powerhouse behind Rolling in the Deep and Someone Like You."
    },
    "Eminem": {
        "role": "Rap God & Hip-Hop Icon",
        "avatar": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80",
        "tags": ["Hip-Hop", "Fast Flow", "Lyricism"],
        "bio": "Diamond-certified rap titan whose breathtaking velocity and ferocious storytelling altered hip-hop history."
    },
    "Linkin Park": {
        "role": "Nu-Metal & Alt-Rock Legends",
        "avatar": "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500&auto=format&fit=crop&q=80",
        "tags": ["Nu-Metal", "Alt-Rock", "Chester Bennington"],
        "bio": "Pioneered the hybrid synthesis of rock, rap, and electronica with Hybrid Theory and Meteora."
    },
    "Imagine Dragons": {
        "role": "Electrifying Arena Rock Powerhouse",
        "avatar": "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=500&auto=format&fit=crop&q=80",
        "tags": ["Electro-Rock", "Anthems", "High Energy"],
        "bio": "Creators of booming percussion anthems like Radioactive, Believer, Demons, and Bones."
    },
    "The Weeknd": {
        "role": "Dark R&B & Synthwave Visionary",
        "avatar": "https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80",
        "tags": ["Synthwave", "Dark R&B", "Pop"],
        "bio": "Record-breaking creator of Blinding Lights, fusing 80s synth-pop, melancholic soul, and futuristic R&B."
    },
    "Rihanna": {
        "role": "Global Pop, Dancehall & R&B Icon",
        "avatar": "https://images.unsplash.com/photo-1520523839898-50712825e3a7?w=500&auto=format&fit=crop&q=80",
        "tags": ["Pop", "R&B", "Dancehall"],
        "bio": "Chart-topping international superstar with 14 Billboard #1 hits from Umbrella to Diamonds."
    },
    "Bruno Mars": {
        "role": "Modern Funk, Soul & Pop Showman",
        "avatar": "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500&auto=format&fit=crop&q=80",
        "tags": ["Funk", "Soul", "Pop Hits"],
        "bio": "Virtuosic multi-instrumentalist and electrifying entertainer behind Uptown Funk, 24K Magic, and Just the Way You Are."
    },
    "Pink Floyd": {
        "role": "Pioneers of Progressive & Psychedelic Rock",
        "avatar": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80",
        "tags": ["Prog Rock", "Psychedelic", "Dark Side"],
        "bio": "Philosophical lyrics, sonic experimentation, and groundbreaking concepts on The Dark Side of the Moon and The Wall."
    },
    "Led Zeppelin": {
        "role": "Godfathers of Hard Rock & Heavy Metal",
        "avatar": "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80",
        "tags": ["Hard Rock", "Blues Rock", "Stairway"],
        "bio": "Jimmy Page's transcendent guitar riffs and Robert Plant's mythic vocals that forged the blueprint of heavy rock."
    }
}

def artist_to_id(name):
    clean = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return clean

def main():
    if not os.path.exists("songs_clean.json"):
        print("Error: songs_clean.json not found. Run clean_songs.py first.")
        return

    with open("songs_clean.json", "r", encoding="utf-8") as f:
        songs = json.load(f)

    print(f"Loaded {len(songs)} clean songs.")

    # Group tracks by artist
    artist_tracks = defaultdict(list)
    title_artists = defaultdict(set)

    for s in songs:
        art = s.get("artist", "").strip()
        tit = s.get("title", "").strip()
        if not art or not tit:
            continue
        artist_tracks[art].append(s)
        norm_tit = re.sub(r"[^a-z0-9]+", " ", tit.lower()).strip()
        title_artists[norm_tit].add(art)

    # Find multi-artist songs
    multi_artist_map = {}
    for norm_tit, arts in title_artists.items():
        if len(arts) > 1:
            multi_artist_map[norm_tit] = sorted(list(arts))

    print(f"Total artists with clean tracks: {len(artist_tracks)}")
    print(f"Total songs recorded across multiple artists: {len(multi_artist_map)}")

    # Format verified artists list
    verified_artists_data = []
    discographies_data = {}

    for artist_name, tracks in artist_tracks.items():
        art_id = artist_to_id(artist_name)
        meta = ARTIST_METADATA.get(artist_name, {
            "role": "Featured Artist",
            "avatar": "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80",
            "tags": ["Hits", "Discography"],
            "bio": f"Complete verified discography for {artist_name}."
        })

        verified_artists_data.append({
            "id": art_id,
            "name": artist_name,
            "role": meta.get("role", "Featured Artist"),
            "avatar": meta.get("avatar", ""),
            "tags": meta.get("tags", []),
            "query": artist_name,
            "bio": meta.get("bio", ""),
            "songCount": len(tracks)
        })

        formatted_tracks = []
        for i, t in enumerate(tracks[:60], 1): # Top 60 clean songs per artist
            formatted_tracks.append({
                "id": f"{art_id}_{i}",
                "title": t["title"],
                "artist": artist_name,
                "album": t.get("first_release_date", "Studio Recording"),
                "year": t.get("first_release_date", ""),
                "cover": meta.get("avatar", ""),
                "duration": 210,
                "mbid": t.get("mb_recording_id", "")
            })
        discographies_data[art_id] = formatted_tracks

    # Write JS file for frontend
    out_js = os.path.join("frontend", "src", "data", "verifiedArtistCatalog.js")
    with open(out_js, "w", encoding="utf-8") as f:
        f.write("/**\n * verifiedArtistCatalog.js\n * Clean verified discographies extracted from MusicBrainz.\n */\n\n")
        f.write("export const VERIFIED_ARTISTS = " + json.dumps(verified_artists_data, indent=2, ensure_ascii=False) + ";\n\n")
        f.write("export const VERIFIED_DISCOGRAPHIES = " + json.dumps(discographies_data, indent=2, ensure_ascii=False) + ";\n\n")
        f.write("export const MULTI_ARTIST_SONGS = " + json.dumps(multi_artist_map, indent=2, ensure_ascii=False) + ";\n")

    print(f"Wrote frontend catalog: {out_js}")

    # Write backend store
    out_backend = os.path.join("backend", "data", "store", "verified_dataset.json")
    os.makedirs(os.path.dirname(out_backend), exist_ok=True)
    with open(out_backend, "w", encoding="utf-8") as f:
        json.dump({
            "artists": verified_artists_data,
            "discographies": discographies_data,
            "multi_artist_songs": multi_artist_map,
            "total_songs": len(songs)
        }, f, indent=2, ensure_ascii=False)

    print(f"Wrote backend dataset: {out_backend}")

if __name__ == "__main__":
    main()
