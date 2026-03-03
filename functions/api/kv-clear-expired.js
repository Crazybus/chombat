/**
 * POST /api/kv-clear-expired
 * Clear all expired keys from the KV namespace
 */

export async function onRequestPost({ env }) {
  try {
    const now = Date.now();
    let deleted = 0;
    let cursor = undefined;

    do {
      const response = await env.MATCHUPS.list({ cursor, limit: 1000 });

      for (const key of response.keys) {
        try {
          const value = await env.MATCHUPS.get(key.name);
          if (value) {
            const data = JSON.parse(value);
            if (data.expiresAt && data.expiresAt < now) {
              await env.MATCHUPS.delete(key.name);
              deleted++;
            }
          }
        } catch (e) {
          console.error(`Error processing key ${key.name}:`, e);
        }
      }

      cursor = response.cursor;
    } while (cursor);

    return new Response(JSON.stringify({ deleted }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error clearing expired keys:', error);
    return new Response(JSON.stringify({ error: 'Failed to clear expired keys' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
