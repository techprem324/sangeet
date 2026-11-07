# Contributing to Sangeet 🎵

Thank you for your interest in contributing to **Sangeet**! Every helpful contribution—whether it is a bug fix, a UI improvement, documentation, or a new feature—is welcome.

Our goal is to build a better music experience together while keeping the project friendly, reliable, and accessible to contributors of different experience levels.

## Ways to contribute

You can help with:

- **Frontend and UI/UX:** React components, responsive layouts, accessibility, and visual improvements.
- **Music player:** Playback controls, streaming reliability, playlists, and audio experience.
- **Lyrics:** Synchronization, LRC parsing, and lyrics display.
- **Backend and APIs:** Flask endpoints, error handling, and performance.
- **Discovery and intelligence:** Mood-based search, recommendations, and related improvements.
- **Documentation and testing:** Setup instructions, bug reports, test coverage, and clearer documentation.

If you are unsure where to start, look for open issues labelled `good first issue` or `help wanted`. You can also open an issue to discuss an idea before writing code.

## Before you start

1. Check the existing issues and pull requests to avoid duplicate work.
2. For a significant feature or change, open an issue first and explain your proposal.
3. Be respectful and constructive when discussing ideas or reviewing code.
4. Only contribute code, media, and other assets that you have the right to share.

## Set up the project locally

### Prerequisites

- Node.js 18 or newer
- Python 3.10 or newer
- Git

### 1. Fork and clone

Fork the repository on GitHub, then clone your fork:

```bash
git clone https://github.com/YOUR-USERNAME/sangeet.git
cd sangeet
```

### 2. Install dependencies

Install the frontend dependencies:

```bash
npm --prefix frontend install
```

Install the backend dependencies:

```bash
pip install -r backend/requirements.txt
```

### 3. Run the application

Start the project using the repository's start command:

```bash
npm start
```

On Windows, you can also use the provided `start.bat` or run `./start.ps1` in PowerShell if available in your checkout.

If setup fails, please include your operating system, Node.js and Python versions, the command you ran, and the relevant error message when opening an issue. Never include passwords, API keys, tokens, or other secrets in logs.

## Create a branch

Create a separate branch for your work. Use a descriptive name:

```bash
git checkout -b fix/player-playback
```

Examples:

- `feature/mood-discovery`
- `fix/lyrics-sync`
- `docs/setup-guide`

## Make and test your changes

- Keep changes focused; avoid unrelated edits.
- Follow the existing code style and project structure.
- Reuse existing components and utilities where practical.
- Add or update tests when the project provides relevant tests.
- Run the relevant checks and test the affected feature locally.
- Check the experience at mobile and desktop screen sizes when changing the UI.
- Update documentation if your change affects setup, configuration, or user-facing behaviour.

Do not commit generated files, local environment files, credentials, private user data, or copyrighted music/media unless the project explicitly has permission to distribute them.

## Commit your changes

Write a short, meaningful commit message:

```bash
git add .
git commit -m "Fix synchronized lyrics scrolling"
```

## Submit a pull request

Push your branch to your fork:

```bash
git push origin fix/player-playback
```

Then open a Pull Request against the `main` branch of `techprem324/sangeet`.

In your PR description, please include:

- What you changed and why.
- The issue number, if your work addresses an existing issue (for example, `Closes #2` only when it actually closes that issue).
- How you tested the changes.
- Screenshots or a short recording for visual changes, where useful.
- Any known limitations or follow-up work.

A maintainer may ask questions or request changes before merging. Please keep the discussion friendly and update your PR when needed.

## Reporting bugs and requesting features

When opening an issue:

- Use a clear, specific title.
- For a bug, describe the steps to reproduce it and what you expected versus what happened.
- Include relevant browser, operating system, and version details.
- Add screenshots or error messages when they help explain the problem.
- For a feature request, explain the problem it solves and the behaviour you would like to see.

Please search existing issues before creating a new one.

## Community expectations

Be welcoming, patient, and respectful. Give feedback about the work rather than the person. Harassment, discrimination, personal attacks, and disruptive behaviour are not acceptable.

## Questions?

Open a discussion through a GitHub issue in the repository:

https://github.com/techprem324/sangeet/issues

Thank you for helping make Sangeet better. Happy contributing! ❤️
