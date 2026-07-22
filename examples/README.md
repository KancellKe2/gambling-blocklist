# Examples

This directory contains example configuration files for the Gambling Blocklist system.

## Configuration Files

### config.example.ts

This file shows how to configure the gambling blocklist system with all available options:

- **AI Configuration**: OmniRoute endpoint and API key
- **Firecrawl Configuration**: Optional Firecrawl API integration
- **Crawler Configuration**: Concurrency, timeout, and rate limiting
- **Discovery Sources**: Where to find gambling domains
- **Scoring Weights**: How to combine different confidence factors
- **Blocklist Formats**: Which output formats to generate
- **Storage**: KV and R2 storage configuration
- **False Positive Filtering**: Domains and patterns to exclude

### wrangler.example.jsonc

This file shows how to configure Cloudflare Workers deployment:

- **KV Namespaces**: For storing blocklist data
- **R2 Buckets**: For extended storage (optional)
- **Cron Triggers**: For scheduled updates
- **Environment Variables**: Production vs development settings

## Usage

1. Copy the example files:
```bash
cp examples/config.example.ts src/config/custom.ts
cp examples/wrangler.example.jsonc wrangler.jsonc
```

2. Edit the copied files with your configuration

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your API keys and configuration
```

4. Deploy:
```bash
./scripts/deploy.sh
```

## Configuration Options

### AI Configuration

```typescript
ai: {
  endpoint: 'https://api.omniroute.com/v1',  // Your OmniRoute endpoint
  apiKey: 'your_api_key',                      // Your API key
  model: 'gpt-3.5-turbo',                     // Model to use
  temperature: 0.1,                            // Lower = more deterministic
  maxTokens: 1000,                             // Max tokens per request
}
```

### Crawler Configuration

```typescript
crawler: {
  maxConcurrentRequests: 10,  // Max parallel requests
  requestTimeout: 30000,      // Request timeout in ms
  rateLimitDelay: 1000,       // Delay between requests in ms
  userAgent: 'GamblingBlocklistBot/1.0',
  retryAttempts: 3,           // Number of retry attempts
}
```

### Scoring Weights

```typescript
scoring: {
  weights: {
    aiScore: 0.4,           // AI analysis score weight
    keywordScore: 0.2,      // Keyword matching weight
    linkScore: 0.15,        // Link analysis weight
    domainReputation: 0.1,  // Domain reputation weight
    pageSimilarity: 0.1,    // Page similarity weight
    historical: 0.05,       // Historical data weight
  },
}
```

## Environment Variables

See `.env.example` for all available environment variables and their descriptions.