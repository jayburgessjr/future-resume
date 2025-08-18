export type QueryLike = Record<string, string | string[] | undefined>;

export function preserveQuery(current: URLSearchParams, next: QueryLike): URLSearchParams {
  const merged = new URLSearchParams(current);
  for (const [k, v] of Object.entries(next)) {
    if (v == null) continue;
    if (Array.isArray(v)) {
      merged.delete(k);
      v.forEach(val => merged.append(k, String(val)));
    } else {
      merged.set(k, String(v));
    }
  }
  return merged;
}

/**
 * Ensure autostart stays set unless explicitly disabled.
 * If the current URL has autostart, keep it; if not, default to "1".
 */
export function ensureAutostart(params: URLSearchParams, desired?: '0' | '1'): URLSearchParams {
  const out = new URLSearchParams(params.toString());
  const current = out.get('autostart');
  out.set('autostart', desired ?? current ?? '1');
  return out;
}
