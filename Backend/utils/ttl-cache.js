/**
 * Minimal in-memory TTL cache for single-process Node deployments.
 * Not for data that must be instantly consistent across instances —
 * intended for expensive, infrequently-changing aggregations (dashboard
 * counters, daily rollups) where a short staleness window is acceptable.
 */
const store = new Map();

function getOrSet(key, ttlMs, computeFn) {
  const cached = store.get(key);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.valuePromise;
  }

  const valuePromise = Promise.resolve().then(computeFn).catch((err) => {
    store.delete(key); // don't cache rejected promises
    throw err;
  });

  store.set(key, { valuePromise, expiresAt: Date.now() + ttlMs });
  return valuePromise;
}

function invalidate(key) {
  store.delete(key);
}

module.exports = { getOrSet, invalidate };
