/**
 * GET /api/kv-list
 * List all keys in the KV namespace
 */

export async function onRequest({ env }) {
  try {
    const keys = [];
    let cursor = undefined;

    do {
      const response = await env.MATCHUPS.list({ cursor, limit: 1000 });
      keys.push(...response.keys);
      cursor = response.cursor;
    } while (cursor);

    return new Response(JSON.stringify({ keys: keys.map((k) => k.name) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error listing KV keys:', error);
    return new Response(JSON.stringify({ error: 'Failed to list KV keys' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
