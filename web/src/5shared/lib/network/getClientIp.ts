type HeaderSource = Headers | Record<string, string | string[] | undefined>;

function getHeader(source: HeaderSource, name: string): string | null {
  if (source instanceof Headers) return source.get(name);
  const value = source[name];
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

/**
 * Извлекает client IP из заголовков запроса.
 * Приоритет: x-forwarded-for (первый в списке) → x-real-ip → "unknown".
 * Принимает как Headers (Route Handler), так и plain object (NextAuth req.headers).
 */
export function getClientIp(headers: HeaderSource): string {
  const forwarded = getHeader(headers, "x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }

  const realIp = getHeader(headers, "x-real-ip");
  if (realIp) return realIp.trim();

  return "unknown";
}
