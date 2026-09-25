# StudyTrack — Intelligent Focus & 3D Study Analytics

An immersive full-stack study productivity application engineered with **React 19**, **Three.js**, **Node.js**, **Express**, and **MongoDB**. Features interactive 3D concentration visualization, Pomodoro & Deep-Dive focus timers, binaural alpha focus audio, gamified XP & streak progression, task management, and curriculum tracking.

---

## ✨ Features

- 💎 **Interactive 3D Focus Core**: Three.js WebGL crystal engine that dynamically reacts to concentration status, speed, timer presets, and completion states.
- ⏱️ **Versatile Focus Timer**: Pomodoro (25m), Deep Dive (50m), Short Break (5m), and Long Break (15m) with customizable subject tracking and zen fullscreen mode.
- 🎵 **Built-in Cyber Alpha Ambient Sound**: Web Audio API synthesized binaural focus waves for distraction-free deep work.
- 📊 **Productivity Intelligence Dashboard**: Real-time analytics displaying today's progress, 7-day study heatmaps, subject time distributions, and task completion metrics.
- ✅ **Milestone & Task Tracker**: Priority-tagged task manager with filters, search, confetti completion rewards, and XP gain.
- 📚 **Subject & Goal Manager**: Curriculum tracking with weekly target hours and progress percentage gauges.
- 📜 **Session History & CSV Export**: Complete historical audit trail of study sessions with one-click CSV download.
- 🎮 **Gamification System**: Level progression, XP rewards for study sessions and task completions, and daily streak tracking.
- 🔐 **JWT Authentication & Demo Mode**: Secure JWT auth with password hashing (bcrypt), along with instant one-click demo login.

---

## 🛠️ Tech Stack

### Frontend
- **React 19**
- **Three.js** (WebGL 3D Visualizer)
- **Tailwind CSS v4** (Glassmorphism & Cyber aesthetics)
- **Vite** (Next-gen build tool)
- **Lucide React** (Modern iconography)
- **Canvas-Confetti** (Gamified celebratory effects)

### Backend
- **Node.js & Express**
- **MongoDB & Mongoose**
- **JSON Web Tokens (JWT)** & **Bcrypt.js**
- **Morgan** (HTTP request logging)
- **CORS** & **Dotenv**

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js** (v18+ recommended)
- **MongoDB** (Local instance or MongoDB Atlas cluster)

### 2. Backend Setup
```bash
cd server
npm install

# Copy .env.example if needed
cp .env.example .env

# Start server
npm run dev
# Server runs on http://localhost:5000
```

### 3. Frontend Setup
```bash
cd client
npm install

# Start Vite dev server
npm run dev
# App runs on http://localhost:5173
```

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register new user |
| `POST` | `/api/auth/login` | Login user & receive JWT token |
| `GET` | `/api/auth/me` | Fetch authenticated user profile |
| `PUT` | `/api/auth/profile` | Update profile goals and avatar |
| `GET` | `/api/subjects` | List all subjects & weekly progress |
| `POST` | `/api/subjects` | Create subject track |
| `DELETE` | `/api/subjects/:id` | Delete subject track |
| `GET` | `/api/tasks` | List tasks with filters |
| `POST` | `/api/tasks` | Create study task |
| `PUT` | `/api/tasks/:id` | Update task status & award XP |
| `DELETE` | `/api/tasks/:id` | Delete study task |
| `POST` | `/api/sessions` | Log completed focus session |
| `GET` | `/api/sessions/recent` | Get session history |
| `DELETE` | `/api/sessions/:id` | Remove session log |
| `GET` | `/api/analytics/dashboard` | Dashboard metrics & 7-day stats |

---

## 📄 License
MIT © 2026 StudyTrack
