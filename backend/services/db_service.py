"""
db_service.py
=============
Persistence layer for chat history and liked songs.

Two interchangeable backends behind one interface:
  * MongoDB (via PyMongo)  — the "real" capstone database.
  * JSON file store        — automatic fallback when Mongo is absent,
                             so the app never breaks during a demo.

Collections follow the PRD schemas: `conversations`, `liked_songs`.

Every user action is also mirrored to the JSON store when Mongo is
unavailable, and all writes are thread-safe.
"""

from __future__ import annotations

import json
import logging
import os
import threading
import time
import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional

log = logging.getLogger("sargam.db")

STORE_DIR = os.path.join(os.path.dirname(__file__), "..", "data", "store")
CHATS_FILE = os.path.join(STORE_DIR, "chats.json")
LIKED_FILE = os.path.join(STORE_DIR, "liked.json")
PLAYLISTS_FILE = os.path.join(STORE_DIR, "playlists.json")
USERS_FILE = os.path.join(STORE_DIR, "users.json")

_lock = threading.Lock()

_db = None
_using_mongo = None


def _mongo():
    """Lazy Mongo client; None when unconfigured/unavailable."""
    global _db, _using_mongo
    if _using_mongo is not None:
        return _db
    uri = os.getenv("MONGO_URI")
    if not uri:
        _using_mongo = False
        return None
    try:
        import pymongo  # optional dependency
        _db = pymongo.MongoClient(uri, serverSelectionTimeoutMS=2500)[os.getenv("MONGO_DB", "sargam")]
        _db.command("ping")
        _using_mongo = True
        log.info("Connected to MongoDB at %s", uri)
    except Exception as exc:
        log.warning("MongoDB unavailable (%s) — using JSON store", exc)
        _db = None
        _using_mongo = False
    return _db


def using_mongo() -> bool:
    _mongo()
    return bool(_using_mongo)


# ---------------------------------------------------------------------------
# JSON store helpers
# ---------------------------------------------------------------------------

def _load_json(path: str, default: list) -> list:
    try:
        os.makedirs(STORE_DIR, exist_ok=True)
        if os.path.exists(path):
            with open(path, encoding="utf-8") as f:
                return json.load(f)
    except Exception as exc:
        log.warning("Could not read %s: %s", path, exc)
    return default


def _save_json(path: str, data: list) -> None:
    try:
        os.makedirs(STORE_DIR, exist_ok=True)
        with open(path, "w", encoding="utf-8") as f:
            json.dump(data, f, ensure_ascii=False, indent=1)
    except Exception as exc:
        log.warning("Could not write %s: %s", path, exc)


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _new_id() -> str:
    return str(uuid.uuid4())


# ---------------------------------------------------------------------------
# Conversations
# ---------------------------------------------------------------------------

def save_conversation(user_id: str, session_id: str, payload: Dict) -> Dict:
    """Store one user prompt + AI response exchange."""
    record = {
        "_id": _new_id(),
        "user_id": user_id,
        "session_id": session_id,
        "created_at": _now(),
        **payload,
    }
    with _lock:
        if _mongo():
            try:
                _db.conversations.insert_one(record)
                return record
            except Exception as exc:
                log.warning("Mongo insert failed: %s", exc)
        chats = _load_json(CHATS_FILE, [])
        chats.insert(0, record)
        chats = chats[:500]
        _save_json(CHATS_FILE, chats)
    return record


def get_history(user_id: str, limit: int = 50) -> List[Dict]:
    with _lock:
        if _mongo():
            try:
                cursor = _db.conversations.find({"user_id": user_id}).sort("created_at", -1).limit(limit)
                return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
            except Exception as exc:
                log.warning("Mongo read failed: %s", exc)
        chats = _load_json(CHATS_FILE, [])
        return [c for c in chats if c.get("user_id") == user_id][:limit]


# ---------------------------------------------------------------------------
# Liked songs
# ---------------------------------------------------------------------------

def add_liked(user_id: str, track: Dict, mood_tag: str = "") -> Dict:
    record = {
        "_id": _new_id(),
        "user_id": user_id,
        "track_id": track.get("id") or track.get("title", "").lower(),
        "title": track.get("title", ""),
        "artist": track.get("artist", ""),
        "album": track.get("album", ""),
        "cover": track.get("cover", ""),
        "stream_url": track.get("stream_url", ""),
        "mood_tag": mood_tag,
        "liked_at": _now(),
    }
    with _lock:
        if _mongo():
            try:
                _db.liked_songs.insert_one(record)
                return record
            except Exception as exc:
                log.warning("Mongo liked insert failed: %s", exc)
        liked = _load_json(LIKED_FILE, [])
        # dedupe by (user, track_id)
        liked = [l for l in liked if not (l.get("user_id") == user_id and l.get("track_id") == record["track_id"])]
        liked.insert(0, record)
        _save_json(LIKED_FILE, liked)
    return record


def remove_liked(user_id: str, track_id: str) -> bool:
    with _lock:
        if _mongo():
            try:
                res = _db.liked_songs.delete_many({"user_id": user_id, "track_id": track_id})
                return res.deleted_count > 0
            except Exception as exc:
                log.warning("Mongo liked delete failed: %s", exc)
        liked = _load_json(LIKED_FILE, [])
        before = len(liked)
        liked = [l for l in liked if not (l.get("user_id") == user_id and l.get("track_id") == track_id)]
        _save_json(LIKED_FILE, liked)
        return len(liked) < before


def get_liked(user_id: str, limit: int = 200) -> List[Dict]:
    with _lock:
        if _mongo():
            try:
                cursor = _db.liked_songs.find({"user_id": user_id}).sort("liked_at", -1).limit(limit)
                return [{**doc, "_id": str(doc["_id"])} for doc in cursor]
            except Exception as exc:
                log.warning("Mongo liked read failed: %s", exc)
        liked = _load_json(LIKED_FILE, [])
        return [l for l in liked if l.get("user_id") == user_id][:limit]


def is_liked(user_id: str, track_id: str) -> bool:
    with _lock:
        if _mongo():
            try:
                return _db.liked_songs.find_one({"user_id": user_id, "track_id": track_id}) is not None
            except Exception:
                pass
        liked = _load_json(LIKED_FILE, [])
        return any(l.get("user_id") == user_id and l.get("track_id") == track_id for l in liked)


# ---------------------------------------------------------------------------
# Playlists (user-created)
# ---------------------------------------------------------------------------

def _playlist_track_key(track: Dict) -> str:
    """Stable key to dedupe tracks inside a playlist."""
    return track.get("id") or f"{track.get('title','').lower()}|{track.get('artist','').lower()}"


def create_playlist(user_id: str, name: str, emoji: str = "🎵") -> Dict:
    record = {
        "_id": _new_id(),
        "user_id": user_id,
        "name": (name or "My Playlist").strip()[:60],
        "emoji": emoji or "🎵",
        "tracks": [],
        "created_at": _now(),
    }
    with _lock:
        if _mongo():
            try:
                _db.playlists.insert_one(record)
                return record
            except Exception as exc:
                log.warning("Mongo playlist create failed: %s", exc)
        playlists = _load_json(PLAYLISTS_FILE, [])
        playlists.insert(0, record)
        _save_json(PLAYLISTS_FILE, playlists)
    return record


def list_playlists(user_id: str) -> List[Dict]:
    with _lock:
        if _mongo():
            try:
                cursor = _db.playlists.find({"user_id": user_id}).sort("created_at", -1)
                return [{**p, "_id": str(p["_id"]), "count": len(p.get("tracks", []))}
                        for p in cursor]
            except Exception as exc:
                log.warning("Mongo playlists read failed: %s", exc)
        playlists = _load_json(PLAYLISTS_FILE, [])
        return [{**p, "count": len(p.get("tracks", []))}
                for p in playlists if p.get("user_id") == user_id]


def get_playlist(playlist_id: str, user_id: str) -> Optional[Dict]:
    with _lock:
        if _mongo():
            try:
                p = _db.playlists.find_one({"_id": playlist_id, "user_id": user_id})
                return {**p, "_id": str(p["_id"])} if p else None
            except Exception as exc:
                log.warning("Mongo playlist get failed: %s", exc)
        for p in _load_json(PLAYLISTS_FILE, []):
            if p.get("_id") == playlist_id and p.get("user_id") == user_id:
                return p
    return None


def add_track_to_playlist(playlist_id: str, user_id: str, track: Dict) -> Optional[Dict]:
    track = {k: track.get(k, "") for k in ("id", "title", "artist", "album", "cover", "stream_url", "duration")}
    key = _playlist_track_key(track)
    with _lock:
        if _mongo():
            try:
                _db.playlists.update_one(
                    {"_id": playlist_id, "user_id": user_id,
                     "tracks.id": {"$ne": track.get("id") or key}},
                    {"$push": {"tracks": {**track, "_key": key}}})
                return get_playlist(playlist_id, user_id)
            except Exception as exc:
                log.warning("Mongo playlist add failed: %s", exc)
        playlists = _load_json(PLAYLISTS_FILE, [])
        for p in playlists:
            if p.get("_id") == playlist_id and p.get("user_id") == user_id:
                if any(_playlist_track_key(t) == key for t in p.get("tracks", [])):
                    return p
                p.setdefault("tracks", []).append({**track, "_key": key})
                _save_json(PLAYLISTS_FILE, playlists)
                return p
    return None


def remove_track_from_playlist(playlist_id: str, user_id: str, track_key: str) -> bool:
    with _lock:
        if _mongo():
            try:
                res = _db.playlists.update_one(
                    {"_id": playlist_id, "user_id": user_id},
                    {"$pull": {"tracks": {"_key": track_key}}})
                return res.modified_count > 0
            except Exception as exc:
                log.warning("Mongo playlist remove failed: %s", exc)
        playlists = _load_json(PLAYLISTS_FILE, [])
        for p in playlists:
            if p.get("_id") == playlist_id and p.get("user_id") == user_id:
                before = len(p.get("tracks", []))
                p["tracks"] = [t for t in p.get("tracks", []) if t.get("_key") != track_key]
                _save_json(PLAYLISTS_FILE, playlists)
                return len(p["tracks"]) < before
    return False


def delete_playlist(playlist_id: str, user_id: str) -> bool:
    with _lock:
        if _mongo():
            try:
                res = _db.playlists.delete_one({"_id": playlist_id, "user_id": user_id})
                return res.deleted_count > 0
            except Exception as exc:
                log.warning("Mongo playlist delete failed: %s", exc)
        playlists = _load_json(PLAYLISTS_FILE, [])
        before = len(playlists)
        playlists = [p for p in playlists if not (p.get("_id") == playlist_id and p.get("user_id") == user_id)]
        _save_json(PLAYLISTS_FILE, playlists)
        return len(playlists) < before


# ---------------------------------------------------------------------------
# User identity & Authentication
# ---------------------------------------------------------------------------

def register_user(username: str, email: str, password: str, name: str = "") -> Dict:
    username = username.strip().lower()
    email = email.strip().lower()
    if not username or not password:
        raise ValueError("Username and password are required")
    
    with _lock:
        if _mongo():
            try:
                if _db.users.find_one({"$or": [{"username": username}, {"email": email}]}):
                    raise ValueError("Username or email already registered")
                user_id = f"usr_{uuid.uuid4().hex[:10]}"
                doc = {
                    "_id": user_id, "user_id": user_id, "username": username,
                    "email": email, "password": password, "name": name or username.capitalize(),
                    "created_at": _now()
                }
                _db.users.insert_one(doc)
                return {"user_id": user_id, "username": username, "email": email, "name": doc["name"]}
            except ValueError:
                raise
            except Exception as exc:
                log.warning("Mongo user register failed: %s", exc)

        users = _load_json(USERS_FILE, [])
        for u in users:
            if u.get("username") == username or (email and u.get("email") == email):
                raise ValueError("Username or email already registered")
        
        user_id = f"usr_{uuid.uuid4().hex[:10]}"
        user_doc = {
            "_id": user_id,
            "user_id": user_id,
            "username": username,
            "email": email,
            "password": password,
            "name": name or username.capitalize(),
            "created_at": _now()
        }
        users.append(user_doc)
        _save_json(USERS_FILE, users)
        return {"user_id": user_id, "username": username, "email": email, "name": user_doc["name"]}


def authenticate_user(username_or_email: str, password: str) -> Optional[Dict]:
    identifier = username_or_email.strip().lower()
    with _lock:
        if _mongo():
            try:
                u = _db.users.find_one({
                    "$or": [{"username": identifier}, {"email": identifier}],
                    "password": password
                })
                if u:
                    return {"user_id": u["user_id"], "username": u["username"], "email": u.get("email", ""), "name": u.get("name", u["username"])}
            except Exception as exc:
                log.warning("Mongo auth failed: %s", exc)

        users = _load_json(USERS_FILE, [])
        for u in users:
            if (u.get("username") == identifier or u.get("email") == identifier) and u.get("password") == password:
                return {"user_id": u.get("user_id"), "username": u.get("username"), "email": u.get("email", ""), "name": u.get("name", u.get("username"))}
    return None


def get_or_create_user(user_id: str, username: str = "") -> Dict:
    """Simple identity helper — user docs are lightweight here."""
    return {"user_id": user_id or "usr_guest", "username": username or "Guest Listener"}


def health() -> Dict:
    return {"backend": "json_store" if not using_mongo() else "mongodb"}
