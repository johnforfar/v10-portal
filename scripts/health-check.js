const http = require('http');

const URLS = [
  'http://localhost:3000', // Portal
  'http://localhost:3000/docs', // Docs
  'http://localhost:3000/community', // Community
  'http://localhost:3000/c/general', // Dynamic Forum Category
  'http://localhost:3000/dashboard', // Ecosystem
  'http://localhost:3000/builder', // App Builder
  'http://localhost:3000/models', // External Demo Proxy
  'http://localhost:3000/community/courses', // Courses
];

async function checkUrl(url) {
  return new Promise((resolve) => {
    http.get(url, (res) => {
      console.log(`[CHECK] ${url} -> ${res.statusCode}`);
      resolve(res.statusCode === 200 || res.statusCode === 302 || res.statusCode === 307);
    }).on('error', (e) => {
      console.log(`[FAIL] ${url} -> ${e.message}`);
      resolve(false);
    });
  });
}

async function run() {
  console.log('--- V10 Platform Health Audit ---');
  let allPass = true;
  for (const url of URLS) {
    const success = await checkUrl(url);
    if (!success) allPass = false;
  }
  
  if (allPass) {
    console.log('✅ All federated nodes are responding correctly.');
    process.exit(0);
  } else {
    console.log('❌ Some nodes failed. Ensure all sub-services are running.');
    process.exit(1);
  }
}

run();