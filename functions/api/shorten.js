/**
 * POST /api/shorten
 * Stores compressed JSON data in KV and returns a short ID
 *
 * Request: { data: object, ttl?: number (days) }
 * Response: { id: string, expiresAt: number }
 */

import * as pako from 'pako';

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
  const compressed = pako.gzip(jsonString);
  // Convert Uint8Array to base64
  let binary = '';
  for (let i = 0; i < compressed.length; i++) {
    binary += String.fromCharCode(compressed[i]);
  }
  return btoa(binary);
}

export async function onRequestPost({ env, request }) {
  try {
    const { data, ttl = 30 } = await request.json();

    if (!data) {
      return new Response(
        JSON.stringify({ error: 'Missing "data" field' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
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
    const expirationTtl = ttl * 24 * 60 * 60;

    try {
      await env.MATCHUPS.put(id, JSON.stringify(value), {
        expirationTtl,
      });
    } catch (kvError) {
      // Handle KV write errors (rate limits, storage limits, etc.)
      console.error('KV write error:', kvError);
      const errorMessage = kvError.message || String(kvError);
      if (errorMessage.includes('rate limit') || errorMessage.includes('too many requests')) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }),
          { status: 429, headers: { 'Content-Type': 'application/json' } }
        );
      } else if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
        return new Response(
          JSON.stringify({ error: 'Storage limit reached. Please try again later.' }),
          { status: 507, headers: { 'Content-Type': 'application/json' } }
        );
      }
      throw kvError; // Re-throw for generic error handling
    }

    return new Response(
      JSON.stringify({ id, expiresAt }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in /api/shorten:', error);
    // Check for specific error types
    const errorMessage = error.message || String(error);
    if (errorMessage.includes('rate limit')) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please try again in a minute.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      );
    } else if (errorMessage.includes('storage') || errorMessage.includes('quota')) {
      return new Response(
        JSON.stringify({ error: 'Storage limit reached. Please try again later.' }),
        { status: 507, headers: { 'Content-Type': 'application/json' } }
      );
    }
    return new Response(
      JSON.stringify({ error: 'Failed to shorten URL' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
