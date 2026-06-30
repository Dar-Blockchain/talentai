# TalentAI

An AI-powered talent management platform that automates hiring, skills assessment, and employee development through intelligent campaigns, real-time AI interviews, and data-driven analytics.

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
  - [Docker](#docker)
- [Project Structure](#project-structure)
- [User Roles](#user-roles)
- [Key Modules](#key-modules)

---

## Overview

TalentAI is a full-stack SaaS platform built for companies to streamline talent acquisition and employee assessment. It combines real-time AI interviews, configurable assessment campaigns, and a rich analytics layer into a single unified workspace — covering the full lifecycle from job post creation to candidate hire and employee skills development.

---

## Features

### For Companies
- **AI-Generated Job Posts** — describe a role and get a fully structured post with skills, requirements, and responsibilities auto-generated
- **Assessment Campaigns** — launch Skills Mapping, Enablement, Productivity Diagnostic, or Custom campaigns targeting employees or candidates
- **AI Interviews** — real-time voice-based AI interviews with live transcription, dynamic follow-up questions, and automated scoring
- **Skill Tests & Questionnaires** — structured assessments with configurable scoring thresholds
- **Application Management** — full applicant tracking from submission through final assessment with scoring and feedback
- **Department Management** — organize teams, assign roles, manage invitations and access permissions
- **Employee Permissions** — granular permission system controlling what each employee can view and manage
- **Billing & Plans** — Stripe-powered subscription management with per-plan feature limits
- **Real-Time Chat** — team messaging and candidate communication via WebSockets
- **CV Analysis** — automated resume parsing and candidate profile extraction
- **Notifications** — real-time event notifications across all user types

### For Candidates
- **Candidate Dashboard** — overview of applications, interviews, and skill assessments
- **Skill Interviews** — on-demand AI-powered skill assessments with detailed feedback reports
- **Application Tracking** — view application status, assessment results, and interview history

### For Employees
- **Campaign Participation** — receive and complete assigned assessment campaigns
- **Skills Portal** — run self-initiated skill interviews and track growth over time
- **Team Chat** — communicate with colleagues within the platform

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                        Frontend                         │
│  Next.js 15 · React 19 · TypeScript · TailwindCSS v4   │
│  TanStack Query · Redux Toolkit · Socket.io-client      │
└──────────────────────────┬──────────────────────────────┘
                           │ REST + WebSocket
┌──────────────────────────▼──────────────────────────────┐
│                         Backend                         │
│      Node.js · Express 4 · Socket.io · Agenda           │
│      MongoDB (Mongoose) · Redis · JWT · Nodemailer      │
└──────────┬──────────────────────────────────────────────┘
           │
    ┌──────▼───────┐   ┌──────────────┐   ┌─────────────┐
    │   MongoDB    │   │    Redis     │   │  AWS Bedrock │
    │  (primary    │   │  (sessions,  │   │  / OpenAI   │
    │   store)     │   │   cache)     │   │  (AI layer) │
    └──────────────┘   └──────────────┘   └─────────────┘
```

The platform uses a feature-based module structure on both ends. The frontend organizes code under `src/modules/{domain}` — each module owns its API layer, TanStack Query hooks, components, and types. The backend organizes under `Backend/features/{domain}` with separate controller, service, model, and routes files per feature.

---

## Tech Stack

### Frontend

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (Pages Router) |
| Language | TypeScript 5 |
| UI Components | MUI v7 + shadcn/ui + Radix UI |
| Styling | TailwindCSS v4 + Emotion |
| State — Server | TanStack Query v5 |
| State — Client | Redux Toolkit + Redux Persist |
| Forms | React Hook Form + Zod |
| Charts | Recharts |
| Animations | Framer Motion |
| Real-time | Socket.io-client |
| i18n | i18next + react-i18next |
| Maps | React Leaflet |
| PDF Export | jsPDF + html2canvas |

### Backend

| Layer | Technology |
|---|---|
| Runtime | Node.js |
| Framework | Express 4 |
| Database | MongoDB via Mongoose |
| Cache / Queue | Redis |
| Real-time | Socket.io |
| Auth | JWT + Google OAuth |
| AI — Interviews | AWS Bedrock + OpenAI |
| Payments | Stripe |
| Email | Nodemailer |
| File Uploads | Multer |
| Job Scheduling | Agenda + node-cron |
| CV Parsing | pdf-parse |
| API Docs | Swagger (swagger-jsdoc + swagger-ui-express) |

---

## Getting Started

### Prerequisites

- Node.js 20+
- MongoDB instance (local or Atlas)
- Redis instance
- pnpm (Backend) / npm (Frontend)

### Environment Variables

**Frontend** — create `.env.local` in the project root:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_SOCKET_URL=http://localhost:5000
```

**Backend** — create `.env` in `Backend/`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/talentai
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_jwt_secret
JWT_REFRESH_SECRET=your_refresh_secret

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=your@email.com
SMTP_PASS=your_password

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# AI
OPENAI_API_KEY=sk-...
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...

# Google OAuth
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

### Running Locally

**Backend:**

```bash
cd Backend
pnpm install
pnpm dev
# API available at http://localhost:5000
# Swagger docs at http://localhost:5000/api-docs
```

**Frontend:**

```bash
# from project root
npm install
npm run dev
# App available at http://localhost:3000
```

### Docker

Both services ship with Dockerfiles and Kubernetes deployment manifests.

```bash
# Backend
docker build -t talentai-backend ./Backend

# Frontend
docker build -t talentai-frontend .
```

Kubernetes manifests: `Backend/Backend-deployment.yaml` and `frontend-deployment.yaml`.

---

## Project Structure

```
talentai/
├── src/                          # Next.js frontend
│   ├── modules/                  # Feature modules (domain-driven)
│   │   ├── auth/                 # Sign in, register, OTP
│   │   ├── candidate/            # Candidate portal
│   │   ├── company/              # Company portal
│   │   │   ├── applications/     # ATS — applicant tracking
│   │   │   ├── assessment/       # Assessment modal
│   │   │   ├── billing/          # Plans & payments
│   │   │   ├── campaigns/        # Campaign management
│   │   │   ├── departments/      # Team structure
│   │   │   ├── employees/        # Member & permission management
│   │   │   └── posts/            # AI job post creation
│   │   ├── chat/                 # Team + candidate messaging
│   │   ├── notifications/        # Real-time notifications
│   │   └── settings/             # User & company settings
│   ├── pages/                    # Next.js file-system routes
│   ├── store/                    # Redux store + persisted slices
│   ├── hooks/                    # Shared React hooks
│   └── types/                    # Shared TypeScript types
│
└── Backend/                      # Express API server
    ├── features/                 # Feature modules
    │   ├── auth/                 # Authentication & token management
    │   ├── campaigns/            # Campaign engine & participants
    │   ├── company-members/      # Invitations, memberships, permissions
    │   ├── departments/          # Department CRUD
    │   ├── interviews/           # AI interview sessions
    │   │   ├── campaign-interview/
    │   │   ├── post-interview/
    │   │   ├── skill-interview/
    │   │   └── shared/ai/        # AI utilities, prompts, scoring
    │   ├── job-applications/     # Application tracking
    │   ├── billing/              # Stripe payments & plan limits
    │   ├── chat/                 # Messaging & conversations
    │   ├── cv-analysis/          # Resume parsing
    │   └── notifications/        # Push & in-app notifications
    ├── config/                   # Middleware & route registration
    ├── database/                 # MongoDB connection
    ├── socket/                   # Socket.io server & namespaces
    ├── cron/                     # Scheduled background jobs
    └── middleware/               # Error handling, auth guards
```

---

## User Roles

| Role | Description |
|---|---|
| **Admin** | Platform-level administrator |
| **Company** | Company owner — full access to all company features |
| **Employee** | Company staff member with granular permission controls |
| **Candidate** | Job applicant with access to their application and skill portal |

Employees have a fine-grained permission model. Permissions such as `canCreateJobPosts`, `canInviteMembers`, `canAssignRoles`, `canDeleteDepartment`, and `canRemoveEmployee` are toggled individually per employee by the Company owner.

---

## Key Modules

### AI Interviews

Real-time voice interviews are orchestrated through a Socket.io event pipeline. The backend streams audio via AssemblyAI for live transcription, feeds responses through a multi-stage AI engine (question generation → memory → coverage analysis → decision engine), and produces a structured report with per-skill scores and a hire/no-hire recommendation.

Supported contexts:
- **Skill Interviews** — candidate self-assessment on demand
- **Post Interviews** — linked to a specific job application
- **Campaign Interviews** — triggered as part of a company assessment campaign

### Campaigns

Campaigns are the primary tool for mass employee or candidate assessment. Each campaign has one **module** (AI Interview, Skill Test, Questionnaire, or Training Path) and one of four **types** (Skills Mapping, Enablement, Productivity Diagnostic, Custom).

Access modes:
- `ACCOUNTS` — requires a platform login
- `LINK` — public shareable link with optional participant anonymity

### AI Job Post Creation

The post creation flow uses an AI stepper where the recruiter provides a short prompt describing the role. The AI generates a complete job description including title, responsibilities, requirements, hard skills with proficiency levels, and soft skills. Every field is editable before publishing.

### Billing

Stripe integration handles subscriptions and one-time payments, with webhook support for lifecycle events. Each plan defines per-feature limits (max active posts, campaigns, monthly interviews) stored in `PlanLimits` and enforced at the API level before allowing resource creation.

### Real-Time Chat

Two chat systems run in parallel over separate Socket.io namespaces:
- **Team Chat** — internal messaging between company employees
- **Candidate Chat** — communication between companies and job applicants

---

## License

[MIT](LICENSE)
