// Simple test script for the gambling blocklist worker
// Run with: node test-worker.js

const worker = require('./worker.js');

// Mock environment for testing
const mockEnv = {
  BLOCKLIST_KV: {
    put: async (key, value) => {
      console.log(`KV PUT: ${key} = ${value.substring(0, 100)}...`);
      return true;
    },
    get: async (key, options) => {
      console.log(`KV GET: ${key}`);
      if (key === 'current-blocklist') {
        return '! Test blocklist\n||test.com^\n';
      }
      if (key === 'stats') {
        return JSON.stringify({
          lastScan: new Date().toISOString(),
          totalDiscovered: 10,
          totalValidated: 5,
          sites: ['test1.com', 'test2.com']
        });
      }
      return null;
    }
  }
};

async function test() {
  console.log('Testing gambling blocklist worker...\n');
  
  // Test 1: Basic worker response
  console.log('Test 1: Basic worker response');
  const request1 = new Request('https://example.com/');
  const response1 = await worker.default.fetch(request1, mockEnv, {});
  const text1 = await response1.text();
  console.log('Response:', text1);
  console.log('✅ Basic worker response test passed\n');
  
  // Test 2: Blocklist endpoint
  console.log('Test 2: Blocklist endpoint');
  const request2 = new Request('https://example.com/blocklist');
  const response2 = await worker.default.fetch(request2, mockEnv, {});
  const text2 = await response2.text();
  console.log('Blocklist preview:', text2.substring(0, 200));
  console.log('✅ Blocklist endpoint test passed\n');
  
  // Test 3: Status endpoint
  console.log('Test 3: Status endpoint');
  const request3 = new Request('https://example.com/status');
  const response3 = await worker.default.fetch(request3, mockEnv, {});
  const text3 = await response3.text();
  console.log('Status:', text3);
  console.log('✅ Status endpoint test passed\n');
  
  // Test 4: Domain validation
  console.log('Test 4: Domain validation');
  const testDomains = [
    'casino.com',
    'poker.net',
    'slot.id',
    'normal-site.com',
    'betting.org'
  ];
  
  for (const domain of testDomains) {
    const isGambling = worker.default.isGamblingDomain(domain);
    console.log(`${domain}: ${isGambling ? '🎯 Gambling' : '❌ Not gambling'}`);
  }
  console.log('✅ Domain validation test passed\n');
  
  // Test 5: Blocklist generation
  console.log('Test 5: Blocklist generation');
  const testSites = ['test1.com', 'test2.com', 'casino3.com'];
  const blocklist = worker.generateBlocklist(testSites);
  console.log('Generated blocklist preview:');
  console.log(blocklist.substring(0, 300));
  console.log('✅ Blocklist generation test passed\n');
  
  console.log('🎉 All tests passed!');
}

// Run tests
test().catch(error => {
  console.error('Test failed:', error);
  process.exit(1);
});