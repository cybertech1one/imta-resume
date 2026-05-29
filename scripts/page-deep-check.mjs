/**
 * Deep Page Health Check - inspects SSR dehydrated state for query errors
 * that would manifest as client-side errors/spinners/broken UI.
 */

const BASE_URL = 'http://localhost:3040';
const STUDENT_CREDS = { email: 'student2@test.com', password: 'TestAccount123!' };
const ADMIN_CREDS = { email: 'admin@test.com', password: 'TestAccount123!' };

async function login(creds) {
  const resp = await fetch(`${BASE_URL}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE_URL },
    body: JSON.stringify(creds),
    redirect: 'manual',
  });
  const cookies = resp.headers.getSetCookie?.() || [];
  const sessionCookie = cookies.find(c => c.includes('better-auth.session_token'));
  if (!sessionCookie) return null;
  const match = sessionCookie.match(/better-auth\.session_token=([^;]+)/);
  return match ? `better-auth.session_token=${match[1]}` : null;
}

async function deepCheck(url, cookie) {
  const fullUrl = `${BASE_URL}${url}`;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20000);

  try {
    const headers = cookie ? { Cookie: cookie } : {};
    const resp = await fetch(fullUrl, { headers, redirect: 'follow', signal: controller.signal });
    clearTimeout(timer);

    const status = resp.status;
    if (status >= 400) {
      return { url, status: 'FAIL', issues: [`HTTP ${status}`] };
    }

    const body = await resp.text();
    const issues = [];

    // 1. Check for __TSR_DEHYDRATED errors
    // TanStack Router serializes errors in the SSR payload
    const dehydratedMatches = [...body.matchAll(/"status":"error"/g)];
    if (dehydratedMatches.length > 0) {
      // Extract the error messages
      const errorMsgs = [...body.matchAll(/"status":"error"[^}]*?"message":"([^"]{1,200})"/g)];
      for (const m of errorMsgs) {
        issues.push(`Dehydrated query error: ${m[1]}`);
      }
      if (errorMsgs.length === 0) {
        issues.push(`${dehydratedMatches.length} dehydrated error(s) detected`);
      }
    }

    // 2. Check for isError:true in dehydrated data
    const isErrorMatches = [...body.matchAll(/"isError"\s*:\s*true/g)];
    if (isErrorMatches.length > 0) {
      issues.push(`${isErrorMatches.length} isError:true found in SSR data`);
    }

    // 3. Check for server-side error boundaries being triggered
    if (/data-error-boundary|ErrorFallback|error-fallback/i.test(body)) {
      issues.push('Error boundary/fallback rendered in SSR');
    }

    // 4. Check for "__serverError" or server error serialization
    const serverErrors = [...body.matchAll(/__serverError|"serverError"\s*:\s*true|"__isServerError"\s*:\s*true/g)];
    if (serverErrors.length > 0) {
      issues.push(`${serverErrors.length} server error(s) in SSR state`);
    }

    // 5. Check for "Not Found" rendered as page content (TanStack Router catch-all)
    if (/class="[^"]*"[^>]*>Not Found<|<h1[^>]*>Not Found<|notFound|"notFound":true/i.test(body)) {
      issues.push('Page renders "Not Found" content');
    }

    // 6. Check for stack traces leaked into HTML
    if (/Error:.*at\s+\w+.*\(.*:\d+:\d+\)/s.test(body)) {
      issues.push('Stack trace leaked into HTML');
    }

    // 7. Check for empty main content area (shell renders but page content missing)
    // Look for very small content between dashboard shell markers
    const mainContent = body.match(/<main[^>]*>([\s\S]*?)<\/main>/);
    if (mainContent && mainContent[1].trim().length < 50) {
      issues.push('Main content area is nearly empty');
    }

    // 8. Check for "undefined" or "null" rendered as visible text (common data issue)
    const undefinedMatches = body.match(/>[^<]*\bundefined\b[^<]*</g);
    if (undefinedMatches && undefinedMatches.length > 2) {
      issues.push(`"undefined" appears ${undefinedMatches.length} times as visible text`);
    }

    // 9. Check for ORPC error responses embedded in SSR
    const orpcErrors = [...body.matchAll(/"code"\s*:\s*"(INTERNAL_SERVER_ERROR|NOT_FOUND|UNAUTHORIZED|FORBIDDEN|BAD_REQUEST)"/g)];
    if (orpcErrors.length > 0) {
      const codes = [...new Set(orpcErrors.map(m => m[1]))];
      issues.push(`ORPC error codes in SSR: ${codes.join(', ')}`);
    }

    // 10. Check for Drizzle/DB errors
    if (/relation ".*" does not exist|column ".*" does not exist|syntax error at or near/i.test(body)) {
      const dbErr = body.match(/relation "([^"]+)" does not exist|column "([^"]+)" does not exist/i);
      issues.push(`Database error: ${dbErr?.[0] || 'SQL error in response'}`);
    }

    if (issues.length === 0) {
      return { url, status: 'PASS', issues: [`OK (${body.length} bytes)`] };
    } else {
      return { url, status: 'FAIL', issues };
    }
  } catch (err) {
    clearTimeout(timer);
    return { url, status: 'FAIL', issues: [err.name === 'AbortError' ? 'Timeout' : err.message] };
  }
}

const ALL_USER_PAGES = [
  '/dashboard', '/dashboard/resumes', '/dashboard/profile',
  '/dashboard/career', '/dashboard/career/assessment', '/dashboard/career/quiz',
  '/dashboard/career/skills', '/dashboard/career/roadmap', '/dashboard/career/coaching',
  '/dashboard/career/insights', '/dashboard/career/certifications', '/dashboard/career/branding',
  '/dashboard/career/review-prep', '/dashboard/career/transition',
  '/dashboard/interview', '/dashboard/interview/practice?field=general&difficulty=intermediate',
  '/dashboard/interview/chatbot', '/dashboard/interview/mock-ai',
  '/dashboard/interview/tips?category=preparation', '/dashboard/interview/questions?field=general',
  '/dashboard/interview/checklist', '/dashboard/interview/scheduler',
  '/dashboard/interview/question-bank', '/dashboard/interview/notes',
  '/dashboard/jobs', '/dashboard/jobs/applications', '/dashboard/jobs/employers',
  '/dashboard/jobs/recommendations', '/dashboard/jobs/trends', '/dashboard/jobs/insights',
  '/dashboard/jobs/research', '/dashboard/jobs/culture-match', '/dashboard/jobs/aggregator',
  '/dashboard/jobs/alerts', '/dashboard/jobs/deadlines',
  '/dashboard/networking', '/dashboard/networking/events', '/dashboard/networking/mentors',
  '/dashboard/analytics', '/dashboard/analytics/activity', '/dashboard/analytics/progress',
  '/dashboard/analytics/reports', '/dashboard/analytics/ai-usage',
  '/dashboard/tools/cover-letter', '/dashboard/tools/ai-writer', '/dashboard/tools/keywords',
  '/dashboard/tools/salary-calculator', '/dashboard/tools/elevator-pitch',
  '/dashboard/tools/negotiation', '/dashboard/tools/thank-you',
  '/dashboard/settings/profile', '/dashboard/settings/preferences',
  '/dashboard/settings/authentication', '/dashboard/settings/api-keys',
  '/dashboard/settings/ai', '/dashboard/settings/data', '/dashboard/settings/danger-zone',
  '/dashboard/help', '/dashboard/templates/gallery', '/dashboard/resources',
];

const ADMIN_PAGES = [
  '/dashboard/admin', '/dashboard/admin/users?page=1',
  '/dashboard/admin/ai-providers', '/dashboard/admin/ai-quotas',
  '/dashboard/admin/reference-data',
];

async function runBatch(pages, cookie, concurrency = 3) {
  const results = [];
  for (let i = 0; i < pages.length; i += concurrency) {
    const batch = pages.slice(i, i + concurrency);
    const batchResults = await Promise.all(batch.map(p => deepCheck(p, cookie)));
    results.push(...batchResults);
  }
  return results;
}

async function main() {
  console.log('DEEP PAGE HEALTH CHECK - SSR Error Detection');
  console.log('='.repeat(80));

  // Login as student
  const studentCookie = await login(STUDENT_CREDS);
  if (!studentCookie) { console.error('Student login failed'); process.exit(1); }
  console.log('Student login OK');

  const adminCookie = await login(ADMIN_CREDS);
  if (!adminCookie) { console.error('Admin login failed'); process.exit(1); }
  console.log('Admin login OK\n');

  console.log('--- USER PAGES ---');
  const userResults = await runBatch(ALL_USER_PAGES, studentCookie);
  for (const r of userResults) {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${r.url}`);
    if (r.status === 'FAIL') {
      for (const issue of r.issues) {
        console.log(`    ${issue}`);
      }
    }
  }

  console.log('\n--- ADMIN PAGES ---');
  const adminResults = await runBatch(ADMIN_PAGES, adminCookie);
  for (const r of adminResults) {
    const icon = r.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${r.url}`);
    if (r.status === 'FAIL') {
      for (const issue of r.issues) {
        console.log(`    ${issue}`);
      }
    }
  }

  const all = [...userResults, ...adminResults];
  const failed = all.filter(r => r.status === 'FAIL');
  console.log('\n' + '='.repeat(80));
  console.log(`TOTAL: ${all.length} | PASS: ${all.length - failed.length} | FAIL: ${failed.length}`);

  if (failed.length > 0) {
    console.log('\n--- ALL FAILURES ---');
    for (const f of failed) {
      console.log(`✗ ${f.url}`);
      for (const issue of f.issues) {
        console.log(`    ${issue}`);
      }
    }
  }
}

main().catch(err => { console.error(err); process.exit(2); });
