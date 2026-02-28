/**
 * GET /api/resolve/:id
 * Retrieves compressed JSON data from KV by short ID
 * Implements sliding TTL - extends expiration when accessed within grace period
 *
 * Response: { data: object, expiresAt: number, extended?: boolean }
 */

import * as pako from 'pako';

// TTL settings (in days)
const DEFAULT_TTL = 30;
const GRACE_PERIOD = 7; // Extend TTL if accessed within last 7 days before expiration

/**
 * Decompress base64 gzip data
 */
function decompressData(compressedBase64) {
  // Convert base64 to Uint8Array
  const binary = atob(compressedBase64);
  const compressed = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    compressed[i] = binary.charCodeAt(i);
  }
  // Decompress
  const jsonString = pako.ungzip(compressed, { to: 'string' });
  return JSON.parse(jsonString);
}

export async function onRequest({ env, params }) {
  try {
    const { id } = params;

    if (!id) {
      return new Response(
        JSON.stringify({ error: 'Missing ID parameter' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from KV
    let stored;
    try {
      stored = await env.MATCHUPS.get(id);
    } catch (kvError) {
      // Handle KV read errors (rate limits, etc.)
      console.error('KV read error:', kvError);
      return new Response(
        JSON.stringify({ error: 'Service temporarily unavailable. Please try again.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!stored) {
      return new Response(
        JSON.stringify({ error: 'Matchup not found or expired' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(stored);
    const { data: compressedData, expiresAt } = parsed;

    // Check if expired (shouldn't happen due to KV TTL, but safety check)
    if (expiresAt && Date.now() > expiresAt) {
      // Clean up expired entry
      await env.MATCHUPS.delete(id);
      return new Response(
        JSON.stringify({ error: 'Matchup has expired' }),
        { status: 410, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Sliding TTL: extend if within grace period
    const now = Date.now();
    const gracePeriodStart = expiresAt - GRACE_PERIOD * 24 * 60 * 60 * 1000;
    let extended = false;

    if (now >= gracePeriodStart) {
      // Extend TTL
      const newExpiresAt = now + DEFAULT_TTL * 24 * 60 * 60 * 1000;
      const expirationTtl = DEFAULT_TTL * 24 * 60 * 60;

      const updated = {
        ...parsed,
        expiresAt: newExpiresAt,
        accessedAt: now,
      };

      await env.MATCHUPS.put(id, JSON.stringify(updated), {
        expirationTtl,
      });

      extended = true;
    } else {
      // Just update accessedAt without extending TTL
      const updated = {
        ...parsed,
        accessedAt: now,
      };
      // Don't set expirationTtl to keep existing expiration
      await env.MATCHUPS.put(id, JSON.stringify(updated));
    }

    // Decompress and return data
    const decompressed = decompressData(compressedData);

    return new Response(
      JSON.stringify({
        data: decompressed,
        expiresAt,
        extended,
        newExpiresAt: extended ? undefined : expiresAt,
      }),
      { 
        status: 200, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error in /api/resolve:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to resolve matchup' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
