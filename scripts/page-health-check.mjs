/**
 * Dashboard Page Health Check Script
 * Tests every dashboard page for HTTP errors, empty content, and error indicators.
 *
 * Usage: node scripts/page-health-check.mjs
 */

const BASE_URL = 'http://localhost:3040';

const STUDENT_CREDS = { email: 'student2@test.com', password: 'TestAccount123!' };
const ADMIN_CREDS = { email: 'admin@test.com', password: 'TestAccount123!' };

// All pages to test, grouped by auth requirement
const PUBLIC_PAGES = [
  '/',
  '/auth/login',
  '/auth/register',
];

const USER_PAGES = [
  // Core
  '/dashboard',
  '/dashboard/resumes',
  '/dashboard/profile',

  // Career
  '/dashboard/career',
  '/dashboard/career/assessment',
  '/dashboard/career/quiz',
  '/dashboard/career/skills',
  '/dashboard/career/roadmap',
  '/dashboard/career/coaching',
  '/dashboard/career/insights',
  '/dashboard/career/certifications',
  '/dashboard/career/branding',
  '/dashboard/career/review-prep',
  '/dashboard/career/transition',

  // Interview
  '/dashboard/interview',
  '/dashboard/interview/practice',
  '/dashboard/interview/chatbot',
  '/dashboard/interview/mock-ai',
  '/dashboard/interview/tips',
  '/dashboard/interview/questions',
  '/dashboard/interview/checklist',
  '/dashboard/interview/scheduler',
  '/dashboard/interview/question-bank',
  '/dashboard/interview/notes',

  // Jobs
  '/dashboard/jobs',
  '/dashboard/jobs/applications',
  '/dashboard/jobs/employers',
  '/dashboard/jobs/recommendations',
  '/dashboard/jobs/trends',
  '/dashboard/jobs/insights',
  '/dashboard/jobs/research',
  '/dashboard/jobs/culture-match',
  '/dashboard/jobs/aggregator',
  '/dashboard/jobs/alerts',
  '/dashboard/jobs/deadlines',

  // Networking
  '/dashboard/networking',
  '/dashboard/networking/events',
  '/dashboard/networking/mentors',
  '/dashboard/networking/contacts',

  // Analytics
  '/dashboard/analytics',
  '/dashboard/analytics/activity',
  '/dashboard/analytics/progress',
  '/dashboard/analytics/reports',
  '/dashboard/analytics/ai-usage',

  // Tools
  '/dashboard/tools/cover-letter',
  '/dashboard/tools/ai-writer',
  '/dashboard/tools/keywords',
  '/dashboard/tools/salary-calculator',
  '/dashboard/tools/elevator-pitch',
  '/dashboard/tools/negotiation',
  '/dashboard/tools/thank-you',

  // Settings
  '/dashboard/settings/profile',
  '/dashboard/settings/preferences',
  '/dashboard/settings/authentication',
  '/dashboard/settings/api-keys',
  '/dashboard/settings/ai',
  '/dashboard/settings/data',
  '/dashboard/settings/danger-zone',

  // Other
  '/dashboard/help',
  '/dashboard/templates',
  '/dashboard/resources',
];

const ADMIN_PAGES = [
  '/dashboard/admin',
  '/dashboard/admin/users',
  '/dashboard/admin/ai-providers',
  '/dashboard/admin/ai-quotas',
  '/dashboard/admin/reference-data',
  '/dashboard/admin/analytics',
];

// Error patterns to detect in the HTML response
const ERROR_PATTERNS = [
  /class="[^"]*error[^"]*"/i,
  /Something went wrong/i,
  /Internal Server Error/i,
  /500\s*Error/i,
  /Cannot read propert/i,
  /is not defined/i,
  /is not a function/i,
  /Unexpected token/i,
  /NEXT_NOT_FOUND/i,
  /Module not found/i,
  /TypeError:/i,
  /ReferenceError:/i,
  /SyntaxError:/i,
  /Unhandled Runtime Error/i,
  /Application error/i,
  /This page could not be found/i,
  /404/,
];

// Patterns that indicate a redirect to login (auth failure)
const AUTH_REDIRECT_PATTERNS = [
  /\/auth\/login/i,
  /sign.in/i,
];

// Patterns indicating actual page content was rendered
const CONTENT_INDICATORS = [
  /<div/i,
  /data-/i,
  /class="/i,
];

async function login(creds) {
  try {
    const resp = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': BASE_URL,
      },
      body: JSON.stringify(creds),
      redirect: 'manual',
    });

    const cookies = resp.headers.getSetCookie?.() || [];
    const sessionCookie = cookies.find(c => c.includes('better-auth.session_token'));

    if (!sessionCookie) {
      // Try reading from combined set-cookie
      const allCookies = resp.headers.raw?.()?.['set-cookie'] || [];
      const found = allCookies.find(c => c.includes('better-auth.session_token'));
      if (found) {
        const match = found.match(/better-auth\.session_token=([^;]+)/);
        if (match) return `better-auth.session_token=${match[1]}`;
      }

      // Fallback: try to parse response body for token
      const body = await resp.text();
      console.log(`  Login response status: ${resp.status} for ${creds.email}`);
      if (resp.status >= 400) {
        console.log(`  Login failed: ${body.substring(0, 200)}`);
        return null;
      }
      return null;
    }

    const match = sessionCookie.match(/better-auth\.session_token=([^;]+)/);
    if (match) return `better-auth.session_token=${match[1]}`;
    return null;
  } catch (err) {
    console.error(`  Login error for ${creds.email}: ${err.message}`);
    return null;
  }
}

async function testPage(url, cookie, timeoutMs = 15000) {
  const fullUrl = `${BASE_URL}${url}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers = {};
    if (cookie) headers['Cookie'] = cookie;

    const resp = await fetch(fullUrl, {
      headers,
      redirect: 'manual',
      signal: controller.signal,
    });

    clearTimeout(timer);
    const status = resp.status;
    const body = await resp.text();
    const bodyLen = body.length;

    // Check for redirect
    if (status >= 300 && status < 400) {
      const location = resp.headers.get('location') || '';
      if (AUTH_REDIRECT_PATTERNS.some(p => p.test(location))) {
        return { url, status: 'FAIL', code: status, reason: `Redirected to login: ${location}` };
      }
      return { url, status: 'WARN', code: status, reason: `Redirect to: ${location}` };
    }

    // Check HTTP error codes
    if (status >= 500) {
      const errorSnippet = body.substring(0, 300).replace(/\n/g, ' ').trim();
      return { url, status: 'FAIL', code: status, reason: `Server error: ${errorSnippet}` };
    }

    if (status >= 400) {
      const errorSnippet = body.substring(0, 300).replace(/\n/g, ' ').trim();
      return { url, status: 'FAIL', code: status, reason: `Client error: ${errorSnippet}` };
    }

    // Check for empty content
    if (bodyLen < 100) {
      return { url, status: 'WARN', code: status, reason: `Very short response (${bodyLen} bytes)` };
    }

    // Check for error patterns in body
    const foundErrors = [];
    for (const pattern of ERROR_PATTERNS) {
      const match = body.match(pattern);
      if (match) {
        // Skip false positives: class="error" in CSS, error in variable names, 404 in content
        const context = body.substring(Math.max(0, body.indexOf(match[0]) - 50), body.indexOf(match[0]) + match[0].length + 50);
        // Skip if it's just a CSS class or harmless reference
        if (/error-boundary|errorComponent|errorElement|error\.tsx/.test(context)) continue;
        foundErrors.push(match[0]);
      }
    }

    // Check for SSR-rendered error components (more specific)
    const hasErrorBoundary = /data-error|ErrorBoundary|error-page|"error":true/i.test(body);
    const hasStackTrace = /at\s+\w+\s+\(/.test(body) && /\.tsx?:\d+:\d+/.test(body);

    if (hasStackTrace) {
      const stackMatch = body.match(/at\s+\w+\s+\([^)]+\)/);
      return { url, status: 'FAIL', code: status, reason: `Stack trace in response: ${stackMatch?.[0] || 'unknown'}` };
    }

    // Check for auth redirect in SSR HTML (sometimes returns 200 with redirect script)
    if (/window\.location.*auth\/login|redirect.*auth\/login/i.test(body)) {
      return { url, status: 'FAIL', code: status, reason: 'Client-side redirect to login (auth issue)' };
    }

    // Check content has actual rendered HTML
    const hasContent = CONTENT_INDICATORS.some(p => p.test(body));
    if (!hasContent) {
      return { url, status: 'WARN', code: status, reason: `Response may lack rendered content (${bodyLen} bytes)` };
    }

    // Check for __DEHYDRATED error data in SSR
    const dehydratedErrorMatch = body.match(/"isError":true[^}]*"error":\{[^}]*"message":"([^"]+)"/);
    if (dehydratedErrorMatch) {
      return { url, status: 'FAIL', code: status, reason: `SSR dehydrated error: ${dehydratedErrorMatch[1]}` };
    }

    // More targeted: check for TanStack Router error serialization
    const routerErrorMatch = body.match(/"__isServerError":true[^}]*"message":"([^"]+)"/);
    if (routerErrorMatch) {
      return { url, status: 'FAIL', code: status, reason: `Router server error: ${routerErrorMatch[1]}` };
    }

    // If we got here with status 200 and content, it's likely OK
    return { url, status: 'PASS', code: status, reason: `OK (${bodyLen} bytes)` };

  } catch (err) {
    clearTimeout(timer);
    if (err.name === 'AbortError') {
      return { url, status: 'FAIL', code: 0, reason: `Timeout after ${timeoutMs}ms` };
    }
    return { url, status: 'FAIL', code: 0, reason: `Fetch error: ${err.message}` };
  }
}

function printResult(result) {
  const icon = result.status === 'PASS' ? '✓' : result.status === 'FAIL' ? '✗' : '⚠';
  const codeStr = result.code ? ` ${result.code}` : '';
  console.log(`${icon} ${result.url} -${codeStr} ${result.reason}`);
}

async function runBatch(pages, cookie, concurrency = 5) {
  const results = [];
  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency);
    const batchResults = await Promise.all(
      batch.map(page => testPage(page, cookie))
    );
    for (const r of batchResults) {
      printResult(r);
      results.push(r);
    }
  }
  return results;
}

async function main() {
  console.log('='.repeat(80));
  console.log('DASHBOARD PAGE HEALTH CHECK');
  console.log(`Target: ${BASE_URL}`);
  console.log(`Time: ${new Date().toISOString()}`);
  console.log('='.repeat(80));

  // First check if server is up
  try {
    const resp = await fetch(BASE_URL, { signal: AbortSignal.timeout(5000) });
    console.log(`\nServer is up (status: ${resp.status})\n`);
  } catch (err) {
    console.error(`\nERROR: Server at ${BASE_URL} is not reachable: ${err.message}`);
    console.error('Make sure the dev server is running: pnpm dev');
    process.exit(1);
  }

  // Test public pages first (no auth)
  console.log('\n--- PUBLIC PAGES (no auth) ---');
  const publicResults = await runBatch(PUBLIC_PAGES, null);

  // Login as student
  console.log('\n--- Logging in as student2@test.com ---');
  const studentCookie = await login(STUDENT_CREDS);
  if (!studentCookie) {
    console.error('FATAL: Could not log in as student2. Trying to continue...');
  } else {
    console.log('Login successful\n');
  }

  // Test user pages
  console.log('--- USER PAGES (student session) ---');
  const userResults = await runBatch(USER_PAGES, studentCookie);

  // Login as admin
  console.log('\n--- Logging in as admin@test.com ---');
  const adminCookie = await login(ADMIN_CREDS);
  if (!adminCookie) {
    console.error('FATAL: Could not log in as admin. Skipping admin pages.');
  } else {
    console.log('Login successful\n');
  }

  // Test admin pages
  console.log('--- ADMIN PAGES (admin session) ---');
  let adminResults = [];
  if (adminCookie) {
    adminResults = await runBatch(ADMIN_PAGES, adminCookie);
  }

  // Summary
  const allResults = [...publicResults, ...userResults, ...adminResults];
  const passed = allResults.filter(r => r.status === 'PASS');
  const failed = allResults.filter(r => r.status === 'FAIL');
  const warned = allResults.filter(r => r.status === 'WARN');

  console.log('\n' + '='.repeat(80));
  console.log('SUMMARY');
  console.log('='.repeat(80));
  console.log(`Total pages tested: ${allResults.length}`);
  console.log(`  PASS:    ${passed.length}`);
  console.log(`  FAIL:    ${failed.length}`);
  console.log(`  WARNING: ${warned.length}`);

  if (failed.length > 0) {
    console.log('\n--- FAILED PAGES ---');
    for (const f of failed) {
      console.log(`  ✗ ${f.url} - ${f.code} ${f.reason}`);
    }
  }

  if (warned.length > 0) {
    console.log('\n--- WARNING PAGES ---');
    for (const w of warned) {
      console.log(`  ⚠ ${w.url} - ${w.code} ${w.reason}`);
    }
  }

  console.log('\n' + '='.repeat(80));

  // Exit with error code if any failures
  if (failed.length > 0) process.exit(1);
}

main().catch(err => {
  console.error('Script error:', err);
  process.exit(2);
});
