export function formatBytes(bytes: number): string {
  if (!bytes) return "0 ГБ";
  const gb = bytes / 1024 ** 3;
  if (gb >= 1) return `${gb.toFixed(1)} ГБ`;
  return `${(bytes / 1024 ** 2).toFixed(0)} МБ`;
}

export function isRecentlyOnline(iso: string | null | undefined, withinMinutes = 5): boolean {
  if (!iso) return false;
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return false;
  return Date.now() - ts < withinMinutes * 60_000;
}
