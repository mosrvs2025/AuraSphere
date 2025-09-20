# ✨ AuraSphere ✨

> Next-generation interactive audio social platform with asynchronous voice and video messaging plus Gemini-powered co-hosting superpowers.

AuraSphere is a React + TypeScript prototype built with Vite that explores what a modern social audio network can feel like. The experience spans discovery, immersive live rooms, asynchronous messaging, scheduling, and AI-assisted workflows. Mock data is generated at runtime to keep the UI rich, while Google Gemini endpoints provide real AI outputs for icebreakers, chat summaries, and avatar generation.

## Table of Contents
- [Overview](#overview)
- [Live Experience Highlights](#live-experience-highlights)
- [Interface Map](#interface-map)
- [Navigation Flow](#navigation-flow)
- [AI-Powered Capabilities](#ai-powered-capabilities)
- [Data & State Model](#data--state-model)
- [Project Structure](#project-structure)
- [Local Development](#local-development)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Key Components](#key-components)
- [Extending AuraSphere](#extending-aurasphere)
- [Further Reading](#further-reading)

## Overview
AuraSphere stitches together a multi-surface product experience:

- **Discover feed** with "For You" vs. "Following" curation, content-type filters, and a live activity rail surfaced by `GlobalHeader` and `TrendingView`.
- **Live rooms** driven by `RoomView`, complete with host controls, request-to-speak queues, polls, AI assistance, featured links, live reactions, and async notes.
- **Side experiences** including an interactive `AuraSphereView` globe, DM inbox, scheduling calendar, notifications, and profile dashboards.
- **Creation flows** for spinning up live rooms, uploading media posts, or jotting quick notes via `CreateHubModal`, `CreatePostView`, and `CreateNoteView`.

The application is optimized for both large screens (sidebar navigation) and small screens (bottom navigation plus the floating `MiniPlayer`).

## Live Experience Highlights
- **Discovery grid** (`TrendingView`) interleaves live rooms, user profiles, and multimedia posts. Filters are managed by `GlobalHeader`, and cards are rendered via `DiscoverCard` specializations.
- **Live room stage** (`RoomView`) orchestrates:
  - `HostControls` for screen sharing toggles, video embeds, Gemini-generated icebreakers, polls, and invite links.
  - `DynamicInput` for text chat, voice notes, and 30-second video notes with waveform visualizations.
  - `ChatView`, `Poll`, `FeaturedLink`, and `RequestQueueView` for a full moderator toolkit.
  - `AiAssistantPanel` to request Gemini summaries or conversation starters mid-room.
- **Messaging hub** (`MessagesView` + `ConversationView`) keeps DM threads alive, surfacing the latest audio/video note metadata inline.
- **Scheduling calendar** (`ScheduledView`) merges future rooms with scheduled posts, rendered on an interactive monthly grid.
- **MiniPlayer** keeps the current room one tap away when browsing other surfaces.

## Interface Map
```
Desktop layout (not to scale)
┌────────────────────────────────────────────────────────────────────────────┐
│ Sidebar (nav & profile) │              Main Column                         │
│ ┌───────────────┐       │  ┌────────────────────────────────────────────┐  │
│ │ AuraSphere    │       │  │ GlobalHeader                               │  │
│ │ Create button │       │  ├────────────────────────────────────────────┤  │
│ │ Nav items     │       │  │ Active View content                        │  │
│ │ Notifications │       │  │  ├─ TrendingView (Discover feed)          │  │
│ │ Profile card  │       │  │  │   ├─ LiveRoomCard → RoomView            │  │
│ └───────────────┘       │  │   ├─ UserProfileCard → UserProfile        │  │
│                         │  │   └─ Media/Post cards → Detail modals      │  │
│                         │  ├────────────────────────────────────────────┤  │
│                         │  │ BottomNavBar (mobile) / MiniPlayer overlay │  │
│                         │  └────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘
```

## Navigation Flow
```
State transitions (App.tsx → activeView)
┌────────────┐   tap live room    ┌─────────┐   leave room   ┌────────────┐
│ home       │ ─────────────────► │ room    │ ─────────────► │ home       │
│ (Discover) │                    └────┬────┘                └────────────┘
│            │   open profile overlay  │
│            │ ────────────────────────┘
│            │
│            │   tap messages          ┌───────────────────┐
│            └──────────────────────►  │ messages          │
│                                     └────────┬──────────┘
│   search icon                          open conversation │
│            └─────────────► search view └────► conversation
│   aura nav └─────────────► aurasphere         │
│   scheduled └────────────► scheduled calendar │
│   notifications └────────► notifications list │
└────────────────────────────────────────────────────────────
MiniPlayer keeps the active room accessible when `activeView !== 'room'`.
```

## AI-Powered Capabilities
- `services/geminiService` wires the Google Gemini SDK to:
  - Generate icebreaker questions for a room topic (`generateIcebreakers`).
  - Summarize chat transcripts on demand (`summarizeChat`).
  - Produce custom avatars on request (`generateAvatarImage`).
- `AiAssistantPanel` and `HostControls` expose these helpers in the UI, while `AvatarCustomizer` lets users adopt generated avatars.
- API keys are injected at build time via Vite's `define` shim, keeping runtime components free of manual key handling.

## Data & State Model
- **Mock data factories** inside `App.tsx` create users, rooms, posts, conversations, and discovery feed aggregates (`generateUsers`, `generateRooms`, `generatePosts`, `generateDiscoverItems`, `generateConversations`).
- **Primary state owner:** `App.tsx` tracks `activeView`, `rooms`, `posts`, `conversations`, `activeRoom`, `viewingProfile`, creation flows, and modal flags.
- **Context providers:**
  - `UserContext` exposes the logged-in user plus `followUser` / `unfollowUser` helpers.
  - `RoomActionsContext` (currently a stub) is ready to share real-time room control toggles.
- **Prop drilling strategy:** Derived views receive only the state slices they need along with callbacks (`handleEnterRoom`, `handleCreatePost`, etc.) to keep updates centralized.

## Project Structure
```
/
├── App.tsx                # Root component and state coordinator
├── components/            # UI building blocks (views, modals, controls)
├── context/               # React context definitions
├── services/              # Google Gemini helpers and future service modules
├── types.ts               # Shared TypeScript interfaces
├── index.tsx              # React entry point
├── index.html             # Static shell served by Vite
├── vite.config.ts         # Vite configuration & env injection
└── docs/                  # Architecture and UX references
```

## Local Development
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Start the Vite dev server**
   ```bash
   npm run dev
   ```
   Vite prints a local URL (typically http://localhost:5173). Open it in a modern browser that supports ES modules and media APIs.
3. **Build for production** (optional)
   ```bash
   npm run build
   npm run preview
   ```

## Environment Variables
Create a `.env` file at the repository root and supply your Google Gemini key. The Vite config maps it onto `process.env` for browser code.

```
GEMINI_API_KEY=your-key-here
```

> **Note:** The prototype assumes a browser environment that can access microphone, camera, and geolocation APIs. Grant permissions when prompted to unlock all controls.

## Available Scripts
| Command | Description |
|---------|-------------|
| `npm run dev` | Launches Vite in development mode with hot module replacement. |
| `npm run build` | Produces a production build in `dist/`. |
| `npm run preview` | Serves the production build locally for verification. |

## Key Components
| Component | Purpose |
|-----------|---------|
| `Sidebar` & `BottomNavBar` | Primary navigation on desktop and mobile breakpoints. |
| `GlobalHeader` | Manages discovery curation tabs, content filters, and live host rail. |
| `TrendingView` | Displays discovery feed columns via `DiscoverCard` renderers. |
| `RoomView` | Full live-room surface with host tools, chat, polls, reactions, and AI assistance. |
| `DynamicInput` | Unified composer supporting text, voice memos, and video notes. |
| `AiAssistantPanel` | Gemini-powered conversational aide for hosts. |
| `CreateHubModal` | Entry point for creating rooms, video posts, image posts, or notes. |
| `MiniPlayer` | Floating control surface for re-entering or leaving a minimized room. |
| `MessagesView` / `ConversationView` | Direct messaging inbox and thread UI. |
| `ScheduledView` | Calendar that blends scheduled rooms and queued posts. |
| `AuraSphereView` | Interactive 3D globe that visualizes global conversation "auras". |

## Extending AuraSphere
- Replace mock data factories with real GraphQL/REST calls and WebSocket subscriptions.
- Connect `RoomActionsContext` to WebRTC signalling for screen share and stage state.
- Persist reactions, requests-to-speak, and polls through a backend or state sync layer.
- Harden Gemini interactions with caching, rate limiting, and fine-grained prompts.

## Further Reading
- [Architecture Deep Dive](docs/ARCHITECTURE.md)
- [UX Flows](docs/UX-FLOWS.md)
