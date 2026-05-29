# AI Enhancement System Architecture

This document describes the comprehensive AI-powered features integrated into IMTA Resume, including resume parsing, content improvement, interview preparation, and career mentorship.

## Table of Contents

1. [Overview](#overview)
2. [System Architecture](#system-architecture)
3. [AI Provider Management](#ai-provider-management)
4. [Core AI Services](#core-ai-services)
5. [AI Mentor System](#ai-mentor-system)
6. [AI Writer Module](#ai-writer-module)
7. [Interview AI](#interview-ai)
8. [Analytics and Metrics](#analytics-and-metrics)
9. [Quota Management](#quota-management)
10. [Security Considerations](#security-considerations)

---

## Overview

The AI enhancement system provides intelligent assistance across multiple domains:

- **Resume Parsing**: Extract structured data from PDF and DOCX files
- **Content Improvement**: Enhance resume bullet points, summaries, and headlines
- **Grammar and Style**: Fix grammatical errors and improve writing quality
- **Skill Suggestions**: AI-powered skill recommendations based on experience
- **Resume Analysis**: Comprehensive scoring and improvement suggestions
- **Interview Preparation**: AI-generated questions and practice sessions
- **Career Mentorship**: Personalized AI mentors for career guidance
- **AI Writing Assistant**: Generate cover letters, LinkedIn content, and more

---

## System Architecture

### High-Level Architecture

```
+-------------------+     +------------------+     +------------------+
|   Client/Browser  |<--->|   ORPC Router    |<--->|   AI Services    |
+-------------------+     +------------------+     +------------------+
                                  |                        |
                                  v                        v
                          +------------------+     +------------------+
                          |   Database       |     |   AI Providers   |
                          |   (PostgreSQL)   |     |   (OpenAI, etc.) |
                          +------------------+     +------------------+
```

### Key Components

| Component | Location | Purpose |
|-----------|----------|---------|
| AI Router | `src/integrations/orpc/router/ai.ts` | Core AI endpoints for resume features |
| AI Config Router | `src/integrations/orpc/router/ai-config.ts` | Admin provider management |
| AI Config Service | `src/integrations/orpc/services/ai-config.ts` | Provider CRUD operations |
| AI Quota Service | `src/integrations/orpc/services/ai-quota.ts` | Usage tracking and quotas |
| AI Mentor Router | `src/integrations/orpc/router/ai-mentor.ts` | Mentorship system |
| AI Writer Router | `src/integrations/orpc/router/ai-writer.ts` | Content generation |
| AI Analytics | `src/integrations/orpc/router/ai-analytics.ts` | Usage analytics |

### Technology Stack

- **AI SDK**: Vercel AI SDK for unified provider interface
- **Supported Providers**:
  - OpenAI (GPT-4, GPT-3.5)
  - Anthropic (Claude)
  - Google Gemini
  - DeepSeek
  - Groq
  - Mistral
  - Together AI
  - OpenRouter
  - Ollama (self-hosted)
  - Vercel AI Gateway

---

## AI Provider Management

### Server-Side Key Management

API keys are stored server-side and managed by administrators. Users never see or handle API keys directly.

### Provider Configuration

```typescript
// Provider configuration schema
{
  id: string;           // UUID
  provider: AIProvider; // openai, anthropic, gemini, etc.
  displayName: string;  // Human-readable name
  apiKey: string;       // Encrypted API key
  model: string;        // Model identifier (e.g., "gpt-4-turbo")
  baseUrl?: string;     // Custom base URL for self-hosted
  isDefault: boolean;   // Is this the default provider?
  isEnabled: boolean;   // Is this provider active?
  maxTokensPerRequest: number;
  temperature: number;
  priority: number;     // For load balancing
}
```

### Provider Selection Flow

1. System calls `getServerModel()` to retrieve active provider
2. If no provider configured, throws `PRECONDITION_FAILED` error
3. Provider config includes API key, model, and settings
4. Model instance created using Vercel AI SDK

```typescript
// Model initialization example
async function getServerModel() {
  const config = await aiConfigService.getActiveProvider();
  return {
    model: getModel({
      provider: config.provider,
      model: config.model,
      apiKey: config.apiKey,
      baseURL: config.baseUrl || "",
    }),
    config,
  };
}
```

---

## Core AI Services

### Resume Parsing

**Endpoints**: `ai.parsePdf`, `ai.parseDocx`

Extracts structured resume data from uploaded documents using multimodal AI capabilities.

**Process**:
1. User uploads PDF/DOCX file (base64 encoded)
2. AI analyzes document with specialized prompts
3. Returns structured `ResumeData` object
4. Data validated against Zod schema

### Content Improvement

**Endpoint**: `ai.improveContent`

Enhances resume bullet points and descriptions with quantifiable achievements.

**Features**:
- Professional tone adjustment
- Action verb optimization
- Metrics and achievement highlighting
- Multi-language support (fr, en, ar)

### Summary Generation

**Endpoint**: `ai.generateSummary`

Creates professional summaries based on resume data.

**Input**:
- Experience history
- Education background
- Skills list
- Target language

### Headline Generation

**Endpoint**: `ai.generateHeadline`

Generates impactful professional headlines.

### Skill Suggestions

**Endpoint**: `ai.suggestSkills`

AI-powered skill recommendations based on:
- Work experience descriptions
- Education background
- Existing skills (to avoid duplicates)

**Output**: Array of `{ name: string, level: 1-5 }`

### Grammar Fix

**Endpoint**: `ai.fixGrammar`

Corrects grammatical errors while preserving meaning and tone.

### Resume Analysis

**Endpoint**: `ai.analyzeResume`

Comprehensive resume scoring and feedback.

**Analysis Areas**:
- Content completeness
- Professional presentation
- ATS compatibility
- Industry alignment
- Improvement suggestions

**Output Schema**:
```typescript
{
  overallScore: number;          // 0-100
  sectionScores: {
    basics: number;
    experience: number;
    education: number;
    skills: number;
    // ...
  };
  strengths: string[];
  improvements: string[];
  suggestions: string[];
}
```

---

## AI Mentor System

### Overview

Personalized AI mentors provide career guidance through conversational interfaces.

### Mentor Templates

Pre-built mentor personas with specialized expertise:

| Mentor | Specialization | Personality |
|--------|---------------|-------------|
| Dr. Amina | Healthcare | Supportive |
| M. Hassan | Industrial | Analytical |
| Fatima | HSE | Balanced |
| Youssef | Interview Prep | Challenging |
| Layla | Career Strategy | Motivational |

### Mentor Components

**Templates Router** (`ai-mentor.templates`):
- List available templates
- Get template by ID
- Filter by specialization

**User Mentors Router** (`ai-mentor.user`):
- Select template as personal mentor
- Create custom mentor
- Configure preferences

**Conversations Router** (`ai-mentor.conversations`):
- Start new conversations
- Send messages and receive AI responses
- Archive/delete conversations

**Sessions Router** (`ai-mentor.sessions`):
- Schedule coaching sessions
- Track session outcomes
- Rate and provide feedback

### Conversation Flow

```typescript
// Sending a message to mentor
const result = await orpc.aiMentor.conversations.sendMessage({
  conversationId: "...",
  content: "How should I prepare for a nursing interview?"
});

// Response includes AI-generated reply
{
  message: {
    role: "assistant",
    content: "For a nursing interview, I recommend...",
    timestamp: "2024-02-10T12:00:00Z",
    tokens: 150
  },
  conversation: { ... }
}
```

---

## AI Writer Module

### Content Types

| Type | Description |
|------|-------------|
| `bullet_point` | Experience bullet points |
| `summary` | Professional summaries |
| `achievement` | Quantified achievements |
| `cover_letter` | Full cover letters |
| `linkedin_summary` | LinkedIn profile content |
| `skill_extraction` | Extract skills from job postings |

### Generation Endpoints

**Generate Bullet Points** (`ai-writer.generateBulletPoints`):
```typescript
{
  description: string;
  tone: "professional" | "confident" | "friendly" | "executive" | "creative";
  save?: boolean;
}
```

**Generate Summary** (`ai-writer.generateSummary`):
```typescript
{
  expertise: string;
  tone: ToneType;
  experienceYears: number;
  save?: boolean;
}
```

**Quantify Achievement** (`ai-writer.quantifyAchievement`):
Transforms vague achievements into metrics-driven statements.

**Extract Skills** (`ai-writer.extractSkills`):
Analyzes job postings to identify required skills.

**Generate Cover Letter** (`ai-writer.generateCoverLetter`):
Creates tailored cover letters for specific positions.

**Optimize LinkedIn** (`ai-writer.optimizeLinkedIn`):
Enhances LinkedIn summaries with keywords.

**Check Grammar** (`ai-writer.checkGrammar`):
Detailed grammar analysis with suggestions.

---

## Interview AI

### Interview Session Management

**Table**: `interview_session`

Tracks practice interview sessions with:
- Question sets
- User responses
- AI evaluations
- Scores and feedback

### Interview Types

- Behavioral
- Technical
- Situational
- Motivational
- General

### Field Specializations

- Healthcare
- Industrial
- HSE (Health, Safety, Environment)
- General

### IMTA Programs

Specialized interview preparation for IMTA training programs:
- Sage Femme (Midwife)
- Infirmier Polyvalent (General Nurse)
- Aide Soignant (Healthcare Assistant)
- And more...

### Voice Interview

**Router**: `voice-interview`

Real-time voice-based interview practice with:
- Speech-to-text transcription
- AI question delivery
- Response evaluation
- Feedback on communication skills

---

## Analytics and Metrics

### AI Analytics Router

**Admin Endpoints** (`ai-analytics/admin/*`):
- Model performance metrics
- Feature usage matrix
- Cost analysis (by feature, user, time)
- Quality scores
- Student progress
- Predictive insights

**Student Endpoints** (`ai-analytics/me/*`):
- Personal usage statistics
- Feature usage
- Cost analysis
- Quality scores
- Progress metrics

### Metrics Tracked

| Metric | Description |
|--------|-------------|
| `totalRequests` | Number of AI API calls |
| `inputTokens` | Tokens sent to AI |
| `outputTokens` | Tokens received from AI |
| `totalTokens` | Combined token usage |
| `successRate` | Percentage of successful calls |
| `avgLatency` | Average response time (ms) |
| `estimatedCost` | Calculated cost based on token usage |

### Cost Analysis

```typescript
{
  byFeature: [{
    feature: "improve_content",
    model: "gpt-4",
    inputTokens: 50000,
    outputTokens: 75000,
    estimatedCost: 2.50
  }],
  byTime: [{
    period: "2024-02",
    totalTokens: 1000000,
    estimatedCost: 25.00
  }],
  summary: {
    totalEstimatedCost: 250.00
  }
}
```

---

## Quota Management

### Quota Plans

Admin-defined quota plans with:

```typescript
{
  name: string;
  description?: string;
  dailyRequestLimit: number;    // e.g., 50
  monthlyRequestLimit: number;  // e.g., 500
  maxTokensPerRequest: number;  // e.g., 4096
  dailyTokenLimit: number;      // e.g., 100000
  monthlyTokenLimit: number;    // e.g., 1000000
  allowedFeatures: string[];    // Feature whitelist
  isDefault: boolean;
  isActive: boolean;
}
```

### User Quota Assignment

Users can be assigned to specific quota plans with optional overrides:

```typescript
{
  userId: string;
  quotaId: string;
  overrideDailyRequestLimit?: number;
  overrideMonthlyRequestLimit?: number;
  notes?: string;
}
```

### Quota Check Flow

1. Before each AI call, `checkQuota()` is invoked
2. If no quota plans exist, unlimited access is granted
3. Otherwise, usage is compared against limits
4. `quota_exceeded` status logged if limit reached

### Global Settings

Organization-wide controls:

```typescript
{
  maxDailyRequests: 10000;
  maxMonthlyRequests: 100000;
  maxDailyTokens: 10000000;
  maxMonthlyTokens: 100000000;
  alertThresholdPercent: 80;  // Alert at 80% usage
  suspendOnExceed: false;     // Auto-suspend on exceed
  defaultLanguage: "fr";
  allowedLanguages: ["fr", "ar", "en"];
}
```

---

## Security Considerations

### API Key Protection

- Keys stored server-side only
- Never exposed to client
- Encrypted at rest in database
- Access restricted to admin role

### Rate Limiting

- Per-user quotas enforced
- Global rate limits configurable
- IP-based rate limiting on endpoints

### Input Validation

- All inputs validated with Zod schemas
- File size limits enforced
- Content sanitization for prompts

### Audit Logging

All AI usage is logged with:
- User ID
- Feature used
- Provider and model
- Token consumption
- Success/error status
- Duration

### Access Control

| Role | Permissions |
|------|-------------|
| User | Use AI features, view own usage |
| Admin | Manage providers, quotas, view all analytics |

---

## Configuration

### Required Environment Variables

```bash
# No environment variables required for AI
# All configuration is done through admin UI
```

### Admin Setup Steps

1. Navigate to `/dashboard/admin/ai-providers`
2. Add at least one AI provider
3. Set API key and model
4. Enable and set as default
5. (Optional) Create quota plans at `/dashboard/admin/ai-quotas`

### Testing Connection

```typescript
// Test AI connection
await orpc.ai.testConnection();
// Returns streaming "1" if successful
```

---

## Error Handling

### Common Errors

| Error Code | Description | Resolution |
|------------|-------------|------------|
| `PRECONDITION_FAILED` | No AI provider configured | Admin must add provider |
| `FORBIDDEN` | Quota exceeded | Wait for reset or upgrade quota |
| `BAD_REQUEST` | Invalid input | Check input schema |
| `INTERNAL_SERVER_ERROR` | AI provider error | Check provider status |

### Error Response Format

```typescript
{
  code: "FORBIDDEN",
  message: "AI usage quota exceeded",
  details?: {
    dailyRemaining: 0,
    monthlyRemaining: 50,
    resetTime: "2024-02-11T00:00:00Z"
  }
}
```

---

## Prompts

System prompts are stored in `src/integrations/ai/prompts/`:

| File | Purpose |
|------|---------|
| `docx-parser-system.md` | DOCX resume parsing |
| `pdf-parser-system.md` | PDF resume parsing |
| `fix-grammar-system.md` | Grammar correction |
| `generate-headline-system.md` | Headline generation |
| `generate-summary-system.md` | Summary generation |
| `improve-content-system.md` | Content improvement |
| `resume-analysis-system.md` | Resume scoring |
| `suggest-skills-system.md` | Skill suggestions |
| `interview-chatbot-system.md` | Interview practice |
| `voice-interview-feedback-system.md` | Voice interview feedback |

---

## Future Enhancements

Planned improvements include:

1. **Multi-model Support**: Use different models for different tasks
2. **Fine-tuned Models**: Custom models for Moroccan job market
3. **Caching Layer**: Cache common AI responses
4. **Streaming Improvements**: Better streaming UI feedback
5. **Offline Mode**: Local AI with Ollama
6. **Multi-language Expansion**: Additional dialect support
