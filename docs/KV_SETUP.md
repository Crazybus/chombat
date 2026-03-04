# URL Shortener for Chombat

This implementation adds Cloudflare KV-based URL shortening for sharing large matchup configurations.

## Features

- **Automatic Shortening**: URLs longer than 2000 characters are automatically shortened
- **Sliding TTL**: Matchups expire after 30 days of inactivity, but viewing extends the TTL
- **Compression**: Data is gzip-compressed before storage to save space
- **Grace Period**: TTL is extended when accessed within the last 7 days before expiration

## Setup

### 1. KV Namespace (Already Created)

The KV namespaces have been created:

- **Production**: `MATCHUPS` (id: `8248986926fd41b3aafb00e747f6ea71`)
- **Preview**: `MATCHUPS_preview` (id: `5367f69afe25491c9e0ae01d2c36eb01`)

### 2. Configuration

The `wrangler.toml` has been updated with the KV bindings:

```toml
[[kv_namespaces]]
binding = "MATCHUPS"
id = "8248986926fd41b3aafb00e747f6ea71"
preview_id = "5367f69afe25491c9e0ae01d2c36eb01"
```

### 3. Dependencies

`pako` (gzip compression) has been added to `package.json`.

## How It Works

### Sharing a Matchup

1. User clicks "Share Matchup" button
2. `syncURL()` checks if the URL would be > 2000 characters
3. If large, POSTs compressed JSON to `/api/shorten`
4. Receives a short 6-character ID (e.g., `abc123`)
5. Updates URL to `yoursite.com/#abc123`
6. Copies the short URL to clipboard

### Loading a Matchup

1. Page loads and checks for hash (`#abc123`)
2. If hash looks like a short ID, fetches from `/api/resolve/abc123`
3. Server retrieves from KV, extends TTL if needed, returns data
4. Client decompresses and applies the state
5. Shows toast notification with expiry info

### Sliding TTL Logic

- **Initial TTL**: 30 days
- **Grace Period**: 7 days
- When accessed within 7 days of expiration:
  - TTL is reset to 30 days from access time
- When accessed earlier:
  - Only `accessedAt` is updated (no TTL extension)

## API Endpoints

### POST /api/shorten

**Request:**

```json
{
  "data": { ... matchup state ... },
  "ttl": 30  // optional, days
}
```

**Response:**

```json
{
  "id": "abc123",
  "expiresAt": 1234567890000
}
```

### GET /api/resolve/:id

**Response (200 OK):**

```json
{
  "data": { ... matchup state ... },
  "expiresAt": 1234567890000,
  "extended": true
}
```

**Response (404 Not Found):**

```json
{
  "error": "Matchup not found or expired"
}
```

## Local Development

```bash
# Build the project
make build

# Run locally with Wrangler
make dev
# or
npx wrangler pages dev dist
```

The local dev server will use the `preview_id` KV namespace.

## Deployment

```bash
# Deploy to production
make deploy
```

## Cost Estimate (Free Tier)

- **100,000 reads/day** included
- **1,000 writes/day** included
- **1 GB storage** included

Assuming:

- 100 shares/day (writes)
- 500 views/day (reads)
- ~1 KB per matchup (compressed)

You should stay well within the free tier limits.

## Troubleshooting

### "Matchup not found or expired"

- The matchup has expired (30+ days without views)
- Re-share the matchup to create a new short URL

### "Failed to shorten URL"

- Check Cloudflare dashboard for KV quota
- Verify KV binding in `wrangler.toml`
- Check Wrangler logs for errors

### Long URLs still appearing

- The URL might be under 2000 characters (not worth shortening)
- Check browser console for API errors
