# 🧭 Digital Footprint Extension

A privacy-focused Chrome extension that tracks how you spend time across websites and turns it into a simple daily dashboard — categories, top sites, and browsing streaks — all stored locally on your device.

## Overview

Most people have no real visibility into where their browsing time actually goes. Digital Footprint runs quietly in the background, watches which tab is active, and records how long you spend on each website. That data is automatically grouped into categories (technology, education, entertainment, social, and more) and summarized in a popup dashboard so you can see today's activity, your longest streak of active days, and a searchable history — without any of it leaving your machine.

It's built as a Manifest V3 Chrome extension with a React + TypeScript popup UI and a background service worker that does the actual tracking.

## Features

**Activity tracking**
- Tracks time spent on websites by monitoring the currently active tab (tab switches, navigation, and page loads)
- Only tracks the foreground tab — session tracking starts/stops as you switch between tabs or navigate
- Automatically ends and saves a session when a tab is closed, or when the browser/service worker restarts
- A pause/resume toggle in Settings lets you stop tracking at any time; tracking is on by default

**Categorization**
- Visited domains are matched against a built-in database of ~100 known websites (e.g. GitHub, Stack Overflow, Wikipedia, ESPN, Cricbuzz) and classified into one of 13 categories: Education, Technology, Sports, News, Social, Entertainment, Business, Shopping, Finance, Gaming, Health, Travel, or Other
- Unrecognized domains fall back to the "Other" category rather than being dropped

**Dashboard (popup)**
- Today's total visits and total browsing time at a glance
- Current streak and longest streak of consecutive active days
- Top categories and top websites for the day, ranked by visit count

**History**
- Full visit history, grouped and collapsible by category, with per-visit time and duration

**Streaks**
- An "active day" is any day with at least one recorded visit
- Current and longest streaks are calculated from the full visit history (streak logic also has unit tests)

**Privacy & data controls (Settings)**
- All data is stored locally via `chrome.storage.local` — nothing is sent to a server
- Live counts of total visits stored and total days tracked
- One-click "Clear All History" to permanently wipe stored data, with a confirmation prompt

## 📸 Screenshots

_No screenshots are included in the repository yet. Once available, they'll be added here as relative links, e.g._

```md
![Dashboard](./docs/screenshots/dashboard.png)
```

## How It Works

```
User browses the web
        ↓
chrome.tabs events (onActivated / onUpdated / onRemoved)
        ↓
Background service worker (session tracker)
        ↓
Domain classifier (category lookup)
        ↓
chrome.storage.local (visits + daily aggregates)
        ↓
React popup UI (Dashboard / History / Settings)
```

- **Background service worker** (`src/background/index.ts`, `sessionTracker.ts`) — listens for tab activation, navigation, and tab-close events. It resolves the domain of the active tab, classifies it, and starts/ends an in-memory "session" per tab, stored in `chrome.storage.local` so it survives service worker restarts. Sessions are ignored entirely while tracking is paused.
- **Classifier** (`src/category/`) — maps a hostname to a website name and category using a static lookup table, defaulting unknown domains to `other`.
- **Storage layer** (`src/storage/`) — a thin wrapper around `chrome.storage.local` (`storage.ts`), a visit recorder that appends completed sessions and updates per-day website/category aggregates (`activityStore.ts`), a tracking on/off flag (`trackingState.ts`), and data management utilities for clearing history and summarizing stored data (`dataManager.ts`).
- **Streak engine** (`src/streaks/streakEngine.ts`) — derives current/longest streaks (overall, per-website, or per-category) from the days that have recorded activity.
- **Popup UI** (`src/App.tsx`, `src/popup/`, `src/components/`) — a React app with three views: the main Dashboard (streak, today's summary, top categories/websites), History (all visits grouped by category), and Settings (tracking toggle, storage stats, clear-data control).

## Tech Stack

| Layer | Technology |
|---|---|
| UI framework | React 19 |
| Language | TypeScript |
| Build tool | Vite |
| Extension platform | Chrome Extension (Manifest V3) |
| Extension APIs | `chrome.tabs`, `chrome.storage`, `chrome.alarms` (permission declared) |
| Storage | `chrome.storage.local` |
| Linting | ESLint (typescript-eslint, react-hooks, react-refresh) |
| Testing | Unit test for the streak engine (`streakEngine.test.ts`) |

## Project Structure

```
digital-footprint-extension/
├── public/
│   ├── manifest.json        # Manifest V3 config
│   ├── favicon.svg
│   └── icons.svg
├── src/
│   ├── background/          # Service worker: tab tracking & session lifecycle
│   ├── category/            # Domain → website/category classification
│   ├── components/          # History and Settings views
│   ├── history/              # Visit history retrieval
│   ├── popup/                # Dashboard data aggregation
│   ├── shared/                # Shared TypeScript types
│   ├── storage/               # chrome.storage.local wrappers & data management
│   ├── streaks/                # Streak calculation + tests
│   ├── App.tsx                 # Popup root component
│   └── main.tsx                 # React entry point
├── index.html                   # Popup HTML entry
├── vite.config.ts                # Builds popup + background as separate bundles
└── package.json
```

## Getting Started

### Prerequisites
- Node.js and npm
- Google Chrome (or another Chromium-based browser)

### Installation

```bash
git clone https://github.com/abhi9av-pareek/digital-footprint-extension.git
cd digital-footprint-extension
npm install
```

### Build

```bash
npm run build
```

This produces a `dist/` folder containing the built popup assets and a `background.js` service worker bundle.

### Load into Chrome

1. Open `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the `dist/` folder generated by the build

### Development

```bash
npm run dev      # Vite dev server for the popup UI
npm run lint     # Run ESLint
npm run preview  # Preview a production build
```

> Note: `npm run dev` serves the popup UI for fast iteration, but Chrome extension APIs (`chrome.tabs`, `chrome.storage`) only work when the extension is loaded into the browser via `chrome://extensions`, so background/tracking behavior should be verified using a built (`npm run build`) and loaded copy.

## Permissions

Declared in `manifest.json`:

| Permission | Why it's needed |
|---|---|
| `tabs` | Detect the active tab and its URL to track visits |
| `storage` | Persist visit history and settings locally |
| `alarms` | Reserved for scheduled/background tasks |

## Privacy

All browsing data is written to `chrome.storage.local` on your own machine. The extension makes no network requests and does not transmit browsing data anywhere. You can pause tracking or permanently delete all stored history at any time from the Settings screen.

## License

No license file is currently included in this repository. Add one (e.g. MIT) if you intend to open-source this project.
