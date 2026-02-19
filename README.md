# 🏥 ClinicAI — AI-Powered Patient Follow-Up Assistant

A full-stack web application that helps small outpatient clinics reduce missed appointments, improve medication adherence, and streamline patient follow-ups using AI and machine learning.

---

## ✨ Features

### For Patients
- **Personalized Dashboard** — View upcoming appointments, medications, and notifications at a glance
- **AI Health Chatbot** — Get non-diagnostic health guidance powered by Claude AI
- **Appointment Tracking** — View all past and upcoming appointments with status updates
- **Medication Management** — Track active medications, dosages, and mark daily intake
- **Smart Reminders** — Automated appointment and medication notifications

### For Clinical Staff
- **Analytics Dashboard** — Real-time overview with charts for appointment status and patient risk distribution
- **Patient Management** — Full patient list with searchable no-show history and risk scores
- **No-Show Risk Prediction** — Logistic regression model that scores each patient's likelihood of skipping
- **Appointment Creation** — Schedule appointments with automatic risk assessment and reminder generation
- **Risk Analytics Tool** — Interactive tool to manually predict no-show probability from patient features

---

## 🏗️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, React Router, Recharts, date-fns |
| **Backend** | Node.js, Express 4 |
| **Database** | PostgreSQL 15 |
| **Authentication** | JWT (JSON Web Tokens) |
| **AI Integration** | Anthropic Claude API |
| **ML Model** | Logistic Regression (implemented in Node.js) |
| **Containerization** | Docker & Docker Compose |
| **Styling** | Custom CSS with DM Sans & DM Serif Display fonts |

---

## 📁 Project Structure

```
clinic-ai/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   ├── database.js         # PostgreSQL connection pool
│   │   │   ├── schema.sql          # Database schema & indexes
│   │   │   └── seed.js             # Demo data seeder
│   │   ├── middleware/
│   │   │   └── auth.js             # JWT auth + role guard middleware
│   │   ├── ml/
│   │   │   └── noShowPredictor.js  # Logistic regression model
│   │   ├── routes/
│   │   │   ├── auth.js             # /api/auth/*
│   │   │   ├── appointments.js     # /api/appointments/*
│   │   │   ├── chat.js             # /api/chat/*
│   │   │   ├── patients.js         # /api/patients/*
│   │   │   └── reminders.js        # /api/reminders/* & /api/medications/*
│   │   └── server.js               # Express app entry point
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── context/
│   │   │   └── AuthContext.js      # Global auth state
│   │   ├── pages/
│   │   │   ├── Login.js
│   │   │   ├── Register.js
│   │   │   ├── PatientDashboard.js
│   │   │   ├── StaffDashboard.js
│   │   │   ├── Appointments.js
│   │   │   ├── Chat.js
│   │   │   ├── Medications.js
│   │   │   ├── Reminders.js
│   │   │   ├── Patients.js
│   │   │   └── RiskAnalytics.js
│   │   ├── components/
│   │   │   └── Sidebar.js
│   │   ├── services/
│   │   │   └── api.js              # Axios API service layer
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css               # Design system & global styles
│   ├── .env.example
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
│
├── docker-compose.yml
└── README.md
```

---

## 🚀 Local Setup (Without Docker)

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone and configure

```bash
git clone <repo-url>
cd clinic-ai
```

### 2. Setup the backend

```bash
cd backend
cp .env.example .env
# Edit .env with your database credentials and API keys
npm install
```

### 3. Setup the database

Create a PostgreSQL database:
```sql
CREATE DATABASE clinic_ai_db;
```

Then run the schema and seed demo data:
```bash
npm run seed
```

### 4. Start the backend

```bash
npm run dev
# Runs on http://localhost:5000
```

### 5. Setup the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
npm start
# Runs on http://localhost:3000
```

---

## 🐳 Running with Docker

### Prerequisites
- Docker
- Docker Compose

### Steps

```bash
# 1. Copy and configure environment
cp backend/.env.example backend/.env
# Edit .env with your ANTHROPIC_API_KEY (optional but recommended)

# 2. Start all services
docker-compose up -d

# 3. Seed demo data
docker exec clinic_backend node src/config/seed.js

# 4. Open the app
open http://localhost:3000
```

### Stop services
```bash
docker-compose down          # Keep database data
docker-compose down -v       # Destroy everything including DB
```

---

## 🔐 Environment Variables

### Backend (`backend/.env`)

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `DB_HOST` | Yes | PostgreSQL host |
| `DB_PORT` | No | PostgreSQL port (default: 5432) |
| `DB_NAME` | Yes | Database name |
| `DB_USER` | Yes | Database user |
| `DB_PASSWORD` | Yes | Database password |
| `JWT_SECRET` | Yes | Secret key for signing JWTs |
| `JWT_EXPIRES_IN` | No | Token expiry (default: 7d) |
| `ANTHROPIC_API_KEY` | No | Enables real AI chat (falls back to rule-based) |
| `FRONTEND_URL` | No | CORS allowed origin |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `REACT_APP_API_URL` | Backend API URL (default: `/api`) |

---

## 🔌 API Endpoints

### Authentication
| Method | Path | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user profile |

### Appointments
| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/api/appointments` | Any | List appointments (role-filtered) |
| POST | `/api/appointments` | Staff | Create appointment + risk score |
| PATCH | `/api/appointments/:id/status` | Any | Update appointment status |
| POST | `/api/appointments/predict` | Any | Standalone no-show prediction |

### Chat
| Method | Path | Description |
|---|---|---|
| GET | `/api/chat/history` | Fetch chat history |
| POST | `/api/chat/message` | Send message, get AI reply |
| DELETE | `/api/chat/history` | Clear chat history |

### Patients (Staff only)
| Method | Path | Description |
|---|---|---|
| GET | `/api/patients` | List all patients with stats |
| GET | `/api/patients/stats` | Dashboard metrics |

### Medications & Reminders
| Method | Path | Description |
|---|---|---|
| GET | `/api/medications` | List medications |
| POST | `/api/medications` | Add medication |
| POST | `/api/medications/:id/log` | Log medication taken/missed |
| GET | `/api/reminders` | List reminders |
| PATCH | `/api/reminders/:id/read` | Mark reminder as read |

---

## 🤖 No-Show Prediction Model

The logistic regression model uses 6 features:

- **Historical no-show rate** (no_shows / total_appointments) — weight: 3.2
- **Day of week** — Mondays and Fridays have higher risk
- **Hour of day** — Very early or late appointments are riskier
- **Patient age** — Slight negative correlation (older = more reliable)
- **Appointment lead time** — Longer gaps increase uncertainty
- **New patient flag** — No history means higher uncertainty

Risk thresholds:
- 🟢 **LOW** — Score < 40%
- 🟡 **MEDIUM** — Score 40–70%
- 🔴 **HIGH** — Score ≥ 70%

---

## 👥 Demo Accounts

After seeding:

| Role | Email | Password |
|---|---|---|
| Staff | staff@clinic.com | staff123 |
| Patient | john.doe@email.com | patient123 |
| Patient | jane.smith@email.com | patient123 |
| Patient | bob.johnson@email.com | patient123 |

---

## 📊 Database Schema

- **users** — patients and staff with role-based access
- **appointments** — with status tracking and risk scores
- **appointment_risk_factors** — ML feature storage
- **medications** — patient prescriptions
- **medication_logs** — adherence tracking
- **chat_messages** — AI conversation history
- **reminders** — automated notifications

---

## 🔒 Security Features

- JWT-based stateless authentication
- Bcrypt password hashing (12 rounds)
- Role-based access control (patient/staff/admin)
- Rate limiting (100 req/15min global, 10 req/15min for auth)
- Input validation with express-validator
- Request size limits (10kb JSON body)
- CORS configured for frontend origin

---

## 🎨 Design System

- **Typography:** DM Serif Display (headings) + DM Sans (body)
- **Primary color:** Teal (#0d9488) — clinical trust
- **Background:** Soft gray (#f8fafc) — easy on eyes
- **Sidebar:** Deep charcoal (#1a1f2e) — professional contrast
- **Mobile responsive** via CSS Grid/Flexbox

---

## 📄 License

MIT
