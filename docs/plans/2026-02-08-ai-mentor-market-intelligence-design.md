# AI Mentor System & Morocco Market Intelligence Design

**Date:** 2026-02-08
**Status:** Implemented
**Author:** Claude Code

## Overview

This document describes the design and implementation of:
1. AI-powered mentor system with pre-built experts and custom mentor creation
2. Morocco job market intelligence with salary prediction and job matching algorithms
3. Partner/employer system for job and event posting

## 1. AI Mentor System

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    AI MENTOR ECOSYSTEM                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRE-BUILT MENTORS          CUSTOM MENTORS        ONBOARDING    │
│  ┌────────────────┐    ┌─────────────────┐   ┌──────────────┐   │
│  │ Dr. Amina      │    │ User-created    │   │ 5 Questions  │   │
│  │ (Healthcare)   │    │ with custom:    │   │ → Field      │   │
│  │                │    │ - Name          │   │ → Level      │   │
│  │ Youssef (HSE)  │    │ - Personality   │   │ → Challenge  │   │
│  │                │    │ - Style         │   │ → Style      │   │
│  │ Karim          │    │ - Focus areas   │   │ → Language   │   │
│  │ (Industrial)   │    │ - Language      │   │              │   │
│  │                │    │                 │   │ → Top 3      │   │
│  │ Leila          │    │                 │   │   matches    │   │
│  │ (Interviews)   │    │                 │   │              │   │
│  │                │    │                 │   │              │   │
│  │ Hassan         │    │                 │   │              │   │
│  │ (Strategy)     │    │                 │   │              │   │
│  └────────────────┘    └─────────────────┘   └──────────────┘   │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              CONVERSATION ENGINE                           │  │
│  │  - Streaming AI responses                                  │  │
│  │  - Context-aware (resume, goals, skill gaps)              │  │
│  │  - Multi-language (FR, AR, EN, Darija)                    │  │
│  │  - Action triggers (tasks, goals, reminders)              │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `ai_mentor_template` | Pre-built expert mentors (5 templates) |
| `user_ai_mentor` | User's selected/custom mentors |
| `ai_mentor_conversation` | Chat history with context |
| `ai_mentor_session` | Scheduled coaching sessions |
| `user_mentor_onboarding` | Onboarding answers for matching |

### Pre-built Mentors

| Name | Specialization | Personality | Languages |
|------|---------------|-------------|-----------|
| Dr. Amina | Healthcare | Supportive | FR, AR, EN |
| Youssef | HSE | Analytical | FR, AR, EN |
| Karim | Industrial | Challenging | FR, AR, Darija |
| Leila | Interviews | Motivational | FR, AR, EN |
| Hassan | Career Strategy | Analytical | FR, AR, EN |

### API Endpoints

```
GET  /ai-mentor/templates              - List mentor templates
POST /ai-mentor/templates/seed         - Seed templates (admin)
GET  /ai-mentor/my-mentors             - List user's mentors
POST /ai-mentor/my-mentors/select-template - Select template
POST /ai-mentor/my-mentors/custom      - Create custom mentor
GET  /ai-mentor/conversations          - List conversations
POST /ai-mentor/conversations          - Start conversation
POST /ai-mentor/conversations/{id}/messages - Send message
GET  /ai-mentor/onboarding             - Get onboarding status
PUT  /ai-mentor/onboarding             - Update onboarding
GET  /ai-mentor/onboarding/recommendations - Get recommended mentors
```

## 2. Morocco Market Intelligence

### Job Market Data

```
┌─────────────────────────────────────────────────────────────────┐
│                 MOROCCO MARKET INTELLIGENCE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  SALARY DATA              SKILL DEMAND           REGIONAL STATS  │
│  ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐  │
│  │ By role        │   │ Demand score    │   │ Jobs by region │  │
│  │ By region      │   │ Growth trend    │   │ Average salary │  │
│  │ By experience  │   │ Salary boost    │   │ Unemployment   │  │
│  │ By field       │   │ Learning time   │   │ Top industries │  │
│  └────────────────┘   └─────────────────┘   └────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    ALGORITHMS                              │  │
│  ├───────────────────────────────────────────────────────────┤  │
│  │  JOB MATCH SCORE                                          │  │
│  │  Skills (40%) + Experience (25%) + Location (20%) +       │  │
│  │  Salary (15%) = Match %                                   │  │
│  │                                                           │  │
│  │  SALARY PREDICTOR                                         │  │
│  │  Base (field/role) × Region multiplier × Skill premium    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `market_salary_data` | Salary benchmarks by role/region/experience |
| `skill_demand` | Skills with demand scores and growth trends |
| `regional_job_stats` | Job statistics by Moroccan region |
| `employer_database` | Major employers in Morocco |
| `job_listing` | Job listings from partners |

### Salary Data (Sample)

| Role | Field | Level | Min (MAD/yr) | Median | Max |
|------|-------|-------|--------------|--------|-----|
| Infirmier | Healthcare | Entry | 42,000 | 54,000 | 72,000 |
| Infirmier | Healthcare | Mid | 60,000 | 84,000 | 120,000 |
| Responsable HSE | HSE | Senior | 180,000 | 264,000 | 400,000 |
| Conducteur Engins | Industrial | Mid | 72,000 | 96,000 | 144,000 |

### Regional Data

| Region | Jobs | Growth | Avg Salary | Top Industry |
|--------|------|--------|------------|--------------|
| Casablanca-Settat | 45,000 | +8.5% | 96,000 | Services |
| Rabat-Salé-Kénitra | 28,000 | +6.2% | 84,000 | Government |
| Tanger-Tétouan | 22,000 | +12.3% | 78,000 | Automotive |
| Marrakech-Safi | 18,000 | +5.8% | 66,000 | Tourism |

### API Endpoints

```
GET  /market/salaries              - List salary data
POST /market/salaries/predict      - Predict salary
GET  /market/skills                - List skill demand
GET  /market/skills/top            - Top in-demand skills
GET  /market/skills/rising         - Rising skills
GET  /market/regions               - Regional statistics
GET  /market/employers             - Employer database
POST /market/job-match             - Calculate job match score
```

## 3. Partner System

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PARTNER ECOSYSTEM                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PARTNER TYPES           FEATURES               WORKFLOW         │
│  ┌────────────────┐   ┌─────────────────┐   ┌────────────────┐  │
│  │ Employer       │   │ Post jobs       │   │ Register       │  │
│  │ Recruiter      │   │ Post events     │   │     ↓          │  │
│  │ Training Center│   │ View applicants │   │ Pending review │  │
│  │ Government     │   │ Manage listings │   │     ↓          │  │
│  │ NGO            │   │ Analytics       │   │ Approved/      │  │
│  │                │   │                 │   │ Rejected       │  │
│  └────────────────┘   └─────────────────┘   └────────────────┘  │
│                                                                  │
│  JOB POSTINGS                    EVENTS                         │
│  ┌────────────────────────┐   ┌────────────────────────────┐   │
│  │ Title, Description     │   │ Job fairs, Workshops       │   │
│  │ Location, Salary       │   │ Webinars, Training         │   │
│  │ Requirements, Skills   │   │ Open days, Networking      │   │
│  │ Application tracking   │   │ Registration tracking      │   │
│  └────────────────────────┘   └────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `partner_profile` | Partner company profiles |
| `partner_job_posting` | Job listings from partners |
| `partner_job_application` | User applications to jobs |
| `partner_event` | Events posted by partners |
| `partner_event_registration` | Event registrations |
| `saved_job` | User's saved jobs |

### User Roles

| Role | Permissions |
|------|-------------|
| `user` | View jobs, apply, save, register for events |
| `partner` | Post jobs/events, view applications, manage listings |
| `admin` | Approve partners, review content, full access |

## 4. Implementation Status

### Completed

- [x] AI Mentor database schema
- [x] AI Mentor ORPC services and router
- [x] Market intelligence database schema
- [x] Market intelligence services and router
- [x] Partner system database schema
- [x] Job match scoring algorithm
- [x] Salary prediction algorithm
- [x] Pre-built mentor templates (5 experts)

### Pending

- [ ] Frontend: AI Mentor onboarding wizard
- [ ] Frontend: Mentor chat interface
- [ ] Frontend: Market intelligence dashboard
- [ ] Frontend: Partner registration/dashboard
- [ ] Seed all reference data
- [ ] Fix remaining hardcoded data

## 5. Key Files

### Services
- `src/integrations/orpc/services/ai-mentor.ts`
- `src/integrations/orpc/services/market-intelligence.ts`

### Routers
- `src/integrations/orpc/router/ai-mentor.ts`
- `src/integrations/orpc/router/market-intelligence.ts`

### Schema
- `src/integrations/drizzle/schema.ts` (AI mentor, market, partner tables)

## 6. Next Steps

1. **Seed Data**: Run admin seed endpoints to populate templates and market data
2. **Frontend Development**: Build the onboarding wizard and chat UI
3. **Partner Features**: Complete partner registration and dashboard
4. **Integration**: Connect frontend pages to new APIs
5. **Testing**: End-to-end testing of all features
