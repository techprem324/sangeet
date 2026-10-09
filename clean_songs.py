#!/usr/bin/env python3
"""
clean_songs.py
==============
Cleans and standardizes the song dataset according to the verification rules:
1. Drops rows where mb_verified is False
2. Drops duplicate (artist, title) pairs (case-insensitive)
3. Drops titles containing: live, remix, karaoke, instrumental, demo, cover, tribute, slowed, reverb, sped up
4. Drops rows with empty artist or title
5. Filters lastfm_listeners >= threshold if listener data is present
6. Saves songs_clean.csv, songs_clean.json, and songs_clean.parquet
7. Prints a detailed breakdown of removals at each step
"""

import argparse
import json
import re
import pandas as pd

BAD_TITLE_PATTERN = re.compile(
    r"\b(live|remix|karaoke|instrumental|demo|cover|tribute|slowed|reverb|sped up)\b",
    re.IGNORECASE
)

def clean_dataset(input_file="songs.csv", threshold=10000):
    print(f"Loading raw dataset from {input_file}...")
    df = pd.read_csv(input_file, dtype=str).fillna("")
    initial_count = len(df)
    print(f"Total raw records loaded: {initial_count}")

    stats = {
        "initial": initial_count,
        "empty_artist_or_title": 0,
        "unverified_mb": 0,
        "duplicates": 0,
        "bad_keywords": 0,
        "below_listeners_threshold": 0,
        "final": 0
    }

    # 1. Drop rows with empty artist or title
    valid_mask = (df["artist"].str.strip() != "") & (df["title"].str.strip() != "")
    empty_dropped = len(df) - valid_mask.sum()
    stats["empty_artist_or_title"] = empty_dropped
    df = df[valid_mask].copy()

    # 2. Drop rows where mb_verified is False
    # mb_verified can be 'True', 'False', True, False, etc.
    verified_mask = df["mb_verified"].astype(str).str.strip().str.lower().isin(["true", "1", "yes"])
    unverified_dropped = len(df) - verified_mask.sum()
    stats["unverified_mb"] = unverified_dropped
    df = df[verified_mask].copy()

    # 3. Drop duplicate (artist, title) pairs, case-insensitive
    df["_artist_lower"] = df["artist"].str.strip().str.lower()
    df["_title_lower"] = df["title"].str.strip().str.lower()
    before_dedup = len(df)
    df = df.drop_duplicates(subset=["_artist_lower", "_title_lower"]).copy()
    stats["duplicates"] = before_dedup - len(df)

    # 4. Drop titles containing forbidden keywords
    bad_title_mask = df["title"].apply(lambda t: bool(BAD_TITLE_PATTERN.search(t)))
    bad_count = bad_title_mask.sum()
    stats["bad_keywords"] = int(bad_count)
    df = df[~bad_title_mask].copy()

    # 5. Filter by lastfm_listeners threshold if listeners data exists
    # Convert lastfm_listeners to numeric where possible
    has_listeners = df["lastfm_listeners"].str.strip().replace("", "0").str.isnumeric().any()
    if has_listeners and df["lastfm_listeners"].str.strip().ne("").any():
        listeners_series = pd.to_numeric(df["lastfm_listeners"], errors="coerce").fillna(0)
        # If there are actual non-zero listeners in the dataset
        if (listeners_series > 0).any():
            above_threshold_mask = listeners_series >= threshold
            stats["below_listeners_threshold"] = int((~above_threshold_mask).sum())
            df = df[above_threshold_mask].copy()
            print(f"Applied lastfm_listeners threshold >= {threshold}: dropped {stats['below_listeners_threshold']}")
        else:
            print("Note: lastfm_listeners contains all zeroes or blank (MusicBrainz direct mode). Preserved all verified recordings.")
    else:
        print("Note: lastfm_listeners is blank (MusicBrainz direct mode). Preserved all verified studio recordings.")

    # Clean up temporary helper columns
    df = df.drop(columns=["_artist_lower", "_title_lower"])
    stats["final"] = len(df)

    print("\n--- Cleaning Breakdown ---")
    print(f"Initial songs:                   {stats['initial']}")
    print(f"Dropped (empty artist/title):    {stats['empty_artist_or_title']}")
    print(f"Dropped (unverified MB):         {stats['unverified_mb']}")
    print(f"Dropped (duplicate songs):       {stats['duplicates']}")
    print(f"Dropped (live/remix/karaoke):    {stats['bad_keywords']}")
    print(f"Dropped (listeners < {threshold}): {stats['below_listeners_threshold']}")
    print(f"Final clean songs kept:          {stats['final']}")

    # Save outputs
    print("\nSaving clean outputs...")
    df.to_csv("songs_clean.csv", index=False, encoding="utf-8")
    print(" -> Saved songs_clean.csv")

    df.to_json("songs_clean.json", orient="records", indent=2, force_ascii=False)
    print(" -> Saved songs_clean.json")

    df.to_parquet("songs_clean.parquet", index=False, engine="pyarrow")
    print(" -> Saved songs_clean.parquet")

    # Top 10 artists by song count
    top10 = df["artist"].value_counts().head(10)
    print("\nTop 10 Artists by clean song count:")
    for rank, (art, count) in enumerate(top10.items(), 1):
        print(f" {rank:2d}. {art}: {count} songs")

    return stats, df

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", default="songs.csv", help="Input raw CSV path")
    parser.add_argument("--threshold", type=int, default=10000, help="Popularity listener threshold")
    args = parser.parse_args()
    clean_dataset(args.input, args.threshold)
