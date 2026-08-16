"""
app.py
======
Sangeet backend — Flask REST API.

Routes
------
  GET    /api/health                pipeline health probe
  POST   /api/chat                  main chat -> recommendation endpoint
  POST   /api/mood                  pure NLP analysis (mood radar demo)
  GET    /api/categories            curated category list
  GET    /api/catalog               tracks for one category
  POST   /api/explore               live-expand a category via JioSaavn
  GET    /api/search                app-wide song search (JioSaavn)
  GET    /api/lyrics                lyrics for a song id
  GET    /api/history               past conversations for a user
  GET    /api/liked                 liked songs
  POST   /api/liked                 like a song
  DELETE /api/liked/<track_id>      unlike a song

Run:
    python app.py            (dev, default port 5000)
    flask --app app run      (alternative)
"""

from __future__ import annotations

import logging
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from services import catalog_service, db_service, hybrid_pipeline, jiosaavn_service, lyrics_service

load_dotenv()

logging.basicConfig(level=logging.INFO,
                    format="%(asctime)s | %(levelname)-7s | %(name)s | %(message)s")

app = Flask(__name__)
CORS(app)  # allow the Vite dev server (and any origin) to call the API


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _json_body():
    data = request.get_json(silent=True) or {}
    return data


def _user(data: dict) -> str:
    return str(data.get("user_id") or "usr_guest")


def _session() -> str:
    sid = request.headers.get("X-Session-Id")
    if sid:
        return sid
    return "sess_" + datetime.now(timezone.utc).strftime("%Y%m%d_%H%M%S")


# ---------------------------------------------------------------------------
# Core endpoints
# ---------------------------------------------------------------------------

@app.get("/api/health")
def health():
    js = jiosaavn_service.health()
    return jsonify({
        "status": "ok",
        "time": datetime.now(timezone.utc).isoformat(),
        "jiosaavn": js,
        "spotify": {"enabled": __import__("services.spotify_service", fromlist=["enabled"]).enabled()},
        "database": db_service.health(),
        "catalog": catalog_service.stats(),
    })


@app.post("/api/chat")
def chat():
    """The main route: text in -> mood + playable tracks out."""
    data = _json_body()
    text = str(data.get("prompt") or data.get("text") or "").strip()
    if not text:
        return jsonify({"error": "empty prompt"}), 400
    try:
        payload = hybrid_pipeline.chat(
            text=text,
            user_id=_user(data),
            session_id=_session(),
            mood_hint=str(data.get("mood_hint") or ""),
        )
        return jsonify(payload)
    except Exception as exc:
        logging.exception("chat failed")
        return jsonify({"error": str(exc)}), 500


@app.post("/api/mood")
def mood_only():
    """Pure NLP analysis — powers the live mood-radar widget."""
    data = _json_body()
    text = str(data.get("prompt") or "").strip()
    if not text:
        return jsonify({"error": "empty prompt"}), 400
    return jsonify(hybrid_pipeline.analyze_only(text, str(data.get("mood_hint") or "")))


# ---------------------------------------------------------------------------
# Catalog & search
# ---------------------------------------------------------------------------

@app.get("/api/categories")
def categories():
    return jsonify({"categories": catalog_service.categories()})


@app.get("/api/catalog")
def catalog():
    category = request.args.get("category", "")
    limit = min(int(request.args.get("limit", "30")), 100)
    resolve = request.args.get("resolve", "1") != "0"
    tracks = catalog_service.category_tracks(category, limit=limit, resolve=resolve)
    return jsonify({"category": category, "tracks": tracks})


@app.post("/api/explore")
def explore():
    """Live-expand a category with fresh JioSaavn tracks (the 500+ story)."""
    data = _json_body()
    category = str(data.get("category") or "")
    count = min(int(data.get("count") or 24), 60)
    if not category:
        return jsonify({"error": "category required"}), 400
    return jsonify({"category": category, "tracks": catalog_service.explore(category, count=count)})


@app.get("/api/search")
def search():
    """Search any song on JioSaavn and get a playable stream."""
    q = request.args.get("q", "").strip()
    if len(q) < 2:
        return jsonify({"tracks": []})
    return jsonify({"tracks": catalog_service.search_songs(q, limit=12)})


@app.get("/api/lyrics")
def lyrics():
    """
    Line-synced lyrics. Prefer ?title=&artist= (best lrclib match);
    ?id= is used as a JioSaavn fallback / metadata hint.
    Returns { synced, lines: [{t, text}], text, title }.
    """
    title = request.args.get("title", "")
    artist = request.args.get("artist", "")
    sid = request.args.get("id", "")
    if not (title or sid):
        return jsonify({"error": "title or id required"}), 400
    result = lyrics_service.get_synced(title, artist, sid)
    return jsonify(result)


# ---------------------------------------------------------------------------
# Playlists (user-created)
# ---------------------------------------------------------------------------

@app.get("/api/playlists")
def playlists_list():
    user = request.args.get("user_id") or "usr_guest"
    return jsonify({"playlists": db_service.list_playlists(user)})


@app.post("/api/playlists")
def playlists_create():
    data = _json_body()
    user = _user(data)
    playlist = db_service.create_playlist(user, str(data.get("name") or ""),
                                          str(data.get("emoji") or "🎵"))
    return jsonify({"playlist": playlist}), 201


@app.get("/api/playlists/<playlist_id>")
def playlists_get(playlist_id):
    user = request.args.get("user_id") or "usr_guest"
    p = db_service.get_playlist(playlist_id, user)
    if not p:
        return jsonify({"error": "playlist not found"}), 404
    return jsonify({"playlist": p})


@app.post("/api/playlists/<playlist_id>/tracks")
def playlists_add_track(playlist_id):
    data = _json_body()
    user = _user(data)
    track = data.get("track") or {}
    if not track.get("title"):
        return jsonify({"error": "track required"}), 400
    p = db_service.add_track_to_playlist(playlist_id, user, track)
    if not p:
        return jsonify({"error": "playlist not found"}), 404
    return jsonify({"playlist": p})


@app.delete("/api/playlists/<playlist_id>/tracks/<track_key>")
def playlists_remove_track(playlist_id, track_key):
    user = request.args.get("user_id") or "usr_guest"
    removed = db_service.remove_track_from_playlist(playlist_id, user, track_key)
    return jsonify({"removed": removed})


@app.delete("/api/playlists/<playlist_id>")
def playlists_delete(playlist_id):
    user = request.args.get("user_id") or "usr_guest"
    removed = db_service.delete_playlist(playlist_id, user)
    return jsonify({"removed": removed})


# ---------------------------------------------------------------------------
# History & liked songs
# ---------------------------------------------------------------------------

@app.get("/api/history")
def history():
    user = request.args.get("user_id") or "usr_guest"
    return jsonify({"history": db_service.get_history(user, limit=40)})


@app.get("/api/liked")
def liked_list():
    user = request.args.get("user_id") or "usr_guest"
    return jsonify({"liked": db_service.get_liked(user)})


@app.post("/api/liked")
def liked_add():
    data = _json_body()
    user = _user(data)
    track = data.get("track") or {}
    if not track.get("title"):
        return jsonify({"error": "track required"}), 400
    record = db_service.add_liked(user, track, str(data.get("mood_tag") or ""))
    return jsonify({"liked": record})


@app.delete("/api/liked/<track_id>")
def liked_remove(track_id):
    user = request.args.get("user_id") or "usr_guest"
    removed = db_service.remove_liked(user, track_id)
    return jsonify({"removed": removed})


# ---------------------------------------------------------------------------
# User Authentication (Sign In & Sign Up)
# ---------------------------------------------------------------------------

@app.post("/api/auth/register")
def auth_register():
    data = _json_body()
    username = str(data.get("username") or "").strip()
    email = str(data.get("email") or "").strip()
    password = str(data.get("password") or "").strip()
    name = str(data.get("name") or "").strip()
    if not username or not password:
        return jsonify({"error": "username and password are required"}), 400
    try:
        user = db_service.register_user(username, email, password, name)
        return jsonify({"status": "ok", "user": user}), 201
    except ValueError as err:
        return jsonify({"error": str(err)}), 400
    except Exception as exc:
        logging.exception("Registration error")
        return jsonify({"error": "Failed to create account"}), 500


@app.post("/api/auth/login")
def auth_login():
    data = _json_body()
    username_or_email = str(data.get("username") or data.get("email") or "").strip()
    password = str(data.get("password") or "").strip()
    if not username_or_email or not password:
        return jsonify({"error": "username and password required"}), 400
    user = db_service.authenticate_user(username_or_email, password)
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401
    return jsonify({"status": "ok", "user": user})


# ---------------------------------------------------------------------------
# Production: serve the built frontend from the same server
# ---------------------------------------------------------------------------

_FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")


@app.get("/")
def index():
    if os.path.exists(os.path.join(_FRONTEND_DIST, "index.html")):
        return app.send_static_file("index.html") if False else _serve_frontend()
    return jsonify({"app": "Sangeet API", "docs": "see README.md",
                    "health": "/api/health"})


def _serve_frontend():
    from flask import send_from_directory
    return send_from_directory(_FRONTEND_DIST, "index.html")


# Serve frontend build assets when present
if os.path.isdir(_FRONTEND_DIST):
    from flask import send_from_directory

    @app.get("/assets/<path:path>")
    def _assets(path):
        return send_from_directory(os.path.join(_FRONTEND_DIST, "assets"), path)


if __name__ == "__main__":
    port = int(os.getenv("PORT", "5000"))
    host = os.getenv("HOST", "127.0.0.1")
    print(f"\n  Sangeet API listening on http://{host}:{port}\n")
    app.run(host=host, port=port, debug=True, threaded=True)
