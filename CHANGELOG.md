# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2024-08-21

### Added
- **Discovery Module**: Implemented actual discovery logic for all sources
  - Public blocklists (StevenBlack, notracking, Adguard)
  - GitHub repository discovery
  - Search engine discovery (DuckDuckGo Lite)
  - Common Crawl index discovery
  - Threat feeds discovery
- **False Positive Filtering**: Comprehensive filtering system
  - Domain-based false positive detection
  - Content-based false positive detection
  - URL-based false positive detection
  - Configurable filter patterns
- **Deployment Scripts**: Complete deployment automation
  - `deploy.sh` for Cloudflare Workers deployment
  - `update-blocklist.sh` for manual updates
  - `setup.sh` for initial environment setup
- **Configuration Examples**: Comprehensive configuration documentation
  - `config.example.ts` with all configuration options
  - `wrangler.example.jsonc` for Cloudflare Workers deployment
  - `examples/README.md` with usage instructions
- **Documentation**: Enhanced README with comprehensive guides
  - Step-by-step deployment guide
  - Environment variables reference
  - AdGuard Home usage instructions
  - Troubleshooting section
  - Common issues and solutions
- **CI/CD Pipeline**: GitHub Actions workflow
  - Automated testing on multiple Node.js versions
  - Linting and build verification
  - Preview deployment for pull requests
  - Production deployment for master branch

### Fixed
- **CronModule**: Fixed KV namespace binding access
  - Added proper type imports for KVNamespace and R2Bucket
  - Fixed CronEnv interface to use proper types
- **Validator Module**: Added false positive filter integration
  - Integrated FalsePositiveFilter into Validator
  - Added configurable filter patterns
- **Discovery Module**: Fixed retry function signature
  - Updated to use correct RetryConfig object format
  - Added rateLimit utility function

### Changed
- Updated branch names in CI/CD workflow to master/main
- Simplified workflow structure for better maintainability
- Added proper job names in GitHub Actions

## [1.0.0] - 2024-08-20

### Added
- Initial release of gambling blocklist system
- Core modules: Discovery, Crawler, Validator, AI, Score, Storage, Publisher
- Cloudflare Workers deployment
- KV storage for blocklist data
- R2 bucket for extended storage (optional)
- Cron triggers for scheduled updates
- Multiple output formats (AdGuard, hosts, dnsmasq, plain, ABP)
- TypeScript implementation with comprehensive type definitions
- ESLint and Prettier configuration
- Vitest testing framework
- GitHub Actions CI/CD pipeline

### Fixed
- Initial bug fixes and stability improvements

## [0.9.0] - 2024-08-19

### Added
- Beta release for testing
- Basic discovery from public blocklists
- Simple crawling with retry logic
- Keyword-based gambling detection
- Basic confidence scoring
- KV storage implementation
- Multiple output format generation
- Cron job scheduling

## [0.8.0] - 2024-08-18

### Added
- Alpha release
- Project structure and configuration
- Type definitions
- Utility functions
- Basic module stubs

## [0.7.0] - 2024-08-17

### Added
- Initial project setup
- Package.json configuration
- TypeScript configuration
- ESLint configuration
- Prettier configuration
- Git repository initialization