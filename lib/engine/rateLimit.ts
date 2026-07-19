export async function checkRateLimit(
  kv: any,
  key: string,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  if (!kv) return { allowed: true, remaining: maxRequests };

  const fullKey = `ratelimit:${key}`;
  try {
    const raw = await kv.get(fullKey);
    const count = raw ? parseInt(raw, 10) : 0;

    if (count >= maxRequests) {
      return { allowed: false, remaining: 0 };
    }

    await kv.put(fullKey, String(count + 1), { expirationTtl: windowSeconds });
    return { allowed: true, remaining: maxRequests - count - 1 };
  } catch {
    return { allowed: true, remaining: maxRequests };
  }
}
