// api/scores.js — Online leaderboard for Sleigh Catch
// GET  /api/scores        → { ok: true, top: [{ name, score }] }   (top 10)
// POST /api/scores        → { ok: true, rank, top }                (save a score)

const BLOCKED_WORDS = [];

const LEADERBOARD_KEY = 'leaderboard';

function getEnv() {
  const url   = process.env.KV_REST_API_URL   || process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
  return { url, token };
}

async function redisPipeline(url, token, commands) {
  const res = await fetch(`${url}/pipeline`, {
    method:  'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type':  'application/json',
    },
    body: JSON.stringify(commands),
  });
  if (!res.ok) throw new Error(`Redis error ${res.status}`);
  return res.json(); // array of { result } | { error }
}

function parseTop(zrangeResult) {
  // ZRANGE ... WITHSCORES returns [member, score, member, score, ...]
  // member format is "DisplayName:uid" — strip the uid suffix for display
  const flat = zrangeResult ?? [];
  const top  = [];
  for (let i = 0; i < flat.length; i += 2) {
    const member = String(flat[i]);
    // Find the last colon to split off the uid portion
    const sep  = member.lastIndexOf(':');
    const name = sep > 0 ? member.slice(0, sep) : member;
    top.push({ name, score: Number(flat[i + 1]) });
  }
  return top;
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type':  'application/json',
      'Cache-Control': 'no-store',
    },
  });
}

function validateName(raw) {
  if (typeof raw !== 'string') return null;
  const name = raw.trim().replace(/\s+/g, ' ');
  if (name.length < 1 || name.length > 12) return null;
  if (!/^[\p{L}\p{N} ._-]+$/u.test(name)) return null;
  const lower = name.toLowerCase();
  for (const word of BLOCKED_WORDS) {
    if (lower.includes(word.toLowerCase())) return null;
  }
  return name;
}

function validateUid(raw) {
  if (typeof raw !== 'string') return null;
  const uid = raw.trim();
  // Accept standard UUID v4 format or the 'anonymous' fallback
  if (uid === 'anonymous') return uid;
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(uid)) return null;
  return uid.toLowerCase();
}

export default {
  async fetch(request) {
    const { url, token } = getEnv();
    if (!url || !token) {
      return json({ ok: false, error: 'not configured' }, 503);
    }

    const method = request.method.toUpperCase();

    // ── GET /api/scores ────────────────────────────────────────────────────────
    if (method === 'GET') {
      const pipeline = await redisPipeline(url, token, [
        ['ZRANGE', LEADERBOARD_KEY, 0, 9, 'REV', 'WITHSCORES'],
      ]);
      const top = parseTop(pipeline[0]?.result ?? []);
      return json({ ok: true, top });
    }

    // ── POST /api/scores ───────────────────────────────────────────────────────
    if (method === 'POST') {
      // Rate limit: 1 POST per 10 s per IP
      const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim();
      const rlResult = await redisPipeline(url, token, [
        ['SET', `rl:${ip}`, '1', 'NX', 'EX', '10'],
      ]);
      if (rlResult[0]?.result === null) {
        return json({ ok: false, error: 'rate limited' }, 429);
      }

      let body;
      try {
        body = await request.json();
      } catch {
        return json({ ok: false, error: 'invalid json' }, 400);
      }

      const name = validateName(body.name);
      if (!name) {
        return json({ ok: false, error: 'invalid name' }, 400);
      }

      const uid = validateUid(body.uid);
      if (!uid) {
        return json({ ok: false, error: 'invalid uid' }, 400);
      }

      // The Redis member is "DisplayName:uid" — name shown to users, uid enforces uniqueness
      const member = `${name}:${uid}`;

      const score   = Number(body.score);
      const seconds = Number(body.seconds);

      if (!Number.isInteger(score) || score < 1 || score > 1_000_000) {
        return json({ ok: false, error: 'invalid score' }, 400);
      }
      if (!Number.isFinite(seconds) || seconds < 3 || seconds > 3600) {
        return json({ ok: false, error: 'invalid seconds' }, 400);
      }
      if (score > seconds * 60 + 50) {
        return json({ ok: false, error: 'score too high for time played' }, 400);
      }

      // Save best score and read back rank + top 10 in one pipeline
      const pipeline = await redisPipeline(url, token, [
        ['ZADD', LEADERBOARD_KEY, 'GT', score, member],
        ['ZREVRANK', LEADERBOARD_KEY, member],
        ['ZRANGE', LEADERBOARD_KEY, 0, 9, 'REV', 'WITHSCORES'],
      ]);
      const rank = (pipeline[1]?.result ?? 0) + 1;
      const top  = parseTop(pipeline[2]?.result ?? []);

      return json({ ok: true, rank, top });
    }

    return json({ ok: false, error: 'method not allowed' }, 405);
  },
};
