/**
 * GET /api/resolve/:id
 * Retrieves compressed JSON data from KV by short ID
 * Implements sliding TTL - extends expiration when accessed within grace period
 *
 * Response: { data: object, expiresAt: number, extended?: boolean }
 */

import { ungzip } from 'pako';

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
  const jsonString = ungzip(compressed, { to: 'string' });
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

    if (!env.MATCHUPS) {
      return new Response(
        JSON.stringify({ error: 'KV namespace MATCHUPS is not bound' }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch from KV
    const stored = await env.MATCHUPS.get(id);

    if (!stored) {
      return new Response(
        JSON.stringify({ error: 'Matchup not found or expired' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(stored);
    const { data: compressedData, expiresAt } = parsed;

    // Sliding TTL: extend if within grace period
    const now = Date.now();
    const gracePeriodStart = (expiresAt || 0) - GRACE_PERIOD * 24 * 60 * 60 * 1000;
    let extended = false;

    if (expiresAt && now >= gracePeriodStart) {
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
      // Just update accessedAt
      const updated = {
        ...parsed,
        accessedAt: now,
      };
      await env.MATCHUPS.put(id, JSON.stringify(updated));
    }

    // Decompress and return data
    const decompressed = decompressData(compressedData);

    return new Response(
      JSON.stringify({
        data: decompressed,
        expiresAt: extended ? (now + DEFAULT_TTL * 24 * 60 * 60 * 1000) : expiresAt,
        extended
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error in /api/resolve:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to resolve matchup', details: error.message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
