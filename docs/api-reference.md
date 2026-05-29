# AI API Reference

This document provides detailed API documentation for all AI-related endpoints in IMTA Resume.

## Table of Contents

1. [Authentication](#authentication)
2. [Core AI Endpoints](#core-ai-endpoints)
3. [AI Configuration Endpoints](#ai-configuration-endpoints)
4. [AI Mentor Endpoints](#ai-mentor-endpoints)
5. [AI Writer Endpoints](#ai-writer-endpoints)
6. [AI Analytics Endpoints](#ai-analytics-endpoints)
7. [Interview AI Endpoints](#interview-ai-endpoints)
8. [Error Codes](#error-codes)

---

## Authentication

All AI endpoints require authentication. Endpoints use ORPC middleware:

| Procedure | Description |
|-----------|-------------|
| `publicProcedure` | No authentication required |
| `protectedProcedure` | Requires authenticated user |
| `adminProcedure` | Requires admin role |
| `aiRateLimitedProcedure` | Requires auth + applies rate limits |

---

## Core AI Endpoints

Base path: `/api/orpc/ai`

### Test Connection

Tests AI provider connectivity.

```typescript
POST /api/orpc/ai.testConnection

// No input required

// Response (streaming)
"1"
```

---

### Parse PDF

Extracts resume data from PDF files.

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
ResumeData  // Full resume data object
```

**Example:**
```typescript
const result = await orpc.ai.parsePdf({
  file: {
    name: "resume.pdf",
    data: "JVBERi0xLjQK..."  // base64
  }
});
```

---

### Parse DOCX

Extracts resume data from Word documents.

```typescript
POST /api/orpc/ai.parseDocx

// Request
{
  file: {
    name: string;
    data: string;  // Base64 encoded
  },
  mediaType: "application/msword" | "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
}

// Response
ResumeData
```

---

### Improve Content

Enhances resume content with professional language.

```typescript
POST /api/orpc/ai.improveContent

// Request
{
  content: string;      // Original content to improve
  context?: string;     // Additional context (e.g., job title)
  language?: string;    // Target language (default: user preference)
  resumeId?: string;    // UUID for history tracking
}

// Response (streaming)
string  // Improved content streamed in chunks
```

**Example:**
```typescript
const stream = await orpc.ai.improveContent({
  content: "Managed team projects",
  context: "Software Engineer position"
});

for await (const chunk of stream) {
  console.log(chunk);  // "Led" "cross-functional" "team" ...
}
```

---

### Generate Summary

Creates a professional summary from resume data.

```typescript
POST /api/orpc/ai.generateSummary

// Request
{
  resumeData: {
    name?: string;
    headline?: string;
    experience?: Array<{
      company?: string;
      position?: string;
      description?: string;
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      area?: string;
    }>;
    skills?: Array<{
      name?: string;
    }>;
  };
  language?: string;
  resumeId?: string;
}

// Response (streaming)
string  // Generated summary
```

---

### Generate Headline

Creates a professional headline.

```typescript
POST /api/orpc/ai.generateHeadline

// Request
{
  resumeData: {
    name?: string;
    currentHeadline?: string;
    experience?: Array<{
      company?: string;
      position?: string;
    }>;
    skills?: string[];
  };
  language?: string;
  resumeId?: string;
}

// Response (streaming)
string  // Generated headline (e.g., "Senior Software Engineer | Cloud Architecture | Team Leadership")
```

---

### Suggest Skills

Recommends skills based on experience.

```typescript
POST /api/orpc/ai.suggestSkills

// Request
{
  resumeData: {
    experience?: Array<{
      company?: string;
      position?: string;
      description?: string;
    }>;
    education?: Array<{
      institution?: string;
      degree?: string;
      area?: string;
    }>;
    existingSkills?: string[];  // Skills to exclude
  };
  language?: string;
  resumeId?: string;
}

// Response
Array<{
  name: string;   // Skill name
  level: number;  // 1-5 proficiency level
}>
```

---

### Fix Grammar

Corrects grammatical errors.

```typescript
POST /api/orpc/ai.fixGrammar

// Request
{
  content: string;     // Text to fix
  language?: string;   // Language of content
  resumeId?: string;
}

// Response (streaming)
string  // Corrected text
```

---

### Analyze Resume

Comprehensive resume analysis with scoring.

```typescript
POST /api/orpc/ai.analyzeResume

// Request
{
  resumeData: {
    picture: { hidden: boolean; url: string; };
    basics: {
      name: string;
      headline: string;
      email: string;
      phone: string;
      location: string;
      website: { url: string; label: string; };
      customFields: Array<{...}>;
    };
    summary: { title: string; hidden: boolean; content: string; };
    sections: {
      profiles: {...};
      experience: {...};
      education: {...};
      skills: {...};
      languages: {...};
      certifications: {...};
      projects: {...};
      awards: {...};
      volunteer: {...};
      interests: {...};
      references: {...};
      publications: {...};
    };
  };
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
    languages: number;
    certifications: number;
    projects: number;
    // ...
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

---

## AI Configuration Endpoints

### Providers

#### List Providers (Admin)

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

#### Create Provider (Admin)

```typescript
POST /api/orpc/aiConfig.providers.create

// Request
{
  provider: "openai" | "anthropic" | "gemini" | "ollama" | "vercel-ai-gateway" | "deepseek" | "groq" | "mistral" | "togetherai" | "openrouter";
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

#### Update Provider (Admin)

```typescript
PUT /api/orpc/aiConfig.providers.update

// Request
{
  id: string;  // Provider UUID
  displayName?: string;
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  isDefault?: boolean;
  maxTokensPerRequest?: number;
  temperature?: string;
  priority?: number;
}

// Response
{ id: string; ...updatedData }
```

#### Delete Provider (Admin)

```typescript
DELETE /api/orpc/aiConfig.providers.delete

// Request
{ id: string }

// Response
{ success: true }
```

#### Set Default Provider (Admin)

```typescript
PUT /api/orpc/aiConfig.providers.setDefault

// Request
{ id: string }

// Response
{ success: true }
```

#### Toggle Provider Enabled (Admin)

```typescript
PUT /api/orpc/aiConfig.providers.toggleEnabled

// Request
{ id: string }

// Response
{ success: true }
```

---

### Quotas

#### List Quota Plans (Admin)

```typescript
GET /api/orpc/aiConfig.quotas.list

// Response
Array<{
  id: string;
  name: string;
  description?: string;
  dailyRequestLimit: number;
  monthlyRequestLimit: number;
  maxTokensPerRequest: number;
  dailyTokenLimit: number;
  monthlyTokenLimit: number;
  allowedFeatures: string[];
  isDefault: boolean;
  isActive: boolean;
}>
```

#### Create Quota Plan (Admin)

```typescript
POST /api/orpc/aiConfig.quotas.create

// Request
{
  name: string;
  description?: string;
  dailyRequestLimit?: number;
  monthlyRequestLimit?: number;
  maxTokensPerRequest?: number;
  dailyTokenLimit?: number;
  monthlyTokenLimit?: number;
  allowedFeatures?: string[];
  isDefault?: boolean;
  isActive?: boolean;
}

// Response
{ id: string; ...quotaData }
```

#### Assign Quota to User (Admin)

```typescript
POST /api/orpc/aiConfig.quotas.assignToUser

// Request
{
  userId: string;
  quotaId: string;
  overrideDailyRequestLimit?: number;
  overrideMonthlyRequestLimit?: number;
  overrideDailyTokenLimit?: number;
  overrideMonthlyTokenLimit?: number;
  notes?: string;
}

// Response
{ id: string; ...assignment }
```

---

### Usage

#### Get My Usage

```typescript
GET /api/orpc/aiConfig.usage.getMyUsage

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
  quotaPlan: { name: string; } | null;
}
```

#### Get My Quota

```typescript
GET /api/orpc/aiConfig.usage.getMyQuota

// Response
{
  allowed: boolean;
  reason?: string;
  daily: { requests: number; limit: number; remaining: number; };
  monthly: { requests: number; limit: number; remaining: number; };
}
```

#### Get Detailed Stats (User)

```typescript
GET /api/orpc/aiConfig.usage.getDetailedStats

// Response
{
  summary: {
    totalRequests: number;
    totalTokens: number;
    successRate: number;
    errorCount: number;
  };
  usageOverTime: Array<{
    date: string;
    requests: number;
    tokens: number;
  }>;
  byFeature: Array<{
    feature: string;
    requests: number;
    tokens: number;
    avgLatency: number;
  }>;
  byStatus: {
    success: number;
    error: number;
    quota_exceeded: number;
  };
  recentErrors: Array<{
    feature: string;
    errorMessage: string;
    createdAt: Date;
  }>;
}
```

---

### Status

#### Check AI Availability (Public)

```typescript
GET /api/orpc/aiConfig.status.check

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

---

## AI Mentor Endpoints

### Templates

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

### User Mentors

#### List My Mentors

```typescript
GET /api/orpc/aiMentor.user.list

// Response
Array<{
  id: string;
  templateId?: string;
  isCustom: boolean;
  customName?: string;
  customPersonality?: string;
  sessionFrequency?: string;
  totalMessages: number;
  lastInteraction?: Date;
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

### Conversations

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

## AI Writer Endpoints

### Generate Bullet Points

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

### Generate Summary

```typescript
POST /api/orpc/aiWriter.generateSummary

// Request
{
  expertise: string;
  tone: ToneType;
  experienceYears: number;
  save?: boolean;
}

// Response
{
  summary: string;
  id?: string;
}
```

### Quantify Achievement

```typescript
POST /api/orpc/aiWriter.quantifyAchievement

// Request
{
  achievement: string;
  save?: boolean;
}

// Response
{
  quantified: string;  // e.g., "Increased sales by 25% over 6 months"
  id?: string;
}
```

### Extract Skills from Job Posting

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

### Generate Cover Letter

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

### Optimize LinkedIn

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

### Check Grammar

```typescript
POST /api/orpc/aiWriter.checkGrammar

// Request
{
  text: string;
}

// Response
Array<{
  text: string;
  suggestion: string;
  type: "grammar" | "clarity" | "style" | "spelling";
  position: number;
}>
```

### Get Statistics

```typescript
GET /api/orpc/aiWriter.getStatistics

// Response
{
  total: number;
  byType: Record<string, number>;
  byTone: Record<string, number>;
  favorites: number;
  recentCount: number;
}
```

---

## AI Analytics Endpoints

### Admin Analytics

#### Get Model Performance (Admin)

```typescript
GET /api/orpc/aiAnalyticsAdmin.getModelPerformance

// Request
{
  startDate?: string;
  endDate?: string;
}

// Response
Array<{
  provider: string;
  model: string;
  totalRequests: number;
  successCount: number;
  errorCount: number;
  successRate: number;
  latency: {
    avg: number;
    min: number;
    max: number;
    p95: number;
  };
  tokens: {
    input: number;
    output: number;
    total: number;
    avgPerRequest: number;
  };
  estimatedCost: {
    input: number;
    output: number;
    total: number;
  };
}>
```

#### Get Cost Analysis (Admin)

```typescript
GET /api/orpc/aiAnalyticsAdmin.getCostAnalysis

// Request
{
  startDate?: string;
  endDate?: string;
  groupBy?: "day" | "week" | "month";
}

// Response
{
  byFeature: Array<{
    feature: string;
    model: string;
    inputTokens: number;
    outputTokens: number;
    estimatedCost: number;
  }>;
  byTime: Array<{
    period: string;
    estimatedCost: number;
  }>;
  byUser: Array<{
    userId: string;
    userName: string;
    estimatedCost: number;
  }>;
  summary: {
    totalEstimatedCost: number;
  };
}
```

#### Get Predictive Insights (Admin)

```typescript
GET /api/orpc/aiAnalyticsAdmin.getPredictiveInsights

// Response
{
  usageTrend: Array<{
    date: string;
    requestCount: number;
    tokenCount: number;
    uniqueUsers: number;
  }>;
  forecast: {
    growthRate: number;
    trend: "increasing" | "decreasing" | "stable";
    predictedUsage: Array<{
      date: string;
      predictedRequests: number;
    }>;
  };
  engagement: {
    activeUsersLast30: number;
    retentionRate: number;
    atRiskUsers: Array<{
      userId: string;
      userName: string;
      lastActivity: Date;
    }>;
  };
}
```

---

## Interview AI Endpoints

### Create Interview Session

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

### Start Session

```typescript
POST /api/orpc/interview.startSession

// Request
{ sessionId: string }

// Response
{
  session: {...};
  firstQuestion: InterviewQuestion;
}
```

### Submit Response

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

### Get Session Analysis

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

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `PRECONDITION_FAILED` | 412 | No AI provider configured |
| `FORBIDDEN` | 403 | Quota exceeded or access denied |
| `BAD_REQUEST` | 400 | Invalid input data |
| `NOT_FOUND` | 404 | Resource not found |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INTERNAL_SERVER_ERROR` | 500 | AI provider error |

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

---

## Rate Limits

| Endpoint Type | Default Limit |
|--------------|---------------|
| Parse PDF/DOCX | 10/hour |
| Content Improvement | 50/hour |
| Analysis | 20/hour |
| Mentor Chat | 100/hour |

Limits can be customized per user through quota plans.

---

## Streaming Responses

Several endpoints return streaming responses using Server-Sent Events:

- `ai.improveContent`
- `ai.generateSummary`
- `ai.generateHeadline`
- `ai.fixGrammar`
- `ai.testConnection`

**Client Usage:**
```typescript
const stream = await orpc.ai.improveContent({
  content: "...",
});

for await (const chunk of stream) {
  console.log(chunk);
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
} from "@/integrations/drizzle/schema";
```
