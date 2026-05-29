# Database Performance Optimization Guide

## Overview

This document outlines the database performance optimizations implemented and recommendations for maintaining optimal query performance.

## Indexes Added

### 1. User Table Indexes
- `user_role_idx` - For admin queries filtering by role
- `user_created_at_desc_idx` - For admin dashboard sorting

### 2. Session Table Indexes
- `session_user_expires_idx` - Composite index for session validation

### 3. Resume Table Indexes
- `resume_is_public_slug_idx` - Partial index for public resume lookups
- `resume_name_idx` - For resume name search
- `resume_tags_gin_idx` - GIN index for tag array searching

### 4. AI Usage Log Indexes
- `ai_usage_log_user_date_status_idx` - For user analytics queries
- `ai_usage_log_provider_created_idx` - For provider analytics
- `ai_usage_log_created_brin_idx` - BRIN index for time-series data

### 5. Job Application Indexes
- `job_application_user_priority_idx` - For dashboard queries
- `job_application_user_deadline_idx` - For deadline queries
- `job_application_salary_range_idx` - For salary range queries

### 6. Interview Session Indexes
- `interview_session_user_status_date_idx` - For active sessions
- `interview_session_field_idx` - For field-based filtering

### 7. Career Goal Indexes
- `career_goal_user_status_priority_idx` - For active goals by priority
- `career_goal_user_progress_idx` - For progress tracking

### 8. Networking Contact Indexes
- `networking_contact_follow_up_idx` - For follow-up scheduling
- `networking_contact_favorites_idx` - Partial index for favorites

### 9. Certification Indexes
- `certification_expiry_alert_idx` - For expiring certifications

### 10. Achievement System Indexes
- `user_gamification_xp_leaderboard_idx` - For leaderboard queries
- `user_achievement_new_idx` - For new achievement notifications
- `challenge_active_idx` - For active challenges

### 11. Notification Indexes
- `notification_unread_idx` - For unread notifications

### 12. User Activity Indexes
- `user_activity_feed_idx` - For activity feed with filtering
- `user_activity_type_date_idx` - For activity type analysis
- `user_activity_created_brin_idx` - BRIN index for time-series

---

## N+1 Query Pattern Recommendations

### Problem Areas Identified

1. **Admin Resume List** (`services/admin.ts`)
   - Currently joins user and statistics per resume
   - Consider: Batch loading statistics in a single query

2. **Leaderboard** (`services/achievements.ts`)
   - Fetches achievements per user in a loop
   - Consider: Use a single JOIN or subquery

3. **Interview Sessions with Evaluations**
   - Loading evaluations separately per session
   - Consider: Include in initial query with JSON aggregation

### Recommended Patterns

```typescript
// AVOID: N+1 Query Pattern
const users = await db.select().from(user);
for (const u of users) {
  const resumes = await db.select().from(resume).where(eq(resume.userId, u.id));
}

// PREFER: Single Query with JOIN
const results = await db
  .select()
  .from(user)
  .leftJoin(resume, eq(user.id, resume.userId));

// PREFER: Batch Loading
const userIds = users.map(u => u.id);
const allResumes = await db
  .select()
  .from(resume)
  .where(inArray(resume.userId, userIds));
const resumesByUser = groupBy(allResumes, 'userId');
```

---

## Query Optimization Guidelines

### 1. Use Appropriate Index Types

| Data Type | Recommended Index |
|-----------|-------------------|
| Timestamps (append-only) | BRIN |
| Text patterns | btree with text_pattern_ops |
| Arrays/JSONB | GIN |
| Standard columns | B-tree (default) |
| Enum values | B-tree |

### 2. Partial Indexes for Filtered Queries

Use partial indexes when queries frequently filter for specific values:

```sql
-- When most queries filter for active records
CREATE INDEX ON table_name (column) WHERE is_active = true;

-- When most queries filter for non-null values
CREATE INDEX ON table_name (column) WHERE column IS NOT NULL;
```

### 3. Composite Index Column Order

Order columns in composite indexes by:
1. Equality conditions first (`=`)
2. Range conditions second (`>`, `<`, `BETWEEN`)
3. ORDER BY columns last

Example:
```sql
-- For query: WHERE user_id = ? AND status = ? ORDER BY created_at DESC
CREATE INDEX ON table (user_id, status, created_at DESC);
```

### 4. JSONB Query Optimization

For JSONB columns queried frequently:
```sql
-- GIN index for containment queries (@>)
CREATE INDEX ON table USING gin (data);

-- Specialized index for specific paths
CREATE INDEX ON table ((data->>'field'));
```

---

## Monitoring Recommendations

### 1. Identify Slow Queries

Enable slow query logging in PostgreSQL:
```sql
ALTER SYSTEM SET log_min_duration_statement = '100'; -- Log queries > 100ms
SELECT pg_reload_conf();
```

### 2. Check Index Usage

```sql
-- Find unused indexes
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- Find missing indexes (tables with sequential scans)
SELECT relname, seq_scan, seq_tup_read, idx_scan, idx_tup_fetch
FROM pg_stat_user_tables
WHERE seq_scan > idx_scan
ORDER BY seq_tup_read DESC;
```

### 3. Table Statistics

```sql
-- Check table sizes
SELECT relname, pg_size_pretty(pg_relation_size(relid))
FROM pg_stat_user_tables
ORDER BY pg_relation_size(relid) DESC;

-- Run ANALYZE regularly
ANALYZE verbose;
```

---

## Maintenance Tasks

### Weekly
- Review slow query log
- Check for bloated tables/indexes

### Monthly
- Run `ANALYZE` on all tables
- Review unused indexes for removal

### Quarterly
- Evaluate index strategy based on query patterns
- Consider REINDEX for heavily updated tables

---

## Schema-Level Optimizations Already in Place

The schema already includes good indexing patterns:
1. All foreign keys have indexes
2. userId columns are indexed on all user-related tables
3. Composite indexes for (userId, createdAt DESC) on most tables
4. Unique constraints where appropriate

The migration adds complementary indexes for:
1. Partial indexes for common filter patterns
2. GIN indexes for array/JSONB queries
3. BRIN indexes for time-series data
4. Additional composite indexes for complex queries
