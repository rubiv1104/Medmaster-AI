# 🌿 MedMaster AI

**The Revision-First Academic Operating System for MD Ayurveda Postgraduate Students**

MedMaster AI is a modern learning platform designed specifically for MD Ayurveda PG students. It combines syllabus management, spaced repetition, academic resource organization, progress analytics, and AI-assisted study workflows into a single system.

Built to solve a simple problem:

> Students collect thousands of pages of notes but lack a structured revision system.

MedMaster AI ensures every topic is studied, revised, retained, and mastered.

---

# Core Philosophy

Traditional academic apps focus on content.

MedMaster AI focuses on retention.

Every feature is built around one question:

> "Will this help the student remember this topic during exams?"

The platform uses structured revision schedules, progress tracking, retention scoring, and AI-powered study tools to maximize long-term recall.

---

# Features

## Authentication & Security

* Email/password authentication
* Secure session management
* Email verification
* Password reset flow
* Account deletion workflow
* Protected routes
* Supabase Auth integration
* Row Level Security (RLS)

---

## Guided Onboarding

A 4-step onboarding experience:

### Step 1 — Academic Profile

* Full name
* College
* Year
* University

### Step 2 — Branch Selection

Choose your MD Ayurveda specialization:

* MD Kayachikitsa
* MD Panchakarma
* MD Dravyaguna
* MD Roga Nidana
* MD Prasuti Tantra

### Step 3 — Syllabus Preview

Preview:

* Sections
* Topics
* Total study load

### Step 4 — Initialization

Automatically generates:

* Personal syllabus structure
* Progress records
* Revision tracking

---

# Syllabus Management

Every branch contains:

* Sections
* Topics
* Progress tracking
* Completion indicators

### Supported Branches

| Branch            | Sections | Topics |
| ----------------- | -------- | ------ |
| MD Kayachikitsa   | 10       | 75+    |
| MD Panchakarma    | 8        | 45+    |
| MD Dravyaguna     | 6        | 35+    |
| MD Roga Nidana    | 5        | 30+    |
| MD Prasuti Tantra | 4        | 14+    |

---

# Topic Lifecycle

Each topic moves through a mastery pipeline.

| Level | Status      |
| ----- | ----------- |
| 0     | Not Started |
| 1     | Studied     |
| 2     | Revising    |
| 3     | Retained    |
| 4     | Mastered    |

Students always know exactly where they stand.

---

# Revision Engine

The platform's core feature.

When a topic is marked as studied, MedMaster AI automatically creates a structured revision schedule.

## Revision Schedule

| Revision   | Day    |
| ---------- | ------ |
| Revision 1 | Day 7  |
| Revision 2 | Day 14 |
| Revision 3 | Day 21 |
| Revision 4 | Day 45 |
| Revision 5 | Day 90 |

Purpose:

* Improve long-term retention
* Reduce forgetting curve effects
* Increase exam recall

---

# Revision Consistency Score (RCS)

The platform's north-star metric.

Formula:

RCS = (Completed Revisions On Time / Total Scheduled Revisions) × 100

### Benchmarks

| Score    | Interpretation    |
| -------- | ----------------- |
| 90–100   | Outstanding       |
| 80–89    | Excellent         |
| 70–79    | Good              |
| 60–69    | Needs Improvement |
| Below 60 | At Risk           |

---

# Smart Snooze System

Students can postpone revisions when necessary.

Rules:

* Maximum snooze period: 7 days
* Maximum snoozes per revision: 3
* Exceeding limits marks revision as overdue

This balances flexibility with accountability.

---

# Study Resource Management

Upload and organize academic materials.

Supported file types:

* PDF
* PPT
* PPTX
* DOCX
* Images

Features:

* Drag-and-drop upload
* Topic attachment
* Secure storage
* Access control

---

# Homepage Dashboard

The homepage acts as the student's academic command center.

Includes:

### Personalized Greeting

Dynamic welcome based on time of day.

### Quick Time Mode

Study sessions:

* 15 minutes
* 30 minutes
* 60 minutes

### Today's Revisions

Displays:

* Due revisions
* Overdue revisions
* Priority tasks

### Academic Snapshot

Quick metrics:

* Topics studied
* Topics mastered
* Pending revisions
* RCS score

---

# Topic Workspace

Each topic includes five dedicated tabs.

## Notes

Store:

* Personal notes
* Teacher notes
* Extracted content

## Revision Notes

Condensed exam-oriented notes.

## MCQs

Practice questions and self-assessment.

## Discussion

Community discussion and doubt solving.

## Progress

Displays:

* Revision history
* Completion status
* Retention level
* Topic health

---

# Progress Analytics

Visual insights into academic performance.

Metrics include:

### Topic Distribution

Shows:

* Not Started
* Studied
* Revising
* Retained
* Mastered

### Revision History

Chronological revision timeline.

### Weak Topic Detection

Automatically identifies:

* Overdue topics
* Frequently snoozed topics
* Low-retention subjects

---

# Community Resources

A shared academic library.

Browse:

* Notes
* PPTs
* Revision summaries
* Previous year materials

Content can be:

* Uploaded
* Shared
* Reused

while maintaining user privacy.

---

# Profile & Achievements

Track academic growth.

Includes:

* Study statistics
* Revision streaks
* Achievement badges
* Branch information
* Account settings

---

# AI Features (Phase 2)

Upcoming AI-powered tools.

## AI Revision Notes

Generate concise revision material from uploaded resources.

## AI MCQ Generator

Create exam-oriented questions automatically.

## Smart Summaries

Extract:

* Key points
* High-yield facts
* Exam pearls

## Large File Processing

Process:

* Books
* PDFs
* Class notes

using asynchronous AI pipelines.

---

# Technology Stack

| Layer           | Technology       |
| --------------- | ---------------- |
| Frontend        | Next.js 14       |
| Language        | TypeScript       |
| Styling         | Tailwind CSS     |
| Backend         | Supabase         |
| Database        | PostgreSQL       |
| Authentication  | Supabase Auth    |
| Storage         | Supabase Storage |
| Hosting         | Vercel           |
| Monitoring      | Sentry           |
| Analytics       | PostHog          |
| AI Layer        | OpenAI API       |
| Background Jobs | Edge Functions   |

---

# Architecture

Frontend

↓

Server Actions

↓

Supabase

├── Auth

├── Postgres

├── Storage

└── Edge Functions

↓

OpenAI

↓

Analytics & Monitoring

---

# Security

Security is a first-class concern.

Implemented protections:

* Row Level Security (RLS)
* Authenticated API access
* Secure file storage
* Session validation
* Input sanitization
* Server-side authorization
* Audit logging

Users can never access another student's:

* Notes
* Scores
* Progress
* Revision history

---

# Database Highlights

Key entities:

* users
* profiles
* branches
* sections
* topics
* user_topics
* revisions
* uploads
* achievements
* audit_logs

All sensitive data is protected using RLS policies.

---

# Development Setup

## Requirements

* Node.js 18+
* npm or pnpm
* Supabase account
* Vercel account

---

## Installation

```bash
git clone <repository-url>
cd medmaster-ai
npm install
```

---

## Environment Variables

Create:

```bash
.env.local
```

Add:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

NEXT_PUBLIC_APP_URL=

OPENAI_API_KEY=

SENTRY_DSN=

NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

---

## Database Setup

```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
supabase db push
```

---

## Run Locally

```bash
npm run dev
```

Application runs at:

http://localhost:3000

---

# Testing

Run unit tests:

```bash
npm run test
```

Run end-to-end tests:

```bash
npm run test:e2e
```

Tools:

* Vitest
* Playwright

---

# Monitoring

Production monitoring includes:

### Sentry

Tracks:

* Frontend errors
* API failures
* Edge function crashes

### PostHog

Tracks:

* Signups
* Activation
* Retention
* Revision behavior
* Feature usage

---

# Deployment

Deploy frontend:

```bash
vercel
```

Configure:

* Environment variables
* Production auth URLs
* Domain settings

---

# Roadmap

## Phase 1

* Authentication
* Onboarding
* Syllabus
* Revision engine
* File uploads
* Analytics dashboard

## Phase 2

* AI note generation
* AI MCQ generation
* Smart summaries
* Large file processing

## Phase 3

* Mobile applications
* Offline mode
* Push notifications
* Adaptive revision algorithms
* Collaborative study groups

---

# Mission

To become the default academic operating system for Ayurveda postgraduate education by combining structured learning, revision science, and AI-powered study assistance.

---

Built for MD Ayurveda PG students.

Study. Revise. Retain. Master. 🌿