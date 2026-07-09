import Redis from "ioredis";

/**
 * Singleton Redis клиент для rate limiting.
 * Переиспользуем одно подключение между hot-reload'ами (как prisma.ts).
 * Возвращает null если REDIS_URL не задан (dev без Redis — rate limiting отключен).
 */
const globalForRedis = globalThis as unknown as { redis?: Redis | null };

function createClient(): Redis | null {
  const url = process.env.REDIS_URL;
  if (!url) {
    if (process.env.NODE_ENV === "production") {
      console.error("[redis] REDIS_URL is not set — rate limiting is DISABLED");
    }
    return null;
  }

  return new Redis(url, {
    maxRetriesPerRequest: 2,
    enableOfflineQueue: false,
    lazyConnect: true,
  });
}

export const redis: Redis | null = globalForRedis.redis ?? createClient();

if (process.env.NODE_ENV !== "production") {
  globalForRedis.redis = redis;
}
