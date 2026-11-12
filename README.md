<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=120&section=header&animation=fadeIn" width="100%" alt="" />

<img src="docs/assets/banner.svg" width="100%" alt="Sangeet - Dil Se Zuba Tak" />

<a href="https://sangeett.netlify.app/">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=22&pause=1000&color=FF8A2A&center=true&vCenter=true&width=700&lines=Tell+me+how+you+feel.;Sangeet+will+find+the+song.;320+kbps.+No+premium.+No+login.;Where+your+emotions+become+soundwaves." alt="Typing animation" />
</a>

<br/>

[![Live Demo](https://img.shields.io/badge/▶_LIVE_DEMO-sangeett.netlify.app-FF5500?style=for-the-badge&logo=netlify&logoColor=white)](https://sangeett.netlify.app/)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Flask](https://img.shields.io/badge/Flask-API-000000?style=for-the-badge&logo=flask&logoColor=white)](https://flask.palletsprojects.com/)
[![Audio](https://img.shields.io/badge/Audio-320_kbps-00F5D4?style=for-the-badge&logo=soundcharts&logoColor=black)](https://sangeett.netlify.app/)

</div>

<br/>

<div align="center">

## 🎬 Feel → Vector → Song

<img src="docs/assets/flow.svg" width="100%" alt="Mood to song flow" />

</div>

<br/>

<div align="center">

## 📸 See It

<img src="docs/screenshots/home.png" width="94%" alt="Sangeet home" />

<br/><br/>

<table>
  <tr>
    <td align="center" width="50%"><img src="docs/screenshots/search.png" alt="Search" /><br/><sub><b>🔎 Search</b></sub></td>
    <td align="center" width="50%"><img src="docs/screenshots/player.png" alt="Music player" /><br/><sub><b>🎵 Music Player</b></sub></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="docs/screenshots/library.png" alt="Music library" /><br/><sub><b>📚 Library</b></sub></td>
    <td align="center" width="50%"><img src="docs/screenshots/playlists.png" alt="Playlists" /><br/><sub><b>🎧 Playlists</b></sub></td>
  </tr>
  <tr>
    <td align="center" width="50%"><img src="docs/screenshots/playlist-detail.png" alt="Playlist details" /><br/><sub><b>🎼 Playlist Details</b></sub></td>
    <td align="center" width="50%"></td>
  </tr>
</table>

</div>

<br/>

<div align="center">

## 🌌 Mood Rooms

<img src="docs/assets/rooms.svg" width="100%" alt="Mood rooms strip" />

</div>

<br/>

<div align="center">

## 🧠 Live Mood Radar &nbsp;·&nbsp; 🎤 Synced Lyrics

<table>
  <tr>
    <td><img src="docs/assets/radar.svg" width="100%" alt="Mood radar" /></td>
    <td><img src="docs/assets/player.svg" width="100%" alt="Player with synced lyrics" /></td>
  </tr>
</table>

</div>

<br/>

<div align="center">

## ⚡ Why It Hits Different

|  | Others | 🎵 Sangeet |
| :-- | :--: | :--: |
| Audio | 128 kbps free | **320 kbps free** |
| Ads | 😩 | **None** |
| Search | genre tags | **your feelings** |
| Login | required | **guest mode** |
| Lyrics | paywalled | **synced, built in** |

</div>

<br/>

<div align="center">

## 🧩 Stack

<img src="https://skillicons.dev/icons?i=react,vite,tailwind,js,python,flask,mongodb,netlify,git,github&theme=dark" alt="Tech stack" />

</div>

<details>
<summary><b>📁 Project layout</b></summary>

```text
frontend/                 React + Vite application and search tests
backend/                  Flask API, services, data, and scripts
backend/data/datasets/    Song source and cleaned datasets
docs/assets/              README illustrations
docs/screenshots/         Application screenshots
```

</details>

<details>
<summary><b>🏗️ Architecture</b></summary>

```mermaid
flowchart LR
    You(["You: 'rainy 2am'"]) --> UI["React UI"]
    UI --> NLP["Emotion engine"]
    NLP --> V["valence · energy · dance · acoustic"]
    V --> API["Flask API"]
    API --> Cipher["DES-ECB decrypt"] --> CDN["320 kbps CDN"]
    CDN --> Player["Web Audio player"]
    Player <--> Lyrics["LRCLIB lyrics via Netlify proxy"]
    UI -.-> Store[("MongoDB / JSON store")]
```

</details>

<details>
<summary><b>💻 Run it locally</b></summary>

```bash
git clone https://github.com/techprem324/sangeet.git
cd sangeet
npm --prefix frontend install
pip install -r backend/requirements.txt
npm start
```

Windows: run `start.bat` or `.\start.ps1`. App at `localhost:5173`, API at `localhost:5000/api`.

</details>

<details>
<summary><b>📡 API endpoints</b></summary>

| Method | Route | What it does |
| :-- | :-- | :-- |
| `POST` | `/api/chat` | Mood prompt → vectors + tracks |
| `POST` | `/api/mood` | Valence, energy, genre affinities |
| `GET` | `/api/lyrics` | Synced lyric lines |
| `GET` | `/api/catalog` | Mood room collections |
| `POST` | `/api/explore` | Expand a room to 500+ songs |
| `GET` | `/api/search` | Instant search |
| `GET` `POST` | `/api/playlists` | Playlists |
| `GET` `POST` | `/api/liked` | Liked songs |
| `POST` | `/api/auth/login` · `/register` | Accounts |

</details>

<br/>

<div align="center">

### Made with ❤️ by **[Prem Srivastava](https://github.com/techprem324)**

**[⚡ Open the app → sangeett.netlify.app](https://sangeett.netlify.app/)** &nbsp;·&nbsp; ⭐ Star if it hit the right chord

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=12,20,24&height=100&section=footer" width="100%" alt="" />

</div>
