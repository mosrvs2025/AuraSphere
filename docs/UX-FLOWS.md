# AuraSphere UX Flows

This document illustrates how users move through major product moments using ASCII diagrams aligned with the current implementation.

## 1. Discovery Feed Interaction
```
GlobalHeader (For You / Following tabs, filter pills, live host rail)
        │ setCurationTab / setActiveFilter
        ▼
TrendingView (three-column grid)
├─ LiveRoomCard ── tap ──► handleEnterRoom(room) ──► RoomView
├─ UserProfileCard ── tap ──► setViewingProfile(user) ──► UserProfile overlay
├─ TextPostCard ── tap ──► setViewingPost(post) ──► PostDetailView
└─ Image/Video cards ── tap ──► setViewingMedia(post) ──► MediaViewerModal
```
Discover cards call back into `App.tsx`, which updates `activeView` or overlay state before re-rendering the main surface.

## 2. Live Room Session
```
Join room
  │
  ▼
RoomView layout
┌──────────────────────────────────────────────────────────────┐
│ HostControls (icebreakers, polls, invites, screen share, AV) │
│ ┌──────────────────────────────────────────────────────────┐  │
│ │ Stage columns                                           │  │
│ │  ├─ ParticipantGrid (hosts, speakers, listeners)        │  │
│ │  ├─ FeaturedLink + embedded video player (optional)     │  │
│ │  └─ Live reactions animation + Request to speak button  │  │
│ └──────────────────────────────────────────────────────────┘  │
│ Side panel (toggles)                                       │
│  ├─ ChatView + DynamicInput (text / audio / video notes)   │
│  └─ RequestQueueView (approve, like, listen to memos)      │
│ Floating AiAssistantPanel (optional)                       │
└──────────────────────────────────────────────────────────────┘
Actions such as sending messages, voting in polls, or approving requests invoke callbacks supplied by `App.tsx`. Leaving the room clears `activeRoom`; minimizing switches to the `MiniPlayer` overlay while keeping audio context alive.
```

## 3. Create Content Flow
```
Create button (Sidebar or BottomNavBar)
        │ opens
        ▼
CreateHubModal (Go Live / Post Video / Post Image / Write Note)
        │ selection
        ├─ live  ─► setCreateRoomModalOpen(true) ─► CreateRoomModal ─► handleCreateRoom → new Room + auto-join
        ├─ video ─► setCreatePostFile({type:'video'}) ─► CreatePostView ─► handleCreatePost
        ├─ image ─► setCreatePostFile({type:'image'}) ─► CreatePostView ─► handleCreatePost
        └─ note  ─► setCreateNote(true) ─► CreateNoteView ─► handleCreatePost
```
`handleCreatePost` may trigger `PostCreationAnimation` before routing back to the Discover feed and activating the relevant content filter.

## 4. Messaging Journey
```
BottomNavBar / Sidebar → MessagesView
        │ select conversation
        ▼
ConversationView (thread)
        │ back button
        └──────────────► returns to MessagesView
```
`MessagesView` lists participants with relative timestamps (`formatTimeAgo`). Selecting a thread reveals the full message history, including placeholders for voice or video notes.

## 5. Search & Global Exploration
```
AuraSphereView (drag/zoom globe, category pills)
        │ Search button
        ▼
handleNavigate('search')
        │
        ▼
GlobalSearchView
├─ Query input updates `searchQuery`
├─ Results reuse Discover cards (enter room, view profile/media)
└─ Close returns to Discover (resets `searchQuery`)
```
The `AuraSphereView` heatmap highlights category hotspots before handing off to the global search interface for deeper exploration.
