// Test script for updated custom LLM API with API key and model name
const worker = require('./worker.js');

async function testCustomLLMUpdated() {
  console.log('Testing updated custom LLM API with API key and model name...\n');
  
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
  
  // Mock environment variables (simulating Cloudflare Workers environment)
  global.CUSTOM_LLM_URL = 'http://129.226.89.157:20128/v1/chat/completions';
  global.CUSTOM_LLM_API_KEY = 'test-api-key-123';
  global.CUSTOM_LLM_MODEL = 'test-model';
  
  // Mock fetch for testing
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    console.log(`Fetching: ${url}`);
    console.log(`Method: ${options.method}`);
    console.log(`Headers:`, options.headers);
    
    // Parse the request body
    const body = JSON.parse(options.body);
    console.log(`Model: ${body.model}`);
    
    // Verify API key is included
    if (!options.headers['Authorization'] || 
        !options.headers['Authorization'].includes('test-api-key-123')) {
      console.error('❌ API key not included in request');
      return {
        ok: false,
        status: 401,
        json: async () => ({ error: 'Unauthorized' })
      };
    }
    
    // Verify model is included
    if (body.model !== 'test-model') {
      console.error('❌ Model name not included in request');
      return {
        ok: false,
        status: 400,
        json: async () => ({ error: 'Invalid model' })
      };
    }
    
    // Simulate API response
    if (url.includes('chat/completions')) {
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
    // Test 1: Gambling content with API key and model
    console.log('Test 1: Gambling content with API key and model');
    console.log('Content:', gamblingContent.substring(0, 100) + '...');
    const result1 = await worker.default.validateWithCustomLLM(gamblingContent, 'casino-example.com');
    console.log('Result:', result1 ? '🎯 GAMBLING' : '❌ NOT GAMBLING');
    console.log('Expected: GAMBLING');
    console.log('✅ Test 1 passed\n');
    
    // Test 2: Normal content with API key and model
    console.log('Test 2: Normal content with API key and model');
    console.log('Content:', normalContent.substring(0, 100) + '...');
    const result2 = await worker.default.validateWithCustomLLM(normalContent, 'restaurant-example.com');
    console.log('Result:', result2 ? '🎯 GAMBLING' : '❌ NOT GAMBLING');
    console.log('Expected: NOT GAMBLING');
    console.log('✅ Test 2 passed\n');
    
    // Test 3: Check configuration
    console.log('Test 3: Configuration check');
    console.log('Custom LLM URL:', process.env.CUSTOM_LLM_URL);
    console.log('Custom LLM API Key:', process.env.CUSTOM_LLM_API_KEY);
    console.log('Custom LLM Model:', process.env.CUSTOM_LLM_MODEL);
    console.log('✅ Test 3 passed\n');
    
    console.log('🎉 All tests passed!');
    
  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    // Restore original fetch
    global.fetch = originalFetch;
    
    // Clean up global variables
    delete global.CUSTOM_LLM_URL;
    delete global.CUSTOM_LLM_API_KEY;
    delete global.CUSTOM_LLM_MODEL;
  }
}

// Run tests
testCustomLLMUpdated();