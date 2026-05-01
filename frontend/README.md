# Medical Appointment System - Frontend

## Overview

React 19 frontend with Vite for the medical appointment system. Features Material UI, Tailwind CSS, Redux Toolkit, and React Router.

| Property | Value |
|----------|-------|
| Framework | React 19 |
| Build Tool | Vite 7 |
| UI Library | Material UI (MUI) 7 |
| Styling | Tailwind CSS 4 + Styled Components |
| State Management | Redux Toolkit |
| Routing | React Router 7 |
| i18n | i18next |
| Testing | Vitest + Playwright |

---

## Quick Start

### Docker (Recommended)

```bash
cd frontend
docker-compose up -d
```

App available at: **http://localhost:5173**

### Manual Setup

```bash
npm install
npm run dev
```

---

## Project Structure

```
frontend/
├── src/
│   ├── api/                    # API clients
│   │   ├── axiosInstance.js    # Axios configuration
│   │   ├── authAPI.js          # Authentication API
│   │   ├── appointmentsAPI.js # Appointments API
│   │   ├── medicalRecordsAPI.js
│   │   ├── invoicesAPI.js
│   │   ├── aiAssistantAPI.js
│   │   └── endpoints.js        # API endpoints
│   ├── app/                   # App entry point
│   │   └── App.jsx
│   ├── assets/                # Static assets
│   ├── components/            # Reusable components
│   │   ├── Layout/
│   │   ├── UI/
│   │   └── ...
│   ├── context/               # React contexts
│   │   └── ToastContext.jsx   # Toast notifications
│   ├── data/                  # Static data
│   ├── features/             # Redux slices
│   │   ├── auth/
│   │   ├── appointments/
│   │   └── medicalRecords/
│   ├── hooks/                 # Custom hooks
│   ├── locales/               # i18n translations
│   ├── Pages/
│   │   ├── dashboard/         # Patient/Doctor views
│   │   │   ├── DashboardLayout.jsx
│   │   │   ├── DashboardHome.jsx
│   │   │   ├── AppointmentsPage.jsx
│   │   │   ├── BookingPage.jsx
│   │   │   ├── MedicalRecordsPage.jsx
│   │   │   ├── InvoicesPage.jsx
│   │   │   ├── PatientProfilePage.jsx
│   │   │   └── AIAssistantPage.jsx
│   │   ├── admin/             # Admin views
│   │   │   ├── AdminLayout.jsx
│   │   │   ├── AdminHome.jsx
│   │   │   ├── AdminDoctorsPage.jsx
│   │   │   ├── AdminPatientsPage.jsx
│   │   │   ├── AdminAppointmentsPage.jsx
│   │   │   ├── AdminInvoicesPage.jsx
│   │   │   └── AdminSettingsPage.jsx
│   │   └── Public/            # Public pages
│   │       └── ContactPage.jsx
│   ├── routes/                # Route configuration
│   ├── test/                  # Test utilities
│   ├── utils/                 # Utility functions
│   ├── main.jsx               # Entry point
│   ├── i18n.js                # i18n configuration
│   └── index.css              # Global styles
├── public/                    # Public assets
├── e2e/                       # Playwright E2E tests
├── .github/                   # GitHub workflows
├── Dockerfile
├── docker-compose.yml
├── nginx.conf
├── package.json
├── vite.config.js
├── tailwind.config.js
├── playwright.config.js
└── eslint.config.js
```

---

## Features

### Patient Features
- View dashboard with upcoming appointments
- Book appointments with doctors
- Search and filter doctors
- View and update medical records
- View and pay invoices
- Update profile

### Doctor Features
- Manage schedule and availability
- View assigned patients
- Create medical reports
- Create prescriptions
- Update patient care status

### Admin Features
- Dashboard with statistics
- Manage doctors (CRUD, toggle active status)
- Manage patients (CRUD)
- Manage appointments (view, edit, delete)
- View invoice reports
- System settings

---

## API Integration

### Axios Instance

Base configuration in `src/api/axiosInstance.js`:

```javascript
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

Interceptors:
- Request: Adds `Authorization: Bearer <token>` header
- Response: Handles 401 (redirect to login)

### API Clients

| File | Description |
|------|-------------|
| `authAPI.js` | Login, register, logout, profile |
| `appointmentsAPI.js` | Appointment CRUD |
| `medicalRecordsAPI.js` | Medical records |
| `invoicesAPI.js` | Invoice operations |
| `aiAssistantAPI.js` | AI chat assistant |
| `endpoints.js` | Centralized API endpoints |

---

## State Management (Redux Toolkit)

### Slices

| Slice | Description |
|-------|-------------|
| `authSlice` | User authentication state |
| `appointmentsSlice` | Appointments state |
| `medicalRecordsSlice` | Medical records state |

### Store Configuration

```javascript
// Redux store setup
const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    medicalRecords: medicalRecordsReducer,
  },
});
```

---

## Routing

Routes are defined with React Router. Main routes:

| Path | Component | Access |
|------|-----------|--------|
| `/login` | LoginPage | Public |
| `/register` | RegisterPage | Public |
| `/dashboard` | DashboardLayout | Authenticated |
| `/dashboard/home` | DashboardHome | Authenticated |
| `/dashboard/appointments` | AppointmentsPage | Authenticated |
| `/dashboard/booking` | BookingPage | Patient |
| `/dashboard/medical-records` | MedicalRecordsPage | Authenticated |
| `/dashboard/invoices` | InvoicesPage | Patient |
| `/admin` | AdminLayout | Admin |
| `/admin/home` | AdminHome | Admin |
| `/admin/doctors` | AdminDoctorsPage | Admin |
| `/admin/patients` | AdminPatientsPage | Admin |

---

## Authentication Flow

1. User opens `/login`
2. Enter credentials and submit
3. `authAPI.login()` sends request to backend
4. On success: store `user` and `token` in localStorage
5. Redux state updated with user data
6. Redirect to appropriate dashboard based on role

```javascript
// Login flow
const handleLogin = async (credentials) => {
  const response = await authAPI.login(credentials);
  localStorage.setItem('user', JSON.stringify(response.user));
  localStorage.setItem('token', response.token);
  dispatch(setUser(response.user));
  navigate('/dashboard');
};
```

---

## Components

### Layout Components

| Component | Description |
|-----------|-------------|
| `DashboardLayout` | Main layout for patient/doctor |
| `AdminLayout` | Layout for admin pages |

### UI Components

| Component | Description |
|-----------|-------------|
| `LoadingSpinner` | Loading indicator |
| `Toast` | Toast notifications |
| `Modal` | Modal dialogs |
| `Card` | Card containers |
| `Button` | Styled buttons |
| `Input` | Form inputs |

---

## Testing

### Unit Tests (Vitest)

```bash
# Run all tests
npm run test

# Run with UI
npm run test -- --ui

# Watch mode
npm run test -- --watch

# Run specific file
npm run test -- authSlice.test.js
```

### E2E Tests (Playwright)

```bash
# Install browsers
npx playwright install

# Run E2E tests
npm run test:e2e

# Run specific test
npx playwright test e2e/login-ui.spec.js

# UI mode
npx playwright test --ui
```

---

## Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `VITE_API_BASE_URL` | http://localhost:8000/api | Backend API URL |
| `VITE_APP_NAME` | Laravel | App name |

Create `.env` file:
```bash
VITE_API_BASE_URL=http://localhost:8000/api
```

---

## Docker Commands

```bash
# Build image
docker build -t medical-frontend ./frontend

# Run container
docker run -p 5173:80 medical-frontend

# With docker-compose
docker-compose -f frontend/docker-compose.yml up -d

# View logs
docker-compose -f frontend/docker-compose.yml logs -f

# Stop
docker-compose -f frontend/docker-compose.yml down
```

---

## Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run dev -- --port 3000  # Custom port

# Build
npm run build            # Production build
npm run preview          # Preview production build

# Testing
npm run test             # Unit tests
npm run test:e2e         # E2E tests

# Code Quality
npm run lint             # Lint code
npm run lint:fix         # Fix linting errors

# Other
npm run prepare          # Prepare husky hooks
```

---

## Troubleshooting

### Port already in use

```bash
# Find process using port 5173
lsof -i :5173

# Kill it or use different port
npm run dev -- --port 3000
```

### API connection errors

1. Check backend is running on port 8000
2. Verify `VITE_API_BASE_URL` in `.env`
3. Check browser console for CORS errors

### Build fails

```bash
rm -rf node_modules
rm package-lock.json
npm install
```

### Tests not running

```bash
npx playwright install
npm run test
```

---

## i18n (Internationalization)

Translations managed with i18next. Files in `src/locales/`:

```javascript
// Current implementation
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    fallbackLng: 'en',
    resources: { en: {}, ar: {} },
  });
```

---

## Design System

### Colors

Primary gradient background:
```css
background: linear-gradient(0deg, #F0F4F8, #F0F4F8),
radial-gradient(141.42% 141.42% at 100% 100%, rgba(19, 127, 236, 0.05) 0%, rgba(19, 127, 236, 0) 50%),
radial-gradient(141.42% 141.42% at 0% 0%, rgba(19, 127, 236, 0.05) 0%, rgba(19, 127, 236, 0) 50%);
```

### Typography

- Primary font: Roboto (via @fontsource/roboto)
- Headings: Bold, varying sizes
- Body: Regular weight

### Icons

Lucide React icons used throughout the application.

---

## Performance Tips

1. Use `React.memo()` for expensive components
2. Implement code splitting with `React.lazy()`
3. Use virtualized lists for large datasets
4. Optimize images with lazy loading
5. Minimize re-renders with proper state management