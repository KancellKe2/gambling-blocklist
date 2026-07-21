/**
 * Development script for local testing
 * Run with: node dev.js
 */

const worker = require('./worker.js');

// Mock KV for local development
const mockKV = new Map();

const mockEnv = {
  BLOCKLIST_KV: {
    put: async (key, value) => {
      mockKV.set(key, value);
      console.log(`[KV] Stored: ${key} (${value.length} bytes)`);
      return true;
    },
    get: async (key, options) => {
      const value = mockKV.get(key);
      if (value) {
        console.log(`[KV] Retrieved: ${key} (${value.length} bytes)`);
      }
      return value || null;
    }
  }
};

// Simple HTTP server for local development
const http = require('http');
const url = require('url');

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  
  console.log(`\n${new Date().toISOString()} - ${req.method} ${parsedUrl.pathname}`);
  
  try {
    // Create Request object for the worker
    const workerRequest = new Request(`http://localhost:3000${parsedUrl.pathname}`, {
      method: req.method,
      headers: req.headers
    });
    
    // Call the worker
    const response = await worker.default.fetch(workerRequest, mockEnv, {});
    
    // Send response
    res.writeHead(response.status, Object.fromEntries(response.headers));
    const body = await response.text();
    res.end(body);
    
  } catch (error) {
    console.error('Worker error:', error);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end('Internal Server Error');
  }
});

const PORT = 3000;
server.listen(PORT, () => {
  console.log(`\n🚀 Gambling Blocklist Worker - Development Server`);
  console.log(`   Local: http://localhost:${PORT}`);
  console.log(`   Blocklist: http://localhost:${PORT}/blocklist`);
  console.log(`   Status: http://localhost:${PORT}/status`);
  console.log(`   Scan: http://localhost:${PORT}/scan`);
  console.log(`\nPress Ctrl+C to stop\n`);
});