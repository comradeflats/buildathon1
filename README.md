# Buildathon Portal

A modern hackathon judging platform built with Next.js, Firebase, and Vertex AI.

---

## Features

<img src="https://unpkg.com/lucide-static@latest/icons/trophy.svg" width="20" height="20" alt="trophy"> **Live Leaderboard** - Real-time rankings with tiebreaker logic

<img src="https://unpkg.com/lucide-static@latest/icons/vote.svg" width="20" height="20" alt="vote"> **Voting System** - Theme-specific judging criteria with 1-5 scoring

<img src="https://unpkg.com/lucide-static@latest/icons/sparkles.svg" width="20" height="20" alt="sparkles"> **AI Theme Generation** - Vertex AI generates unique hackathon themes

<img src="https://unpkg.com/lucide-static@latest/icons/github.svg" width="20" height="20" alt="github"> **GitHub Integration** - Auto-fetch repo metadata for submissions

<img src="https://unpkg.com/lucide-static@latest/icons/calendar.svg" width="20" height="20" alt="calendar"> **Event Management** - Create and manage multiple hackathon events

<img src="https://unpkg.com/lucide-static@latest/icons/shield.svg" width="20" height="20" alt="shield"> **Admin Dashboard** - Secure admin controls for event and team management

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Styling | Tailwind CSS |
| Database | Firebase Firestore |
| Auth | Firebase Admin SDK |
| AI | Google Vertex AI (Gemini) |
| Icons | Lucide React |

---

## Getting Started

### Prerequisites

- Node.js 18+
- Firebase project with Firestore enabled
- Google Cloud project with Vertex AI API enabled

### Installation

```bash
git clone <repo-url>
cd judge-app
npm install
```

### Environment Variables

Create a `.env.local` file:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=

ADMIN_PASSWORD_HASH=
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Production Build

```bash
npm run build
npm start
```

---

## Project Structure

```
src/
  app/
    page.tsx          # Home
    submit/           # Team submission form
    vote/             # Judging interface
    leaderboard/      # Live rankings
    events/           # Event listing & details
    admin/            # Admin dashboard
    api/              # API routes
  components/         # Reusable UI components
  lib/                # Utilities, types, Firebase config
```

---

## Routes

| Path | Description |
|------|-------------|
| `/` | Home page |
| `/submit` | Submit a team project |
| `/vote` | Judge submitted projects |
| `/leaderboard` | View live rankings |
| `/events` | Browse hackathon events |
| `/events/[id]` | Event details |
| `/admin` | Admin login |
| `/admin/dashboard` | Manage events, themes, teams |

---

## License

MIT
