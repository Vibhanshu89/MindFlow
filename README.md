# 🚀 ProjectAI — AI-Powered Project Management

A full-stack MERN application with real-time collaboration, AI insights powered by GPT-4o, drag-and-drop Kanban boards, and beautiful glassmorphism UI.

## ✨ Features

- 🔐 **Auth**: Email/password + Google OAuth, JWT, bcrypt
- 🏢 **Projects**: Create/manage projects with team members, deadlines, progress tracking
- ✅ **Tasks**: Kanban board (To Do → In Progress → Review → Done) with drag-and-drop
- 🤖 **AI Features**: Standup analyzer, task prioritization, risk prediction, task generator
- 🔔 **Notifications**: Real-time via Socket.io
- 📊 **Dashboard**: Stats, Chart.js charts, recent activity
- 👥 **Team**: Role-based access (Admin / Manager / Developer)

## 📁 Project Structure

```
ai-project-manager/
├── backend/           # Node.js + Express + Socket.io
│   ├── config/        # DB (MongoDB) + Passport OAuth
│   ├── controllers/   # Business logic
│   ├── middleware/    # JWT auth + error handling
│   ├── models/        # Mongoose schemas
│   ├── routes/        # REST API routes
│   ├── sockets/       # Socket.io handlers
│   └── server.js      # Entry point (port 5000)
│
└── frontend/          # React + Vite + Tailwind CSS v4
    ├── src/
    │   ├── components/  # Layout, Kanban, modals
    │   ├── context/     # Auth + Socket contexts
    │   ├── pages/       # All route pages
    │   ├── services/    # Axios API layer
    │   └── App.jsx      # React Router
    └── vite.config.js  # Proxy → backend
```

## 🛠️ Setup Instructions

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)
- OpenAI API key (for AI features)
- Google OAuth credentials (optional)

### 1. Backend

```bash
cd backend
npm install
# Edit .env with your values:
# MONGO_URI, JWT_SECRET, OPENAI_API_KEY, GOOGLE_CLIENT_ID/SECRET
npm run dev
# Runs on http://localhost:5000
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Runs on http://localhost:5173
```

## 🌐 API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/api/auth/register` | Register user |
| POST | `/api/auth/login` | Login with JWT |
| GET | `/api/auth/google` | Google OAuth |
| GET | `/api/projects` | Get user's projects |
| POST | `/api/projects` | Create project |
| GET | `/api/tasks/my` | Get my tasks |
| POST | `/api/tasks` | Create task |
| PUT | `/api/tasks/:id/status` | Update Kanban status |
| POST | `/api/ai/standup` | AI standup analysis |
| POST | `/api/ai/prioritize-tasks` | AI task ranking |
| POST | `/api/ai/predict-risk` | AI risk prediction |
| GET | `/api/notifications` | Get notifications |

## 🔑 Environment Variables

Copy `.env` in the backend directory and fill in:

```env
MONGO_URI=mongodb://localhost:27017/ai-project-manager
JWT_SECRET=your_super_secret_key
OPENAI_API_KEY=sk-...   # For AI features
GOOGLE_CLIENT_ID=...    # For Google OAuth
GOOGLE_CLIENT_SECRET=...
CLIENT_URL=http://localhost:5173
PORT=5000
```

## 🚀 Deployment

- **Frontend**: Deploy to Vercel — `npm run build`
- **Backend**: Deploy to Render — set env vars in Render dashboard
- **Database**: Use MongoDB Atlas free tier

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React + Vite + Tailwind CSS v4 |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + Passport.js Google OAuth |
| Real-time | Socket.io |
| AI | OpenAI API (gpt-4o-mini) |
| Charts | Chart.js + react-chartjs-2 |
| Drag & Drop | @dnd-kit/core |
| Icons | Lucide React |
| Notifications | react-hot-toast |
