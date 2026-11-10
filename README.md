# Sangeet 🎵

<p align="center">
  <strong>A mood-aware music discovery and listening experience.</strong><br/>
  Describe how you feel, explore curated mood rooms, discover tracks, and keep your music in one place.
</p>

<p align="center">
  <a href="https://sangeett.netlify.app/">Live Demo</a> ·
  <a href="https://github.com/techprem324/sangeet/issues">Report a Bug</a> ·
  <a href="CONTRIBUTING.md">Contribute</a>
</p>

---

## Overview

**Sangeet** is a full-stack music web application built around mood-based discovery. Its chat experience analyses a listener's text, maps it to a mood profile, and recommends tracks. Listeners can also browse mood categories, search for songs, view lyrics, and manage liked tracks and playlists.

The application uses a React frontend and a Flask backend. JioSaavn is used for live music search and stream resolution; a curated local catalog provides a fallback. Spotify integration is optional and requires developer credentials.

## Features

- **Mood-aware music discovery** — describe a feeling or situation and receive mood-based recommendations.
- **Mood rooms** — browse curated categories such as focus, workout, rainy night, love, and nostalgia.
- **Live music search** — search the available music catalog.
- **Playback experience** — shared player state, queue controls, and track playback in the frontend.
- **Lyrics** — retrieve lyrics for supported tracks.
- **Personal library** — liked songs, playlists, and listening history.
- **Flexible data layer** — MongoDB can be configured; the backend also supports a local JSON-store fallback.
- **Responsive web interface** — React UI powered by Vite.

## Application flow

1. A listener enters a message or chooses a mood room.
2. The Flask API analyses the request and builds a mood profile.
3. Sangeet selects tracks from its curated catalog and/or live music search.
4. The frontend displays the recommendations and passes playable tracks to the shared player.

## Technology stack

| Layer | Technologies |
|---|---|
| Frontend | React 18, Vite, JavaScript |
| Styling | Tailwind CSS, PostCSS |
| Backend | Python, Flask, Flask-CORS |
| Music services | JioSaavn API; optional Spotify integration |
| Data | Local JSON store; optional MongoDB |
| Utilities | Requests, PyCryptodome, python-dotenv |

## Getting started

### Prerequisites

- Node.js 18 or newer
- Python 3.10 or newer
- npm and Git

### 1. Clone the repository

```bash
git clone https://github.com/techprem324/sangeet.git
cd sangeet
```

### 2. Install frontend dependencies

```bash
npm --prefix frontend install
```

### 3. Install backend dependencies

Create and activate a virtual environment (recommended), then install the requirements.

**Windows PowerShell**
```powershell
py -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r backend/requirements.txt
```

**macOS / Linux**
```bash
python3 -m venv venv
source venv/bin/activate
pip install -r backend/requirements.txt
```

### 4. Start the application

From the repository root:

```bash
npm start
```

This starts the Flask backend and Vite frontend together. You can also start them separately:

```bash
# Terminal 1 — backend
python backend/app.py

# Terminal 2 — frontend
npm --prefix frontend run dev
```

Open the local URL printed by Vite in your terminal. The development server proxies `/api` requests to the Flask API at `http://127.0.0.1:5000`.

> **Windows note:** the repository also includes `start.bat` and `start.ps1` launch helpers.

## Configuration

The application can run with its local catalog and JSON-store fallback. Optional integrations can be configured through environment variables.

- Use the backend environment example/configuration files in your checkout as the source of truth for supported variable names.
- Configure MongoDB only if you want to use the database integration.
- Configure Spotify credentials only if you want to enable the optional Spotify integration.
- Never commit real API keys, passwords, tokens, or local `.env` files.

## API reference

The backend API is served locally at `http://127.0.0.1:5000`.

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/health` | Service and dependency health |
| POST | `/api/chat` | Mood-aware chat and track recommendations |
| POST | `/api/mood` | Analyse a mood profile |
| GET | `/api/categories` | List mood categories |
| GET | `/api/catalog` | Retrieve tracks from a mood category |
| POST | `/api/explore` | Explore additional tracks |
| GET | `/api/search` | Search for music |
| GET | `/api/lyrics` | Retrieve track lyrics |
| GET / POST / DELETE | `/api/playlists` and related routes | Manage playlists |
| GET / POST / DELETE | `/api/liked` and related routes | Manage liked songs |
| GET | `/api/history` | Retrieve listening/chat history |

See **[docs/API.md](docs/API.md)** for request bodies, response examples, and complete route details.

## Repository structure

The project is organised by application layer so the frontend, backend, and project documentation stay separate.

```text
sangeet/
├── backend/
│   ├── app.py
│   ├── data/
│   │   ├── catalog/
│   │   └── store/
│   ├── scripts/
│   ├── services/
│   ├── tests/
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── data/
│   │   └── store/
│   ├── package.json
│   └── vite.config.js
├── docs/
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── ARCHITECTURE_OVERVIEW.md
│   ├── DEPLOYMENT.md
│   ├── PRODUCTION_READINESS.md
│   └── SECURITY_REVIEW.md
├── .gitignore
├── CONTRIBUTING.md
├── package.json
├── SECURITY.md
├── SUPPORT.md
├── start.bat
└── start.ps1
```

> This is a high-level map of the main project areas, not an exhaustive listing of every source file.

## Documentation

- [API Reference](docs/API.md)
- [Architecture Deep-Dive](docs/ARCHITECTURE.md)
- [Architecture Overview](docs/ARCHITECTURE_OVERVIEW.md)
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Production Readiness](docs/PRODUCTION_READINESS.md)
- [Security Review](docs/SECURITY_REVIEW.md)
- [Contributing Guide](CONTRIBUTING.md)
- [Support](SUPPORT.md)
- [Security Policy](SECURITY.md)

## Contributing

Contributions are welcome — bug fixes, UI improvements, accessibility enhancements, tests, and documentation are all valuable.

1. Read [CONTRIBUTING.md](CONTRIBUTING.md).
2. Check existing issues before starting work.
3. Create a focused branch for your change.
4. Test the affected functionality.
5. Open a pull request with a clear summary and test notes.

## Security

Do not commit secrets or personal data. Before using this project with real users or sensitive information, review [SECURITY.md](SECURITY.md), [Production Readiness](docs/PRODUCTION_READINESS.md), and [Security Review](docs/SECURITY_REVIEW.md).

## Project

- **Live application:** https://sangeett.netlify.app/
- **Repository:** https://github.com/techprem324/sangeet
- **Issues:** https://github.com/techprem324/sangeet/issues

---

<p align="center">Made with ❤️ for music lovers.</p>
