# Contributing to Gambling Blocklist Worker

Thank you for your interest in contributing! Here's how you can help.

## How to Contribute

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/gambling-blocklist.git
cd gambling-blocklist
```

### 2. Create a Branch

```bash
git checkout -b feature/your-feature-name
```

### 3. Make Changes

- Add new gambling detection methods
- Improve validation logic
- Add new search engines
- Fix bugs
- Improve documentation

### 4. Test Your Changes

```bash
# Run tests
node test-worker.js

# Test locally
node dev.js

# Test deployment
npx wrangler deploy
```

### 5. Commit Changes

```bash
git add .
git commit -m "Add: Description of your changes"
```

### 6. Push to GitHub

```bash
git push origin feature/your-feature-name
```

### 7. Create Pull Request

- Go to your fork on GitHub
- Click "New pull request"
- Describe your changes
- Submit the pull request

## Development Guidelines

### Code Style

- Use consistent indentation (2 spaces)
- Write clear comments for complex logic
- Follow JavaScript best practices

### Testing

- Add tests for new features
- Ensure all tests pass before submitting
- Test edge cases

### Documentation

- Update README if adding new features
- Add JSDoc comments for new functions
- Update API documentation if needed

## Types of Contributions

### Bug Fixes
- Fix issues with site detection
- Improve validation accuracy
- Fix deployment issues

### Features
- Add new search engines
- Improve blocklist format
- Add new validation methods

### Documentation
- Improve setup guides
- Add examples
- Fix typos

### Performance
- Optimize search algorithms
- Reduce API calls
- Improve response times

## Reporting Issues

When reporting issues, please include:

1. **Description**: What's the problem?
2. **Steps to reproduce**: How can we reproduce the issue?
3. **Expected behavior**: What should happen?
4. **Actual behavior**: What actually happens?
5. **Environment**: Cloudflare Workers, Node.js version, etc.

## Code of Conduct

- Be respectful and inclusive
- Help others learn
- Focus on constructive feedback
- Welcome newcomers

## Questions?

If you have questions, feel free to open an issue or start a discussion.

Thank you for contributing! 🎉