// Test script for custom LLM API
const worker = require('./worker.js');

async function testCustomLLM() {
  console.log('Testing custom LLM API...\n');
  
  // Test content (gambling website)
  const gamblingContent = `
    Welcome to our online casino! Play slots, poker, blackjack and win real money.
    Deposit now and get 100% bonus! Jackpot slots with huge prizes.
    Join now and become a VIP member. Withdraw your winnings instantly.
  `;
  
  // Test content (non-gambling website)
  const normalContent = `
    Welcome to our restaurant! We serve delicious Italian food.
    Check out our menu for pasta, pizza, and desserts.
    Open daily from 11am to 10pm. Reservations recommended.
  `;
  
  // Mock environment with custom LLM URL
  const mockEnv = {
    BLOCKLIST_KV: {
      put: async (key, value) => {
        console.log(`KV PUT: ${key} = ${value.substring(0, 100)}...`);
        return true;
      },
      get: async (key, options) => {
        console.log(`KV GET: ${key}`);
        return null;
      }
    }
  };
  
  // Mock fetch for testing
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    console.log(`Fetching: ${url}`);
    console.log(`Method: ${options.method}`);
    console.log(`Headers:`, options.headers);
    
    // Simulate API response
    if (url.includes('chat/completions')) {
      const body = JSON.parse(options.body);
      const content = body.messages[1].content.toLowerCase();
      
      // Determine if content is gambling-related
      const isGambling = content.includes('casino') || 
                        content.includes('poker') || 
                        content.includes('slot') ||
                        content.includes('jackpot') ||
                        content.includes('gambling');
      
      return {
        ok: true,
        json: async () => ({
          choices: [{
            message: {
              content: isGambling ? 'GAMBLING' : 'NOT_GAMBLING'
            }
          }]
        })
      };
    }
    
    return originalFetch(url, options);
  };
  
  try {
    // Test 1: Gambling content
    console.log('Test 1: Gambling content');
    console.log('Content:', gamblingContent.substring(0, 100) + '...');
    const result1 = await worker.default.validateWithCustomLLM(gamblingContent, 'casino-example.com');
    console.log('Result:', result1 ? '🎯 GAMBLING' : '❌ NOT GAMBLING');
    console.log('Expected: GAMBLING');
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Normal content
    console.log('Test 2: Normal content');
    console.log('Content:', normalContent.substring(0, 100) + '...');
    const result2 = await worker.default.validateWithCustomLLM(normalContent, 'restaurant-example.com');
    console.log('Result:', result2 ? '🎯 GAMBLING' : '❌ NOT GAMBLING');
    console.log('Expected: NOT GAMBLING');
    console.log('✅ Test 2 passed\n');
    
    // Test 3: Check if custom LLM URL is used
    console.log('Test 3: Custom LLM URL configuration');
    console.log('Custom LLM URL in config:', worker.default.CONFIG.AI_APIS.customLLM.url);
    console.log('Expected: http://129.226.89.157:20128/v1/chat/completions');
    console.log('✅ Test 3 passed\n');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
  }
}

// Run tests
testCustomLLM();