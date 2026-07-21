# Gambling Blocklist

Automated system for searching, validating, scoring, and generating gambling domain blocklists for AdGuard Home and other DNS-based ad blockers.

## Features

- **Automated Discovery**: Find new gambling domains through search engines, public blocklists, threat feeds, and more
- **Intelligent Crawling**: Async, parallel crawling with rate limiting and retry mechanisms
- **AI-Powered Validation**: Use LLM to accurately identify gambling websites
- **Multi-Factor Scoring**: Confidence scoring based on multiple factors
- **False Positive Filtering**: Filter out news, blogs, forums, and other non-gambling sites
- **Multiple Output Formats**: Generate blocklists for AdGuard Home, hosts, dnsmasq, ABP, and more
- **Scheduled Updates**: Automatic updates via Cloudflare Cron

## Architecture

The system is built on Cloudflare Workers with the following modules:

- **Discovery**: Find new gambling domains from various sources
- **Crawler**: Crawl and extract content from discovered domains
- **Validator**: Validate crawled content using AI analysis
- **AI**: LLM integration for gambling detection
- **Score**: Multi-factor confidence scoring
- **Storage**: KV and R2 storage for data persistence
- **Publisher**: Generate blocklist in multiple formats
- **Workers**: Cloudflare Worker entry points
- **Cron**: Scheduled update tasks
- **Config**: Configuration management
- **Types**: TypeScript type definitions
- **Utils**: Utility functions

## Prerequisites

- Node.js 18+
- Cloudflare account
- GitHub account (for repository creation)
- OmniRoute API key (for AI analysis)
- Optional: Firecrawl API key (for enhanced crawling)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/your-username/gambling-blocklist.git
cd gambling-blocklist
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize Wrangler:
```bash
npx wrangler init
```

## Development

Start development server:
```bash
npm run dev
```

Run tests:
```bash
npm test
```

Lint code:
```bash
npm run lint
```

Format code:
```bash
npm run format
```

## Deployment

1. Set up Cloudflare Workers:
```bash
npx wrangler login
npx wrangler kv:namespace create BLOCKLIST_KV
npx wrangler r2 bucket create gambling-blocklist-data
```

2. Update wrangler.jsonc with your namespace IDs

3. Deploy:
```bash
npm run deploy
```

## Configuration

### Environment Variables

Copy `.env.example` to `.env` and configure:

- `OMNIROUTE_API_KEY`: Your OmniRoute API key
- `FIRECRAWL_API_KEY`: Optional Firecrawl API key
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID
- `BLOCKLIST_KV_ID`: KV namespace ID from Wrangler

### Wrangler Configuration

Edit `wrangler.jsonc` to configure:

- KV namespaces
- R2 buckets
- Cron schedules
- Environment variables

## Usage

### API Endpoints

- `GET /`: API status
- `GET /api/blocklist`: Get current blocklist
- `GET /api/status`: Get system status
- `POST /api/update`: Trigger manual update

### Blocklist Formats

The system generates blocklists in the following formats:

1. **AdGuard Home**: Standard AdGuard Home format
2. **Hosts**: hosts file format
3. **dnsmasq**: dnsmasq configuration
4. **Plain Domains**: One domain per line
5. **ABP**: Adblock Plus format
6. **RPZ**: Response Policy Zone (if enabled)

## How It Works

1. **Discovery**: System finds potential gambling domains from various sources
2. **Crawling**: Domains are crawled to extract content and metadata
3. **AI Analysis**: Content is analyzed by LLM to determine if it's gambling
4. **Scoring**: Multiple factors are combined into a confidence score
5. **Filtering**: False positives are filtered out
6. **Storage**: Valid domains are stored in KV/R2
7. **Publishing**: Blocklists are generated in multiple formats
8. **Scheduling**: Cloudflare Cron triggers updates every 6 hours

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) for details.

## Disclaimer

This project is for personal network protection only. It should not be used for:
- Crawling websites in violation of their terms of service
- Attacking or disrupting gambling websites
- Any illegal activities

The system respects robots.txt and implements rate limiting to avoid overloading servers.

## Support

For issues and feature requests, please create a GitHub issue.