import http from 'http';

function request(options, body) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
    });
    req.on('error', reject);
    req.setTimeout(10000, () => { req.destroy(); reject(new Error('timeout')); });
    if (body) req.write(body);
    req.end();
  });
}

async function login() {
  const body = JSON.stringify({ email: 'student2@test.com', password: 'TestAccount123!' });
  const res = await request({
    hostname: 'localhost', port: 3040, path: '/api/auth/sign-in/email',
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': 'http://localhost:3040', 'Referer': 'http://localhost:3040/', 'Content-Length': Buffer.byteLength(body) }
  }, body);
  const cookies = res.headers['set-cookie'];
  if (!cookies) throw new Error('Login failed: ' + res.status + ' ' + res.body.substring(0, 200));
  return cookies.map(c => c.split(';')[0]).join('; ');
}

async function apiCall(cookie, method, path, body) {
  const headers = {
    'Cookie': cookie,
    'Origin': 'http://localhost:3040',
    'Referer': 'http://localhost:3040/',
  };
  if (body !== undefined) {
    headers['Content-Type'] = 'application/json';
    const bodyStr = JSON.stringify(body);
    headers['Content-Length'] = Buffer.byteLength(bodyStr);
    return await request({ hostname: 'localhost', port: 3040, path, method, headers }, bodyStr);
  }
  return await request({ hostname: 'localhost', port: 3040, path, method, headers });
}

async function testEndpoint(cookie, name, method, path, body) {
  try {
    const res = await apiCall(cookie, method, path, body);
    let dataPreview = '';
    try {
      const parsed = JSON.parse(res.body);
      if (parsed.json && Array.isArray(parsed.json)) {
        dataPreview = `[${parsed.json.length} items]`;
      } else if (parsed.json && typeof parsed.json === 'object') {
        dataPreview = JSON.stringify(parsed.json).substring(0, 80);
      } else {
        dataPreview = res.body.substring(0, 80);
      }
    } catch { dataPreview = res.body.substring(0, 80); }
    return { name, status: res.status, preview: dataPreview, ok: res.status === 200 };
  } catch (e) {
    return { name, status: 'ERR', preview: e.message, ok: false };
  }
}

async function testPage(cookie, path) {
  try {
    const res = await apiCall(cookie, 'GET', path);
    let issue = '';
    if (res.status === 200) {
      if (res.body.includes('Something went wrong') || res.body.includes('ErrorBoundary')) {
        issue = 'Error boundary triggered in HTML';
      }
      // Check if it's a redirect page (SSR redirect)
      if (res.body.includes('__TSR_DEHYDRATED__')) {
        // It's a TanStack SSR page - good
      }
    } else if (res.status >= 300 && res.status < 400) {
      issue = `Redirects to ${res.headers.location || '?'}`;
    }
    return { status: res.status, issue };
  } catch (e) {
    return { status: 'ERR', issue: e.message };
  }
}

async function main() {
  console.log('=== JOBS & NETWORKING PAGES - COMPREHENSIVE TEST ===\n');
  const cookie = await login();
  console.log('Logged in as student2@test.com\n');

  // Based on actual route file analysis, these are the REAL endpoints each page calls:
  const pages = [
    {
      page: '/dashboard/jobs',
      label: 'Jobs Hub',
      apis: [
        // orpc.jobAggregator.jobs.list -> POST /api/rpc/jobAggregator/jobs/list
        { name: 'jobAggregator.jobs.list', m: 'POST', p: '/api/rpc/jobAggregator/jobs/list', b: { json: {} } },
        // orpc.employers.list -> POST /api/rpc/employers/list
        { name: 'employers.list', m: 'POST', p: '/api/rpc/employers/list', b: { json: { activeOnly: true } } },
        // orpc.marketInsights.list -> POST /api/rpc/marketInsights/list
        { name: 'marketInsights.list', m: 'POST', p: '/api/rpc/marketInsights/list', b: { json: { activeOnly: true } } },
      ]
    },
    {
      page: '/dashboard/jobs/applications',
      label: 'Applications',
      apis: [
        { name: 'jobApplications.list', m: 'GET', p: '/api/rpc/jobApplications/list' },
        { name: 'jobApplications.getStatistics', m: 'GET', p: '/api/rpc/jobApplications/getStatistics' },
      ]
    },
    {
      page: '/dashboard/jobs/employers',
      label: 'Employers',
      apis: [
        { name: 'employers.list', m: 'POST', p: '/api/rpc/employers/list', b: { json: { activeOnly: true } } },
      ]
    },
    {
      page: '/dashboard/jobs/recommendations',
      label: 'Recommendations',
      apis: [
        { name: 'jobRecommendations.getRecommendations', m: 'GET', p: '/api/rpc/jobRecommendations/getRecommendations' },
        { name: 'jobRecommendations.getRecommendations (POST)', m: 'POST', p: '/api/rpc/jobRecommendations/getRecommendations', b: { json: {} } },
        { name: 'jobRecommendations.getStats', m: 'GET', p: '/api/rpc/jobRecommendations/getStats' },
        { name: 'jobRecommendations.getStats (POST)', m: 'POST', p: '/api/rpc/jobRecommendations/getStats', b: { json: {} } },
        { name: 'jobRecommendations.getPreferences', m: 'GET', p: '/api/rpc/jobRecommendations/getPreferences' },
        { name: 'jobRecommendations.getPreferences (POST)', m: 'POST', p: '/api/rpc/jobRecommendations/getPreferences', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/trends',
      label: 'Trends',
      apis: [
        { name: 'marketIntelligence.salaries.list', m: 'GET', p: '/api/rpc/marketIntelligence/salaries/list' },
        { name: 'marketIntelligence.skills.list', m: 'GET', p: '/api/rpc/marketIntelligence/skills/list' },
        { name: 'marketIntelligence.regions.list', m: 'GET', p: '/api/rpc/marketIntelligence/regions/list' },
        { name: 'marketIntelligence.analytics.overview', m: 'GET', p: '/api/rpc/marketIntelligence/analytics/overview' },
        { name: 'marketIntelligence.analytics.overview (POST)', m: 'POST', p: '/api/rpc/marketIntelligence/analytics/overview', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/aggregator',
      label: 'Aggregator',
      apis: [
        { name: 'jobAggregator.jobs.list', m: 'POST', p: '/api/rpc/jobAggregator/jobs/list', b: { json: {} } },
        { name: 'jobAggregator.jobs.list (GET)', m: 'GET', p: '/api/rpc/jobAggregator/jobs/list' },
        { name: 'jobAggregator.savedSearches.list', m: 'GET', p: '/api/rpc/jobAggregator/savedSearches/list' },
        { name: 'jobAggregator.savedSearches.list (POST)', m: 'POST', p: '/api/rpc/jobAggregator/savedSearches/list', b: { json: {} } },
        { name: 'jobAggregator.jobs.getStatistics', m: 'GET', p: '/api/rpc/jobAggregator/jobs/getStatistics' },
        { name: 'jobAggregator.jobs.getStatistics (POST)', m: 'POST', p: '/api/rpc/jobAggregator/jobs/getStatistics', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/follow-up',
      label: 'Follow-Up',
      apis: [
        // This uses jobApplications.list with filter
        { name: 'jobApplications.list (filtered)', m: 'GET', p: '/api/rpc/jobApplications/list' },
        { name: 'jobApplications.getStatistics', m: 'GET', p: '/api/rpc/jobApplications/getStatistics' },
        { name: 'jobApplications.activity.add (POST)', m: 'POST', p: '/api/rpc/jobApplications/activity/add', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/deadlines',
      label: 'Deadlines',
      apis: [
        { name: 'deadlines.list', m: 'GET', p: '/api/rpc/deadlines/list' },
        { name: 'deadlines.list (POST)', m: 'POST', p: '/api/rpc/deadlines/list', b: { json: {} } },
        { name: 'deadlines.getStatistics', m: 'GET', p: '/api/rpc/deadlines/getStatistics' },
        { name: 'deadlines.getStatistics (POST)', m: 'POST', p: '/api/rpc/deadlines/getStatistics', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/alerts',
      label: 'Alerts',
      apis: [
        { name: 'jobAlerts.list', m: 'GET', p: '/api/rpc/jobAlerts/list' },
        { name: 'jobAlerts.list (POST)', m: 'POST', p: '/api/rpc/jobAlerts/list', b: { json: {} } },
        { name: 'jobAlerts.getStatistics', m: 'GET', p: '/api/rpc/jobAlerts/getStatistics' },
        { name: 'jobAlerts.getStatistics (POST)', m: 'POST', p: '/api/rpc/jobAlerts/getStatistics', b: { json: {} } },
        { name: 'jobAlerts.match.list', m: 'GET', p: '/api/rpc/jobAlerts/match/list' },
        { name: 'jobAlerts.match.list (POST)', m: 'POST', p: '/api/rpc/jobAlerts/match/list', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/insights',
      label: 'Insights',
      apis: [
        { name: 'marketInsights.list', m: 'POST', p: '/api/rpc/marketInsights/list', b: { json: { activeOnly: true } } },
        { name: 'employers.list', m: 'POST', p: '/api/rpc/employers/list', b: { json: { activeOnly: true } } },
        { name: 'skillLibrary.list', m: 'POST', p: '/api/rpc/skillLibrary/list', b: { json: { activeOnly: true } } },
        { name: 'marketIntelligence.analytics.overview', m: 'GET', p: '/api/rpc/marketIntelligence/analytics/overview' },
        { name: 'marketIntelligence.analytics.overview (POST)', m: 'POST', p: '/api/rpc/marketIntelligence/analytics/overview', b: { json: {} } },
        { name: 'marketIntelligence.analytics.salaryComparison', m: 'GET', p: '/api/rpc/marketIntelligence/analytics/salaryComparison' },
        { name: 'marketIntelligence.analytics.salaryComparison (POST)', m: 'POST', p: '/api/rpc/marketIntelligence/analytics/salaryComparison', b: { json: {} } },
        { name: 'marketIntelligence.skills.getTop', m: 'GET', p: '/api/rpc/marketIntelligence/skills/getTop' },
        { name: 'marketIntelligence.skills.getTop (POST)', m: 'POST', p: '/api/rpc/marketIntelligence/skills/getTop', b: { json: {} } },
        { name: 'marketIntelligence.regions.list', m: 'GET', p: '/api/rpc/marketIntelligence/regions/list' },
        { name: 'marketIntelligence.analytics.industryTrends', m: 'GET', p: '/api/rpc/marketIntelligence/analytics/industryTrends' },
        { name: 'marketIntelligence.analytics.industryTrends (POST)', m: 'POST', p: '/api/rpc/marketIntelligence/analytics/industryTrends', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/networking',
      label: 'Networking',
      apis: [
        { name: 'networking.list', m: 'GET', p: '/api/rpc/networking/list' },
        { name: 'networking.list (POST)', m: 'POST', p: '/api/rpc/networking/list', b: { json: {} } },
        { name: 'networkingEvents.list', m: 'GET', p: '/api/rpc/networkingEvents/list' },
        { name: 'networkingEvents.list (POST)', m: 'POST', p: '/api/rpc/networkingEvents/list', b: { json: { showPast: true } } },
        { name: 'networking.getStatistics', m: 'GET', p: '/api/rpc/networking/getStatistics' },
        { name: 'networking.getStatistics (POST)', m: 'POST', p: '/api/rpc/networking/getStatistics', b: { json: {} } },
        { name: 'networking.getFollowUpReminders', m: 'GET', p: '/api/rpc/networking/getFollowUpReminders' },
        { name: 'networking.getFollowUpReminders (POST)', m: 'POST', p: '/api/rpc/networking/getFollowUpReminders', b: { json: {} } },
      ]
    },
    {
      page: '/dashboard/networking/events',
      label: 'Networking Events',
      apis: [
        { name: 'networkingEvents.list', m: 'GET', p: '/api/rpc/networkingEvents/list' },
        { name: 'networkingEvents.list (POST)', m: 'POST', p: '/api/rpc/networkingEvents/list', b: { json: {} } },
        { name: 'networkingEvents.getStatistics', m: 'GET', p: '/api/rpc/networkingEvents/getStatistics' },
        { name: 'networkingEvents.getStatistics (POST)', m: 'POST', p: '/api/rpc/networkingEvents/getStatistics', b: { json: {} } },
        { name: 'networkingEvents.getPendingReminders', m: 'GET', p: '/api/rpc/networkingEvents/getPendingReminders' },
        { name: 'networkingEvents.getPendingReminders (POST)', m: 'POST', p: '/api/rpc/networkingEvents/getPendingReminders', b: { json: { daysAhead: 30 } } },
      ]
    },
  ];

  const results = [];

  for (const pg of pages) {
    console.log(`\n--- ${pg.label} (${pg.page}) ---`);

    // Test all APIs for this page
    const apiResults = [];
    for (const api of pg.apis) {
      const r = await testEndpoint(cookie, api.name, api.m, api.p, api.b);
      console.log(`  [${r.status}] ${api.m} ${api.p} -> ${r.preview}`);
      apiResults.push(r);
    }

    // Determine best API status
    const anyOk = apiResults.some(r => r.ok);
    const all404 = apiResults.every(r => r.status === 404);
    const allErr = apiResults.every(r => !r.ok);

    let apiStatus;
    let apiIssues = [];
    if (anyOk) {
      apiStatus = 'OK';
      const failing = apiResults.filter(r => !r.ok);
      if (failing.length > 0) {
        apiIssues = failing.map(f => `${f.name}=${f.status}`);
      }
    } else if (all404) {
      apiStatus = 'ALL 404';
      apiIssues = ['No endpoints found'];
    } else {
      apiStatus = 'FAIL';
      apiIssues = apiResults.filter(r => !r.ok).map(f => `${f.name}=${f.status}`);
    }

    // Test page rendering
    const pageRes = await testPage(cookie, pg.page);
    console.log(`  PAGE -> ${pageRes.status} ${pageRes.issue || ''}`);

    results.push({
      page: pg.page,
      label: pg.label,
      apiStatus,
      apiIssues: apiIssues.join('; '),
      pageStatus: pageRes.status,
      pageIssue: pageRes.issue,
    });
  }

  // Summary table
  console.log('\n\n========================================');
  console.log('FINAL RESULTS TABLE');
  console.log('========================================\n');
  console.log('| # | Page | API Status | Page Status | Issues |');
  console.log('|---|------|-----------|-------------|--------|');
  results.forEach((r, i) => {
    const issues = [r.apiIssues, r.pageIssue].filter(Boolean).join('; ');
    console.log(`| ${i+1} | ${r.page} | ${r.apiStatus} | ${r.pageStatus} | ${issues || 'None'} |`);
  });

  // Count issues
  const apiFailCount = results.filter(r => r.apiStatus !== 'OK').length;
  const pageFailCount = results.filter(r => r.pageStatus !== 200).length;
  console.log(`\nAPI failures: ${apiFailCount}/${results.length}`);
  console.log(`Page failures: ${pageFailCount}/${results.length}`);
}

main().catch(e => console.error('FATAL:', e));
