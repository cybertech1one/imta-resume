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

async function testAPI(cookie, method, path, body) {
  const headers = {
    'Cookie': cookie,
    'Origin': 'http://localhost:3040',
    'Referer': 'http://localhost:3040/',
  };
  if (body) {
    headers['Content-Type'] = 'application/json';
    const bodyStr = JSON.stringify(body);
    headers['Content-Length'] = Buffer.byteLength(bodyStr);
    const res = await request({ hostname: 'localhost', port: 3040, path, method, headers }, bodyStr);
    return res;
  }
  const res = await request({ hostname: 'localhost', port: 3040, path, method, headers });
  return res;
}

async function testPage(cookie, path) {
  const res = await request({
    hostname: 'localhost', port: 3040, path, method: 'GET',
    headers: {
      'Cookie': cookie,
      'Accept': 'text/html',
      'Origin': 'http://localhost:3040',
      'Referer': 'http://localhost:3040/',
    }
  });
  return res;
}

function summarize(body, maxLen = 120) {
  if (!body) return '(empty)';
  const s = body.substring(0, maxLen).replace(/\n/g, ' ');
  return s;
}

async function main() {
  console.log('=== JOBS PAGES END-TO-END TEST ===\n');

  const cookie = await login();
  console.log('Logged in as student2@test.com\n');

  const results = [];

  // Define all tests
  const tests = [
    {
      page: '/dashboard/jobs',
      apiEndpoints: [
        { name: 'employers.list', method: 'GET', path: '/api/rpc/employers/list' },
        { name: 'employers.list (POST)', method: 'POST', path: '/api/rpc/employers/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/applications',
      apiEndpoints: [
        { name: 'jobApplications.list', method: 'GET', path: '/api/rpc/jobApplications/list' },
        { name: 'jobApplications.list (POST)', method: 'POST', path: '/api/rpc/jobApplications/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/employers',
      apiEndpoints: [
        { name: 'employers.list (GET)', method: 'GET', path: '/api/rpc/employers/list' },
      ]
    },
    {
      page: '/dashboard/jobs/recommendations',
      apiEndpoints: [
        { name: 'jobRecommendations.list', method: 'GET', path: '/api/rpc/jobRecommendations/list' },
        { name: 'jobRecommendations.list (POST)', method: 'POST', path: '/api/rpc/jobRecommendations/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/trends',
      apiEndpoints: [
        { name: 'marketIntelligence.salaries.list', method: 'GET', path: '/api/rpc/marketIntelligence/salaries/list' },
        { name: 'marketIntelligence.skills.list', method: 'GET', path: '/api/rpc/marketIntelligence/skills/list' },
        { name: 'marketIntelligence.regions.list', method: 'GET', path: '/api/rpc/marketIntelligence/regions/list' },
        { name: 'marketIntelligence.salaries.list (POST)', method: 'POST', path: '/api/rpc/marketIntelligence/salaries/list', body: { json: {} } },
        { name: 'marketIntelligence.skills.list (POST)', method: 'POST', path: '/api/rpc/marketIntelligence/skills/list', body: { json: {} } },
        { name: 'marketIntelligence.regions.list (POST)', method: 'POST', path: '/api/rpc/marketIntelligence/regions/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/aggregator',
      apiEndpoints: [
        { name: 'jobAggregator.list', method: 'GET', path: '/api/rpc/jobAggregator/list' },
        { name: 'jobAggregator.search', method: 'GET', path: '/api/rpc/jobAggregator/search' },
        { name: 'jobAggregator.list (POST)', method: 'POST', path: '/api/rpc/jobAggregator/list', body: { json: {} } },
        { name: 'jobAggregator.search (POST)', method: 'POST', path: '/api/rpc/jobAggregator/search', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/follow-up',
      apiEndpoints: [
        { name: 'jobFollowUp.list', method: 'GET', path: '/api/rpc/jobFollowUp/list' },
        { name: 'jobFollowUp.list (POST)', method: 'POST', path: '/api/rpc/jobFollowUp/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/deadlines',
      apiEndpoints: [
        { name: 'jobDeadlines.list', method: 'GET', path: '/api/rpc/jobDeadlines/list' },
        { name: 'jobDeadlines.list (POST)', method: 'POST', path: '/api/rpc/jobDeadlines/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/alerts',
      apiEndpoints: [
        { name: 'jobAlerts.list', method: 'GET', path: '/api/rpc/jobAlerts/list' },
        { name: 'jobAlerts.list (POST)', method: 'POST', path: '/api/rpc/jobAlerts/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/jobs/insights',
      apiEndpoints: [
        { name: 'jobInsights.list', method: 'GET', path: '/api/rpc/jobInsights/list' },
        { name: 'jobInsights.overview', method: 'GET', path: '/api/rpc/jobInsights/overview' },
        { name: 'jobInsights.list (POST)', method: 'POST', path: '/api/rpc/jobInsights/list', body: { json: {} } },
        { name: 'analytics.jobs', method: 'GET', path: '/api/rpc/analytics/jobs' },
      ]
    },
    {
      page: '/dashboard/networking',
      apiEndpoints: [
        { name: 'networking.contacts.list', method: 'GET', path: '/api/rpc/networking/contacts/list' },
        { name: 'networking.contacts.list (POST)', method: 'POST', path: '/api/rpc/networking/contacts/list', body: { json: {} } },
      ]
    },
    {
      page: '/dashboard/networking/events',
      apiEndpoints: [
        { name: 'networking.events.list', method: 'GET', path: '/api/rpc/networking/events/list' },
        { name: 'networking.events.list (POST)', method: 'POST', path: '/api/rpc/networking/events/list', body: { json: {} } },
      ]
    },
  ];

  // Run all tests
  for (const test of tests) {
    console.log(`\n--- Testing: ${test.page} ---`);

    // Test APIs
    let apiStatus = 'UNTESTED';
    let apiDetails = [];
    for (const ep of test.apiEndpoints) {
      try {
        const res = await testAPI(cookie, ep.method, ep.path, ep.body);
        const detail = `${ep.name}: ${res.status} ${summarize(res.body, 80)}`;
        apiDetails.push(detail);
        console.log(`  API ${ep.method} ${ep.path} -> ${res.status}`);
        if (res.status === 200) {
          apiStatus = 'OK';
        }
      } catch (e) {
        apiDetails.push(`${ep.name}: ERROR ${e.message}`);
        console.log(`  API ${ep.method} ${ep.path} -> ERROR: ${e.message}`);
      }
    }
    if (apiStatus !== 'OK') {
      // Check if any returned non-404
      const hasNon404 = apiDetails.some(d => !d.includes(': 404') && !d.includes('ERROR'));
      apiStatus = hasNon404 ? 'PARTIAL' : 'FAIL (404)';
    }

    // Test page
    let pageStatus = 'UNTESTED';
    let pageIssue = '';
    try {
      const pageRes = await testPage(cookie, test.page);
      console.log(`  PAGE ${test.page} -> ${pageRes.status}`);
      if (pageRes.status === 200) {
        pageStatus = 'OK';
        // Check for error indicators in HTML
        if (pageRes.body.includes('Something went wrong') || pageRes.body.includes('error-boundary')) {
          pageStatus = 'ERROR IN PAGE';
          pageIssue = 'Error boundary triggered';
        }
        if (pageRes.body.includes('Not Found') || pageRes.body.includes('404')) {
          // Could be a false positive in SSR content
          if (!pageRes.body.includes('<!DOCTYPE') && !pageRes.body.includes('<html')) {
            pageStatus = 'NOT FOUND';
            pageIssue = '404 page content';
          }
        }
      } else if (pageRes.status === 302 || pageRes.status === 301) {
        pageStatus = `REDIRECT (${pageRes.status})`;
        pageIssue = `Redirects to: ${pageRes.headers.location || 'unknown'}`;
      } else {
        pageStatus = `HTTP ${pageRes.status}`;
        pageIssue = summarize(pageRes.body, 100);
      }
    } catch (e) {
      pageStatus = 'ERROR';
      pageIssue = e.message;
    }

    results.push({
      page: test.page,
      apiStatus,
      apiDetails: apiDetails.join(' | '),
      pageStatus,
      pageIssue
    });
  }

  // Print summary table
  console.log('\n\n=== RESULTS TABLE ===\n');
  console.log('| Page | API Status | Page Status | Issue |');
  console.log('|------|-----------|-------------|-------|');
  for (const r of results) {
    console.log(`| ${r.page} | ${r.apiStatus} | ${r.pageStatus} | ${r.pageIssue || '-'} |`);
  }

  // Print API details
  console.log('\n\n=== API DETAILS ===\n');
  for (const r of results) {
    console.log(`${r.page}:`);
    console.log(`  ${r.apiDetails}`);
  }
}

main().catch(e => console.error('FATAL:', e));
