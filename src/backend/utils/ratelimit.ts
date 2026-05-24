const rateLimits = new Map<string, {
  count: number;
  resetAt: number;
}>();

export const checkRateLimit = (
  key: string,
  limit: number,
  windowMs: number,
): boolean => {
  const now = Date.now();
  const existing = rateLimits.get(key);
  if (!existing || now > existing.resetAt) {
    rateLimits.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }
  if (existing.count >= limit) return false;
  existing.count++;
  return true;
};
