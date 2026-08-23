# VisionLearn – AI-Powered Real-Time Visual Learning Assistant

VisionLearn is a production-ready, full-stack AI web application designed to assist primary school teachers. It continuously listens to a teacher's voice in real-time, converts the speech to text, extracts key educational concepts using Natural Language Processing (NLP), retrieves or generates relevant illustrations, and instantly displays them on a separate classroom screen for students.

The goal is to help primary school students better understand abstract or unfamiliar concepts through real-time visual learning without interrupting the teaching process.

---

## 🚀 Key Features

* **Continuous Speech-to-Text:** Integrates with OpenAI Whisper API for high-fidelity continuous audio slice transcription. Includes a browser-native Web Speech API fallback for zero-cost, real-time testing.
* **Lightweight NLP Keyword Extraction:** Analyzes transcripts in under 300 ms using the `compromise` NLP library. Extracts nouns and educational terms and groups them into Science, Mathematics, Geography, Animals, History, and General domains, skipping common filler words.
* **Smart Image Retrieval:** Searches Pixabay, Unsplash, and Google Custom Search APIs simultaneously, ranking and displaying the highest quality child-friendly result in under 3 seconds.
* **AI Image Generation (Fallback):** Generates safe, custom 3D educational illustrations using OpenAI DALL-E if no search matches are found.
* **Real-time Synchronization:** Uses Socket.io multi-room channels to push visual updates instantly from the teacher control board to the student projector displays.
* **Interactive Teacher Dashboard:** Start/stop session controls, microphone state selector, live transcript highlighter, DALL-E manual triggers, and display override forms.
* **Classroom Projector Feed:** Clean, distraction-free projector view with smooth Framer Motion entry/exit transitions, Ken Burns-style zoom effects, and configurable screen-clear timers.
* **School Admin Panel:** User account management directory (create/delete teachers) and comprehensive analytics (top keywords, daily sessions, API logs, and IT system health status).

---

## 🛠️ Technology Stack

* **Frontend:** React (Vite), Tailwind CSS, Framer Motion, React Router, Axios, Lucide Icons, Custom SVG Charts
* **Backend:** Node.js, Express.js, Socket.io, Mongoose (MongoDB Atlas)
* **Authentication:** JWT, bcryptjs Password Hashing
* **AI Services:** OpenAI Whisper API, OpenAI DALL-E API, compromise NLP, Pixabay API, Unsplash API, Google Custom Search API
* **DevOps:** Docker, Docker Compose

---

## 📁 Folder Structure

```
vision-learn/
├── docker-compose.yml
├── Dockerfile.backend
├── Dockerfile.frontend
├── README.md
├── .env.example
├── backend/
│   ├── package.json
│   ├── server.js
│   ├── .env
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── sessionController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   └── errorMiddleware.js
│   ├── models/
│   │   ├── Teacher.js
│   │   ├── Admin.js
│   │   ├── Session.js
│   │   ├── Keyword.js
│   │   ├── Image.js
│   │   └── Log.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── sessionRoutes.js
│   │   └── adminRoutes.js
│   └── services/
│       ├── nlpService.js
│       ├── imageService.js
│       └── whisperService.js
└── frontend/
    ├── package.json
    ├── vite.config.js
    ├── index.html
    └── src/
        ├── main.jsx
        ├── index.css
        ├── App.jsx
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Sidebar.jsx
        │   ├── GlassCard.jsx
        │   ├── LineChart.jsx
        │   ├── BarChart.jsx
        │   └── PieChart.jsx
        ├── pages/
        │   ├── LandingPage.jsx
        │   ├── Login.jsx
        │   ├── TeacherDashboard.jsx
        │   ├── ClassroomDisplay.jsx
        │   ├── SessionHistory.jsx
        │   ├── AdminDashboard.jsx
        │   ├── Settings.jsx
        │   └── NotFound.jsx
        ├── hooks/
        │   └── useSpeechToText.js
        ├── services/
        │   ├── api.js
        │   └── socket.js
        └── context/
            └── AuthContext.jsx
```

---

## 🔑 Seeding & Default Credentials

When the backend server starts, it checks the database and automatically seeds the following test accounts:

### 👩‍🏫 Teacher Workspace Login
* **Email:** `teacher@visionlearn.com`
* **Password:** `teacherpassword`
* **Assigned classrooms:** Classroom A, Classroom B, Classroom C
* **Subject:** Science

### 👑 Admin & IT Support Login
* **Email:** `admin@visionlearn.com`
* **Password:** `adminpassword`

---

## ⚡ Quick Start Instructions

### Prerequisites
* Node.js (v18+)
* MongoDB (Running locally or a MongoDB Atlas URI)
* Docker & Docker Compose (Optional)

### Option A: Local Installation

#### 1. Setup Database & Backend
```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Setup environment variables in .env (add API keys if available)
cp .env.example .env

# Start dev server
npm run dev
```

#### 2. Setup Frontend
```bash
# Open new terminal, navigate to frontend
cd frontend

# Install dependencies
npm install

# Start Vite dev server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application!

---

### Option B: Docker Compose (Unified Run)

Spin up MongoDB, the API backend, and the React frontend in Nginx with a single command:
```bash
# In the project root directory
docker-compose up --build
```
* **Frontend Site:** [http://localhost:3000](http://localhost:3000)
* **Backend Endpoint:** [http://localhost:5000](http://localhost:5000)

---

## 📖 API Documentation

All API endpoints are prefixed with `/api`. Protected routes require a `Bearer <JWT_TOKEN>` header.

### 🛡️ Authentication
* `POST /login` - Sign in as teacher or admin. Returns signed JWT token.
* `POST /logout` - Clear session.
* `GET /profile` - Get logged-in user profile metadata.

### 🏫 Classroom Sessions
* `POST /start-session` - Starts session in a classroom room.
* `POST /stop-session` - Stops listening session, computes elapsed time.
* `POST /speech` - Accepts continuous audio file chunks (via Multer), transcribes via Whisper, runs NLP, triggers image searches, and broadcasts updates.
* `POST /extract-keyword` - Receives raw text, parses keywords, gets images, updates DB, and broadcasts (used for WebSpeech native API route).

### 🎨 Visual overrides & Fallbacks
* `GET /image` - Run search queries across Unsplash/Pixabay/Google APIs.
* `POST /generate-image` - Explicitly trigger OpenAI DALL-E image generation for a keyword.
* `POST /override-image` - Manually override the current visual display with a custom image URL.
* `DELETE /remove-image` - Force clear the active displayed card on the classroom screen.

### 📊 History & Analytics
* `GET /history` - Fetch classroom sessions, keywords, and images with support for filters.
* `GET /analytics` - Get aggregated metrics including top keywords, daily counts, API usage ratios, and IT system health markers.
* `GET /logs` - Retrieve detailed system event logs for IT support diagnostics.

### 👥 Teacher Management
* `GET /teachers` - Get list of active school teachers.
* `POST /teachers` - Create new teacher account.
* `DELETE /teachers/:id` - Delete teacher account.
