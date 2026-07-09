import { RateLimiterRedis } from "rate-limiter-flexible";

import { redis } from "@/5shared/api/redis";
import type { RateLimitConfig } from "./config";

/** Кэш лимитеров по конфигу — не создаём новый на каждый запрос */
const limiters = new Map<string, RateLimiterRedis>();

function getLimiter(config: RateLimitConfig): RateLimiterRedis | null {
  if (!redis) return null;

  const cacheKey = `${config.points}:${config.duration}`;
  let limiter = limiters.get(cacheKey);
  if (!limiter) {
    limiter = new RateLimiterRedis({
      storeClient: redis,
      points: config.points,
      duration: config.duration,
      execEvenly: false, // Token Bucket: попытки расходуются сразу
    });
    limiters.set(cacheKey, limiter);
  }
  return limiter;
}

/**
 * Проверяет и расходует одну попытку по ключу.
 * @returns true — разрешено, false — лимит превышен.
 * Если Redis недоступен — fail-open (разрешаем, логируем ошибку).
 */
export async function checkRateLimit(key: string, config: RateLimitConfig): Promise<boolean> {
  const limiter = getLimiter(config);
  if (!limiter) return true; // REDIS_URL не задан (dev)

  try {
    await limiter.consume(key, 1);
    return true;
  } catch (err) {
    // RateLimiterRes = лимит превышен; иначе — ошибка соединения с Redis
    if (err && typeof err === "object" && "remainingPoints" in err) {
      return false;
    }
    console.error("[rateLimit] Redis error, failing open:", err);
    return true;
  }
}
