# 🎵 Sangeet — AI Music Chatbot

> *Dil Se Zuba Tak* — Tell Sangeet how you feel in plain words, and it reads your mood, maps it to musical audio features, and plays **full 320 kbps tracks** right inside the app. No premium account required. No ads.

---

## 🔗 Live Application Links

- 🌐 **Frontend Local Web App**: [http://localhost:5173](http://localhost:5173)
- ⚙️ **Backend REST API**: [http://127.0.0.1:5000](http://127.0.0.1:5000)
- 🩺 **API Health Endpoint**: [http://127.0.0.1:5000/api/health](http://127.0.0.1:5000/api/health)

---

## ✨ Features Matrix

| Feature | Description |
| :--- | :--- |
| 🧠 **Mood-Reading NLP** | Real-time sentiment & situation analyzer mapping text prompt → valence, energy, danceability & genre targets with a **live mood radar**. |
| 🔑 **User Sign In & Sync** | User accounts (Sign In / Sign Up) so your custom playlists, saved songs, and AI chat history persist across sessions. |
| 🎧 **Full 320kbps Audio Streams** | Custom HTML5 web audio player delivering direct 320kbps streams via PyCryptodome DES-ECB CDN decryption with multi-tier fallback resolution. |
| 💬 **AI Music Chat** | Natural conversational assistant complete with explainable AI reasoning (*"Why these songs?"*) and persistent message history. |
| 🎨 **Interactive Hero Artwork** | Animated listening room illustration with dynamic hover-bubble motion effects on floating musical notes, headphones, vinyl record, and moon. |
| 📚 **10 Mood Rooms** | Curated mood playlists (Broken Heart, Rainy Night, Lo-Fi Focus, Gym Beast, Love Vibes, …) expandable live to **500+ tracks** per room. |
| 📜 **Karaoke Lyrics** | Line-synchronized scrolling lyrics overlay that highlights current lines as the song plays. |
| 🔍 **Universal Search** | Search any track or artist instantly and play high-quality audio streams immediately. |
| 💖 **Saved Library & Playlists** | Like tracks anywhere to build your personalized library, plus full custom playlist creation and reordering. |
| 🗄️ **Zero-Break Storage** | MongoDB integration with automatic thread-safe JSON file store fallback. |

---

## 🛠️ Technology Stack

| Layer | Technology Used |
| :--- | :--- |
| **Frontend Framework** | React 18, Vite, HTML5 Web Audio API |
| **Styling & UI** | TailwindCSS, Glassmorphism CSS Tokens, Custom Keyframe Animations, Lucide Iconography |
| **Backend Framework** | Python 3.10+, Flask REST API, Flask-CORS |
| **Database & Auth** | MongoDB (PyMongo) + Thread-Safe JSON Store Fallback |
| **NLP Engine** | Custom Rule-Based Lexicon Sentiment Engine + Spotify Acoustic Targeter (*"The Brain"*) |
| **Audio Streaming & Decryption** | JioSaavn API + PyCryptodome DES-ECB Cipher (*"The Player"*) |
| **Synchronized Lyrics** | LRCLIB API Integration |

---

## ⚡ Quick Start & Development

### Single Terminal Command (Recommended)

From the project root directory:

```bash
# Launch both Backend (Flask :5000) and Frontend (Vite :5173) simultaneously
npm start
```

### Windows Launch Shortcuts

- **Command Prompt (CMD)**: Double-click [`start.bat`](file:///d:/song/start.bat) or run `start.bat`.
- **PowerShell**: Run `.\start.ps1` in PowerShell.

---

## 🏗️ System Workflow Architecture

```
                                 ┌───────────────────────────┐
                                 │     User Mood Input       │
                                 └─────────────┬─────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │    NLP Emotion Vector     │
                                 │ (Valence, Energy, Genres) │
                                 └─────────────┬─────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       ▼                                               ▼
          ┌──────────────────────────┐                   ┌──────────────────────────┐
          │  Spotify Acoustic Target │                   │ Curated Catalog & Search │
          │       ("The Brain")      │                   │      ("The Player")      │
          └────────────┬─────────────┘                   └────────────┬─────────────┘
                       │                                               │
                       └───────────────────────┬───────────────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │ JioSaavn DES-ECB Decrypt  │
                                 │  (Direct 320kbps CDN Url) │
                                 └─────────────┬─────────────┘
                                               │
                                               ▼
                                 ┌───────────────────────────┐
                                 │    HTML5 Audio Engine     │
                                 │ & Synced Karaoke Lyrics   │
                                 └───────────────────────────┘
```

---

## 🔌 API Endpoint Summary

| Method | Route | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Create a new user account |
| `POST` | `/api/auth/login` | Authenticate user & retrieve account session |
| `POST` | `/api/chat` | Send prompt → receive mood vector + 320kbps tracks |
| `POST` | `/api/mood` | Pure NLP sentiment analysis (live mood radar) |
| `GET` | `/api/categories` | List all 10 curated mood room categories |
| `GET` | `/api/catalog` | Get tracks for a specific mood category |
| `POST` | `/api/explore` | Live-expand a mood room category to 500+ tracks |
| `GET` | `/api/search` | Search songs & artists on JioSaavn |
| `GET` | `/api/lyrics` | Fetch line-synchronized karaoke lyrics |
| `GET` / `POST` | `/api/playlists` | Fetch or create user playlists |
| `GET` / `POST` | `/api/liked` | Get or save liked songs to user library |
| `GET` | `/api/health` | System health probe (Backend, DB, CDN status) |

---

## 🌐 Production Deployment Guide

To deploy this project to production:

1. **Frontend Deployment (Vercel, Netlify, or AWS Amplify)**:
   ```bash
   cd frontend
   npm run build
   ```
   Deploy the `frontend/dist` static build folder to your hosting provider.

2. **Backend Deployment (Render, Railway, Heroku, or VPS)**:
   Deploy the `backend/` folder using a Python WSGI server (e.g. `gunicorn app:app`).

---

## 📜 License & Evaluation Note

Built for educational demonstration and evaluation. JioSaavn endpoints are accessed via community-documented public API methods.
