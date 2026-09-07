// Ad-hoc GA4 Data API querying via a service account — no new npm dependency,
// JWT signed manually with Node's built-in crypto (RS256) since this is only
// ever invoked directly (node scripts/ga4.cjs '<report JSON>'), not deployed.
// Credentials come from .env.local (GA4_PROPERTY_ID / GA4_CLIENT_EMAIL / GA4_PRIVATE_KEY).
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

function loadEnvLocal() {
  const envPath = path.join(__dirname, '..', '.env.local');
  const raw = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of raw.split('\n')) {
    const m = line.match(/^([A-Z0-9_]+)="([\s\S]*)"$/);
    if (m) env[m[1]] = m[2];
  }
  return env;
}

function base64url(input) {
  return Buffer.from(input).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function getAccessToken(env) {
  const privateKey = env.GA4_PRIVATE_KEY.replace(/\\n/g, '\n');
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: 'RS256', typ: 'JWT' };
  const claim = {
    iss: env.GA4_CLIENT_EMAIL,
    scope: 'https://www.googleapis.com/auth/analytics.readonly',
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signature = crypto.createSign('RSA-SHA256').update(unsigned).sign(privateKey);
  const jwt = `${unsigned}.${signature.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')}`;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: jwt,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`Token exchange failed: ${JSON.stringify(data)}`);
  return data.access_token;
}

async function runReport(reportBody) {
  const env = loadEnvLocal();
  const accessToken = await getAccessToken(env);
  const res = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${env.GA4_PROPERTY_ID}:runReport`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(reportBody),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`runReport failed: ${JSON.stringify(data)}`);
  return data;
}

module.exports = { runReport };

// Self-test when run directly: node scripts/ga4.cjs
if (require.main === module) {
  runReport({
    dateRanges: [{ startDate: '30daysAgo', endDate: 'today' }],
    metrics: [{ name: 'activeUsers' }, { name: 'sessions' }, { name: 'conversions' }],
  }).then(data => {
    console.log(JSON.stringify(data, null, 2));
  }).catch(err => {
    console.error('GA4 test query failed:', err.message);
    process.exit(1);
  });
}
