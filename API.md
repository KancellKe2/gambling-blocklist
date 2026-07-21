# API Documentation

## Endpoints

### GET /
**Description**: Worker information

**Response**:
```
Gambling Blocklist Worker
```

**Status**: 200 OK

---

### GET /blocklist
**Description**: Download gambling website blocklist

**Response**:
```
! Title: Gambling Websites Blocklist
! Description: Auto-generated gambling website blocklist for AdGuard
...
||casino.com^
||poker.com^
...
```

**Content-Type**: text/plain

**Status**: 200 OK

---

### GET /status
**Description**: Get scan status and statistics

**Response**:
```json
{
  "lastScan": "2024-01-01T00:00:00.000Z",
  "totalDiscovered": 100,
  "totalValidated": 50,
  "sites": [
    "casino.com",
    "poker.com",
    "slot.com"
  ]
}
```

**Content-Type**: application/json

**Status**: 200 OK

---

### GET /scan
**Description**: Trigger manual scan

**Response**:
```
Scan completed
```

**Status**: 200 OK

**Note**: This endpoint triggers a new scan and may take some time to complete.

---

## Response Codes

| Code | Description |
|------|-------------|
| 200  | Success     |
| 500  | Internal Server Error |

## Rate Limiting

- No rate limiting for GET requests
- POST requests are not supported

## Authentication

No authentication required. The worker is publicly accessible.

## Examples

### Using cURL

```bash
# Get blocklist
curl https://your-worker.workers.dev/blocklist

# Get status
curl https://your-worker.workers.dev/status

# Trigger scan
curl https://your-worker.workers.dev/scan

# Download blocklist to file
curl -o gambling-blocklist.txt https://your-worker.workers.dev/blocklist
```

### Using JavaScript

```javascript
// Fetch blocklist
const response = await fetch('https://your-worker.workers.dev/blocklist');
const blocklist = await response.text();
console.log(blocklist);

// Fetch status
const statusResponse = await fetch('https://your-worker.workers.dev/status');
const status = await statusResponse.json();
console.log(status);

// Trigger scan
const scanResponse = await fetch('https://your-worker.workers.dev/scan');
const result = await scanResponse.text();
console.log(result);
```

### Using Python

```python
import requests

# Fetch blocklist
response = requests.get('https://your-worker.workers.dev/blocklist')
print(response.text)

# Fetch status
response = requests.get('https://your-worker.workers.dev/status')
print(response.json())

# Trigger scan
response = requests.get('https://your-worker.workers.dev/scan')
print(response.text)
```

## Webhook Integration

You can set up a webhook to automatically trigger scans:

```bash
# Using cron job
0 0 * * * curl -s https://your-worker.workers.dev/scan

# Or using a CI/CD pipeline
curl -X GET https://your-worker.workers.dev/scan
```

## Error Handling

### Worker Errors
```json
{
  "error": "Internal Server Error",
  "message": "An error occurred while processing the request"
}
```

### Network Errors
```json
{
  "error": "Network Error",
  "message": "Unable to connect to the worker"
}
```

## Monitoring

### Cloudflare Analytics
- Access analytics in Cloudflare Dashboard > Workers > gambling-blocklist-worker > Analytics

### Custom Metrics
- Use the `/status` endpoint to monitor scan statistics
- Set up alerts based on `totalValidated` count

## Security Considerations

- The worker is publicly accessible
- No sensitive data is stored in KV
- All external API calls use HTTPS
- Rate limiting is handled by Cloudflare

## Performance

- Worker execution time: < 30 seconds for most scans
- KV operations: < 100ms
- External API calls: Dependent on search engine response times

## Changelog

### v1.0.0
- Initial release
- Basic gambling site detection
- AdGuard-compatible blocklist generation
- Scheduled scans