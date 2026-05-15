# IAM Design Playground

A high-fidelity prototype for the **Exotel Identity & Access Management (IAM)** system, built with React, TypeScript, and the Signal Design System.

---

## Overview

This playground demonstrates the full IAM product experience including onboarding, user management, role-based access control, admin portal, and licensing — all wired with a real SQLite backend and live data.

---

## Features

### Onboarding Flow
- 4-step signup: Account creation → Role selection → Primary need → Workspace personalisation
- State persisted in `localStorage` via `OnboardingContext`
- Dynamic greeting and recommendations based on selected use cases

### Home Screen
- AI Workspace Assistant with suggested action chips
- Quick Access links (Admin Portal, Developer Portal)
- Products grid (Contact Center, Engage, Chatbot, Voicebot, CQA, AI Assist)
- Getting Started checklist, Recommendations, Need Help

### Admin Portal
| Screen | Features |
|---|---|
| **Users** | New columns: Status, Tenants, Products, MFA, Last Active · Role/Product/Tenant/Status filters · Invite User drawer · Bulk Invite drawer · Create User full-page flow |
| **Roles** | 4 IAM roles (Admin, Manager, Member, Auditor) · System/Custom type badges · Role detail page |
| **Permissions** | Accordion groups per category · Per-permission toggles · Group Select All · Live search · Discard Changes |
| **License Management** | Stat cards · Expiring/Over-Limit alert banners · Product cards with seat/usage progress bars |

### Create User (Full Page)
Two-column form with:
- Basic Details (Full Name)
- Email Address + Password
- Role assignment
- Tenant multi-select
- Security Settings (MFA, Invitation Email) with checkboxes

### Navigation
- Persistent top bar: Exotel wordmark · Credits chip · Avatar with presence dot
- Collapsible admin sidebar with search
- Back navigation preserves table state (filters, search, pagination) via `sessionStorage`
- Detail pages (User, Role, Privilege Set) open inline within AdminLayout

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite 8 |
| Design System | Signal DS (`@exotel-npm-dev/signal-design-system`) |
| Routing | React Router v7 |
| State | React Context + `localStorage` / `sessionStorage` |
| Backend | Express 5, SQLite (`better-sqlite3`) |
| AI Features | Google Gemini API (optional) |

---

## Getting Started

### Prerequisites
- Node.js 18+
- npm

### Frontend

```bash
cd Exotel-Design-Playground
npm install
npm run dev
```

Opens at **http://localhost:5173**

### Backend

```bash
cd Exotel-Design-Playground/server
npm install
npm run dev
```

API available at **http://localhost:3333**

#### Reset database
```bash
npm run db:reset
```

#### Enable AI Copilot (optional)
Create `server/.env`:
```
GEMINI_API_KEY=your_key_here
```

---

## Routes

| Route | Screen |
|---|---|
| `/signup` | Signup (Step 1) |
| `/onboarding/role` | Role selection (Step 2) |
| `/onboarding/need` | Primary need + use cases (Step 3) |
| `/onboarding/personalize` | Team size + industry (Step 4) |
| `/` | Home |
| `/admin` | Admin Portal → redirects to Users |
| `/admin/users` | Users table |
| `/admin/user-management` | Roles & Privileges |
| `/admin/users/create` | Create User (full page) |
| `/admin/users/:userId` | User detail |
| `/admin/roles/:roleId` | Role detail |
| `/admin/license-management` | License Management |

---

## Project Structure

```
Exotel-Design-Playground/
├── src/
│   ├── components/
│   │   ├── onboarding/       # Stepper, SelectionCard, OnboardingLayout
│   │   └── rbac/             # DataGrid panels, Drawers
│   ├── context/              # OnboardingContext
│   ├── layout/               # AppLayout, AdminLayout, TopBar
│   ├── lib/                  # onboardingCopy.ts (all strings)
│   ├── pages/
│   │   ├── admin/            # LicenseManagementPage, CreateUserPage
│   │   └── onboarding/       # RoleStep, NeedStep, PersonalizeStep
│   └── data/                 # Static seed data (roles, users, privilege sets)
└── server/
    ├── src/                  # Express API + SQLite
    └── seed-data/            # roles.json, privilege_sets.json, role_users.json
```

---

## License

Internal prototype — Exotel 2026
