# ✨ AuraSphere ✨

> A next-generation interactive audio social platform that enhances live conversations with features like asynchronous voice memos for listeners and AI-powered tools for hosts.

AuraSphere is a modern, feature-rich social audio application built with React and powered by the Google Gemini API. It's designed to create engaging live conversations and build communities around shared interests.

---

## 🚀 Core Features

- **🌐 AuraSphere Discovery:** Explore a 3D interactive globe that visualizes global conversations as a real-time "aura." Discover content hotspots and tune into different thematic energies around the world.
- **🎙️ Live Audio Rooms:** Host, speak, or listen in real-time audio conversations.
- **💬 Rich Interactive Chat:** Go beyond text with emoji reactions, voice memos, and video notes.
- **🤖 Gemini-Powered AI Assistant:**
    - **Icebreaker Suggestions:** Never run out of things to talk about.
    - **Live Chat Summaries:** Get the gist of the conversation instantly.
    - **AI-Generated Avatars:** Create unique profile pictures with a click.
- **📺 Dynamic Content Sharing:**
    - Share & watch videos directly in the room.
    - Present with screen sharing.
    - Pin a featured link for everyone to see.
- **📊 Live Polls:** Engage your audience and get instant feedback with interactive polls.
- **🌐 Discover Feed:** A dynamic, multi-column feed showcasing live rooms, interesting users, and various content formats (text, images, videos).
- **🗓️ Content Scheduling:** Plan ahead by scheduling rooms and posts to go live at a future date.
- **✉️ Direct Messaging:** Engage in private one-on-one conversations.
- **👤 Customizable Profiles:** Personalize your space with a bio, followers/following, and see your past activity.

---

## 🛠️ Tech Stack

- **Frontend:** [React](https://reactjs.org/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/)
- **AI & Generative Features:** [Google Gemini API](https://ai.google.dev/) (`@google/genai`)
- **Modules:** Served via ES Modules and Import Maps (no build step required).

---

## ▶️ Getting Started

This project is designed to run directly in a browser that supports modern JavaScript features like import maps.

### Prerequisites

1.  A modern web browser (like Chrome, Firefox, Edge).
2.  A valid Google Gemini API key.

### Running the App

1.  **Set up your API Key**: The application expects the Gemini API key to be available as an environment variable. When deploying or running locally, you must ensure that `process.env.API_KEY` is set.

2.  **Serve the directory**: Use a simple local web server to serve the project root.
    ```bash
    # If you have Python 3
    python -m http.server

    # Or using Node.js with the 'serve' package
    npx serve .
    ```

3.  Open your browser and navigate to the local server address (e.g., `http://localhost:8000`).

---

## 📂 Project Structure

The project is organized with a focus on modularity and clarity.

```
/
├── components/       # Reusable React components
├── context/          # React context providers for global state
├── services/         # Modules for external API calls (e.g., Gemini)
├── App.tsx           # Main application component, state management
├── index.tsx         # React root entry point
├── types.ts          # Centralized TypeScript type definitions
├── index.html        # The main HTML file
└── README.md         # Project information
```

This structure separates concerns, making it easier to navigate, maintain, and extend the application's functionality.