# IMTA Resume - Complete API Reference

This document provides comprehensive API documentation for all ORPC endpoints in IMTA Resume.

## Table of Contents

1. [Authentication & Authorization](#authentication--authorization)
2. [Core Resume Endpoints](#core-resume-endpoints)
3. [AI Endpoints](#ai-endpoints)
4. [Career Management Endpoints](#career-management-endpoints)
5. [Interview & Training Endpoints](#interview--training-endpoints)
6. [Job Applications & Tracking](#job-applications--tracking)
7. [Learning Path Endpoints](#learning-path-endpoints)
8. [Admin Endpoints](#admin-endpoints)
9. [Reference Data Endpoints](#reference-data-endpoints)
10. [Storage & Utility Endpoints](#storage--utility-endpoints)
11. [Error Handling](#error-handling)
12. [Rate Limiting](#rate-limiting)

---

## Authentication & Authorization

### Overview

IMTA Resume uses **Better Auth** for authentication with the following supported methods:

| Method | Description |
|--------|-------------|
| Email/Password | Traditional email and password authentication (min 12 characters) |
| Google OAuth | Sign in with Google account |
| GitHub OAuth | Sign in with GitHub account |
| Custom OAuth | Configurable OpenID Connect provider |
| Two-Factor Auth | TOTP-based 2FA support |
| Passkeys | WebAuthn/FIDO2 passwordless authentication |
| API Keys | Programmatic access for integrations |

### Procedure Types

ORPC middleware determines authorization levels:

| Procedure | Description | Headers Required |
|-----------|-------------|------------------|
| `publicProcedure` | No authentication required | None |
| `protectedProcedure` | Requires authenticated user | Session cookie or `x-api-key` |
| `adminProcedure` | Requires admin role | Session cookie (admin user) |
| `serverOnlyProcedure` | Internal server-to-server only | `x-server-side-call: true` |
| `aiRateLimitedProcedure` | Protected + AI rate limits | Session cookie or `x-api-key` |
| `uploadRateLimitedProcedure` | Protected + upload rate limits | Session cookie or `x-api-key` |

### Auth Router

**Base path:** `/api/orpc/auth`

#### List Auth Providers (Public)

Returns enabled authentication providers for the instance.

```typescript
GET /api/orpc/auth/providers/list

// Response
{
  email: boolean;
  google: boolean;
  github: boolean;
  custom?: { displayName: string };
}
```

#### Verify Resume Password (Public)

Verify password for a locked public resume.

```typescript
POST /api/orpc/auth/verify-resume-password

// Request
{
  slug: string;      // Resume slug
  username: string;  // Resume owner username
  password: string;  // Password to verify
}

// Response
boolean  // true if password matches
```

#### Get User Role (Protected)

Get the authenticated user's role.

```typescript
GET /api/orpc/auth/user-role

// Response
{
  role: "user" | "admin" | "partner"
}
```

#### Delete Account (Protected)

Permanently delete the authenticated user's account and all associated data.

```typescript
DELETE /api/orpc/auth/delete-account

// Response
void
```

---

## Core Resume Endpoints

**Base path:** `/api/orpc/resume`

### Resume Operations

#### List Resumes (Protected)

Get all resumes for the authenticated user.

```typescript
GET /api/orpc/resume/list

// Request (optional)
{
  tags?: string[];          // Filter by tags
  sort?: "lastUpdatedAt" | "createdAt" | "name";  // Sort order
}

// Response
Array<{
  id: string;
  name: string;
  slug: string;
  tags: string[];
  isPublic: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}>
```

#### Get Resume by ID (Protected)

```typescript
GET /api/orpc/resume/{id}

// Response
{
  id: string;
  name: string;
  slug: string;
  tags: string[];
  data: ResumeData;    // Full resume data schema
  isPublic: boolean;
  isLocked: boolean;
  hasPassword: boolean;
}
```

#### Get Resume by Slug (Public)

Get a public resume by username and slug.

```typescript
GET /api/orpc/resume/{username}/{slug}

// Response
{
  id: string;
  name: string;
  slug: string;
  tags: string[];
  data: ResumeData;
  isPublic: boolean;
  isLocked: boolean;
}
```

#### Create Resume (Protected)

```typescript
POST /api/orpc/resume/create

// Request
{
  name: string;              // 1-64 characters
  slug: string;              // 1-64 characters, URL-safe
  tags: string[];
  withSampleData?: boolean;  // Initialize with sample content
}

// Response
string  // New resume ID

// Errors
RESUME_SLUG_ALREADY_EXISTS (400)
```

#### Import Resume (Protected)

Import a resume from JSON data.

```typescript
POST /api/orpc/resume/import

// Request
{
  data: ResumeData  // Complete resume data object
}

// Response
string  // Imported resume ID
```

#### Update Resume (Protected)

```typescript
PUT /api/orpc/resume/{id}

// Request
{
  id: string;
  name?: string;
  slug?: string;
  tags?: string[];
  data?: ResumeData;
  isPublic?: boolean;
}

// Response
void
```

#### Duplicate Resume (Protected)

```typescript
POST /api/orpc/resume/{id}/duplicate

// Request
{
  id: string;
  name?: string;   // Optional new name
  slug?: string;   // Optional new slug
  tags?: string[];
}

// Response
string  // Duplicated resume ID
```

#### Delete Resume (Protected)

```typescript
DELETE /api/orpc/resume/{id}

// Response
void
```

#### Set Resume Locked (Protected)

Toggle the locked status of a resume.

```typescript
POST /api/orpc/resume/{id}/set-locked

// Request
{
  id: string;
  isLocked: boolean;
}

// Response
void
```

#### Set Resume Password (Protected)

Set a password to protect a public resume.

```typescript
POST /api/orpc/resume/{id}/set-password

// Request
{
  id: string;
  password: string;  // 6-64 characters
}

// Response
void
```

#### Remove Resume Password (Protected)

```typescript
POST /api/orpc/resume/{id}/remove-password

// Request
{ id: string }

// Response
void
```

### Resume Statistics

#### Get Statistics (Protected)

```typescript
GET /api/orpc/resume/statistics/{id}

// Response
{
  isPublic: boolean;
  views: number;
  downloads: number;
  lastViewedAt: Date | null;
  lastDownloadedAt: Date | null;
}
```

### Resume Tags

#### List Tags (Protected)

```typescript
GET /api/orpc/resume/tags/list

// Response
string[]  // All unique tags used by user's resumes
```

---

## AI Endpoints

IMTA Resume provides comprehensive AI-powered features for resume optimization, content generation, and career assistance.

### AI Configuration

**Base path:** `/api/orpc/aiConfig`

#### Check AI Availability (Public)

```typescript
GET /api/orpc/aiConfig/status/check

// Response
{
  available: boolean;
  provider: {
    displayName: string;
    provider: string;
    model: string;
  } | null;
}
```

#### Get My Usage (Protected)

```typescript
GET /api/orpc/aiConfig/usage/getMyUsage

// Response
{
  daily: {
    requests: number;
    tokens: number;
    limit: number;
    remaining: number;
  };
  monthly: {
    requests: number;
    tokens: number;
    limit: number;
    remaining: number;
  };
  lastRequest: Date | null;
  quotaPlan: { name: string } | null;
}
```

#### Get My Quota (Protected)

```typescript
GET /api/orpc/aiConfig/usage/getMyQuota

// Response
{
  allowed: boolean;
  reason?: string;
  daily: { requests: number; limit: number; remaining: number };
  monthly: { requests: number; limit: number; remaining: number };
}
```

### Core AI Operations

**Base path:** `/api/orpc/ai`

#### Test Connection

```typescript
POST /api/orpc/ai.testConnection

// Response (streaming)
"1"
```

#### Parse PDF

Extract resume data from PDF files.

```typescript
POST /api/orpc/ai.parsePdf

// Request
{
  file: {
    name: string;      // File name
    data: string;      // Base64 encoded PDF
  }
}

// Response
ResumeData
```

#### Parse DOCX

Extract resume data from Word documents.

```typescript
POST /api/orpc/ai.parseDocx

// Request
{
  file: {
    name: string;
    data: string;  // Base64 encoded
  };
  mediaType: "application/msword" |
             "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
}

// Response
ResumeData
```

#### Improve Content

Enhance resume content with professional language (streaming).

```typescript
POST /api/orpc/ai.improveContent

// Request
{
  content: string;      // Original content
  context?: string;     // Additional context
  language?: string;    // Target language
  resumeId?: string;    // For history tracking
}

// Response (streaming)
string  // Improved content in chunks
```

#### Generate Summary

Create a professional summary from resume data (streaming).

```typescript
POST /api/orpc/ai.generateSummary

// Request
{
  resumeData: {
    name?: string;
    headline?: string;
    experience?: Array<{ company?: string; position?: string; description?: string }>;
    education?: Array<{ institution?: string; degree?: string; area?: string }>;
    skills?: Array<{ name?: string }>;
  };
  language?: string;
  resumeId?: string;
}

// Response (streaming)
string
```

#### Generate Headline

```typescript
POST /api/orpc/ai.generateHeadline

// Request
{
  resumeData: {
    name?: string;
    currentHeadline?: string;
    experience?: Array<{ company?: string; position?: string }>;
    skills?: string[];
  };
  language?: string;
  resumeId?: string;
}

// Response (streaming)
string
```

#### Suggest Skills

```typescript
POST /api/orpc/ai.suggestSkills

// Request
{
  resumeData: {
    experience?: Array<{ company?: string; position?: string; description?: string }>;
    education?: Array<{ institution?: string; degree?: string; area?: string }>;
    existingSkills?: string[];
  };
  language?: string;
  resumeId?: string;
}

// Response
Array<{
  name: string;
  level: number;  // 1-5
}>
```

#### Fix Grammar

```typescript
POST /api/orpc/ai.fixGrammar

// Request
{
  content: string;
  language?: string;
  resumeId?: string;
}

// Response (streaming)
string
```

#### Analyze Resume

Comprehensive resume analysis with scoring.

```typescript
POST /api/orpc/ai.analyzeResume

// Request
{
  resumeData: ResumeData;
  language?: string;
  resumeId?: string;
}

// Response
{
  overallScore: number;  // 0-100
  sectionScores: {
    basics: number;
    summary: number;
    experience: number;
    education: number;
    skills: number;
    // ...other sections
  };
  strengths: string[];
  weaknesses: string[];
  improvements: Array<{
    section: string;
    suggestion: string;
    priority: "high" | "medium" | "low";
  }>;
  atsCompatibility: number;
  readability: number;
}
```

### AI Writer

**Base path:** `/api/orpc/aiWriter`

#### Generate Bullet Points

```typescript
POST /api/orpc/aiWriter.generateBulletPoints

// Request
{
  description: string;
  tone: "professional" | "confident" | "friendly" | "executive" | "creative";
  save?: boolean;
}

// Response
{
  bulletPoints: Array<{
    id: string;
    original: string;
    enhanced: string;
    metrics?: string;
  }>;
  id?: string;  // If saved
}
```

#### Generate Cover Letter

```typescript
POST /api/orpc/aiWriter.generateCoverLetter

// Request
{
  jobTitle: string;
  companyName: string;
  skills: string[];
  tone: ToneType;
  save?: boolean;
}

// Response
{
  coverLetter: string;
  id?: string;
}
```

#### Extract Skills from Job Posting

```typescript
POST /api/orpc/aiWriter.extractSkills

// Request
{
  jobPosting: string;
  save?: boolean;
}

// Response
{
  skills: {
    hardSkills: string[];
    softSkills: string[];
    certifications: string[];
    tools: string[];
  };
  id?: string;
}
```

#### Optimize LinkedIn

```typescript
POST /api/orpc/aiWriter.optimizeLinkedIn

// Request
{
  summary: string;
  save?: boolean;
}

// Response
{
  optimized: string;
  keywords: string[];
  id?: string;
}
```

#### Check Grammar

```typescript
POST /api/orpc/aiWriter.checkGrammar

// Request
{ text: string }

// Response
Array<{
  text: string;
  suggestion: string;
  type: "grammar" | "clarity" | "style" | "spelling";
  position: number;
}>
```

### AI Mentor

**Base path:** `/api/orpc/aiMentor`

#### List Mentor Templates

```typescript
GET /api/orpc/aiMentor.templates.list

// Response
Array<{
  id: string;
  name: string;
  nameFr: string;
  avatar?: string;
  title: string;
  titleFr: string;
  specialization: MentorSpecialization;
  personality: MentorPersonality;
  style: MentorStyle;
  description: string;
  descriptionFr: string;
  expertise: string[];
  languages: string[];
  welcomeMessage: string;
  sampleQuestions: string[];
}>
```

#### Select Template as Mentor

```typescript
POST /api/orpc/aiMentor.user.selectTemplate

// Request
{ templateId: string }

// Response
{ id: string; ...mentorData }
```

#### Create Custom Mentor

```typescript
POST /api/orpc/aiMentor.user.createCustom

// Request
{
  customName: string;
  customAvatar?: string;
  customPersonality?: "supportive" | "challenging" | "balanced" | "motivational" | "analytical";
  customStyle?: "formal" | "casual" | "professional" | "friendly";
  customSpecializations?: string[];
  customLanguages?: string[];
  customSystemPrompt?: string;
  customFocusAreas?: string[];
  sessionFrequency?: string;
  preferredTime?: string;
}

// Response
{ id: string; ...mentorData }
```

#### Start Conversation

```typescript
POST /api/orpc/aiMentor.conversations.create

// Request
{
  mentorId: string;
  topic?: string;
  context?: {
    resumeId?: string;
    goalId?: string;
    jobApplicationId?: string;
    skillGaps?: string[];
  };
}

// Response
{
  id: string;
  mentorId: string;
  topic?: string;
  messages: [];
  createdAt: Date;
}
```

#### Send Message

```typescript
POST /api/orpc/aiMentor.conversations.sendMessage

// Request
{
  conversationId: string;
  content: string;
}

// Response
{
  message: {
    role: "assistant";
    content: string;
    timestamp: string;
    tokens?: number;
  };
  conversation: {...};
}
```

---

## Career Management Endpoints

### Career Goals

**Base path:** `/api/orpc/goals`

#### Create Goal

```typescript
POST /api/orpc/goals

// Request
{
  title: string;                    // 1-255 characters
  description?: string;
  category: "career" | "skill" | "education" | "networking" | "financial" | "other";
  status?: "not_started" | "in_progress" | "completed" | "on_hold" | "cancelled";
  priority?: number;                // 0-5
  targetDate?: Date;
  progress?: number;                // 0-100
  tags?: string[];
  metrics?: Array<{ name: string; target: number; current: number }>;
}

// Response
string  // Goal ID
```

#### List Goals

```typescript
GET /api/orpc/goals

// Request (optional)
{
  status?: GoalStatus;
  category?: GoalCategory;
  includeCompleted?: boolean;
}

// Response
Array<{
  id: string;
  title: string;
  description: string | null;
  category: string;
  status: GoalStatus;
  priority: number;
  targetDate: Date | null;
  completedAt: Date | null;
  progress: number;
  tags: string[] | null;
  metrics: GoalMetric[] | null;
  milestones: Milestone[];
  createdAt: Date;
  updatedAt: Date;
}>
```

#### Update Goal Progress

```typescript
POST /api/orpc/goals/{id}/progress

// Request
{
  id: string;
  progress: number;  // 0-100
}

// Response
void
```

#### Get Goal Statistics

```typescript
GET /api/orpc/goals/statistics

// Response
{
  total: number;
  byStatus: Record<string, number>;
  byCategory: Record<string, number>;
  completedThisMonth: number;
  averageProgress: number;
  active: number;
}
```

### Goal Milestones

#### Create Milestone

```typescript
POST /api/orpc/goals/{goalId}/milestones

// Request
{
  goalId: string;
  title: string;
  description?: string;
  dueDate?: Date;
  order?: number;
}

// Response
string  // Milestone ID
```

#### Toggle Milestone

```typescript
POST /api/orpc/goals/{goalId}/milestones/{id}/toggle

// Response
boolean  // New completed state
```

---

## Job Applications & Tracking

**Base path:** `/api/orpc/jobApplications`

### Application Status Values

```typescript
type ApplicationStatus =
  | "saved"
  | "applied"
  | "phone_screen"
  | "interview"
  | "offer"
  | "rejected"
  | "withdrawn"
  | "accepted";
```

#### Create Application

```typescript
POST /api/orpc/job-applications

// Request
{
  companyName: string;
  position: string;
  location?: string;
  jobUrl?: string;
  jobDescription?: string;
  salary?: string;
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  status?: ApplicationStatus;
  appliedAt?: Date;
  deadline?: Date;
  source?: string;
  contactName?: string;
  contactEmail?: string;
  contactPhone?: string;
  notes?: string;
  tags?: string[];
  priority?: number;  // 0-5
  isRemote?: boolean;
  workType?: string;
  resumeId?: string;
}

// Response
string  // Application ID
```

#### List Applications

```typescript
GET /api/orpc/job-applications

// Request (optional)
{
  status?: ApplicationStatus;
  search?: string;
  tags?: string[];
  sort?: "createdAt" | "updatedAt" | "companyName" | "appliedAt" | "deadline";
  sortOrder?: "asc" | "desc";
  limit?: number;
  offset?: number;
}

// Response
Array<ApplicationData>
```

#### Update Application Status

```typescript
POST /api/orpc/job-applications/{id}/status

// Request
{
  id: string;
  status: ApplicationStatus;
}

// Response
void
```

#### Get Statistics

```typescript
GET /api/orpc/job-applications/statistics

// Response
{
  total: number;
  byStatus: Record<string, number>;
  thisWeek: number;
  responseRate: number;
}
```

### Application Activities

#### Add Activity

```typescript
POST /api/orpc/job-applications/{applicationId}/activities

// Request
{
  applicationId: string;
  activityType: string;
  description?: string;
  scheduledAt?: Date;
  metadata?: Record<string, unknown>;
}

// Response
string  // Activity ID
```

---

## Interview & Training Endpoints

**Base path:** `/api/orpc/interview`

### Interview Sessions

#### Create Session

```typescript
POST /api/orpc/interview.createSession

// Request
{
  title: string;
  description?: string;
  field: "healthcare" | "industrial" | "hse" | "general";
  program?: ImtaProgram;
  types: InterviewType[];
  difficulty: "beginner" | "intermediate" | "advanced";
  language?: string;
  resumeId?: string;
  jobPosition?: string;
  companyName?: string;
}

// Response
{
  id: string;
  title: string;
  questions: InterviewQuestion[];
  status: "pending";
  ...
}
```

#### Start Session

```typescript
POST /api/orpc/interview.startSession

// Request
{ sessionId: string }

// Response
{
  session: InterviewSession;
  firstQuestion: InterviewQuestion;
}
```

#### Submit Response

```typescript
POST /api/orpc/interview.submitResponse

// Request
{
  sessionId: string;
  questionId: string;
  response: string;
  responseTime?: number;
  audioUrl?: string;
}

// Response
{
  evaluation: ResponseEvaluation;
  nextQuestion?: InterviewQuestion;
  isComplete: boolean;
}
```

#### Get Session Analysis

```typescript
GET /api/orpc/interview.getAnalysis

// Request
{ sessionId: string }

// Response
{
  overallScore: number;
  scoreBreakdown: Record<InterviewType, number>;
  topStrengths: string[];
  topWeaknesses: string[];
  recommendations: string[];
  readinessLevel: string;
  summary: string;
  nextSteps: string[];
}
```

### Voice Interview

**Base path:** `/api/orpc/voiceInterview`

Voice-based interview practice with real-time AI conversation.

---

## Learning Path Endpoints

**Base path:** `/api/orpc/learningPath`

### Learning Paths

#### Generate AI Learning Path

```typescript
POST /api/orpc/learning-path/generate

// Request
{
  targetRoleId: string;
  weeklyHours?: number;     // 1-40, default 10
  focusAreas?: string[];
  learningStyle?: "visual" | "reading" | "hands-on" | "mixed";
}

// Response
{
  learningPath: {
    id: string;
    title: string;
    titleFr: string;
    description: string;
    estimatedDuration: string;
    priority: "low" | "medium" | "high" | "critical";
    status: "not_started" | "in_progress" | "completed";
    progress: number;
    skills: LearningPathSkill[];
    milestones: LearningPathMilestone[];
    aiGenerated: boolean;
    aiAnalysis: string;
  };
  gapAnalysis: SkillGapAnalysis;
}
```

#### Create Manual Learning Path

```typescript
POST /api/orpc/learning-path

// Request
{
  title: string;
  titleFr?: string;
  description?: string;
  targetRoleId?: string;
  estimatedDuration?: string;
  priority?: "low" | "medium" | "high" | "critical";
  skills?: LearningPathSkill[];
  milestones?: LearningPathMilestone[];
}

// Response
LearningPath
```

#### Start Learning Path

```typescript
POST /api/orpc/learning-path/{id}/start

// Response
LearningPath
```

#### Complete Milestone

```typescript
POST /api/orpc/learning-path/{pathId}/milestone/{milestoneId}/complete

// Response
LearningPath
```

### Skill Progress

**Base path:** `/api/orpc/skillProgress`

#### List Skill Progress

```typescript
GET /api/orpc/skill-progress

// Response
Array<{
  skillName: string;
  skillNameFr: string;
  category: SkillCategory;
  currentLevel: number;
  targetLevel: number;
  progress: number;
  practiceHours: number;
  lastPracticed: Date;
}>
```

#### Update Skill Level

```typescript
PUT /api/orpc/skill-progress/{skillName}/level

// Request
{
  skillName: string;
  level: number;  // 1-5
  notes?: string;
}

// Response
SkillProgress
```

#### Log Practice Session

```typescript
POST /api/orpc/skill-progress/{skillName}/practice

// Request
{
  skillName: string;
  hours: number;  // 0.25-12
  notes?: string;
}

// Response
SkillProgress
```

---

## Admin Endpoints

**Base path:** `/api/orpc/admin`

All admin endpoints require the `admin` role.

### Analytics

#### Get Overview

```typescript
GET /api/orpc/admin/analytics/overview

// Response
{
  users: number;
  resumes: number;
  views: number;
  downloads: number;
}
```

#### Get Advanced Overview

```typescript
GET /api/orpc/admin/analytics/advanced-overview

// Response
{
  users: {
    total: number;
    active7d: number;
    active30d: number;
    new7d: number;
    new30d: number;
    verified: number;
    admins: number;
  };
  resumes: {
    total: number;
    public: number;
    locked: number;
  };
  engagement: {
    totalViews: number;
    totalDownloads: number;
    activeSessions: number;
  };
  templateUsage: Array<{ template: string; count: number }>;
}
```

#### Get User Growth

```typescript
GET /api/orpc/admin/analytics/user-growth

// Request
{ days?: number }  // 1-365, default 30

// Response
Array<{ date: string; count: number }>
```

### User Management

#### List Users

```typescript
GET /api/orpc/admin/users

// Request
{
  page?: number;
  limit?: number;    // 1-100
  search?: string;
}

// Response
{
  users: Array<{
    id: string;
    name: string;
    email: string;
    username: string;
    role: "user" | "admin" | "partner";
    emailVerified: boolean;
    createdAt: Date;
    resumeCount: number;
  }>;
  total: number;
  page: number;
  totalPages: number;
}
```

#### Update User Role

```typescript
PUT /api/orpc/admin/users/{userId}/role

// Request
{
  userId: string;
  role: "user" | "admin" | "partner";
}

// Response
{ success: boolean }
```

#### Delete User

```typescript
DELETE /api/orpc/admin/users/{userId}

// Response
{ success: boolean }
```

#### Bulk Delete Users

```typescript
POST /api/orpc/admin/users/bulk-delete

// Request
{ userIds: string[] }  // 1-50 users

// Response
{ deleted: number }
```

### Resume Management

#### List All Resumes

```typescript
GET /api/orpc/admin/resumes

// Request
{
  page?: number;
  limit?: number;
  search?: string;
}

// Response
{
  resumes: Array<ResumeWithOwner>;
  total: number;
  page: number;
  totalPages: number;
}
```

### System Health

```typescript
GET /api/orpc/admin/system/health

// Response
{
  database: {
    status: string;
    latencyMs: number;
  };
  storage: {
    status: string;
  };
  activeSessions: number;
  totalAuditLogs: number;
}
```

### Audit Log

```typescript
GET /api/orpc/admin/audit-log

// Request
{
  page?: number;
  limit?: number;
}

// Response
{
  logs: Array<{
    id: string;
    action: string;
    targetType: string | null;
    targetId: string | null;
    metadata: any;
    createdAt: Date;
    adminName: string | null;
    adminEmail: string | null;
  }>;
  total: number;
  page: number;
  totalPages: number;
}
```

### AI Provider Management (Admin)

**Base path:** `/api/orpc/aiConfig`

#### List Providers

```typescript
GET /api/orpc/aiConfig.providers.list

// Response
Array<{
  id: string;
  provider: AIProvider;
  displayName: string;
  model: string;
  baseUrl?: string;
  isDefault: boolean;
  isEnabled: boolean;
  maxTokensPerRequest: number;
  temperature: string;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
}>
```

#### Create Provider

```typescript
POST /api/orpc/aiConfig.providers.create

// Request
{
  provider: "openai" | "anthropic" | "gemini" | "ollama" | "vercel-ai-gateway" |
            "deepseek" | "groq" | "mistral" | "togetherai" | "openrouter";
  displayName: string;
  apiKey: string;
  model: string;
  baseUrl?: string;
  isDefault?: boolean;
  maxTokensPerRequest?: number;  // 100-128000
  temperature?: string;
  priority?: number;
}

// Response
{ id: string; ...providerData }
```

#### Toggle Provider Enabled

```typescript
PUT /api/orpc/aiConfig.providers.toggleEnabled

// Request
{ id: string }

// Response
{ success: true }
```

---

## Reference Data Endpoints

**Base path:** `/api/orpc`

Reference data for career guidance, available as read-only for users, manageable by admins.

### IMTA Programs

```typescript
GET /api/orpc/imtaPrograms/list
// Returns training programs with metadata

POST /api/orpc/imtaPrograms/create (Admin)
// Create new program

PUT /api/orpc/imtaPrograms/update (Admin)
// Update program
```

### Interview Tips

```typescript
GET /api/orpc/interviewTips/list
// Filter by field, category

POST /api/orpc/interviewTips/create (Admin)
```

### Market Insights

```typescript
GET /api/orpc/marketInsights/list
// Career market statistics
```

### Employers Database

```typescript
GET /api/orpc/employers/list
// Filter by field, sector
```

### Skill Library

```typescript
GET /api/orpc/skillLibrary/list
// Skills by field and category
```

---

## Storage & Utility Endpoints

### File Upload

**Base path:** `/api/orpc/storage`

#### Upload File

```typescript
POST /api/orpc/storage/uploadFile

// Request
File  // Max 10MB, images auto-converted to WebP

// Response
{
  url: string;
  path: string;
  contentType: string;
}
```

#### Delete File

```typescript
POST /api/orpc/storage/deleteFile

// Request
{ filename: string }

// Response
void
```

### QR Code

**Base path:** `/api/orpc/qrCode`

#### Generate QR Code

```typescript
POST /api/orpc/qr-code/generate

// Request
{
  resumeId: string;
  size?: number;
  format?: "png" | "svg";
  theme?: "light" | "dark";
}

// Response
{ url: string; format: string }
```

### Search

**Base path:** `/api/orpc/search`

#### Global Search

```typescript
GET /api/orpc/search

// Request
{ query: string; limit?: number }

// Response
{
  resumes: Array<ResumeSummary>;
  goals: Array<GoalSummary>;
  applications: Array<ApplicationSummary>;
}
```

---

## Error Handling

### Error Response Format

```typescript
{
  code: string;
  message: string;
  issues?: Array<{
    path: string[];
    message: string;
  }>;
}
```

### Standard Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions or quota exceeded |
| `NOT_FOUND` | 404 | Resource not found |
| `BAD_REQUEST` | 400 | Invalid input data |
| `PRECONDITION_FAILED` | 412 | Required configuration missing (e.g., no AI provider) |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |

### Custom Error Codes

| Code | Description |
|------|-------------|
| `RESUME_SLUG_ALREADY_EXISTS` | Duplicate resume slug |
| `AI_PROVIDER_NOT_CONFIGURED` | No AI provider available |
| `QUOTA_EXCEEDED` | User AI quota exceeded |

---

## Rate Limiting

Rate limits are enforced per user using a sliding window algorithm.

### Rate Limit Tiers

| Endpoint Type | Rate Limit | Window |
|--------------|------------|--------|
| General API | 100 requests | 1 minute |
| AI Operations | 20 requests | 1 minute |
| File Uploads | 10 requests | 1 minute |
| Authentication | 10 requests | 1 minute |
| PDF Parsing | 10 requests | 1 hour |
| Content Generation | 50 requests | 1 hour |
| Resume Analysis | 20 requests | 1 hour |
| Mentor Chat | 100 requests | 1 hour |

### Rate Limit Headers

When rate limited, the response includes:

```
Retry-After: <seconds>
```

### Custom Quotas

Administrators can create custom quota plans with:
- Daily request limits
- Monthly request limits
- Daily token limits
- Monthly token limits
- Feature restrictions

---

## Streaming Responses

Several AI endpoints return streaming responses using Server-Sent Events:

- `ai.improveContent`
- `ai.generateSummary`
- `ai.generateHeadline`
- `ai.fixGrammar`
- `ai.testConnection`
- `aiMentor.conversations.sendMessage`

### Client Usage

```typescript
const stream = await orpc.ai.improveContent({
  content: "Managed team projects",
});

for await (const chunk of stream) {
  console.log(chunk);  // "Led" "cross-functional" "team" ...
}
```

---

## TypeScript Types

Import types from the schema:

```typescript
import type {
  AIProvider,
  InterviewType,
  InterviewQuestion,
  ResponseEvaluation,
  ResumeData,
  GoalCategory,
  GoalStatus,
  ApplicationStatus,
} from "@/integrations/drizzle/schema";
```

---

## API Versioning

The current API version is **v1** (implicit). Breaking changes will be communicated through:

1. Deprecation notices in response headers
2. Documentation updates
3. Migration guides

---

## Support

For API issues or questions:
- GitHub Issues: [Support](https://imta.ma)
- Discord: [Join our server](https://discord.gg/EE8yFqW4)
