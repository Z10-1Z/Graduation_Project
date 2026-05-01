# Medical Appointment System

A full-stack healthcare management system with AI-powered medical assistant, built with **Laravel 12 (PHP)** backend and **React 19** frontend.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           MEDICAL APPOINTMENT SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐        │
│  │  React Frontend │    │ Laravel Backend  │    │  OpenRouter AI   │        │
│  │  (Port 5173)    │◄──►│  (Port 8000)     │◄──►│  (LLM Provider)  │        │
│  └─────────────────┘    └────────┬────────┘    └─────────────────┘        │
│                                  │                                             │
│                                  ▼                                             │
│                         ┌─────────────────┐                                  │
│                         │     Database     │                                  │
│                         │ (SQLite/MySQL)   │                                  │
│                         └─────────────────┘                                  │
│                                  │                                             │
│                                  ▼                                             │
│                         ┌─────────────────┐                                  │
│                         │   Pinecone DB    │                                  │
│                         │ (Vector Store)  │                                  │
│                         └─────────────────┘                                  │
│                                                                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                         AI Assistant (RAG System)                            │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────────────────┐        │
│  │ Chat API    │───►│ Vector DB   │───►│ Medical Knowledge Base  │        │
│  │ /chat/*     │    │ (Pinecone)  │    │ (Document Sources)       │        │
│  └─────────────┘    └─────────────┘    └─────────────────────────┘        │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Project Structure

```
medical-appointment-system/
├── backend/                  # Laravel 12 API
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/   # API Controllers
│   │   │   │   ├── AuthController.php
│   │   │   │   ├── AppointmentController.php
│   │   │   │   ├── DoctorController.php
│   │   │   │   ├── AdminController.php
│   │   │   │   ├── PatientController.php
│   │   │   │   ├── MedicalRecordController.php
│   │   │   │   └── ChatController.php          # AI Chat
│   │   │   └── Middleware/
│   │   │       └── EnsureRole.php
│   │   ├── Models/
│   │   │   ├── User.php
│   │   │   ├── Appointment.php
│   │   │   ├── MedicalRecord.php
│   │   │   ├── DoctorReport.php
│   │   │   ├── Prescription.php
│   │   │   ├── PasswordResetOtp.php
│   │   │   ├── DoctorPatientStatus.php
│   │   │   ├── Conversation.php            # AI Chat
│   │   │   ├── Message.php                 # AI Chat
│   │   │   ├── AuditLog.php                # AI Chat
│   │   │   └── DocumentSource.php          # RAG System
│   │   └── Mail/
│   │       └── PasswordResetOtpMail.php
│   ├── config/
│   ├── database/
│   │   ├── migrations/
│   │   └── seeders/
│   ├── routes/api.php
│   ├── tests/
│   │   ├── Feature/
│   │   └── Unit/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── docker-entrypoint.sh
│   ├── README.md
│   └── BACKEND_STAFF_DOCUMENTATION.md
│
├── frontend/                 # React 19 Application
│   ├── src/
│   │   ├── api/
│   │   ├── features/
│   │   ├── Pages/
│   │   │   ├── dashboard/
│   │   │   └── admin/
│   │   ├── components/
│   │   └── locales/
│   ├── e2e/
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── nginx.conf
│   └── README.md
│
├── docker-compose.yml        # Full system orchestration
├── docker-compose.dev.yml   # Development environment
├── Makefile
└── README.md
```

## User Roles

| Role | Description | Dashboard |
|------|-------------|-----------|
| `patient` | Book appointments, view records, pay invoices, AI chat | `/dashboard` |
| `doctor` | Manage patients, create reports/prescriptions, AI chat | `/dashboard` |
| `admin` | Full system management | `/admin` |

---

## Quick Start

### Option 1: Docker (Recommended)

#### Production Build

```bash
# Start both services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

Access at:
- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:8000

#### Development Mode

```bash
# Start in development mode with hot reload
docker-compose -f docker-compose.dev.yml up

# Stop
docker-compose -f docker-compose.dev.yml down
```

### Option 2: Manual Setup

#### Backend

```bash
cd backend

# Install dependencies
composer install

# Setup environment
cp .env.example .env
php artisan key:generate

# Create SQLite database
touch database/database.sqlite

# Run migrations and seeders
php artisan migrate --seed

# Start server
php artisan serve
```

#### Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

---

## Features

### Core Features

- **Authentication**: JWT-based with OTP verification
- **Appointments**: Book, modify, cancel appointments
- **Medical Records**: Patient history, vitals, chronic conditions
- **Doctor Reports**: Diagnosis and treatment plans
- **Prescriptions**: Medication management
- **Invoices**: Billing and payment tracking
- **Admin Dashboard**: User management, statistics, settings

### AI Chat Assistant (RAG)

- Context-aware medical assistant
- Retrieval-Augmented Generation from medical knowledge base
- Source citations for responses
- Conversation history
- Token and latency tracking
- Rate limiting: 20 requests/minute

### API Endpoints Summary

**Base URL:** `http://localhost:8000/api`

#### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login |
| POST | `/auth/verify-otp` | Verify OTP |
| POST | `/auth/forgot-password` | Request password reset |
| POST | `/auth/reset-password` | Reset password |
| GET | `/auth/me` | Get current user |
| POST | `/auth/logout` | Logout |
| PUT | `/auth/change-password` | Change password |

#### Patient Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/doctors/search` | Search doctors |
| GET | `/doctors/{doctor}/slots` | Get available slots |
| GET | `/appointments` | List appointments |
| POST | `/appointments` | Book appointment |
| PATCH | `/appointments/{id}` | Update appointment |
| DELETE | `/appointments/{id}` | Cancel appointment |
| GET | `/medical-records` | Get records |
| PUT | `/medical-records` | Update records |
| GET | `/invoices` | List invoices |
| POST | `/invoices/{ref}/pay` | Pay invoice |

#### Doctor Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/doctor/profile` | Update profile |
| GET | `/doctor/schedule` | Get schedule |
| PUT | `/doctor/schedule` | Update schedule |
| GET | `/doctor/patients` | List patients |
| PUT | `/doctor/reports` | Create report |
| POST | `/doctor/prescriptions` | Create prescription |

#### Admin Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/doctors` | List doctors |
| POST | `/admin/doctors` | Add doctor |
| GET | `/admin/patients` | List patients |
| GET | `/admin/appointments` | List appointments |
| GET | `/admin/stats` | Dashboard statistics |

#### AI Chat Routes
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/chat/conversations` | New conversation |
| GET | `/chat/conversations` | List conversations |
| GET | `/chat/conversations/{id}` | Get conversation |
| POST | `/chat/send` | Send message |

---

## Test Accounts

| Role | Email | Password | Notes |
|------|-------|----------|-------|
| Patient | patient@example.com | password | Test patient account |
| Doctor | doctor@example.com | password | Test doctor account |
| Admin | admin@lesahtak.com | password123 | Admin account |

---

## Make Commands

From project root (requires `make`):

```bash
make help          # Show all commands
make install       # Install all dependencies
make setup         # Setup database
make start         # Start Docker
make stop          # Stop Docker
make dev           # Development mode
make test          # Run backend tests
make clean         # Clean up
make logs          # View logs
```

---

## API Documentation

### Backend API Docs

See [`backend/README.md`](backend/README.md) for:
- All API endpoints with detailed documentation
- Request/response formats
- Authentication flow
- Database schema
- AI Chat API documentation
- Troubleshooting guide

### Backend Staff Documentation

See [`backend/BACKEND_STAFF_DOCUMENTATION.md`](backend/BACKEND_STAFF_DOCUMENTATION.md) for:
- Detailed system architecture
- Database schema with diagrams
- Model relationships
- Installation guides
- Troubleshooting

### Frontend API Integration

See [`frontend/README.md`](frontend/README.md) for:
- API client usage
- Redux state management
- Component architecture

---

## Testing

### Backend Tests

```bash
cd backend
php artisan test                  # Run all tests
php artisan test --filter=Auth    # Filter tests
php artisan test --coverage       # With coverage
```

### Frontend Tests

```bash
cd frontend
npm run test                      # Run tests
npm run test:e2e                  # E2E tests
```

---

## Useful Commands

### Backend

```bash
cd backend
php artisan serve                 # Start server
php artisan migrate:fresh --seed  # Reset DB
php artisan route:list            # List routes
php artisan key:generate          # Generate key
php artisan config:clear          # Clear cache
php artisan test                  # Run tests
```

### Frontend

```bash
cd frontend
npm run dev                       # Start dev server
npm run build                     # Production build
npm run lint                      # Lint code
npm run test                      # Run tests
```

---

## Security Notes

- Change default seeded passwords in production
- Set `APP_DEBUG=false` in production
- Use HTTPS in production
- Review CORS settings before deployment
- Sanitize all user inputs
- Rate limiting applied to auth and chat routes

---

## License

MIT License - Educational Project
