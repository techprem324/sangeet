"""
Unit tests for the core services. Run with:

    pip install pytest
    python -m pytest tests/ -v
"""

import os
import sys

sys.path.insert(0, os.path.join(os.path.dirname(__file__), ".."))

import base64  # noqa: E402

from Crypto.Cipher import DES  # noqa: E402

from services import catalog_service, jiosaavn_service, nlp_service  # noqa: E402


# ---------------------------------------------------------------------------
# NLP classification
# ---------------------------------------------------------------------------

def test_heartbreak_classification():
    r = nlp_service.analyze("I just went through a breakup and it's raining outside at 2am")
    assert r["mood"] == "heartbreak"
    assert r["target_valence"] < 0.3
    assert r["target_energy"] < 0.4


def test_focus_classification():
    r = nlp_service.analyze("stressed about exams, need to focus all night")
    assert r["mood"] == "focus_lofi"


def test_gym_classification():
    r = nlp_service.analyze("GYM DAY, lifting heavy, beast mode")
    assert r["mood"] == "gym_power"
    assert r["target_energy"] > 0.8


def test_romantic_classification():
    r = nlp_service.analyze("anniversary dinner with my girlfriend, romantic evening")
    assert r["mood"] == "romantic"


def test_emoji_signal():
    r = nlp_service.analyze("today was a day 😡")
    assert r["mood"] == "angry"


def test_neutral_default():
    r = nlp_service.analyze("hello there, how are you")
    assert r["mood"] in ("chill_sunday", "focus_lofi")


def test_mood_pill():
    r = nlp_service.mood_pill("party")
    assert r["mood"] == "party"
    assert r["confidence"] == 1.0


# ---------------------------------------------------------------------------
# JioSaavn decryption
# ---------------------------------------------------------------------------

def _fake_encrypted(path: str) -> str:
    """Build a valid encrypted_media_url the way JioSaavn does (DES-ECB)."""
    # PKCS#5 pad
    pad = 8 - (len(path) % 8)
    data = path.encode() + bytes([pad]) * pad
    return base64.b64encode(DES.new(b"38346591", DES.MODE_ECB).encrypt(data)).decode()


def test_decrypt_roundtrip():
    enc = _fake_encrypted("https://aac.saavncdn.com/430/abc123_96.mp4")
    dec = jiosaavn_service.decrypt_media_url(enc)
    assert dec == "https://aac.saavncdn.com/430/abc123_96.mp4"


def test_decrypt_garbage_returns_none():
    assert jiosaavn_service.decrypt_media_url("not-base64!!") is None
    assert jiosaavn_service.decrypt_media_url("") is None


def test_bitrate_bump():
    assert jiosaavn_service._bump_bitrate("https://aac.saavncdn.com/430/x_96.mp4", 320) == \
        "https://aac.saavncdn.com/430/x_320.mp4"


def test_search_returns_normalized():
    tracks = jiosaavn_service.search("tum hi ho arijit singh", limit=2, resolve=False)
    assert tracks, "live JioSaavn search should return results (needs internet)"
    t = tracks[0]
    assert t["title"] and t["artist"] and t["id"]


# ---------------------------------------------------------------------------
# Catalog
# ---------------------------------------------------------------------------

def test_catalog_categories():
    cats = catalog_service.categories()
    assert len(cats) == 10
    assert {c["category"] for c in cats} >= {"heartbreak", "gym_power", "focus_lofi"}


def test_catalog_tracks_have_metadata():
    tracks = catalog_service.category_tracks("heartbreak", limit=5, resolve=False)
    assert len(tracks) >= 5
    for t in tracks:
        assert t["title"] and t["artist"]
    # raw entries (before the client-safe trim) carry a search query too
    import json
    raw = json.load(open(os.path.join(os.path.dirname(__file__), "..",
                                      "data", "catalog", "heartbreak.json"),
                         encoding="utf-8"))
    for t in raw["tracks"]:
        assert t["query"]


if __name__ == "__main__":
    # quick manual run without pytest
    for fn in [n for n in dir() if n.startswith("test_")]:
        globals()[fn]()
        print("PASS", fn)
    print("all tests passed")
