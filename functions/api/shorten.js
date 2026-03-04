/**
 * POST /api/shorten
 * Stores compressed JSON data in KV and returns a short ID
 *
 * Request: { data: object, ttl?: number (days) }
 * Response: { id: string, expiresAt: number }
 */

import { gzip } from 'pako';

// Base62 characters for short IDs
const CHARS = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';

/**
 * Generate a random base62 ID of specified length
 */
function generateId(length = 6) {
  let result = '';
  const randomValues = new Uint8Array(length);
  crypto.getRandomValues(randomValues);
  for (let i = 0; i < length; i++) {
    result += CHARS[randomValues[i] % CHARS.length];
  }
  return result;
}

/**
 * Compress data using gzip and convert to base64
 */
function compressData(data) {
  const jsonString = JSON.stringify(data);
  const compressed = gzip(jsonString);
  // Convert Uint8Array to base64
  let binary = '';
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return btoa(binary);
}

export async function onRequestPost({ env, request }) {
  try {
    if (!env.MATCHUPS) {
      return new Response(JSON.stringify({ error: 'KV namespace MATCHUPS is not bound' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data, ttl = 30 } = await request.json();

    if (!data) {
      return new Response(JSON.stringify({ error: 'Missing "data" field' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Compress the data
    const compressed = compressData(data);

    // Generate unique ID
    let id = generateId(6);
    let attempts = 0;

    // Ensure ID is unique (collision check)
    while (await env.MATCHUPS.get(id)) {
      id = generateId(6);
      attempts++;
      if (attempts > 10) {
        // If we can't find unique ID after 10 tries, use 7 chars
        id = generateId(7);
      }
    }

    // Calculate expiration timestamp
    const expiresAt = Date.now() + ttl * 24 * 60 * 60 * 1000;

    // Store in KV with metadata
    const value = {
      data: compressed,
      expiresAt,
      createdAt: Date.now(),
      accessedAt: Date.now(),
    };

    // Set TTL in seconds (Cloudflare KV expects seconds)
    const expirationTtl = Math.max(60, ttl * 24 * 60 * 60);

    await env.MATCHUPS.put(id, JSON.stringify(value), {
      expirationTtl,
    });

    return new Response(JSON.stringify({ id, expiresAt }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    return new Response(JSON.stringify({ error: 'Failed to shorten URL', details: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
