# Security Audit Report

**Date:** 2026-02-10
**Auditor:** SecureSentinel Agent
**Project:** IMTA Resume

---

## Executive Summary

This security audit examined the IMTA Resume application for common web vulnerabilities including XSS, CSRF, SQL injection, rate limiting coverage, authentication middleware, and sensitive data exposure. Overall, the application demonstrates **strong security practices** with proper sanitization, rate limiting infrastructure, and authentication controls.

### Risk Summary

| Severity | Count | Status |
|----------|-------|--------|
| Critical | 0 | - |
| High | 0 | - |
| Medium | 1 | Documented |
| Low | 2 | Documented |
| Informational | 3 | Documented |

---

## Detailed Findings

### 1. XSS (Cross-Site Scripting) Protection

**Status: PASS**

The application uses DOMPurify for HTML sanitization with a well-configured setup:

**Location:** `src/utils/sanitize.ts`

**Strengths:**
- Strict allowlist of HTML tags (no script, iframe, object, embed)
- Style attribute is NOT allowed (prevents CSS-based attacks)
- Only http/https/mailto protocols allowed in URLs
- Data URIs are blocked
- All links automatically get `rel="noopener noreferrer"`
- CSS sanitization removes JavaScript expressions, behavior, -moz-binding, @import

**dangerouslySetInnerHTML Usage (4 instances - all properly secured):**

1. **`business-card/index.tsx`** - Uses `sanitizeHtml()` function
2. **`rich-input.tsx`** - Uses DOMPurify sanitized content
3. **`resume/preview.tsx`** - Uses `sanitizeCss()` for custom CSS
4. **`tools/cover-letter.tsx`** - Uses custom HTML escaping (properly escapes &, <, >, ", ')

**No instances of `eval()` or `Function()` constructor found.**

---

### 2. CSRF Protection

**Status: PASS (Built-in)**

The application uses Better Auth which includes built-in CSRF protection:
- Session-based authentication with httpOnly cookies
- Origin/Referer header validation
- SameSite cookie attribute

All mutations go through ORPC which uses POST requests with proper authentication headers.

---

### 3. Rate Limiting Coverage

**Status: PASS**

Comprehensive rate limiting is implemented:

**Location:** `src/utils/rate-limit.ts`, `src/integrations/orpc/context.ts`

| Limiter | Requests | Window | Usage |
|---------|----------|--------|-------|
| authRateLimiter | 5 | 1 min | Login, signup, 2FA |
| passwordResetRateLimiter | 3 | 15 min | Forgot/reset password |
| emailVerificationRateLimiter | 5 | 15 min | Email verification |
| aiRateLimiter | 20 | 1 min | All AI endpoints |
| uploadRateLimiter | 10 | 1 min | File uploads |
| apiRateLimiter | 100 | 1 min | General API |

**Protected Endpoints:**
- Auth endpoints (`/api/auth/*`) - Rate limited at route level
- AI endpoints - Use `aiRateLimitedProcedure`
- Upload endpoints - Use `uploadRateLimitedProcedure`
- Better Auth API keys have built-in rate limiting (configured in auth config)

---

### 4. SQL Injection Protection

**Status: PASS**

**Findings:**
- Application uses Drizzle ORM exclusively for database operations
- Only 1 instance of raw SQL found: `src/routes/api/health.ts` line 97
  - Usage: `db.execute(sql\`SELECT 1\`)` - This is a static query with no user input, used for health checks only
- No string concatenation in SQL queries
- All user inputs are validated with Zod schemas before reaching the database layer

---

### 5. Authentication Middleware on Protected Routes

**Status: PASS**

The application uses a well-designed procedure chain:

```
publicProcedure -> protectedProcedure -> adminProcedure
                                      -> aiRateLimitedProcedure
                                      -> uploadRateLimitedProcedure
```

**Protection Levels:**
- `publicProcedure` - No auth required
- `protectedProcedure` - Requires valid session (throws UNAUTHORIZED)
- `adminProcedure` - Requires admin role (throws FORBIDDEN)
- `serverOnlyProcedure` - Only allows server-side calls

**All sensitive operations correctly use protected procedures:**
- Resume CRUD - protectedProcedure
- AI operations - aiRateLimitedProcedure (extends protected)
- File uploads - uploadRateLimitedProcedure (extends protected)
- Admin config - adminProcedure
- User settings - protectedProcedure

---

### 6. Sensitive Data Exposure

**Status: MEDIUM RISK - API Keys in Internal Responses**

**Finding:** The `ai-config.ts` service has inconsistent API key handling:

**Good:** `list()` and `getById()` methods explicitly SELECT only non-sensitive fields (excluding apiKey)

**Concern:** `getDefault()`, `getByProvider()`, and `getActiveProvider()` return full database records including `apiKey`

**Current Mitigations:**
- These methods are only used internally on the server
- The router endpoints that expose data to clients (`providersRouter.list`, `providersRouter.getById`) use the safe methods
- The `statusRouter.check` endpoint (public) only returns displayName, provider, and model

**Recommendation:** Add explicit field selection to `getDefault()` and `getByProvider()` for defense-in-depth, or create separate internal vs. external response types.

---

### 7. Additional Security Measures Found

**Positive Findings:**

1. **Password Strength Validation** (`src/utils/password.ts`)
   - Minimum length enforcement
   - Character diversity requirements

2. **Secure File Uploads** (`src/integrations/orpc/services/storage.ts`)
   - 10MB file size limit
   - Image processing/conversion
   - User-scoped storage paths

3. **Printer Token Security** (`src/utils/printer-token.ts`)
   - Time-limited tokens for PDF generation
   - Resume ID validation

4. **Environment Variable Security**
   - .env files in .gitignore
   - Zod schema validation for env vars

---

## Low Risk Items

### L1: In-Memory Rate Limiting

**Location:** `src/utils/rate-limit.ts`

The rate limiter uses in-memory storage which doesn't persist across server restarts and won't work with multiple server instances.

**Impact:** Low - Only affects scaled deployments
**Recommendation:** Consider Redis-backed rate limiting for production multi-instance deployments

### L2: Debug Flag for Server-Only Check

**Location:** `src/integrations/orpc/context.ts` line 91

```typescript
const isServerSideCall = env.FLAG_DEBUG_PRINTER || headers.get("x-server-side-call") === "true";
```

The `FLAG_DEBUG_PRINTER` bypasses server-only checks.

**Impact:** Low - Only affects debug/development
**Recommendation:** Ensure this flag is never enabled in production

---

## Informational Items

### I1: No CSP Header Configuration Found

Consider implementing Content-Security-Policy headers for additional XSS protection.

### I2: API Keys in Database

AI provider API keys are stored in the database. While encrypted at rest (via PostgreSQL), consider using a secrets manager for production.

### I3: Rate Limit Headers Exposed

Rate limit status is returned in response headers (X-RateLimit-*). This is standard practice but provides information to attackers about limits.

---

## Recommendations

### Immediate (Before Production)

1. Ensure `FLAG_DEBUG_PRINTER` is `false` in production environment
2. Verify .env file is not committed to version control

### Short-term

1. Add explicit field selection to `getDefault()` and `getByProvider()` in ai-config.ts
2. Implement Content-Security-Policy headers
3. Consider Redis-backed rate limiting for multi-instance deployments

### Long-term

1. Implement security headers (X-Frame-Options, X-Content-Type-Options, etc.) via middleware
2. Set up automated security scanning in CI/CD pipeline
3. Consider implementing API versioning for breaking security changes

---

## Verification Commands

```bash
# Check for eval usage
grep -r "eval(" src/ --include="*.ts" --include="*.tsx"

# Check for dangerouslySetInnerHTML
grep -r "dangerouslySetInnerHTML" src/ --include="*.tsx"

# Check for raw SQL
grep -r "sql.raw\|execute(" src/ --include="*.ts"

# Verify DOMPurify import locations
grep -r "DOMPurify" src/ --include="*.ts" --include="*.tsx"
```

---

## Conclusion

The IMTA Resume application demonstrates **strong security practices** for a modern web application. The use of:
- DOMPurify for HTML sanitization
- Drizzle ORM (no raw SQL with user input)
- Better Auth with built-in CSRF protection
- Comprehensive rate limiting
- Proper authentication middleware chain
- Zod schema validation for all inputs

All represent industry best practices. The identified medium-risk item (internal API key handling) is mitigated by the current architecture but should be addressed for defense-in-depth.

**Overall Security Rating: B+ (Good)**

---

*Report generated by SecureSentinel Security Audit Agent*
